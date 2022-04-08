import { Injectable } from "@angular/core";
import { Response as HttpResponse } from './api.service';

enum MessageType {
    Error,
    Alert,
    Info
}

@Injectable({
    providedIn: 'root'
})
export class Notifier {
    error(message: HttpResponse | string): void {
        this.viewMsg(message, MessageType.Error);
    }

    alert(message: HttpResponse | string): void {
        this.viewMsg(message, MessageType.Alert);
    }

    info(message: HttpResponse | string): void {
        this.viewMsg(message, MessageType.Info);
    }

    private viewMsg(message: HttpResponse | string, type: MessageType): void {
        const msg = typeof message === 'string' ? message : `${message.message} (${message.status})`;
        alert(msg);
    }
}
