import { KeyValueInterface } from "../../interfaces/keyvalue.interface";

export class Account {
    public id = '';
    public firstName = '';
    public lastName = '';
    public gender = '';
    public avatar = '';
    public age = 0;

    constructor(params: KeyValueInterface) {
        Object.assign(this, params);
    }

    get name(): string {
        let name = '';

        if (this.firstName !== undefined) {
            name += this.firstName;
        }
        if (this.lastName !== undefined) {
            if (this.firstName !== undefined) {
                name += ' ';
            }
            name += this.lastName;
        }

        return name;
    }
}