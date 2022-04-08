import { Injectable } from "@angular/core";
import {environment} from "../../environments/environment";
import {AccountInterface} from "../interfaces/account.interface";

@Injectable({
    providedIn: 'root'
})
export class StaticService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = environment.staticUrl;
    }

    public getImgUrl(user: AccountInterface, path?: string): string {
        return path !== undefined ? `${this.baseUrl}/img/${user.id}/${path}` : '';
    }
}
