import { Component, OnInit } from '@angular/core';
import { UserService } from "../services/UserService";
import { ApiClient } from "../services/ApiClient";
import { apiUrls } from "../config/api";
import { User } from "../auth/user.entity";
import { Notifier } from "../services/Notifier";
import { FormControl } from "@angular/forms";

interface ControlFilesNamesInterface {
    [key: string]: boolean
}
interface ImageFile {
    name: string,
    src: string,
    source: File
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    user?: User;
    files: ImageFile[] = [];
    private filesNames: ControlFilesNamesInterface = {};

    constructor(
        private readonly userService: UserService,
        private readonly api: ApiClient,
        private readonly notifier: Notifier
    ) { }

    async ngOnInit() {
        this.user = await this.userService.getUser();
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (this.filesNames[file.name]) {
            return;
        }
        this.filesNames[file.name] = true;

        const self = this;
        const reader = new FileReader();
        reader.onloadend = function() {
            if (typeof reader.result === 'string') {
                self.files.push({
                    name: file.name,
                    src: reader.result,
                    source: file,
                })
            }
        }
        reader.readAsDataURL(file);
    }

    async onSave() {
        console.log(this.user?.avatar);
    }
}
