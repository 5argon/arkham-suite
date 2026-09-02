/**
 * Reactive state for one HoverTooltip that several hover targets take turns owning — pair it
 * with the `HoverTip` component, which renders the tooltip body.
 */
export class HoverTipState {
	visible = $state(false);
	ref = $state<HTMLElement | null>(null);
	/** Plain single-line text (used when `title` is empty). */
	text = $state('');
	/** Emphasised first line. */
	title = $state('');
	/** Muted line under the title. */
	detail = $state('');

	/** Show plain text at the hovered element; empty text keeps the tooltip hidden. */
	showText = (text: string, e: MouseEvent) => {
		if (!text) return;
		this.text = text;
		this.title = '';
		this.detail = '';
		this.#open(e);
	};

	/** Show a title with an optional detail line at the hovered element (either may be empty). */
	show = (title: string, detail: string, e: MouseEvent) => {
		if (!title && !detail) return;
		this.text = '';
		this.title = title;
		this.detail = detail;
		this.#open(e);
	};

	hide = () => {
		this.visible = false;
	};

	#open(e: MouseEvent) {
		this.ref = e.currentTarget as HTMLElement;
		this.visible = true;
	}
}
