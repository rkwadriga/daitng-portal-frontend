import { Injectable } from "@angular/core";
import {environment} from "../../environments/environment";
import {AccountInterface} from "../interfaces/account.interface";
import {photoSettings} from "../config/photo.settings";

@Injectable({
    providedIn: 'root'
})
export class StaticService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = environment.staticUrl;
    }

    public getImgUrl(user: AccountInterface, path: string | null, size: string | null = null): string {
        if (path === null) {
            return '';
        }
        if (size === null) {
            size = photoSettings.defaultSize;
        }
        return `${this.baseUrl}/img/${user.id}/${path}/${size}`;
    }
}
