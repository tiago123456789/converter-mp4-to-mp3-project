import { HttpException, Inject, Injectable } from '@nestjs/common';
import { IGridFSObject } from 'mongo-gridfs';
import { GridFSBucketReadStream } from 'mongodb';
import { FileInfoDto } from './file-info.dto';
import * as path from 'path';
import * as fs from 'fs';
import * as converter from 'video-converter';
import { NewFileConverterMessage } from './../common/queue/messages/new-file-converter.message';
import { ConvertionSuccessMessage } from './../common/queue/messages/convertion-success.message';
import { Mp3ConverterDocument } from './mp3-converter.schema';
import { Mp3ConverterDto } from './mp3-converted.dto';
import {
  CONVERTION_SUCCESS_QUEUE_PUBLISHER_ADAPTER,
  FILE_REPOSITORY_PROVIDER,
  LOGGER_PROVIDER,
  MP3_CONVERTER_REPOSITORY_PROVIDER,
  NEW_FILE_CONVERTER_QUEUE_PUBLISHER_PROVIDER,
  TRACKER_ID_PROVIDER,
} from './../common/constants/provider';
import { TrackerIdInterface } from './../common/adapters/tracker-id.interface';
import { QueuePublisher } from './../common/adapters/queue/queue-publisher';
import { FileRepositoryInterface } from './repositories/file-repository.interface';
import { Mp3ConvertedRepositoryInterface } from './repositories/mp3-converted-repository.interface';

@Injectable()
export class ConverterService {
  constructor(
    @Inject(NEW_FILE_CONVERTER_QUEUE_PUBLISHER_PROVIDER)
    private readonly convertMp4ToMp3Queue: QueuePublisher<NewFileConverterMessage>,
    @Inject(CONVERTION_SUCCESS_QUEUE_PUBLISHER_ADAPTER)
    private readonly convertionCompleteQueue: QueuePublisher<ConvertionSuccessMessage>,
    @Inject(FILE_REPOSITORY_PROVIDER)
    private readonly fileRepository: FileRepositoryInterface,
    @Inject(MP3_CONVERTER_REPOSITORY_PROVIDER)
    private readonly mp3ConverterModel: Mp3ConvertedRepositoryInterface,
    @Inject(TRACKER_ID_PROVIDER) private readonly tracker: TrackerIdInterface,
    @Inject(LOGGER_PROVIDER) private readonly logger: LoggerInterface,
  ) {}

  async readStream(id: string): Promise<GridFSBucketReadStream> {
    return await this.fileRepository.readStream(id);
  }

  async findInfo(id: string): Promise<FileInfoDto> {
    const result: IGridFSObject = await this.fileRepository.findById(id);

    if (!result) {
      throw new HttpException('File not found', 404);
    }

    return {
      filename: result.filename,
      length: result.length,
      chunkSize: result.chunkSize,
      md5: result.md5,
      contentType: result.contentType,
    };
  }

  save(file: NewFileConverterMessage) {
    file.trackId = this.tracker.id();
    return this.convertMp4ToMp3Queue.publish(file);
  }

  async getMp3ConvertedByUserId(userId: number): Promise<Mp3ConverterDto[]> {
    const registers: Mp3ConverterDocument[] =
      await this.mp3ConverterModel.findByUserId(userId.toString());

    return registers.map((item: Mp3ConverterDocument) => {
      const mp3ConvertedDto = new Mp3ConverterDto();
      mp3ConvertedDto.userId = userId;
      mp3ConvertedDto.link = `${process.env.LINK_FILE}${item.fileId}`;
      mp3ConvertedDto.createdAt = item.createdAt;
      return mp3ConvertedDto;
    });
  }

  async removeMp3ConvertedAfter30Days() {
    const trackId = this.tracker.id();
    try {
      this.logger.info(
        `Starting process to delete all mp3 files converted after 30 days`,
        {
          trackId: trackId,
        },
      );
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      this.logger.info(`Deleting mp3 files converted after 30 days`, {
        trackId: trackId,
      });
      await this.mp3ConverterModel.deleteManyLessThanDate(date);
      this.logger.info(`Deleted mp3 files converted after 30 days`, {
        trackId: trackId,
      });

      this.logger.info(
        `Finished process to delete all mp3 files converted after 30 days`,
        {
          trackId: trackId,
        },
      );
    } catch (error) {
      this.logger.error(error, {
        trackId: trackId,
      });
    }
  }

  async convertMp4ToMp3(message: NewFileConverterMessage) {
    try {
      await new Promise(async (resolve, reject) => {
        try {
          this.logger.info(`Checking if exists file ${message.id}`, {
            trackId: message.trackId,
          });
          this.logger.info(`Getting file ${message.id}`, {
            trackId: message.trackId,
          });
          const [file, bufferStream] = await Promise.all([
            this.findInfo(message.id),
            this.readStream(message.id),
          ]);
          const extension = `${file.contentType.split('/')[1]}`;
          const pathFileToProcess = path.join(
            __dirname,
            '..',
            '..',
            'files-processing',
            `${message.id}.${extension}`,
          );
          if (extension != 'mp4') {
            throw new Error(
              `Error caused by: try convert ${message.id}.${extension} file but you only can convert mp4`,
            );
          }

          this.logger.info(`Writing file ${pathFileToProcess} in disk`, {
            trackId: message.trackId,
          });
          const writeStream = fs.createWriteStream(pathFileToProcess);
          bufferStream.pipe(writeStream);

          writeStream.on('error', async (error) => {
            reject(error);
          });

          writeStream.on('finish', async () => {
            this.logger.info(`Wrote file ${pathFileToProcess} in disk`, {
              trackId: message.trackId,
            });
            const pathOutputMp3 = path.join(
              __dirname,
              '..',
              '..',
              'files-processing',
              `${message.id}.mp3`,
            );

            this.logger.info(
              `Converting file ${pathFileToProcess} to ${pathOutputMp3}`,
              {
                trackId: message.trackId,
              },
            );
            await new Promise((resolve, reject) => {
              converter.convert(
                pathFileToProcess,
                pathOutputMp3,
                function (err) {
                  if (err) return reject(err);
                  resolve('done');
                },
              );
            });
            this.logger.info(`Complete convertion ${pathOutputMp3} file`, {
              trackId: message.trackId,
            });
            this.logger.info(`Saving ${pathOutputMp3} file in mongodb`, {
              trackId: message.trackId,
            });
            const readMp3Stream = fs.createReadStream(pathOutputMp3);
            const options = {
              filename: `${message.id}.mp3`,
              contentType: 'audio/mp3',
            };
            const mp3Created = await this.fileRepository.writeFileStream(
              readMp3Stream,
              options,
            );
            await this.mp3ConverterModel.insertMany([
              {
                userId: message.user.id.toString(),
                fileId: mp3Created._id,
                createdAt: new Date(),
              },
            ]);
            this.logger.info(`Saved ${pathOutputMp3} file in mongodb`, {
              trackId: message.trackId,
            });
            this.logger.info(
              `Completed process to convert ${pathFileToProcess} to ${pathOutputMp3}`,
              {
                trackId: message.trackId,
              },
            );
            this.logger.info(
              `Sending notification about converstion completed to queue`,
              {
                trackId: message.trackId,
              },
            );
            await this.convertionCompleteQueue.publish({
              id: mp3Created._id,
              emailToNotify: message.user.email,
              link: `${process.env.LINK_FILE}${mp3Created._id}`,
              trackId: message.trackId,
            });
            this.logger.info(
              `Sended notification about converstion completed to queue`,
              {
                trackId: message.trackId,
              },
            );
            fs.rmSync(pathFileToProcess);
            fs.rmSync(pathOutputMp3);
            resolve(null);
          });
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      this.logger.error(error, {
        trackId: message.trackId,
      });
      throw error;
    }
  }
}
