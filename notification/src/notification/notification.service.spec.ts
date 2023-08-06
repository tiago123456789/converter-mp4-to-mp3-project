import { MailInterface } from 'src/common/adapters/mail.interface';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let mailer: jest.Mocked<MailInterface>;
  let logger: jest.Mocked<LoggerInterface>;
  const message = {
    id: '1',
    link: 'https://example.com.br',
    emailToNotify: 'test@gmail.com',
    trackId: '0ca01c98-0f62-4659-96d1-7ad0a42aedea',
  };
  beforeEach(() => {
    mailer = {
      notify: jest.fn(),
    };
    logger = {
      info: jest.fn(),
      error: jest.fn(),
    };
  });

  it('Should be catch error when happen some erro when try notify by email', async () => {
    try {
      const notificationService = new NotificationService(mailer, logger);
      mailer.notify.mockImplementation(() => {
        throw new Error('Error when try notify via email');
      });
      await notificationService.notify(message);
    } catch (error) {
      expect(logger.error).toBeCalledTimes(1);
    }
  });

  it('Should be notify by email with success', async () => {
    const notificationService = new NotificationService(mailer, logger);
    await notificationService.notify(message);
    expect(mailer.notify).toBeCalledTimes(1);
    expect(logger.error).toBeCalledTimes(0);
    expect(logger.info).toBeCalledTimes(4);
  });
});
