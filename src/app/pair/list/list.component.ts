import { Component, OnInit } from '@angular/core';
import { routes } from "../../config/routes";
import { ApiService } from "../../services/api.service";
import { NotifierService } from "../../services/notifier.service";
import { apiUrls } from "../../config/api";
import { User, UserService } from "../../services/user.service";
import { ActivatedRoute, Router } from "@angular/router";
import { KeyValueInterface } from "../../interfaces/keyvalue.interface";
import { Message } from "../dialog/dialog.component";
import {LoggerService} from "../../services/logger.service";

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
    user: User | null = null;
    pairs: User[] = [];
    routes = routes;
    dialogs: {[key: string]: Message[]} = {};
    selectedPair: User | null = null;

    constructor(
        private readonly userService: UserService,
        private readonly api: ApiService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private readonly notifier: NotifierService
    ) { }

    async ngOnInit() {
        // Get current user
        await this.userService.getUser().subscribe(user => {
            this.user = user;
        })
        // Get pairs list
        const resp = await this.api.call(apiUrls.pairsList);
        if (!resp.ok) {
            const message = 'Can not get the pairs: ' + (resp.error?.message ?? `Response status is ${resp.status}`);
            this.notifier.error(message);
            throw new Error(message);
        }
        resp.body.forEach((params: KeyValueInterface) => {
            this.pairs.push(new User(params));
        });

        const pairID = this.route.snapshot.paramMap.get('id');
        if (pairID !== null) {
            await this.selectPair(pairID);
        }
    }

    async selectPair(id: string) {
        if (this.user === null) {
            const message = 'You are not logged in to start dialog';
            this.notifier.error(message);
            throw new Error(message);
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
            this.notifier.error(`Selected user id "${id}" is not one of your pairs ids`);
            return;
        }
        this.dialogs[id] = [
            {
                from: this.user,
                to: this.selectedPair,
                time: new Date(),
                text: 'Hello how are you?'
            },
            {
                from: this.selectedPair,
                to: this.user,
                time: new Date(),
                text: "I'm fine. And you?"
            }
        ];
    }
}
