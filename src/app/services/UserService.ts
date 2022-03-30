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

export interface Token extends KeyValueInterface {
    accessToken: string,
    refreshToken: string
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(
        private readonly api: ApiClient,
        private readonly logger: Logger
    ) { }

    public token?: Token;
    public user?: User;

    async login(params: LoginParams): Promise<User> {
        const response = await this.api.call(apiUrls.login, params);
        if (!response.ok) {
            const message = `Can not login user ${params.username}: ${response.error?.message}.`;
            this.logger.log(message, response.error);
            throw new Error(message);
        }

        this.token = response.body.token;

        this.logger.log(`User ${params.username} successfully logged in.`, this.token);

        return this.user = Object.assign(new User('', ''), response.body);
    }
}