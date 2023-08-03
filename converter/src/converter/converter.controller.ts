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

  @Get(':id')
  async getFileById(@Param('id') id: string, @Res() response: Response) {
    const file = await this.converterService.findInfo(id);
    const filestream = await this.converterService.readStream(id);
    response.header('Content-Type', file.contentType);
    return filestream.pipe(response);
  }
}
