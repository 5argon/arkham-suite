/**
 * Where Card Reviews pages are. Light enough for any page to import.
 */

export function reviewCardHref(code: string, entryId?: string): string {
	return entryId === undefined ? `/review/card/${code}` : `/review/card/${code}#${entryId}`;
}

export function reviewProductHref(productRoute: string): string {
	return `/review/${productRoute}`;
}

export function chapterOneProductHref(productRoute: string): string {
	return `/review/chapter-one/${productRoute}`;
}

export function chapterOneCardHref(code: string): string {
	return `/review/chapter-one/card/${code}`;
}

export function reviewerHref(slug: string): string {
	return `/review/reviewers/${slug}`;
}

export function previewSeasonProductHref(productRoute: string): string {
	return `/review/preview-season/${productRoute}`;
}
