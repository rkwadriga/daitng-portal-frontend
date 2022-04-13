import { Component, OnInit, Input } from '@angular/core';
import { User, UserService } from "../../services/user.service";
import { routes } from "../../config/routes";
import { ChatService, WsMessage } from "../../services/chat.service";
import { LoggerService } from "../../services/logger.service";

export interface Message {
    id: string;
    from: User;
    to: User;
    time: Date;
    text: string;
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
    user: User | null = null;
    @Input() pair: User | null = null;
    @Input() messages: Message[] = [];
    routes = routes;
    msg = '';

    constructor(
        private readonly userService: UserService,
        private readonly chat: ChatService,
        private readonly logger: LoggerService
    ) { }

    ngOnInit(): void {
        this.userService.getUser().subscribe(user => {
            this.user = user;
            this.chat.onMessage().subscribe((message: WsMessage) => {
                if (this.pair === null || user === null) {
                    this.logger.log('Its impossible to get message before select the pair');
                    return;
                }

                if (typeof message.time === 'string') {
                    message.time = new Date(message.time);
                }

                // Chek if this message already given
                let inArray = false;
                this.messages.some(msg => {
                    if (msg.id === message.id) {
                        return inArray = true;
                    } else {
                        return false;
                    }
                });

                if (!inArray) {
                    this.messages.push({
                        id: message.id,
                        from: this.pair,
                        to: user,
                        time: message.time ?? new Date(),
                        text: message.msg
                    });
                }
            })
        });
    }

    onSend() {
        if (this.pair === null || this.user === null) {
            this.logger.log('You cannot send the message to nowhere');
            return;
        }
        const newMessage  = {
            id: Math.random().toString(),
            to: this.pair.id,
            msg: this.msg
        };
        this.chat.send(newMessage);
        this.messages.push({
            id: newMessage.id,
            from: this.user,
            to: this.pair,
            time: new Date(),
            text: this.msg
        });
        this.msg = '';
    }
}
