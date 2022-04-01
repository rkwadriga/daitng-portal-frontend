import { Component, OnInit } from '@angular/core';
import { UserService } from "../services/UserService";
import { ApiClient } from "../services/ApiClient";
import { apiUrls } from "../config/api";
import { User } from "../auth/user.entity";
import { Notifier } from "../services/Notifier";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    user?: User;

    constructor(
        private readonly userService: UserService,
        private readonly api: ApiClient,
        private readonly notifier: Notifier
    ) { }

    async ngOnInit() {
        this.user = await this.userService.getUser();
    }

    async onSave() {
        console.log(this.user?.avatar);
    }
}
