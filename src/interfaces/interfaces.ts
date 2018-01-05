/*
    This will be used to save any interface that we will need through this application.
*/

/* Interface for the requests to the stations Database Table. */
export interface Station {
    id: number;
    name: string;
    longitude: number;
    latitude: number;
}

/* Interface for the requests to the schedules Database Table. */
export interface Schedule {
    id?: number;
    time_hours?: string;
    time_minutes?: number;
    column?: number;
    directions_id?: number;
    stations_id?: number;
    lines_id?: number;
    schedule_types_id?: number;
    day_types_id?: number;
    /**
     * TODO: Nesta variavel vai ficar a diferenca entre o time_minutes do horario e o time_minutes atual
     * Ex: Time atual 17:00 -> time_minutes 1020
     *     Time do horario: 17:35 -> time_minutes 1055
     *     diffToTimeNow = 35
     */
    diffToTimeNow: number;
}

/**
 * The idea behind this interface is to save all schedules for a particular direction.
 * For example if we request all the schedules for Cacilhas Station then we get n schedules
 * and for those we have a few for direction 1, 2, 5 and 6.
 * With this interface we can save on a object of this type all schedules for direction 1, all for direction 2 and so on.
 */
export interface SchedulesByDirection {
    direction_id: number;//The direction
    direction: Direction;//The full direction with: id, source , destination...
    schedules: Schedule[];//All schedules for this direction
}

/* Interface for the requests to the directions Database Table. */
export interface Direction {
    id: number;
    lines_id: number;
    source: string;
    destination: string;
    time_of_travel: number;
}

/* Interface for the requests to the lines Database Table. */
export interface Line {
    id?: number;
    line?: number;
    number_of_stations?: number;
}

/**
 *  Interface that represents time e.x: 16-09-2017  2 22:10:37 1330
 *  http://www.w3schools.com/jsref/jsref_obj_date.asp
 */
export interface Time {
    day: number;//1-31
    month: number;//0-11
    year: number;
    dayOfWeek: number;//0-6
    hours: number;
    minutes: number;
    seconds: number;
    /**
     * hoursPlusMinutesToMinutes ->
     * Convert for example 05:20 to 320 minutes, counting from midnight.
     * If the hour is after midnight and before 5 AM(300 minutes) then it counts from midnight the day before
     * so we add 1440 minutes (24h * 60m) to our variable
     * Example: 01:20 instead of returning 80 returns 80 + 1440 = 1520
     */
    hoursPlusMinutesToMinutes?: number;
}

/* Interface for Holidays */
export interface Holiday {
    id: number;
    dayMonthYear: string,
    nameOfHoliday: string
}
