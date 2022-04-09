import { Component, OnInit } from '@angular/core';
import { User, UserService } from "../../services/user.service";
import { ApiService } from "../../services/api.service";
import { apiUrls } from "../../config/api";
import { NotifierService } from "../../services/notifier.service";
import { bytesToReadable } from "../../helpers/string.helper";
import { Photo } from "../photo.entity";
import { StaticService } from "../../services/static.service";
import { userSettings } from "../../config/user.settings";
import {getBase64FromUrl} from "../../helpers/image.helper";
import { routes } from "../../config/routes";
import {Router} from "@angular/router";

interface ControlFilesNamesInterface {
    [key: string]: boolean
}
interface ImageFile {
    name: string,
    src: string,
    size: number,
    isAvatar?: boolean,
    source?: File,
    isUrl?: boolean,
}

@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.scss']
})
export class ImagesComponent implements OnInit {
    user: User | null = null;
    routes = routes;
    files: ImageFile[] = [];
    private filesNames: ControlFilesNamesInterface = {};
    private userImagesLimit = 0;
    private userMaximumImageSIze = 0;
    private currentAvatar: string | null = null;
    private avatarIsChanged = false;

    constructor(
        private readonly userService: UserService,
        private readonly api: ApiService,
        private readonly router: Router,
        private readonly staticService: StaticService,
        private readonly notifier: NotifierService
    ) { }

    ngOnInit(): void {
        // Get current user and set user's photos limits
        this.userService.getUser().subscribe(async (user) => {
            if (user === null) {
                return;
            }

            this.user = user;
            this.userImagesLimit = user.imagesLimit ?? userSettings.defaultUserImagesLimit;
            this.userMaximumImageSIze = user.maximumImageSIze ?? userSettings.defaultUserMaximumImageSIze;

            // Add user id to "GET /account/:id/photos" url and get user's photos
            apiUrls.getUserPhotos.params.id = user.id;
            const response = await this.api.call(apiUrls.getUserPhotos);
            if (!response.ok) {
                this.notifier.error(response);
                throw new Error(`Can not get user's photos: ${response.error?.message}`);
            }

            // Add user's photos to page
            response.body.forEach((photo: Photo) => {
                this.filesNames[photo.name] = true;
                this.files.push({
                    name: photo.name,
                    src: this.staticService.getImgUrl(user, photo.name),
                    size: photo.size,
                    isAvatar: photo.isAvatar,
                    isUrl: true
                });
                if (photo.isAvatar) {
                    this.currentAvatar = photo.name;
                }
            });

            // If user has no avatar - that's mean than any new photo is an avatar and user's avatar is changed
            this.avatarIsChanged = this.currentAvatar === null;
        });
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
                    size: file.size,
                    isUrl: file,
                    source: file,
                })
            }
        }
        reader.readAsDataURL(file);
    }

    clickDeleteImg(name: string) {
        this.filesNames[name] = false;
        this.files = this.files.filter((file) => {
            if (file.name === name) {
                if (file.isAvatar) {
                    this.currentAvatar = null;
                    this.avatarIsChanged = true;
                }
                return false;
            } else {
                return true;
            }
        });
    }

    clickSetAvatar(name: string) {
        this.avatarIsChanged = this.currentAvatar !== name;

        this.files.forEach(file => {
            file.isAvatar = file.name === name;
        });
    }

    async upload() {
        if (this.files.length === 0) {
            this.notifier.alert(`Select the images before upload`);
            return;
        }

        // Set files base64 content to "src" attributes adn find a new avatar
        let requestBody: ImageFile[] = [];
        for (const file of this.files) {
            requestBody.push({
                name: file.name,
                size: file.size,
                isAvatar: file.isAvatar,
                src: file.isUrl ? await getBase64FromUrl(file.src) : file.src
            });
        }

        const response = await this.api.call(apiUrls.uploadPhotos, requestBody);
        if (!response.ok) {
            this.notifier.error(`Can't update user photos: ${response.error?.message}`);
            return;
        }

        // If user's avatar is changed - refresh the user
        if (this.avatarIsChanged) {
            await this.userService.refresh();
        }

        await this.router.navigateByUrl(this.routes.myProfile);
    }
}
