import { Module } from '@nestjs/common';
import { UserModule } from './module/user.module';
import { CommonModule } from './module/common.module';
import { ProjectModule } from './module/project.module';
import { TicketModule } from './module/ticket.module';
import { QuestModule } from './module/quest.module';
import { VerifierModule } from './module/verifier.module';
import { AptosModule } from './module/aptos.module';

@Module({
  imports: [
    CommonModule,
    TicketModule,
    UserModule,
    ProjectModule,
    QuestModule,
    VerifierModule,
    AptosModule,
  ],
})
export class AppModule {}
