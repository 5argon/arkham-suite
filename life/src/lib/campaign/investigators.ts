/**
 * Resolves the campaign's investigator roster for per-investigator log sections
 * (TDC task progress, TFA supplies, FHV curse count, TSK bearer). Codes come
 * from the campaign decks; names are resolved by the caller (which holds a card
 * resolver).
 */
export interface InvestigatorRef {
	/** Investigator card code. */
	code: string;
	/** Display name (resolved card name, or the code as a fallback). */
	name: string;
}

interface DeckLike {
	/** Pre-resolved investigator code (preferred — avoids JSON parse). */
	investigatorCode?: string;
	versions: { ahdbJson: string }[];
}

/** Distinct investigator codes across the campaign's decks.
 *  Reads `investigatorCode` directly when available (deck-less investigators
 *  and normal decks with the field projected); falls back to parsing the latest
 *  version's AHDB JSON for callers that don't project the field. */
export function investigatorCodesFromDecks(decks: DeckLike[]): string[] {
	const codes: string[] = [];
	for (const d of decks) {
		let code: string | undefined;
		if (d.investigatorCode) {
			code = d.investigatorCode;
		} else {
			const latest = d.versions[d.versions.length - 1];
			if (!latest) continue;
			try {
				code = (JSON.parse(latest.ahdbJson) as { investigator_code?: string }).investigator_code;
			} catch {
				// malformed deck json — skip
			}
		}
		if (code && !codes.includes(code)) codes.push(code);
	}
	return codes;
}
