import {KeyValueInterface} from "../interfaces/keyvalue.interface";
import {EnumInterface} from "../interfaces/enum.interface";

export const inArray = (elem: any, arr: any[]): boolean => {
    return arr.indexOf(elem) !== -1;
}

export const removeElement = (element: any, arr: any[]): number => {
    const index = arr.indexOf(element);
    if (index !== -1) {
        removeByIndex(index, arr);
    }
    return index;
}

export const removeByIndex = (index: number, arr: any[]): void => {
    arr.splice(index, 1);
}

export const enumsValuesToArray = (values: EnumInterface[]): any[] => {
    let result: any[] = [];

    for (const enumVal of values) {
        result.push(enumVal.value);
    }

    return result;
}

export const enumsKeysToArray = (values: EnumInterface[]): string[] => {
    let result: string[] = [];

    for (const enumVal of values) {
        result.push(enumVal.name);
    }

    return result;
}
