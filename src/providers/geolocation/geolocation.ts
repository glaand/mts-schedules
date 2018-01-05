import { Injectable } from '@angular/core';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation';


/*
  Generated class for the GeolocationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class GeolocationProvider {

    private geolocationOpts: GeolocationOptions = { enableHighAccuracy: true, timeout: 5000 };

    constructor(public geolocation: Geolocation) {
        console.log('Hello GeolocationProvider Provider');
    }

    async getUserPosition() {
        try {
            let pos = await this.geolocation.getCurrentPosition(this.geolocationOpts);
            return { lng: pos.coords.longitude, lat: pos.coords.latitude };
        } catch (err) {
            console.log(err);
            return false/* { lng: 0, lat: 0 } */;
            // throw new Error(err);
        }
    }
}
