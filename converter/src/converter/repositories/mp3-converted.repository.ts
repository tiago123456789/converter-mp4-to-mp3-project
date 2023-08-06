import { Injectable } from '@nestjs/common';
import { Mp3ConvertedRepositoryInterface } from './mp3-converted-repository.interface';
import { Mp3Converter, Mp3ConverterDocument } from '../mp3-converter.schema';
import { MP3_CONVERTER_SCHEMA } from 'src/common/constants/mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class Mp3ConvertedRepository implements Mp3ConvertedRepositoryInterface {
  constructor(
    @InjectModel(MP3_CONVERTER_SCHEMA)
    private readonly mp3ConverterModel: Model<Mp3Converter>,
  ) {}

  findByUserId(userId: string): Promise<Mp3ConverterDocument[]> {
    return this.mp3ConverterModel
      .find({
        userId,
      })
      .exec();
  }

  async deleteManyLessThanDate(date: Date): Promise<void> {
    await this.mp3ConverterModel.deleteMany({
      createdAt: {
        $lt: date.toISOString(),
      },
    });
  }

  async insertMany(data: Mp3Converter[]): Promise<void> {
    await this.mp3ConverterModel.insertMany(data);
  }
}
