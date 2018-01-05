import { Component, Input } from '@angular/core';
import { Station } from '../../interfaces/interfaces';

/**
 * Generated class for the StationSelectorComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
    selector: 'station-selector',
    templateUrl: 'station-selector.html',
    styles: ['station-selector.scss']
})
export class StationSelectorComponent {
    // text: string;
    @Input('stations') public stations: Station[]; //List of stations
    @Input('selectedStationName') public selectedStatioName: string; //The name of the selected station
    @Input('labelStr') public labelStr: string = 'Escolher Estação'; //The label for ion-select

    constructor() {
        console.log('Hello StationSelectorComponent Component');
        // this.text = 'Hello World';
    }

    /**
     * Returns the selected station.
     * @returns {Station} - the selected station.
     */
    public getSelectedStation(): Station {
        for (const st of this.stations)
            if (st.name === this.selectedStatioName)
                return st;
    }

    //https://github.com/ionic-team/ionic/issues/7807
    public onSelectChange(event) {
        console.log(event);
    }

}
