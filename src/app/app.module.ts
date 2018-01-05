import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Geolocation } from '@ionic-native/geolocation';
import { SQLite } from '@ionic-native/sqlite';
import { NativeStorage } from '@ionic-native/native-storage';

import { DatabaseProvider } from '../providers/database/database';
import { GeolocationProvider } from '../providers/geolocation/geolocation';

@NgModule({
    declarations: [
        MyApp
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(MyApp)
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp
    ],
    providers: [
        StatusBar,
        SplashScreen,
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        LocationAccuracy,
        Geolocation,
        SQLite,
        NativeStorage,
        DatabaseProvider,
        GeolocationProvider
    ]
})
export class AppModule { }
