import { Pipe, PipeTransform } from '@angular/core';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

@Pipe({
  name: 'raw'
})
export class RawPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer){}

    transform(value: string | null, isXhtml = true): SafeHtml | null {
        if (value === null) {
            return null;
        }

        const breakTag = isXhtml ? '<br />' : '<br>';
        return this.sanitizer.bypassSecurityTrustHtml(
            value.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, `$1${breakTag}$2`)
        );
    }
}
