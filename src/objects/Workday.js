import { Sickness, Vacation, Holiday } from './Absent';
import Break from './Break';

export default class Workday {
	/**
	 * 
	 * date:		Date string in format "YYYY-MM-DD"
	 * startTime:	Time starting work in format "HH:mm"
	 * endTime:		Time ending work in format "HH:mm"
	 * breaks:		Array of Break objects, like lunch, or other breaks
	 * sick:		Sickness object, if employee is sick, contains start time
	 * vacation:	Vacation object, if employee is on vacation, contains start time
	 * holiday:		Boolean, if employee is on holiday
	 * 
	 * @param {JSON} configuration object
	 */
	constructor({ date, startTime, endTime, breaks, sick, vacation, holiday, notes }) {
		this.setDate(date);
		this.setStartTime(startTime);
		this.setEndTime(endTime);
		this.setBreaks(breaks ?? []);

		this.setSick(sick);
		this.setVacation(vacation);
		this.setHoliday(holiday);
		this.notes = notes ?? '';
	}

	getNotes() {
		return this.notes;
	}

	setNotes(notes) {
		this.notes = notes;
	}

	getDate() {
		return this.date;
	}

	setDate(date) {
		if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
			this.date = date;
		} else {
			throw('Invalid date, must be in format YYYY-MM-DD');
		}
	}

	getStartTime() {
		return this.startTime;
	}

	setStartTime(startTime) {
		if (startTime.match(/^\d{2}:\d{2}$/)) {
			this.startTime = startTime;
		} else {
			throw('Invalid start time, must be in format HH:mm');
		}
	}

	/**
	 * Calculates the ideal time fo rending your work.
	 * Takes sick day and half holidays as well as lunchbreaks into account based on a regular 8h/workday.
	 * 
	 * @returns	{string}	Time in format "HH:mm"
	 */
	getIdealEndTime() {
		if (this.sick instanceof Sickness) {
			if (this.sick.getStartTime() === '00:00') {
				return this.getStartTime();
			} else {
				let _sickStart = new Date(`2022-01-01T${ this.sick.getStartTime() }:00`).getTime();
				let _regularEnd = new Date(`2022-01-01T${ this.getEndTime() }:00`).getTime();
				// sickness started after work ended
				if (_sickStart > _regularEnd) {
					return this.getEndTime();
				}

				return this.sick.getStartTime();
			}
		} else if (this.vacation instanceof Vacation) {
			if (this.vacation.getStartTime() === '00:00') {
				return this.getStartTime();
			} else {
				let _vacStart = new Date(`2022-01-01T${ this.vacation.getStartTime() }:00`).getTime();
				let _regularEnd = new Date(`2022-01-01T${ this.getEndTime() }:00`).getTime();
				// vacation started after work ended
				if (_vacStart > _regularEnd) {
					return this.getEndTime();
				}

				return this.vacation.getStartTime();
			}
		} else if (this.holiday) {
			return this.getStartTime();
		} else {
			let totalBreakTime = this.getTotalBreakTime()*1000;
			let _regularStart = new Date(`2022-01-01T${ this.getStartTime() }:00`).getTime();

			let _idealEnd = _regularStart + totalBreakTime + 8*60*60*1000;
			let _idealEndTime = new Date(_idealEnd);

			return `${ (_idealEndTime.getHours() < 10 ? '0' : '') + _idealEndTime.getHours() }:${ (_idealEndTime.getMinutes() < 10 ? '0' : '') + _idealEndTime.getMinutes() }`;
		}
	}

	getEndTime() {
		return this.endTime;
	}

	setEndTime(endTime) {
		if (endTime.match(/^\d{2}:\d{2}$/)) {
			this.endTime = endTime;
		} else {
			throw('Invalid end time, must be in format HH:mm');
		}
	}

	getBreaks() {
		return this.breaks;
	}

	setBreaks(breaks) {
		this.breaks = breaks;
	}

	addBreaks(breaks) {
		if (Array.isArray(breaks)) {
			this.breaks.push(...breaks);
		} else if (breaks instanceof Break) {
			this.breaks.push(breaks);
		} else {
			throw("Invalid breaks, must be an array or single instance of Break objects");
		}
	}

	isSick() {
		return !!this.sick;
	}

	getSick() {
		return this.sick;
	}

	setSick(sick) {
		if (sick instanceof Sickness) {
			this.sick = sick;
		} else if (typeof(sick) !== 'undefined') {
			throw("Invalid sick data type, must be instance of Sickness");
		} else {
			this.sick = false;
		}
	}

	isVacation() {
		return !!this.vacation;
	}

	getVacation() {
		return this.vacation;
	}

	setVacation(vacation) {
		if (vacation instanceof Vacation) {
			this.vacation = vacation;
		} else if (typeof(vacation) !== 'undefined') {
			throw("Invalid vacation data type, must be instance of Vacation");
		} else {
			this.vacation = false;
		}
	}

	isHoliday() {
		return !!this.holiday;
	}

	getHoliday() {
		return !!this.holiday;
	}

	setHoliday(holiday) {
		if (holiday instanceof Holiday) {
			this.holiday = holiday;
		} else if (typeof(holiday) !== 'undefined') {
			throw("Invalid holiday data type, must be instance of Holiday");
		} else {
			this.holiday = false;
		}
	}

	/**
	 * Short form to check if this is generally a day off, whether it's a holiday, sickness, etc.
	 * @returns	{bool}	True if this is a day off.
	 */
	isAbsent() {
		return this.isHoliday() || this.isSick() || this.isVacation();
	}

	/**
	 * @returns {number}	Total time worked in seconds for this workday.
	 */
	getWorkTime() {
		// Holiday beats sickness
		if (this.holiday) {
			return 0;
		}

		let workStart = (new Date(`2022-01-01T${ this.startTime }:00`)).getTime();
		// Sickness beats vacation
		if (this.sick) {
			// if sickness was at 00:00 (midnight) all day was sick -> no work at all
			if (this.sick.startTime === '00:00') {
				return 0;
			}

			// Work ended with sickness start
			let workEnd = (new Date(`2022-01-01T${ this.sick.startTime }:00`)).getTime();

			let breakTime = 0;
			if (this.breaks.length > 0) {
				breakTime = this.breaks.reduce((total, breakObj) => {
					let breakStart = (new Date(`2022-01-01T${ breakObj.startTime }:00`)).getTime();

					// Break started after sickness started - weird but nothing to calculate
					if (breakStart > workEnd) {
						return total;
					}

					let breakEnd = (new Date(`2022-01-01T${ breakObj.endTime }:00`)).getTime();
					if (breakEnd > workEnd) { // break ended after sickness started
						breakEnd = workEnd;  // so sickness start is end of break
					}

					return total + Math.max(0, (breakEnd - breakStart) / 1000);
				}, 0);
			}

			return Math.max(0, (workEnd - workStart) / 1000 - breakTime);
		}

		// Vacation beats workday
		if (this.vacation) {
			return Math.max(
				0, 
				(
					(new Date(`2022-01-01T${ this.vacation.startTime }:00`)).getTime() - 
					(new Date(`2022-01-01T${ this.startTime }:00`)).getTime()
				) / 1000
			);
		}

		let workSeconds = ((new Date(`2022-01-01T${ this.endTime }:00`)).getTime() - (new Date(`2022-01-01T${ this.startTime }:00`)).getTime()) / 1000;

		return workSeconds - this.getTotalBreakTime();
	}

	/**
	 * Does NOT check if the end of the break is waaaay after workday end.
	 * Or if this is a sickday with reduced break time.
	 * 
	 * @returns {int}	Total time of breaks, in seconds.
	 */
	getTotalBreakTime() {
		return this.breaks.reduce((total, _break) => total + _break.duration, 0);
	}

	/**
	 * Returns the total amount of expected work for this day, in seconds.
	 * 
	 * @returns	{int}	Expected time of work this day, in seconds.
	 */
	expectedWorkTime() {
		let regularStart = new Date(`2022-01-01T${ this.getStartTime() }:00`).getTime() / 1000;
		let endTime = new Date(`2022-01-01T${ this.getIdealEndTime() }:00`).getTime() / 1000;

		let diff = endTime - regularStart;
		diff -= this.getTotalBreakTime();

		return diff;
	}
}
