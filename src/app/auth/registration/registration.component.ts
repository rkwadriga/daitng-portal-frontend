import {Component, OnInit} from '@angular/core';
import { ApiService } from "../../services/api.service";
import { apiUrls } from "../../config/api";
import { NotifierService } from "../../services/notifier.service";
import { routes } from "../../config/routes";
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { environment } from "../../../environments/environment";
import { DATETIME_FORMAT_PATTERN, isDateValid, yearsFromDate } from "../../helpers/time.helper";
import { Router } from "@angular/router";
import { LoggerService } from "../../services/logger.service";
import { genders } from "../../config/genders";
import { orientations } from "../../config/orientations";
import { userSettings } from "../../config/user.settings";
import { enumsKeysToArray, inArray } from "../../helpers/array.helper";
import { Orientation } from "../../profile/orientation.enum";
import { Gender } from "../../profile/gender.enum";
import {KeyValueInterface} from "../../interfaces/keyvalue.interface";

let apiService: ApiService | null = null;
let checkedEmails: KeyValueInterface = {};

@Component({
    selector: 'auth-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
    routes = routes;
    genders = genders;
    orientations = orientations;

    validationForm = new FormGroup({
        email: new FormControl('', [
            Validators.required,
            Validators.email
        ], this.emailValidatorAsync),
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
        orientation: new FormControl(Orientation.Hetero, [this.orientationValidator]),
        showGender: new FormControl('', [this.showGenderValidator]),
        birthday: new FormControl('', [
            Validators.required,
            Validators.pattern(DATETIME_FORMAT_PATTERN),
            this.dateValidator,
            this.ageValidator
        ]),
        about: new FormControl('', [
            Validators.minLength(2),
            Validators.maxLength(5000),
        ]),
    });

    constructor(
        private readonly api: ApiService,
        private readonly router: Router,
        private readonly notifier: NotifierService,
        private readonly logger: LoggerService
    ) { }

    ngOnInit(): void {
        apiService = this.api;
    }

    async emailValidatorAsync(group: AbstractControl): Promise<ValidationErrors | null> {
        const email = group.parent?.get('email')?.value;
        if (apiService === null || !email === null) {
            return null;
        }

        const error = {emailNotUnique: true};;
        if (checkedEmails[email] !== undefined) {
            return checkedEmails[email] ? null : error;
        }

        apiUrls.checkUsername.params.username = email;
        const resp = await apiService.call(apiUrls.checkUsername);
        if (!resp.ok) {
            this.logger.log('Can not check the user password: ' + (resp.error?.message ?? `Status code: ${resp.status}`));
            return null;
        }

        checkedEmails[email] = resp.body.result;
        if (resp.body.result === true) {
            return null;
        }

        return error;
    }

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
        const result = inArray(group.value, enumsKeysToArray(genders));
        const showGenderValue = group.parent?.get('showGender')?.value;
        if (result && !showGenderValue) {
            if (group.value === Gender.Male) {
                group.parent?.get('showGender')?.setValue(Gender.Female);
            } else if (group.value === Gender.Female) {
                group.parent?.get('showGender')?.setValue(Gender.Male);
            }
        }
        return result ? null : {genderIsCorrect: true};
    }

    orientationValidator (group: AbstractControl): ValidationErrors | null {
        const result = inArray(group.value, enumsKeysToArray(orientations));
        return result ? null : {orientationIsCorrect: true};
    }

    showGenderValidator (group: AbstractControl): ValidationErrors | null {
        const result = inArray(group.value, enumsKeysToArray(genders));
        return result ? null : {showGenderIsCorrect: true};
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

    get orientation() {
        return this.validationForm.get('orientation');
    }

    get showGender() {
        return this.validationForm.get('showGender');
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
        await this.router.navigateByUrl(routes.myImages);
        window.location.reload();
    }
}
