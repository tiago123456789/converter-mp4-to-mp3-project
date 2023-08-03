import { Module } from '@nestjs/common';
import { ConverterModule } from './converter/converter.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGOD_URL),
    ConverterModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
