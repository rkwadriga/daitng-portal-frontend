import { Component, OnInit, OnDestroy } from '@angular/core';
import { routes } from "../../config/routes";
import { ApiService } from "../../services/api.service";
import { Router } from "@angular/router";
import { NotifierService } from "../../services/notifier.service";
import { LoggerService } from "../../services/logger.service";
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { apiUrls } from "../../config/api";
import { KeyValueInterface } from "../../interfaces/keyvalue.interface";
import { User, UserService } from "../../services/user.service";
import { userSettings } from "../../config/user.settings";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
    private subscriptions = new Subscription();
    user: User | null = null;
    routes = routes;
    checkedPasswords: KeyValueInterface = {};

    validationForm = new FormGroup({
        oldPassword: new FormControl('', [
            Validators.required,
            Validators.minLength(userSettings.minPasswordLength),
            Validators.maxLength(userSettings.maxPasswordLength)
        ], (group) => this.oldPasswordValidatorAsync(group)),
        password: new FormControl('', [
            Validators.required,
            Validators.minLength(userSettings.minPasswordLength),
            Validators.maxLength(userSettings.maxPasswordLength),
            this.passwordValidator
        ]),
        retypedPassword: new FormControl('', [
            Validators.required,
            Validators.minLength(userSettings.minPasswordLength),
            Validators.maxLength(userSettings.maxPasswordLength),
            this.retypePasswordValidator
        ]),
    });

    constructor(
        private readonly api: ApiService,
        private readonly userService: UserService,
        private readonly router: Router,
        private readonly notifier: NotifierService,
        private readonly logger: LoggerService
    ) { }

    ngOnInit(): void {
        this.subscriptions.add(this.userService.getUser().subscribe(user => this.user = user));
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    async oldPasswordValidatorAsync(group: AbstractControl): Promise<ValidationErrors | null> {
        const password = group.value;
        if (!password || password.length < userSettings.minPasswordLength) {
            return null;
        }

        if (this.checkedPasswords[password] !== undefined) {
            return this.checkedPasswords[password];
        }

        const response = await this.api.call(apiUrls.checkPassword, {'password': password});
        if (!response.ok) {
            return this.checkedPasswords[password] = {validation: {message: response.error?.message}};
        }

        return this.checkedPasswords[password] = response.body.result ? null : {validation: true};
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
