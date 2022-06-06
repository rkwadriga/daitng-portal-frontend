
export const getRandomNumber = (from = 1000, to = 9999): number => {
    if (from >= to || to <= 1) {
        return to;
    }

    let order = 0, i = 1, j = 0;
    while (order === 0) {
        to > (i *= 10) ? j++ : order = j + 1;
    }

    let randomNum = Math.round(Math.random() * Math.pow(10, order));
    if (randomNum > to) {
        return randomNum - to;
    }
    if (randomNum === to) {
        return to;
    }
    return from + randomNum <= to ? from + randomNum : randomNum;
}
