import { createEffect, createSignal } from "solid-js";

export default function ConvertMilliseconds(props) {
	let [ time, setTime ] = createSignal(null);

	createEffect(() => {
		if (!props.from) { return; }

		let _i = parseInt(props.from, 10) / 1000;
		let _h = Math.floor(_i / 3600);
		let _m = Math.floor((_i % 3600) / 60);
		let _s = Math.floor(((_i % 3600) % 60) % 60);

		switch(props.to) {
			case 'm':
			case 'minutes':
			case 'min':
			default:
				if (props.short) {
					setTime(_m + _h * 60);
				} else if (props.omitSeconds) {
					setTime(_m + _h * 60);
				} else {
					setTime(`${ _m + _h * 60 }:${ (_s < 10 ? `0${_s}` : _s) }`);
				}
			break;

			case 'h':
			case 'hours':
				if (props.short) {
					setTime(_h);
				} else if (props.omitSeconds) {
					setTime(`${ (_h < 10 ? `0${_h}` : _h) }:${ (_m < 10 ? `0${_m}` : _m) }`);
				} else {
					setTime(`${ (_h < 10 ? `0${_h}` : _h) }:${ (_m < 10 ? `0${_m}` : _m) }:${ (_s < 10 ? `0${_s}` : _s) }`);
				}
			break;
		}
	});

	return <>{ time() }</>;
}
