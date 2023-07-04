import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProjectResolver } from '../infra/graphql/resolver/project.resolver';
import { ProjectService } from '../service/project.service';
import { DatabaseModule } from './database.module';

@Module({
  imports: [DatabaseModule, ConfigModule],
  providers: [ProjectResolver, ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
