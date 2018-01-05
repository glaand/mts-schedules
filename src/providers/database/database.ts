import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject, SQLiteDatabaseConfig } from '@ionic-native/sqlite';
import { NativeStorage } from '@ionic-native/native-storage';
import { Platform } from 'ionic-angular/platform/platform';

import { Station, Holiday, Time, Direction, Schedule, SchedulesByDirection } from '../../interfaces/interfaces';
import { DatabaseHelpers as DBHelpers } from '../../helpers/database-helpers';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/first';

/**
 *
 * @see https://www.youtube.com/watch?v=E6h8PFHMLIU
 * @see https://devdactic.com/ionic-sqlite-queries-database/
 * @see https://angular.io/guide/dependency-injection
 * @export
 * @class DatabaseProvider
 */
@Injectable()
export class DatabaseProvider {
    private readonly TWENTYFOUR_HOURS_TO_MINUTES: number = 24 * 60;
    //Native Storage Keys
    private readonly ns_stationsKey: string = 'stations'; //Key for all stations
    private readonly ns_holidaysKey: string = 'holidays'; //Key for all stations
    private readonly ns_directionsKey: string = 'direction'; //Key for all directions

    private database: SQLiteObject; //The object that can make queries to the database
    private databaseOptions: SQLiteDatabaseConfig = { name: "MTS.db", location: 'default', createFromLocation: 1 };
    private databaseReady: BehaviorSubject<boolean>; // To know if the platform is ready and the database is created
    private readonly queryAllStations: string = 'SELECT * from stations;';
    private stations: Station[]; //Save all stations when we run the query for the 1st time
    private holidays: Holiday[]; //Save all holidays when we run the query for the 1st time
    private directions: Direction[]; //Save all directions when we run the query for the 1st time

    constructor(private platform: Platform, public sqlite: SQLite, public nativeStorage: NativeStorage) {
        console.log('Hello DatabaseProvider Provider');
        this.databaseReady = new BehaviorSubject(false);
        this._platformReady();
    }

    /**
     * Waits for platform ready event, then waits to create/open the database and
     * lastly sets the subject databaseReady to true.
     * @private
     */
    private async _platformReady() {
        await this.platform.ready();
        await this._createDatabase();
        this.databaseReady.next(true); //Observable is now set to true
    }

    /**
     * Create/Open the SQLite database.
     * @private
     */
    private async _createDatabase() {
        try {
            this.database = await this.sqlite.create(this.databaseOptions);
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Waits for the Observable called databaseReady to return a true value.
     * If the databaseReady already is true, then it will execute immediately.
     * @see http://reactivex.io/documentation/subject.html - Subject
     * @see http://www.introtorx.com/Content/v1.0.10621.0/02_KeyTypes.html#BehaviorSubject
     * @see http://reactivex.io/documentation/operators/first.html - First Operator
     * @see https://stackoverflow.com/a/34190965 - toPromise()
     */
    private async _isDatabaseReady() {
        console.time('deviceReadyTime');
        // console.log("behaviorSubjectVal=", this.databaseReady.getValue());
        if (!this.databaseReady.getValue())
            await this.databaseReady.first((val) => { return val === true }).toPromise(); //Wait for the first value that is true
        // console.log("behaviorSubjectVal=", this.databaseReady.getValue());
        console.timeEnd('deviceReadyTime');
    }

    /**
     * Get all stations on the MTS network.
     * @returns {Array<Station>} - the stations on the MTS network.
     */
    public async getAllStations() {
        await this._isDatabaseReady();
        console.time("getStations");
        try {
            if (!this.stations) { //Not yet set
                let stations: any = await this.getNativeStorageItem(this.ns_stationsKey); //Native Storage is faster than SQLite
                if (!stations) {
                    let rows = await this.database.executeSql(this.queryAllStations, []); //Last case scenario look into SQLite
                    stations = rows.allRows;
                    await this.setNativeStorageItem(this.ns_stationsKey, stations);
                }
                this.stations = stations;
            }
        } catch (err) { console.log(err); }
        console.timeEnd("getStations");
        return this.stations;
    }

    /**
     * Get the closest station from the given lng, lat position. Assumes that the variable stations is not empty.
     * @param {number} lng - The longitude of the given position.
     * @param {number} lat - The latitude of the given position.
     * @returns {Station} - the closest station from the given lng, lat position.
     */
    public getClosestStation(lng: number, lat: number): Station {
        let closestStation: Station;
        let minDistance: number = Number.MAX_SAFE_INTEGER;
        for (const station of this.stations) {
            let distanceToStation = DBHelpers._calculateDistance(lng, lat, station.longitude, station.latitude);
            if (distanceToStation < minDistance) {
                closestStation = station;
                minDistance = distanceToStation;
            }
        }
        return closestStation;
    }

    public async getUpcomingSchedulesByDirection(stationId: number) {
        //Get the schedules for the given station id or name
        //Needs stations_id + time_minues + day_types_id (uteis/sab/feriados e dom) + schedule_types_id (verao/inv)
        try {
            console.time("bydirection");
            let [holidays, directions] = await Promise.all([this.getHolidays(), this.getAllDirections()]);
            console.log(holidays);

            let querySQL = `SELECT * FROM schedules WHERE
                        stations_id = ? AND
                        time_minutes >= ? AND
                        day_types_id = ? AND
                        schedule_types_id = ?
                        ORDER BY directions_id ASC`;
            let params: number[] = [
                stationId,
                DBHelpers.getTime().hoursPlusMinutesToMinutes,
                DBHelpers.getDayTypesId(DBHelpers.isHolidayInAlmada(holidays)),
                DBHelpers.getSchedulesTypesId()
            ];
            console.time("dbTime");
            let schedules: Schedule[] = (await this.database.executeSql(querySQL, params)).allRows;
            console.timeEnd("dbTime");

            let schedulesByDirection: SchedulesByDirection[] = [];
            if (schedules.length > 0) {
                let currentDirectionId = schedules[0].directions_id, // The id of the current direction_id
                    startSlice = 0,//To slice all elements of a directions_id
                    numSchedules = schedules.length;
                for (let i = 0; i < numSchedules; i++) {
                    if (schedules[i].directions_id > currentDirectionId || i === numSchedules - 1) { //Found a new or last
                        let endSlice = i === numSchedules - 1 ? numSchedules : i; //If its the last group then slice until the numSchedules
                        schedulesByDirection.push({
                            direction_id: currentDirectionId,
                            direction: directions[currentDirectionId - 1],
                            schedules: schedules.slice(startSlice, endSlice)
                        });
                        currentDirectionId = schedules[i].directions_id;
                        startSlice = i;
                    }
                }
            }
            console.timeEnd("bydirection");
            return schedulesByDirection;
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Returns the list of directions in the MTS network.
     * @returns {Array<Direction>} - the list of directions in the MTS network.
     */
    private async getAllDirections(): Promise<Direction[]> {
        try {
            let directions: any = await this.getNativeStorageItem(this.ns_directionsKey);
            if (!directions) {
                directions = (await this.database.executeSql("SELECT * FROM directions ORDER BY id ASC", [])).allRows;
                await this.setNativeStorageItem(this.ns_directionsKey, directions);
            }
            this.directions = directions;
            return directions;
        } catch (err) {
            console.log(err);
        }
    }

    private async getDistinctDirections(stationId: number) {

    }

    /**
     * Returns the item with key equal to the given name from native storage.
     * @param {string} keyName - The name of the key to search for in the native storage.
     * @returns {JSON} - the value associated with the given key name.
     */
    private async getNativeStorageItem(keyName) {
        try {
            let resultData: JSON;
            await this.nativeStorage.getItem(keyName).then(
                data => { resultData = JSON.parse(data); },
                err => { console.log(err); }
            );
            return resultData;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    /**
     * Set a key-value pair into native storage.
     * @param {string} keyName - The name of the key to set.
     * @param {any} value - The value to associate with the given key.
     * @returns {boolean} - true, if the set operation was successful, false, otherwise.
     */
    private async setNativeStorageItem(keyName, value) {
        try {
            await this.nativeStorage.setItem(keyName, JSON.stringify(value));
            return true;
        } catch (err) {
            console.error(err);
        }
        return false;
    }

    /**
     * DELETE THIS  METHOD JUST CALL DBHelper...
     * Returns true, if the given Time is a valid holiday in Almada.
     * @param {Time} time - The current time read from the device.
     * @returns {boolean} - true, if the given Time is a valid holiday in Almada, false, otherwise.
     */
    private async isHolidayInAlmada(time: Time) {
        return DBHelpers.isHolidayInAlmada(await this.getHolidays(), time);
    }

    /**
     * Returns the list of holidays in Almada until the end of 2020.
     * @returns {Array<Holiday>} - the list of holidays in Almada until the end of 2020.
     */
    private async getHolidays() {
        let holidays: any = await this.getNativeStorageItem(this.ns_holidaysKey);
        if (!holidays) {
            holidays = (await this.database.executeSql('SELECT * from holidays', [])).allRows;
            await this.setNativeStorageItem(this.ns_holidaysKey, holidays);
        }
        this.holidays = holidays;
        return this.holidays; //return statement Could be removed
    }
}
