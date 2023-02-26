import { createEffect, createSignal, onMount, Show, untrack } from 'solid-js';
import Calendar from '../components/Calendar';

import __ from '../objects/I18n';
import Table from '../components/Table';
import ChartElement from '../components/ChartElement';
import Milliseconds from '../components/ConvertMilliseconds';

import InfoBox from '../components/InfoBox';
import IconSick from '../components/IconSick';
import IconWork from '../components/IconWork';
import IconTime from '../components/IconTime';
import IconLunch from '../components/IconLunch';
import IconVacation from '../components/IconVacation';
import IconHolidays from '../components/IconHolidays';

const getOrCreateTooltip = (chart) => {
	let tooltipEl = chart.canvas.parentNode.querySelector('div.chartjs-tooltip');

	if (!tooltipEl) {
		tooltipEl = document.createElement('div');
		tooltipEl.className = 'chartjs-tooltip';

		const table = document.createElement('table');

		tooltipEl.appendChild(table);
		chart.canvas.parentNode.appendChild(tooltipEl);
	}

	return tooltipEl;
};

const externalTooltipHandler = (context) => {
	// Tooltip Element
	let {chart, tooltip} = context;
	let tooltipEl = getOrCreateTooltip(chart);

	// Hide if no tooltip
	if (tooltip.opacity === 0) {
		tooltipEl.style.opacity = 0;
		return;
	}
	let dataPointInDataSet, day = undefined;
	try {
		dataPointInDataSet = context?.tooltip?.dataPoints[0]?.dataIndex;  // 0 based
		day = context?.tooltip?.dataPoints[0]?.dataset?.days[dataPointInDataSet];
	} catch (e) {
		//
	}

	// Set Text
	if (tooltip.body) {
		let titleLines = tooltip.title || [];
		let bodyLines = tooltip.body.map(b => b.lines);
		let tableHead = document.createElement('thead');

		titleLines.forEach(title => {
			let tr = document.createElement('tr');
			let th = document.createElement('th');
			let text = document.createTextNode(title);

			th.appendChild(text);
			tr.appendChild(th);
			tableHead.appendChild(tr);
		});

		let tableBody = document.createElement('tbody');

		let notes = day && day.getNotes() || '';
		if (notes.length > 0) {
			let tr = document.createElement('tr');
			tr.className = 'noted-row';

			let td = document.createElement('td');
			let text = document.createTextNode(notes);

			td.appendChild(text);
			tr.appendChild(td);
			tableBody.appendChild(tr);
		}

		bodyLines.forEach((body, i) => {
			let colors = tooltip.labelColors[i];

			let span = document.createElement('span');
			span.style.background = colors.backgroundColor;
			span.style.borderColor = colors.borderColor;
			span.style.borderWidth = '2px';
			span.style.marginRight = '10px';
			span.style.height = '10px';
			span.style.width = '10px';
			span.style.display = 'inline-block';

			let tr = document.createElement('tr');
				tr.style.backgroundColor = 'inherit';
				tr.style.borderWidth = 0;

			let td = document.createElement('td');
				td.style.borderWidth = 0;

			let prefix = [ __('home.End'), __('home.Ideal') ];
			// starttime not displayed
			if (bodyLines.length === 3) {
				prefix.unshift('Start');
			}
			let text = document.createTextNode(`${ prefix[i] }: ${ body }`);

			td.appendChild(span);
			td.appendChild(text);
			tr.appendChild(td);
			tableBody.appendChild(tr);
		});

		let eW = day && day.expectedWorkTime() || 0;
		let dW = day && day.getWorkTime() || 0;
		if (eW - dW !== 0) {
			let tr = document.createElement('tr');
				tr.className = 'timed-row';
			let td = document.createElement('td');
			let text = document.createElement('span');
				text.className = eW - dW < 0 ? 'negative' : 'positive';
				text.innerHTML = `${ (eW - dW < 0) ? '+': '-' }${ Math.abs(eW - dW)/60 }min`;

			td.appendChild(text);
			tr.appendChild(td);
			tableBody.appendChild(tr);
		}

		let breaks = day && day.getBreaks() || []; 
		if (breaks.length > 0) {
			let tr = document.createElement('tr');
				tr.className = 'break-head';
			let td = document.createElement('td');
			let text = document.createTextNode(__('home.Break times'));

			td.appendChild(text);
			tr.appendChild(td);
			tableBody.appendChild(tr);

			breaks.forEach(_break => {
				let tr = document.createElement('tr');
				let td = document.createElement('td');
					td.className = 'break-row';
					td.innerHTML = `${ _break.getStartTime() }<span> ⃕ </span>${ _break.getEndTime() }`;

				tr.appendChild(td);
				tableBody.appendChild(tr);
			});
		}

		let tableRoot = tooltipEl.querySelector('table');

		// Remove old children
		while (tableRoot && tableRoot.firstChild) {
			tableRoot.innerHTML = '';
		}

		// Add new children
		tableRoot.appendChild(tableHead);
		tableRoot.appendChild(tableBody);
	}

	let { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

	// Display, position, and set styles for font
	tooltipEl.style.opacity = 1;
	tooltipEl.style.left = positionX + tooltip.caretX + 'px';
	tooltipEl.style.top = positionY + tooltip.caretY + 'px';
	tooltipEl.style.font = tooltip.options.bodyFont.string;
	tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
};

export default function Home(props) {
	let [ calendar, setCalendar ] = createSignal(false);
	let [ chartTitle, setChartTile ] = createSignal('');
	let [ summary, setSummary ] = createSignal({});
	let [ config, setConfig ] = createSignal({ hideAbsence: true, showStartTime: false });
	let [ tab, setTab ] = createSignal(1);
	let [ fileName, setFileName ] = createSignal('sample.csv');
	let [ chartData, setChartdata ] = createSignal({
			type: 'line',
			data: {
				labels: ['Red', 'Orange'],
				datasets: []
			},
			options: {
				interaction: {
					mode: 'index',
					intersect: false,
				},
				animation: false,
				responsive: true,
				scales: {
					y: {
						ticks: {
							callback: function(value, index) {
								let _d = new Date(value);

								return (_d.getHours() < 10 ? '0' : '') + _d.getHours() + ':' + (_d.getMinutes() < 10 ? '0' : '') + _d.getMinutes();
							},
							stepSize: 1000 * 60 * 30,
							//maxTicksLimit: 8
						},
						time: {
							tooltipFormat: 'HH:mm',
						},
						title: {
							display: true,
							text: __('home.Times')
						}
					},
					x: {
						title: {
							display: true,
							text: __('home.Dates')
						}
					}
				},
				plugins: {
					tooltip: {
						enabled: false,
						position: 'nearest',
						external: externalTooltipHandler,
						callbacks: {
							label: function(context) {
								let _d = new Date(context.raw);

								return (_d.getHours() < 10 ? '0' : '') + _d.getHours() + ':' + (_d.getMinutes() < 10 ? '0' : '') + _d.getMinutes();
							}
						}
					},
				}
			}
		});

	const getColor = value => {
		let hue = ( ( (100 - value)/100 ) * 120 ).toString(10);
		return `hsl(${ hue }, 100%, 50%)`;
	};

	const skipped = (ctx, value) => ctx.p0.skip || ctx.p1.skip ? value : undefined;
	const down = (ctx, value) => ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;

	// trigger update of chart creation when config changes
	createEffect(() => {
		config();

		untrack(() => {
			if (!chartTitle() || !chartData().rawData) { return; }
			changeChartData(chartData().rawData, chartTitle());
		});
	});

	const changeChartData = (newChartData, title) => {
		if (newChartData === null) {
			setSummary({});
			return;
		}

		let oldData = { ...chartData() };
		let newLabels = [];
		let newDataSets = [
			{
				label: 'Start', data: [], days: [], backgroundColor: 'rgba(0, 0, 0, 0.4)', borderColor: 'rgba(0, 0, 0, 0.6)', borderWidth: 1, hidden: !config().showStartTime, cubicInterpolationMode: 'monotone',
				segment: {
					borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)'),
					borderDash: ctx => skipped(ctx, [6, 6]),
				},
				spanGaps: true,
			},
			{
				label: __('home.End'), data: [], days: [], backgroundColor: 'rgba(255, 0, 0, 1)', borderColor: 'rgba(255, 0, 0, 1)', borderWidth: 1, cubicInterpolationMode: 'monotone', 
				segment: {
					borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)'),
					borderDash: ctx => skipped(ctx, [6, 6]),
				},
				spanGaps: true,
			},
			{
				type: 'line', label: 'Ideal', data: [], days: [], 
				backgroundColor: 'rgba(255, 255, 255, 0)', borderColor: 'rgba(24, 179, 4, 1)', 
				borderWidth: 1, cubicInterpolationMode: 'monotone', fill: '-1',
				segment: {
					borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)'),
					borderDash: ctx => skipped(ctx, [6, 6]),
				},
				spanGaps: true,
				/*segment: {
					borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)'),
					borderDash: ctx => skipped(ctx, [6, 6]),
				},
				spanGaps: true,*/
			},
			//{ label: 'End', data: [], days: [], backgroundColor: ['rgba(255, 0, 0, 1)'], borderColor: ['rgba(255, 0, 0, 1)'], borderWidth: 1 }
		];
		if (config().hideAbsence) {
			// https://github.com/chartjs/Chart.js/issues/10023
			newDataSets[2]['fill'] = {
					target: '-1',
					above: 'rgba(24, 179, 4, 0.2)',
					below: 'rgba(245, 51, 51, 0.2)',
				};
			newDataSets[2].borderColor = 'rgba(0, 255, 0, 0.1)';
			newDataSets[2].backgroundColor = 'rgba(0, 255, 0, 0.1)';
		}

		let workTime = 0, breakTime = 0, late = 0, workedDays = 0;
		newChartData.days.forEach(day => {
			let isAbsent = false;
			if (day.isVacation() || day.isHoliday()) {
				if (day.isVacation() && day.getVacation().getStartTime() !== '00:00') {
					newDataSets[0].data.push(new Date(`2022-01-01T${ day.getStartTime() }`).getTime());
					newDataSets[1].data.push(new Date(`2022-01-01T${ day.getEndTime() }`).getTime());
					newDataSets[2].data.push(new Date(`2022-01-01T${ day.getIdealEndTime() }`).getTime());

					++workedDays;
				} else {
					if (!config().hideAbsence) {
						newDataSets[0].data.push(undefined);
						newDataSets[1].data.push(undefined);
						newDataSets[2].data.push(undefined);
					}
					isAbsent = true;
				}
			} else if (day.isSick()) {
				if (day.getStartTime() == '00:00') {
					if (!config().hideAbsence) {
						newDataSets[0].data.push(undefined);
						newDataSets[1].data.push(undefined);
						newDataSets[2].data.push(undefined);
					}

					isAbsent = true;
				} else {
					newDataSets[0].data.push(new Date(`2022-01-01T${ day.getStartTime() }`).getTime());
					newDataSets[1].data.push(new Date(`2022-01-01T${ day.getEndTime() }`).getTime());
					newDataSets[2].data.push(new Date(`2022-01-01T${ day.getIdealEndTime() }`).getTime());
					++workedDays;
				}
			} else {
				newDataSets[0].data.push(new Date(`2022-01-01T${ day.getStartTime() }`).getTime());
				newDataSets[1].data.push(new Date(`2022-01-01T${ day.getEndTime() }`).getTime());
				newDataSets[2].data.push(new Date(`2022-01-01T${ day.getIdealEndTime() }`).getTime());

				if (new Date(`2022-01-01T${ day.getEndTime() }`).getTime() > new Date(`2022-01-01T${ day.getIdealEndTime() }`).getTime()) {
					++late;
				}
				++workedDays;
			}

			workTime += day.getWorkTime();
			breakTime += day.getTotalBreakTime();

			// Keep track of the workday objects to access them within chartjs tooltips

			if (config().hideAbsence && isAbsent) {
				return;
			}
			newLabels.push(day.date);
			newDataSets[0].days.push(day);
			newDataSets[1].days.push(day);
			newDataSets[2].days.push(day);
		});

		oldData.data = {
			labels: [ ...newLabels ],
			datasets: newDataSets,
		};
		oldData.rawData = { ...newChartData };

		setSummary({
			sickDays: newChartData.sickDays, 
			vacationDays: newChartData.vacationDays, 
			holidayDays: newChartData.holidayDays, 
			workDays: newChartData.workDays,
			workTimeMinutes: workTime / 60,
			breakTimeMinutes: breakTime / 60,
			late: Math.floor( ((100 / workedDays) * late) * 100 ) / 100,
			overtimeMinutes: (workTime / 60) - (newChartData.workDays * 480),  // assume 8h workday
		});
		setChartdata(oldData);
		setChartTile(`${title}`);
	};

	createEffect(() => {
		if (props.history().length === 0) { return; }
		setFileName(props.history()[props.history().length - 1].name);
	});

	return (
		<div class="z-10 content-section flex items-start justify-center h-full min-h-full" style="min-height: 100%;">
			<div class="lg:max-w-7xl w-full" style="min-height: 100%; height: 100%;">
				<Calendar workData={ props.workData } setCalendar={ setCalendar } changeChartData={ changeChartData } />

				<Show when={ JSON.stringify(summary()) !== '{}' }>
					<div>
						<ul class="flex justify-center items-center my-4 font-semibold">
							<li 
								class="cursor-pointer py-2 px-4 border-b-8" 
								classList={{ 'border-green-400': tab() === 1 }} 
								onClick={ e => setTab(1) }
							>
								{ __('home.Chart') }
							</li>
							<li 
								class="cursor-pointer py-2 px-4 border-b-8" 
								classList={{ 'border-green-400': tab() === 2 }} 
								onClick={ e => setTab(2) }
							>
								{ __('home.Table') }
							</li>
						</ul>
						<div class="relative">
							<Show when={ tab() === 1 }>
								<ChartElement 
									chart={ chartData } 
									title={ chartTitle } 
									config={ [ config, setConfig ] } 
									fileName={ fileName } 
								/>
							</Show>
							<Show when={ tab() === 2 }>
								<Table 
									data={ chartData } 
									title={ chartTitle } 
									config={ [ config, setConfig ] } 
								/>
							</Show>
						</div>
					</div>

					<div class="mt-2 flex flex-row flex-wrap items-center justify-center">
						<div class="mb-4">
							<h3 class="w-full text-center">{ __('home.Summary') }</h3>
							<div class="grid grid-cols-4 gap-2">
								<Show when={ summary().sickDays > 0 }>
									<div class="p-2">
										<div class="px-2 py-0 flex justify-center items-center text-lg rounded-full bg-orange-300">
											<IconSick class="pr-1 inline h-8 cursor-help" /> 
											<span class="cursor-default pl-1 pr-2">{ summary().sickDays }</span>
										</div>
									</div>
								</Show>
								<Show when={ summary().vacationDays > 0 }>
									<div class="p-2">
										<div class="px-2 py-0 flex justify-center items-center text-lg rounded-full bg-green-300">
											<IconVacation class="pr-1 inline h-6 cursor-help" /> 
											<span class="cursor-default pl-1 pr-2">{ summary().vacationDays }</span>
										</div>
									</div>
								</Show>
								<Show when={ summary().holidayDays > 0 }>
									<div class="p-2">
										<div class="px-2 py-0 flex justify-center items-center text-lg rounded-full bg-blue-300">
											<IconHolidays class="pr-1 inline h-6 cursor-help" /> 
											<span class="cursor-default pl-1 pr-2">{ summary().holidayDays }</span>
										</div>
									</div>
								</Show>
								<Show when={ summary().workDays > 0 }>
									<div class="p-2">
										<div class="px-2 py-0 flex justify-center items-center text-lg rounded-full bg-gray-300">
											<IconWork class="pr-1 inline h-6 cursor-help" /> 
											<span class="cursor-default pl-1 pr-2">{ summary().workDays } { __('home.days') }</span>
										</div>
									</div>
								</Show>
							</div>

							<div class="grid grid-cols-4 gap-2">
								<Show when={ !!summary().late }>
									<div class="p-2">
										<div class="px-2 py-0 flex justify-center items-center text-lg rounded-full bg-gray-300" title={ `${ summary().late }%` } style={`background-color: ${ getColor(summary().late) }` }>
											<IconTime class="pr-1 inline h-6 cursor-help" /> 
											<span class="cursor-default pl-1 pr-2">{ summary().late }%</span>
										</div>
									</div>
								</Show>

								<Show when={ !!summary().workTimeMinutes }>
									<div class="p-2">
										<div class="px-2 py-0 flex justify-center items-center text-lg rounded-full bg-gray-300" title={ `${ summary().workTimeMinutes }mins` }>
											<IconWork class="pr-1 inline h-6 cursor-help" /> 
											<span class="cursor-default pl-1 pr-2">
												<Milliseconds to="h" from={ summary().workTimeMinutes * 60 * 1000 } omitSeconds />h
											</span>
										</div>
									</div>
								</Show>

								<Show when={ !!summary().breakTimeMinutes }>
									<div class="p-2">
										<div class="px-2 py-0 flex justify-center items-center text-lg rounded-full bg-gray-300" title={ `${ summary().breakTimeMinutes }mins` }>
											<IconLunch class="pr-1 inline h-6 cursor-help" /> 
											<span class="cursor-default pl-1 pr-2">
												<Milliseconds to="h" from={ summary().breakTimeMinutes * 60 * 1000 } omitSeconds />h
											</span>
										</div>
									</div>
								</Show>

								<Show when={ !!summary().overtimeMinutes }>
									<div class="p-2">
										<div 
											class="px-2 py-0 flex justify-center items-center text-lg rounded-full bg-blue-100" 
											title={ `${ summary().overtimeMinutes > 0 ? __('home.Overtime') : __('home.Short time') } ~${ (summary().overtimeMinutes / 60).toFixed(0) }h` }
										>
											<IconTime class="pr-1 inline h-6 cursor-help" /> 
											<span class="cursor-default pl-1 pr-2">
												<Milliseconds to="m" from={ summary().overtimeMinutes * 60 * 1000 } omitSeconds />mins
											</span>
										</div>
									</div>
								</Show>
							</div>
						</div>
						<div class="mb-4 px-4 flex flex-row items-center justify-center">
							<div class="flex flex-col items-center justify-center">
								<h3>{ __('home.Averages') }</h3>
								<div class="flex flex-col items-center justify-center">
									<Show when={ summary().workDays > 0 }>
										<div class="p-2">
											<div class="px-2 py-0 flex justify-center items-center text-lg rounded-full bg-gray-300">
												<IconWork class="pr-1 inline h-4 cursor-help" /> 
												<span class="cursor-default pl-1 pr-2" title={ `${ Math.floor(summary().workTimeMinutes / summary().workDays) }mins/${ __('home.day') }` }>
													<Milliseconds to="h" from={ Math.floor((summary().workTimeMinutes * 60 * 1000) / summary().workDays) } omitSeconds />h/{ __('home.day') }
												</span>
											</div>
										</div>

										<div class="p-2">
											<div class="px-2 py-0 flex justify-center items-center text-lg rounded-full bg-gray-300">
												<IconLunch class="pr-1 inline h-4 cursor-help" /> 
												<span class="cursor-default pl-1 pr-2" title={ `${ Math.floor(summary().breakTimeMinutes / summary().workDays / 60 * 100)/100 }h/${ __('home.day') }` }>
													<Milliseconds from={ Math.floor(summary().breakTimeMinutes / summary().workDays) * 60 * 1000 } omitSeconds />mins/{ __('home.day') }
												</span>
											</div>
										</div>
									</Show>
								</div>
							</div>

							<Show when={ calendar() }>
								<div class="pl-4 flex flex-col items-center justify-center">
									<h3>{ __('home.Totals') }</h3>
									<div class="flex flex-col items-center justify-center">
										<div class="p-2">
											<div class="px-2 py-0 flex justify-center items-center text-lg rounded-full bg-gray-300">
												<IconWork class="pr-1 inline h-4 cursor-help" /> 
												<span class="cursor-default pl-1 pr-2" title={ `${ Math.floor(calendar().getTotalWorkTime() / 60) }mins` }>
													<Milliseconds to="h" from={ calendar().getTotalWorkTime() * 1000 } omitSeconds />h
												</span>
											</div>
										</div>

										<div class="p-2">
											<div class="px-2 py-0 flex justify-center items-center text-lg rounded-full bg-gray-300">
												<IconLunch class="pr-1 inline h-4 cursor-help" /> 
												<span class="cursor-default pl-1 pr-2" title={ `${ Math.floor((calendar().getTotalWorkTime() / 60 / calendar().getTotalWorkDays())) }min/${ __('home.day') }` }>
													<Milliseconds to="h" from={ (calendar().getTotalWorkTime() / calendar().getTotalWorkDays()) * 1000 } omitSeconds />h/{ __('home.day') }
												</span>
											</div>
										</div>
									</div>
								</div>
							</Show>
						</div>
					</div>
					<div class="flex flex-row justify-center pb-6">
						<InfoBox class="w-72" info>
							{ __('home.Partial sick days and half vacation days are counted towards sick/vacation and work days') }.
						</InfoBox>
					</div>
				</Show>

				<Show when={ props.history().length > 0 }>
					<div class="pb-4 text-gray-300 flex flex-row flex-wrap justify-center items-center">
						<For each={ props.history() }>
							{ item => <span class="px-2 pt-2 hover:text-black">
								<a href="#" onClick={ e => {
										e.preventDefault();
										props.setWorkData(item.data);
										setFileName(item.name);
									}
								}>{ item.name }</a>
							</span> }
						</For>
					</div>
				</Show>
			</div>
		</div>
	);
}
