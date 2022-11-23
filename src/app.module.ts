import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import globalConfiguration from './config/global.configuration';
import phaseConfiguration from './config/phase.configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [globalConfiguration, phaseConfiguration],
    }),
  ],
  providers: [AppService],
})
export class AppModule {}
