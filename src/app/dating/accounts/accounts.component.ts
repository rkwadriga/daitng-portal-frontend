import { Component, OnInit } from '@angular/core';
import { ApiClient } from "../../services/ApiClient";
import { apiUrls } from "../../config/api";
import { Account } from "./account.entity";
import { Notifier } from "../../services/Notifier";
import { routes } from "../../config/routes";
import { UserService } from "../../services/UserService";
import { User } from "../../auth/user.entity";

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {
    user?: User;
    account?: Account;
    routes = routes;

    constructor(
        private readonly userService: UserService,
        private readonly api: ApiClient,
        private readonly notifier: Notifier
    ) { }

    async ngOnInit() {
        // Get current user
        this.user = await this.userService.getUser();

        // Get current dating account
        const resp = await this.api.call(apiUrls.datingCurrentProfile);
        if (!resp.ok) {
            this.notifier.error(resp);
            return;
        }

        this.account = new Account(resp.body);
    }

    async onLike() {
        if (this.account === undefined) {
            const message = 'The account for like is not specified';
            this.notifier.error(message);
            throw new Error(message);
        }

        // Like current profile
        apiUrls.datingLikeProfile.params.id = this.account.id;
        let resp = await this.api.call(apiUrls.datingLikeProfile);
        if (!resp.ok) {
            const message = resp.error?.message ?? `Can not like user ${this.account.id}`;
            this.notifier.error(message);
            throw new Error(message);
        }

        // Get the next dating profile
        resp = await this.api.call(apiUrls.datingNextProfile);
        if (!resp.ok) {
            this.notifier.error(resp);
            return;
        }

        this.account = new Account(resp.body);
    }

    async onNext() {
        // Get the next dating profile
        const resp = await this.api.call(apiUrls.datingNextProfile);
        if (!resp.ok) {
            this.notifier.error(resp);
            return;
        }

        this.account = new Account(resp.body);
    }
}
