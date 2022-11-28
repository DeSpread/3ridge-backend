import { Module } from '@nestjs/common';
import { UserModule } from './module/user.module';
import { CommonModule } from './module/common.module';

@Module({
  imports: [CommonModule, UserModule],
})
export class AppModule {}
