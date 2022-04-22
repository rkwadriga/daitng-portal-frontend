import { Pipe, PipeTransform } from '@angular/core';
import {StaticService} from "../services/static.service";
import {AccountInterface} from "../interfaces/account.interface";

@Pipe({
    name: 'img'
})
export class ImgPipe implements PipeTransform {
    constructor(
        private readonly staticService: StaticService
    ) { }

    transform(user: AccountInterface, path: string | null, size: string | null = null): string {
        return this.staticService.getImgUrl(user, path, size);
    }
}
