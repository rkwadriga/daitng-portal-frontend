import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ApiService } from "./api.service";
import { apiUrls } from "../config/api";
import { User } from "./user.service";

@Injectable({
    providedIn: 'root'
})
export class DatingService {
    private account = new BehaviorSubject<User|null>(null);

    constructor(
        private readonly api: ApiService,
    ) { }

    public async current(): Promise<User> {
        if (this.account.getValue() !== null) {
            return this.account.getValue() ?? new User({});
        }

        return this.next();
    }

    public async next(): Promise<User> {
        const nextAccount = await this.getNextAccount();
        this.account.next(nextAccount);

        return nextAccount;
    }

    private async getNextAccount(): Promise<User> {
        const resp = await this.api.call(apiUrls.datingNextProfile);
        if (!resp.ok) {
            throw new Error(resp.error?.message ?? `Can not get the next account. Response code is ${resp.status}`);
        }
        return new User(resp.body);
    }
}
