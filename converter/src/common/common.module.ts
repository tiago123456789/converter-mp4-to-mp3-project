import { Module } from '@nestjs/common';
import {
  CONVERTION_SUCCESS_QUEUE_PUBLISHER_ADAPTER,
  LOGGER_PROVIDER,
  NEW_FILE_CONVERTER_QUEUE_PUBLISHER_PROVIDER,
  TRACKER_ID_PROVIDER,
} from './constants/provider';
import { TrackerAdapters } from './adapters/tracker.adapters';
import { WinstonAdapter } from './adapters/winston.adapater';
import { NewFileConverterQueuePublisherAdapter } from './adapters/queue/new-file-converter-queue-publisher.adapter';
import { ConvertionSuccessQueuePublisherAdapter } from './adapters/queue/convertion-success-queue-publisher.adapter';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
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
  providers: [
    {
      provide: TRACKER_ID_PROVIDER,
      useClass: TrackerAdapters,
    },
    {
      provide: LOGGER_PROVIDER,
      useClass: WinstonAdapter,
    },
    {
      provide: NEW_FILE_CONVERTER_QUEUE_PUBLISHER_PROVIDER,
      useClass: NewFileConverterQueuePublisherAdapter,
    },
    {
      provide: CONVERTION_SUCCESS_QUEUE_PUBLISHER_ADAPTER,
      useClass: ConvertionSuccessQueuePublisherAdapter,
    },
  ],
  exports: [
    {
      provide: TRACKER_ID_PROVIDER,
      useClass: TrackerAdapters,
    },
    {
      provide: LOGGER_PROVIDER,
      useClass: WinstonAdapter,
    },
    {
      provide: NEW_FILE_CONVERTER_QUEUE_PUBLISHER_PROVIDER,
      useClass: NewFileConverterQueuePublisherAdapter,
    },
    {
      provide: CONVERTION_SUCCESS_QUEUE_PUBLISHER_ADAPTER,
      useClass: ConvertionSuccessQueuePublisherAdapter,
    },
  ],
})
export class CommonModule {}
