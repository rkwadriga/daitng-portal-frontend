import { Component, OnInit } from '@angular/core';
import { User, UserService } from "../../services/user.service";
import { routes } from "../../config/routes";

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {
    user?: User;
    routes = routes;

    constructor(
        private readonly userService: UserService
    ) { }

    async ngOnInit() {
        this.user = await this.userService.getUser();
    }
}
