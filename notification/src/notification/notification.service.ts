import { Inject, Injectable } from '@nestjs/common';
import { MailInterface } from './adapters/mail.interface';
import { EMAIL_PROVIDER } from 'src/common/constants/provider';
import { ConvertionSuccessMessage } from 'src/common/queue/messages/convertion-success.message';

@Injectable()
export class NotificationService {
  constructor(@Inject(EMAIL_PROVIDER) private readonly mailer: MailInterface) {}

  async notify(message: ConvertionSuccessMessage) {
    console.log(
      'Starting process to notify via email convertion mp4 to mp3 completed',
    );
    console.log('Sending email notification');
    await this.mailer.notify({
      to: message.emailToNotify,
      subject: 'Convertion MP4 to MP3 completed',
      text: '',
      pathTemplate: 'emails/convertion-completed.ejs',
      data: {
        link: message.link,
      },
    });
    console.log('Sended email notification');
    console.log(
      'Finished process to notify via email convertion mp4 to mp3 completed',
    );
  }
}
