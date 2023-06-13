import * as winston from 'winston';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike('3ridge-backend', {
              prettyPrint: true,
            }),
          ),
        }),
      ],
    }),
  ],
})
export class LoggerModule {}
