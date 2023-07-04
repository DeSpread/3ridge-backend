import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { RequestContextProvider } from '../common/request.context';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(
    private readonly requestContextProvider: RequestContextProvider,
  ) {}

  use(req: Request, res: Response, next: (error?: Error | any) => void) {
    this.requestContextProvider.generateRequestContext();
    next();
  }
}
