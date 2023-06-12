import { Module } from '@nestjs/common';
import { PROVIDER } from './configs/provider';
import { BcryptAdapter } from './adapters/bcrypt.adapter';
import { JwtModule } from '@nestjs/jwt';
import { JwtAdapter } from './adapters/jwt.adapter';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          global: true,
          secret: config.get('JWT_SECRET'),
          signOptions: { expiresIn: '1h' },
        };
      },
    }),
  ],
  providers: [
    {
      provide: PROVIDER.AUTH_TOKEN,
      useClass: JwtAdapter,
    },
    {
      provide: PROVIDER.ENCRYPTER,
      useClass: BcryptAdapter,
    },
  ],
  exports: [
    {
      provide: PROVIDER.ENCRYPTER,
      useClass: BcryptAdapter,
    },
    {
      provide: PROVIDER.AUTH_TOKEN,
      useClass: JwtAdapter,
    },
  ],
})
export class CommonModule {}
