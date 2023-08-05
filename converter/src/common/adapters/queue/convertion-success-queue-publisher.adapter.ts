import { ConvertionSuccessMessage } from 'src/common/queue/messages/convertion-success.message';
import { QueuePublisher } from './queue-publisher';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConvertionSuccessQueuePublisherAdapter extends QueuePublisher<ConvertionSuccessMessage> {
  constructor(
    @InjectQueue('convertion_complete')
    convertionCompleteQueue: Queue<ConvertionSuccessMessage>,
  ) {
    super(convertionCompleteQueue);
  }
}
