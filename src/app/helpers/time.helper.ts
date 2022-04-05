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
