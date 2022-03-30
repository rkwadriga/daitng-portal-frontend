import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Logger } from "./Logger";
import { firstValueFrom } from 'rxjs';
import { KeyValueInterface } from '../interfaces/keyvalue.interface';
import { environment } from '../../environments/environment';
import { ApiUrl } from "../config/api";

interface ErrorResponse {
    statusCode: number,
    message: string,
    error: string
}

interface Response {
    url: string,
    ok: boolean,
    status: number,
    statusText: string,
    message: string,
    body: any,
    error?: ErrorResponse
}

@Injectable({
    providedIn: 'root'
})
export class ApiClient {
    private baseUrl: string;
    private token?: string;

    constructor(
        private readonly http: HttpClient,
        private readonly logger: Logger
    ) {
        this.baseUrl = environment.apiUrl;
    }

    async call(apiUrl: ApiUrl, body?: KeyValueInterface, headers?: KeyValueInterface): Promise<Response> {
        const url = this.baseUrl + apiUrl.path;
        const apiRequest = `GET ${url}`;
        this.logger.log(`Send request ${apiRequest}`);

        if (body === undefined) {
            body = {};
        }

        if (headers === undefined) {
            headers = {};
        }
        if (this.token && headers['Authorization'] === undefined) {
            headers['Authorization'] = `Bearer ${this.token}`;
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