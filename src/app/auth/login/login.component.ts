import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ApiClient } from "../../services/ApiClient";
import { UserService } from "../../services/UserService";
import { Router } from '@angular/router';
import { routes } from "../../config/routes";

@Component({
    selector: 'auth-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    routes = routes;

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
        await this.router.navigate(['/dating', 'accounts']);
        window.location.reload();
    }
}
