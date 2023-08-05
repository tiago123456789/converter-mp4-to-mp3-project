import { Injectable } from '@nestjs/common';
import { TrackerIdInterface } from './tracker-id.interface';
import * as rTracer from 'cls-rtracer';

@Injectable()
export class TrackerAdapters implements TrackerIdInterface {
  id(): string {
    return rTracer.id() as string;
  }
}
