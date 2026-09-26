/** The investigators of a campaign, from its decks, for the per-investigator log sections. */
export interface InvestigatorRef {
	code: string;
	/** The card name, or the code when unknown. */
	name: string;
}

interface DeckLike {
	investigatorCode?: string;
	versions: { ahdbJson: string }[];
}

/** Distinct investigator codes across the decks; a deck without `investigatorCode` is read from its
 *  latest version's ArkhamDB JSON. */
export function investigatorCodesFromDecks(decks: DeckLike[]): string[] {
	const codes: string[] = [];
	for (const d of decks) {
		let code = d.investigatorCode;
		if (!code) {
			const latest = d.versions[d.versions.length - 1];
			if (!latest) continue;
			try {
				code = (JSON.parse(latest.ahdbJson) as { investigator_code?: string }).investigator_code;
			} catch {
				continue;
			}
		}
		if (code && !codes.includes(code)) codes.push(code);
	}
	return codes;
}
