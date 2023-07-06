import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor(process.env.QUEUE_CONVERT_MP4_TO_MP3)
export class AppConsumer {
  @Process()
  async transcode(job: Job<unknown>) {
    console.log(job.data);
  }
}
