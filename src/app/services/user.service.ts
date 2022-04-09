import { Injectable } from "@angular/core";
import { LoggerService } from "./logger.service";
import { ApiService } from "./api.service";
import { apiUrls } from "../config/api";
import { KeyValueInterface } from "../interfaces/keyvalue.interface";
import { BehaviorSubject } from "rxjs";

export interface LoginParams extends KeyValueInterface {
    username: string,
    password: string
}

export class User {
    constructor(
        public id: string,
        public email: string,
        public firstName?: string,
        public lastName?: string,
        public avatar?: string,
        public gender?: string,
        public orientation?: string,
        public showGender?: string,
        public birthday?: string,
        public age?: number,
        public about?: string,
        public imagesLimit?: number,
        public maximumImageSIze?: number
    ) {}

    get fullName(): string {
        let name = '';

        if (this.firstName !== undefined) {
            name += this.firstName;
        }
        if (this.lastName !== undefined) {
            if (this.firstName !== undefined) {
                name += ' ';
            }
            name += this.lastName;
        }

        return name;
    }

    get fullNameAndEmail(): string {
        const fullName = this.fullName;
        return fullName.length > 0 ? `${fullName} (${this.email})` : this.email;
    }
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private user = new BehaviorSubject<User|null>(null);

    constructor(
        private readonly api: ApiService,
        private readonly logger: LoggerService
    ) {
        this.init();
    }

    private init() {
        // Forget old user's value
        this.user.next(null);

        // If we are not logged there is nothing to do here...
        if (!this.isLogged) {
            return;
        }

        // We are logged! Let's get a user's account info!
        this.api.call(apiUrls.userInfo).then(resp => {
            if (!resp.ok) {
                const message = `Can not get user info: ${resp.error?.message}.`;
                this.logger.log(message, resp.error);
                throw new Error(message);
            }
            const user = Object.assign(new User('', ''), resp.body);
            this.user.next(user);
        });
    }

    get isLogged(): boolean {
        return this.api.token !== undefined;
    }

    async login(params: LoginParams): Promise<BehaviorSubject<User|null>> {
        // Logout current user
        this.logout();

        // Make "POST /auth/login" request
        const response = await this.api.call(apiUrls.login, params);
        if (!response.ok) {
            const message = `Can not login user ${params.username}: ${response.error?.message}.`;
            this.logger.log(message, response.error);
            throw new Error(message);
        }

        // Remember the token
        this.api.setToken(response.body.token);
        this.logger.log(`User ${params.username} successfully logged in.`, response.body.token);

        // Get user info
        this.init();
        return this.getUser();
    }

    logout(): void {
        this.user.next(null);
        if (this.isLogged) {
            this.api.setToken(undefined);
        }
    }

    getUser(): BehaviorSubject<User|null> {
        return this.user;
    }

    public refresh() {
        this.init();
    }
}
