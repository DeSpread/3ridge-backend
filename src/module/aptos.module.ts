import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VerifierResolver } from '../infra/graphql/resolver/verifier.resolver';
import { VerifierService } from '../infra/database/service/verifier.service';
import { UserModule } from './user.module';
import { AptosService } from '../infra/database/service/aptos.service';
import { AptosResolver } from '../infra/graphql/resolver/aptos.resolver';

@Module({
  imports: [ConfigModule],
  providers: [AptosResolver, AptosService],
  exports: [AptosService],
})
export class AptosModule {}
