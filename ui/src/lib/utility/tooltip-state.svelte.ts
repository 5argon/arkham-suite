/**
 * Reusable tooltip state management for hover interactions.
 * Handles visibility, position tracking, and associated data.
 * Uses element references for proper positioning with Floating UI.
 * 
 * @example
 * ```typescript
 * const tooltip = createTooltipState<Card>();
 * 
 * // In template:
 * onmouseenter={(e) => tooltip.show(card, e)}
 * onmouseleave={tooltip.hide}
 * 
 * // Pass to tooltip component:
 * <CardLineHoverTooltip
 *   card={tooltip.data}
 *   visible={tooltip.visible}
 *   referenceElement={tooltip.referenceElement}
 * />
 * ```
 */
export function createTooltipState<T>() {
	let visible = $state(false);
	let data = $state<T | undefined>(undefined);
	let referenceElement = $state<HTMLElement | null>(null);

	return {
		get visible() {
			return visible;
		},
		get data() {
			return data;
		},
		get referenceElement() {
			return referenceElement;
		},

		/**
		 * Show tooltip for the given item, anchored to the event target.
		 * @param item - The data to associate with the tooltip
		 * @param event - The mouse event
		 */
		show(item: T, event: MouseEvent) {
			const target = event.currentTarget as HTMLElement;
			data = item;
			referenceElement = target;
			visible = true;
		},

		/**
		 * Hide the tooltip.
		 */
		hide() {
			visible = false;
			// Keep referenceElement for potential exit animations
		}
	};
}
