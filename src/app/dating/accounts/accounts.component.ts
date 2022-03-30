import { Component, OnInit } from '@angular/core';
import {UserService} from "../../services/UserService";
import {User} from "../../auth/user.entity";
import {Router} from "@angular/router";

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {
    user?: User;

    constructor(
        private readonly userService: UserService,
        private readonly router: Router
    ) { }

    async ngOnInit(): Promise<void> {
        /*if (!this.userService.isLogged) {
            // Go to the login page
            await this.router.navigate(['/auth', 'login']);
            return;
        }*/
        this.user = this.userService.user;
    }

}
