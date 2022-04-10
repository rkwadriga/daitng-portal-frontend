import { Component, OnInit, Input } from '@angular/core';
import { User } from "../../services/user.service";
import { routes } from "../../config/routes";

export interface Message {
    from: User,
    to: User,
    time: Date,
    text: string
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
    @Input() pair: User | null = null;
    @Input() messages: Message[] = [];
    routes = routes;

    constructor() { }

    ngOnInit(): void {
    }

}
