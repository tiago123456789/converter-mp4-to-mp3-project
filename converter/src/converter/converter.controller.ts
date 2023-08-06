import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ConverterService } from './converter.service';
import { ExtractUserInterceptor } from 'src/common/interceptors/extract-user.interceptor';
import { IRequestWithUser } from 'src/common/types/irequest-with-user';
import { Mp3ConverterDto } from './mp3-converted.dto';

@Controller('/files')
export class ConverterController {
  constructor(private readonly converterService: ConverterService) {}

  @Post('/')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors(ExtractUserInterceptor)
  async uploadFile(@UploadedFile() file, @Req() request: IRequestWithUser) {
    await this.converterService.save({
      id: file.id,
      user: request.user,
    });
    console.log(`id messages => ${file.id}`);
    return {
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      id: file.id,
      filename: file.filename,
      metadata: file.metadata,
      bucketName: file.bucketName,
      chunkSize: file.chunkSize,
      size: file.size,
      md5: file.md5,
      uploadDate: file.uploadDate,
      contentType: file.contentType,
    };
  }

  @Get('/mp3-converted')
  @HttpCode(200)
  @UseInterceptors(ExtractUserInterceptor)
  async getMp3ConvertedByUserId(
    @Req() request: IRequestWithUser,
  ): Promise<Mp3ConverterDto[]> {
    return this.converterService.getMp3ConvertedByUserId(request.user.id);
  }

  @Get(':id')
  async getFileById(@Param('id') id: string, @Res() response: Response) {
    const file = await this.converterService.findInfo(id);
    const filestream = await this.converterService.readStream(id);
    response.header('Content-Type', file.contentType);
    return filestream.pipe(response);
  }
}
