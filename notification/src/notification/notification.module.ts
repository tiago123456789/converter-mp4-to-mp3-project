import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationConsumer } from './notification.consumer';
import { MailerModule } from '@nestjs-modules/mailer';
import { EMAIL_PROVIDER } from 'src/common/constants/provider';
import { NestMailerAdapter } from './adapters/nest-mailer.adapter';
import { NotificationService } from './notification.service';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

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
    BullModule.registerQueue({
      name: 'convertion_complete',
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return {
          transport: {
            host: config.get('SMTP_HOST'),
            port: config.get('SMTP_PORT'),
            ignoreTLS: true,
            secure: false,
            auth: {
              user: config.get('SMTP_USER'),
              pass: config.get('SMTP_PASSWORD'),
            },
          },
          template: {
            dir: __dirname + '/../../views',
            adapter: new EjsAdapter(),
          },
        };
      },
    }),
  ],
  providers: [
    NotificationConsumer,
    {
      provide: EMAIL_PROVIDER,
      useClass: NestMailerAdapter,
    },
    NotificationService,
  ],
})
export class NotificationModule {}
