import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { v4 as uuid } from 'uuid';
import { LogSearchData } from '../model/search.model';

@Injectable()
export class SearchService {
  accessLogIndex: string;
  debugLogIndex: string;

  constructor(
    private configService: ConfigService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {
    this.accessLogIndex =
      configService.get<string>('ELASTICSEARCH_LOG_INDEX') + '-access';
    this.debugLogIndex =
      configService.get<string>('ELASTICSEARCH_LOG_INDEX') + '-debug';
  }

  public async indexAccessLogData(message: LogSearchData) {
    await this.elasticsearchService.index<object>({
      index: this.accessLogIndex,
      id: uuid(),
      document: message,
    });
  }

  public async indexDebugLogData(message: LogSearchData) {
    await this.elasticsearchService.index<object>({
      index: this.debugLogIndex,
      id: uuid(),
      document: message,
    });
  }
}
