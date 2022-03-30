import { Injectable } from "@angular/core";
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class StaticService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = environment.staticUrl;
    }

    public getUrl(path: string): string {
        return this.baseUrl + path;
    }
}