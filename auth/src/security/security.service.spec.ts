import { Test, TestingModule } from '@nestjs/testing';
import { SecurityService } from './security.service';
import { UserRepositoryInterface } from './repositories/user-respository.interface';
import { BcryptAdapter } from 'src/common/adapters/bcrypt.adapter';
import { JwtAdapter } from 'src/common/adapters/jwt.adapter';
import { User } from './user.entity';
import { EncrypterInterface } from 'src/common/adapters/encrypter.interface';
import { TokenInterface } from 'src/common/adapters/token.interface';

describe('SecurityService', () => {
  let repository: jest.Mocked<UserRepositoryInterface<User>>;
  let encrypter: jest.Mocked<EncrypterInterface>;
  let authToken: jest.Mocked<TokenInterface>;

  beforeEach(async () => {
    jest.clearAllMocks();

    repository = {
      findByEmail: jest.fn(),
    };

    encrypter = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    authToken = {
      get: jest.fn(),
      isValid: jest.fn(),
    };
  });

  it('should be throw exception when toke is invalid', async () => {
    const securityService = new SecurityService(
      repository,
      encrypter,
      authToken,
    );

    try {
      const fakeToken = 'afdkflasdjfaeijkwef';
      authToken.isValid.mockReturnValue(Promise.resolve(false));
      await securityService.isValid(fakeToken);
    } catch (error) {
      expect(error.message).toBe('You forbidden execute this action.');
    }
  });

  it('should be return true if token is valid', async () => {
    const securityService = new SecurityService(
      repository,
      encrypter,
      authToken,
    );

    const fakeToken = 'afdkflasdjfaeijkwef';
    authToken.isValid.mockReturnValue(Promise.resolve(true));
    const isValidToken = await securityService.isValid(fakeToken);
    expect(isValidToken).toBe(true);
  });

  it("should be throw exception when try login because don't have anyone using email informed", async () => {
    try {
      const securityService = new SecurityService(
        repository,
        encrypter,
        authToken,
      );

      repository.findByEmail.mockReturnValue(Promise.resolve(null));
      await securityService.login({
        email: 'fake@gmail.com',
        password: 'faketesttest',
      });
    } catch (error) {
      expect(error.message).toBe('Credentials invalid!');
      expect(encrypter.compare).toBeCalledTimes(0);
    }
  });

  it('should be throw exception when try login because password is invalid', async () => {
    try {
      const securityService = new SecurityService(
        repository,
        encrypter,
        authToken,
      );

      const user: User = new User();
      user.email = 'fake@gmail.com';
      user.password =
        '$2a$08$Jn/Bwu38TST9uj/jehFUluEVXIz/KDmpe.nv2p0BYacwS5iPA8See';

      repository.findByEmail.mockReturnValue(Promise.resolve(user));
      encrypter.compare.mockResolvedValue(Promise.resolve(false));
      await securityService.login({
        email: 'fake@gmail.com',
        password: 'teste1',
      });
    } catch (error) {
      expect(error.message).toBe('Credentials invalid!');
      expect(encrypter.compare).toBeCalledTimes(1);
    }
  });

  it('should be login succes', async () => {
    const securityService = new SecurityService(
      repository,
      encrypter,
      authToken,
    );

    const user: User = new User();
    user.email = 'fake@gmail.com';
    user.password =
      '$2a$08$Jn/Bwu38TST9uj/jehFUluEVXIz/KDmpe.nv2p0BYacwS5iPA8See';

    repository.findByEmail.mockReturnValue(Promise.resolve(user));
    encrypter.compare.mockResolvedValue(Promise.resolve(true));

    await securityService.login({
      email: 'fake@gmail.com',
      password: 'teste',
    });

    expect(authToken.get).toBeCalledTimes(1);
    expect(encrypter.compare).toBeCalledTimes(1);
  });
});
