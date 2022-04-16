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
import {getDatesDiff, transformToSpend} from "../../helpers/time.helper";
import { NotifierService } from "../../services/notifier.service";
import { chatSettings } from "../../config/chat.setings";
import {apiUrls} from "../../config/api";
import {ApiService} from "../../services/api.service";

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
    lastLoadingTime: Date;
    loadingInProcess = false;

    constructor(
        private readonly userService: UserService,
        private readonly chat: ChatService,
        private readonly api: ApiService,
        private readonly notifier: NotifierService,
        private readonly logger: LoggerService
    ) {
        this.lastLoadingTime = new Date();
    }

    ngOnInit(): void {
        this.userService.getUser().subscribe(user => {
            this.user = user;
        });
        this.chat.onMessage().subscribe((message: WsMessage) => {
            this.getMessage(message);
        });
        // Sort messages
        this.sortMessages();
        // Prepare messages (set time persistent transformation)
        this.messages.forEach(msg => {
            this.prepareMessage(msg);
        });
        this.messageScrolled = false;
    }

    ngAfterContentChecked(): void {
        if (this.messageScrolled || this.messagesContainer === undefined) {
            return;
        }
        // Scroll down
        this.scrollDownTo();
        // Add scroll listener
        this.messagesContainer.nativeElement.addEventListener('scroll', async (event: Event) => {
            await this.onScroll(event);
        });
        // Remember that container is already scrolled to down
        this.messageScrolled = true;
    }

    onSend(): void {
        this.sendMessage();
    }

    async onScroll(event: Event) {
        // If the page is no loaded - do nothing
        if (this.messagesContainer === undefined || this.user === null || this.pair === null) {
            return;
        }
        // If there is no messages left on server or the loading already in process, do nothing
        if (this.loadingInProcess || this.messages.length >= this.messagesCount) {
            return;
        }

        // Get massages container DOM element
        const scrollEl = this.messagesContainer.nativeElement;
        // Check the scroll direction adn do not process the scrolling to down
        const scrollDelta = scrollEl.scrollTop - this.scrollPos;
        this.scrollPos = scrollEl.scrollTop;
        if (scrollDelta > 0) {
            return;
        }

        // Get the first from top message element
        const messageEl = this.getMessageContainer(0);
        if (messageEl === undefined) {
            return;
        }

        // If scrolling height grater that (height of last message) * 1.5
        // and load more elements only if there is only one message left
        if (scrollEl.scrollTop > messageEl.offsetHeight * 1.5) {
            return;
        }

        // If there is less than second left from the last loading, do not load new messages for now
        if (getDatesDiff(this.lastLoadingTime) < 1000) {
            return;
        }

        // Do not load the next pack of messages before current not loaded
        this.loadingInProcess = true;

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
            this.addMessage(Object.assign(msg, {
                from: msg.from === this.pair.id ? this.pair : this.user,
                to: msg.to === this.user.id ? this.user : this.pair,
                time: msg.time ?? new Date()
            }), false);
        });

        // Update messages count
        this.messagesCount = resp.body.count;

        // Add pagination step
        this.messagesOffset += chatSettings.paginationLimit;

        // Remember the loading time and set loading status to false
        this.lastLoadingTime = new Date();
        this.loadingInProcess = false;
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
        // Check if message not already in list
        let inList = false;
        this.messages.some(message => {
            if (msg.id === message.id) {
                inList = true;
                return true;
            }
            return false;
        });
        if (inList) {
            return;
        }

        if (toTheEnd) {
            this.messages.splice(0, 1);
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

    private getMessageContainer(index: number) {
        if (this.messagesContainer === undefined) {
            return undefined;
        }
        return this.messagesContainer.nativeElement.getElementsByClassName(this.messageContainerClass)[index]
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
