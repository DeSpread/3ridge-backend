import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { v1 as uuid } from 'uuid';
import { LogSearchData } from '../model/search.model';
import { RequestIdService } from './request.id.service';

@Injectable()
export class SearchService {
  logIndex: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: WinstonLogger,
    private configService: ConfigService,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly reqIdService: RequestIdService,
  ) {
    this.logIndex = configService.get<string>('ELASTICSEARCH_LOG_INDEX');
    this.logger.debug(`log index name: ${this.logIndex}`);
  }

  public async indexToLogData(message: LogSearchData): Promise<boolean> {
    const txId = this.reqIdService.getReqId();
    try {
      this.logger.debug(
        `${txId} > try to index to log data. index name: ${this.logIndex}`,
      );

      await this.elasticsearchService.index<object>({
        index: this.logIndex,
        id: uuid(),
        document: message,
      });
      this.logger.debug(
        `${txId} > Successful indexing to log data is completed. index name: ${this.logIndex}`,
      );
      return true;
    } catch (err) {
      this.logger.error(err, 'Search service -> indexData');
    }
    return false;
  }
}
