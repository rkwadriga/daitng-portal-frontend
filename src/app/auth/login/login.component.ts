import { Component } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Logger} from "../../services/Logger";
import {ApiClient} from "../../services/ApiClient";

@Component({
    selector: 'auth-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    loginParams = {
        email: '',
        password: ''
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

    async onSubmit() {
        const loginParams = {
            username: this.email?.valid ? this.email?.value : null,
            password: this.password?.valid ? this.password?.value : null
        };
        if (!loginParams.username || !loginParams.password) {
            throw new Error('Invalid login params');
        }

        const result = await this.api.post('/auth/login', loginParams);
        this.logger.log(result.body);
    }

    get email() {
        return this.validationForm.get('email');
    }

    get password() {
        return this.validationForm.get('password');
    }
}
