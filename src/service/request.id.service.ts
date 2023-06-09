import { Injectable } from '@nestjs/common';
import { HashUtil } from '../util/hashUtil';

@Injectable()
export class RequestIdService {
  constructor(private readonly request: Request) {}

  getRequestId(): string {
    return HashUtil.getUniqId();
  }
}
