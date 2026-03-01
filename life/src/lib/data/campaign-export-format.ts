/**
 * Versioned JSON format used for campaign import / export.
 *
 * Version history:
 *   1 – initial release
 *   2 – campaign-data integration: log entries carry their `section` (so the
 *       reserved meta-sections __chaos_bag/__ultimatums and every quirk section
 *       round-trip), and manual achievement ticks are exported. All keys are
 *       campaign-data composite ids + kohaku token codes — the portable contract.
 *       v1 files import with section defaulted to 'campaign_notes' and no
 *       achievements.
 */

export const EXPORT_FORMAT_VERSION = 2;

// ─── Top-level wrapper ───────────────────────────────────────────────────────

export interface CampaignExportFile {
	/** Incremented when the shape changes in a breaking way. */
	exportVersion: number;
	/** ISO-8601 timestamp of when this file was produced. */
	exportedAt: string;
	campaigns: CampaignExportItem[];
}

// ─── Campaign ────────────────────────────────────────────────────────────────

export interface CampaignExportItem {
	/**
	 * Original DB row ID (UUID).
	 * Used for deduplication: if the importing user already owns a campaign
	 * with this exact ID the item is skipped; if another user owns it a new
	 * UUID is generated instead.
	 */
	id: string;
	title: string;
	campaignCode: string;
	difficulty: 'easy' | 'standard' | 'hard' | 'expert';
	draft: boolean;
	/** ms-since-epoch, or null if not set. */
	startDate: number | null;
	/** ms-since-epoch, or null if not set. */
	finishDate: number | null;
	displayInProfile: 'default' | 'visible' | 'hidden';
	/** ms-since-epoch. */
	createdAt: number;
	/** ms-since-epoch. */
	updatedAt: number;

	/**
	 * UIDs (XXX-XXX-XXX format) of players added to this campaign.
	 * Does NOT include the exporting owner's UID.
	 * On import, each UID is resolved to a DB row. If the UID cannot be found,
	 * or the importing user is neither the UID owner nor a friend/sub-manager,
	 * that player entry is silently skipped and counted in the result summary.
	 */
	playerUids: string[];

	decks: CampaignDeckExport[];
	logs: CampaignLogExport[];
	/** Manual achievement ticks (v2+). Inferred achievements are recomputed, not stored. */
	achievements: CampaignAchievementExport[];
}

// ─── Decks ───────────────────────────────────────────────────────────────────

export interface CampaignDeckExport {
	/**
	 * UID of the player who was assigned as deck owner, or null if unassigned.
	 * Resolved against the importing user's sub-players and friends during
	 * import; silently ignored if not resolvable.
	 */
	ownerPlayerUid: string | null;
	investigator: CampaignDeckInvestigatorExport;
	/** Ordered by sequenceIndex ascending. */
	versions: CampaignDeckVersionExport[];
}

export interface CampaignDeckInvestigatorExport {
	investigatorCode: string;
	alternateFrontCode: string | null;
	alternateBackCode: string | null;
	factionSelected: string | null;
	faction1: string | null;
	faction2: string | null;
	optionSelected: string | null;
	deckSizeSelected: number | null;
}

export interface CampaignDeckVersionExport {
	sequenceIndex: number;
	/** Stringified AhdbDeck JSON (without previous_deck / next_deck fields). */
	ahdbJson: string;
}

// ─── Campaign logs ───────────────────────────────────────────────────────────

export interface CampaignLogExport {
	key: string;
	/**
	 * Owning section id (v2+). A real campaign-data section, or a reserved
	 * meta-section (`__chaos_bag`, `__ultimatums`). Absent in v1 → 'campaign_notes'.
	 */
	section?: string;
	/** ms-since-epoch. */
	createdAt: number;
	params: CampaignLogParamExport[];
}

export interface CampaignLogParamExport {
	valueString: string | null;
	valueNumber: number | null;
}

// ─── Achievements (v2+) ──────────────────────────────────────────────────────

export interface CampaignAchievementExport {
	/** Base campaign code (dedup key across base + Return-to). */
	family: string;
	/** campaign-data achievement id. */
	achievementId: string;
	/** Set for `list`-achievement per-item ticks; null otherwise. */
	itemId: string | null;
}

// ─── Import result ───────────────────────────────────────────────────────────

export interface ImportResult {
	/** Campaigns inserted with their original exported ID (first-time import). */
	campaignsCreated: number;
	/** Campaigns skipped because the current user already owns one with that ID. */
	campaignsSkipped: number;
	/**
	 * Campaigns whose exported ID was already owned by a different user.
	 * These were inserted with a freshly generated UUID instead.
	 */
	campaignsWithNewId: number;
	/** Total player-to-campaign link entries that could not be resolved. */
	playersSkipped: number;
}
