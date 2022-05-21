import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { AccountInterface } from "../interfaces/account.interface";
import { photoSettings } from "../config/photo.settings";
import { SecurityService } from "./security.service";

@Injectable({
    providedIn: 'root'
})
export class StaticService {
    private baseUrl: string;

    constructor(
        private readonly security: SecurityService
    ) {
        this.baseUrl = environment.staticUrl;
    }

    public getImgUrl(user: AccountInterface, path: string | null, size: string | null = null): string {
        if (path === null) {
            return '';
        }
        if (size === null) {
            size = photoSettings.defaultSize;
        }

        const signature = this.security.generateSignature(user);

        return `${this.baseUrl}/img/${signature.data}/${signature.value}/${path}/${size}`;
    }
}
