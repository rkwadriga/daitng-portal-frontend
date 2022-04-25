import { Pipe, PipeTransform } from '@angular/core';
import {transformToSpend} from "../helpers/time.helper";

@Pipe({
  name: 'spend'
})
export class SpendPipe implements PipeTransform {
    transform(value: Date | string): string {
        return transformToSpend(value);
    }
}
