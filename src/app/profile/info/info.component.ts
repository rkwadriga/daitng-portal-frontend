import { Component, OnInit } from '@angular/core';
import { User, UserService } from "../../services/user.service";
import { routes } from "../../config/routes";

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {
    user: User | null = null;
    routes = routes;

    constructor(
        private readonly userService: UserService
    ) { }

    ngOnInit(): void {
        this.userService.getUser().subscribe(user => {
            this.user = user;
        });
    }
}
