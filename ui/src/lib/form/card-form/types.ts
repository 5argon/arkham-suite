import type { Card } from '@5argon/arkham-kohaku';

/**
 * Function to filter cards in the search results.
 */
export type CardFormFilter = (card: Card) => boolean;
