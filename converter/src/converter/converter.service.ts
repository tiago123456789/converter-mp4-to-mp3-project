import { InjectQueue } from '@nestjs/bull';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Queue } from 'bull';
import { MongoGridFS } from 'mongo-gridfs';
import { Connection } from 'mongoose';
import { GridFSBucketReadStream } from 'mongodb';
import { FileInfoDto } from './file-info.dto';
import * as path from 'path';
import * as fs from 'fs';
import * as converter from 'video-converter';
import { NewFileConverterMessage } from 'src/common/queue/messages/new-file-converter.message';
import { ConvertionSuccessMessage } from 'src/common/queue/messages/convertion-success.message';
import { IUser } from 'src/common/types/irequest-with-user';

@Injectable()
export class ConverterService {
  private fileModel: MongoGridFS;

  constructor(
    @InjectQueue('convert_mp4_to_mp3')
    private readonly convertMp4ToMp3Queue: Queue<NewFileConverterMessage>,
    @InjectQueue('convertion_complete')
    private readonly convertionCompleteQueue: Queue<ConvertionSuccessMessage>,
    @InjectConnection() private readonly connection: Connection,
  ) {
    // @ts-ignore
    this.fileModel = new MongoGridFS(this.connection.db, 'fs');
  }

  async readStream(id: string): Promise<GridFSBucketReadStream> {
    return await this.fileModel.readFileStream(id);
  }

  async findInfo(id: string): Promise<FileInfoDto> {
    const result = await this.fileModel.findById(id);

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
    return this.convertMp4ToMp3Queue.add(file);
  }

  async convertMp4ToMp3(message: NewFileConverterMessage) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(`Checking if exists file ${message.id}`);
        console.log(`Getting file ${message.id}`);
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

        console.log(`Writing file ${pathFileToProcess} in disk`);
        const writeStream = fs.createWriteStream(pathFileToProcess);
        bufferStream.pipe(writeStream);

        writeStream.on('error', async (error) => {
          reject(error);
        });

        writeStream.on('finish', async () => {
          console.log(`Wrote file ${pathFileToProcess} in disk`);
          const pathOutputMp3 = path.join(
            __dirname,
            '..',
            '..',
            'files-processing',
            `${message.id}.mp3`,
          );

          console.log(
            `Converting file ${pathFileToProcess} to ${pathOutputMp3}`,
          );
          await new Promise((resolve, reject) => {
            converter.convert(pathFileToProcess, pathOutputMp3, function (err) {
              if (err) return reject(err);
              resolve('done');
            });
          });
          console.log(`Complete convertion ${pathOutputMp3} file`);
          console.log(`Saving ${pathOutputMp3} file in mongodb`);
          const readMp3Stream = fs.createReadStream(pathOutputMp3);
          const options = {
            filename: `${message.id}.mp3`,
            contentType: 'audio/mp3',
          };
          const mp3Created = await this.fileModel.writeFileStream(
            readMp3Stream,
            options,
          );
          console.log(`Saved ${pathOutputMp3} file in mongodb`);
          console.log(
            `Completed process to convert ${pathFileToProcess} to ${pathOutputMp3}`,
          );
          console.log(
            `Sending notification about converstion completed to queue`,
          );
          await this.convertionCompleteQueue.add({
            id: mp3Created._id,
            emailToNotify: message.user.email,
            link: `${process.env.LINK_FILE}${mp3Created._id}`,
          });
          console.log(
            `Sended notification about converstion completed to queue`,
          );
          fs.rmSync(pathFileToProcess);
          fs.rmSync(pathOutputMp3);
          resolve(null);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
