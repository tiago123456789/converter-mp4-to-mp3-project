import { Injectable } from '@nestjs/common';
import { TrackerIdInterface } from './tracker-id.interface';
import * as rTracer from 'cls-rtracer';
import { randomUUID } from 'crypto';

@Injectable()
export class TrackerAdapters implements TrackerIdInterface {
  id(): string {
    return (rTracer.id() as string) || randomUUID();
  }
}
