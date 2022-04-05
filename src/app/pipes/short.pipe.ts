import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'short'
})
export class ShortPipe implements PipeTransform {
    transform(text: string, length = 125): unknown {
        return text.length <= length ? text : text.substring(0, length);
    }
}
