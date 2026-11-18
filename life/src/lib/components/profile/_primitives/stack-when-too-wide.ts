/**
 * Adds `className` to the node whenever its content is wider than its box, measured without the
 * class on every width change and row change, so content that fits again goes back. With
 * `labels`, each body cell is also tagged `data-label` with its column's label.
 */
export function stackWhenTooWide(
	node: HTMLElement,
	{ className, labels }: { className: string; labels?: string[] }
) {
	let current = labels;
	let width = -1;
	const fit = () => {
		if (current) {
			for (const tr of node.querySelectorAll(':scope > table > tbody > tr')) {
				let col = 0;
				for (const td of tr.children) {
					(td as HTMLElement).dataset.label = current[col] ?? '';
					col += (td as HTMLTableCellElement).colSpan || 1;
				}
			}
		}
		node.classList.remove(className);
		if (node.scrollWidth > node.clientWidth + 1) node.classList.add(className);
	};
	const resize = new ResizeObserver(() => {
		if (node.clientWidth === width) return;
		width = node.clientWidth;
		fit();
	});
	resize.observe(node);
	const rows = new MutationObserver(fit);
	rows.observe(node, { childList: true, subtree: true });
	fit();
	return {
		update(next: { className: string; labels?: string[] }) {
			current = next.labels;
			fit();
		},
		destroy() {
			resize.disconnect();
			rows.disconnect();
		}
	};
}
