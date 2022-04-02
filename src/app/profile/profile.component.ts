import { Component, OnInit } from '@angular/core';
import { UserService } from "../services/UserService";
import { ApiClient } from "../services/ApiClient";
import { apiUrls } from "../config/api";
import { User } from "../auth/user.entity";
import { Notifier } from "../services/Notifier";
import { FormControl } from "@angular/forms";
import { environment } from "../../environments/environment";
import { bytesToReadable } from "../helpers/string.helper";

interface ControlFilesNamesInterface {
    [key: string]: boolean
}
interface ImageFile {
    name: string,
    src: string,
    source?: File
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
    private userImagesLimit = 0;
    private userMaximumImageSIze = 0;

    constructor(
        private readonly userService: UserService,
        private readonly api: ApiClient,
        private readonly notifier: Notifier
    ) { }

    async ngOnInit() {
        this.user = await this.userService.getUser();
        this.userImagesLimit = this.user.imagesLimit ?? environment.defaultUserImagesLimit;
        this.userMaximumImageSIze = this.user.maximumImageSIze ?? environment.defaultUserMaximumImageSIze;
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (this.filesNames[file.name]) {
            this.notifier.alert(`File ${file.name} already loaded`);
            return;
        }
        if (this.files.length === this.userImagesLimit) {
            this.notifier.alert(`You can not load more than ${this.userImagesLimit} files`);
            return;
        }
        if (file.size > this.userMaximumImageSIze) {
            this.notifier.alert(`You can not load image bigger than ${bytesToReadable(this.userMaximumImageSIze)}`);
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
