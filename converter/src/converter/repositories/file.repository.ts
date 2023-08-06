import { IGridFSObject, IGridFSWriteOption, MongoGridFS } from 'mongo-gridfs';
import { GridFSBucketReadStream, Stream } from 'mongodb';
import { FileRepositoryInterface } from './file-repository.interface';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { ReadStream } from 'fs';

@Injectable()
export class FileRepository implements FileRepositoryInterface {
  private fileModel: MongoGridFS;

  constructor(@InjectConnection() private readonly connection: Connection) {
    // @ts-ignore
    this.fileModel = new MongoGridFS(this.connection.db, 'fs');
  }

  async readStream(id: string): Promise<GridFSBucketReadStream> {
    return await this.fileModel.readFileStream(id);
  }

  async findById(id: string): Promise<IGridFSObject> {
    const results = await this.fileModel.find({
      _id: new Types.ObjectId(id),
    });

    return results[0] || null;
  }

  async writeFileStream(
    stream: ReadStream,
    options: IGridFSWriteOption,
  ): Promise<IGridFSObject> {
    return this.fileModel.writeFileStream(stream, options);
  }
}
