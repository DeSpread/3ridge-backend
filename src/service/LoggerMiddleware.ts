import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from './loggerService';
import { StringUtil } from '../util/string.util';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private loggerService: LoggerService) {}

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
    // FIXME: need to create as type class in later
    if (
      StringUtil.isEqualsIgnoreCase(
        _body?.operationName,
        'IntrospectionQuery',
      ) ||
      StringUtil.isEqualsIgnoreCase(_service, 'health')
    ) {
      return;
    }

    this.loggerService.request(_service, {
      service: _service,
      url: _url,
      headers: _headers,
      query: _query,
      body: _body,
    });
    next();
  }
}
