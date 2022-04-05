import { Component, OnInit } from '@angular/core';
import { ApiClient } from "../../services/ApiClient";
import { apiUrls } from "../../config/api";
import { Account } from "./account.entity";
import { Notifier } from "../../services/Notifier";
import { KeyValueInterface } from "../../interfaces/keyvalue.interface";

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {
    account?: Account;

    constructor(
        private readonly api: ApiClient,
        private readonly notifier: Notifier
    ) { }

    async ngOnInit() {
        const resp = await this.api.call(apiUrls.datingNextAccount);
        if (!resp.ok) {
            this.notifier.error(resp);
            return;
        }
        this.account = resp.body;
    }
}
