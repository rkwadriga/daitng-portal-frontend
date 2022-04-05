import { environment } from "../../environments/environment";

export const userSettings = {
    defaultUserImagesLimit: environment.defaultUserImagesLimit,
    defaultUserMaximumImageSIze: environment.defaultUserMaximumImageSIze,
    minPasswordLength: 4,
    maxPasswordLength: 50
}
