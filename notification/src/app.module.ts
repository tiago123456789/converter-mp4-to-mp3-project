import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationModule } from './notification/notification.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as WinstonCloudWatch from 'winston-cloudwatch';
import * as AWS from 'aws-sdk';
import { WinstonModule } from 'nest-winston';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    NotificationModule,
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return {
          defaultMeta: { service: 'notification-service' },
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
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
