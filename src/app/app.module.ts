import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MdbAccordionModule } from 'mdb-angular-ui-kit/accordion';
import { MdbCarouselModule } from 'mdb-angular-ui-kit/carousel';
import { MdbCheckboxModule } from 'mdb-angular-ui-kit/checkbox';
import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';
import { MdbDropdownModule } from 'mdb-angular-ui-kit/dropdown';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { MdbModalModule } from 'mdb-angular-ui-kit/modal';
import { MdbPopoverModule } from 'mdb-angular-ui-kit/popover';
import { MdbRadioModule } from 'mdb-angular-ui-kit/radio';
import { MdbRangeModule } from 'mdb-angular-ui-kit/range';
import { MdbRippleModule } from 'mdb-angular-ui-kit/ripple';
import { MdbScrollspyModule } from 'mdb-angular-ui-kit/scrollspy';
import { MdbTabsModule } from 'mdb-angular-ui-kit/tabs';
import { MdbTooltipModule } from 'mdb-angular-ui-kit/tooltip';
import { MdbValidationModule } from 'mdb-angular-ui-kit/validation';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthComponent } from './auth/auth.component';
import { LoginComponent } from './auth/login/login.component';
import { RegistrationComponent } from './auth/registration/registration.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { DatingComponent } from './dating/dating.component';
import { AccountsComponent } from './dating/accounts/accounts.component';
import { ImgPipe } from './pipes/img.pipe';
import { ProfileComponent } from './profile/profile.component';
import { ImagesComponent } from './profile/images/images.component';
import { UpdateComponent } from './profile/update/update.component';
import { ChangePasswordComponent } from './profile/change-password/change-password.component';
import { ShortPipe } from './pipes/short.pipe';
import { PersonComponent } from './dating/person/person.component';
import { StoreModule } from '@ngrx/store';
import { InfoComponent } from './profile/info/info.component';
import { PairComponent } from './pair/pair.component';
import { ListComponent } from './pair/list/list.component';
import { DetailComponent } from './pair/detail/detail.component';
import { DialogComponent } from './pair/dialog/dialog.component';

@NgModule({
    declarations: [
        AppComponent,
        AuthComponent,
        LoginComponent,
        RegistrationComponent,
        DatingComponent,
        AccountsComponent,
        ImgPipe,
        ProfileComponent,
        ImagesComponent,
        UpdateComponent,
        ChangePasswordComponent,
        ShortPipe,
        PersonComponent,
        InfoComponent,
        PairComponent,
        ListComponent,
        DetailComponent,
        DialogComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        MdbAccordionModule,
        MdbCarouselModule,
        MdbCheckboxModule,
        MdbCollapseModule,
        MdbDropdownModule,
        MdbFormsModule,
        MdbModalModule,
        MdbPopoverModule,
        MdbRadioModule,
        MdbRangeModule,
        MdbRippleModule,
        MdbScrollspyModule,
        MdbTabsModule,
        MdbTooltipModule,
        MdbValidationModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        StoreModule.forRoot({}, {}),
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
