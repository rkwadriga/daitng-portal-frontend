import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    AfterViewInit
} from '@angular/core';
import { User, UserService } from "../../services/user.service";
import { routes } from "../../config/routes";
import { ChatService, WsMessage } from "../../services/chat.service";
import { LoggerService } from "../../services/logger.service";
import { transformToSpend } from "../../helpers/time.helper";
import { NotifierService } from "../../services/notifier.service";
import { apiUrls } from "../../config/api";
import { ApiService } from "../../services/api.service";
import { Subscription } from 'rxjs';
import { VSItem, VirtualScrollService } from "../../services/virtual.scroll.service";
import { chatSettings } from "../../config/chat.setings";
import { getRandomNumber } from "../../helpers/random.helper";
import { photoSettings } from "../../config/photo.settings";

export interface Message {
    id: string;
    from: User;
    to: User;
    time: Date;
    text: string;
    transformedTime?: string;
    element?: HTMLElement
}
@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit, AfterViewInit, OnDestroy {
    private subscriptions = new Subscription();
    user: User | null = null;
    @Input() pair: User | null = null;
    @Input() messagesCount = 0;
    @Input() messages: Message[] = [];
    messagesLimit = chatSettings.chatMessagesLimit;
    paginationLimit = chatSettings.paginationLimit;
    scrollItems: VSItem<Message>[] = [];
    scrollContainerID: string | null = null;
    pairPhotoSize = photoSettings.dialogViewSize;
    msgPhotoSize = photoSettings.dialogMsgSize;

    private virtualScroll = new VirtualScrollService<Message>({
        scrollSelector: this.getScrollContainerID(),
        items: this.scrollItems,
        itemsLimit: this.messagesLimit
    });
    routes = routes;
    msg = '';
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

        this.messages.forEach(msg => {
            this.prepareMessage(msg);
            this.virtualScroll.addItem(msg);
        });

        // Set start messages loading offset and set "messageScrolled" to false for "ngAfterContentChecked" functions
        this.messagesOffset = this.messages.length;
    }

    ngAfterViewInit(): void {
        this.virtualScroll.onScrollTop(() => this.downloadMessages());
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
        this.chat.destroy();
        this.virtualScroll.destroy();
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

    public getScrollContainerID(): string {
        if (this.scrollContainerID !== null) {
            return this.scrollContainerID;
        }
        return this.scrollContainerID = 'scroll_container_' + getRandomNumber(10000, 99999);
    }

    private async downloadMessages(): Promise<Message[]> {
        // If pair is not selected or if all messages already loaded - do nothing
        if (this.pair === null || this.virtualScroll.getItemsCount() === this.messagesCount) {
            return [];
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
        let messages: Message[] = [];
        resp.body.messages.forEach((msg: WsMessage) => {
            const newMessage = this.createMessageObject(msg);
            if (newMessage !== null) {
                this.prepareMessage(newMessage);
                messages.push(newMessage);
                // Increment the downloading offset
                this.messagesOffset++;
            }
        });
        // Update messages count
        this.messagesCount = resp.body.count;

        return messages;
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
        this.virtualScroll.addItem(msg);

        this.messagesOffset++;
    }

    private prepareMessage(msg: Message): void {
        setInterval(() => {
            msg.transformedTime = transformToSpend(msg.time);
        }, 10000);
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
