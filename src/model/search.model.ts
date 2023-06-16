import { registerEnumType } from '@nestjs/graphql';
import { DateUtil } from '../util/date.util';

export enum LogLevel {
  INFO = 'info',
  DEBUG = 'debug',
  ERROR = 'error',
}

registerEnumType(LogLevel, { name: 'LogLevelType' });

export class SearchData {
  createdAt: Date;
  createdDayOfWeek: string;

  constructor() {
    this.createdAt = DateUtil.momentNewDate();
    this.createdDayOfWeek = new Date().toLocaleString('en-us', {
      weekday: 'long',
    });
  }
}

export class LogSearchData extends SearchData {
  requestId: string;
  logLevel: LogLevel;
  message: string;
  requestContext: string;

  constructor(
    requestId?: string,
    message?: string,
    level: LogLevel = LogLevel.INFO,
    requestContext?: any,
  ) {
    super();
    this.requestId = requestId;
    this.logLevel = level;
    this.message = message;
    this.requestContext = requestContext;
  }
}
