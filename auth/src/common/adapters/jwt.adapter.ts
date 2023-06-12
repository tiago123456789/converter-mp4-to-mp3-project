import { Injectable } from '@nestjs/common';
import { TokenInterface, TokenPayload } from './token.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAdapter implements TokenInterface {
  constructor(private jwtService: JwtService) {}

  get(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  async isValid(token: string): Promise<TokenPayload | boolean> {
    try {
      token = token.replace('Bearer ', '');
      const payload: TokenPayload = (await this.jwtService.verifyAsync(
        token,
      )) as TokenPayload;
      return payload;
    } catch (error) {
      return false;
    }
  }
}
