import { Module } from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import { VerifierResolver } from '../infra/graphql/resolver/verifier.resolver';
import { VerifierService } from '../service/verifier.service';
import { UserModule } from './user.module';
import { GraphQLRequestModule } from '@golevelup/nestjs-graphql-request';


@Module({
  imports: [
    ConfigModule,
    UserModule,
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
  ],
  providers: [VerifierResolver, VerifierService],
  exports: [VerifierService],
})
export class VerifierModule {}
