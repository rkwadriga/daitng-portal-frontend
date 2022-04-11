export const dateFormatPattern = /^\d\d\d\d-\d\d-\d\d$/;

export const isDateValid = (date: string, isPast = true): boolean => {
    const matches = date.match(dateFormatPattern);
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
    if (typeof from === 'string') {
        from = new Date(from);
    }
    if (typeof to === 'string') {
        to = new Date(to);
    } else if (to === null) {
        to = new Date();
    }
    return to.valueOf() - from.valueOf();
}

export const yearsFromDate = (date: Date | string): number => {
    return Math.ceil(getDatesDiff(date) / (1000 * 3600 * 24 * 365));
}

export const formatDate = (date: Date, format = 'Y-m-d H:i:s'): string => {
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
