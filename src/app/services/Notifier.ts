import { Injectable } from "@angular/core";
import { Response as HttpResponse } from './ApiClient';

@Injectable({
    providedIn: 'root'
})
export class Notifier {
    error (message: HttpResponse | string): void {
        //const msg = typeof message === 'string' ? message : `${message.message} (${message.status})`;
        //alert(msg);
    }
}
