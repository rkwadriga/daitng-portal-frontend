import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class LoggerService {
    log(message: any, context?: any): void {
        if (context !== undefined) {
            context = typeof context !== 'string' ? JSON.stringify(context) : context;
            console.log(message, `Context: ${context}`);
        } else {
            console.log(message);
        }
    }
}
