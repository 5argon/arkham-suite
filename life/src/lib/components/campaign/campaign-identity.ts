/**
 * What makes a campaign recognisable at a glance, shared wherever a campaign is shown so it always
 * looks alike: its product (for the icon), its palette and its art.
 */
import { color, convert, type Campaign, type Product } from '@5argon/arkham-kohaku';
import { slugForFamily } from '$lib/campaign/profile/profile-slugs';
import { formatFinishDate } from '$lib/campaign/utils/format-date';

/** A campaign-data family's kohaku campaign code (`tskc` → `tsk`). */
export function campaignCodeForFamily(family: string): string {
	return slugForFamily(family);
}

/** The campaign's product, for `ProductIcon`; null for a missing or unknown campaign. */
export function campaignProduct(campaignCode: string | null | undefined): Product | null {
	if (!campaignCode) return null;
	try {
		return convert.campaignToProduct(campaignCode as Campaign);
	} catch {
		return null;
	}
}

/**
 * The campaign's palette as CSS variables, each with a light and a dark theme shade:
 * `--campaign-stripe`, `--campaign-badge` (the icon circle), `--campaign-tint-light` / `-dark` and
 * `--campaign-text-light` / `-dark`.
 * Undefined for a missing or unknown campaign.
 */
export function campaignPaletteStyle(campaignCode: string | null | undefined): string | undefined {
	const product = campaignProduct(campaignCode);
	if (product == null) return undefined;
	try {
		const palette = color.productToColors(product);
		const shade = (n: 200 | 300 | 500 | 700 | 800 | 900) => color.getColor(palette, n);
		return [
			`--campaign-stripe: ${shade(500)}`,
			`--campaign-badge: ${shade(800)}`,
			`--campaign-tint-light: ${shade(200)}`,
			`--campaign-tint-dark: ${shade(800)}`,
			`--campaign-text-light: ${shade(700)}`,
			`--campaign-text-dark: ${shade(300)}`
		].join('; ');
	} catch {
		return undefined;
	}
}

export function campaignArtUrl(campaignCode: string): string {
	return `/image/expansion/campaign/${campaignCode}.webp`;
}

/** The wide banner art; not every campaign has one, so fall back to {@link campaignArtUrl}. */
export function campaignBannerUrl(campaignCode: string): string {
	return `/image/expansion/campaign-background/${campaignCode}.webp`;
}

/** Background and text classes of the difficulty badge. */
export const difficultyBadgeClass: Record<string, string> = {
	easy: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
	standard: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
	hard: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
	expert: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

/** The finish date, as a range when a start date is also set; a lone start date otherwise. */
export function dateRangeLabel(start: number | null, finish: number | null): string | null {
	if (start != null && finish != null) return `${formatFinishDate(start)} ~ ${formatFinishDate(finish)}`;
	if (finish != null) return formatFinishDate(finish);
	if (start != null) return formatFinishDate(start);
	return null;
}
