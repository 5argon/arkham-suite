#!/usr/bin/env node
// Reads the human-reviewed rt-achievements-review.csv and sets/clears the
// `shared` flag on each Return-to achievement in its curation file.
//
//   node apply-shared.mjs            # uses _curation/rt-achievements-review.csv
//
// Decision column: `suggest_shared` (Y = shared/earnable in base, anything else = no).
// After running, re-run apply.mjs + validate.mjs.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CURATION_DIR = path.resolve(__dirname, '../curation');
const CSV = path.join(CURATION_DIR, 'rt-achievements-review.csv');

// Minimal RFC-4180 CSV parser (quotes, embedded commas/quotes/newlines).
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c === '\r') { /* skip */ }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const rows = parseCsv(fs.readFileSync(CSV, 'utf8'));
const header = rows[0];
const col = (name) => header.indexOf(name);
const iRt = col('rt');
const iId = col('id');
const iDecision = col('suggest_shared'); // the reviewed column
const iBase = col('earnable_in_base'); // fallback if the reviewer used this column

const byRt = {};
let shared = 0;
let notShared = 0;
for (const r of rows.slice(1)) {
  if (!r[iId]) continue;
  const rt = r[iRt];
  const id = r[iId];
  // prefer an explicit earnable_in_base answer; else the (edited) suggest column
  const ans = (r[iBase]?.trim() || r[iDecision]?.trim() || '').toUpperCase();
  (byRt[rt] ||= []).push({ id, shared: ans === 'Y' });
  if (ans === 'Y') shared++; else notShared++;
}

for (const [rt, list] of Object.entries(byRt)) {
  const p = path.join(CURATION_DIR, `${rt}.json`);
  const cur = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : { code: rt };
  cur.achievements ||= {};
  for (const { id, shared } of list) {
    const a = (cur.achievements[id] ||= {});
    if (shared) a.shared = true;
    else delete a.shared;
    if (!Object.keys(a).length) delete cur.achievements[id];
  }
  if (!Object.keys(cur.achievements).length) delete cur.achievements;
  fs.writeFileSync(p, JSON.stringify(cur, null, 2) + '\n');
  console.log(`${rt}: ${list.filter((x) => x.shared).length}/${list.length} shared`);
}
console.log(`\ntotal shared=${shared} not-shared=${notShared}`);
