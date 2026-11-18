#!/usr/bin/env node
/**
 * Opens a Database the way arkham.life does and builds every profile from it (the whole account,
 * each roster player, each play group), so a converted file that life would reject or choke on
 * fails here first.
 *
 * Usage: node check.mjs <file.ahlifedb | file.json>
 */
import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';

import { ACCOUNT_SUBJECT, buildSubjectPayload, parseDatabaseDocument } from './engine/dist/life-check.mjs';

const path = process.argv[2];
if (!path) throw new Error('Usage: node check.mjs <file.ahlifedb | file.json>');
const bytes = await readFile(path);
const text = bytes[0] === 0x1f && bytes[1] === 0x8b ? gunzipSync(bytes).toString('utf8') : bytes.toString('utf8');
const doc = parseDatabaseDocument(JSON.parse(text));
console.log(
	`Opened: ${doc.campaigns.length} campaigns, ${doc.standalones.length} standalones, ${doc.players.length} players, ${doc.playGroups.length} play groups.`
);

const subjects = [
	['account', ACCOUNT_SUBJECT],
	[doc.owner.name, doc.owner.uid],
	...doc.players.map((p) => [p.name, p.uid]),
	...doc.playGroups.map((g) => [`group ${g.name}`, g.uid])
];
let failed = 0;
for (const [label, key] of subjects) {
	try {
		const payload = buildSubjectPayload(doc, key);
		const plays = payload.meta?.campaigns?.length ?? payload.campaigns?.length ?? '?';
		console.log(`  profile ok: ${label} (${plays} campaigns)`);
	} catch (error) {
		failed++;
		console.log(`  profile FAILED: ${label}: ${error.stack?.split('\n').slice(0, 4).join(' | ')}`);
	}
}
process.exit(failed ? 1 : 0);
