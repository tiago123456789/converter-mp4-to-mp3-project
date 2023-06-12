import { IsNotEmpty } from 'class-validator';

export class CredentialDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
