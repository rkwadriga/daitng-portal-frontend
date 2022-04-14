import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from "./user.service";
import {SocketService} from "./socket.service";

export interface WsMessage {
    id: string;
    from: string;
    to: string;
    text: string;
    time?: Date | string;
}

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    constructor(
        private readonly socketService: SocketService,
        private readonly userService: UserService
    ) {
        this.userService.getUser().subscribe(user => {
            if (user !== null) {
                this.socketService.init(user.id);
            }
        });
    }

    onMessage(): Observable<WsMessage> {
        return new Observable<WsMessage>((subscriber) => {
            this.socketService.onMessage().subscribe(message => {
                subscriber.next(JSON.parse(message.data));
            });
        });
    }

    send(message: WsMessage) {
        this.socketService.send(JSON.stringify(message));
    }
}
