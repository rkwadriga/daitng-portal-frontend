import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AuthComponent} from "./auth/auth.component";
import {LoginComponent} from "./auth/login/login.component";
import {RegistrationComponent} from "./auth/registration/registration.component";
import {DatingComponent} from "./dating/dating.component";
import {AccountsComponent} from "./dating/accounts/accounts.component";
import {ProfileComponent} from "./profile/profile.component";
import {ImagesComponent} from "./profile/images/images.component";
import {UpdateComponent} from "./profile/update/update.component";
import {ChangePasswordComponent} from "./profile/change-password/change-password.component";
import {PersonComponent} from "./dating/person/person.component";
import {InfoComponent} from "./profile/info/info.component";

const routes: Routes = [
    {
        path: 'auth',
        component: AuthComponent,
        children: [
            {
                path: 'login',
                component: LoginComponent
            },
            {
                path: 'registration',
                component: RegistrationComponent
            }
        ]
    },
    {
        path: 'dating',
        component: DatingComponent,
        children: [
            {
                path: 'accounts',
                component: AccountsComponent
            },
            {
                path: 'accounts/:id',
                component: PersonComponent
            }
        ]
    },
    {
        path: 'profile',
        component: ProfileComponent,
        children: [
            {
                path: 'info',
                component: InfoComponent
            },
            {
                path: 'images',
                component: ImagesComponent
            },
            {
                path: 'update',
                component: UpdateComponent
            },
            {
                path: 'change-password',
                component: ChangePasswordComponent
            }
        ]
    },
    {
        path: '**',
        component: AccountsComponent
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
