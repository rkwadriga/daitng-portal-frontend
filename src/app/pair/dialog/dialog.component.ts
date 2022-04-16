import { Component, OnInit, Input } from '@angular/core';
import { User, UserService } from "../../services/user.service";
import { routes } from "../../config/routes";
import { ChatService, WsMessage } from "../../services/chat.service";
import { LoggerService } from "../../services/logger.service";
import {transformToSpend} from "../../helpers/time.helper";
import {NotifierService} from "../../services/notifier.service";

export interface Message {
    id: string;
    from: User;
    to: User;
    time: Date;
    text: string;
    transformedTime?: string
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
    user: User | null = null;
    @Input() pair: User | null = null;
    @Input() messagesCount = 0;
    @Input() messages: Message[] = [];
    routes = routes;
    msg = '';

    constructor(
        private readonly userService: UserService,
        private readonly chat: ChatService,
        private readonly notifier: NotifierService,
        private readonly logger: LoggerService
    ) { }

    ngOnInit(): void {
        this.userService.getUser().subscribe(user => {
            this.user = user;
        });
        this.chat.onMessage().subscribe((message: WsMessage) => {
            this.getMessage(message);
        });
        // Sort messages
        this.messages.sort((msg1, msg2) => {
            return msg1.time > msg2.time ? 1 : -1;
        });
        // Prepare messages (set time persistent transformation)
        this.messages.forEach(msg => {
            this.prepareMessage(msg);
        });
        console.log(this.messagesCount);
    }

    onSend(): void {
        this.sendMessage();
    }

    onScroll(): void {
        console.log('Scroll!');
    }

    private addMessage(msg: Message): void {
        this.messages.splice(0, 1);
        this.messages.push(msg);
        // Prepare message (set time persistent transformation)
        this.prepareMessage(msg);
    }

    private prepareMessage(msg: Message): void {
        setInterval(() => {
            msg.transformedTime = transformToSpend(msg.time);
        }, 10000);
    }

    private sendMessage(): void {
        if (this.pair === null || this.user === null) {
            this.logger.log('You cannot send the message to nowhere');
            return;
        }
        const newMessage  = {
            id: Math.random().toString(),
            from: this.user,
            to: this.pair,
            text: this.msg,
            time: new Date()
        };
        const newWsMessage = Object.assign({...newMessage}, {from: this.user.id, to: this.pair.id});
        try {
            this.chat.send(newWsMessage);
        } catch (e) {
            const message = 'Can not send the message';
            this.notifier.error(message);
            this.logger.error(message, e);
            return;
        }
        this.addMessage(newMessage);
        this.msg = '';
    }

    private getMessage(message: WsMessage): void {
        if (this.pair === null || this.user === null) {
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
        if (inArray) {
            return;
        }

        // And if not - add it to page
        if (typeof message.time === 'string') {
            message.time = new Date(message.time);
        }
        this.addMessage({
            id: message.id,
            from: this.pair,
            to: this.user,
            time: message.time ?? new Date(),
            text: message.text
        });
    }
}
