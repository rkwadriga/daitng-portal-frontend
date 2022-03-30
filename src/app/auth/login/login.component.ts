import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Logger } from "../../services/Logger";
import { ApiClient } from "../../services/ApiClient";
import { apiUrls } from "../../config/api";

@Component({
    selector: 'auth-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    loginParams = {
        email: 'user1@mail.com',
        password: 'test'
    };

    validationForm = new FormGroup({
        email: new FormControl(this.loginParams.email, [
            Validators.required,
            Validators.email
        ]),
        password: new FormControl(this.loginParams.password, [
            Validators.required,
            Validators.minLength(4)
        ])
    });

    constructor(
        private readonly api: ApiClient,
        private readonly logger: Logger
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

        const result = await this.api.call(apiUrls.login, loginParams);
        this.logger.log(result.body);
    }
}
