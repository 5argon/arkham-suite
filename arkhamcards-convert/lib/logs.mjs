/**
 * An ArkhamCards campaign log (as the guide engine computes it) as arkham.life log entries, in the
 * shapes life's campaign-log editor writes for each campaign-data section type:
 *
 * - notes (and calendar): `section.id`; a count param adds `[number]`, a `#name#` card choice adds
 *   `[card code]` (a partner id in a campaign with a partner roster), `#X#` a number after it; a
 *   crossed-out entry adds `'__crossed__'`.
 * - cards: `section.<card code>` per card. checklist, glyphs, seals: `section.id`.
 * - count: the bare section id with `[number]`. relationship: the level the same way, its notes as
 *   `section.id`.
 * - investigatorCount: `section.<investigator>` with `[number]`. supplies:
 *   `section.<investigator>.<supply>`, `[number]` for a repeatable supply.
 * - scarletKeys: `section.<key>` with `[bearer]`, from the TSK map state.
 * - partner: `section.<partner>` with the marks life records, from the partner's trauma.
 * - the final chaos bag in `__chaos_bag`; The Dream-Eaters' interconnected flag and linked log.
 *
 * Note entries are written in the order the campaign first recorded them, which life reads as the
 * play order. Entries campaign-data doesn't define are left out and reported.
 */

const num = (n) => ({ type: 'number', value: String(Number(n) || 0) });
const str = (value) => ({ type: 'string', value: String(value) });

/** Tokens life's chaos bag records (no bless / curse). */
const BAG_TOKENS = new Set([
	'+1', '0', '-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8',
	'skull', 'cultist', 'tablet', 'elder_thing', 'auto_fail', 'elder_sign', 'frost', 'blood'
]);

/** A partner's marks from its trauma data, as life records them. */
function partnerMarks(item, data, wasMia) {
	const assets = new Set(data?.storyAssets ?? []);
	const resolute = assets.has('resolute');
	const health = (resolute && item.resoluteHealth) || item.health;
	const sanity = (resolute && item.resoluteSanity) || item.sanity;
	const damage = data?.physical ?? 0;
	const horror = data?.mental ?? 0;
	const mia = assets.has('mia') || wasMia;
	return {
		nameCrossed: !!data?.killed || (health != null && damage >= health) || (sanity != null && horror >= sanity),
		resolute,
		mia,
		miaCrossed: mia && !assets.has('mia'),
		damage,
		horror
	};
}

export function convertLogs({ record, replay, records, log, dataCode, life, report, replayOf }) {
	const state = replay.log;
	const db = log.db;
	const sideLog = life.getCampaignLog('side');
	const sectionDefs = new Map(db.sections.map((s) => [s.id, s]));
	const entryDefs = new Map();
	for (const def of [...(sideLog?.db.entries ?? []), ...db.entries]) entryDefs.set(`${def.section}.${def.id}`, def);
	const enText = (key) => log.en.entries?.[key]?.text ?? sideLog?.en.entries?.[key]?.text ?? '';
	const partnerSection = db.sections.find((s) => s.type === 'partner');
	const partnerIdByCode = new Map((partnerSection?.items ?? []).map((i) => [i.code, i.id]));
	const order = new Map(replay.entryOrder.map((key, i) => [key, i]));

	const out = [];
	const keys = new Set();
	const unknown = new Map();
	const push = (section, key, args = [], { orderKey = key, repeatable = false } = {}) => {
		if (!repeatable && keys.has(key)) return;
		keys.add(key);
		out.push({ entry: { section, key, args }, order: order.get(orderKey) ?? Number.MAX_SAFE_INTEGER });
	};
	const noteUnknown = (key) => unknown.set(key, (unknown.get(key) ?? 0) + 1);

	/** The args of a note entry, by its campaign-data param. */
	const noteArgs = (def, entry, key) => {
		const p = def.param;
		if (p?.type === 'count' || p?.type === 'investigatorCount') return [[num(entry.count ?? 0)]];
		if (p?.type === 'text') return [[str(entry.text ?? '')]];
		if (p?.type === 'cards' && p.cards?.mode === 'choice') {
			const cards = entry.type === 'card' ? entry.cards : [];
			if (!cards.length) {
				report({ kind: 'name', key, detail: 'no card recorded for its #name#' });
				return [];
			}
			const withX = enText(key).includes('#X#');
			return cards.map((c) => [
				str(partnerSection ? (partnerIdByCode.get(c.card) ?? c.card) : c.card),
				...(withX ? [num(c.count ?? 0)] : [])
			]);
		}
		return [entry.type === 'count' ? [num(entry.count ?? 0)] : []];
	};

	for (const [section, value] of Object.entries(state.sections ?? {})) {
		const def = sectionDefs.get(section);
		const entries = value?.entries ?? [];
		const type = def?.type;
		if (type === 'partner' || type === 'header') continue;
		for (const entry of entries) {
			const key = `${section}.${entry.id}`;
			if (type === 'cards') {
				const codes = entry.type === 'card' ? entry.cards.map((c) => c.card) : [entry.id];
				for (const code of codes) push(section, `${section}.${code}`, [], { orderKey: key });
				continue;
			}
			if (type === 'checklist' || type === 'investigatorChecklist' || type === 'glyphs' || type === 'seals') {
				push(section, key);
				continue;
			}
			if (type === 'relationship' && entry.id === '$relationship') {
				if ((entry.count ?? 0) > 0) push(section, section, [num(entry.count)], { orderKey: key });
				continue;
			}
			if (type === 'relationship') {
				push(section, key);
				continue;
			}
			if (entry.type === 'freeform') {
				report({ kind: 'freeform', key: section, detail: String(entry.text ?? '') });
				continue;
			}
			const noteDef = entryDefs.get(key);
			if (!noteDef) {
				noteUnknown(key);
				continue;
			}
			for (const args of noteArgs(noteDef, entry, key)) {
				push(section, key, entry.crossedOut ? [...args, str(life.CROSSED_MARK)] : args, {
					repeatable: !!noteDef.repeatable
				});
			}
		}
	}

	for (const [section, value] of Object.entries(state.countSections ?? {})) {
		const type = sectionDefs.get(section)?.type;
		if (type !== 'count' && type !== 'relationship') {
			if ((value?.count ?? 0) > 0) noteUnknown(`${section} (count)`);
			continue;
		}
		if ((value?.count ?? 0) > 0) push(section, section, [num(value.count)]);
	}

	for (const [section, byInvestigator] of Object.entries(state.investigatorSections ?? {})) {
		const def = sectionDefs.get(section);
		for (const [code, value] of Object.entries(byInvestigator ?? {})) {
			for (const entry of value?.entries ?? []) {
				if (def?.type === 'investigatorCount' && entry.id === '$count') {
					if ((entry.count ?? 0) > 0) push(section, `${section}.${code}`, [num(entry.count)]);
				} else if (def?.type === 'supplies') {
					if ((entry.count ?? 0) <= 0) continue;
					const item = (def.items ?? []).find((i) => i.id === entry.id);
					if (!item) noteUnknown(`${section}.${entry.id}`);
					else push(section, `${section}.${code}.${entry.id}`, item.repeatable ? [num(entry.count)] : []);
				} else {
					noteUnknown(`${section}.${code}.${entry.id}`);
				}
			}
		}
	}

	const keysSection = db.sections.find((s) => s.type === 'scarletKeys');
	if (keysSection) {
		const known = new Set((keysSection.items ?? []).map((i) => i.id));
		for (const [keyId, status] of Object.entries(state.campaignData?.scarlet?.keyStatus ?? {})) {
			const bearer = status?.investigator ?? status?.enemy;
			if (!bearer) continue;
			if (!known.has(keyId)) noteUnknown(`${keysSection.id}.${keyId}`);
			else push(keysSection.id, `${keysSection.id}.${keyId}`, [str(bearer)]);
		}
	}

	if (partnerSection) {
		const investigatorData = state.campaignData?.investigatorData ?? {};
		for (const item of partnerSection.items ?? []) {
			const data = investigatorData[item.code];
			if (!data) continue;
			const wasMia = replay.scenarios.some((s) => s.assetsAfter?.[item.code]?.includes('mia'));
			const args = life.partnerArgs(partnerMarks(item, data, wasMia));
			if (args) push(partnerSection.id, `${partnerSection.id}.${item.id}`, args);
		}
	}

	const bag = {};
	for (const [token, n] of Object.entries(state.chaosBag ?? {})) if (BAG_TOKENS.has(token)) bag[token] = n;
	for (const e of life.chaosBagEntries(bag)) push(e.section, e.key, e.args);

	out.sort((a, b) => a.order - b.order);
	let logs = out.map((o) => o.entry);

	let linkedLog;
	if (dataCode === 'tdea' || dataCode === 'tdeb') {
		const sibling = record.campaign.linked_campaign ? records.get(record.campaign.linked_campaign.id) : undefined;
		logs = life.toSavePayload(life.withInterconnected(logs.map((l) => life.makeEntry(l.section, l.key, l.args)), !!sibling));
		if (sibling) {
			const siblingReplay = replayOf(sibling);
			const topicKeys = new Set(life.linkedTopicsFor(dataCode).flatMap((t) => t.keys));
			const recorded = (siblingReplay?.log?.sections?.campaign_notes?.entries ?? []).map((e) => `campaign_notes.${e.id}`);
			linkedLog = [...new Set(recorded.filter((k) => topicKeys.has(k)))].map((key) => ({
				section: 'campaign_notes',
				key,
				args: []
			}));
		}
	}

	for (const [key, count] of unknown) report({ kind: 'unknown', key, count });
	return { logs, linkedLog };
}
