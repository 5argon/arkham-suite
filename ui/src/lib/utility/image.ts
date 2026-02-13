import type { Card } from '@5argon/arkham-kohaku';
import { cardImagePath } from '../const.js';

export type CardImageType = 'full' | 'full-small' | 'square' | 'square-small' | 'strip';

/**
 * Generate the image path for a card's front image.
 * Types 'full' and 'full-small' support language codes.
 * Types 'square', 'square-small', and 'strip' do not have language folders.
 */
export function getCardImagePath(cardCode: string, imageType: CardImageType, languageCode?: string): string {
	if (imageType === 'full' || imageType === 'full-small') {
		return `${cardImagePath}/${imageType}/${languageCode ?? 'en'}/${cardCode}.avif`;
	}
	return `${cardImagePath}/${imageType}/${cardCode}.avif`;
}

/**
 * Generate the image path for a card's back image if it has a backImageCode.
 * Types 'full' and 'full-small' support language codes.
 * Types 'square', 'square-small', and 'strip' do not have language folders.
 */
export function getCardBackImagePath(card: Card, imageType: CardImageType, languageCode?: string): string | undefined {
	if (!card.backImageCode) {
		return undefined;
	}
	if (imageType === 'full' || imageType === 'full-small') {
		return `${cardImagePath}/${imageType}/${languageCode ?? 'en'}/${card.backImageCode}.avif`;
	}
	return `${cardImagePath}/${imageType}/${card.backImageCode}.avif`;
}
