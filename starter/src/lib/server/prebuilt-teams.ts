import type { AhdbDeck } from '@5argon/arkham-kohaku';

import { getAllCards } from '$lib/card-data';
import {
	contributor,
	type PrebuiltTeam,
	type PrebuiltTeamSource,
	type PrebuiltTeamSummary,
	starterDeck
} from '$lib/starter-content';
import { teamDisplay } from '$lib/tool/evergreen-team/team-display';
import { teamState } from '$lib/tool/starter/filter';

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
	 * Files under decks/, explicitly paired with their optional hosted source.
	 * Omitting source makes the team Exclusive.
	 */
	decks: { file: string; source?: TeamSourceJson }[];
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

const teams: PrebuiltTeam[] = Object.entries(teamFiles).map(([path, json]) => {
	const dir = path.replace(/team\.json$/, '');
	const members = json.decks
		.map(({ file, source: sourceJson }) => {
			const rawDeck = teamDeckFiles[`${dir}decks/${file}`];
			if (rawDeck === undefined) {
				throw new Error(`Pre-built team deck missing: ${dir}decks/${file}`);
			}
			// A pre-built team's deck files are already the resolved source of truth.
			// Preserve their printing codes: two printings of the same card may be
			// assigned to different investigators to represent distinct physical copies.
			const deck = rawDeck;
			const sourceEntry =
				sourceJson === undefined
					? undefined
					: starterDeck(sourceJson.author, sourceJson.series, sourceJson.slug);
			if (sourceJson !== undefined && sourceEntry === undefined) {
				throw new Error(
					`Pre-built team source missing: ${sourceJson.author}/${sourceJson.series}/${sourceJson.slug}`
				);
			}
			if (
				sourceEntry !== undefined &&
				sourceEntry.primary.investigator_code !== deck.investigator_code
			) {
				throw new Error(
					`Pre-built team source investigator mismatch: ${dir}decks/${file} -> ${sourceEntry.series.author.slug}/${sourceEntry.series.slug}/${sourceEntry.slug}`
				);
			}
			const source: PrebuiltTeamSource | undefined =
				sourceEntry === undefined
					? undefined
					: {
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
			return { deck, source };
		})
		.sort((a, b) => a.deck.investigator_code.localeCompare(b.deck.investigator_code));
	const author = contributor(json.authorSlug);
	if (author === undefined) throw new Error(`Pre-built team without contributor: ${path}`);
	return {
		slug: json.slug,
		name: json.name,
		author: author.name,
		authorSlug: json.authorSlug,
		description: json.description,
		tags: json.tags,
		members,
		exclusive: members.some((member) => member.source === undefined),
		guideMd: teamGuideFiles[`${dir}guide.md`] ?? ''
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
