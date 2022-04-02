import { Component, OnInit } from '@angular/core';
import { UserService } from "../../services/UserService";
import { ApiClient } from "../../services/ApiClient";
import { apiUrls } from "../../config/api";
import { User } from "../../auth/user.entity";
import { Notifier } from "../../services/Notifier";
import { FormControl } from "@angular/forms";
import { environment } from "../../../environments/environment";
import { bytesToReadable } from "../../helpers/string.helper";

interface ControlFilesNamesInterface {
    [key: string]: boolean
}
interface ImageFile {
    name: string,
    src: string,
    source?: File
}

@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.scss']
})
export class ImagesComponent implements OnInit {
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
        // Get selected file
        const file = event.target.files[0];
        // Check uploading limits
        if (this.filesNames[file.name]) {
            this.notifier.alert(`File ${file.name} already loaded`);
            return;
        }
        if (this.userImagesLimit > 0 && this.files.length === this.userImagesLimit) {
            this.notifier.alert(`You can not load more than ${this.userImagesLimit} files`);
            return;
        }
        if (this.userMaximumImageSIze > 0 && file.size > this.userMaximumImageSIze) {
            this.notifier.alert(`You can not load image bigger than ${bytesToReadable(this.userMaximumImageSIze)}`);
            return;
        }
        // Remember selected file name to not upload the same file second time
        this.filesNames[file.name] = true;

        // Add image to page
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
