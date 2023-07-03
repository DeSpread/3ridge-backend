import { Inject, Injectable } from '@nestjs/common';
import { SearchService } from './search.service';
import { LogLevel, LogSearchData } from '../model/search.model';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import { RequestContextProvider } from '../common/request.context';

@Injectable()
export class LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: WinstonLogger,
    private readonly searchService: SearchService,
    private requestContextProvider: RequestContextProvider,
  ) {}

  private getMessageWithRequestId(message: string) {
    return `${this.requestContextProvider.getRequestId()} > ${message}`;
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
        this.requestContextProvider.getRequestId(),
        message,
        LogLevel.DEBUG,
        requestContext,
      );
      this.insertDebugLogToES(log);
    }
  }

  error(message?: any, withES = true, requestContext?: any) {
    if (withES) {
      this.errorWithES(message);
    }
    this.logger.error(this.getMessageWithRequestId(message));
  }

  accessLogWithES(message?: any, requestContext?: any) {
    const log = new LogSearchData(
      this.requestContextProvider.getRequestId(),
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
      this.requestContextProvider.getRequestId(),
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
