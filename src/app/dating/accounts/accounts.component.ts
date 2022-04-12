import { Component, OnInit } from '@angular/core';
import { ApiService } from "../../services/api.service";
import { apiUrls } from "../../config/api";
import { NotifierService } from "../../services/notifier.service";
import { routes } from "../../config/routes";
import { User, UserService } from "../../services/user.service";
import { DatingService } from "../../services/dating.service";

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {
    user: User | null = null;
    account: User | null = null;
    routes = routes;
    isMatch = false;

    constructor(
        private readonly userService: UserService,
        private readonly datingService: DatingService,
        private readonly api: ApiService,
        private readonly notifier: NotifierService
    ) { }

    async ngOnInit() {
        // Get current user
        this.userService.getUser().subscribe(user => {
            this.user = user;
        });

        try {
            this.account = await this.datingService.current();
        } catch (e) {
            this.notifier.error(e instanceof Error ? e.message : 'Can not get the nex account');
        }
    }

    async onLike() {
        if (this.account === null) {
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

        if (resp.body.isPair) {
            // View "it's match!" pop-up
            this.isMatch = true;
        } else {
            await this.onNext();
        }
    }

    async onNext() {
        try {
            this.account = await this.datingService.next();
        } catch (e) {
            this.notifier.error(e instanceof Error ? e.message : 'Can not get the nex account');
        }
    }

    async onCloseMatchPopup() {
        this.isMatch = false;
        await this.onNext();
    }
}
