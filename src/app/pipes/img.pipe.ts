import { Pipe, PipeTransform } from '@angular/core';
import {StaticService} from "../services/StaticService";

@Pipe({
    name: 'img'
})
export class ImgPipe implements PipeTransform {
    constructor(
        private readonly staticService: StaticService
    ) { }

    transform(path?: string, ...args: unknown[]): string {
        return path !== undefined ? this.staticService.getUrl(path) : '';
    }

}
