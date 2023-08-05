import { NewFileConverterMessage } from 'src/common/queue/messages/new-file-converter.message';
import { QueuePublisher } from './queue-publisher';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NewFileConverterQueuePublisherAdapter extends QueuePublisher<NewFileConverterMessage> {
  constructor(
    @InjectQueue('convert_mp4_to_mp3')
    convertMp4ToMp3Queue: Queue<NewFileConverterMessage>,
  ) {
    super(convertMp4ToMp3Queue);
  }
}
