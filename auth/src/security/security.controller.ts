import { Body, Controller, Get, Headers, HttpCode, Post } from '@nestjs/common';
import { CredentialDto } from './dtos/credential.dto';
import { SecurityService } from './security.service';
import { AuthenticationSuccessResponse } from './dtos/AuthenticationSuccessResponse';

@Controller('auth')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Post('/')
  async login(
    @Body() credentialDto: CredentialDto,
  ): Promise<AuthenticationSuccessResponse> {
    return this.securityService.login(credentialDto);
  }

  @Get('/is-valid')
  @HttpCode(204)
  async isValid(@Headers('Authorization') accessToken: string) {
    await this.securityService.isValid(accessToken);
  }
}
