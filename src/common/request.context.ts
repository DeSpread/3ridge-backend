import { Injectable } from '@nestjs/common';
import { HashUtil } from '../util/hash.util';

@Injectable()
export class RequestContextProvider {
  private _requestId?: string;

  getRequestId() {
    if (!this._requestId) this.generateRequestContext();
    return this._requestId;
  }

  generateRequestContext() {
    this._requestId = HashUtil.getUniqId();
  }
}
