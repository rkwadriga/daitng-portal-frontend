import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { LoggerService } from "./logger.service";

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    private client: WebSocket | null = null;

    constructor(
        private readonly logger: LoggerService
    ) { }

    public init(userID: string): this {
        this.client = new WebSocket(environment.socketUrl + `?client=${userID}`);

        return this;
    }

    public onMessage(): Observable<any> {
        return new Observable((subscriber) => {
            if (this.client === null) {
                return;
            }
            this.client.onmessage = (message) => {
                subscriber.next(message);
            };
        });
    }

    public send(message: string) {
        if (this.client === null) {
            this.logger.error('The socket connections is lost');
            return;
        }
        this.client.send(message);
    }
}
