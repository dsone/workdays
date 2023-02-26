import __ from '../objects/I18n';
import Break from '../objects/Break';
import Workday from '../objects/Workday';
import CalendarInstance from '../objects/Calendar';

import { Sickness, Vacation, Holiday } from '../objects/Absent';
import { For, onMount, createSignal, Show, createEffect, untrack } from 'solid-js';

export default function Calendar(props) {
	let [ availableSelection, setAvailableSelection ] = createSignal({ years: false, months: false, weekDays: false });
	let [ currentSelection, setCurrentSelection ] = createSignal({ year: false, month: false, weekDay: false }); // undefined is to trigger in onMount the chart creation by forcing a "change" to "all"

	let cal = new CalendarInstance();
	const firstToUpper = str => {
		return str.charAt(0).toUpperCase() + str.slice(1);
	};

	const isValidSelection = (year, month, weekDay) => {
		let allYears = year === 'all';
		if (allYears) {
			// only "all"
			if (month === false && weekDay === false) {
				return cal.getDays().length > 0;
			}
			// all + month + weekday
			if (month !== false && weekDay !== false) {
				return cal.getDaysByMonthAndWeekDay(month, weekDay).length > 0;
			}
			// all + month
			if (month !== false && weekDay === false) {
				return cal.getDaysByMonth(month).length > 0;
			}
			// all + weekday
			if (month === false && weekDay !== false) {
				return cal.getDaysByWeekDay(weekDay).length > 0;
			}
		}

		// Only weekDay
		if (year === false && month === false && weekDay !== false) {
			return cal.getDaysByWeekDay(weekDay).length > 0;
		}

		// Only month
		if (year === false && month !== false && weekDay === false) {
			return cal.getDaysByMonth(month).length > 0;
		}

		// Only year
		if (year !== false && month === false && weekDay === false) {
			return cal.getDaysByYear(year).length > 0;
		}

		// year + month
		if (year !== false && month !== false && weekDay === false) {
			return cal.getDaysByYearAndMonth(year, month).length > 0;
		}

		// year + weekday
		if (year !== false && month === false && weekDay !== false) {
			return cal.getDaysByYearAndWeekDay(year, weekDay).length > 0;
		}

		// month + weekday
		if (year === false && month !== false && weekDay !== false) {
			return cal.getDaysByMonthAndWeekDay(month, weekDay).length > 0;
		}

		// year + month + weekday
		if (year !== false && month !== false && weekDay !== false) {
			return cal.getDaysByYearMonthAndWeekDay(year, month, weekDay).length > 0;
		}

		return true;
	};
	const updateSelection = (year, month, weekDay) => {
		if (year === currentSelection().year && month === currentSelection().month && weekDay === currentSelection().weekDay) {
			return;
		}
		setCurrentSelection({ year, month, weekDay });

		// reset
		if (year === false && month === false && weekDay === false) {
			return props.changeChartData(null, null);
		}

		let allYears = year === 'all';
		if (allYears) {
			// only "all"
			if (month === false && weekDay === false) {
				return props.changeChartData(cal.getData(), __('calendar.Total'));
			}
			// all + month + weekday
			if (month !== false && weekDay !== false) {
				return props.changeChartData(cal.getDataByMonthAndWeekDay(month, weekDay), `${ firstToUpper(weekDay) }s ${ __('calendar.in') } ${ month }`);
			}
			// all + month
			if (month !== false && weekDay === false) {
				return props.changeChartData(cal.getDataByMonth(month), `${ month }`);
			}
			// all + weekday
			if (month === false && weekDay !== false) {
				return props.changeChartData(cal.getDataByWeekDay(weekDay), `${ firstToUpper(weekDay) }s`);
			}
		}

		// Only weekDay
		if (year === false && month === false && weekDay !== false) {
			return props.changeChartData(cal.getDataByWeekDay(weekDay), `${ firstToUpper(weekDay) }s`);
		}

		// Only month
		if (year === false && month !== false && weekDay === false) {
			return props.changeChartData(cal.getDataByMonth(month), `${ month }`);
		}

		// Only year
		if (year !== false && month === false && weekDay === false) {
			return props.changeChartData(cal.getDataByYear(year), `${ year }`);
		}

		// year + month
		if (year !== false && month !== false && weekDay === false) {
			return props.changeChartData(cal.getDataByYearAndMonth(parseInt(year), month), `${ month } (${ year })`);
		}

		// year + weekday
		if (year !== false && month === false && weekDay !== false) {
			return props.changeChartData(cal.getDataByYearAndWeekDay(year, weekDay), `${ firstToUpper(weekDay) } (${ year })`);
		}

		// month + weekday
		if (year === false && month !== false && weekDay !== false) {
			return props.changeChartData(cal.getDataByMonthAndWeekDay(month, weekDay), `${ firstToUpper(weekDay) } (${ month })`);
		}

		// year + month + weekday
		if (year !== false && month !== false && weekDay !== false) {
			return props.changeChartData(cal.getDataByYearMonthAndWeekDay(year, month, weekDay), `${ firstToUpper(weekDay) }s ${ __('calendar.in') } ${ month } (${ year })`);
		}
	};

	createEffect(() => {
		if (!props.workData().length) {
			return;
		}

		cal = new CalendarInstance();
		props.workData().forEach(origRow => {
			let row = origRow.split(';');

			let _breaks = [];
			if (row[3] !== '-') {
				_breaks = row[3].split(',').map(time => {
					let _s = time.split('->');
					return new Break(_s[0], _s[1]);
				});
			}
			let _sick = undefined;
			let _vac = undefined;
			let _hol = undefined;
			if (row[6] == 1) {
				_hol = new Holiday();
			} else if (row[5] != 0) {
				_vac = new Vacation(row[5] == 1 ? '00:00' : row[5]);
			} else if (row[4].match(/^\d{2}:\d{2}$/)) {
				_sick = new Sickness(row[4]);
			}

			let _wd = new Workday({
				date: row[0],
				startTime: row[1],
				endTime: row[2],
				breaks: _breaks,
				sick: _sick,
				vacation: _vac,
				holiday: _hol,
				notes: row[7].length ? row[7] : undefined,
				origRow
			});

			cal.addWorkday(_wd);
		});

		setAvailableSelection({
			years: cal.getYears(),
			months: cal.getMonths(),
			weekDays: cal.getWeekDays(),
		});

		// must be untracked, or memory usage goes through the roof, crashing the tab
		untrack(() => {
			updateSelection('all', false, false);  // triggers "all" days
			props.changeChartData(cal.getData(), __('calendar.Total'));
		});
	});

	onMount(() => {
		if (!props.changeChartData) {
			throw('Calendar: props.changeChartData is not defined');
		}
		if (!props.workData()) {
			throw('Calendar: props.workData is not defined');
		}

		props.setCalendar && props.setCalendar(cal);
	});

	return (
		<div class="xl:mb-4 2xl:mb-10">
			<h2 class="text-xl text-center mb-1">{ __('calendar.Workdays') }</h2>
			<Show when={ availableSelection().weekDays.length > 0 }>
				<div class="flex md:flex-row flex-col">
					<div class="">
						<ul class="flex flex-row flex-wrap text-sm">
						<For each={ availableSelection().weekDays }>
							{ weekDay => {
								return (
									<li class="pt-3">
										<button class="btn" classList={{ 'btn--active': currentSelection().weekDay == weekDay, 'btn--default': currentSelection().weekDay != weekDay, 'btn--disabled': !isValidSelection(currentSelection().year, currentSelection().month, weekDay) }} onClick={ (e) => updateSelection(currentSelection().year, currentSelection().month, currentSelection().weekDay === weekDay ? false : weekDay) }>{ weekDay }</button>
									</li>
								);
							}}
						</For>
						</ul>
					</div>

					<div class="mt-4 md:mt-0 md:flex-1 flex flex-row justify-end">
						<ul class="flex flex-row items-end text-sm">
							<li class="">
								<button class="btn" classList={{ 'btn--active': currentSelection().year === 'all', 'btn--default': currentSelection().year !== 'all' }} onClick={ e => updateSelection(currentSelection().year === 'all' ? false : 'all', currentSelection().month, currentSelection().weekDay) }>{ __('calendar.Total') }</button>
							</li>

							<For each={ availableSelection().years }>
								{ year => (
									<li>
										<button class="btn" classList={{ 'btn--active': currentSelection().year == year, 'btn--default': currentSelection().year != year, 'btn--disabled': !isValidSelection(year, currentSelection().month, currentSelection().weekDay) }} onClick={ e => updateSelection(currentSelection().year === year ? false : year, currentSelection().month, currentSelection().weekDay) }>
											{ year }
										</button>
									</li>
								)}
							</For>
						</ul>
					</div>
				</div>
			</Show>

			<Show when={ availableSelection().months.length > 0 }>
				<div class="mt-1">
					<ul class="flex flex-row flex-wrap text-sm" classList={{ 'justify-around md:justify-between': availableSelection().months.length > 6 }}>
					<For each={ availableSelection().months }>
						{ month => (
							<li class="pt-3">
								<button class="btn" classList={{ 'btn--active': currentSelection().month === month, 'btn--default': currentSelection().month !== month, 'btn--disabled': !isValidSelection(currentSelection().year, month, currentSelection().weekDay) }} onClick={ (e) => updateSelection(currentSelection().year, currentSelection().month === month ? false : month, currentSelection().weekDay) }>
									{ month }
								</button>
							</li>
						)}
					</For>
					</ul>
				</div>
			</Show>
		</div>
	);
}
