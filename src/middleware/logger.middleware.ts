import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../service/logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService) {}

  use(req: Request, res: Response, next: (error?: Error | any) => void) {
    const tempUrl = req.method + ' ' + req.url.split('?')[0];
    const _service = req.url.slice(1).split('/')[
      req.url.slice(1).split('/').length - 1
    ];
    const _headers = req.headers ? req.headers : {};
    const _query = req.query ? req.query : {};
    const _body = req.body ? req.body : {};
    const _url = tempUrl ? tempUrl : {};

    // Dev 환경에서 GraphQL playground을 켜놓았을때 주기적으로 요청되어 필터링이 필요함
    if (
      String(_body?.operationName).toUpperCase().trim() ===
      'IntrospectionQuery'.toUpperCase()
    ) {
      next();
      return;
    }

    this.loggerService.debugWithES(_service, {
      service: _service,
      url: _url,
      headers: _headers,
      query: _query,
      body: _body,
    });
    next();
  }
}
