import { Injectable } from "@angular/core";
import { Response as HttpResponse } from './api.service';
import { BehaviorSubject } from "rxjs";

export enum MessageType {
    Error,
    Alert,
    Info
}

export interface Notification {
    type: MessageType,
    message: string,
}

@Injectable({
    providedIn: 'root'
})
export class NotifierService {
    private notification = new BehaviorSubject<Notification | null>(null);

    error(message: HttpResponse | string): void {
        this.viewMsg(message, MessageType.Error);
    }

    alert(message: HttpResponse | string): void {
        this.viewMsg(message, MessageType.Alert);
    }

    info(message: HttpResponse | string): void {
        this.viewMsg(message, MessageType.Info);
    }

    getNotification(): BehaviorSubject<Notification | null> {
        return this.notification;
    }

    closeNotification(): void {
        this.notification.next(null);
    }

    private viewMsg(message: HttpResponse | string, type: MessageType): void {
        const msg = typeof message === 'string' ? message : `${message.message} (${message.status})`;
        this.notification.next({type, message: msg});
    }
}
