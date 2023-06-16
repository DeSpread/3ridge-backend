import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../infra/schema/user.schema';
import { UserResolver } from '../infra/graphql/resolver/user.resolver';
import { UserService } from '../service/user.service';
import { Project, ProjectSchema } from '../infra/schema/project.schema';
import { LoggerModule } from './loggerModule';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: User.name, schema: UserSchema },
    ]),
    ConfigModule,
    LoggerModule,
  ],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
