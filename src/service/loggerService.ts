import { Inject, Injectable } from '@nestjs/common';
import { WinstonLogger } from 'nest-winston';
import { RequestIdService } from './request.id.service';
import { SearchService } from './search.service';
import { LogLevel, LogSearchData } from '../model/search.model';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston/dist/winston.constants';

@Injectable()
export class LoggerService {
  requestId: string;

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private logger: WinstonLogger,
    private requestIdService: RequestIdService,
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

  request(message?: any, requestContext?: any) {
    const log = new LogSearchData(
      this.requestId,
      message,
      LogLevel.REQUEST,
      requestContext,
    );
    this.logger.verbose(
      `${this.getMessageWithRequestId(log.message)} > ${JSON.stringify(
        log.requestContext,
      )}`,
    );
    this.insertLogToES(log);
  }
}
