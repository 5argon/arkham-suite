/**
 * The converter's people settings, kept next to the export (not in the repository): each
 * ArkhamCards account's life uid and name, the owner, and the play groups to create. Written on the
 * first run so later runs give everyone the same uid.
 *
 * {
 *   "owner": { "account": "<ArkhamCards user id>", "uid": "XXX-XXX-XXX", "name": "…" },
 *   "players": { "<ArkhamCards user id>": { "uid": "XXX-XXX-XXX", "name": "<handle>" } },
 *   "playGroups": [{ "name": "…", "members": ["<handle>", …] }],
 *   "withoutTheApp": [{
 *     "name": "…", "uid": "XXX-XXX-XXX",
 *     "plays": [{ "campaign": "<ArkhamCards campaign uuid>", "title": "…", "investigators": ["<code>", …] }]
 *   }]
 * }
 *
 * `withoutTheApp` is for people who never used ArkhamCards: someone else attached their decks, so
 * nothing in the export says which investigators were theirs. Each play names them; `title` is only
 * for reading.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

export function readPeopleConfig(path) {
	return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
}

export function writePeopleConfig(path, config) {
	writeFileSync(path, JSON.stringify(config, null, 2) + '\n');
}
