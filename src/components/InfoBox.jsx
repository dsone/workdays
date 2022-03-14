
import '../css/info-box.css';

export default function InfoBox(props) {

	return (
		<div class={ `info-box${ props.class ? ' ' + props.class : '' }` } classList={{ 'info': props.info, 'warning': props.warning, 'error': props.error }}>
			<div class="info-box-badge">
				Info
			</div>
			<div class="info-box-content">
				{ props.children }
			</div>
		</div>
	);
}
