import { InjectQueue } from '@nestjs/bull';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Queue } from 'bull';
import { MongoGridFS } from 'mongo-gridfs';
import { Connection } from 'mongoose';
import { GridFSBucketReadStream } from 'mongodb';
import { FileInfoDto } from './file-info.dto';

@Injectable()
export class AppService {
  private fileModel: MongoGridFS;

  constructor(
    @InjectQueue(process.env.QUEUE_CONVERT_MP4_TO_MP3)
    private convertMp4ToMp3Queue: Queue,
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

  convertMp4ToMp3(file) {
    return this.convertMp4ToMp3Queue.add(file);
  }
}
