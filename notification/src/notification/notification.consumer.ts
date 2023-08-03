import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ConvertionSuccessMessage } from 'src/common/queue/messages/convertion-success.message';
import { NotificationService } from './notification.service';

@Processor('convertion_complete')
export class NotificationConsumer {
  constructor(private readonly notificationService: NotificationService) {}

  @Process()
  async transcode(job: Job<ConvertionSuccessMessage>) {
    await this.notificationService.notify(job.data);
  }
}
