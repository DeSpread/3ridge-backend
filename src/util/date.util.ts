import moment from 'moment-timezone';

export function momentNewDate(): Date {
  const momentDate = moment().tz('Asia/Seoul').format();
  return new Date(momentDate);
}
