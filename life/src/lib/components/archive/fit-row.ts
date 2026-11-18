/**
 * Keeps a row of items on one line: the trailing items that don't fit are hidden and the row's
 * `[data-fit-more]` element shows instead. Items are the row's `[data-fit-item]` children.
 * `onHidden` receives the indexes of the hidden items.
 */
export function fitRow(node: HTMLElement, onHidden?: (hidden: number[]) => void) {
	let report = onHidden;
	const measure = () => {
		const items = [...node.querySelectorAll<HTMLElement>(':scope > [data-fit-item]')];
		const more = node.querySelector<HTMLElement>(':scope > [data-fit-more]');
		for (const item of items) item.style.display = '';
		if (more) more.style.display = 'none';
		const hidden: number[] = [];
		if (node.scrollWidth > node.clientWidth) {
			if (more) more.style.display = '';
			for (let i = items.length - 1; i > 0 && node.scrollWidth > node.clientWidth; i--) {
				items[i].style.display = 'none';
				hidden.unshift(i);
			}
		}
		report?.(hidden);
	};
	const observer = new ResizeObserver(measure);
	observer.observe(node);
	measure();
	return {
		update(next?: (hidden: number[]) => void) {
			report = next;
			measure();
		},
		destroy() {
			observer.disconnect();
		}
	};
}
