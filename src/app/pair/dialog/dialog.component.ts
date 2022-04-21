import {
    Component,
    OnInit,
    AfterContentChecked,
    OnDestroy,
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
import { fromEvent, debounceTime, Subscription } from 'rxjs';

export interface Message {
    id: string;
    from: User;
    to: User;
    time: Date;
    text: string;
    transformedTime?: string;
    element?: HTMLElement
}

enum ScrollingDirection {
    UP,
    DOWN
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit, AfterContentChecked, OnDestroy {
    private subscriptions = new Subscription();
    user: User | null = null;
    @Input() pair: User | null = null;
    @Input() messagesCount = 0;
    @Input() chatMessagesLimit = 0;
    @Input() messages: Message[] = [];
    @ViewChild('messagesContainer') messagesContainer: ElementRef | undefined;
    messageIndex = 0;
    messagesCache: Message[] = [];
    routes = routes;
    msg = '';
    messageScrolled = false;
    paginationLimit = chatSettings.paginationLimit;
    scrollPos = 0;
    scrollOffset = 0;
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
        this.subscriptions.add(this.userService.getUser().subscribe(user => this.user = user));

        // Subscribe to the input messages (when selected pair sending the massage)
        this.subscriptions.add(this.chat.onMessage().subscribe(msg => this.addMessage(this.createMessageObject(msg))));

        // Sort messages
        this.sortMessages();

        // Prepare messages (set time persistent transformation)
        // ...and add the messages copies to the cache
        this.messagesCache = [];
        this.messages.forEach(msg => {
            this.prepareMessage(msg);
            // Add message to the messages runtime cache (for virtual scroll)
            this.messagesCache.push({...msg});
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
        this.subscriptions.add(scrolls.pipe(debounceTime(100)).subscribe(() => this.onScroll()));

        if (this.user === null || this.pair === null) {
            return;
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
        this.chat.destroy();
        // Kill links to the old page elements
        this.messages.forEach(msg => {
            msg.element = undefined;
        });
    }

    public createMessageID(index: number): string {
        return `chat_message_${index}`;
    }

    onSend(): void {
        if (this.pair === null || this.user === null) {
            this.logger.log('You cannot send the message to nowhere');
            return;
        }
        // Create new web-socket message
        const newWsMessage = {
            id: Math.random().toString(),
            from: this.user.id,
            to: this.pair.id,
            text: this.msg,
            time: new Date()
        };
        try {
            this.chat.send(newWsMessage);
        } catch (e) {
            const message = 'Can not send the message';
            this.notifier.error(message);
            this.logger.error(message, e);
            return;
        }

        this.addMessage(this.createMessageObject(newWsMessage));
        this.msg = '';
    }

    async onScroll(): Promise<void> {
        // If the page is not loaded or if there is no messages left on server - do nothing
        if (this.messagesContainer === undefined || this.user === null || this.pair === null) {
            return;
        }

        // Get massages container DOM element, get the scrolling direction and remember current scrolling pos
        const scrollEl = this.messagesContainer.nativeElement;
        const scrollDir = this.scrollPos > scrollEl.scrollTop ? ScrollingDirection.UP : ScrollingDirection.DOWN;
        this.scrollPos = scrollEl.scrollTop;

        // Calculate extra elements count
        let i = 0, elem, extraElementsCount = 0;
        while (elem = this.getMessageElement(i++)) {
            if (
                // elements above the window on scroll top
                (scrollDir === ScrollingDirection.UP && elem.getBoundingClientRect().bottom < scrollEl.getBoundingClientRect().top) ||
                // elements under the window on scroll down
                (scrollDir === ScrollingDirection.DOWN && elem.getBoundingClientRect().top > scrollEl.getBoundingClientRect().bottom)
            ) {
                extraElementsCount++;
            }
        }

        // If more then one element left for scrolling
        // or if this is the scrolling down and there is no messages under the scrolling window
        // do nothing
        if (extraElementsCount > 1 || (this.scrollOffset === 0 && scrollDir === ScrollingDirection.DOWN)) {
            return;
        }

        if (scrollDir === ScrollingDirection.UP) {
            let nextMessageIndex = this.messagesCache.length - (this.messages.length + this.scrollOffset + 1);
            if (nextMessageIndex < 0 && this.messagesCache.length === this.messagesCount) {
                return;
            }

            if (this.messagesCache[nextMessageIndex] === undefined) {
                // If this is scrolling to top and there is no message in cache - download messages pack form API
                await this.downloadMessages();
                nextMessageIndex = this.messagesCache.length - (this.messages.length + this.scrollOffset + 1);
            }

            // Remove the last message and add the new one to the start
            const newMessage = {...this.messagesCache[nextMessageIndex]};
            this.prepareMessage(newMessage);
            this.messages.splice(this.messages.length - 1, 1);
            this.messages.unshift(newMessage);

            const newMessageHeight = this.getMessageElement(0)?.getBoundingClientRect()?.height;
            if (newMessageHeight) {
                scrollEl.scrollTo(0, newMessageHeight);
            }
            this.scrollOffset++;
        } else {
            const nextMessageIndex = this.messagesCache.length - this.scrollOffset;
            // Remove the first message and add the new one to the start
            const newMessage = {...this.messagesCache[nextMessageIndex]};
            this.prepareMessage(newMessage);
            if (this.messages.length === this.chatMessagesLimit) {
                this.messages.splice(0, 1);
            }
            this.messages.push(newMessage);
            this.scrollOffset--;
        }
    }

    private async downloadMessages(): Promise<void> {
        // If pair is not selected or if all messages already loaded - do nothing
        if (this.pair === null || this.messagesCache.length >= this.messagesCount) {
            return;
        }

        // Load more messages from top
        apiUrls.dialog.params = {
            id: this.pair.id,
            limit: this.paginationLimit,
            offset: this.messagesOffset
        };
        const resp = await this.api.call(apiUrls.dialog);
        if (!resp.ok) {
            const message = `Can not get the dialog for pair ${this.pair.id}: ` + resp.error?.message ?? `Response status is ${resp.status}`;
            this.notifier.error(message);
            throw new Error(message);
        }

        // Add messages to the cache
        resp.body.messages.forEach((msg: WsMessage) => {
            const newMessage = this.createMessageObject(msg);
            if (newMessage !== null) {
                this.messagesCache.unshift(newMessage);
                // Increment the downloading offset
                this.messagesOffset++;
            }
        });
        // Update messages count
        this.messagesCount = resp.body.count;
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

    private addMessage(msg: Message | null): void {
        if (msg === null) {
            return;
        }

        // Increment messages count
        this.messagesCount++;

        // Prepare message (set time persistent transformation)
        this.prepareMessage(msg);

        // Remove the message from the start of array
        if (this.messages.length === this.chatMessagesLimit) {
            this.messages.splice(0, 1);
        }
        // ...and add the new one to the end
        this.messages.push(msg);
        // Add the copy of message to the messages runtime cache (for virtual scroll)
        this.messagesCache.push({...msg});
        // If the scrolling position is on the bottom - scroll down
        if (this.scrollOffset <= 1) {
            setTimeout(() => {
                this.scrollDownTo();
            }, 100);
        }
        // Increment the offset for loading messages from backend
        this.messagesOffset++;
    }

    private prepareMessage(msg: Message): void {
        setInterval(() => {
            msg.transformedTime = transformToSpend(msg.time);
        }, 10000);
    }

    private getMessageElement(index: number): HTMLElement | null {
        const msg = this.messages[index];
        if (msg === undefined) {
            return null;
        }
        if (msg.element !== undefined) {
            return msg.element;
        }

        const elem = document.getElementById(this.createMessageID(index)) ?? null;
        if (elem !== null) {
            msg.element = elem;
        }

        return elem;
    }

    private createMessageObject(msg: WsMessage): Message | null {
        if (this.pair === null || this.user === null) {
            return null;
        }
        if (typeof msg.time === 'string') {
            msg.time = new Date(msg.time);
        }
        return {
            id: msg.id,
            from: msg.from === this.user.id ? this.user : this.pair,
            to: msg.to === this.pair.id ? this.pair : this.user,
            time: msg.time ?? new Date(),
            text: msg.text
        };
    }
}
