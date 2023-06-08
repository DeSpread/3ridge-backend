import { Injectable } from '@nestjs/common';
import { TransactionUtil } from '../util/transaction.util';

@Injectable()
export class RequestIdService {
  constructor(private readonly request: Request) {}

  getReqId(): string {
    return TransactionUtil.getTxId();
  }
}
