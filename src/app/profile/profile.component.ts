import { Component, OnInit } from '@angular/core';
import { UserService } from "../services/UserService";
import { ApiClient } from "../services/ApiClient";
import { User } from "../auth/user.entity";
import { Notifier } from "../services/Notifier";
import { routes } from "../config/routes";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    user?: User;
    routes = routes;
    isProfilePage = true;

    constructor(
        private readonly userService: UserService,
        private readonly api: ApiClient,
        private readonly notifier: Notifier
    ) { }

    async ngOnInit() {
        this.user = await this.userService.getUser();
    }
}
