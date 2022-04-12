import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { environment } from "../../environments/environment";
import { UserService } from "./user.service";

export interface Message {
    to: string,
    msg: string,
    time?: Date
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
        return new Observable<Message>((subscriber) => {
            this.socket.on('message', (message: Message) => {
                subscriber.next(message);
            })
        });
    }

    send(data: Message) {
        this.socket.emit('message', {
            client: data.to,
            msg: data.msg,
            time: data.time ?? new Date()
        });
    }
}
