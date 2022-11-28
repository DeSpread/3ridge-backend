import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import globalConfiguration from '../config/global.configuration';
import phaseConfiguration from '../config/phase.configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [globalConfiguration, phaseConfiguration],
    }),
  ],
})
export class CustomConfigModule {}
