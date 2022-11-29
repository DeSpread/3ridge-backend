import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectResolver } from '../infra/graphql/resolver/project.resolver';
import { ProjectService } from '../infra/database/service/project.service';
import { Project, ProjectSchema } from '../infra/schema/project.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    ConfigModule,
  ],
  providers: [ProjectResolver, ProjectService],
})
export class ProjectModule {}
