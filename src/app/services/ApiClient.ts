import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Logger } from "./Logger";
import { firstValueFrom } from 'rxjs';
import { KeyValueInterface } from '../interfaces/keyvalue.interface';

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
    private baseUrl = 'http://localhost:3000/api';
    private token?: string;

    constructor(
        private readonly http: HttpClient,
        private readonly logger: Logger
    ) { }

    async post(url: string, body?: KeyValueInterface, headers?: KeyValueInterface): Promise<Response> {
        url = this.baseUrl + url;
        const apiUrl = `GET ${url}`;
        this.logger.log(`Send request ${apiUrl}`);

        if (body === undefined) {
            body = {};
        }

        if (headers === undefined) {
            headers = {};
        }
        if (this.token && headers['Authorization'] === undefined) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const request = this.http.post<Response>(url, body, {headers: headers});

        const response = await firstValueFrom(request).catch((response: Response) => {
            if (!response.error) {
                response.error = {
                    statusCode: response.status,
                    message: response.message ?? response.statusText,
                    error: response.statusText
                }
            }
            response.message = response.error.message;

            this.logger.log(`Request ${apiUrl} failed`, response)

            return response;
        });

        if (response.status === undefined && response.ok === undefined) {
            this.logger.log(`Request ${apiUrl} successful`, response)

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