export default class Break {
	constructor(startTime, endTime) {
		this.duration = 0;

		this.setStartTime(startTime);
		this.setEndTime(endTime);
	}

	/**
	 * @returns {string}	Start time of break in format HH:mm.
	 */
	getStartTime() {
		return this.startTime;
	}

	/**
	 * @param {string}	startTime	Start time of break in format HH:mm.
	 */
	setStartTime(startTime) {
		if (startTime.match(/^\d{2}:\d{2}$/)) {
			this.startTime = startTime;
		} else {
			throw('Invalid start time, must be in format HH:mm');
		}

		this.#updateDuration();
	}

	/**
	 * @returns	{string}	End time of break in format HH:mm.
	 */
	getEndTime() {
		return this.endTime;
	}

	/**
	 * @param {string}	endTime	End time of break in format HH:mm.
	 */
	setEndTime(endTime) {
		if (endTime.match(/^\d{2}:\d{2}$/)) {
			this.endTime = endTime;
		} else {
			throw("Invalid end time, must be in format HH:mm");
		}

		this.#updateDuration();
	}

	/**
	 * @returns	{number}	Duration of break in seconds.
	 */
	getDuration() {
		return this.duration;
	}

	#updateDuration() {
		if (!!this.startTime && !!this.endTime) {
			this.duration = (
					(new Date(`2022-01-01T${ this.endTime }:00`)).getTime() - (new Date(`2022-01-01T${ this.startTime }:00`)).getTime()
				) / 1000;
		}
	}
}
