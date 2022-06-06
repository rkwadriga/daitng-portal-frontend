
export const getRandomNumber = (from = 1000, to = 9999): number => {
    if (from >= to) {
        return to;
    }
    if (to <= 1) {
        return Math.round(Math.random());
    }

    const diff = to - from;
    let order = 0, pow = 0;
    while (pow <= diff % 10) {
        pow = Math.pow(10, ++order);
    }

    return Math.round(from + diff * Math.random() * Math.pow(10, order - 1) / order);
}
