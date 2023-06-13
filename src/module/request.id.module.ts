import { Module, Scope } from '@nestjs/common';
import { RequestIdService } from '../service/request.id.service';
import { REQUEST } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: RequestIdService,
      useFactory: (req) => new RequestIdService(req),
      inject: [REQUEST],
      scope: Scope.REQUEST,
    },
  ],
  exports: [RequestIdService],
})
export class RequestIdModule {}
