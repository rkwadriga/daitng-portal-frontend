import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { User, UserService } from "./services/user.service";
import { Router } from "@angular/router";
import { Location } from '@angular/common';
import { routes } from "./config/routes";
import { Subscription } from "rxjs";
import { photoSettings } from "./config/photo.settings";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    private subscriptions = new Subscription();
    @HostListener('document:click', ['$event'])
    documentClick(event: MouseEvent) {
        this.toggleDropdown('page', event);
    }

    @ViewChild("menuBar") menuBar?: ElementRef;
    @ViewChild("accountBar") accountBar?: ElementRef;

    title = 'daitng-portal-frontend';
    routes = routes;
    user: User | null = null;
    avatarSize = photoSettings.avatarSize;
    dropdowns = {
        menu: false,
        account: false
    }

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

        this.subscriptions.add(this.userService.getUser().subscribe(user => this.user = user));
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    async logout() {
        this.user = null;
        this.userService.logout();
        return await this.router.navigate(['/auth', 'login']);
    }

    toggleDropdown(item: string, event?: any) {
        if (event?.target !== undefined
            && event.target !== this.menuBar?.nativeElement
            && event.target !== this.accountBar?.nativeElement
            && event?.target?.parentElement !== this.accountBar?.nativeElement
        ) {
            this.dropdowns.menu = false;
            this.dropdowns.account = false;
            return;
        }

        if (item === 'menu') {
            this.dropdowns.menu = !this.dropdowns.menu;
            this.dropdowns.account = false;
        } else if (item === 'account') {
            this.dropdowns.account = !this.dropdowns.account;
            this.dropdowns.menu = false;
        }
    }
}
