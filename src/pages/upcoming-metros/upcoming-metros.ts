import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Platform } from 'ionic-angular/platform/platform';

// import { Geolocation } from '@ionic-native/geolocation';
import { StationSelectorComponent } from '../../components/station-selector/station-selector';

import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { Loading } from 'ionic-angular/components/loading/loading';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { Toast } from 'ionic-angular/components/toast/toast';
import { DatabaseProvider } from '../../providers/database/database';
import { Station } from '../../interfaces/interfaces';
import { GeolocationProvider } from '../../providers/geolocation/geolocation';
import { DirectionSchedulesComponent } from '../../components/direction-schedules/direction-schedules';

/**
 * Generated class for the UpcomingMetrosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: 'page-upcoming-metros',
    templateUrl: 'upcoming-metros.html'
})
export class UpcomingMetrosPage {
    public latitude: number;
    public longitude: number;
    public error: string;
    public isCordova: boolean = !true;

    //IMP
    @ViewChild(StationSelectorComponent) stationSelector: StationSelectorComponent; //Access station-selector methods
    public showStationSelector: boolean = false; //To show the station selector custom component when the GPS fails to gather information
    public stations: Station[]; //The MTS existing stations
    /**
     * ionicframework.com/docs/api/components/loading/LoadingController/
     */
    private loader: Loading;
    /**
     * ionicframework.com/docs/api/components/toast/ToastController/
     */
    private toast: Toast;
    /**
     * Closest station or selected station
     */
    public closestStation: Station;

    @ViewChild(DirectionSchedulesComponent) directionSchedules: DirectionSchedulesComponent; //Access station-selector methods


    //@todo Should add location-accuracy and look for canRequest() if its false then dont request
    //GPS and say it cant be used, and choose station

    // SEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE https://devdactic.com/ionic-sqlite-queries-database/
    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public platform: Platform,
        public loadingCtrl: LoadingController,
        private toasCtrl: ToastController,
        private databaseProvider: DatabaseProvider,
        private geolocationProvider: GeolocationProvider) {

        console.log(this.navParams.get('canAccessGPS'));
        console.log('UpcomingMetrosPage');
        this.getSchedulesClosestStation(this.navParams.get('canAccessGPS'));
    }

    //https://lh3.googleusercontent.com/fq0_1j413NEeFxREPsMBo2cB3m8DdbRlf9Z3DJgVMLDrxk454MRb22r2JN0hUgB7O0Q=h310
    public async doRefresh(event) {
        console.log(event);
        // await this.databaseProvider.getUpcomingSchedulesByDirection(this.stationSelector.getSelectedStatioName())
        // event.complete();
        await this.getSchedulesClosestStation(true);
        // event.progress = 80;
        event.complete();
    }

	/**
	 * Get the schedules of the closest station, or if the GPS did not work
     * then let the user choose a station to look for schedules.
	 */
    public async getSchedulesClosestStation(canAccessGPS: boolean) {
        try {
            this._createLoadingElement();


            let [coords, stations] = await Promise.all([
                this.geolocationProvider.getUserPosition(), this.databaseProvider.getAllStations()
            ]);

            console.log(coords, stations);

            if (!coords) { //Geolocation error then
                console.log('inside if');
                this.stations = stations;
                this._dismissLoaderElement();
                this._createToast();
                this.showStationSelector = true;
            } else {
                console.log("Will dismiss");
                this._dismissLoaderElement();
                //Go to database and get the schedules
                let closestStation: Station = await this.databaseProvider.getClosestStation(coords.lng, coords.lat);
                console.log(closestStation);
                this.closestStation = closestStation;
                let schedulesByDirection = await this.databaseProvider.getUpcomingSchedulesByDirection(closestStation.id);
                this.directionSchedules.schedulesByDirection = schedulesByDirection;
            }
        } catch (err) {
            console.error(err);
            this.error = "Error: " + err.message;
            //TODO: Navigate back because there was an unknown error?
        }
    }

    /**
     * Create the loading controller.
     */
    private _createLoadingElement(textContent: string = 'A obter localização da estação mais perto') {
        this.loader = this.loadingCtrl.create({ content: textContent });
        this.loader.present();
    }

    /**
     * Remove the loader after it is not needed anymore.
     */
    private _dismissLoaderElement() {
        this.loader.dismiss();
    }

    /**
     * Create a Toast to show the error information to the user.
     * @param {string} [messageContent='Erro ao ober a sua localização. Escolha uma estação.'] -
     */
    private _createToast(messageContent = 'Erro ao ober a sua localização. Escolha uma estação.') {
        this.toast = this.toasCtrl.create({
            message: messageContent,
            // dismissOnPageChange: true,
            position: 'bottom',
            duration: 8000
        });
        this.toast.present();
    }

    /**
     * Dismiss the Toast element, if needed.
     */
    private _dismissToast() {
        if (this.toast) {
            console.log("dismissToast");
            this.toast.dismiss();
        }
    }

    /**
     * Show the schedules for the selected station.
     */
    public async showSchedules() {
        this._createLoadingElement('A obter horários...');

        //Go to database and get the schedules
        let station = this.stationSelector.getSelectedStation();
        this.closestStation = station;
        console.log(station);
        let schedulesByDirection = await this.databaseProvider.getUpcomingSchedulesByDirection(station.id);
        this._dismissLoaderElement();
        this.showStationSelector = false;
        this.directionSchedules.schedulesByDirection = schedulesByDirection;
    }

    /**
     * Called when the view will leave.
     * @see http://blog.ionicframework.com/navigating-lifecycle-events/
     */
    public ionViewWillLeave() {
        this._dismissToast();
        this._dismissLoaderElement();
    }
}
