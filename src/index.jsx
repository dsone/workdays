import { createSignal, onMount } from 'solid-js';
import { render } from 'solid-js/web';

import __ from './objects/I18n';
import LZString from './objects/LZString';

import './css/index.css';
import Home from './pages/home';
import Notify from './objects/Notify';

function App() {
	let [ workData, setWorkData ] = createSignal([]);
	let [ isDragEnter, setDragEnter ] = createSignal(false);
	let [ history, setHistory ] = createSignal([]);
	let historyMap = {};

	const dropFile = e => {
		e.preventDefault();
		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			if (e.dataTransfer.files[0].type !== 'text/csv') {
				Notify('Error', 'Only CSV files are supported', 'danger');
				return;
			}
			let name = e.dataTransfer.files[0]?.name || null;
			let type = e.dataTransfer.files[0]?.type || null;

			let reader = new FileReader();
			reader.onload = () => {
				let csvData = reader.result;
				if (csvData.length === 0) {
					return;
				}
				csvData = csvData.trim().split('\n');
				let header = csvData[0].split(';');
				if (header.length !== 8) { 
					Notify('Error', 'Invalid CSV file, need 8 columns with semicolon as separator', 'danger');
					return;
				}
				let data = csvData.slice(1);

				if (!!name && !!type && !historyMap[`${ name }_${ type }`]) {
					historyMap[`${ name }_${ type }`] = 1;
					setHistory(history => [ ...history,  { name, type, data } ]);
				}
				setWorkData(data);
			};
			reader.readAsText(e.dataTransfer.files[0]);
			e.dataTransfer.clearData();
			setDragEnter(false);
		}
	};
	const startDrag = e => {
		e.preventDefault();
		!isDragEnter() && setDragEnter(true);
	};
	const stopDrag = e => {
		e.preventDefault();
		isDragEnter() && setDragEnter(false);
	};

	let sampleData = [
	  //date;startWorkTime;endWorkTime;breaks;sick;vacation;holiday;notes
		"2021-11-03;00:00;00:00;-;00:00;0;0;Full day sick",
		"2021-11-04;08:00;17:07;12:00->13:00;0;0;0;Regular workday",
		"2021-11-05;08:00;12:00;-;12:00;0;0;Half day sick",
		"2021-11-06;08:30;17:34;12:30->13:30;0;0;0;Regular workday",
		"2021-11-07;08:30;17:41;12:45->13:45;0;0;0;Regular workday",

		"2021-11-08;08:30;17:24;12:00->12:30,15:00->15:30;0;0;0;Regular workday with multiple breaks",
		"2021-11-09;08:30;17:36;12:30->13:30;0;0;0;Regular workday",
		"2021-11-10;08:00;16:00;12:30->13:45;16:00;0;0;Went home earlier feeling sick",
		"2021-11-11;08:30;17:46;12:30->13:30;0;0;0;Regular workday",
		"2021-11-12;08:30;17:33;12:30->13:30;0;0;0;Regular workday",

		"2021-12-06;00:00;00:00;-;0;1;0;Vacation day 1",
		"2021-12-07;00:00;00:00;-;0;1;0;Vacation day 2",
		"2021-12-08;08:00;12:00;-;0;12:00;0;Half workday off",
		"2021-12-09;08:30;17:26;11:00->12:00,13:30->14:00,15:45->16:15;0;0;0;Regular workday with multiple breaks",
		"2021-12-10;08:30;17:28;12:30->13:30;0;0;0;Regular workday",

		"2021-12-13;08:30;16:32;-;0;0;0;Regular workday without a break",
		"2021-12-14;08:30;17:30;12:30->13:30;0;0;0;Regular workday",
		"2021-12-15;08:00;12:00;-;0;12:00;0;Half workday off",
		"2021-12-16;00:00;00:00;-;0;0;1;Holiday 1",
		"2021-12-17;00:00;00:00;-;0;0;1;Holiday 2",

		/*"2022-01-03;08:00;17:20;12:00->13:00;0;0;0;",
		"2022-01-04;08:00;12:00;-;12:00;0;0;Half day sick",
		"2022-01-05;08:00;16:40;12:00->13:00;0;0;0;",
		"2022-01-06;08:00;12:00;-;0;12:00;0;Half vacation day 1",
		"2022-01-07;08:00;17:00;12:00->13:00;0;0;0;",
		"2022-01-08;08:00;12:00;-;0;12:00;0;Half vacation day 2",
		"2022-01-09;08:00;17:00;12:00->13:00;0;0;0;",

		"2022-01-03;08:00;17:00;12:00->13:00;0;0;0;",
		"2022-01-04;08:00;12:00;-;12:00;0;0;Half day sick",
		"2022-01-05;08:00;17:00;12:00->13:00;0;0;0;",
		"2022-01-06;08:00;17:00;12:00->13:00;0;0;0;",
		"2022-01-07;08:00;17:00;12:00->13:00;0;0;0;",

		"2022-01-03;08:00;17:00;12:00->13:00;0;0;0;",
		"2022-01-04;08:00;12:00;-;12:00;0;0;Half day sick",
		"2022-01-05;08:00;17:00;12:00->13:00,15:00->15:15;0;0;0;",
		"2022-01-06;08:00;12:00;-;0;12:00;0;Half vacation day 1",
		"2022-01-07;08:00;17:00;12:00->13:00;0;0;0;",
		"2022-01-08;08:00;12:00;-;0;12:00;0;Half vacation day 2",
		"2022-01-09;08:00;17:00;12:00->13:00;0;0;0;",*/
	];
	const setSample = type => setWorkData(sampleData);

	const downloadSample = () => {
		let csvData = 'date;startWorkTime;endWorkTime;breaks;sick;vacation;holiday;notes\n';
			csvData += sampleData.join('\n');
		let blob = new Blob([ csvData ], { type: 'text/csv;charset=utf-8;' });
		let url = URL.createObjectURL(blob);
		let a = document.createElement('a');
			a.href = url;
			a.download = 'sample.csv';
			a.click();
			a.remove();
	};

	onMount(() => {
		if (location.hash.match(/#(.+?)=/)) {
			try {
				let fileName = decodeURIComponent(location.hash.match(/#(.+?)=/)[1]);
				let data = location.hash.substring(1).replace(`${ fileName }=`, '');
				console.log(data);

				let csvData = LZString.decompressFromEncodedURIComponent(data);  // returns null if invalid input
				if (!csvData) {
					throw('Decompression failed');
				}

				if (csvData.match(/!##!/)) {
					historyMap[`${ fileName }_csv`] = 1;
					setHistory([ { name: fileName, type: 'csv', data: csvData } ]);

					setWorkData(csvData.split('!##!'));
					Notify('Success!', 'Imported data from link', 'success');
				}
			} catch (e) {
				console.error(e);
				Notify('Invalid Link', 'Invalid data found in hash', 'danger');
			}
		}
	});

	return (
		<div class="z-50 h-full min-h-full" onDrop={ e => dropFile(e) } onDragOver={ e => startDrag(e) } onDragLeave={ e => stopDrag(e) } onClick={ e => { isDragEnter() ? stopDrag(e) : '' }}>
			<div class="z-20 pt-20 text-center absolute top-0 left-0 right-0 bottom-0 bg-gray-400 opacity-75 pointer-events-none" classList={{ 'hidden': !isDragEnter() }}>
				<div class="inline-block p-8 text-white font-bold bg-gray-900 rounded">
					<h3 class="text-lg">{ __('index.Drop CSV file with data anywhere to visualize it') }.</h3>
				</div>
			</div>
			<Show when={ workData().length > 0 }>
				<Home workData={ workData } setWorkData={ setWorkData } history={ history } />
			</Show>
			<Show when={ workData().length === 0 }>
				<div class="flex flex-col justify-center text-center pt-20 pointer-events-none">
					<h2 class="text-xl">{ __('index.What is this?') }</h2>
					<p>
						{ __('index.This is a visualizer tool for your work data') }.<br />
						{ __('index.Drag and drop a CSV file with such data anywhere onto this area to get started') }.
					</p>

					<h3 class="pt-6 text-lg">{ __('index.CSV columns') }</h3>
					<div class="mb-2">
						date;startWorkTime;endWorkTime;breaks;sick;vacation;holiday;notes
					</div>
					<div>
						<strong>{ __('index.Example') }:</strong><br />
						2022-01-01;08:00;17:00;12:00-&gt;13:00;0;0;0;<br />
						2022-01-02;08:00;17:00;11:00-&gt;11:30,14:30-&gt;15:00;0;0;0;{ __('index.Some example note') }
					</div>

					<div class="pt-6">
						{ __('index.You can leave out any days you do not want to be displayed as well, gaps are supported') }.<br />
						{ __('index.Always put in the expected columns in the first row of your CSV') }.
						
					</div>

					<h3 class="pt-6 text-lg">{ __('index.Limitations') }</h3>
					{ __('index.This tool is not meant to be used for work that spans multiple days') }.<br />
					{ __('index.Your work needs to start and end on the same day for this tool to accurately work') }.
					
					<h3 class="pt-6 text-lg">{ __('index.Sample') }</h3>
					{ __('index.Use this sample to get started quickly, simply reload the page to see this text again') }.

					<span class="pt-4" classList={{ 'pointer-events-auto': !isDragEnter() }}>
						<button class="btn btn--default" onClick={ e => setSample() }>{ __('index.Use example') }</button>
						<a class="text-sm" href="#download-sample" onClick={ e => { e.preventDefault(); downloadSample(); } }>{ __('index.Download') }</a>
					</span>
				</div>
			</Show>
		</div>
	);
}

render(
	() => (
		<App />
	),
	document.getElementById('app')
);
