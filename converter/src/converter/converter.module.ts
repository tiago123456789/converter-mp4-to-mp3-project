import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { GridFsMulterConfigService } from './gridfs-multer-config.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConverterController } from './converter.controller';
import { ConverterService } from './converter.service';
import { ConverterConsumer } from './converter.consumer';
import { MongooseModule } from '@nestjs/mongoose';
import { Mp3ConverterSchema } from './mp3-converter.schema';
import { MP3_CONVERTER_SCHEMA } from 'src/common/constants/mongoose';
import { CommonModule } from 'src/common/common.module';
import { ConverterSchedule } from './converter.scheduler';
import {
  FILE_REPOSITORY_PROVIDER,
  MP3_CONVERTER_REPOSITORY_PROVIDER,
} from 'src/common/constants/provider';
import { FileRepository } from './repositories/file.repository';
import { Mp3ConvertedRepository } from './repositories/mp3-converted.repository';

@Module({
  imports: [
    MulterModule.registerAsync({
      useClass: GridFsMulterConfigService,
    }),
    MongooseModule.forFeature([
      { name: MP3_CONVERTER_SCHEMA, schema: Mp3ConverterSchema },
    ]),
    CommonModule,
  ],
  controllers: [ConverterController],
  providers: [
    GridFsMulterConfigService,
    ConverterService,
    ConverterConsumer,
    ConverterSchedule,
    {
      provide: FILE_REPOSITORY_PROVIDER,
      useClass: FileRepository,
    },
    {
      provide: MP3_CONVERTER_REPOSITORY_PROVIDER,
      useClass: Mp3ConvertedRepository,
    },
  ],
  exports: [],
})
export class ConverterModule {}
