import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type Mp3ConverterDocument = mongoose.HydratedDocument<Mp3Converter>;

@Schema()
export class Mp3Converter {
  @Prop({ type: mongoose.Schema.Types.Number })
  userId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  fileId: string;

  @Prop({ type: mongoose.Schema.Types.Date })
  createdAt: Date;
}

export const Mp3ConverterSchema = SchemaFactory.createForClass(Mp3Converter);
