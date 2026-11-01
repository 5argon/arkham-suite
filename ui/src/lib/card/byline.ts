import type { Card } from '@5argon/arkham-kohaku';

/**
 * One attribution line under a deck name (author, series, ...).
 */
export interface BylineEntry {
	label: string;
	/**
	 * Renders the entry as an internal link.
	 */
	href?: string;
	/**
	 * Card art shown before the label, through CardCircle.
	 */
	iconCard?: Card;
	/**
	 * Default `circle` (a person); `rounded` for a thing such as a series.
	 */
	iconShape?: 'circle' | 'rounded';
}
