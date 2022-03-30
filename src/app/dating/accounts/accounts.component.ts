import { Component, OnInit } from '@angular/core';
import {UserService} from "../../services/UserService";
import {User} from "../../auth/user.entity";

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {
    user?: User;

    constructor(
        private readonly userService: UserService
    ) { }

    async ngOnInit(): Promise<void> {
        this.user = await this.userService.getUser();
    }
}
