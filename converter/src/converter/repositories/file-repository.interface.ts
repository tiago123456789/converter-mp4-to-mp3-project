import { ReadStream } from 'fs';
import { IGridFSObject, IGridFSWriteOption } from 'mongo-gridfs';
import { GridFSBucketReadStream } from 'mongodb';

export interface FileRepositoryInterface {
  readStream(id: string): Promise<GridFSBucketReadStream>;
  findById(id: string): Promise<IGridFSObject>;
  writeFileStream(
    stream: ReadStream,
    options: IGridFSWriteOption,
  ): Promise<IGridFSObject>;
}
