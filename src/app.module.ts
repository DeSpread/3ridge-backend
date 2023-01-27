import { Module } from '@nestjs/common';
import { UserModule } from './module/user.module';
import { CommonModule } from './module/common.module';
import { ProjectModule } from './module/project.module';
import { TicketModule } from './module/ticket.module';
import { QuestModule } from './module/quest.module';

@Module({
  imports: [CommonModule, UserModule, ProjectModule, TicketModule, QuestModule],
})
export class AppModule {}
