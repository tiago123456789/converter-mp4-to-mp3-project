import { Inject, Injectable } from '@nestjs/common';
import { MailInterface } from '../common/adapters/mail.interface';
import { EMAIL_PROVIDER, LOGGER_PROVIDER } from 'src/common/constants/provider';
import { ConvertionSuccessMessage } from 'src/common/queue/messages/convertion-success.message';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(EMAIL_PROVIDER) private readonly mailer: MailInterface,
    @Inject(LOGGER_PROVIDER) private readonly logger: LoggerInterface,
  ) {}

  async notify(message: ConvertionSuccessMessage) {
    try {
      this.logger.info(
        'Starting process to notify via email convertion mp4 to mp3 completed',
        {
          trackId: message.trackId,
        },
      );
      this.logger.info('Sending email notification', {
        trackId: message.trackId,
      });
      await this.mailer.notify({
        to: message.emailToNotify,
        subject: 'Convertion MP4 to MP3 completed',
        text: '',
        pathTemplate: 'emails/convertion-completed.ejs',
        data: {
          link: message.link,
        },
      });
      this.logger.info('Sended email notification', {
        trackId: message.trackId,
      });
      this.logger.info(
        'Finished process to notify via email convertion mp4 to mp3 completed',
        {
          trackId: message.trackId,
        },
      );
    } catch (error) {
      this.logger.error(error, {
        trackId: message.trackId,
      });
      throw error;
    }
  }
}
