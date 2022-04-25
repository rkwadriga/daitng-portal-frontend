import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { User } from "../../services/user.service";
import { routes } from "../../config/routes";
import { photoSettings } from "../../config/photo.settings";

@Component({
  selector: 'app-match-popup',
  templateUrl: './match.popup.component.html',
  styleUrls: ['./match.popup.component.scss']
})
export class MatchPopupComponent implements OnInit {
    @Input() opened = true;
    @Input() account: User | null = null;
    @Output() returnToDating = new EventEmitter();
    routes = routes;
    photoSize = photoSettings.matchPopupSize;

    constructor() { }

    ngOnInit(): void {
    }

    close() {
        this.opened = false;
    }

    return() {
        this.close();
        this.returnToDating.emit();
    }
}
