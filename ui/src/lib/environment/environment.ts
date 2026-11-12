import type { Card, Product } from '@5argon/arkham-kohaku';

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

/**
 * What the environment is about, which words its details use.
 */
export type EnvironmentSubject = 'review' | 'deck';
