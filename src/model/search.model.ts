import { momentNewDate } from '../util/date.util';

export class SearchData {
  createdAt: Date;
  createdDayOfWeek: string;

  constructor() {
    this.createdAt = momentNewDate();
    this.createdDayOfWeek = new Date().toLocaleString('en-us', {
      weekday: 'long',
    });
  }
}

export class LogSearchData extends SearchData {
  message: string;

  constructor(message: string) {
    super();
    this.message = message;
  }
}
