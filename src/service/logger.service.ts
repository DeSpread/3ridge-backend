import { Inject, Injectable } from '@nestjs/common';
import { RequestIdService } from './request.id.service';
import { SearchService } from './search.service';
import { LogLevel, LogSearchData } from '../model/search.model';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';

@Injectable()
export class LoggerService {
  requestId: string;

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

  private async insertLogToES(logSearchData: LogSearchData): Promise<boolean> {
    try {
      this.logger.debug(
        this.getMessageWithRequestId('Try to indexing log data.'),
      );
      await this.searchService.indexToLogData(logSearchData);
      this.logger.debug(
        this.getMessageWithRequestId(
          'Successful indexing to log data is completed',
        ),
      );
      return true;
    } catch (e) {
      this.logger.error(this.getMessageWithRequestId(e.message));
    }
    return false;
  }

  debug(message?: any) {
    this.logger.debug(this.getMessageWithRequestId(message));
  }

  error(message?: any) {
    this.logger.error(this.getMessageWithRequestId(message));
  }

  debugWithES(message?: any, requestContext?: any) {
    const log = new LogSearchData(
      this.requestId,
      message,
      LogLevel.DEBUG,
      requestContext,
    );
    this.logger.debug(
      `${this.getMessageWithRequestId(log.message)} > ${JSON.stringify(
        log.requestContext,
      )}`,
    );
    this.insertLogToES(log);
  }
}
