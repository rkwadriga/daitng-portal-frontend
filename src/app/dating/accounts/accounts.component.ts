import { Component, OnInit } from '@angular/core';
import { ApiClient } from "../../services/ApiClient";
import { apiUrls } from "../../config/api";
import { Account } from "./account.entity";
import { Notifier } from "../../services/Notifier";
import {routes} from "../../config/routes";

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {
    account?: Account;
    routes = routes;

    constructor(
        private readonly api: ApiClient,
        private readonly notifier: Notifier
    ) { }

    async ngOnInit() {
        const resp = await this.api.call(apiUrls.datingNextProfile);
        if (!resp.ok) {
            this.notifier.error(resp);
            return;
        }

        this.account = new Account(resp.body);
    }
}
