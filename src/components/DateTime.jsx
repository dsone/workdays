import { onMount, Show } from "solid-js"

export default function DateTime(props) {
	let [ date, setDate ] = createSignal(false);

	onMount(() => {
		if (!props.format) { return; }

		let _d = new Date( (props.date ?? null) ).getTime();
		let _day = _d.getDate();
			_day = _day < 10 ? '0' + _day : _day;
		let _month = _d.getMonth() + 1;
			_month = _month < 10 ? '0' + _month : _month;
		let _fullYear = _d.getFullYear();
		let _year = _fullYear.toString().substr(-2);
		let _hour = _d.getHours();
			_hour = _hour < 10 ? '0' + _hour : _hour;
		let _min = _d.getMinutes();
			_min = _min < 10 ? '0' + _min : _min;
		let _sec = _d.getSeconds();
			_sec = _sec < 10 ? '0' + _sec : _sec;

		setDate(
			props.format.replace('DD', _day)
						.replace('MM', _month)
						.replace('YYYY', _fullYear)
						.replace('YY', _year)
						.replace('HH', _hour)
						.replace('mm', _min)
						.replace('ss', _sec)
		);
	});

	return (<>
		<Show when={date}>
			<span class="formatted-date">{ date() }</span>
		</Show>
	</>);
}
