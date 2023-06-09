import moment from 'moment-timezone';

export function momentNewDate(): Date {
  const momentDate = moment().tz(process.env.TZ).format();
  return new Date(momentDate);
}
