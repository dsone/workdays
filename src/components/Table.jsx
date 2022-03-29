import { createEffect, createSignal, Show } from "solid-js";
import Milliseconds from "./ConvertMilliseconds";

import __ from '../objects/I18n';
import IconSick from '../components/IconSick';
import IconWork from '../components/IconWork';
import IconTime from '../components/IconTime';
import IconVacation from '../components/IconVacation';
import IconHolidays from '../components/IconHolidays';

export default function Table(props) {
	let [ tableData, setTableData ] = createSignal(false);
	let [ tableConfig, setTableConfig ] = [ ...props.config ];

	createEffect(() => {
		if (!props.data()) { return; }

		let tData = [];
		let hideAbsence = tableConfig().hideAbsence;
		props.data().rawData.days.map(d => {
			if (hideAbsence && d.isAbsent() && d.getWorkTime() === 0) {
				return;
			}

			tData.push({
				'Datum': d.date,
				'Start': d.startTime,
				'Ende': d.endTime,
				'Pause von/bis': d.breaks.length ? d.breaks.map(_break => `${_break.startTime}->${ _break.endTime }`).join(', ') : '-',
				'Arbeitszeit': d.getWorkTime() * 1000,
				'Notiz': d.notes || '-',
				day: d
			});
		});
		setTableData(tData);
	});

	return <div class="my-6">
		<h2 class="text-center text-xl mb-2">{ props.title() || 'Workdays' }</h2>
		<div class="max-h-[600px] overflow-y-scroll">
			<Show when={ tableData().length > 0 } fallback={ () => <div class="text-center py-4 font-semibold">{ __('Table.No data available') }</div> }>
			<table class="w-full table table-striped table-bordered table-sm">
				<thead class="text-left">
					<tr>
						<th scope="col">{ __('Table.Date') }</th>
						<th scope="col">{ __('Table.Start') }</th>
						<th scope="col">{ __('Table.End') }</th>
						<th scope="col">{ __('Table.Break from/to') }</th>
						<th scope="col">{ __('Table.Worktime') }</th>
						<th scope="col">{ __('Table.Note') }</th>
					</tr>
				</thead>
				<tbody>
					<Index each={ tableData() }>
						{ (day, index) => {
							return (<tr classList={{ 'bg-green-100': day().Arbeitszeit > 0 && day().Arbeitszeit <= 28800000, 'bg-red-100': day().Arbeitszeit > 0 && day().Arbeitszeit > 28800000, 'bg-gray-200': day().day.sick, 'bg-blue-200': day().day.vacation || day().day.holiday, 'opacity-50 text-xs': day().day.vacation || day().day.holiday || day().day.sick /* on purpose like this */ }}>
								<td class="p-1">
									<Show when={ day().Arbeitszeit > 0 && day().Arbeitszeit > 28800000 }>
										<IconTime class="pr-1 inline h-6 cursor-help" /> 
									</Show>
									<Show when={ day().day.vacation }>
										<IconVacation class="pr-1 inline h-6 cursor-help" /> 
									</Show>
									<Show when={ day().day.holiday }>
										<IconHolidays class="pr-1 inline h-6 cursor-help" /> 
									</Show>
									<Show when={ day().day.sick }>
										<IconSick class="pr-1 inline h-6 cursor-help" /> 
									</Show>
									<Show when={ day().Arbeitszeit > 0 && !day().day.sick && day().Arbeitszeit < 28800000 }>
										<IconWork class="pr-1 inline h-6 cursor-help" /> 
									</Show>
									{ day().Datum }
								</td>
								<td class="p-1">{ day().Start }</td>
								<td class="p-1">{ day().Ende }</td>
								<td class="p-1">{ day()['Pause von/bis'] }</td>
								<td class="p-1">
									<Show when={ day().Arbeitszeit > 0 } fallback={ '-' }>
										<Milliseconds to="h" from={ day().Arbeitszeit } omitSeconds />h&nbsp;
										<span class="text-xs">({ Math.floor((day().Arbeitszeit-28800000)/1000/60) }min)</span>
									</Show>
								</td>
								<td>
									{ day().Notiz }
								</td>
							</tr>);
							}
						}
					</Index>
				</tbody>
			</table>
			</Show>
		</div>
		<div class="mt-2 flex flex-row justify-end opacity-25 hover:opacity-100">
			<div class="text-xs transition-opacity duration-500">
				<button class="btn" classList={{ 'btn--active': !tableConfig().hideAbsence, 'btn--default': tableConfig().hideAbsence }} onClick={ e => setTableConfig({ hideAbsence: !tableConfig().hideAbsence }) && tableData() }>{ tableConfig().hideAbsence ? __('ChartElement.Absent days off') : __('ChartElement.Absent days on') }</button>
			</div>
		</div>
	</div>;
}
