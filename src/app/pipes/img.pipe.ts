import { Pipe, PipeTransform } from '@angular/core';
import {StaticService} from "../services/StaticService";
import {User} from "../auth/user.entity";

@Pipe({
    name: 'img'
})
export class ImgPipe implements PipeTransform {
    constructor(
        private readonly staticService: StaticService
    ) { }

    transform(user: User, ...args: unknown[]): string {
        return this.staticService.getImgUrl(user);
    }
}
