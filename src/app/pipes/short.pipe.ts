import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'short'
})
export class ShortPipe implements PipeTransform {
    transform(text: string | null, length = 125): string {
        if (text === null) {
            return '';
        }
        return text.length <= length ? text : text.substring(0, length);
    }
}
