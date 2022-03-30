import { Component } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";

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

    constructor() { }

    onSubmit() {
        const loginParams = {
            email: this.email?.valid ? this.email?.value : null,
            password: this.password?.valid ? this.password?.value : null
        };
        if (!loginParams.email || !loginParams.password) {
            throw new Error('Invalid login params');
        }

        console.log(loginParams);
    }

    get email() {
        return this.validationForm.get('email');
    }

    get password() {
        return this.validationForm.get('password');
    }
}
