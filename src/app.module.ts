import { Module } from '@nestjs/common';
import { UserModule } from './module/user.module';
import { CommonModule } from './module/common.module';
import { ProjectModule } from './module/project.module';

@Module({
  imports: [CommonModule, UserModule, ProjectModule],
})
export class AppModule {}
