import { Time, Holiday } from "../interfaces/interfaces";

/**
 * Database Helper function.
 * @export
 * @class DatabaseHelpers
 */
export class DatabaseHelpers {
    public static TWENTYFOUR_HOURS_TO_MINUTES: number = 24 * 60;

    /**
     * Returns the distance in kms between the first and second positions.
     * @param {number} lng1 - The longitude of the first position.
     * @param {number} lat1 - The latitude of the first position.
     * @param {number} lng2 - The longitude of the second position.
     * @param {number} lat2 - The latitude of the second position.
     * @returns {number} - the distance in kms between the first and second positions.
     * @see https://en.wikipedia.org/wiki/Haversine_formula
    */
    public static _calculateDistance(lng1: number, lat1: number, lng2: number, lat2: number): number {
        let R = 6371; // Radius of the earth in km
        [lng1, lat1, lng2, lat2] = [lng1, lat1, lng2, lat2].map(x => x / 180 * Math.PI); //Convert to degrees
        let dLat = lat2 - lat1;
        let dLon = lng2 - lng1;
        let a = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dLon / 2), 2);
        let d = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return d;
    }

    /**
     * Returns true, if the given day, month, year is a valid holiday in Almada (or Portugal).
     * @param {Array<Holiday>} holidays - The array of holidadys in Almada (until the end of 2020).
     * @param {Time} [time] - The time information (day, month etc), current or a given.
     * @returns {boolean} - true, if the given day, month, year is a valid holiday in Almada (or Portugal), false, otherwise.
     * @see https://www.calendarr.com/portugal/feriados-2018/
     * @see http://stackoverflow.com/a/32362657
     */
    public static isHolidayInAlmada(holidays, time?: Time): boolean {
        if (!time)
            time = this.getTime();
        return holidays[time.day + "," + time.month + "," + time.year] !== undefined;
    }

    /**
     * Returns true, if the given day, month is between jully 15 and september 7.
     * @param {number} day - The day.
     * @param {number} month - The month
     * @returns {boolean} - true, if the given day, month is between jully 15 and september 7, false, otherwise.
     */
    private static isSummer(day: number, month: number): boolean {
        return (month == 7 && day > 14) || (month == 8) || (month == 9 && day < 8);
    }

    /**
     * Converts the current Date of the device to our custom Time interface.
     * @returns {Time} - the conversion of the current Date of the device to our custom Time interface.
     */
    public static getTime(): Time {
        let date = new Date();

        let dayOfMonth = date.getDate();//Dia do mes (1-31)
        let month = date.getMonth();//0-11
        let year = date.getFullYear();

        let dayOfWeek = date.getDay();//Dia da semana(0-6)

        let hours = date.getHours();//Hora 0-23
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        return {
            day: dayOfMonth,
            month: month + 1,
            year: year,
            dayOfWeek: dayOfWeek,
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            hoursPlusMinutesToMinutes: (hours >= 0 && hours <= 4) ? hours * 60 + minutes + this.TWENTYFOUR_HOURS_TO_MINUTES : hours * 60 + minutes
        };
    }

    /**
     *Get the day type id. Returns 3, if Sunday or it's an Holiday in Almada, 2 if Saturday, 1, otherwise.
     * @param {boolean} isHolidayInAlmada - Is holiday in Almada or not.
     * @param {Time} [time] - The time information (day, month etc), current or given.
     * @returns {number} - 3, if Sunday or it's an Holiday in Almada, 2 if Saturday, 1, otherwise.
     * @see http://stackoverflow.com/a/17221532
     */
    public static getDayTypesId(isHolidayInAlmada: boolean, time?: Time): number {
        let dayOfWeek: number = time ? time.dayOfWeek : this.getTime().dayOfWeek;
        return (dayOfWeek == 0 || isHolidayInAlmada) ? 3 : dayOfWeek == 6 ? 2 : 1;
    }

    /**
     * Returns 2 if it's summer schedules, 1 if it's winter schedules.
     * @param {Time} [time] - The time information (day, month etc), current or given.
     * @returns {number} - 2 if it's summer schedules, 1 if it's winter schedules.
     */
    public static getSchedulesTypesId(time?: Time): number {
        if (!time)
            time = this.getTime();
        return this.isSummer(time.day, time.month) ? 2 : 1;
    }
}
