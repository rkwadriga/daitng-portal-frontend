import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ApiClient } from "../../services/ApiClient";
import { UserService } from "../../services/UserService";
import { Router } from '@angular/router';
import { routes } from "../../config/routes";
import {userSettings} from "../../config/user.settings";

@Component({
    selector: 'auth-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    routes = routes;

    validationForm = new FormGroup({
        email: new FormControl('', [
            Validators.required,
            Validators.email
        ]),
        password: new FormControl('', [
            Validators.required,
            Validators.minLength(userSettings.minPasswordLength),
            Validators.maxLength(userSettings.maxPasswordLength)
        ])
    });

    constructor(
        private readonly api: ApiClient,
        private readonly userService: UserService,
        private readonly router: Router
    ) { }

    get email() {
        return this.validationForm.get('email');
    }

    get password() {
        return this.validationForm.get('password');
    }

    async onSubmit() {
        const loginParams = {
            username: this.email?.valid ? this.email?.value : null,
            password: this.password?.valid ? this.password?.value : null
        };
        if (!loginParams.username || !loginParams.password) {
            throw new Error('Invalid login params');
        }

        // Login user
        await this.userService.login(loginParams);

        // Go to the accounts list page
        await this.router.navigateByUrl(routes.datingAccounts);
        window.location.reload();
    }
}
