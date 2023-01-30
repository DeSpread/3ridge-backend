import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VerifierResolver } from '../infra/graphql/resolver/verifier.resolver';
import { VerifierService } from '../infra/database/service/verifier.service';
import { UserModule } from './user.module';

@Module({
  imports: [ConfigModule, UserModule],
  providers: [VerifierResolver, VerifierService],
  exports: [VerifierService],
})
export class VerifierModule {}
