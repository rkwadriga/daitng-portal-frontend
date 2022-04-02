import { Injectable } from "@angular/core";
import { Logger } from "./Logger";
import { ApiClient } from "./ApiClient";
import { apiUrls } from "../config/api";
import { KeyValueInterface } from "../interfaces/keyvalue.interface";
import { User } from "../auth/user.entity";

export interface LoginParams extends KeyValueInterface {
    username: string,
    password: string
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private userEntity?: User;

    constructor(
        private readonly api: ApiClient,
        private readonly logger: Logger
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
        this.userEntity = undefined;
        localStorage.removeItem('Current_user');
        if (this.isLogged) {
            this.api.setToken(undefined);
        }
    }

    async getUser(): Promise<User> {
        if (this.userEntity !== undefined) {
            return this.userEntity;
        }

        const storageUser = localStorage.getItem('Current_user');
        if (storageUser !== null) {
            return this.userEntity = Object.assign(new User('', ''), JSON.parse(storageUser));
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
        localStorage.setItem('Current_user', JSON.stringify(user));
        return this.userEntity = user;
    }
}
