import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SearchService } from '../service/search.service';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get<string>('ELASTICSEARCH_ENDPOINT'),
        auth: {
          username: configService.get<string>('ELASTICSEARCH_AUTH_USERNAME'),
          password: configService.get<string>('ELASTICSEARCH_AUTH_PASSWORD'),
        },
        maxRetries: 10,
        requestTimeout: 60000,
        pintTimeout: 60000,
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
