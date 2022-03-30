import { Injectable } from "@angular/core";
import { Logger } from "./Logger";
import { ApiClient } from "./ApiClient";
import { apiUrls } from "../config/api";
import {KeyValueInterface} from "../interfaces/keyvalue.interface";
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

    async login(params: LoginParams): Promise<User> {
        const response = await this.api.call(apiUrls.login, params);
        if (!response.ok) {
            const message = `Can not login user ${params.username}: ${response.error?.message}.`;
            this.logger.log(message, response.error);
            throw new Error(message);
        }

        this.api.setToken(response.body.token);
        this.logger.log(`User ${params.username} successfully logged in.`, response.body.token);

        return this.userEntity = Object.assign(new User('', ''), response.body);
    }

    get isLogged(): boolean {
        return this.api.token !== undefined;
    }

    async getUser(): Promise<User> {
        if (this.userEntity !== undefined) {
            return this.userEntity;
        }
        const response = await this.api.call(apiUrls.userInfo);
        if (!response.ok) {
            const message = `Can not get user info: ${response.error?.message}.`;
            this.logger.log(message, response.error);
            throw new Error(message);
        }

        return this.userEntity = Object.assign(new User('', ''), response.body);
    }
}