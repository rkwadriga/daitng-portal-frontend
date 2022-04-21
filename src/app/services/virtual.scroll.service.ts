import {fromEvent, debounceTime, Subscription } from 'rxjs';

interface VSConfig<T> {
    scrollSelector: string;
    items: VSItem<T>[];
    itemIDPattern?: string;
    itemsLimit?: number;
    scrollingTimeout?: number;
}

enum ScrollingDirection {
    UP,
    DOWN
}

export interface VSItem<T> {
    data: T,
    htmlID: string,
    htmlItem?: Element
}

export class VirtualScrollService<T> {
    private subscriptions = new Subscription();
    private readonly items: VSItem<T>[] = [];
    private itemsCache: VSItem<T>[] = [];
    private scrollElement: Element | null = null;
    private readonly scrollSelector: string;
    private readonly itemIDPattern: string = 'virtual_scroll_item_:id';
    private readonly itemsLimit: number = 10;
    private readonly scrollingTimeout: number = 100;
    private itemsCount = 0;
    private scrollPos = 0;
    private scrollOffset = 0;
    private onscrollTopCallback = async (): Promise<T[]> => [];
    private initialized = false;

    constructor(config: VSConfig<T>) {
        this.scrollSelector = config.scrollSelector;
        this.items = config.items;
        if (config.itemIDPattern !== undefined) {
            this.itemIDPattern = config.itemIDPattern;
        }
        if (config.itemsLimit !== undefined) {
            this.itemsLimit = config.itemsLimit;
        }
        if (config.scrollingTimeout !== undefined) {
            this.scrollingTimeout = config.scrollingTimeout;
        }
    }

    public destroy(): void {
        this.subscriptions.unsubscribe();
    }

    public addItem(item: T): this {
        if (this.items.length === this.itemsLimit) {
            this.items.splice(0, 1);
        }
        this.items.push({data: item, htmlID: this.createElementID(this.items.length)});
        this.itemsCache.push({data: item, htmlID: ''});
        this.reindexItems();
        this.itemsCount++;

        if (this.scrollOffset  === 0) {
            this.scrollDown();
        }

        return this;
    }

    public onScrollTop(callback: () => Promise<T[]>): this {
        this.onscrollTopCallback = callback;
        this.initialized = true;
        // Add scrolling listener with timeout (0.1 s)
        const scrolls = fromEvent(this.getScrollElement(), 'scroll');
        this.subscriptions.add(
            scrolls.pipe(debounceTime(this.scrollingTimeout)).subscribe(() => this.scroll())
        );
        // Scroll page down
        this.scrollDown();
        return this;
    }

    public getItemsCount(): number {
        return this.itemsCount;
    }

    public scrollDown(): void {
        this.scrollOffset = 0;
        if (this.initialized) {
            setTimeout(() => {
                this.getScrollElement().scrollTo(0, this.getScrollElement().scrollHeight);
            }, 10);
        }
    }

    private async scroll(): Promise<void> {
        // Get massages container DOM element, get the scrolling direction and remember current scrolling pos
        const scrollEl = this.getScrollElement();
        const scrollDir = this.scrollPos > scrollEl.scrollTop ? ScrollingDirection.UP : ScrollingDirection.DOWN;
        this.scrollPos = scrollEl.scrollTop;

        // Calculate extra elements count
        let i = 0, elem, extraElementsCount = 0;
        for (i; i < this.items.length; i++) {
            elem = this.getItemElement(i);
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
            let nextMessageIndex = this.itemsCache.length - (this.items.length + this.scrollOffset + 1);
            if (this.itemsCache[nextMessageIndex] === undefined) {
                // If this is scrolling to top and there is no message in cache - download messages pack form API
                const newMessages = await this.onscrollTopCallback();
                if (newMessages.length === 0) {
                    return;
                }
                newMessages.forEach(item => {
                    this.itemsCache.unshift({data: item, htmlID: ''});
                    this.itemsCount++;
                });
                nextMessageIndex = this.itemsCache.length - (this.items.length + this.scrollOffset + 1);
            }

            // Remove the last message and add the new one to the start
            this.items.splice(this.items.length - 1, 1);
            this.items.unshift({...this.itemsCache[nextMessageIndex]});
            this.reindexItems();

            const newMessageHeight = this.getItemElement(0)?.getBoundingClientRect()?.height;
            if (newMessageHeight) {
                scrollEl.scrollTo(0, newMessageHeight);
            }
            this.scrollOffset++;
        } else {
            const nextMessageIndex = this.itemsCache.length - this.scrollOffset;
            // Remove the first message and add the new one to the start
            if (this.items.length === this.itemsLimit) {
                this.items.splice(0, 1);
            }
            this.items.push({...this.itemsCache[nextMessageIndex]});
            this.reindexItems();

            this.scrollOffset--;
        }
    }

    private reindexItems(): void {
        if (this.items.length < this.itemsLimit) {
            return;
        }

        let i = 0;
        this.items.forEach(item => {
            item.htmlID = this.createElementID(i++);
        });
    }

    private getItemElement(index: number): Element {
        const item = this.items[index];
        if (item === undefined) {
            throw new Error(`There is no scroll item ${index}`);
        }
        if (item.htmlItem !== undefined) {
            return item.htmlItem;
        }

        const htmlItem = document.getElementById(this.createElementID(index));
        if (htmlItem === null) {
            throw new Error(`There is no scroll item with ID ${this.createElementID(index)} in the page`);
        }

        return item.htmlItem = htmlItem;
    }

    private getScrollElement(): Element {
        if (this.scrollElement !== null) {
            return this.scrollElement;
        }

        let selector = this.scrollSelector;
        let element: Element | null;
        if (selector.substring(0, 1) === '.') {
            selector = selector.substring(1);
            element = document.getElementsByClassName(selector)[0] ?? null;
        } else {
            if (selector.substring(0, 1) === '#') {
                selector = selector.substring(1);
            }
            element = document.getElementById(selector) ?? null;
        }

        if (element === null) {
            throw new Error(`Scroll element not found by selector ${this.scrollSelector}`);
        }

        return this.scrollElement = element;
    }

    private createElementID(index: number): string {
        return this.itemIDPattern.replace(':id', index.toString());
    }
}
