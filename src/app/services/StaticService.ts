import { Injectable } from "@angular/core";
import {environment} from "../../environments/environment";
import {User} from "../auth/user.entity";

@Injectable({
    providedIn: 'root'
})
export class StaticService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = environment.staticUrl;
    }

    public getImgUrl(user: User, path?: string): string {
        return path !== undefined ? `${this.baseUrl}/img/${user.id}/${path}` : '';
    }
}
