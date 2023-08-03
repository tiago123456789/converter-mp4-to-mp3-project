import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CredentialDto } from './dtos/credential.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { PROVIDER } from 'src/common/configs/provider';
import { EncrypterInterface } from 'src/common/adapters/encrypter.interface';
import { TokenInterface } from 'src/common/adapters/token.interface';
import { AuthenticationSuccessResponse } from './dtos/AuthenticationSuccessResponse';

@Injectable()
export class SecurityService {
  constructor(
    @InjectRepository(User) private repository: Repository<User>,
    @Inject(PROVIDER.ENCRYPTER) private encrypter: EncrypterInterface,
    @Inject(PROVIDER.AUTH_TOKEN) private authToken: TokenInterface,
  ) {}

  async login(
    credential: CredentialDto,
  ): Promise<AuthenticationSuccessResponse> {
    const userWithEmail = await this.repository.findOne({
      where: {
        email: credential.email,
      },
    });

    if (!userWithEmail) {
      throw new HttpException('Credentials invalid!', 401);
    }

    const isValid = this.encrypter.compare(
      userWithEmail.password,
      credential.password,
    );

    if (!isValid) {
      throw new HttpException('Credentials invalid!', 401);
    }

    const accessToken = await this.authToken.get({
      id: userWithEmail.id,
      email: userWithEmail.email,
    });

    return { accessToken };
  }

  async isValid(token: string) {
    const isValid = await this.authToken.isValid(token);
    if (!isValid) {
      throw new HttpException('You forbidden execute this action.', 403);
    }

    return isValid;
  }
}
