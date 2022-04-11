import { Component, OnInit, Input } from '@angular/core';
import { User, UserService } from "../../services/user.service";
import { routes } from "../../config/routes";
import { FormControl, FormGroup, Validators } from "@angular/forms";

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
    user: User | null = null;
    @Input() pair: User | null = null;
    @Input() messages: Message[] = [];
    routes = routes;
    msg = '';

    constructor(
        private readonly userService: UserService
    ) { }

    ngOnInit(): void {
        this.userService.getUser().subscribe(user => {
            this.user = user;
        });
    }

    onSend() {
        console.log(this.msg);
    }
}
