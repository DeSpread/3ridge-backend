import * as winston from 'winston';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import { Module } from '@nestjs/common';
import { RequestIdModule } from './request.id.module';
import { LoggerService } from '../service/loggerService';
import { SearchModule } from './searchModule';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike('3ridge-backend', {
              colors: true,
              prettyPrint: true,
            }),
          ),
        }),
      ],
    }),
    RequestIdModule,
    SearchModule,
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
