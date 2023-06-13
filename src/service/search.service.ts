import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { v4 as uuid } from 'uuid';
import { LogSearchData } from '../model/search.model';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';

@Injectable()
export class SearchService {
  logIndex: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
    private configService: ConfigService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {
    this.logIndex = configService.get<string>('ELASTICSEARCH_LOG_INDEX');
  }

  public async indexToLogData(message: LogSearchData) {
    await this.elasticsearchService.index<object>({
      index: this.logIndex,
      id: uuid(),
      document: message,
    });
  }
}
