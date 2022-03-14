export default class List {
	constructor({ sickDays, vacationDays, holidayDays, workDays }) {
		this.data = {
			days: [],
			sickDays: sickDays || 0,
			vacationDays: vacationDays || 0,
			holidayDays: holidayDays || 0,
			workDays: workDays || 0,
		};
	}

	addWorkDays(workDays) {
		workDays.forEach(workday => {
			this.addWorkDay(workday);
		});
	}

	addWorkDay(workDay) {
		this.data.days.push(workDay);

		!!workDay.isSick() && ++this.data.sickDays;
		!!workDay.isHoliday() && ++this.data.holidayDays;
		!!workDay.isVacation() && ++this.data.vacationDays;
		// Days that have been sick but partiallay worked are both: a sickday and a workday, same for vacation
		if (
			(!workDay.isSick() && !workDay.isHoliday() && !workDay.isVacation()) || 
			(workDay.isSick() && workDay.getSick().getStartTime() !== '00:00') ||
			(workDay.isVacation() && workDay.getVacation().getStartTime() !== '00:00')
		) {
			++this.data.workDays;
		}
	}

	getTotalDays() {
		return this.data.days.length;
	}

	getTotalWorkDays() {
		return this.data.workDays;
	}

	getSickDays() {
		return this.data.sickDays;
	}

	getVacationDays() {
		return this.data.vacationDays;
	}

	getHolidayDays() {
		return this.data.holidayDays;
	}

	getTotalDays() {
		return this.data.days.length;
	}

	getDays() {
		return this.data.days;
	}

	getData() {
		return this.data;
	}

	get() {
		return this.data;
	}
}
