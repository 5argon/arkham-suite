/**
 * Downloads the Grimoire, the rules reference of Chapter 2, as transcribed by arkham.build into
 * https://github.com/arkham-build/arkhamlcg-metadata, for guides to quote by the Grimoire's ids.
 *
 * Run: yarn download-grimoire
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const repo = 'arkham-build/arkhamlcg-metadata';
const headers = { 'User-Agent': 'arkham-starter-grimoire' };
const out = path.join(import.meta.dirname, '../src/lib/server/data/grimoire.json');

interface Entry {
	id: string;
	title: string;
	text?: string;
}

async function json<T>(url: string): Promise<T> {
	const response = await fetch(url, { headers });
	if (!response.ok) throw new Error(`${url}: ${response.status}`);
	return (await response.json()) as T;
}

const files = await json<{ name: string; download_url: string }[]>(
	`https://api.github.com/repos/${repo}/contents/grimoire`
);
const entries: Record<string, { title: string; text: string }> = {};
for (const file of [...files].sort((a, b) => a.name.localeCompare(b.name))) {
	if (!file.name.endsWith('.json') || file.name === 'sections.json') continue;
	for (const entry of await json<Entry[]>(file.download_url)) {
		entries[entry.id] = { title: entry.title, text: entry.text ?? '' };
	}
}
writeFileSync(out, JSON.stringify(entries, null, '\t') + '\n');
console.log(`${Object.keys(entries).length} entries written to ${out}`);
