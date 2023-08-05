import { Injectable } from '@nestjs/common';
import { EmailParams, MailInterface } from './mail.interface';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NestMailerAdapter implements MailInterface {
  constructor(private readonly mailerService: MailerService) {}

  async notify(params: EmailParams): Promise<void> {
    await this.mailerService.sendMail({
      from: process.env.EMAIL_TO,
      to: params.to,
      subject: params.subject,
      template: params.pathTemplate,
      context: params.data,
    });
  }
}
