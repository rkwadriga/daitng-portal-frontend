import { Component, OnInit, OnDestroy } from '@angular/core';
import { Notification, NotifierService, MessageType } from "../services/notifier.service";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-notification-popup',
  templateUrl: './notification-popup.component.html',
  styleUrls: ['./notification-popup.component.scss']
})
export class NotificationPopupComponent implements OnInit, OnDestroy {
    private subscriptions = new Subscription();
    notification: Notification | null = null;

    constructor(
        private readonly notifier: NotifierService
    ) { }

    ngOnInit(): void {
        this.subscriptions.add(
            this.notifier.getNotification().subscribe(notification => this.notification = notification)
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    close() {
        this.notifier.closeNotification();
    }

    get title(): string {
        if (this.notification === null) {
            return '';
        }
        switch (this.notification.type) {
            case MessageType.Alert:
                return 'Alert!';
            case MessageType.Error:
                return 'Error';
            default:
                return 'Info';
        }
    }

    get color(): string {
        if (this.notification === null) {
            return 'white';
        }
        switch (this.notification.type) {
            case MessageType.Alert:
                return 'orange';
            case MessageType.Error:
                return 'red';
            default:
                return 'blue';
        }
    }
}
