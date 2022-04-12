import { Component, OnInit } from '@angular/core';
import { User, UserService } from "./services/user.service";
import { Router } from "@angular/router";
import { Location } from '@angular/common';
import { routes } from "./config/routes";

@Component({
selector: 'app-root',
templateUrl: './app.component.html',
styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
    title = 'daitng-portal-frontend';
    routes = routes;
    showUserLinks = false;
    user: User|null = null;

    constructor(
        private readonly userService: UserService,
        private readonly router: Router,
        private readonly location: Location
    ) { }

    async ngOnInit() {
        if (!this.userService.isLogged) {
            // Go to the login page
            const currentPath = this.location.path();
            if (currentPath !== this.routes.authLogin && currentPath !== this.routes.authRegistration) {
                await this.router.navigateByUrl(this.routes.authLogin);
            }
            return;
        }
        this.userService.getUser().subscribe(user => {
            this.user = user;
        });
    }

    async logout() {
        this.toggleUserLinks();
        this.user = null;
        this.userService.logout();
        return await this.router.navigate(['/auth', 'login']);
    }

    toggleUserLinks() {
        this.showUserLinks = !this.showUserLinks;
    }
}
