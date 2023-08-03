import { Request } from 'express';

export interface IUser {
  id: number;
  email: string;
}

export interface IRequestWithUser extends Request {
  user: IUser | null;
}
