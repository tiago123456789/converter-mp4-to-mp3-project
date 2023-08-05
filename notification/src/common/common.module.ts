import { Module } from '@nestjs/common';
import { LOGGER_PROVIDER } from './constants/provider';
import { WinstonAdapter } from './adapters/winston.adapater';

@Module({
  providers: [
    {
      provide: LOGGER_PROVIDER,
      useClass: WinstonAdapter,
    },
  ],
  exports: [
    {
      provide: LOGGER_PROVIDER,
      useClass: WinstonAdapter,
    },
  ],
})
export class CommonModule {}
