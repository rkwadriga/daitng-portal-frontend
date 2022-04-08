import { Component, OnInit } from '@angular/core';
import { ApiService } from "../../services/api.service";
import { apiUrls } from "../../config/api";
import { NotifierService } from "../../services/notifier.service";
import { routes } from "../../config/routes";
import { User, UserService } from "../../services/user.service";
import { Account, DatingService } from "../../services/dating.service";

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
        private readonly datingService: DatingService,
        private readonly api: ApiService,
        private readonly notifier: NotifierService
    ) { }

    async ngOnInit() {
        // Get current user
        this.user = await this.userService.getUser();

        try {
            this.account = await this.datingService.current();
        } catch (e) {
            this.notifier.error(e instanceof Error ? e.message : 'Can not get the nex account');
        }
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

        await this.onNext();
    }

    async onNext() {
        try {
            this.account = await this.datingService.next();
        } catch (e) {
            this.notifier.error(e instanceof Error ? e.message : 'Can not get the nex account');
        }
    }
}
