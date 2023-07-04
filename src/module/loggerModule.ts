import * as winston from 'winston';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import { Module } from '@nestjs/common';
import { SearchModule } from './search.module';
import { LoggerService } from '../service/logger.service';
import { RequestContextModule } from './request.context.module';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          level: process.env.NODE_ENV === 'production' ? 'silly' : 'silly',
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
    SearchModule,
    RequestContextModule,
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
