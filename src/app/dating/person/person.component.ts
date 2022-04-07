import { Component, OnInit } from '@angular/core';
import { Account } from "../accounts/account.entity";
import { ActivatedRoute } from "@angular/router";
import { routes } from "../../config/routes";
import { ApiClient } from "../../services/ApiClient";
import { Notifier } from "../../services/Notifier";
import { apiUrls } from "../../config/api";
import {UserService} from "../../services/UserService";
import {User} from "../../auth/user.entity";

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss']
})
export class PersonComponent implements OnInit {
    user?: User;
    account?: Account;
    routes = routes;

    constructor(
        private readonly userService: UserService,
        private readonly route: ActivatedRoute,
        private readonly api: ApiClient,
        private readonly notifier: Notifier
    ) { }

    async ngOnInit() {
        const userID = this.route.snapshot.paramMap.get('id');
        if (userID === null) {
            const error = 'Missed user ID';
            this.notifier.error(error);
            throw new Error(error);
        }

        // Get current user
        this.user = await this.userService.getUser();

        // Get dating account
        apiUrls.getUserInfo.params.id = userID;
        const resp = await this.api.call(apiUrls.getUserInfo);
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

        apiUrls.datingLikeProfile.params.id = this.account.id;
        const response = await this.api.call(apiUrls.datingLikeProfile);
        if (!response.ok) {
            const message = response.error?.message ?? `Can not like user ${this.account.id}`;
            this.notifier.error(message);
            throw new Error(message);
        }
    }
}
