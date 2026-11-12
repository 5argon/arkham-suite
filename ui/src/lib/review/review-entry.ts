import type { Card, Product } from '@5argon/arkham-kohaku';

import type { EnvironmentDisplay } from '../environment/environment.js';
import type { TimingSpec } from '../rules/timing.js';

/**
 * What a small picture of a card needs, so a long list of rows doesn't carry whole cards.
 */
export type CardThumb = Pick<Card, 'code' | 'name' | 'cardClass'>;

export interface ReviewPerson {
	name: string;
	/**
	 * Their page here, or their own site.
	 */
	href?: string;
	avatarCard?: CardThumb;
	avatarUrl?: string;
}

export type ReviewMedium = 'text' | 'video' | 'audio';

export interface ReviewCountsData {
	/**
	 * Reviews written for this site, read right on its pages.
	 */
	written: number;
	/**
	 * Everything that lives on another site.
	 */
	external: number;
}

/**
 * The text of one side of a card, already made into HTML.
 */
export interface CardSideHtml {
	traits?: string;
	text?: string;
	flavor?: string;
	customization?: string;
}

export interface CardTextHtml {
	front: CardSideHtml;
	back?: CardSideHtml;
}

/**
 * A piece of a review written for this site: text, a timing diagram, or the heading of a part about
 * certain cards.
 */
export type WrittenReviewPart =
	| { kind: 'text'; html: string }
	| { kind: 'timing'; timing: TimingSpec }
	| {
			kind: 'cards';
			/**
			 * Where it is in the page, to link to.
			 */
			anchor: string;
			level: 1 | 2 | 3 | 4 | 5 | 6;
			codes: string[];
			/**
			 * The review page of each card that has one, other than the card under review.
			 */
			hrefs?: Record<string, string>;
			/**
			 * What the heading says, when that's more than the names of the cards.
			 */
			title?: string;
	  };

/**
 * One line in a list of what's said about a card.
 */
export interface ReviewRowData {
	/**
	 * Unique among the rows of a card.
	 */
	id: string;
	medium: ReviewMedium;
	person: ReviewPerson;
	title?: string;
	/**
	 * The point in time it speaks about. Left out when it can't be credited with one.
	 */
	environment?: EnvironmentDisplay;
	/**
	 * When it came out.
	 */
	dateLabel?: string;
	/**
	 * When it was last changed, shown only on the review itself.
	 */
	updatedLabel?: string;
	preview?: boolean;
	official?: boolean;
	/**
	 * Satire or a joke, which a beginner shouldn't take as advice.
	 */
	humor?: boolean;
	/**
	 * Only when it isn't in English.
	 */
	languageLabel?: string;
	/**
	 * Where it starts talking about the card, like `12:34`.
	 */
	startLabel?: string;
	/**
	 * Where a review written for this site was first published.
	 */
	originalUrl?: string;
	/**
	 * It lives on another site, and this row opens it there in a new tab.
	 */
	externalHref?: string;
}
