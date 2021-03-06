// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    apiSecret: 'UJ6tr09Uizb1WpN4dspl74RtZ100W',
    production: false,
    apiUrl: 'http://localhost:3000/api',
    staticUrl: 'http://localhost:3000/public',
    //socketUrl: 'http://localhost:3001',
    socketUrl: 'ws://localhost:9111',
    minAge: 18,
    defaultUserImagesLimit: 10,
    defaultUserMaximumImageSIze: 15728640, // 15 Mb
    allowedFilesExtensions: 'jpg,jpeg,png',
    chatMessagesLimit: 10
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
