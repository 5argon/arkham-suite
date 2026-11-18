#!/usr/bin/env node
/**
 * Converts exported ArkhamCards campaigns into an arkham.life Database (`.ahlifedb`).
 *
 * Each guided campaign is replayed through the ArkhamCards guide engine (`engine/build.mjs` must
 * have run), then written as a life record with life's own document operations: its campaign log,
 * the Extra tab's fields, decks, participants, dates and achievements. A record's id is the
 * ArkhamCards campaign's uuid, so converting again finds the same record.
 *
 * Usage:
 *   node convert.mjs [--export <arkhamcards-cloud-*.json>] [--campaign <code>]… [--into <file>]
 *     [--owner-name <name>] [--arkhamcards <clone>] [--out <dir>]
 *
 * - Without `--into`, writes a new Database with every converted campaign.
 * - With `--into <.ahlifedb or .json saved from life>`, converts only the `--campaign` codes given
 *   (all when none) and replaces the log of the matching records, keeping every other edit made in
 *   life; a campaign not in it yet is added.
 * - The people settings (roster uids, play groups) live in `convert-people.json` next to the
 *   export; see lib/people-config.mjs.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { gunzipSync, gzipSync } from 'node:zlib';
import { parseArgs } from 'node:util';

import * as life from './engine/dist/life.mjs';
import { campaignCodes } from './lib/codes.mjs';
import { convertExtras } from './lib/extras.mjs';
import { convertLogs } from './lib/logs.mjs';
import { convertPeople, peopleIndex } from './lib/people.mjs';
import { readPeopleConfig, writePeopleConfig } from './lib/people-config.mjs';
import { loadGuideData, loadInvestigators, replayCampaign } from './lib/replay.mjs';

const { values } = parseArgs({
	options: {
		export: { type: 'string' },
		campaign: { type: 'string', multiple: true },
		into: { type: 'string' },
		'owner-name': { type: 'string' },
		arkhamcards: { type: 'string', default: join(homedir(), 'Documents', 'ArkhamCards') },
		out: { type: 'string' }
	}
});
const base = process.env.INIT_CWD ?? process.cwd();

async function newestExport() {
	const dir = join(homedir(), 'Documents', 'arkhamcards-exports');
	const names = (await readdir(dir)).filter((n) => /^arkhamcards-cloud-.*\.json$/.test(n)).sort();
	if (!names.length) throw new Error(`No arkhamcards-cloud-*.json in ${dir}; pass --export.`);
	return join(dir, names.at(-1));
}

const exportPath = values.export ? resolve(base, values.export) : await newestExport();
const exportDir = dirname(exportPath);
// Next to the Database being updated, else next to the export.
const outDir = values.out
	? resolve(base, values.out)
	: values.into
		? dirname(resolve(base, values.into))
		: exportDir;
const clone = resolve(base, values.arkhamcards);
const exported = JSON.parse(await readFile(exportPath, 'utf8'));
const records = new Map(exported.campaigns.map((r) => [r.campaign.id, r]));
const guideData = loadGuideData(clone);
const investigators = loadInvestigators(clone);
const ownerAccount = exported.userId;

// ─── People ──────────────────────────────────────────────────────────────────

const { accounts, detachedPlayers } = peopleIndex(exported.campaigns, ownerAccount);
const mostPlayed = (account) =>
	Object.entries(account?.investigators ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0];
const configPath = join(exportDir, 'convert-people.json');
const config = readPeopleConfig(configPath) ?? {
	owner: { account: ownerAccount, name: values['owner-name'] ?? accounts.get(ownerAccount)?.handle ?? 'Me' },
	players: {},
	playGroups: [
		{ name: 'Pawley', members: ['Pawley'] },
		{ name: 'Mommam, Nawamin080, Pawley', members: ['Mommam', 'Nawamin080', 'Pawley'] }
	]
};

function readDatabase(text) {
	return JSON.parse(text);
}

let doc;
if (values.into) {
	const bytes = await readFile(resolve(base, values.into));
	const isGzip = bytes[0] === 0x1f && bytes[1] === 0x8b;
	doc = readDatabase(isGzip ? gunzipSync(bytes).toString('utf8') : bytes.toString('utf8'));
} else {
	doc = life.createEmptyDatabase({
		name: config.owner.name,
		iconCardCode: mostPlayed(accounts.get(ownerAccount))
	});
	if (config.owner.uid) doc.owner.uid = config.owner.uid;
	config.owner.uid = doc.owner.uid;
	for (const [id, account] of accounts) {
		if (id === ownerAccount) continue;
		const known = config.players[id];
		if (known) {
			doc.players.push({ uid: known.uid, name: known.name, iconCardCode: mostPlayed(account) ?? '01001' });
		} else {
			const player = life.addPlayer(doc, { name: account.handle || id, iconCardCode: mostPlayed(account) });
			config.players[id] = { uid: player.uid, name: player.name };
		}
	}
	for (const player of config.withoutTheApp ?? []) {
		const icon = player.plays?.[0]?.investigators?.[0] ?? '01001';
		if (player.uid) doc.players.push({ uid: player.uid, name: player.name, iconCardCode: icon });
		else player.uid = life.addPlayer(doc, { name: player.name, iconCardCode: icon }).uid;
	}
	const uidByName = new Map(doc.players.map((p) => [p.name, p.uid]));
	for (const group of config.playGroups) {
		const created = life.createPlayGroup(doc, {
			name: group.name,
			memberUids: [doc.owner.uid, ...group.members.map((name) => uidByName.get(name)).filter(Boolean)]
		});
		if (group.uid) created.uid = group.uid;
		group.uid = created.uid;
	}
	writePeopleConfig(configPath, config);
}

const roster = new Map([doc.owner, ...doc.players].map((p) => [p.uid, p]));
/** A player without the app stands in for an ArkhamCards account as `without-app:<name>`. */
const withoutTheApp = new Map((config.withoutTheApp ?? []).map((p) => [`without-app:${p.name}`, p]));
function uidOfAccount(account) {
	if (account === ownerAccount) return doc.owner.uid;
	const uid = withoutTheApp.get(account)?.uid ?? config.players[account]?.uid;
	return uid && roster.has(uid) ? uid : doc.owner.uid;
}
/** The investigators of a campaign that `withoutTheApp` gives to someone, by code. */
const assignedIn = (record) =>
	new Map(
		(config.withoutTheApp ?? []).flatMap((p) =>
			(p.plays ?? [])
				.filter((play) => play.campaign === record.campaign.uuid)
				.flatMap((play) => play.investigators.map((code) => [code, `without-app:${p.name}`]))
		)
	);

// ─── Records ─────────────────────────────────────────────────────────────────

const ms = (iso) => (iso ? Date.parse(iso) : null);
const isEpilogue = (id) => /epilogue/.test(id);

/** Every scenario played to its end, an unread epilogue aside. */
function isFinished(replay) {
	return !replay.scenarios.some((s) => (s.type === 'playable' || s.type === 'started') && !isEpilogue(s.id));
}

const wanted = new Set(values.campaign ?? []);
const reports = [];
const replays = new Map();
/** A campaign's replay, computed once: The Dream-Eaters' halves read each other's. */
function replayOf(record) {
	if (!replays.has(record.campaign.id)) {
		replays.set(record.campaign.id, replayCampaign(record, records, guideData, investigators));
	}
	return replays.get(record.campaign.id);
}
const sideDb = life.getCampaignLog('side')?.db;
const sideCampaign = guideData.campaigns.find((c) => c.campaign.id === 'side');

for (const record of exported.campaigns) {
	const c = record.campaign;
	const codes = campaignCodes(c.cycleCode, life.getCampaignLog);
	if (!codes) continue;
	if (wanted.size && !wanted.has(codes.dataCode) && !wanted.has(codes.campaignCode) && !wanted.has(c.cycleCode)) continue;
	const notes = [];
	const report = (line) => notes.push(line);
	const replay = replayOf(record);
	if (replay.skipped || replay.error) {
		reports.push({
			name: c.name,
			code: codes.dataCode,
			notes: [{ kind: 'error', detail: replay.skipped ?? replay.error }]
		});
		continue;
	}
	const log = life.getCampaignLog(codes.dataCode);
	const guideCampaign = guideData.campaigns.find((g) => g.campaign.id === c.cycleCode);
	const logEntries = convertLogs({
		record,
		replay,
		records,
		log,
		dataCode: codes.dataCode,
		life,
		report,
		replayOf
	});
	const extraEntries = await convertExtras({
		record,
		replay,
		dataCode: codes.dataCode,
		db: log.db,
		sideDb,
		guideCampaign,
		sideCampaign,
		life,
		report
	});
	const logs = [...logEntries.logs, ...extraEntries];

	const existing = doc.campaigns.find((r) => r.id === c.uuid);
	if (existing) {
		existing.logs = logs;
		if (logEntries.linkedLog) existing.linkedLog = logEntries.linkedLog;
		else delete existing.linkedLog;
		existing.updatedAt = Date.now();
		reports.push({ name: c.name, code: codes.dataCode, notes, replaced: true });
		continue;
	}

	const people = convertPeople(record, replay, {
		ownerAccount,
		uidOfAccount,
		investigatorFromAhdbDeck: life.investigatorFromAhdbDeck,
		detachedPlayers,
		assigned: assignedIn(record)
	});
	const inputTimes = (record.dates?.inputs ?? []).map((i) => ms(i.created_at)).filter((t) => t);
	const startCandidates = [ms(record.dates?.campaignCreatedAt), ...inputTimes].filter((t) => t);
	const finished = isFinished(replay);
	const created = life.createCampaign(doc, {
		campaignCode: codes.campaignCode,
		title: c.name?.trim() || undefined,
		difficulty: c.difficulty ?? replay.log.campaignData?.difficulty ?? 'standard'
	});
	Object.assign(created, {
		id: c.uuid,
		title: c.name?.trim() || created.title,
		playerCount: people.playerCount,
		multiHanded: people.multiHanded || undefined,
		draft: !finished,
		startDate: startCandidates.length ? Math.min(...startCandidates) : null,
		finishDate: finished && inputTimes.length ? Math.max(...inputTimes) : null,
		createdAt: ms(record.dates?.campaignCreatedAt) ?? created.createdAt,
		updatedAt: ms(c.updated_at) ?? created.updatedAt,
		participants: [doc.owner.uid, ...people.accounts.map(uidOfAccount)]
			.filter((uid, i, all) => all.indexOf(uid) === i && roster.has(uid))
			.map((uid) => {
				const p = roster.get(uid);
				return { uid: p.uid, name: p.name, iconCardCode: p.iconCardCode };
			}),
		decks: people.decks,
		logs,
		manualAchievements: convertAchievements(record, log, report)
	});
	if (!created.multiHanded) delete created.multiHanded;
	if (logEntries.linkedLog) created.linkedLog = logEntries.linkedLog;
	reports.push({ name: c.name, code: codes.dataCode, notes, draft: !finished });
}

/** ArkhamCards achievement ticks (`id` or `id#item`) as life's manual ticks. */
function convertAchievements(record, log, report) {
	const ticks = [];
	for (const a of record.guide?.guide_achievements ?? []) {
		const on = a.type === 'binary' ? a.bool_value : (a.value ?? 0) > 0;
		if (!on) continue;
		const [achievementId, itemId = null] = a.id.split('#');
		const def = (log.db.achievements ?? []).find((d) => d.id === achievementId);
		if (!def) {
			report({ kind: 'achievement', key: a.id, detail: 'not in campaign-data' });
			continue;
		}
		ticks.push({ family: def.family ?? log.db.code, achievementId, itemId });
	}
	return ticks;
}

// ─── Write ───────────────────────────────────────────────────────────────────

const plain = life.toPlainDocument(doc);
life.rebakeManaged(plain);
const pad = (n) => String(n).padStart(2, '0');
const now = new Date();
const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
const outPath = join(outDir, `arkham-life-from-arkhamcards-${stamp}.ahlifedb`);
const reportPath = outPath.replace(/\.ahlifedb$/, '.report.json');
await writeFile(outPath, gzipSync(JSON.stringify(plain, null, 2)));
await writeFile(reportPath, JSON.stringify(reports, null, 2));

const count = (r, kind) => r.notes.filter((n) => n.kind === kind).length;
console.log('Campaigns:');
for (const r of reports) {
	const tag = r.notes.some((n) => n.kind === 'error')
		? `skipped: ${r.notes[0].detail}`
		: r.replaced
			? 'log replaced'
			: r.draft
				? 'draft'
				: 'ok';
	const extras = `${count(r, 'answered')}/${count(r, 'answered') + count(r, 'unanswered')} Extra choices`;
	const left = count(r, 'unknown') ? `, ${count(r, 'unknown')} entries not in campaign-data` : '';
	const text = count(r, 'freeform') ? `, ${count(r, 'freeform')} free-text notes` : '';
	console.log(`  ${r.code.padEnd(6)} ${r.name.trim()} (${tag}): ${extras}${left}${text}`);
}

/** Per campaign code: each Extra choice and in how many of its campaigns ArkhamCards answered it. */
const coverage = new Map();
for (const r of reports) {
	for (const n of r.notes) {
		if (n.kind !== 'answered' && n.kind !== 'unanswered') continue;
		const byKey = coverage.get(r.code) ?? new Map();
		const c = byKey.get(n.key) ?? { answered: 0, total: 0, control: n.detail };
		c.total++;
		if (n.kind === 'answered') c.answered++;
		byKey.set(n.key, c);
		coverage.set(r.code, byKey);
	}
}
console.log('\nExtra choices answered from ArkhamCards (none = ArkhamCards never asks it):');
for (const [code, byKey] of coverage) {
	console.log(`  ${code}`);
	for (const [key, c] of byKey) console.log(`    ${key} ${c.answered}/${c.total} (${c.control})`);
}

const others = reports.flatMap((r) =>
	r.notes
		.filter((n) => n.kind === 'resolution' || n.kind === 'name' || n.kind === 'achievement')
		.map((n) => `  ${r.code.padEnd(6)} ${r.name.trim()}: ${n.key} ${n.detail}`)
);
if (others.length) console.log(`\nTo look at:\n${others.join('\n')}`);
console.log(
	`\n${doc.campaigns.length} campaigns, ${doc.players.length} roster players, ${doc.playGroups.length} play groups.`
);
console.log(`Wrote ${outPath}\nReport ${reportPath}`);
