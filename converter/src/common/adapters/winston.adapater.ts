import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class WinstonAdapter implements LoggerInterface {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  info(message: string, metadata: string | { [key: string]: any }) {
    this.logger.info(message, metadata);
  }

  error(message: string, metadata: string | { [key: string]: any }) {
    this.logger.error(message, metadata);
  }
}
