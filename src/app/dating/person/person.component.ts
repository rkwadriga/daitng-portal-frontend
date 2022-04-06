import { Component, OnInit } from '@angular/core';
import { Account } from "../accounts/account.entity";
import { ActivatedRoute } from "@angular/router";
import { routes } from "../../config/routes";
import { ApiClient } from "../../services/ApiClient";
import { Notifier } from "../../services/Notifier";
import { apiUrls } from "../../config/api";

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss']
})
export class PersonComponent implements OnInit {
    account?: Account;
    routes = routes;

    constructor(
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

        apiUrls.getUserInfo.params.id = userID;
        const resp = await this.api.call(apiUrls.getUserInfo);
        if (!resp.ok) {
            this.notifier.error(resp);
            return;
        }

        this.account = new Account(resp.body);
    }

    async onLike() {
        console.log(this.account);
    }
}
