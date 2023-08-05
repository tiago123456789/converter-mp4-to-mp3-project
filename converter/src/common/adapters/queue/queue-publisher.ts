import { Queue } from 'bull';
import { MessageQueue } from '../../queue/messages/message-queue';

export abstract class QueuePublisher<MT extends MessageQueue> {
  constructor(private readonly queue: Queue<MT>) {}

  async publish(message: MT): Promise<void> {
    await this.queue.add(message);
  }
}
