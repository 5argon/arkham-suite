/** One tooltip shared by several hover targets; render it once with `<HoverTip {tip} />`. */
export class HoverTipState {
	visible = $state(false);
	ref = $state<HTMLElement | null>(null);
	/** Plain text, used when there is no title. */
	text = $state('');
	title = $state('');
	/** Muted lines under the title. */
	details = $state<string[]>([]);

	showText = (text: string, e: MouseEvent) => {
		if (!text) return;
		this.text = text;
		this.title = '';
		this.details = [];
		this.#open(e);
	};

	/** Empty details are skipped; nothing shows when everything is empty. */
	show = (title: string, detail: string | string[], e: MouseEvent) => {
		const details = (Array.isArray(detail) ? detail : [detail]).filter(Boolean);
		if (!title && !details.length) return;
		this.text = '';
		this.title = title;
		this.details = details;
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
