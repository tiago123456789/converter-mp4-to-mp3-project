import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConverterService } from './converter.service';

@Injectable()
export class ConverterSchedule {
  constructor(private readonly converterService: ConverterService) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async handle() {
    await this.converterService.removeMp3ConvertedAfter30Days();
  }
}
