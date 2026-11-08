import {
	type AhdbDeck,
	CardResolver,
	deck as deckUtility,
	environment,
	linkedAhdbDeckToDeck,
	Product
} from '@5argon/arkham-kohaku';
import { describe, expect, it } from 'vitest';

import { getAllCards, loadAllTabooLists } from '../card-data';
import { allPrebuiltTeams, prebuiltTeamsOf } from '../server/prebuilt-teams';
import { hasUniqueInvestigatorClasses } from '../tool/assembler/filter';
import { plannedCopies } from '../tool/starter/filter';
import {
	allContributors,
	allStarterDecks,
	importedStarterDeck,
	starterDeck,
	starterDeckFromRef,
	starterDeckHref,
	starterSeries,
	starterSeriesOf,
	type PrebuiltTeam
} from '.';

const tagsBySeries = {
	'ch2-combo-cult': 'starter beginner hc-ch2-combo-cult',
	'ch2-core-only': 'starter beginner hc-ch2-core-only',
	'four-good-decks': 'starter beginner quick-learner-four-good-decks',
	'ch2-quickie': 'starter beginner hc-ch2-quickie',
	'ch2-starter-guide': 'starter beginner hc-ch2-starter-guide',
	'ch2-starters-revisited': 'starter beginner hc-ch2-starters-revisited',
	'pre-built-team-4p-core-2026': 'starter beginner 5argon-pre-built-team-4p-core-2026'
} as const;

describe('starter deck references', () => {
	it('finds every deck from its page link and from its imported id', () => {
		for (const entry of allStarterDecks()) {
			const href = starterDeckHref(entry);
			expect(starterDeckFromRef(href)).toBe(entry);
			expect(starterDeckFromRef(`https://arkham-starter.com${href}/`)).toBe(entry);
			expect(starterDeckFromRef(String(importedStarterDeck(entry).deck.id))).toBe(entry);
		}
	});

	it('leaves everything else to the other deck sources', () => {
		for (const ref of [
			'66007',
			'https://arkhamdb.com/decklist/view/66007/dragged-across-concrete-ch2-combo-cult-1.0',
			'https://arkham.build/deck/view/OqbZzMP0XjoPAaV',
			'no-such-author/no-such-series/no-such-deck'
		]) {
			expect(starterDeckFromRef(ref), ref).toBeUndefined();
		}
	});
});

describe('starter series order', () => {
	const seriesJson = Object.entries(
		import.meta.glob<{ slug: string; order: number }>('./starter/*/*/series.json', {
			eager: true,
			import: 'default'
		})
	);

	it('lists each author series by its own unique order number', () => {
		for (const author of allContributors()) {
			const own = seriesJson
				.filter(([path]) => path.startsWith(`./starter/${author.slug}/`))
				.map(([, json]) => json);
			const orders = own.map((json) => json.order);
			expect(orders.every(Number.isInteger), author.slug).toBe(true);
			expect(new Set(orders).size, author.slug).toBe(orders.length);
			expect(starterSeriesOf(author.slug).map((series) => series.slug)).toEqual(
				[...own].sort((a, b) => a.order - b.order).map((json) => json.slug)
			);
		}
	});
});

describe('starter deck side decks', () => {
	it('gathers both the copy an upgrade plays and the copy it keeps for later', () => {
		const rambo = starterDeck('hungry-colquhoun', 'ch2-starter-guide', 'rancher-rambo')!;
		const makeshiftBomb = '60581';
		expect(rambo.versions[1].deck.slots?.[makeshiftBomb]).toBe(1);
		expect(rambo.versions[1].deck.sideSlots?.[makeshiftBomb]).toBe(1);
		expect(rambo.primary.sideSlots?.[makeshiftBomb]).toBe(2);
	});
});

describe('starter deck export tags', () => {
	it('gives every listed deck version exactly the two common tags and its series tag', () => {
		const versions = allStarterDecks().flatMap((entry) =>
			entry.versions.map((version) => ({
				deck: version.deck,
				series: entry.series.slug as keyof typeof tagsBySeries
			}))
		);
		expect(versions).toHaveLength(84);
		for (const { deck, series } of versions) {
			expect(deck.tags, `${series}/${deck.id}`).toBe(tagsBySeries[series]);
			expect(deck.tags?.split(/\s+/), `${series}/${deck.id}`).toHaveLength(3);
		}
	});

	it('gives every embedded team deck exactly the same three tags', () => {
		const teams = allPrebuiltTeams();
		const members = teams.flatMap((team) =>
			team.members.map((member) => ({ team, deck: member.deck, source: member.source }))
		);
		expect(members).toHaveLength(657);
		for (const { team, deck, source } of members) {
			const series = source?.series.slug as keyof typeof tagsBySeries | undefined;
			expect(series, team.slug).toBeDefined();
			expect(deck.tags, deck.id.toString()).toBe(tagsBySeries[series!]);
			expect(deck.tags?.split(/\s+/), deck.id.toString()).toHaveLength(3);
		}
	});
});

describe('Not-legacy guarantee', () => {
	const resolver = new CardResolver(getAllCards());

	function deckProducts(deck: AhdbDeck): Product[] {
		return Object.keys({ ...deck.slots, ...deck.sideSlots })
			.map((code) => resolver.resolve(code).product)
			.filter((product) => product !== Product.RandomBasicWeakness);
	}

	it('builds every starter deck version and team deck within some Current environment', () => {
		const decks = [
			...allStarterDecks().flatMap((entry) => entry.versions.map((version) => version.deck)),
			...allPrebuiltTeams().flatMap((team) => team.members.map((member) => member.deck))
		];
		expect(decks.length).toBeGreaterThan(0);
		for (const deck of decks) {
			const versions = environment.currentEnvironmentVersionsWith(deckProducts(deck), '2099-01-01');
			expect(versions.length, `${deck.id}`).toBeGreaterThan(0);
		}
	});
});

describe('Chapter 2 Starter Guide pre-built teams', () => {
	const resolver = new CardResolver(getAllCards());
	const tabooLists = loadAllTabooLists();
	const allTeams = prebuiltTeamsOf('hungry-colquhoun');
	const teams = allTeams.filter((team) => team.slug.startsWith('hc-ch2-starter-guide-'));
	const sourceEntries = starterSeries('hungry-colquhoun', 'ch2-starter-guide')!.entries;
	const sourceDecks = sourceEntries.map((entry) =>
		linkedAhdbDeckToDeck({ deck: entry.primary }, resolver, tabooLists)
	);

	function rosterKey(team: PrebuiltTeam): string {
		return team.members
			.map((member) => member.deck.investigator_code)
			.sort()
			.join('|');
	}

	function eligibleRosterKeys(playerCount: 2 | 3): string[] {
		return deckUtility
			.findTeamOverlaps(sourceDecks, playerCount)
			.filter(
				(combination) =>
					combination.overlaps.length === 0 && hasUniqueInvestigatorClasses(combination.decks)
			)
			.map((combination) =>
				combination.decks
					.map((deck) => deck.investigator.code)
					.sort()
					.join('|')
			)
			.sort();
	}

	function expectFullySourced(team: PrebuiltTeam, playerCount: number) {
		expect(team.members, team.slug).toHaveLength(playerCount);
		expect(team.exclusive, team.slug).toBe(false);
		expect(
			team.members.every((member) => member.source !== undefined),
			team.slug
		).toBe(true);
	}

	it('uses full investigator names and card-code order in team names and slugs', () => {
		for (const team of allTeams) {
			expect(team.guideMd, team.slug).not.toContain('Izzie Barnes');
			if (team.members.some((member) => member.deck.investigator_code === '12013')) {
				expect(team.guideMd, team.slug).toContain('Isabelle Barnes');
			}
			const investigators = [...team.members]
				.sort((a, b) => Number(a.deck.investigator_code) - Number(b.deck.investigator_code))
				.map((member) => resolver.resolve(member.deck.investigator_code).name.split(' ')[0]);
			const investigatorSlugs = investigators
				.map((name) =>
					name
						.normalize('NFD')
						.replace(/\p{Diacritic}/gu, '')
						.toLowerCase()
				)
				.join('-');
			const listed = team.slug.startsWith('hc-cross-series-')
				? team.name.split(' - ')[2].replace(/ \([A-Z]{2}\)/g, '')
				: team.name.split(' : ')[1];
			expect(listed, team.slug).toBe(investigators.join(', '));
			expect(team.slug, team.name).toMatch(new RegExp(`-${investigatorSlugs}$`));
			expect(
				team.members.every((member) => String(member.deck.id).startsWith(`${team.slug}/`)),
				team.slug
			).toBe(true);
		}
	});

	it('loads all eleven resolved 4P teams with a hosted source for every member', () => {
		const fourPlayerTeams = teams.filter((team) => team.slug.includes('-4p-'));
		expect(fourPlayerTeams).toHaveLength(11);
		for (const team of fourPlayerTeams) expectFullySourced(team, 4);
	});

	it('includes exactly the twelve untouched 3P combinations from Team Assembler', () => {
		const threePlayerTeams = teams.filter((team) => team.slug.includes('-3p-'));
		expect(threePlayerTeams).toHaveLength(12);
		expect(threePlayerTeams.map(rosterKey).sort()).toEqual(eligibleRosterKeys(3));
		for (const team of threePlayerTeams) expectFullySourced(team, 3);
	});

	it('includes the untouched 2P combinations plus Trish–Joe, except those missing a role', () => {
		const twoPlayerTeams = teams.filter((team) => team.slug.includes('-2p-'));
		const untouched = twoPlayerTeams.filter(
			(team) => team.slug !== 'hc-ch2-starter-guide-2p-joe-trish'
		);
		// Neither deck is rated 4 stars or higher at finding clues, or at handling enemies.
		const missingARole = [
			['12001', '12010'],
			['12001', '12013'],
			['12010', '60551'],
			['12010', '60151'],
			['12013', '60151'],
			['60151', '60551'],
			['60251', '60351'],
			['60351', '60451'],
			['60251', '60451']
		].map((roster) => roster.sort().join('|'));
		expect(twoPlayerTeams).toHaveLength(24);
		expect(untouched).toHaveLength(23);
		expect(untouched.map(rosterKey).sort()).toEqual(
			eligibleRosterKeys(2).filter((roster) => !missingARole.includes(roster))
		);
		for (const team of twoPlayerTeams) expectFullySourced(team, 2);
	});

	it('keeps every final team within its physical card pool', () => {
		for (const team of teams) {
			const decks = team.members.map(({ deck }) =>
				linkedAhdbDeckToDeck({ deck }, resolver, tabooLists)
			);
			const combination = deckUtility.findTeamOverlaps(decks, team.members.length)[0];
			expect(combination.overlaps, team.slug).toHaveLength(0);
		}
	});

	it('leaves the untouched 2P and 3P source deck card choices unchanged', () => {
		const untouched = teams.filter(
			(team) =>
				(team.slug.includes('-2p-') || team.slug.includes('-3p-')) &&
				team.slug !== 'hc-ch2-starter-guide-2p-joe-trish'
		);
		for (const team of untouched) {
			expect(team.description, team.slug).not.toContain('editor');
			expect(team.guideMd, team.slug).not.toContain('Overlap Resolution');
			for (const member of team.members) {
				expect(member.deck.slots, team.slug).toEqual(member.source!.primary.slots);
				expect(member.deck.sideSlots, team.slug).toEqual(member.source!.primary.sideSlots);
			}
		}
	});

	it('preserves separate Deduction printings in the resolved teams', () => {
		const fourPlayerTeam = teams.find((team) => team.slug.endsWith('joe-trish-marie-miguel'))!;
		const twoPlayerTeam = teams.find((team) => team.slug === 'hc-ch2-starter-guide-2p-joe-trish')!;
		for (const team of [fourPlayerTeam, twoPlayerTeam]) {
			const joe = team.members.find((member) => member.deck.investigator_code === '12004')!;
			const slots = joe.deck.slots ?? {};
			expect(slots['60267'], team.slug).toBe(2);
			expect(slots['12039'], team.slug).toBeUndefined();
		}
		expect(twoPlayerTeam.guideMd).toContain('Deduction');
		expect(twoPlayerTeam.guideMd).not.toContain('Perception');
	});

	it('uses Lie in Wait for Daniela in the Daniela–Isabelle–Carolyn–André team', () => {
		const team = teams.find(
			(team) => team.slug === 'hc-ch2-starter-guide-4p-daniela-isabelle-carolyn-andre'
		)!;
		const daniela = team.members.find((member) => member.deck.investigator_code === '12001')!;
		const isabelle = team.members.find((member) => member.deck.investigator_code === '12013')!;
		expect(daniela.deck.slots?.['60566']).toBe(1);
		expect(daniela.deck.slots?.['12090']).toBeUndefined();
		expect(isabelle.deck.slots?.['12090']).toBe(2);
		expect(isabelle.deck.slots?.['12092']).toBeUndefined();
		expect(team.guideMd).toContain('Lie in Wait');
		expect(team.guideMd).not.toContain('Overpower');
	});
});

describe('pre-built team tags', () => {
	const resolver = new CardResolver(getAllCards());
	const seriesTags = {
		'hc-ch2-combo-cult-': 'HC Ch2 Combo Cult',
		'hc-ch2-core-only-': 'HC Chapter 2 Core Only',
		'hc-ch2-quickie-': 'HC Quickie',
		'hc-ch2-starter-guide-': 'HC Chapter 2 Starter Guide',
		'hc-ch2-starters-revisited-': 'HC Ch2 Starters Revisited',
		'hc-cross-series-': 'HC Cross Series',
		'5argon-core-2026-no-dexter-': 'Pre-Built Team for 4P Core 2026',
		'5argon-core-2026-no-joe-': 'Pre-Built Team for 4P Core 2026'
	};

	/**
	 * Adjacent when every Core Set investigator can reach the others through classes
	 * they share, so a chain counts. Non-adjacent when no two share a class. A team
	 * in between is neither, and fewer than 2 of them have nothing to compare.
	 */
	function adjacencyTag(team: PrebuiltTeam): string[] {
		const classesOf = (code: string) =>
			(resolver.resolve(code).deckOptions ?? [])
				.flatMap((option) => option.faction ?? [])
				.filter((faction) => faction !== 'neutral');
		const shareClass = (a: string, b: string) =>
			classesOf(a).some((cardClass) => classesOf(b).includes(cardClass));
		const core = team.members
			.map((member) => member.deck.investigator_code)
			.filter((code) => resolver.resolve(code).product === Product.CoreSet2026);
		if (core.length < 2) return [];
		const reached = new Set([core[0]]);
		for (let round = 0; round < core.length; round++) {
			for (const code of core) {
				if ([...reached].some((other) => shareClass(code, other))) reached.add(code);
			}
		}
		if (reached.size === core.length) return ['Adjacent Core'];
		const anyPair = core.some((a, i) => core.slice(i + 1).some((b) => shareClass(a, b)));
		return anyPair ? [] : ['Non-Adjacent Core'];
	}

	// A series with only one team has no tag for it.
	it('tags every team with its series, Core Set and Investigator Deck mix, and core adjacency', () => {
		for (const team of allPrebuiltTeams()) {
			const series = Object.entries(seriesTags).find(([prefix]) => team.slug.startsWith(prefix));
			const core = team.members.filter(
				(member) => resolver.resolve(member.deck.investigator_code).product === Product.CoreSet2026
			).length;
			expect(team.tags, team.slug).toEqual([
				...(series ? [series[1]] : []),
				`${core}C+${team.members.length - core}ID`,
				...adjacencyTag(team)
			]);
		}
	});
});

describe('Cross Series pre-built teams', () => {
	const resolver = new CardResolver(getAllCards());
	const tabooLists = loadAllTabooLists();
	const teams = allPrebuiltTeams().filter((team) => team.slug.startsWith('hc-cross-series-'));

	function productsOf(deck: AhdbDeck): Product[] {
		return Object.keys({ ...deck.slots, ...deck.sideSlots })
			.map((code) => resolver.resolve(code).product)
			.filter((product) => product !== Product.RandomBasicWeakness);
	}

	it('assembles hosted decks from more than one series, with different main classes', () => {
		expect(teams.filter((team) => team.slug.includes('-4p-'))).toHaveLength(32);
		expect(teams.filter((team) => team.slug.includes('-3p-'))).toHaveLength(60);
		expect(teams.filter((team) => team.slug.includes('-2p-'))).toHaveLength(29);
		for (const team of teams) {
			const size = Number(team.slug.match(/-(\d)p-/)?.[1]);
			expect(team.members, team.slug).toHaveLength(size);
			expect(team.exclusive, team.slug).toBe(false);
			const series = team.members.map((member) => member.source!.series.slug);
			expect(new Set(series).size, team.slug).toBeGreaterThan(1);
			const decks = team.members.map(({ deck }) =>
				linkedAhdbDeckToDeck({ deck }, resolver, tabooLists)
			);
			expect(hasUniqueInvestigatorClasses(decks), team.slug).toBe(true);
		}
	});

	it('states the Core Set and Investigator Deck split in its name', () => {
		for (const team of teams) {
			const core = team.members.filter(
				(member) => resolver.resolve(member.deck.investigator_code).product === Product.CoreSet2026
			).length;
			const size = team.members.length;
			expect(team.name, team.slug).toContain(` ${size}P - ${core}C+${size - core}ID - `);
			if (size === 4) expect([2, 3], team.slug).toContain(core);
		}
	});

	it('resolves every overlap', () => {
		for (const team of teams) {
			const decks = team.members.map(({ deck }) =>
				linkedAhdbDeckToDeck({ deck }, resolver, tabooLists)
			);
			const overlaps = deckUtility.findTeamOverlaps(decks, decks.length)[0].overlaps;
			expect(overlaps, team.slug).toHaveLength(0);
		}
	});

	it('uses only products its source decks already use', () => {
		for (const team of teams) {
			const pool = new Set(
				team.members.flatMap((member) => [
					...productsOf(member.source!.primary),
					resolver.resolve(member.deck.investigator_code).product
				])
			);
			for (const member of team.members) {
				for (const product of productsOf(member.deck)) {
					expect(pool.has(product), `${member.deck.id} ${product}`).toBe(true);
				}
			}
		}
	});
});

describe('Quick Learner', () => {
	const resolver = new CardResolver(getAllCards());
	const tabooLists = loadAllTabooLists();
	const series = starterSeries('quick-learner', 'four-good-decks')!;
	const teams = prebuiltTeamsOf('quick-learner');

	it('has one 4 player team, with no copy of any card over the Core Set', () => {
		expect(teams.map((team) => team.members.length)).toEqual([4]);
		const decks = series.entries.map((entry) =>
			linkedAhdbDeckToDeck({ deck: entry.primary }, resolver, tabooLists)
		);
		expect(deckUtility.findDeckOverlaps(decks).map((overlap) => overlap.card.name)).toEqual([]);
	});

	it('only offers the 0 XP decks shared in the video', () => {
		for (const entry of series.entries) {
			expect(
				entry.versions.map((version) => version.breakpoint),
				entry.slug
			).toEqual([0]);
			expect(entry.upgradePlan, entry.slug).toBeUndefined();
		}
	});

	it('credits the video on every deck guide and the team guide', () => {
		const guides = [
			...series.entries.map((entry) => entry.primary.description_md ?? ''),
			teams[0].guideMd
		];
		for (const guide of guides) expect(guide).toContain(series.sourceUrl);
	});
});

describe('HC Quickie', () => {
	const resolver = new CardResolver(getAllCards());
	const tabooLists = loadAllTabooLists();
	const entries = starterSeries('hungry-colquhoun', 'ch2-quickie')!.entries;
	const teams = prebuiltTeamsOf('hungry-colquhoun').filter((team) =>
		team.slug.startsWith('hc-ch2-quickie-')
	);

	it('has one team, for 4 players only as the author intends', () => {
		expect(teams.map((team) => team.members.length)).toEqual([4]);
		expect(teams[0].members.flatMap((member) => member.changes ?? [])).toEqual([]);
	});

	it('shows clean deck names', () => {
		for (const entry of entries) {
			expect(entry.primary.name, entry.slug).toMatch(
				/^[A-Z][a-z]+ [A-Z][a-z]+: 4 Player Compatible$/
			);
		}
	});

	it('plays Core Set 2026 printings only', () => {
		for (const entry of entries) {
			for (const { deck } of entry.versions) {
				const products = Object.keys({ ...deck.slots, ...deck.sideSlots })
					.map((code) => resolver.resolve(code).product)
					.filter((product) => product !== Product.RandomBasicWeakness);
				expect(new Set(products), entry.slug).toEqual(new Set([Product.CoreSet2026]));
			}
		}
	});

	it('plans exactly the upgrades waiting in each side deck', () => {
		for (const entry of entries) {
			const planned = Object.fromEntries(
				[...plannedCopies(entry)].map(([code, copies]) => [code, copies.length])
			);
			expect(planned, entry.slug).toEqual(entry.primary.sideSlots);
		}
	});

	it('never overlaps, even in the upgrades waiting in the side decks', () => {
		const decks = entries.map((entry) =>
			linkedAhdbDeckToDeck({ deck: entry.primary }, resolver, tabooLists)
		);
		const overlaps = deckUtility.findDeckOverlaps(decks);
		expect(overlaps.map((overlap) => overlap.card.name)).toEqual([]);
	});
});

describe('5argon pre-built teams', () => {
	const resolver = new CardResolver(getAllCards());
	const tabooLists = loadAllTabooLists();
	const teams = prebuiltTeamsOf('5argon');
	const lineups = ['no-dexter', 'no-joe'];
	const ofLineup = (lineup: string, size: number) =>
		teams.filter((team) => team.slug.startsWith(`5argon-core-2026-${lineup}-${size}p-`));

	it('has every roster of the 4 decks in each lineup', () => {
		expect(teams).toHaveLength(22);
		for (const lineup of lineups) {
			expect(ofLineup(lineup, 4), lineup).toHaveLength(1);
			expect(ofLineup(lineup, 3), lineup).toHaveLength(4);
			expect(ofLineup(lineup, 2), lineup).toHaveLength(6);
		}
		for (const team of teams) {
			expect(team.exclusive, team.slug).toBe(false);
			for (const member of team.members) {
				expect(member.source?.series.slug, team.slug).toBe('pre-built-team-4p-core-2026');
				expect(member.source?.slug, team.slug).toContain(
					team.slug.split('-').slice(3, 5).join('-')
				);
				expect(member.changes ?? [], team.slug).toEqual([]);
			}
		}
	});

	it('gives every team a name of its own', () => {
		const names = allPrebuiltTeams().map((team) => team.name);
		expect(names.filter((name, i) => names.indexOf(name) !== i)).toEqual([]);
	});

	it('never overlaps, even in the upgrades waiting in the side decks', () => {
		for (const lineup of lineups) {
			const decks = ofLineup(lineup, 4)[0].members.map(({ deck }) =>
				linkedAhdbDeckToDeck({ deck }, resolver, tabooLists)
			);
			const overlaps = deckUtility.findDeckOverlaps(decks);
			expect(
				overlaps.map((overlap) => overlap.card.name),
				lineup
			).toEqual([]);
		}
	});

	it('keeps the side deck as published, and only what is still to come after the upgrades', () => {
		const sideSizes = [1, 2, 3, 4].map((n) => {
			const entry = starterDeck('5argon', 'pre-built-team-4p-core-2026', `no-dexter-${n}`)!;
			return Object.values(entry.primary.sideSlots ?? {}).reduce((sum, q) => sum + q, 0);
		});
		expect(sideSizes).toEqual([6, 8, 6, 8]);
		const daniela = starterDeck('5argon', 'pre-built-team-4p-core-2026', 'no-dexter-1')!;
		const winchester = '12029';
		expect(daniela.primary.sideSlots?.[winchester]).toBe(2);
		expect(daniela.versions[1].deck.slots?.[winchester]).toBeUndefined();
		expect(daniela.versions[1].deck.sideSlots?.[winchester]).toBe(2);
		expect(daniela.versions[2].deck.slots?.[winchester]).toBe(1);
		expect(daniela.versions[2].deck.sideSlots?.[winchester]).toBe(1);
	});

	it('lists everything swapped out since 0 XP in the side deck of each build', () => {
		const isabelle = starterDeck('5argon', 'pre-built-team-4p-core-2026', 'no-dexter-4')!;
		const flashlight = '12088';
		const unexpectedCourage = '12094';
		const [, nine, nineteen] = isabelle.versions;
		expect(nine.deck.sideSlots?.[flashlight]).toBe(2);
		expect(nine.deck.sideSlots?.[unexpectedCourage]).toBeUndefined();
		expect(nineteen.deck.sideSlots?.[flashlight]).toBe(2);
		expect(nineteen.deck.sideSlots?.[unexpectedCourage]).toBe(2);
	});

	it('offers builds at the 9 and 19 XP breakpoints', () => {
		const spentBy = (lineup: string) =>
			[1, 2, 3, 4].map((n) => {
				const entry = starterDeck('5argon', 'pre-built-team-4p-core-2026', `${lineup}-${n}`)!;
				expect(entry.versions.map((version) => version.breakpoint)).toEqual([0, 9, 19]);
				return entry.versions.map(({ deck }) =>
					deckUtility.calculateDeckXp(linkedAhdbDeckToDeck({ deck }, resolver, tabooLists))
				);
			});
		expect(spentBy('no-dexter')).toEqual([
			[0, 8, 16],
			[0, 9, 17],
			[0, 9, 16],
			[0, 9, 16]
		]);
		expect(spentBy('no-joe')).toEqual([
			[0, 7, 17],
			[0, 8, 18],
			[0, 7, 16],
			[0, 8, 18]
		]);
	});

	it('leaves HungryColquhoun with only their own teams', () => {
		for (const team of prebuiltTeamsOf('hungry-colquhoun')) {
			expect(team.slug, team.slug).toMatch(/^hc-/);
		}
	});
});
