import { MessageQueue } from './message-queue';

export class AddWithTrackIdMessage extends MessageQueue {
  trackId?: string;
}
