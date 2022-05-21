import { Injectable } from "@angular/core";
import { AccountInterface } from "../interfaces/account.interface";
import { environment } from "../../environments/environment";
import * as SHA256 from 'crypto-js/sha256';
import * as Base64 from 'crypto-js/enc-base64';
import * as Utf8 from 'crypto-js/enc-utf8';

interface SecuritySignature {
    data: string;
    value: string;
}

@Injectable({
    providedIn: 'root'
})
export class SecurityService {
    private readonly secret = environment.apiSecret;

    public generateSignature(user: AccountInterface): SecuritySignature {
        const currentTime = new Date();
        const data = Base64.stringify(Utf8.parse(JSON.stringify({time: currentTime.valueOf(), user: user.id})));
        const secretStr = `<!--time:${currentTime.valueOf()}&secret:${this.secret}&user:${user.id}&-->`;

        return {
            data: data,
            value: SHA256(secretStr).toString()
        }
    }
}
