import { KeyValueInterface } from "../interfaces/keyvalue.interface";

export enum RequestMethods {
    GET = 'GET',
    POST = 'POST',
    PATCH = 'PATCH',
    DELETE = 'DELETE'
}

export interface ApiUrl {
    method: RequestMethods,
    path: string,
    params?: KeyValueInterface
}

export const apiUrls = {
    login: {
        method: RequestMethods.POST,
        path: '/auth/login'
    },
    userInfo: {
        method: RequestMethods.GET,
        path: '/profile'
    }
};