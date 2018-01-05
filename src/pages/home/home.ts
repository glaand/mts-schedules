import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
// import { UpcomingMetrosPage } from '../upcoming-metros/upcoming-metros';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { IonicPage } from 'ionic-angular/navigation/ionic-page';

@IonicPage()
@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    public isCordova: boolean = true;

    constructor(public navCtrl: NavController, private locationAccuracy: LocationAccuracy, private alertController: AlertController) {
    }

	/**
	 * Navigate to the upcoming metros page if GPS is enabled, otherwise request the user to enable the GPS,
	 * if he allows then go to the upcoming metros page, if not, then show an alert.
	 * @see https://stackoverflow.com/a/38989751 - Alert  example
	 */
    async upcomingMetrosPage() {
        let isGPSAvailable = await this.GPSIsAvailable();
        this.navCtrl.push('UpcomingMetrosPage', {canAccessGPS: isGPSAvailable})
      /*   if (await this.GPSIsAvailable()) { //this.isCordova
            this.navCtrl.push('UpcomingMetrosPage' , ) // {canAccessGPS: true}
        }
        else {
            const alert = this.alertController.create({ message: 'GPS not available', title: 'GPS', buttons: ['Ok'] });
            alert.present();
            this.navCtrl.push('UpcomingMetrosPage', {canAccessGPS: true})
        } */
    }

	/**
	 * Check if the user has GPS enabled.
	 * If disabled then request access. If access is not granted then go back to the root page.
     * @see https://github.com/dpa99c/cordova-plugin-request-location-accuracy/blob/915b178faebd874f8a1a8b37c14590f7efb5b846/src/android/RequestLocationAccuracy.java#L244
     * @see https://github.com/dpa99c/cordova-plugin-request-location-accuracy/blob/915b178faebd874f8a1a8b37c14590f7efb5b846/src/android/RequestLocationAccuracy.java#L248
	 */
    async GPSIsAvailable() {
        try {
            // if (!await this.locationAccuracy.canRequest()) { //Can request Only if the user revoked access in the app store settings
            await this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
            return true;
        } catch (err) {
            console.log(err, "The user did not allow the use of GPS");
            return false;
        }
    }
}
