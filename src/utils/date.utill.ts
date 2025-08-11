import * as moment from 'moment-timezone';

export default class DateUtils {

    // to 2024-04-01
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

    static formatDate(date: Date | string): string {
        if (!(date instanceof Date)) date = new Date(date);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    static formatDateHour(date: Date | string): string {
      if (!(date instanceof Date)) date = new Date(date);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const hh = String(date.getHours()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}`;
    }
    static objectToDate(obj: DateObject): Date {
        return new Date(obj.year, obj.month - 1, obj.day);
    }
    
    // "YYYY-MM-DD" 형식의 문자열을 Date 객체로 변환
    static stringToDate(dateString: string): Date {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        throw new Error("Invalid date format. Expected YYYY-MM-DD");
    }

    return date;
    }
    
}