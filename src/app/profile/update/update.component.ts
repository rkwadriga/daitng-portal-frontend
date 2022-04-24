import { Component, OnInit, OnDestroy } from '@angular/core';
import { User, UserService } from "../../services/user.service";
import { ApiService } from "../../services/api.service";
import { NotifierService } from "../../services/notifier.service";
import { routes } from "../../config/routes";
import { genders } from "../../config/genders";
import { Gender } from "../gender.enum";
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { DATETIME_FORMAT_PATTERN, isDateValid, yearsFromDate } from "../../helpers/time.helper";
import { environment } from "../../../environments/environment";
import { apiUrls } from "../../config/api";
import { LoggerService } from "../../services/logger.service";
import { Router } from "@angular/router";
import { orientations } from "../../config/orientations";
import { enumsKeysToArray, inArray } from "../../helpers/array.helper";
import { KeyValueInterface } from "../../interfaces/keyvalue.interface";
import { Subscription } from "rxjs";

let apiService: ApiService | null = null;
let checkedEmails: KeyValueInterface = {};
let oldEmail: string | null = null;

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss']
})
export class UpdateComponent implements OnInit, OnDestroy {
    private subscriptions = new Subscription();
    user: User | null = null;
    routes = routes;
    genders = genders;
    orientations = orientations;
    validationForm?: FormGroup;

    constructor(
        private readonly userService: UserService,
        private readonly api: ApiService,
        private readonly router: Router,
        private readonly notifier: NotifierService,
        private readonly logger: LoggerService
    ) { }

    ngOnInit(): void {
        apiService = this.api;

        this.subscriptions.add(
            this.userService.getUser().subscribe(user => {
                this.user = user;
                this.initForm(user);
            })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    initForm(user: User | null): void {
        oldEmail = user?.email ?? null;

        this.validationForm = new FormGroup({
            email: new FormControl(user?.email, [
                Validators.required,
                Validators.email
            ], this.emailValidatorAsync),
            firstName: new FormControl(user?.firstName, [
                Validators.minLength(2),
                Validators.maxLength(50),
            ]),
            lastName: new FormControl(user?.lastName, [
                Validators.minLength(2),
                Validators.maxLength(50),
            ]),
            gender: new FormControl(user?.gender, [this.genderValidator]),
            orientation: new FormControl(user?.orientation, [this.orientationValidator]),
            showGender: new FormControl(user?.showGender, [this.showGenderValidator]),
            birthday: new FormControl(user?.birthday, [
                Validators.required,
                Validators.pattern(DATETIME_FORMAT_PATTERN),
                this.dateValidator,
                this.ageValidator
            ]),
            about: new FormControl(user?.about, [
                Validators.minLength(2),
                Validators.maxLength(5000),
            ]),
        });
    }

    async emailValidatorAsync(group: AbstractControl): Promise<ValidationErrors | null> {
        const email = group.parent?.get('email')?.value;
        if (apiService === null || !email || email === oldEmail) {
            return null;
        }

        const error = {emailNotUnique: true};
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
        return this.validationForm?.get('email');
    }

    get firstName() {
        return this.validationForm?.get('firstName');
    }

    get lastName() {
        return this.validationForm?.get('lastName');
    }

    get gender() {
        return this.validationForm?.get('gender');
    }

    get orientation() {
        return this.validationForm?.get('orientation');
    }

    get showGender() {
        return this.validationForm?.get('showGender');
    }

    get birthday() {
        return this.validationForm?.get('birthday');
    }

    get about() {
        return this.validationForm?.get('about');
    }

    async onSubmit() {
        // Check form
        if (!this.validationForm?.valid) {
            const errorMsg = JSON.stringify(this.validationForm?.errors);
            this.notifier.error(errorMsg);
            throw new Error(errorMsg);
        }

        // Update info
        const result = await this.api.call(apiUrls.updateProfile, this.validationForm?.value);
        if (!result.ok) {
            this.notifier.error(result);
            throw new Error(result.error?.message);
        }

        this.logger.log(`User ${result.body.email} updated it's info`);

        // User has changed he's info, refresh user object
        await this.router.navigateByUrl(routes.myProfile);
        await this.userService.refresh();
    }
}
