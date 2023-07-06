import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('/files')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    await this.appService.convertMp4ToMp3(file);
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
    const file = await this.appService.findInfo(id);
    const filestream = await this.appService.readStream(id);
    response.header('Content-Type', file.contentType);
    return filestream.pipe(response);
  }
}
