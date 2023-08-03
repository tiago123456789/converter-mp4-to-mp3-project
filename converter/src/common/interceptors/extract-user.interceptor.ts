import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { IRequestWithUser, IUser } from '../types/irequest-with-user';

@Injectable()
export class ExtractUserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: IRequestWithUser = context.switchToHttp().getRequest();
    const accessToken: string = request.headers.authorization;
    if (accessToken) {
      let payload: any = accessToken.split('.')[1];
      payload = Buffer.from(payload, 'base64').toString('ascii');
      payload = JSON.parse(payload);
      const userData: IUser = payload;
      request.user = {
        id: userData.id,
        email: userData.email,
      };
    }

    return next.handle();
  }
}
