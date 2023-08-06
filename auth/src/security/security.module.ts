import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { SecurityController } from './security.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CommonModule } from 'src/common/common.module';
import { UserRepository } from './repositories/user.respository';
import { USER_REPOSITORY_PROVIDER } from 'src/common/constants/provider';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CommonModule],
  providers: [
    SecurityService,
    {
      provide: USER_REPOSITORY_PROVIDER,
      useClass: UserRepository,
    },
  ],
  controllers: [SecurityController],
})
export class SecurityModule {}
