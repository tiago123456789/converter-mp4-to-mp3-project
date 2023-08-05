import { AddWithTrackIdMessage } from './add-with-trackid.message';

export class ConvertionSuccessMessage extends AddWithTrackIdMessage {
  id: string;
  emailToNotify: string;
  link: string;
}
