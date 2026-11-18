/**
 * Who played: decks (from the deck histories ArkhamCards keeps for a campaign), participants, the
 * owner's hands and the player count.
 *
 * Every deck the owner attached is the owner's: friends who didn't use the app had their decks
 * attached by the owner, who turns them into guests in arkham.life afterwards. Each other
 * ArkhamCards account that attached a deck or is a member of a campaign is a roster player, and a
 * participant of each campaign they played an investigator in.
 *
 * A deck detached from a campaign leaves its investigator listed without one. The guide steps that
 * upgraded or saved its deck still name the deck's ArkhamDB owner, which tells whose it was.
 */

/** An ArkhamCards deck version as an ArkhamDB deck (`AhdbDeck`), the shape life stores. */
function toAhdbDeck(row) {
	const c = row.content ?? {};
	const meta = typeof c.meta === 'string' ? c.meta : JSON.stringify(c.meta ?? {});
	return {
		id: row.arkhamdb_id ?? c.id ?? row.local_uuid,
		name: c.name ?? '',
		date_creation: c.date_creation ?? '',
		date_update: c.date_update ?? '',
		description_md: c.description_md ?? '',
		user_id: c.user_id ?? row.arkhamdb_user ?? null,
		investigator_code: c.investigator_code ?? row.investigator,
		investigator_name: c.investigator_name ?? '',
		slots: c.slots ?? {},
		sideSlots: Array.isArray(c.sideSlots) ? {} : (c.sideSlots ?? {}),
		ignoreDeckLimitSlots: c.ignoreDeckLimitSlots ?? {},
		version: c.version ?? '',
		xp: c.xp ?? null,
		xp_spent: c.spentXp ?? c.xp_spent ?? null,
		xp_adjustment: c.xp_adjustment ?? null,
		exile_string: c.exile_string ?? null,
		taboo_id: c.taboo_id ?? null,
		meta,
		tags: typeof c.tags === 'string' ? c.tags : Array.isArray(c.tags) ? c.tags.join(' ') : '',
		previous_deck: null,
		next_deck: null,
		problem: c.problem ?? null
	};
}

/** The upgrade chains in a campaign's deck history, each oldest first. */
function deckChains(deckHistory) {
	const chains = [];
	for (const rows of Object.values(deckHistory ?? {})) {
		const byId = new Map(rows.map((r) => [r.id, r]));
		const roots = rows.filter((r) => !r.previous_deck || !byId.has(r.previous_deck.id));
		for (const root of roots) {
			const chain = [];
			const seen = new Set();
			for (let r = root; r && !seen.has(r.id); r = r.next_deck ? byId.get(r.next_deck.id) : undefined) {
				seen.add(r.id);
				chain.push(r);
			}
			chains.push(chain);
		}
	}
	return chains;
}

const bump = (counts, key) => counts.set(key, (counts.get(key) ?? 0) + 1);
/** The key counted most often. */
const mostOf = (counts) => [...counts].sort((a, b) => b[1] - a[1])[0]?.[0];
const accountOfRow = (row) => row.owner?.id ?? row.owner_id;
/** The campaign's members (`{ id, handle }`) once each; the owner is listed as one too. */
const membersOf = (record) =>
	(Array.isArray(record.members) ? record.members : []).filter(
		(m, i, all) => all.findIndex((other) => other.id === m.id) === i
	);

/** The investigators with a deck attached, by the campaign's code and the deck's. */
function deckedInvestigators(record) {
	const codes = new Set();
	for (const chain of deckChains(record.deckHistory)) {
		const first = chain.find((row) => row.content);
		if (!first) continue;
		codes.add(chain[0].investigator);
		if (first.content.investigator_code) codes.add(first.content.investigator_code);
	}
	return codes;
}

/** The campaign's investigator rows without a deck attached, once each. */
function detachedInvestigators(record) {
	const decked = deckedInvestigators(record);
	const seen = new Set();
	return (record.campaign.investigators ?? []).filter((row) => {
		if (decked.has(row.investigator) || (row.printing && decked.has(row.printing))) return false;
		if (seen.has(row.investigator)) return false;
		seen.add(row.investigator);
		return true;
	});
}

/** The ArkhamDB user owning the decks the guide steps name for an investigator, the most named. */
function stepDeckUser(record, code) {
	const users = new Map();
	for (const input of record.guide?.guide_inputs ?? []) {
		const user = input.payload?.deckId?.arkhamdb_user;
		if (user && input.step?.endsWith(`#${code}`)) bump(users, user);
	}
	return mostOf(users);
}

/**
 * Who is who across the export: every ArkhamCards account (with its handle and the investigators it
 * played) and, per campaign, who played each investigator without a deck attached.
 *
 * An ArkhamDB user's account comes from the decks still attached anywhere. A user with none
 * attached is the one member every campaign they played leaves unaccounted for, or else stands
 * alone as `arkhamdb:<user id>`. An investigator no step names a deck for takes over the seat of
 * the one investigator it replaced, or else belongs to the one member (the owner included) its
 * campaign leaves unaccounted for, or else to the owner. A member who played nothing is left out of
 * that campaign.
 */
export function peopleIndex(records, ownerAccount) {
	const userAccounts = new Map();
	for (const record of records) {
		for (const rows of Object.values(record.deckHistory ?? {})) {
			for (const row of rows) {
				const user = row.arkhamdb_user ?? row.content?.user_id;
				const account = accountOfRow(row);
				if (!user || !account) continue;
				const counts = userAccounts.get(user) ?? new Map();
				bump(counts, account);
				userAccounts.set(user, counts);
			}
		}
	}
	const byUser = new Map([...userAccounts].map(([user, counts]) => [user, mostOf(counts)]));

	/** Members, the owner among them, who attached no deck and play none of `players`' investigators. */
	const unaccounted = (record, players) => {
		const taken = new Set(players);
		for (const rows of Object.values(record.deckHistory ?? {})) for (const row of rows) taken.add(accountOfRow(row));
		return membersOf(record)
			.map((m) => m.id)
			.filter((id) => !taken.has(id));
	};

	const candidates = new Map();
	for (const record of records) {
		if (!membersOf(record).length) continue;
		const known = detachedInvestigators(record)
			.map((row) => byUser.get(stepDeckUser(record, row.investigator)))
			.filter(Boolean);
		for (const row of detachedInvestigators(record)) {
			const user = stepDeckUser(record, row.investigator);
			if (!user || byUser.has(user)) continue;
			// The owner's ArkhamDB user is known from their own decks, so this one is someone else.
			const free = new Set(unaccounted(record, known).filter((id) => id !== ownerAccount));
			const before = candidates.get(user);
			candidates.set(user, before ? new Set([...before].filter((id) => free.has(id))) : free);
		}
	}
	for (const [user, ids] of candidates) if (ids.size === 1) byUser.set(user, [...ids][0]);

	/**
	 * Each investigator without a deck attached, by code, with the account that played it. With the
	 * investigators playing each scenario, one that joined as exactly one other left took over that
	 * player's seat.
	 */
	function detachedPlayers(record, playing = []) {
		const players = new Map();
		let unnamed = [];
		for (const row of detachedInvestigators(record)) {
			const user = stepDeckUser(record, row.investigator);
			if (user) players.set(row.investigator, byUser.get(user) ?? `arkhamdb:${user}`);
			else unnamed.push(row.investigator);
		}
		const seats = new Map(players);
		for (const rows of Object.values(record.deckHistory ?? {})) {
			for (const row of rows) seats.set(row.investigator, accountOfRow(row));
		}
		unnamed = unnamed.filter((code) => {
			const account = takenSeat(code, playing, seats);
			if (account) players.set(code, account);
			return !account;
		});
		const free = unaccounted(record, players.values());
		for (const code of unnamed) players.set(code, free.length === 1 ? free[0] : ownerAccount);
		return players;
	}

	const accounts = new Map();
	const account = (id, handle) => {
		const entry = accounts.get(id) ?? { id, handle: '', investigators: {} };
		if (!entry.handle && handle) entry.handle = handle;
		accounts.set(id, entry);
		return entry;
	};
	const played = (entry, code) => (entry.investigators[code] = (entry.investigators[code] ?? 0) + 1);
	for (const record of records) {
		for (const member of membersOf(record)) account(member.id, member.handle);
		for (const rows of Object.values(record.deckHistory ?? {})) {
			for (const row of rows) {
				const id = accountOfRow(row);
				if (id) played(account(id, row.owner?.handle), row.investigator);
			}
		}
		for (const [code, id] of detachedPlayers(record)) {
			played(account(id, id.startsWith('arkhamdb:') ? `ArkhamDB user ${id.slice(9)}` : ''), code);
		}
	}
	return { accounts, detachedPlayers };
}

/** The account of the investigator `code` replaced: the one who left as it joined, when only one did. */
function takenSeat(code, playing, accountOf) {
	const played = playing.filter((codes) => codes.length);
	for (let i = 1; i < played.length; i++) {
		if (!played[i].includes(code) || played[i - 1].includes(code)) continue;
		const joined = played[i].filter((c) => !played[i - 1].includes(c));
		const left = played[i - 1].filter((c) => !played[i].includes(c));
		return joined.length === 1 && left.length === 1 ? accountOf.get(left[0]) : undefined;
	}
	return undefined;
}

/** The investigators playing each scenario, in play order. */
function playingByScenario(replay) {
	return (replay?.scenarios ?? []).map(
		(s) => (replay.log.scenarioData?.[s.id]?.playingScenario ?? []).map((p) => p.investigator)
	);
}

/**
 * Hand numbers for the owner's investigators: a new investigator takes the lowest hand none of the
 * owner's other investigators in that scenario holds, so a replacement keeps the hand of the one
 * it replaced.
 */
function ownerHands(ownerInvestigators, playing) {
	const hands = new Map();
	for (const scenario of playing) {
		const mine = scenario.filter((code) => ownerInvestigators.has(code));
		const held = new Set(mine.flatMap((code) => (hands.has(code) ? [hands.get(code)] : [])));
		for (const code of mine) {
			if (hands.has(code)) continue;
			let hand = 1;
			while (held.has(hand)) hand++;
			hands.set(code, hand);
			held.add(hand);
		}
	}
	let next = Math.max(0, ...hands.values()) + 1;
	for (const code of ownerInvestigators) if (!hands.has(code)) hands.set(code, next++);
	return hands;
}

/**
 * The record's decks, participant accounts, player count and multi-handed flag.
 * `uidOfAccount` gives the life uid of an ArkhamCards account (the owner's for the owner).
 * `assigned` names the account of investigators the export can't tell, by investigator code.
 */
export function convertPeople(
	record,
	replay,
	{ ownerAccount, uidOfAccount, investigatorFromAhdbDeck, detachedPlayers, assigned = new Map() }
) {
	const campaign = record.campaign;
	const decks = [];
	const accounts = new Set();
	const ownerInvestigators = new Set();

	for (const chain of deckChains(record.deckHistory)) {
		const account =
			assigned.get(chain[0].investigator) ?? chain[0].owner?.id ?? chain[0].owner_id ?? ownerAccount;
		const versions = chain
			.filter((row) => row.content)
			.map((row, i) => ({ sequenceIndex: i, ahdbJson: JSON.stringify(toAhdbDeck(row)) }));
		if (!versions.length) continue;
		const investigator = investigatorFromAhdbDeck(JSON.parse(versions[0].ahdbJson));
		if (account === ownerAccount) ownerInvestigators.add(chain[0].investigator);
		else accounts.add(account);
		decks.push({
			id: `arkhamcards-deck-${chain[0].id}`,
			ownerUid: uidOfAccount(account),
			investigator,
			versions,
			acInvestigator: chain[0].investigator
		});
	}

	const playing = playingByScenario(replay);
	const detached = detachedPlayers(record, playing);
	for (const row of detachedInvestigators(record)) {
		const account = assigned.get(row.investigator) ?? detached.get(row.investigator) ?? ownerAccount;
		if (account === ownerAccount) ownerInvestigators.add(row.investigator);
		else accounts.add(account);
		decks.push({
			id: `arkhamcards-investigator-${campaign.id}-${row.investigator}`,
			ownerUid: uidOfAccount(account),
			investigator: {
				investigatorCode: row.investigator,
				alternateFrontCode: row.printing ?? null,
				alternateBackCode: null,
				factionSelected: null,
				faction1: null,
				faction2: null,
				optionSelected: null,
				deckSizeSelected: null
			},
			versions: [],
			acInvestigator: row.investigator
		});
	}

	const hands = ownerHands(ownerInvestigators, playing);
	const multiHanded = new Set(hands.values()).size > 1;
	for (const deck of decks) {
		if (multiHanded && ownerInvestigators.has(deck.acInvestigator)) deck.hand = hands.get(deck.acInvestigator);
		delete deck.acInvestigator;
	}

	const mostPlaying = Math.max(0, ...playing.map((p) => p.length));
	return {
		decks,
		accounts: [...accounts],
		playerCount: mostPlaying >= 1 ? Math.min(mostPlaying, 4) : 'auto',
		multiHanded
	};
}
