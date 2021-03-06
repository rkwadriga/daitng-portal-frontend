import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { routes } from "../../config/routes";
import { ApiService } from "../../services/api.service";
import { NotifierService } from "../../services/notifier.service";
import { apiUrls } from "../../config/api";
import { User, UserService } from "../../services/user.service";
import { Subscription } from "rxjs";
import { photoSettings } from "../../config/photo.settings";

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss', '../dating.component.scss']
})
export class PersonComponent implements OnInit, OnDestroy {
    private subscriptions = new Subscription();
    user: User | null = null;
    account: User | null = null;
    routes = routes;
    photoIndex = 0;
    photosCount = 0;
    isMatch = false;
    viewPhotoSize = photoSettings.viewSIze;

    constructor(
        private readonly userService: UserService,
        private readonly route: ActivatedRoute,
        private readonly api: ApiService,
        private readonly router: Router,
        private readonly notifier: NotifierService
    ) { }

    async ngOnInit() {
        // Get current user
        this.subscriptions.add(await this.userService.getUser().subscribe(user => this.user = user));

        const userID = this.route.snapshot.paramMap.get('id');
        if (userID === null) {
            const error = 'Missed user ID';
            this.notifier.error(error);
            throw new Error(error);
        }

        // Get dating account
        apiUrls.getUserInfo.params.id = userID;
        const resp = await this.api.call(apiUrls.getUserInfo);
        if (!resp.ok) {
            this.notifier.error(resp);
            return;
        }
        this.account = new User(resp.body);

        // Remember photos count
        this.photosCount = this.account.photos.length;
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    async onLike() {
        if (this.account === null) {
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

        // Mark the account as liked to disable "like" button
        this.account.isLiked = true;

        if (resp.body.isPair) {
            // View "it's match!" pop-up
            this.isMatch = true;
        } else {
            await this.router.navigateByUrl(routes.datingAccounts);
        }
    }

    async onCloseMatchPopup() {
        this.isMatch = false;
        await this.router.navigateByUrl(routes.datingAccounts);
    }
}
