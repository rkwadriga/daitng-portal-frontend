import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { KeyValueInterface } from "../interfaces/keyvalue.interface";
import { ApiService } from "./api.service";
import { apiUrls } from "../config/api";

export class Account {
    public id = '';
    public firstName = '';
    public lastName = '';
    public gender = '';
    public orientation = '';
    public avatar = '';
    public age = 0;
    public photos: string[] = [];
    public about = '';
    public showGender = '';

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

@Injectable({
    providedIn: 'root'
})
export class DatingService {
    private account = new BehaviorSubject<Account|null>(null);

    constructor(
        private readonly api: ApiService,
    ) { }

    public async current(): Promise<Account> {
        if (this.account.getValue() !== null) {
            return this.account.getValue() ?? new Account({});
        }

        return this.next();
    }

    public async next(): Promise<Account> {
        const nextAccount = new Account(await this.getNextAccount());
        this.account.next(nextAccount);

        return nextAccount;
    }

    private async getNextAccount(): Promise<Account> {
        const resp = await this.api.call(apiUrls.datingNextProfile);
        if (!resp.ok) {
            throw new Error(resp.error?.message ?? `Can not get the next account. Response code is ${resp.status}`);
        }
        return resp.body;
    }
}
