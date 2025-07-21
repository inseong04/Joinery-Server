import * as moment from 'moment-timezone';

export default class DateUtils {

    // 2024-04-01 19:40:34
    static momentNow(): string {
        return moment().tz('Asia/Seoul').format('YYYY-MM-DD');
    }

    // 18:00
    static momentTime(): string {
        return moment().tz('Asia/Seoul').format('HH:mm');
      }
}