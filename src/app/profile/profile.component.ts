import { Component, OnInit } from '@angular/core';
import { User, UserService } from "../services/UserService";
import { routes } from "../config/routes";
import { Location } from '@angular/common';

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
        private readonly location: Location
    ) { }

    async ngOnInit() {
        this.user = await this.userService.getUser();
        this.isProfilePage = this.location.path() === routes.myProfile;
    }
}
