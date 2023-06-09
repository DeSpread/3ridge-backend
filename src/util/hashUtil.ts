import { v4 as uuid } from 'uuid';
import moment from 'moment-timezone';

export class HashUtil {
  private static DELIMITER = '-';

  static getUniqId(): string {
    const currentUnixTimestamp = moment().tz(process.env.TZ).unix();
    return currentUnixTimestamp + this.DELIMITER + uuid();
  }
}
