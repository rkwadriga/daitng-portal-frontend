import { Component, OnInit } from '@angular/core';
import { routes } from "../../config/routes";
import { ApiClient } from "../../services/ApiClient";
import { Router } from "@angular/router";
import { Notifier } from "../../services/Notifier";
import { Logger } from "../../services/Logger";
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { apiUrls } from "../../config/api";
import {KeyValueInterface} from "../../interfaces/keyvalue.interface";
import {UserService} from "../../services/UserService";
import {User} from "../../auth/user.entity";

let api: ApiClient | null = null;
let checkedPasswords: KeyValueInterface = {};

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
    routes = routes;
    user?: User;

    validationForm = new FormGroup({
        oldPassword: new FormControl('', [
            Validators.required,
            Validators.minLength(4)
        ], this.oldPasswordValidatorAsync),
        password: new FormControl('', [
            Validators.required,
            Validators.minLength(4),
            this.passwordValidator
        ]),
        retypedPassword: new FormControl('', [
            Validators.required,
            Validators.minLength(4),
            this.retypePasswordValidator
        ]),
    });

    constructor(
        private readonly api: ApiClient,
        private readonly userService: UserService,
        private readonly router: Router,
        private readonly notifier: Notifier,
        private readonly logger: Logger
    ) { }

    async ngOnInit() {
        this.user = await this.userService.getUser();
        api = this.api;
    }

    async oldPasswordValidatorAsync(group: AbstractControl): Promise<ValidationErrors | null> {
        const password = group.value;
        if (!password || password.length < 4 || api === null) {
            return null;
        }

        if (checkedPasswords[password] !== undefined) {
            return checkedPasswords[password];
        }

        const response = await api.call(apiUrls.checkPassword, {'password': password});
        if (!response.ok) {
            return checkedPasswords[password] = {validation: {message: response.error?.message}};
        }

        return checkedPasswords[password] = response.body.result ? null : {validation: true};
    }

    passwordValidator(group: AbstractControl): ValidationErrors | null {
        const oldPassword = group.parent?.get('oldPassword')?.value;
        const password = group.value;
        if (oldPassword === null || password !== oldPassword) {
            return null;
        } else {
            return  {passwordValidation: true};
        }
    }

    retypePasswordValidator(group: AbstractControl): ValidationErrors | null {
        const password = group.parent?.get('password')?.value;
        const retypePassword = group.value;
        if (password === null || retypePassword === null || password === retypePassword) {
            return null;
        } else {
            return  {passwordsComparison: true};
        }
    }

    get oldPassword() {
        return this.validationForm.get('oldPassword');
    }

    get password() {
        return this.validationForm.get('password');
    }

    get retypedPassword() {
        return this.validationForm.get('retypedPassword');
    }

    async onSubmit() {
        // Check form
        if (!this.validationForm?.valid) {
            const errorMsg = JSON.stringify(this.validationForm?.errors);
            this.notifier.error(errorMsg);
            throw new Error(errorMsg);
        }

        // Update info
        const result = await this.api.call(apiUrls.updatePassword, this.validationForm?.value);
        if (!result.ok) {
            this.notifier.error(result);
            throw new Error(result.error?.message);
        }

        this.logger.log(`User ${this.user?.email} updated it's password`);

        // Redirect to profile page
        await this.router.navigateByUrl(routes.myProfile);
        window.location.reload();
    }
}
