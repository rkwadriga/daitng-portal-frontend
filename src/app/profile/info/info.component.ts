import { Component, OnInit, OnDestroy } from '@angular/core';
import { User, UserService } from "../../services/user.service";
import { routes } from "../../config/routes";
import { Subscription } from "rxjs";
import { photoSettings } from "../../config/photo.settings";

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit, OnDestroy {
    private subscriptions = new Subscription();
    user: User | null = null;
    routes = routes;
    profilePhotoSize = photoSettings.profileSize;

    constructor(
        private readonly userService: UserService
    ) { }

    ngOnInit(): void {
        this.subscriptions.add(this.userService.getUser().subscribe(user => this.user = user));
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}
