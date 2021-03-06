export const DATETIME_FORMAT_PATTERN = /^\d\d\d\d-\d\d-\d\d$/;

export const DATETIME_FULL_FORMAT_PATTERN = /(\w+ \w+ \d+) (\d+) ([\w\d: +\(\)]+)/;

export const DATETIME_FORMAT = 'Y-m-d H:i:s';

export const DATE_FORMAT = 'Y-m-d';

export const toDate = (time: Date | string | null): Date => {
    if (typeof time === 'string') {
        return new Date(time);
    } else if (time === null) {
        return new Date();
    } else {
        return time;
    }
}

export const isDateValid = (date: string, isPast = true): boolean => {
    const matches = date.match(DATETIME_FORMAT_PATTERN);
    if (!matches) {
        return false;
    }

    const checkDate = new Date(date);
    if (!checkDate.getFullYear()) {
        return false;
    }

    return !isPast || checkDate < new Date();
};

export const getDatesDiff = (from: Date | string, to: Date | string | null = null): number => {
    return toDate(to).valueOf() - toDate(from).valueOf();
}

export const yearsFromDate = (date: Date | string | null): number => {
    if (date === null) {
        return 0;
    }

    date = toDate(date);
    const now = new Date();
    const yearsDiff = now.getFullYear() - date.getFullYear();
    if (yearsDiff <= 0) {
        return 0;
    }

    const [cMonth, rMonth] = [now.getMonth(), date.getMonth()];
    if (cMonth > rMonth) {
        return yearsDiff;
    }
    if (cMonth < rMonth) {
        return yearsDiff - 1;
    }

    const [cDate, rDate] = [now.getDate(), date.getDate()];
    if (cDate > rDate) {
        return yearsDiff;
    }
    if (cDate < rDate) {
        return yearsDiff - 1;
    }

    const [cHours, rHours] = [now.getHours(), date.getHours()];
    if (cHours > rHours) {
        return yearsDiff;
    }
    if (cHours < rHours) {
        return yearsDiff - 1;
    }

    const [cMinutes, rMinutes] = [now.getMinutes(), date.getMinutes()];
    if (cMinutes > rMinutes) {
        return yearsDiff;
    }
    if (cMinutes < rMinutes) {
        return yearsDiff - 1;
    }

    const [cSeconds, rSeconds] = [now.getSeconds(), date.getSeconds()];
    if (cSeconds >= rSeconds) {
        return yearsDiff;
    }
    return yearsDiff - 1;
}

export const formatDate = (date: Date | string | null = null, format: string | null = null): string => {
    date = toDate(date);
    if (format === null) {
        format = DATETIME_FORMAT;
    }

    let result = format;

    if (format.indexOf('Y') !== -1) {
        result = result.replace('Y', date.getFullYear().toString());
    } else if (format.indexOf('y') !== -1) {
        result = result.replace('y', date.getFullYear().toString().substring(2));
    }

    if (format.indexOf('M') !== -1) {
        let month = '';
        switch (date.getMonth()) {
            case 0:
                month = 'January';
                break;
            case 1:
                month = 'February';
                break;
            case 2:
                month = 'March';
                break;
            case 3:
                month = 'April';
                break;
            case 4:
                month = 'May';
                break;
            case 5:
                month = 'June';
                break;
            case 6:
                month = 'July';
                break;
            case 7:
                month = 'August';
                break;
            case 8:
                month = 'September';
                break;
            case 9:
                month = 'October';
                break;
            case 10:
                month = 'November';
                break;
            case 11:
                month = 'December';
                break;
        }
        result = result.replace('M', month);
    } else if (format.indexOf('m') !== -1) {
        const month = date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1).toString();
        result = result.replace('m', month);
    }

    if (format.indexOf('D') !== -1) {
        let day = '';
        switch (date.getDay()) {
            case 0:
                day = 'Sunday';
                break;
            case 1:
                day = 'Monday';
                break;
            case 2:
                day = 'Tuesday';
                break;
            case 3:
                day = 'Wednesday';
                break;
            case 4:
                day = 'Thursday';
                break;
            case 5:
                day = 'Friday';
                break;
            case 6:
                day = 'Saturday';
                break;
        }
        result = result.replace('D', day);
    } else if (format.indexOf('d') !== -1) {
        const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate().toString();
        result = result.replace('d', day);
    }

    if (format.indexOf('H') !== -1) {
        const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours().toString();
        result = result.replace('H', hours);
    } else if (format.indexOf('h') !== -1) {
        let hours = '';
        if (date.getHours() === 0) {
            hours = '12 AM';
        } else if (date.getHours() < 12) {
            hours = date.getHours() + ' AM';
        } else if (date.getHours() === 12) {
            hours = '12 PM';
        } else {
            hours = (date.getHours() - 12) + ' PM';
        }
        result = result.replace('h', hours);
    }

    if (format.indexOf('i') !== -1) {
        const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes().toString();
        result = result.replace('i', minutes);
    }

    if (format.indexOf('s') !== -1) {
        const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds().toString();
        result = result.replace('s', seconds);
    }

    return result;
}

export const addYears = (years: number, date: Date | string | null = null): Date => {
    const stringDate = toDate(date).toString();
    const match = stringDate.match(DATETIME_FULL_FORMAT_PATTERN);
    if (match === null) {
        return addDays(years * 365, date);
    }

    const year = Number(match[2]) + years;
    if (year > 0) {
        return new Date(stringDate.replace(DATETIME_FULL_FORMAT_PATTERN, `$1 ${year} $3`));
    }

    return new Date();
}

export const addDays = (days: number, date: Date | string | null = null): Date => {
    return addHours(days * 24, date);
}

export const addHours = (hours: number, date: Date | string | null = null): Date => {
    return addMinutes(hours * 60, date);
}

export const addMinutes = (minutes: number, date: Date | string | null = null): Date => {
    return addSeconds(minutes * 60, date);
}

export const addSeconds = (seconds: number, to: Date | string | null = null): Date => {
    return new Date(toDate(to).valueOf() + seconds * 1000);
}

export const transformToSpend = (value: Date | string): string => {
    if (typeof value === 'string') {
        if (!isDateValid(value)) {
            return '';
        }
        value = new Date(value);
    }
    const diffInSeconds = Math.ceil(getDatesDiff(value) / 1000)  - 1;
    if (diffInSeconds < -1) {
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
        const minutes = Math.ceil(diffInSeconds / minutesSeconds) - 1;
        if (minutes <= 1) {
            return 'a minute ago';
        }
        return `${minutes} minutes ago`;
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
        if (days === 0) {
            return 'yesterday at ' + formatDate(value, 'h');
        }
        if (days < 7) {
            const periodWord = days === 1 ? 'day' : 'days';
            if (diffInSeconds % daySeconds === 0) {
                return `${days} ${periodWord} ago`;
            } else {
                const hours = Math.ceil((diffInSeconds - days * daySeconds) / hourSeconds) - 1;
                if (hours <= 1) {
                    return `${days} ${periodWord} ago`;
                }
                return `${days} ${periodWord} and ` + Math.ceil(hours) + ' hours ago';
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
        if (months === 0) {
            return days + ' days ago';
        }
        const periodWord = months === 1 ? 'month' : 'months';
        if (months < 6) {
            if (days <= 1) {
                return `${months} ${periodWord} ago`;
            }
            return `${months} ${periodWord} and` + days + ' days ago';
        }
        if (months < 12) {
            return `${months} ${periodWord} ago`;
        }

        return 'a year ago';
    }

    return formatDate(value, 'Y-m-d');
}
