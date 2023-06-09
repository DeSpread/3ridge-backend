import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VerifierResolver } from '../infra/graphql/resolver/verifier.resolver';
import { UserModule } from './user.module';
import { GraphQLRequestModule } from '@golevelup/nestjs-graphql-request';
import { VerifierService } from '../service/verifier.service';
import { LoggerModule } from './loggerModule';

@Module({
  imports: [
    GraphQLRequestModule.forRootAsync(GraphQLRequestModule, {
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        endpoint: configService.get<string>('aptos.indexerEndpoint'),
        options: {
          headers: {
            'content-type': 'application/json',
          },
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    UserModule,
    LoggerModule,
  ],
  providers: [VerifierResolver, VerifierService],
  exports: [VerifierService],
})
export class VerifierModule {}
