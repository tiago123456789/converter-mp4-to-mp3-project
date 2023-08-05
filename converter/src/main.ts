import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as rTracer from 'cls-rtracer';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(rTracer.expressMiddleware());
  await app.listen(3002);
}
bootstrap();
