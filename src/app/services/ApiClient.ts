import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Logger } from "./Logger";
import { firstValueFrom } from 'rxjs';
import { KeyValueInterface } from '../interfaces/keyvalue.interface';
import { environment } from '../../environments/environment';
import { ApiUrl, apiUrls } from "../config/api";

interface ErrorResponse {
    statusCode: number,
    message: string,
    error: string
}

export interface Response {
    url: string,
    ok: boolean,
    status: number,
    statusText: string,
    message: string,
    body: any,
    error?: ErrorResponse
}

export interface Token extends KeyValueInterface {
    accessToken: string,
    refreshToken: string
}

@Injectable({
    providedIn: 'root'
})
export class ApiClient {
    private baseUrl: string;
    public token?: Token;

    constructor(
        private readonly http: HttpClient,
        private readonly logger: Logger
    ) {
        this.baseUrl = environment.apiUrl;
        const token = localStorage.getItem('UserService.token');
        if (token !== null) {
            this.token = JSON.parse(token);
        }
    }

    setToken(token?: Token): void {
        this.token = token;
        if (this.token === undefined) {
            localStorage.removeItem('UserService.token');
        } else {
            localStorage.setItem('UserService.token', JSON.stringify(this.token));
        }
    }

    async call(apiUrl: ApiUrl, body?: KeyValueInterface, headers?: KeyValueInterface): Promise<Response> {
        let url = this.baseUrl + apiUrl.path;
        const apiRequest = `${apiUrl.method} ${url}`;
        this.logger.log(`Send request ${apiRequest}`);

        // Add rul params to url
        if (apiUrl.params !== undefined) {
            Object.keys(apiUrl.params).forEach(key => {
                url = url.replace(`:${key}`, apiUrl.params?.[key] ?? '');
            });
        }

        if (body === undefined) {
            body = {};
        }

        if (headers === undefined) {
            headers = {};
        }
        if (
            apiUrl.path !== apiUrls.login.path &&
            apiUrl.path !== apiUrls.registration.path &&
            this.token !== undefined &&
            headers['Authorization'] === undefined
        ) {
            headers['Authorization'] = `Bearer ${this.token.accessToken}`;
        }

        const requestParams = {body: body, headers: headers};
        const request = this.http.request<Response>(apiUrl.method, url, requestParams);

        const response = await firstValueFrom(request).catch((response: Response) => {
            if (!response.error) {
                response.error = {
                    statusCode: response.status,
                    message: response.message ?? response.statusText,
                    error: response.statusText
                }
            }
            response.message = response.error.message;

            this.logger.log(`Request ${apiRequest} failed (${response.error.statusCode})`, response)

            return response;
        });

        this.logger.log(`Request ${apiRequest} successful`, response);

        if (response.status === undefined && response.ok === undefined) {
            return {
                url: url,
                ok: true,
                status: 200,
                statusText: 'OK',
                message: 'OK',
                body: response,
            };
        }

        return response;
    }
}
