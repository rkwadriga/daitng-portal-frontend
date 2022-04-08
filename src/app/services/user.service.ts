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
    ) {}

    get isLogged(): boolean {
        return this.api.token !== undefined;
    }

    async login(params: LoginParams): Promise<User> {
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
        return await this.getUser();
    }

    logout(): void {
        this.user.next(null);
        if (this.isLogged) {
            this.api.setToken(undefined);
        }
    }

    async getUser(): Promise<User> {
        if (this.user.getValue() !== null) {
            return this.user.getValue() ?? new User('', '');
        }

        const response = await this.api.call(apiUrls.userInfo);
        if (!response.ok) {
            const message = `Can not get user info: ${response.error?.message}.`;
            this.logger.log(message, response.error);
            throw new Error(message);
        }

        return this.setUser(Object.assign(new User('', ''), response.body));
    }

    public setUser(user: User): User {
        this.user.next(user);

        return user;
    }

    public async refresh() {
        this.user.next(null);
        await this.getUser();
    }
}