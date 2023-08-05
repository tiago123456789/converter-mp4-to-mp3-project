import { Module } from '@nestjs/common';
import { ConverterModule } from './converter/converter.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as WinstonCloudWatch from 'winston-cloudwatch';

import * as AWS from 'aws-sdk';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGOD_URL),
    ConverterModule,
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return {
          defaultMeta: { service: 'converter-service' },
          format: winston.format.json(),
          transports: [
            new WinstonCloudWatch({
              // @ts-ignore
              cloudWatchLogs: new AWS.CloudWatchLogs({
                region: config.get('AWS_REGION'),
                credentials: {
                  accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
                  secretAccessKey: config.get('AWS_SECRET_KEY'),
                },
              }),
              level: 'info',
              logGroupName: config.get('AWS_LOG_GROUP'),
              logStreamName: config.get('AWS_LOG_STREAM'),
              jsonMessage: true,
            }),

            new WinstonCloudWatch({
              // @ts-ignore
              cloudWatchLogs: new AWS.CloudWatchLogs({
                region: config.get('AWS_REGION'),
                credentials: {
                  accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
                  secretAccessKey: config.get('AWS_SECRET_KEY'),
                },
              }),
              level: 'error',
              logGroupName: config.get('AWS_LOG_GROUP'),
              logStreamName: config.get('AWS_LOG_STREAM'),
              jsonMessage: true,
            }),
          ],
        };
      },
    }),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
