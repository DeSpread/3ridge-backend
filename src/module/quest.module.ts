import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Quest, QuestSchema } from '../infra/schema/quest.schema';
import { QuestService } from '../infra/database/service/quest.service';
import { QuestResolver } from '../infra/graphql/resolver/quest.resolver';
import { User, UserSchema } from '../infra/schema/user.schema';
import { UserModule } from './user.module';
import { Project, ProjectSchema } from '../infra/schema/project.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quest.name, schema: QuestSchema },
      { name: User.name, schema: UserSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
    ConfigModule,
    UserModule,
  ],
  providers: [QuestResolver, QuestService],
  exports: [QuestService],
})
export class QuestModule {}
