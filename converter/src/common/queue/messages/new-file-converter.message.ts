import { IUser } from 'src/common/types/irequest-with-user';
import { AddWithTrackIdMessage } from './add-with-trackid.message';

export class NewFileConverterMessage extends AddWithTrackIdMessage {
  id: string;
  user: IUser;
}
