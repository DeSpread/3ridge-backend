import * as winston from 'winston';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import { forwardRef, Module } from '@nestjs/common';
import { RequestIdModule } from './request.id.module';
import { SearchModule } from './search.module';
import { LoggerService } from '../service/logger.service';

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
    forwardRef(() => SearchModule),
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
