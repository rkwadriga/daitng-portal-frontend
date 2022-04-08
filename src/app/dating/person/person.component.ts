import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { routes } from "../../config/routes";
import { ApiService } from "../../services/api.service";
import { Notifier } from "../../services/Notifier";
import { apiUrls } from "../../config/api";
import { User, UserService } from "../../services/user.service";
import { Account } from "../../services/dating.service";

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss']
})
export class PersonComponent implements OnInit {
    user?: User;
    account?: Account;
    routes = routes;
    photoIndex = 0;
    photosCount = 0;
    liked = false;

    constructor(
        private readonly userService: UserService,
        private readonly route: ActivatedRoute,
        private readonly api: ApiService,
        private readonly notifier: Notifier
    ) { }

    async ngOnInit() {
        const userID = this.route.snapshot.paramMap.get('id');
        if (userID === null) {
            const error = 'Missed user ID';
            this.notifier.error(error);
            throw new Error(error);
        }

        // Get current user
        this.user = await this.userService.getUser();

        // Get dating account
        apiUrls.getUserInfo.params.id = userID;
        const resp = await this.api.call(apiUrls.getUserInfo);
        if (!resp.ok) {
            this.notifier.error(resp);
            return;
        }
        this.account = new Account(resp.body);

        // Remember photos count
        this.photosCount = this.account.photos.length;
    }

    async onLike() {
        if (this.account === undefined) {
            const message = 'The account for like is not specified';
            this.notifier.error(message);
            throw new Error(message);
        }

        apiUrls.datingLikeProfile.params.id = this.account.id;
        const resp = await this.api.call(apiUrls.datingLikeProfile);
        if (!resp.ok) {
            const message = resp.error?.message ?? `Can not like user ${this.account.id}`;
            this.notifier.error(message);
            throw new Error(message);
        }

        this.liked = true;
    }
}
