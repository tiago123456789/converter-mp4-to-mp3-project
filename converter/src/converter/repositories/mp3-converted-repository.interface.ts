import { Mp3Converter, Mp3ConverterDocument } from '../mp3-converter.schema';

export interface Mp3ConvertedRepositoryInterface {
  findByUserId(userId: string): Promise<Mp3ConverterDocument[]>;

  deleteManyLessThanDate(date: Date): Promise<void>;

  insertMany(data: Mp3Converter[]): Promise<void>;
}
