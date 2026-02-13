import type { Boon, Deck, Difficulty, Resolution, Ultimatum } from '@5argon/arkham-kohaku';

export interface CommonCampaignData {
	difficulty: Difficulty;
	createdAt: Date;
	lastModifiedAt: Date;
	ultimatums?: Ultimatum[];
	boons?: Boon[];
	custom?: {
		logs?: string[];
		ultimatums?: CustomUltimatumBoon[];
		boons?: CustomUltimatumBoon[];
	};
	standaloneInsertions?: StandaloneInsertion[];
}

export interface StandaloneInsertion {
	standalone: string;
	after: string;
	resolution: Resolution;
	earnedStoryAssets?: string[];
	earnedXp?: number;
	details?: unknown;
}

export interface CustomUltimatumBoon {
	/**
	 * Link to those saved in the ID if defined.
	 */
	uuid?: string;
	name: string;
	text: string;
}

export interface Player {
	uuid?: string;
	guestName?: string;
	creator: boolean;
	investigators: PlayerInvestigator[];
	permissions: Permissions;
}

export interface PlayerInvestigator {
	investigatorId: string;
	physicalTrauma: number;
	mentalTrauma: number;
	killed: boolean;
	insane: boolean;
	deckHistory?: Deck[];
	earnedStoryAssets?: string[];
	earnedWeaknesses?: string[];
}

export interface Permissions {
	writeSelf: boolean;
	writeAll: boolean;
	delete: boolean;
}

export interface DeckPairedWithPlayer {
	deck: Deck;
	player?: Player;
}
