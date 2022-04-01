import { Component, OnInit } from '@angular/core';
import {ApiClient} from "../../services/ApiClient";
import {apiUrls} from "../../config/api";
import {Account} from "./account.entity";
import {Notifier} from "../../services/Notifier";
import {KeyValueInterface} from "../../interfaces/keyvalue.interface";

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {
    accounts: Account[] = [];

    constructor(
        private readonly api: ApiClient,
        private readonly notifier: Notifier
    ) { }

    async ngOnInit() {
        const resp = await this.api.call(apiUrls.accountsList);
        if (!resp.ok) {
            this.notifier.error(resp);
            return;
        }
        resp.body.forEach((params: KeyValueInterface) => {
            this.accounts.push(new Account(params))
        })
        console.log(this.accounts);
    }
}
