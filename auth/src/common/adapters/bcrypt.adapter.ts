import { Injectable } from '@nestjs/common';
import { EncrypterInterface } from './encrypter.interface';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class BcryptAdapter implements EncrypterInterface {
  hash(plainText: string): Promise<string> {
    return bcryptjs.hash(plainText, 8);
  }

  compare(hash: string, plainText: string): Promise<boolean> {
    return bcryptjs.compare(plainText, hash);
  }
}
