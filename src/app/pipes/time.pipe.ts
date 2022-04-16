import { Pipe, PipeTransform } from '@angular/core';
import { transformToSpend } from "../helpers/time.helper";

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {
    transform(value: Date | string): string {
        return transformToSpend(value);
    }
}
