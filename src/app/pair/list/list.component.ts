import { Component, OnInit, OnDestroy } from '@angular/core';
import { routes } from "../../config/routes";
import { ApiService } from "../../services/api.service";
import { NotifierService } from "../../services/notifier.service";
import { apiUrls } from "../../config/api";
import { User, UserService } from "../../services/user.service";
import { ActivatedRoute, Router } from "@angular/router";
import { KeyValueInterface } from "../../interfaces/keyvalue.interface";
import { Message } from "../dialog/dialog.component";
import { LoggerService } from "../../services/logger.service";
import { WsMessage } from "../../services/chat.service";
import { chatSettings } from "../../config/chat.setings";
import { Subscription } from "rxjs";
import { photoSettings } from "../../config/photo.settings";

interface Dialog {
    count: number,
    messages: Message[]
}

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {
    private subscriptions = new Subscription();
    user: User | null = null;
    pairs: User[] = [];
    routes = routes;
    dialogs: {[key: string]: Dialog} = {};
    selectedPair: User | null = null;
    chatMessagesLimit = chatSettings.chatMessagesLimit;
    pairPhotoSize = photoSettings.pairsListSize;

    constructor(
        private readonly userService: UserService,
        private readonly api: ApiService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private readonly notifier: NotifierService,
        private readonly logger: LoggerService
    ) { }

    async ngOnInit() {
        // Get pairs list
        const resp = await this.api.call(apiUrls.pairsList);
        if (!resp.ok) {
            const message = 'Can not get the pairs: ' + (resp.error?.message ?? `Response status is ${resp.status}`);
            this.notifier.error(message);
            return;
        }
        resp.body.forEach((params: KeyValueInterface) => {
            this.pairs.push(new User(params));
        });

        // If this is a "/pair/:id/dialog" page - need to get the account info by ID
        const pairID = this.route.snapshot.paramMap.get('id');

        // Get current user
        this.subscriptions.add(
            this.userService.getUser().subscribe(user => {
                this.user = user;
                if (pairID !== null) {
                    this.selectPair(pairID);
                }
            })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    async selectPair(id: string) {
        if (this.user === null) {
            this.logger.error('You are not logged in to start dialog');
            return;
        }

        this.selectedPair = null;
        this.pairs.some(pair => {
            if (pair.id === id) {
                this.selectedPair = pair;
                return true;
            }
            return false;
        });
        if (this.selectedPair === null) {
            this.logger.error(`Selected user id "${id}" is not one of your pairs ids`);
            return;
        }
        if (this.dialogs[id] === undefined) {
            this.dialogs[id] = await this.getDialog();
        }
    }

    private async getDialog(): Promise<Dialog> {
        if (this.user === null || this.selectedPair === null) {
            return {count: 0, messages: []};
        }

        // Get the dialog from backend
        apiUrls.dialog.params = {
            id: this.selectedPair.id,
            limit: this.chatMessagesLimit,
            offset: 0
        };
        const resp = await this.api.call(apiUrls.dialog);
        if (!resp.ok) {
            const message = `Can not get the dialog for pair ${this.selectedPair.id}: ` + resp.error?.message ?? `Response status is ${resp.status}`;
            this.notifier.error(message);
            throw new Error(message);
        }

        // Convert messages to Message format
        let messages: Message[] = [];
        resp.body.messages.forEach((msg: WsMessage) => {
            if (this.user === null || this.selectedPair === null) {
                return;
            }
            if (typeof msg.time === 'string') {
                msg.time = new Date(msg.time);
            }
            messages.push(Object.assign(msg, {
                from: msg.from === this.selectedPair.id ? this.selectedPair : this.user,
                to: msg.to === this.user.id ? this.user : this.selectedPair,
                time: msg.time ?? new Date()
            }));
        });

        return {count: resp.body.count, messages};
    }
}
