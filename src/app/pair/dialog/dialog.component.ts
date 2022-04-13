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

                // Chek if this message already given
                let inArray = false;
                this.messages.some(msg => {
                    if (msg.id === message.id) {
                        return inArray = true;
                    } else {
                        return false;
                    }
                });
                // And if not - add it to page
                if (!inArray) {
                    if (typeof message.time === 'string') {
                        message.time = new Date(message.time);
                    }
                    this.messages.push({
                        id: message.id,
                        from: this.pair,
                        to: user,
                        time: message.time ?? new Date(),
                        text: message.text
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
            from: this.user.id,
            to: this.pair.id,
            text: this.msg,
            time: new Date()
        };
        this.chat.send(newMessage);
        this.messages.push(Object.assign(newMessage, {from: this.user, to: this.pair}));
        this.msg = '';
    }
}
