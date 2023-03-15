import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VerifierResolver } from '../infra/graphql/resolver/verifier.resolver';
import { VerifierService } from '../infra/database/service/verifier.service';
import { UserModule } from './user.module';
import { GraphQLRequestModule } from '@golevelup/nestjs-graphql-request';

@Module({
  imports: [
    ConfigModule,
    UserModule,
    GraphQLRequestModule.forRoot(GraphQLRequestModule, {
      endpoint: 'https://dev-api.3ridge.xyz/graphql',
      options: {
        headers: {
          'content-type': 'application/json',
        },
      },
    }),
  ],
  providers: [VerifierResolver, VerifierService],
  exports: [VerifierService],
})
export class VerifierModule {}
