import { Module } from '@nestjs/common';
import { UserModule } from './module/user.module';
import { CommonModule } from './module/common.module';
import { ProjectModule } from './module/project.module';
import { TicketModule } from './module/ticket.module';

@Module({
  imports: [CommonModule, UserModule, ProjectModule, TicketModule],
})
export class AppModule {}
