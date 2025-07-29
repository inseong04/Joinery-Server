import * as moment from 'moment-timezone';

export default class DateUtils {

    // 2024-04-01
    static momentNow(): string {
        return moment().tz('Asia/Seoul').format('YYYY-MM-DD');
    }

   static momentNowWithHours(): string {
    return moment().tz('Asia/Seoul').format('YYYY-MM-DD HH');
   }
   
   // 2024-04-01 13 -> 2024-04-01 format
   static formatToDateOnly(input: string): string {
    return moment.tz(input, 'YYYY-MM-DD HH', 'Asia/Seoul').format('YYYY-MM-DD');
    }
   static formatDateHour(date: Date | string): string {
      if (!(date instanceof Date)) date = new Date(date);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const hh = String(date.getHours()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}`;
    }
}