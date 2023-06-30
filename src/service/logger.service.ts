import { Inject, Injectable } from '@nestjs/common';
import { RequestIdService } from './request.id.service';
import { SearchService } from './search.service';
import { LogLevel, LogSearchData } from '../model/search.model';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';

@Injectable()
export class LoggerService {
  readonly requestId: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: WinstonLogger,
    private readonly requestIdService: RequestIdService,
    private readonly searchService: SearchService,
  ) {
    this.requestId = requestIdService.getRequestId();
  }

  private getMessageWithRequestId(message: string) {
    return `${this.requestId} > ${message}`;
  }

  private async insertAccessLogToES(
    logSearchData: LogSearchData,
  ): Promise<boolean> {
    try {
      this.logger.debug(
        this.getMessageWithRequestId('Try to indexing access log data.'),
      );
      await this.searchService.indexAccessLogData(logSearchData);
      this.logger.debug(
        this.getMessageWithRequestId(
          'Successful indexing to access log data is completed',
        ),
      );
      return true;
    } catch (e) {
      this.logger.error(this.getMessageWithRequestId(e.message));
    }
    return false;
  }

  private async insertDebugLogToES(
    logSearchData: LogSearchData,
  ): Promise<boolean> {
    try {
      this.logger.debug(
        this.getMessageWithRequestId('Try to indexing debug log data.'),
      );
      await this.searchService.indexDebugLogData(logSearchData);
      this.logger.debug(
        this.getMessageWithRequestId(
          'Successful indexing to debug log data is completed',
        ),
      );
      return true;
    } catch (e) {
      this.logger.error(this.getMessageWithRequestId(e.message));
    }
    return false;
  }

  debug(message?: any, withES = true, requestContext?: any) {
    this.logger.debug(this.getMessageWithRequestId(message));
    if (withES) {
      const log = new LogSearchData(
        this.requestId,
        message,
        LogLevel.DEBUG,
        requestContext,
      );
      this.insertDebugLogToES(log);
    }
  }

  error(message?: any) {
    this.logger.error(this.getMessageWithRequestId(message));
  }

  accessLogWithES(message?: any, requestContext?: any) {
    const log = new LogSearchData(
      this.requestId,
      message,
      LogLevel.INFO,
      requestContext,
    );
    this.logger.debug(
      `${this.getMessageWithRequestId(log.message)} > ${JSON.stringify(
        log.requestContext,
      )}`,
    );
    this.insertAccessLogToES(log);
  }

  errorWithES(message?: any, requestContext?: any) {
    const log = new LogSearchData(
      this.requestId,
      message,
      LogLevel.ERROR,
      requestContext,
    );
    this.logger.error(
      `${this.getMessageWithRequestId(log.message)} > ${JSON.stringify(
        log.requestContext,
      )}`,
    );
    this.insertAccessLogToES(log);
  }
}
