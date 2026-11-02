import type { AhdbDeck } from '@5argon/arkham-kohaku';

import { createCardResolver, getAllCards } from '$lib/card-data';
import {
	contributor,
	deckCardPool,
	type PrebuiltTeam,
	type PrebuiltTeamSource,
	type PrebuiltTeamSummary,
	starterDeck
} from '$lib/starter-content';
import { teamDisplay } from '$lib/tool/evergreen-team/team-display';
import { teamState } from '$lib/tool/starter/filter';

import {
	applyDeckChanges,
	type DeckChange,
	OVERLAP_TABLE_MARKER,
	overlapTable,
	type OverlapTableMember
} from './team-deck-changes';

/**
 * Pre-built teams in full, only loaded on the server so no browser downloads
 * them all: listings get compiled summaries, and a team's page gets that team.
 */

interface TeamSourceJson {
	author: string;
	series: string;
	slug: string;
}

interface TeamJson {
	slug: string;
	name: string;
	authorSlug: string;
	description: string;
	tags: string[];
	/**
	 * Each member is a hosted deck with optional changes, or a tailor-made deck
	 * from a file under decks/. A tailor-made deck makes the team Exclusive.
	 */
	decks: ({ source: TeamSourceJson; changes?: DeckChange[] } | { file: string })[];
}

const teamFiles = import.meta.glob<TeamJson>('../starter-content/team/*/team.json', {
	eager: true,
	import: 'default'
});
const teamDeckFiles = import.meta.glob<AhdbDeck>('../starter-content/team/*/decks/*.json', {
	eager: true,
	import: 'default'
});
const teamGuideFiles = import.meta.glob<string>('../starter-content/team/*/guide.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});

/**
 * A hosted deck as a team plays it. Printing codes in changes are kept as they
 * are: two printings of a card may go to different investigators, to represent
 * distinct physical copies.
 */
function changedDeck(teamSlug: string, source: AhdbDeck, changes: readonly DeckChange[]): AhdbDeck {
	const investigator = source.investigator_name.split(' ')[0];
	const id = investigator
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();
	const pool = new Set(deckCardPool(source));
	const resolver = createCardResolver();
	for (const { add } of changes) if (add !== undefined) pool.add(resolver.resolve(add).product);
	return {
		...source,
		...applyDeckChanges(source, changes, `${teamSlug}/${id}`),
		id: `${teamSlug}/${id}`,
		description_md: '',
		user_id: null,
		ignoreDeckLimitSlots: {},
		xp: null,
		xp_spent: null,
		xp_adjustment: null,
		exile_string: null,
		taboo_id: 0,
		meta: JSON.stringify({ card_pool: [...pool].join(',') }),
		previous_deck: null,
		next_deck: null,
		problem: null
	};
}

function withOverlapTable(
	teamSlug: string,
	guide: string,
	members: readonly OverlapTableMember[]
): string {
	if (!guide.includes(OVERLAP_TABLE_MARKER)) return guide;
	const table = overlapTable(members);
	if (table === '') throw new Error(`Pre-built team guide has nothing to tabulate: ${teamSlug}`);
	return guide.replace(OVERLAP_TABLE_MARKER, table);
}

const teams: PrebuiltTeam[] = Object.entries(teamFiles).map(([path, json]) => {
	const dir = path.replace(/team\.json$/, '');
	const members = json.decks
		.map((member) => {
			if ('file' in member) {
				const deck = teamDeckFiles[`${dir}decks/${member.file}`];
				if (deck === undefined) {
					throw new Error(`Pre-built team deck missing: ${dir}decks/${member.file}`);
				}
				return { deck, source: undefined, changes: [] };
			}
			const { source: sourceJson, changes = [] } = member;
			const sourceEntry = starterDeck(sourceJson.author, sourceJson.series, sourceJson.slug);
			if (sourceEntry === undefined) {
				throw new Error(
					`Pre-built team source missing: ${sourceJson.author}/${sourceJson.series}/${sourceJson.slug}`
				);
			}
			const source: PrebuiltTeamSource = {
				slug: sourceEntry.slug,
				// The guide is on the deck's own page, and is by far the largest part.
				primary: { ...sourceEntry.primary, description_md: '' },
				series: {
					slug: sourceEntry.series.slug,
					name: sourceEntry.series.name,
					iconCard: sourceEntry.series.iconCard,
					author: sourceEntry.series.author
				}
			};
			return { deck: changedDeck(json.slug, sourceEntry.primary, changes), source, changes };
		})
		.sort((a, b) => a.deck.investigator_code.localeCompare(b.deck.investigator_code));
	const hosted = members.flatMap(({ source, changes }) =>
		source === undefined ? [] : [{ source: source.primary, changes }]
	);
	const author = contributor(json.authorSlug);
	if (author === undefined) throw new Error(`Pre-built team without contributor: ${path}`);
	return {
		slug: json.slug,
		name: json.name,
		author: author.name,
		authorSlug: json.authorSlug,
		description: json.description,
		tags: json.tags,
		members: members.map(({ deck, source }) => ({ deck, source })),
		exclusive: members.some((member) => member.source === undefined),
		guideMd: withOverlapTable(json.slug, teamGuideFiles[`${dir}guide.md`] ?? '', hosted)
	};
});

export function allPrebuiltTeams(): PrebuiltTeam[] {
	return teams;
}

export function prebuiltTeamsOf(authorSlug: string): PrebuiltTeam[] {
	return teams.filter((t) => t.authorSlug === authorSlug);
}

export function prebuiltTeam(slug: string): PrebuiltTeam | undefined {
	return teams.find((t) => t.slug === slug);
}

function summarize(team: PrebuiltTeam): PrebuiltTeamSummary {
	const state = teamState(team, getAllCards());
	return {
		slug: team.slug,
		name: team.name,
		author: team.author,
		authorSlug: team.authorSlug,
		description: team.description,
		tags: team.tags,
		exclusive: team.exclusive,
		deckProducts: state.setup.deckProducts,
		display: teamDisplay(state, getAllCards())
	};
}

export function allPrebuiltTeamSummaries(): PrebuiltTeamSummary[] {
	return teams.map(summarize);
}

export function prebuiltTeamSummariesOf(authorSlug: string): PrebuiltTeamSummary[] {
	return prebuiltTeamsOf(authorSlug).map(summarize);
}
