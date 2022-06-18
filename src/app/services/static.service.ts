import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { AccountInterface } from "../interfaces/account.interface";
import { photoSettings } from "../config/photo.settings";
import { SecurityService } from "./security.service";
import { KeyValueInterface } from "../interfaces/keyvalue.interface";
import { getImageDataByUrl } from "../helpers/image.helper";

@Injectable({
    providedIn: 'root'
})
export class StaticService {
    private readonly baseUrl = environment.staticUrl;
    private imagesCache: KeyValueInterface = {};

    constructor(
        private readonly security: SecurityService
    ) { }

    public getImgUrl(user: AccountInterface, path: string | null, size: string | null = null): string {
        if (path === null) {
            return '';
        }
        if (size === null) {
            size = photoSettings.defaultSize;
        }

        const cacheKey = `${user.id}_${path}_${size}`;
        if (this.imagesCache[cacheKey] !== undefined) {
            return this.imagesCache[cacheKey];
        }

        const signature = this.security.generateSignature(user);
        const url = `${this.baseUrl}/img/${signature.data}/${signature.value}/${path}/${size}`;

        getImageDataByUrl(url).then(imageData => this.imagesCache[cacheKey] = imageData);

        return url;
    }
}
