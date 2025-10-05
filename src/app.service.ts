import { Injectable } from '@nestjs/common';

export interface HealthDto {
  status: string;
  timestamp: string;
}
@Injectable()
export class AppService {
  getHello(): HealthDto {
    return { status: 'OK', timestamp: new Date().toISOString() };
  }
}
