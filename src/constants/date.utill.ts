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
}