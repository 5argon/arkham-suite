#!/usr/bin/env node
// Merges extracted special-section state schema into the per-campaign curation
// files (section overrides: items with stats, statuses, trackBearer, max…).
//
//   node write-sections.mjs <workflow-output.json>
//
// Input: { results: [ { code, sections:[{id,type,items,statuses,trackBearer,perInvestigator,min,max,note}] } ] }

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CUR = path.resolve(__dirname, '../curation');
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

const inPath = process.argv[2];
if (!inPath) { console.error('usage: node write-sections.mjs <workflow-output.json>'); process.exit(1); }
const results = readJson(inPath).results || [];

const FIELDS = ['statuses', 'trackBearer', 'perInvestigator', 'min', 'max'];

let count = 0;
for (const r of results) {
  if (!r || !r.code) continue;
  const p = path.join(CUR, `${r.code}.json`);
  const cur = fs.existsSync(p) ? readJson(p) : { code: r.code };
  cur.sections ||= {};
  for (const s of r.sections || []) {
    const ov = (cur.sections[s.id] ||= {});
    if (s.type) ov.type = s.type;
    if (Array.isArray(s.items) && s.items.length) {
      // keep only meaningful item fields (id, code, label, stats, supply)
      ov.items = s.items.map((it) => {
        const o = { id: it.id };
        for (const k of ['code', 'label', 'health', 'sanity', 'resoluteHealth', 'resoluteSanity', 'cost', 'repeatable']) {
          if (it[k] !== undefined) o[k] = it[k];
        }
        return o;
      });
    }
    for (const f of FIELDS) if (s[f] !== undefined) ov[f] = s[f];
    if (s.note) ov._note = s.note;
    count++;
  }
  fs.writeFileSync(p, JSON.stringify(cur, null, 2) + '\n');
}
console.log(`merged ${count} special sections across ${results.length} campaigns`);
