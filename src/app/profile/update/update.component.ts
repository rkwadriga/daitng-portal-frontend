import { Component, OnInit } from '@angular/core';
import { User, UserService } from "../../services/user.service";
import { ApiService } from "../../services/api.service";
import { Notifier } from "../../services/Notifier";
import { routes } from "../../config/routes";
import { genders } from "../../config/genders";
import { Gender } from "../gender.enum";
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { dateFormatPattern, isDateValid, yearsFromDate } from "../../helpers/time.helper";
import { environment } from "../../../environments/environment";
import { apiUrls } from "../../config/api";
import { LoggerService } from "../../services/logger.service";
import { Router } from "@angular/router";
import { orientations } from "../../config/orientations";
import { enumsKeysToArray, inArray } from "../../helpers/array.helper";

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss']
})
export class UpdateComponent implements OnInit {
    user?: User;
    routes = routes;
    genders = genders;
    orientations = orientations;
    validationForm?: FormGroup;

    constructor(
        private readonly userService: UserService,
        private readonly api: ApiService,
        private readonly router: Router,
        private readonly notifier: Notifier,
        private readonly logger: LoggerService
    ) { }

    async ngOnInit() {
        this.user = await this.userService.getUser();

        this.validationForm = new FormGroup({
            email: new FormControl(this.user?.email, [
                Validators.required,
                Validators.email
            ]),
            firstName: new FormControl(this.user?.firstName, [
                Validators.minLength(2),
                Validators.maxLength(50),
            ]),
            lastName: new FormControl(this.user?.lastName, [
                Validators.minLength(2),
                Validators.maxLength(50),
            ]),
            gender: new FormControl(this.user?.gender, [this.genderValidator]),
            orientation: new FormControl(this.user?.orientation, [this.orientationValidator]),
            showGender: new FormControl(this.user?.showGender, [this.showGenderValidator]),
            birthday: new FormControl(this.user?.birthday, [
                Validators.required,
                Validators.pattern(dateFormatPattern),
                this.dateValidator,
                this.ageValidator
            ]),
            about: new FormControl(this.user?.about, [
                Validators.minLength(2),
                Validators.maxLength(5000),
            ]),
        });
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
