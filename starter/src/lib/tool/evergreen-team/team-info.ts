import type { CardResolver } from '@5argon/arkham-kohaku';

import * as m from '../../paraglide/messages.js';
import type { DeckMeta, EvergreenState, TeamInfo } from './types';

export const TEAM_INFO_LIMITS = { name: 100, author: 25, description: 200 } as const;

export function defaultTeamInfo(): TeamInfo {
	return {
		name: m.tool_evergreen_team_default_team_name(),
		author: '',
		description: m.tool_evergreen_team_default_team_description()
	};
}

/**
 * Trims and enforces the length limits; a blank name falls back to the
 * default so a team always has one.
 */
export function clampTeamInfo(info: TeamInfo): TeamInfo {
	const name = info.name.trim().slice(0, TEAM_INFO_LIMITS.name);
	return {
		name: name.length > 0 ? name : m.tool_evergreen_team_default_team_name(),
		author: info.author.trim().slice(0, TEAM_INFO_LIMITS.author),
		description: info.description.trim().slice(0, TEAM_INFO_LIMITS.description)
	};
}

/**
 * Per-deck names and descriptions derived from the team info and its share
 * link at runtime (never serialized): "Investigator — Team", and
 * "View Team: URL" followed by the team description.
 */
export function deckMetaFor(team: EvergreenState, resolver: CardResolver, url: string): DeckMeta[] {
	const link = m.tool_evergreen_team_deck_description({ url });
	const description =
		team.info.description.length > 0 ? `${link}\n\n${team.info.description}` : link;
	return team.decks.map((deck) => ({
		name: m.tool_evergreen_team_deck_name({
			investigator: resolver.resolve(deck.investigator).name,
			team: team.info.name
		}),
		description
	}));
}
