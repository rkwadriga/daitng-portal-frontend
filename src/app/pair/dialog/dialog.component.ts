import {
    Component,
    OnInit,
    AfterContentChecked,
    Input,
    ViewChild,
    ElementRef
} from '@angular/core';
import { User, UserService } from "../../services/user.service";
import { routes } from "../../config/routes";
import { ChatService, WsMessage } from "../../services/chat.service";
import { LoggerService } from "../../services/logger.service";
import { transformToSpend } from "../../helpers/time.helper";
import { NotifierService } from "../../services/notifier.service";
import { chatSettings } from "../../config/chat.setings";
import { apiUrls } from "../../config/api";
import { ApiService } from "../../services/api.service";
import { fromEvent, debounceTime } from 'rxjs';

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
export class DialogComponent implements OnInit, AfterContentChecked {
    user: User | null = null;
    @Input() pair: User | null = null;
    @Input() messagesCount = 0;
    @Input() messages: Message[] = [];
    @ViewChild('messagesContainer') messagesContainer: ElementRef | undefined;
    routes = routes;
    msg = '';
    messageContainerClass = 'message-element';
    messageScrolled = false;
    scrollPos = 0;
    messagesOffset = 0;

    constructor(
        private readonly userService: UserService,
        private readonly chat: ChatService,
        private readonly api: ApiService,
        private readonly notifier: NotifierService,
        private readonly logger: LoggerService
    ) { }

    ngOnInit(): void {
        // Subscribe to getting current user info
        this.userService.getUser().subscribe(user => this.user = user);

        // Subscribe to the input messages (when selected pair sending the massage)
        this.chat.onMessage().subscribe(msg => this.addInputMessage(msg));

        // Sort messages
        this.sortMessages();

        // Prepare messages (set time persistent transformation)
        this.messages.forEach(msg => {
            this.prepareMessage(msg);
        });

        // Set start messages loading offset and set "messageScrolled" to false for "ngAfterContentChecked" functions
        this.messagesOffset = this.messages.length;
        this.messageScrolled = false;
    }

    ngAfterContentChecked(): void {
        if (this.messageScrolled || this.messagesContainer === undefined) {
            return;
        }
        // Scroll down
        this.scrollDownTo();
        this.messageScrolled = true;

        // Add scrolling listener with timeout (0.1 s)
        const scrolls = fromEvent(this.messagesContainer.nativeElement, 'scroll');
        scrolls.pipe(debounceTime(100)).subscribe(() => this.onScroll());
    }

    onSend(): void {
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

    onScroll(): void {
        // If the page is not loaded of if there is no messages left on server, do nothing - do nothing
        if (
            this.messagesContainer === undefined ||
            this.user === null ||
            this.pair === null ||
            this.messages.length >= this.messagesCount
        ) {
            return;
        }

        // Get massages container DOM element
        const scrollEl = this.messagesContainer.nativeElement;
        // Check the scroll direction adn do not process the scrolling to down
        const scrollDelta = scrollEl.scrollTop - this.scrollPos;
        this.scrollPos = scrollEl.scrollTop;
        if (scrollDelta >= 0) {
            return;
        }

        // Get the first from top message element
        const messageEl = this.getMessageContainer(0);
        if (messageEl === undefined) {
            return;
        }

        // Load more elements only if scrolling height grater that (height of last message) * 2
        if (scrollEl.scrollTop > messageEl.offsetHeight * 2) {
            return;
        }

        this.loadMessages().then(messages => {
            // Add messages to array
            messages.forEach(msg => this.addMessage(msg, false));
            // Scroll down
            scrollEl.scrollTo(0, 1);
        });
    }

    private async loadMessages(): Promise<Message[]> {
        if (this.pair === null) {
            return [];
        }

        let messages: Message[] = [];
        // Load more messages from top
        apiUrls.dialog.params = {
            id: this.pair.id,
            limit: chatSettings.paginationLimit,
            offset: this.messagesOffset
        };
        const resp = await this.api.call(apiUrls.dialog);
        if (!resp.ok) {
            const message = `Can not get the dialog for pair ${this.pair.id}: ` + resp.error?.message ?? `Response status is ${resp.status}`;
            this.notifier.error(message);
            throw new Error(message);
        }

        // Add messages
        resp.body.messages.forEach((msg: WsMessage) => {
            if (this.user === null || this.pair === null) {
                return;
            }
            if (typeof msg.time === 'string') {
                msg.time = new Date(msg.time);
            }
            messages.push(Object.assign(msg, {
                from: msg.from === this.pair.id ? this.pair : this.user,
                to: msg.to === this.user.id ? this.user : this.pair,
                time: msg.time ?? new Date()
            }));
        });

        // Update messages count and add pagination step
        this.messagesCount = resp.body.count;
        this.messagesOffset += messages.length;

        return messages;
    }

    private addInputMessage(msg: WsMessage): void {
        if (this.pair === null || this.user === null) {
            return;
        }
        // Convert message datetime from string to Date object
        if (typeof msg.time === 'string') {
            msg.time = new Date(msg.time);
        }
        // And given from the socket-server message to the page
        this.addMessage({
            id: msg.id,
            from: this.pair,
            to: this.user,
            time: msg.time ?? new Date(),
            text: msg.text
        });
    }

    private scrollDownTo(): void {
        if (this.messagesContainer === undefined) {
            return;
        }
        // Get massages container DOM element
        const scrollEl = this.messagesContainer.nativeElement;
        // Scroll down
        scrollEl.scrollTo(0, scrollEl.scrollHeight);
    }

    private sortMessages() {
        this.messages.sort((msg1, msg2) => {
            return msg1.time > msg2.time ? 1 : -1;
        });
    }

    private addMessage(msg: Message, toTheEnd = true): void {
        if (toTheEnd) {
            // Remove the message from the start of array
            this.messages.splice(0, 1);
            // ...and add the new one to the end
            this.messages.push(msg);

            // Scroll down - if scrolling pos less than the (height of the last message) * 1.5
            if (this.messagesContainer !== undefined) {
                const scrollEl = this.messagesContainer.nativeElement;
                const lastEl = this.getMessageContainer(this.messages.length - 1);
                if (scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.offsetHeight < lastEl.offsetHeight * 1.5) {
                    // Scroll to down after 0.1 second
                    setTimeout(() => { this.scrollDownTo() }, 100);
                }
            }
        } else {
            // Add message to the start of the messages array
            this.messages.unshift(msg);
        }

        // Prepare message (set time persistent transformation)
        this.prepareMessage(msg);
    }

    private prepareMessage(msg: Message): void {
        setInterval(() => {
            msg.transformedTime = transformToSpend(msg.time);
        }, 10000);
    }

    private getMessageContainer(index: number) {
        if (this.messagesContainer === undefined) {
            return undefined;
        }
        return this.messagesContainer.nativeElement.getElementsByClassName(this.messageContainerClass)[index]
    }
}
