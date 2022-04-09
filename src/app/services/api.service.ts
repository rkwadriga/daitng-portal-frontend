import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { LoggerService } from "./logger.service";
import { firstValueFrom } from 'rxjs';
import { KeyValueInterface } from '../interfaces/keyvalue.interface';
import { environment } from '../../environments/environment';
import { ApiUrl, apiUrls } from "../config/api";
import {inArray} from "../helpers/array.helper";

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
export class ApiService {
    private baseUrl: string;
    public token?: Token;

    constructor(
        private readonly http: HttpClient,
        private readonly logger: LoggerService
    ) {
        this.baseUrl = environment.apiUrl;
        const token = localStorage.getItem('ApiClient.token');
        if (token !== null) {
            this.token = JSON.parse(token);
        }
    }

    setToken(token?: Token): void {
        this.token = token;
        if (this.token === undefined) {
            localStorage.removeItem('ApiClient.token');
        } else {
            localStorage.setItem('ApiClient.token', JSON.stringify(this.token));
        }
    }

    async call(apiUrl: ApiUrl, body?: any, headers?: KeyValueInterface, firstRequest = true): Promise<Response> {
        let url = this.baseUrl + apiUrl.path;
        const apiRequest = `${apiUrl.method} ${url}`;
        const isAuthRequest = inArray(apiUrl.path, [apiUrls.login.path, apiUrls.registration.path, apiUrls.refreshToken.path]);

        //this.logger.log(`Send request ${apiRequest}`);

        // Add rul params to url
        if (apiUrl.params !== undefined) {
            Object.keys(apiUrl.params).forEach(key => {
                const paramValue = apiUrl.params?.[key];
                if (paramValue === '' || paramValue === undefined) {
                    return;
                }
                if (url.includes(`:${key}`)) {
                    url = url.replace(`:${key}`, paramValue);
                } else {
                    if (url.includes('?')) {
                        url += '&';
                    } else {
                        url += '?';
                    }
                    url += `${key}=${paramValue}`;
                }
            });
        }

        if (body === undefined) {
            body = {};
        }

        if (headers === undefined) {
            headers = {};
        }
        if (!isAuthRequest && this.token !== undefined && headers['Authorization'] === undefined) {
            headers['Authorization'] = `Bearer ${this.token.accessToken}`;
        }

        const requestParams = {body: body, headers: headers};
        const request = this.http.request<Response>(apiUrl.method, url, requestParams);

        let response = await firstValueFrom(request).catch((response: Response) => {
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

        //this.logger.log(`Request ${apiRequest} successful`, response);
        if (response === null) {
            throw Error(`There is no response from request ${apiRequest} given`);
        }

        // Refresh token
        if (
            response.error?.statusCode === 401 &&
            response.error.message === 'Expired token' &&
            !isAuthRequest &&
            firstRequest &&
            this.token
        ) {
            const prevApiUrl = apiUrl, prevBody = body, prevHeaders = headers;
            response = await this.call(apiUrls.refreshToken, {
                accessToken: this.token.accessToken,
                refreshToken: this.token.refreshToken
            });
            // If token is refreshed - make an old request one more time
            if (response.ok) {
                this.setToken(response.body.token);
                prevHeaders['Authorization'] = undefined;
                return this.call(prevApiUrl, prevBody, prevHeaders, false);
            }
        }

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
