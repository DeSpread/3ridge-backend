import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Quest, QuestSchema } from '../infra/schema/quest.schema';
import { QuestService } from '../service/quest.service';
import { QuestResolver } from '../infra/graphql/resolver/quest.resolver';
import { User, UserSchema } from '../infra/schema/user.schema';
import { UserModule } from './user.module';
import { Project, ProjectSchema } from '../infra/schema/project.schema';
import { VerifierModule } from './verifier.module';
import { TicketModule } from './ticket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quest.name, schema: QuestSchema },
      { name: User.name, schema: UserSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
    ConfigModule,
    UserModule,
    VerifierModule,
    forwardRef(() => TicketModule),
  ],
  providers: [QuestResolver, QuestService],
  exports: [QuestService],
})
export class QuestModule {}
