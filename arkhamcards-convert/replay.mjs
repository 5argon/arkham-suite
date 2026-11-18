#!/usr/bin/env node
/**
 * Replays exported ArkhamCards campaigns through the app's guide engine and writes each computed
 * campaign log to `out/replay/<cycle>-<server id>.json`.
 *
 * Usage:
 *   node replay.mjs --export <arkhamcards-cloud-*.json> [--campaign <cycle code | server id>]
 *     [--arkhamcards <clone>] [--out <dir>]
 *
 * Without `--export`, the newest file in ~/Documents/arkhamcards-exports is used.
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { loadGuideData, loadInvestigators, replayCampaign } from './lib/replay.mjs';

const here = dirname(fileURLToPath(import.meta.url));

async function newestExport() {
	const dir = join(homedir(), 'Documents', 'arkhamcards-exports');
	const names = (await readdir(dir)).filter((n) => /^arkhamcards-cloud-.*\.json$/.test(n)).sort();
	if (!names.length) throw new Error(`No arkhamcards-cloud-*.json in ${dir}; pass --export.`);
	return join(dir, names.at(-1));
}

const { values } = parseArgs({
	options: {
		export: { type: 'string' },
		campaign: { type: 'string' },
		arkhamcards: { type: 'string', default: join(homedir(), 'Documents', 'ArkhamCards') },
		out: { type: 'string', default: join(here, 'out', 'replay') }
	}
});

const base = process.env.INIT_CWD ?? process.cwd();
const exportPath = values.export ? resolve(base, values.export) : await newestExport();
const clone = resolve(base, values.arkhamcards);
const exported = JSON.parse(await readFile(exportPath, 'utf8'));
const records = new Map(exported.campaigns.map((r) => [r.campaign.id, r]));
const data = loadGuideData(clone);
const investigators = loadInvestigators(clone);

const wanted = exported.campaigns.filter(
	(r) =>
		!values.campaign ||
		r.campaign.cycleCode === values.campaign ||
		String(r.campaign.id) === values.campaign
);
if (!wanted.length) throw new Error(`No exported campaign matches ${values.campaign}.`);

const outDir = resolve(base, values.out);
await mkdir(outDir, { recursive: true });
let ok = 0;
for (const record of wanted) {
	const c = record.campaign;
	const label = `${c.cycleCode} #${c.id} ${c.name}`;
	let result;
	try {
		result = replayCampaign(record, records, data, investigators);
	} catch (error) {
		result = { error: error.stack ?? String(error) };
	}
	if (result.skipped) {
		console.log(`  skipped  ${label}: ${result.skipped}`);
		continue;
	}
	if (result.error) {
		console.log(`  FAILED   ${label}: ${result.error.split('\n').slice(0, 3).join(' | ')}`);
		continue;
	}
	ok++;
	const done = result.scenarios.filter((s) => s.type === 'completed').length;
	const entries = Object.values(result.log.sections).reduce((n, s) => n + (s?.entries?.length ?? 0), 0);
	console.log(`  ok       ${label}: ${done}/${result.scenarios.length} scenarios completed, ${entries} log entries`);
	await writeFile(
		join(outDir, `${c.cycleCode}-${c.id}.json`),
		JSON.stringify({ campaign: { id: c.id, uuid: c.uuid, name: c.name, cycleCode: c.cycleCode }, ...result }, null, 2)
	);
}
console.log(`\nReplayed ${ok} of ${wanted.length}. Logs in ${outDir}`);
