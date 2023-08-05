export interface EmailParams {
  to: string;
  subject: string;
  text: string;
  pathTemplate: string;
  data: { [key: string]: any };
}

export interface MailInterface {
  notify(params: EmailParams): Promise<void>;
}
