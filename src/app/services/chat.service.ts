import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { environment } from "../../environments/environment";
import { UserService } from "./user.service";

export interface WsMessage {
    id: string;
    to: string;
    msg: string;
    time?: Date | string;
}

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    socket: any;

    constructor(
        private readonly userService: UserService
    ) {
        this.userService.getUser().subscribe(user => {
            this.socket = io(environment.socketUrl + `?client=${user?.id}`);
        });
    }

    onMessage() {
        return new Observable<WsMessage>((subscriber) => {
            this.socket.on('message', (message: WsMessage) => {
                subscriber.next(message);
            })
        });
    }

    send(message: WsMessage) {
        this.socket.emit('message', {
            client: message.to,
            msg: message.msg,
            time: message.time ?? new Date()
        });
    }
}
