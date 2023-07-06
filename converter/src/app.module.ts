import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { GridFsMulterConfigService } from './gridfs-multer-config.service';
import { BullModule } from '@nestjs/bull';
import { AppConsumer } from './app.consumer';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGOD_URL),
    MulterModule.registerAsync({
      useClass: GridFsMulterConfigService,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
      defaultJobOptions: {
        removeOnComplete: true,
        attempts: 3,
      },
    }),
    BullModule.registerQueueAsync({
      useFactory() {
        return {
          name: process.env.QUEUE_CONVERT_MP4_TO_MP3,
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [GridFsMulterConfigService, AppService, AppConsumer],
})
export class AppModule {}
