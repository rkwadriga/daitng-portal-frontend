import { Component } from '@angular/core';
import { ApiClient } from "../../services/ApiClient";
import { apiUrls } from "../../config/api";
import { Notifier } from "../../services/Notifier";
import { routes } from "../../config/routes";
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { Gender } from "../../profile/gender.enum";
import { environment } from "../../../environments/environment";
import { dateFormatPattern, isDateValid, yearsFromDate } from "../../helpers/time.helper";
import {Router} from "@angular/router";
import {Logger} from "../../services/Logger";
import {genders} from "../../config/genders";
import {userSettings} from "../../config/user.settings";

@Component({
    selector: 'auth-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
    routes = routes;
    genders = genders;

    validationForm = new FormGroup({
        email: new FormControl('', [
            Validators.required,
            Validators.email
        ]),
        password: new FormControl('', [
            Validators.required,
            Validators.minLength(userSettings.minPasswordLength),
            Validators.maxLength(userSettings.maxPasswordLength)
        ]),
        retypedPassword: new FormControl('', [
            Validators.required,
            Validators.minLength(userSettings.minPasswordLength),
            Validators.maxLength(userSettings.maxPasswordLength),
            this.retypePasswordValidator
        ]),
        firstName: new FormControl('', [
            Validators.minLength(2),
            Validators.maxLength(50),
        ]),
        lastName: new FormControl('', [
            Validators.minLength(2),
            Validators.maxLength(50),
        ]),
        gender: new FormControl('', [this.genderValidator]),
        birthday: new FormControl('', [
            Validators.required,
            Validators.pattern(dateFormatPattern),
            this.dateValidator,
            this.ageValidator
        ]),
        about: new FormControl('', [
            Validators.minLength(2),
            Validators.maxLength(5000),
        ]),
    });

    constructor(
        private readonly api: ApiClient,
        private readonly router: Router,
        private readonly notifier: Notifier,
        private readonly logger: Logger
    ) { }

    retypePasswordValidator (group: AbstractControl): ValidationErrors | null {
        const password = group.parent?.get('password')?.value;
        const retypePassword = group.value;
        if (password === null || retypePassword === null || password === retypePassword) {
            return null;
        } else {
            return  {passwordsComparison: true};
        }
    }

    genderValidator (group: AbstractControl): ValidationErrors | null {
        const result = group.value === Gender.Male || group.value === Gender.Female || group.value === Gender.Other;
        return result ? null : {genderIsCorrect: true};
    }

    dateValidator (group: AbstractControl): ValidationErrors | null {
        return isDateValid(group.value) ? null : {dateValidation: true};
    }

    ageValidator (group: AbstractControl): ValidationErrors | null {
        const age = yearsFromDate(group.value);

        return age >= environment.minAge ? null : {
            ageValidation: {
                actual: age,
                min: environment.minAge
            }
        };
    }

    get email() {
        return this.validationForm.get('email');
    }

    get password() {
        return this.validationForm.get('password');
    }

    get retypedPassword() {
        return this.validationForm.get('retypedPassword');
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

    get about() {
        return this.validationForm.get('about');
    }

    async onSubmit() {
        // Check form
        if (!this.validationForm.valid) {
            const errorMsg = JSON.stringify(this.validationForm.errors);
            this.notifier.error(errorMsg);
            throw new Error(errorMsg);
        }

        // Register user
        const result = await this.api.call(apiUrls.registration, this.validationForm.value);
        if (!result.ok) {
            this.notifier.error(result);
            throw new Error(result.error?.message);
        }

        this.logger.log(`User ${result.body.email} successful signed up`);

        // Remember user's token
        this.api.setToken(result.body.token);

        // Go to the accounts list page
        await this.router.navigateByUrl(routes.datingAccounts);
        window.location.reload();
    }
}
