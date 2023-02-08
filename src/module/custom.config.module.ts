import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import globalConfiguration from '../config/global.configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      load: [globalConfiguration],
    }),
  ],
})
export class CustomConfigModule {}
