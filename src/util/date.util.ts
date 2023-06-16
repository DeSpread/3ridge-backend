import moment from 'moment-timezone';

export class DateUtil {
  static momentNewDate(): Date {
    const momentDate = moment().tz('Asia/Seoul').format();
    return new Date(momentDate);
  }
}
