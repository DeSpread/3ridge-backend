import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectResolver } from '../infra/graphql/resolver/project.resolver';
import { ProjectService } from '../infra/database/service/project.service';
import { Project, ProjectSchema } from '../infra/schema/project.schema';
import { Ticket, TicketSchema } from '../infra/schema/ticket.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Ticket.name, schema: TicketSchema },
    ]),
    ConfigModule,
  ],
  providers: [ProjectResolver, ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
