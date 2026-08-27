/**
 * Stack layout math of CardScanFullSmall's 120px-wide card scan render,
 * parameterized by card width so smaller renders keep the same proportions.
 */

export const CARD_STACK_BASE_WIDTH = 120;
export const LIMIT_STACKING_QUANTITY = 3;

const BASE_CARD_HEIGHT = 168;
const BASE_HORIZONTAL_CARD_WIDTH = 115;
const BASE_HORIZONTAL_CARD_HEIGHT = 82;
const BASE_STACK_PADDING = 16;
const BASE_BORDER_RADIUS = 6;

export interface StackLayout {
	cardWidth: number;
	cardHeight: number;
	horizontalCardWidth: number;
	horizontalCardHeight: number;
	borderRadius: number;
	/**
	 * Visible sliver of each copy behind the front one, for this quantity.
	 */
	stackPadding: number;
	/**
	 * Container height that keeps a grid row aligned: full card height plus
	 * slivers for maxQuantity copies.
	 */
	verticalReserve: number;
	/**
	 * Render loop length; quantities beyond LIMIT_STACKING_QUANTITY compress
	 * into the same height as a full 3-stack.
	 */
	iterationCount: number;
}

function paddingFor(quantity: number, basePadding: number): number {
	return quantity <= LIMIT_STACKING_QUANTITY
		? basePadding
		: (basePadding * (LIMIT_STACKING_QUANTITY - 1)) / (quantity - 1);
}

export function computeStackLayout(
	width: number,
	quantity: number,
	maxQuantity: number
): StackLayout {
	// Self-consistency guard: the reserve must always fit this stack's own
	// render, even when a caller passes a maxQuantity below quantity - the
	// stack must never overflow downward past its reserve.
	maxQuantity = Math.max(1, maxQuantity, Math.min(quantity, LIMIT_STACKING_QUANTITY));
	const scale = width / CARD_STACK_BASE_WIDTH;
	const cardHeight = Math.round(BASE_CARD_HEIGHT * scale);
	const basePadding = BASE_STACK_PADDING * scale;
	const maxPadding = paddingFor(maxQuantity, basePadding);
	// Above the stacking limit every copy renders with shrunken slivers whose
	// total equals a full limit-stack, so the front card always ends at the
	// reserve bottom no matter how many copies pile up (maxQuantity may be
	// capped below quantity by callers).
	const iterationCount =
		quantity > LIMIT_STACKING_QUANTITY
			? quantity
			: Math.min(Math.max(maxQuantity, quantity), LIMIT_STACKING_QUANTITY);
	return {
		cardWidth: width,
		cardHeight,
		horizontalCardWidth: Math.round(BASE_HORIZONTAL_CARD_WIDTH * scale),
		horizontalCardHeight: Math.round(BASE_HORIZONTAL_CARD_HEIGHT * scale),
		borderRadius: Math.max(3, Math.round(BASE_BORDER_RADIUS * scale)),
		stackPadding: paddingFor(quantity, basePadding),
		verticalReserve: cardHeight + maxPadding * (maxQuantity - 1),
		iterationCount
	};
}
