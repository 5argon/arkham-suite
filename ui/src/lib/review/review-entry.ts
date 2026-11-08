import type { Card, Product } from '@5argon/arkham-kohaku';

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

/**
 * A point in time something speaks about.
 */
export interface EnvironmentDisplay {
	/**
	 * For a point of the Current environment: one abbreviation per rotating expansion slot, null for
	 * an empty one.
	 */
	slots?: (string | null)[];
	/**
	 * Names any other point.
	 */
	label?: string;
	/**
	 * The point's full name.
	 */
	description: string;
	/**
	 * What's in this point, for those who want to know what it means.
	 */
	detail?: EnvironmentDetail;
}

export interface EnvironmentProduct {
	product: Product;
	/**
	 * Where its cards can be seen, once there are any.
	 */
	href?: string;
}

export interface EnvironmentDetail {
	/**
	 * Same order as the slots of the point, null for an empty one.
	 */
	slots: (EnvironmentProduct | null)[];
	/**
	 * The products that began this point.
	 */
	defining: Product[];
	/**
	 * What the products that began this point took the place of.
	 */
	pushedOut: EnvironmentProduct[];
	evergreen: EnvironmentProduct[];
	roster: Card[];
	/**
	 * When this point began, for one that is more than the Evergreen products.
	 */
	since?: string;
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
