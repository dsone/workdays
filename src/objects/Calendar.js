import Workday from './Workday';
import List from './List';

export default class Calendar {
	constructor() {
		this.summary = new List({});

		this.years = {};/*{
			[year]: {
				_self: List,
				[month]: {
					_self: List,
					[weekDay]: List
				}
			}
		}*/

		// Either we use name for [month] and lose the order and month in int representation, 
		// or the localized name is lost and we cannot resolve names to months from Calendar.jsx
		// so we choose the easy way: use index in months, and use a map to resolve.
		this.mapLocalMonthNameToIndex = {};
		this.months = {};/*{
			[month]: {
				_self: List,
				[weekDay]: List
			}
		}*/
		// listing by day of week, independent of year, weekDay is localized
		this.weekDays = {};/*{
			[weekDay]: List
		}*/
	}

	addWorkdays(workdays) {
		workdays.forEach(_day => this.addWorkday(_day));
	}

	addWorkday(workday) {
		if (!(workday instanceof Workday)) {
			throw("Invalid workday, must be instance of Workday");
		}

		let date = workday.getDate();
		let dateTime = new Date(`${ date }T00:00:00`);
		let year = dateTime.getFullYear();
		let month = dateTime.getMonth() + 1;
		let monthName = dateTime.toLocaleString('default', { month: 'long' });
		let weekDay = dateTime.toLocaleString('default', { weekday: 'long' });

		// Add to years
		this.years[year] = this.years[year] || { _self: new List({}) };
		this.years[year]._self.addWorkDay(workday);
		this.years[year][month] = this.years[year][month] || { _self: new List({}) };
		this.years[year][month]._self.addWorkDay(workday);
		this.years[year][month][weekDay] = this.years[year][month][weekDay] || new List({});
		this.years[year][month][weekDay].addWorkDay(workday);
		this.mapLocalMonthNameToIndex[monthName] = month;

		// Add to months
		this.months = this.months || { _self: new List({}) };
		this.months[month] = this.months[month] || { _self: new List({}) };
		this.months[month]._self.addWorkDay(workday);
		this.months[month][weekDay] = this.months[month][weekDay] || new List({});
		this.months[month][weekDay].addWorkDay(workday);

		// Add to days
		this.weekDays[weekDay] = this.weekDays[weekDay] || new List({});
		this.weekDays[weekDay].addWorkDay(workday);

		// Add to general list
		this.summary.addWorkDay(workday);
	}

	getTotalSickDays() {
		return this.summary.getSickDays();
	}

	getTotalVacationDays() {
		return this.summary.getVacationDays();
	}

	getTotalHolidayDays() {
		return this.summary.getHolidayDays();
	}

	getTotalWorkDays() {
		return this.summary.getTotalWorkDays();
	}

	/**
	 * @returns {int}	Total time of work for all workdays, in seconds.
	 */
	getTotalWorkTime() {
		return this.summary.getDays().reduce((total, day) => total + day.getWorkTime(), 0);
	}

	/**
	 * @returns {int}	Total time of breaks for all workdays, in seconds.
	 */
	getTotalBreakTime() {
		return this.summary.getDays().reduce((total, workday) => total + workday.getTotalBreakTime(), 0);
	}

	/**
	 * Returns all days of a year, if not available, returns an empty list.
	 * 
	 * @param	{int}	year	Year to get days for.
	 * @returns	Array			Array of Workdays, or empty if not available.
	 */
	getDaysByYear(year) {
		try {
			return this.years[year]._self.getDays() || [];
		} catch (e) {
			return [];
		}
	}

	/**
	 * Returns all days for a given year and month and weekDay.
	 * 
	 * @param	{int}		year	The year to get days for.
	 * @param	{int}		month	The month to get days for, starting at 1 for Jan.
	 * @param	{string}	weekDay	The week day to get days for, e.g. 'monday'.
	 * @returns	Array				Array of Workdays, or empty if not available.
	 */
	getDaysByYearMonthAndWeekDay(year, month, weekDay) {
		try {
			if (typeof(month) === 'string') {
				month = this.mapLocalMonthNameToIndex[month] || -1;
			}

			return this.years[year][month][weekDay].getDays() || [];
		} catch (e) {
			return [];
		}
	}

	/**
	 * Returns all days for a given year and month and weekDay.
	 * 
	 * @param	{int|string}	month	The month to get days for, starting at 1 for Jan, or via full length name.
	 * @param	{string}		weekDay	The week day to get days for, e.g. 'monday'.
	 * @returns	Array					Array of Workdays, or empty if not available.
	 */
	getDaysByMonthAndWeekDay(month, weekDay) {
		try {
			if (typeof(month) === 'string') {
				month = this.mapLocalMonthNameToIndex[month] || -1;
			}

			return this.months[month][weekDay].getDays() || [];
		} catch (e) {
			return [];
		}
	}

	/**
	 * Returns all days for a given year and month.
	 * 
	 * @param	{int}	year			The year to get days for.
	 * @param	{int|string}	month	The month to get days for, starting at 1 for Jan, or via full length name.
	 * @returns	Array					Array of Workdays, or empty if not available.
	 */
	getDaysByYearAndMonth(year, month) {
		try {
			if (typeof(month) === 'string') {
				month = this.mapLocalMonthNameToIndex[month] || -1;
			}

			return this.years[year][month]._self.getDays() || [];
		} catch (e) {
			return [];
		}
	}

	/**
	 * Returns all days in a month.
	 * 
	 * @param	{int|string}	month	The month to get days for, starting at 1 for Jan, or via full length name.
	 * @returns	Array					Array of Workdays, or empty if not available.
	 */
	getDaysByMonth(month) {
		try {
			if (typeof(month) === 'string') {
				month = this.mapLocalMonthNameToIndex[month] || -1;
			}

			return this.months[month]._self.getDays() || [];
		} catch (e) {
			return [];
		}
	}

	/**
	 * Returns the days for a specific week day.
	 * Weekdays are localized in full, e.g. for EN: 'Monday'.
	 * 
	 * @param	{string}	weekDay	The weekday to get days for.
	 * @returns	Array				Array of Workdays, or empty if not available.
	 */
	getDaysByWeekDay(weekDay) {
		try {
			return this.weekDays[weekDay].getDays() || [];
		} catch (e) {
			return [];
		}
	}

	/**
	 * Returns all days by a given year and weekDay.
	 * 
	 * @param	{int} 		year	The year to get days for.
	 * @param	{string}	weekDay The week day to get days for, e.g. 'monday'.
	 * @returns	Array				Array of Workdays, or empty if not available.
	 */
	getDaysByYearAndWeekDay(year, weekDay) {
		let days = [];
		Object.keys(this.years[year]).forEach(monthIndex => {
			if (monthIndex === '_self') { return; }

			let r = this.getDaysByYearMonthAndWeekDay(year, parseInt(monthIndex), weekDay);
			days = days.concat(r);
		});

		return days;
	}

	/**
	 * Returns all days, total.
	 * 
	 * @returns Array	Array of all days, total.
	 */
	getDays() {
		return this.summary.getDays();
	}

	/**
	 * Returns all data of a year, if not available, returns an empty list.
	 * 
	 * @param	{int}	year	Year to get data for.
	 * @returns	Object			Object of Workday data, empty if not available.
	 */
	getDataByYear(year) {
		try {
			return this.years[year]._self.getData() || new List({}).getData();
		} catch (e) {
			return new List({}).getData();
		}
	}

	/**
	 * Returns all data for a given year and month and weekDay.
	 * 
	 * @param	{int}		year	The year to get data for.
	 * @param	{int}		month	The month to get data for, starting at 1 for Jan.
	 * @param	{string}	weekDay	The week day to get data for, e.g. 'monday'.
	 * @returns	Object				Object of Workday data, empty if not available.
	 */
	getDataByYearMonthAndWeekDay(year, month, weekDay) {
		try {
			if (typeof(month) === 'string') {
				month = this.mapLocalMonthNameToIndex[month] || -1;
			}

			return this.years[year][month][weekDay].getData() || new List({}).getData();
		} catch (e) {
			return new List({}).getData();
		}
	}

	/**
	 * Returns all data for a given year and month and weekDay.
	 * 
	 * @param	{int|string}	month	The month to get data for, starting at 1 for Jan, or via full length name.
	 * @param	{string}		weekDay	The week day to get data for, e.g. 'monday'.
	 * @returns	Object					Object of Workday data, empty if not available.
	 */
	getDataByMonthAndWeekDay(month, weekDay) {
		try {
			if (typeof(month) === 'string') {
				month = this.mapLocalMonthNameToIndex[month] || -1;
			}

			return this.months[month][weekDay].getData() || new List({}).getData();
		} catch (e) {
			return new List({}).getData();
		}
	}

	/**
	 * Returns all data for a given year and month.
	 * 
	 * @param	{int}	year			The year to get data for.
	 * @param	{int|string}	month	The month to get data for, starting at 1 for Jan, or via full length name.
	 * @returns	Object					Object of Workday data, empty if not available.
	 */
	getDataByYearAndMonth(year, month) {
		try {
			
			if (typeof(month) === 'string') {
				month = this.mapLocalMonthNameToIndex[month] || -1;
			}

			return this.years[year][month]._self.getData() || new List({}).getData();
		} catch (e) {
			return new List({}).getData();
		}
	}

	/**
	 * Returns all data of a month.
	 * 
	 * @param	{int|string}	month	The month to get data for, starting at 1 for Jan, or via full length name.
	 * @returns	Object					Object of Workday data, empty if not available.
	 */
	getDataByMonth(month) {
		try {
			if (typeof(month) === 'string') {
				month = this.mapLocalMonthNameToIndex[month] || -1;
			}

			return this.months[month]._self.getData() || new List({}).getData();
		} catch (e) {
			return new List({}).getData();
		}
	}

	/**
	 * Returns the data for a specific week day.
	 * Weekdays are English, e.g. "monday".
	 * 
	 * @param	{string}	weekDay	The weekday to get data for.
	 * @returns	Object				Object of Workday data, empty if not available.
	 */
	getDataByWeekDay(weekDay) {
		try {
			return this.weekDays[weekDay].getData() || new List({}).getData();
		} catch (e) {
			return new List({}).getData();
		}
	}

	/**
	 * Returns all data by a given year and weekDay.
	 * 
	 * @param	{int} 		year	The year to get data for.
	 * @param	{string}	weekDay The week day to get days for, e.g. 'monday'.
	 * @returns	Object				Object of Workday data, empty if not available.
	 */
	getDataByYearAndWeekDay(year, weekDay) {
		let days = [];
		Object.keys(this.years[year]).forEach(monthIndex => {
			if (monthIndex === '_self') { return; }

			let r = this.getDaysByYearMonthAndWeekDay(year, parseInt(monthIndex), weekDay);
			days = days.concat(r);
		});

		let data = new List({});
		days.forEach(day => {
			data.addWorkDay(day);
		});

		return data.getData();
	}

	/**
	 * Returns all data, total.
	 * 
	 * @returns Array	Array of all days, total.
	 */
	getData() {
		return this.summary.getData();
	}

	/**
	 * Returns the available years, descending.
	 * 
	 * @returns	Array	Array of years, ascending.
	 */
	getYears() {
		return Object.keys(this.years).filter(year => year !== '_self').sort((a, b) => a - b);
	}

	/**
	 * Returns the available months, as strings,
	 * If name is false, the indexes are returned instead, starting at 1 for January.
	 * 
	 * @param	{bool}	byName	If true, the month names are returned, otherwise the indexes.
	 * @returns					Array of month names or indexes.
	 */
	getMonths(byName = true) {
		if (byName) {
			const mapSortMonths = {};  // localized, hence created below
			let monthNames = Object.keys(this.months).reduce((acc, monthIndex) => {
				let name = new Date(
						`2022-${ (parseInt(monthIndex) < 10 ? '0' : '') + monthIndex }-01`
					).toLocaleString('default', { month: 'long' });
				acc[name] = 1;
				mapSortMonths[name] = parseInt(monthIndex);
				return acc;
			}, {});

			return Object.keys(monthNames).sort((a, b) => mapSortMonths[a] - mapSortMonths[b]);
		}

		return Object.keys(this.months).sort((a, b) => a - b);
	}

	/**
	 * Returns the available weekdays, starting at parameter start.
	 * By default that is monday, you can use English and the localized names.
	 * 
	 * @returns Array	Array of lowercase week days, sorted by index.
	 */
	getWeekDays(start = 'monday') {
		let listDays = [ 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' ];
		let mapSortDays = { 'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6, 'sunday': 7 };

		let mapEnToLocalized = {};
		for (let i = 1; i <= 7; ++i) {
			let _date = new Date(`2021-11-0${ i }T00:00:00`);  // conveniently, 1-7th Nov were weekdays Mo->Su
			let localDay = _date.toLocaleString('default', { weekday: 'long' }).toLocaleLowerCase();
			let enDay = _date.toLocaleString('en', { weekday: 'long' }).toLocaleLowerCase();

			mapEnToLocalized[localDay] = enDay;
			mapEnToLocalized[enDay] = enDay;  // if local != en, mapping EN too makes the below change for mapSortDays easier
		}

		if (start !== 'monday' && mapEnToLocalized[start] !== 'monday') {  // if local is EN than we get monday maps to monday, so~
			let index = listDays.indexOf(mapEnToLocalized[start]);
			let begin = listDays.splice(0, index);
			listDays = listDays.concat(begin);

			listDays.forEach((weekDay, index) => mapSortDays[mapEnToLocalized[weekDay]] = index + 1);
		}

		return Object.keys(this.weekDays)
					.sort((a, b) => {
						return mapSortDays[ mapEnToLocalized[a.toLocaleLowerCase()] ] - 
							   mapSortDays[ mapEnToLocalized[b.toLocaleLowerCase()] ];
					});
	}
}
