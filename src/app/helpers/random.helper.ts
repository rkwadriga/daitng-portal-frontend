
export const getRandomNumber = (from = 1000, to = 9999): number => {
    if (from === undefined || from > to) {
        to = from;
        from = 0;
    } else if (to === from) {
        return to;
    }
    if (to === 1) {
        return Math.random();
    } else if (to === 0) {
        return 0;
    }

    const diff = to - from;
    return from + diff - Math.round(diff * Math.random());
}
