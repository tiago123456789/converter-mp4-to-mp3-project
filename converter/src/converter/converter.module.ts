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
  providers: [GridFsMulterConfigService, ConverterService, ConverterConsumer],
  exports: [],
})
export class ConverterModule {}
