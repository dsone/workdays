import 'chartjs-adapter-luxon';
import __ from '../objects/I18n';
import Notify from '../objects/Notify';
import ContextMenu from "./ContextMenu";
import LZString from '../objects/LZString';
import { getOffset } from '../objects/Utilities';
import { createEffect, createSignal, onMount } from "solid-js";

import { Chart, ArcElement, LineElement, BarElement, PointElement, LineController, CategoryScale, LinearScale, LogarithmicScale, RadialLinearScale, TimeScale, TimeSeriesScale, Decimation, Filler, Legend, Title, Tooltip } from 'chart.js';
Chart.register( ArcElement, LineElement, BarElement, PointElement, LineController, CategoryScale, LinearScale, LogarithmicScale, RadialLinearScale, TimeScale, TimeSeriesScale, Decimation, Filler, Legend, Title, Tooltip);

export default function ChartElement(props) {
	let [ chart, setChart ] = createSignal(null);
	let [ chartConfig, setChartConfig ] = [ ...props.config ];
	const [ mousePointer, setMousePointer ] = createSignal({ x: 0, y: 0 });
	const [ hideContextMenu, setHideContextMenu ] = createSignal(true);

	createEffect(() => {
		if (!props.chart() || !chart()) { return; }

		chart().data = props.chart().data;
		chart().options = props.chart().options;
		chart().update();
	});

	let refCanvas;
	let canvasPosition = {};
	onMount(() => {
		const ctx = refCanvas.getContext('2d');
		const myChart = new Chart(ctx, props.chart());

		canvasPosition = getOffset(refCanvas);
		refCanvas.addEventListener('contextmenu', event => {
			event.preventDefault();

			setMousePointer({ x: event.pageX - canvasPosition.left - 50, y: event.pageY - canvasPosition.top + 27 });
			setHideContextMenu(false);
		});
		document.addEventListener('click', e => {
			if (e.target.id === 'context-menu') {
				return;
			}

			setHideContextMenu(true);
		})

		setChart(myChart);
	});

	let share = function() {
		setHideContextMenu(true);

		let csv = chart().data.datasets[0].days.map(day => {
				return day.export();
			});
		let csvString = csv.join('!##!');
		let compressedCSV = LZString.compressToEncodedURIComponent(csvString);

		navigator.clipboard.writeText(
			`${ location.protocol }//${ location.hostname }${ (location.port.length > 0 ? ':' + location.port : '') }#${ encodeURIComponent(props.fileName()) }=${ compressedCSV }`
			).then(
				_ => {
					Notify('Success', 'A shareable link was written into your clipboard!', 'success');
				},
				_ => {
					Notify('Writing to Clipboard failed', 'Couldn\'t write shareable link into clipboard!', 'danger');
				}
			);
	};

	// https://stackoverflow.com/a/21015393
	const getTextWidth = function(text, font) {
			// re-use canvas object for better performance
			const canvas = document.createElement('canvas');
			const context = canvas.getContext("2d");
			context.font = font;
			const metrics = context.measureText(text);
			return metrics.width;
		};
	const resizeAndExport = (height, width) => {
			let c = document.createElement('canvas');
				c.width = width; c.height = height+30;
			let ctx = c.getContext('2d');
				ctx.fillStyle = '#FFFFFF';  // some things never change with ChartJs :}
				ctx.fillRect(0, 0, width, height+30);
				ctx.drawImage(refCanvas, 0, 0, refCanvas.width, refCanvas.height, 0, 30, width, height);

				// Set source
				ctx.fillStyle = '#b1b7c0';
				ctx.font = "14px Arial";
				ctx.fillText(props.fileName(), 32, 60);

				// set title
				ctx.fillStyle = '#000';
				ctx.font = "bold 20px Arial";
				ctx.fillText(props.title(), (width - getTextWidth(props.title(), 'bold 22px Arial'))/2, 26);
			let dataUrl = c.toDataURL();
			c.remove();

			return dataUrl;
		};
	const saveImage = function() {
			let base64 = resizeAndExport(1000, 1600);
			let url = base64.replace(/^data:image\/.+?;/, 'data:application/octet-stream;');
			let link = document.createElement('a');
				link.href = url;
			let name =  `${ props.title() }.png`;
				name = name.charAt(0).toUpperCase() + name.slice(1);

			link.download = name;
			document.body.appendChild(link);
			link.click();
			link.remove();  // Firefox needs this to be inserted, while Chrome doesn't care
			setHideContextMenu(true);
		};

	return <div class="my-6">
		<h2 class="text-center text-xl">{ props.title() || __('ChartElement.Workdays') }</h2>
		<div class="relative">
			<canvas id="myChart" ref={refCanvas} width="600" height="320" />
			<div class="absolute top-0 left-0 text-sm italic text-gray-400 ml-7">
				{ props.fileName() }
			</div>
		</div>
		<div class="flex flex-row justify-end opacity-25 hover:opacity-100">
			<div class="text-xs transition-opacity duration-500">
				<button class="btn" classList={{ 'btn--active': !chartConfig().hideAbsence, 'btn--default': chartConfig().hideAbsence }} onClick={ e => setChartConfig({ hideAbsence: !chartConfig().hideAbsence })}>{ chartConfig().hideAbsence ? __('ChartElement.Absent days off') : __('ChartElement.Absent days on') }</button>

				<button class="btn" classList={{ 'btn--active': !chartConfig().showStartTime, 'btn--default': chartConfig().showStartTime }} onClick={ e => setChartConfig({ showStartTime: !chartConfig().showStartTime })}>{ chartConfig().showStartTime ? __('ChartElement.Starttime on') : __('ChartElement.Starttime off') }</button>
			</div>
		</div>

		<ContextMenu id="context-menu" pointer={ mousePointer() } hide={ hideContextMenu() } share={ e => share() } saveImage={ e => saveImage() } />
	</div>;
}
