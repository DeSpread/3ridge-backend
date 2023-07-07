import { v4 as uuid } from 'uuid';
import moment from 'moment-timezone';
import * as os from 'os';

export class HashUtil {
  private static DELIMITER = '-';

  static getUniqId(): string {
    const currentUnixTimestamp = moment().tz('Asia/Seoul').unix();
    return (
      currentUnixTimestamp +
      this.DELIMITER +
      uuid() +
      this.DELIMITER +
      os?.hostname()?.toLowerCase()
    );
  }
}
