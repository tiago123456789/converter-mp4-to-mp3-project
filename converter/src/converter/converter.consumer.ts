import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ConverterService } from './converter.service';
import { NewFileConverterMessage } from 'src/common/queue/messages/new-file-converter.message';

@Processor('convert_mp4_to_mp3')
export class ConverterConsumer {
  constructor(private readonly converterService: ConverterService) {}

  @Process()
  async transcode(job: Job<NewFileConverterMessage>) {
    await this.converterService.convertMp4ToMp3(job.data);
  }
}
