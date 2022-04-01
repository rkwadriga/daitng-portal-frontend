import { Component } from '@angular/core';
import { ApiClient } from "../../services/ApiClient";
import { apiUrls } from "../../config/api";
import {Notifier} from "../../services/Notifier";
import { routes } from "../../config/routes";
import {AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, Validators} from "@angular/forms";

@Component({
    selector: 'auth-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
    routes = routes;

    registrationParams = {
        email: 'user1@mail.com',
        password: 'test',
        retypePassword: '1234',
        firstName: '',
        lastName: '',
        gender: '',
        birthday: ''
    }

    validationForm = new FormGroup({
        email: new FormControl(this.registrationParams.email, [
            Validators.required,
            Validators.email
        ]),
        password: new FormControl(this.registrationParams.password, [
            Validators.required,
            Validators.minLength(4)
        ]),
        retypePassword: new FormControl(this.registrationParams.retypePassword, [
            Validators.required,
            Validators.minLength(4)
        ], this.retypePasswordValidator),
        firstName: new FormControl(this.registrationParams.firstName, [
            Validators.minLength(2),
            Validators.maxLength(50),
        ]),
        lastName: new FormControl(this.registrationParams.lastName, [
            Validators.minLength(2),
            Validators.maxLength(50),
        ]),
        gender: new FormControl(this.registrationParams.gender, [
            Validators.minLength(4),
            Validators.maxLength(6),
        ]),
        birthday: new FormControl(this.registrationParams.birthday, [
            Validators.minLength(10), // 2001-02-01
            Validators.maxLength(10), // 2005-10-11
        ]),
    });

    constructor(
        private readonly api: ApiClient,
        private readonly notifier: Notifier
    ) { }

    async retypePasswordValidator (group: AbstractControl): Promise<ValidationErrors | null> {
        const password = group.parent?.get('password')?.value;
        const retypePassword = group.value;

        return new Promise(() => {
            if (password === null || retypePassword === null || password === retypePassword) {
                return null;
            }

            return group.setErrors({
                'passwordsComparison': true
            });
        });
    }

    get email() {
        return this.validationForm.get('email');
    }

    get password() {
        return this.validationForm.get('password');
    }

    get retypePassword() {
        return this.validationForm.get('retypePassword');
    }

    get firstName() {
        return this.validationForm.get('firstName');
    }

    get lastName() {
        return this.validationForm.get('lastName');
    }

    get gender() {
        return this.validationForm.get('gender');
    }

    get birthday() {
        return this.validationForm.get('birthday');
    }

    async onSubmit() {
        console.log(this.validationForm.value);
    }
}
