import { createEffect } from "solid-js";

export default function ContextMenu(props) {

	return (
		<div id={ props.id } class="absolute px-2 py-1 rounded bg-slate-200 shadow-md z-50 min-w-[100px] transition-opacity duration-200" classList={{ 'opacity-0 pointer-events-none': props.hide, 'opacity-80': !props.hide }} style={ `top:${ props.pointer.y }px; left:${ props.pointer.x }px` }>
			<ul class="leading-5 text-md text-black">
				<li>
					<a class="relative block p-2 cursor-pointer hover:text-gray-600 transition-colors duration-200" href="#" onClick={ e => props.share() }>Share</a>
				</li>
				<li>
					<a class="relative block p-2 cursor-pointer hover:text-gray-600 transition-colors duration-200" href="#" onClick={ e => props.saveImage() }>Save Image</a>
				</li>
			</ul>
		</div>
	);
}
