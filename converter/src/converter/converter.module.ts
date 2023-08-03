import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { GridFsMulterConfigService } from './gridfs-multer-config.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConverterController } from './converter.controller';
import { ConverterService } from './converter.service';
import { ConverterConsumer } from './converter.consumer';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Mp3ConverterSchema } from './mp3-converter.schema';
import { MP3_CONVERTER_SCHEMA } from 'src/common/constants/mongoose';

@Module({
  imports: [
    MulterModule.registerAsync({
      useClass: GridFsMulterConfigService,
    }),
    MongooseModule.forFeature([
      { name: MP3_CONVERTER_SCHEMA, schema: Mp3ConverterSchema },
    ]),
    BullModule.forRootAsync({
      useFactory(config: ConfigService) {
        return {
          redis: {
            host: config.get('REDIS_HOST'),
            port: config.get('REDIS_PORT'),
          },
          defaultJobOptions: {
            removeOnComplete: true,
            attempts: 3,
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      {
        name: 'convert_mp4_to_mp3',
      },
      {
        name: 'convertion_complete',
      },
    ),
  ],
  controllers: [ConverterController],
  providers: [GridFsMulterConfigService, ConverterService, ConverterConsumer],
  exports: [],
})
export class ConverterModule {}
