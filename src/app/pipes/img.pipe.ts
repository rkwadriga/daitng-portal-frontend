import { Pipe, PipeTransform } from '@angular/core';
import {StaticService} from "../services/StaticService";
import {AccountInterface} from "../interfaces/account.interface";

@Pipe({
    name: 'img'
})
export class ImgPipe implements PipeTransform {
    constructor(
        private readonly staticService: StaticService
    ) { }

    transform(user: AccountInterface, path?: string): string {
        return this.staticService.getImgUrl(user, path);
    }
}
