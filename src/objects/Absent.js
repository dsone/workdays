class Absent {
	constructor(startTime = null) {
		if (!!startTime) {
			this.setStartTime(startTime);
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
}

export class Vacation extends Absent {
	constructor(startTime = null) {
		super(startTime ?? '00:00');
	}
}

export class Sickness extends Absent {
	constructor(startTime = null) {
		super(startTime ?? '00:00');
	}
}

export class Holiday extends Absent {
	constructor() {
		super('00:00');
	}
}
