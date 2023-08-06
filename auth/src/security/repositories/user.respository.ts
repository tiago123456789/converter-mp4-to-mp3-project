import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { UserRepositoryInterface } from './user-respository.interface';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository implements UserRepositoryInterface<User> {
  constructor(@InjectRepository(User) private repository: Repository<User>) {}

  findByEmail(email: string): Promise<User> {
    return this.repository.findOne({
      where: {
        email: email,
      },
    });
  }
}
