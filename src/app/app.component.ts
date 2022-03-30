import {Component, OnInit} from '@angular/core';
import {User} from "./auth/user.entity";
import {UserService} from "./services/UserService";
import {Router} from "@angular/router";

@Component({
selector: 'app-root',
templateUrl: './app.component.html',
styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
    title = 'daitng-portal-frontend';

    user?: User;

    constructor(
        private readonly userService: UserService,
        private readonly router: Router
    ) {}

    async ngOnInit() {
        if (!this.userService.isLogged) {
            // Go to the login page
            await this.router.navigate(['/auth', 'login']);
            return;
        }

        console.log('AppComponent');
        this.user = await this.userService.getUser();
    }

    async logout() {
        this.user = undefined;
        this.userService.logout();

        return await this.router.navigate(['/auth', 'login']);
    }
}
