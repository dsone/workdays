import { createEffect, createSignal, onMount } from "solid-js";

import { Chart, ArcElement, LineElement, BarElement, PointElement, BarController, BubbleController, DoughnutController, LineController, PieController, PolarAreaController, RadarController, ScatterController, CategoryScale, LinearScale, LogarithmicScale, RadialLinearScale, TimeScale, TimeSeriesScale, Decimation, Filler, Legend, Title, Tooltip } from 'chart.js';
Chart.register( ArcElement, LineElement, BarElement, PointElement, BarController, BubbleController, DoughnutController, LineController, PieController, PolarAreaController, RadarController, ScatterController, CategoryScale, LinearScale, LogarithmicScale, RadialLinearScale, TimeScale, TimeSeriesScale, Decimation, Filler, Legend, Title, Tooltip);
import 'chartjs-adapter-luxon';

import __ from '../objects/I18n';

export default function ChartElement(props) {
	let [ chart, setChart ] = createSignal(null);
	let [ chartConfig, setChartConfig ] = [ ...props.config ];

	createEffect(() => {
		if (!props.chart() || !chart()) { return; }

		chart().data = props.chart().data;
		chart().options = props.chart().options;
		chart().update();
	});

	let refCanvas;
	onMount(() => {
		const ctx = refCanvas.getContext('2d');
		const myChart = new Chart(ctx, props.chart());

		setChart(myChart);
	});

	return <div class="my-6">
		<h2 class="text-center text-xl">{ props.title() || __('ChartElement.Workdays') }</h2>
		<div class="relative">
			<canvas id="myChart" ref={refCanvas} width="600" height="320" />
			<div class="absolute top-0 left-0 text-sm italic text-gray-400 ml-6">
				{ props.fileName() }
			</div>
		</div>
		<div class="flex flex-row justify-end opacity-25 hover:opacity-100">
			<div class="text-xs transition-opacity duration-500">
				<button class="btn" classList={{ 'btn--active': !chartConfig().hideAbsence, 'btn--default': chartConfig().hideAbsence }} onClick={ e => setChartConfig({ hideAbsence: !chartConfig().hideAbsence })}>{ chartConfig().hideAbsence ? __('ChartElement.Absent days off') : __('ChartElement.Absent days on') }</button>

				<button class="btn" classList={{ 'btn--active': !chartConfig().showStartTime, 'btn--default': chartConfig().showStartTime }} onClick={ e => setChartConfig({ showStartTime: !chartConfig().showStartTime })}>{ chartConfig().showStartTime ? __('ChartElement.Starttime on') : __('ChartElement.Starttime off') }</button>
			</div>
		</div>
	</div>;
}
