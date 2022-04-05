import { KeyValueInterface } from "../interfaces/keyvalue.interface";

export enum RequestMethods {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
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
    registration: {
        method: RequestMethods.POST,
        path: '/auth/registration'
    },
    refreshToken: {
        method: RequestMethods.PUT,
        path: '/auth/refresh'
    },
    userInfo: {
        method: RequestMethods.GET,
        path: '/profile'
    },
    updateProfile: {
        method: RequestMethods.PATCH,
        path: '/profile'
    },
    getUserPhotos: {
        method: RequestMethods.GET,
        path: '/profile/:id/photos',
        params: {id: ''}
    },
    uploadPhotos: {
        method: RequestMethods.POST,
        path: '/profile/photos'
    },
    checkPassword: {
        method: RequestMethods.PUT,
        path: '/profile/password-check',
    },
    updatePassword: {
        method: RequestMethods.PATCH,
        path: '/profile/password',
    },
    datingNextProfile: {
        method: RequestMethods.GET,
        path: '/dating/profiles/next'
    },
    clearDatings: {
        method: RequestMethods.DELETE,
        path: '/dating/profiles'
    }
};
