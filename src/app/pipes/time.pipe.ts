import { Pipe, PipeTransform } from '@angular/core';
import {getDatesDiff, isDateValid, formatDate} from "../helpers/time.helper";

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {
    transform(value: Date | string): string {
        if (typeof value === 'string') {
            if (!isDateValid(value)) {
                return '';
            }
            value = new Date(value);
        }
        const diffInSeconds = Math.ceil(getDatesDiff(value) / 1000)  - 1;
        if (diffInSeconds < 0) {
            return formatDate(value, 'Y-m-d H:i:s');
        }

        if (diffInSeconds <= 10) {
            return 'just';
        }

        if (diffInSeconds <= 45) {
            return diffInSeconds + ' seconds ago';
        }

        const minutesSeconds = 60;
        if (diffInSeconds < minutesSeconds * 2) {
            return 'a minute ago';
        }

        const hourSeconds = minutesSeconds * 60;
        if (diffInSeconds <= hourSeconds) {
            return (Math.ceil(diffInSeconds / minutesSeconds) - 1) + ' minutes ago';
        }

        const daySeconds = hourSeconds * 24;
        if (diffInSeconds <= daySeconds) {
            const hours = Math.ceil(diffInSeconds / hourSeconds) - 1;
            if (hours <= 1) {
                return 'an hour ago';
            }
            const minutes = Math.ceil((diffInSeconds - hours * hourSeconds) / minutesSeconds);
            if (minutes <= 1) {
                return hours + ' hours ago';
            }
            return hours + ' hours and ' + minutes + ' minutes ago';
        }

        const monthSeconds = daySeconds * 30;
        if (diffInSeconds <= monthSeconds) {
            const days = Math.ceil(diffInSeconds / daySeconds) - 1;
            if (days <= 1) {
                return 'yesterday at ' + formatDate(value, 'h');
            }
            if (days < 7) {
                if (diffInSeconds % daySeconds === 0) {
                    return days + ' days ago';
                } else {
                    const hours = Math.ceil((diffInSeconds - days * daySeconds) / hourSeconds) - 1;
                    if (hours <= 1) {
                        return days + ' days ago';
                    }
                    return days + ' days and ' + Math.ceil(hours) + ' hours ago';
                }
            }
            if (days === 7) {
                return 'a week ago';
            }
            if (days === 14) {
                return '2 weeks ago';
            }
            if (days < 29) {
                return days + ' days ago';
            }
            return 'a month ago';
        }

        const yearSeconds = daySeconds * 365
        if (diffInSeconds <= yearSeconds) {
            const months = Math.ceil(diffInSeconds / monthSeconds) - 1;
            const days = Math.ceil((diffInSeconds - months * monthSeconds) / daySeconds) - 1;
            if (months <= 1) {
                if (days <= 1) {
                    return 'a month ago';
                }
                return 'a month and ' + days + ' days ago';
            }
            if (months < 6) {
                if (days <= 1) {
                    return months + ' months aho';
                }
                return months + ' months and ' + days + ' days ago';
            }
            if (months < 12) {
                return months  + ' months aho';
            }

            return 'a year ago';
        }

        return formatDate(value, 'Y-m-d');
    }
}
