import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class LoggerService {
    public log(message: any, context?: any): void {
        this.writeMessage('log', message, context);
    }

    public info(message: any, context?: any): void {
        this.writeMessage('info', message, context);
    }

    public error(message: any, context?: any): void {
        this.writeMessage('error', message, context);
    }

    private writeMessage(level: string, message: any, context?: any): void {
        message = `(${message}) ${message}`;

        if (context !== undefined) {
            context = typeof context !== 'string' ? JSON.stringify(context) : context;
            console.log(message, `Context: ${context}`);
        } else {
            console.log(message);
        }
    }
}
