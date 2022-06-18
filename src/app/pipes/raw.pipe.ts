import { Pipe, PipeTransform } from '@angular/core';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

@Pipe({
  name: 'raw'
})
export class RawPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer){}

    transform(htmlStr: string | null, rows = 0, length = 0, postfix = '...'): SafeHtml | null {
        if (htmlStr === null) {
            return null;
        }

        if (length > 0 && htmlStr.length > length) {
            htmlStr = htmlStr.substring(0, length) + postfix;
        }

        const sep = '<br />';
        htmlStr = htmlStr.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, `$1${sep}$2`);
        if (rows > 0) {
            const parts = htmlStr.split(sep);
            if (parts.length > rows) {
                htmlStr = parts.splice(0, rows).join(sep) + sep + postfix;
            }
        }

        return this.sanitizer.bypassSecurityTrustHtml(htmlStr);
    }
}
