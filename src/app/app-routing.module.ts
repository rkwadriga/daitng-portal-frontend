import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AuthComponent} from "./auth/auth.component";
import {LoginComponent} from "./auth/login/login.component";
import {RegistrationComponent} from "./auth/registration/registration.component";
import {DatingComponent} from "./dating/dating.component";
import {AccountsComponent} from "./dating/accounts/accounts.component";

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
