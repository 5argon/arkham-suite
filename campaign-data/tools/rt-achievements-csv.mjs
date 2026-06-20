#!/usr/bin/env node
// Emits a CSV of every Return-to achievement for human review of which are
// also earnable in the base campaign (the "shared" flag).
//   node rt-achievements-csv.mjs > ../_curation/rt-achievements-review.csv

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.resolve(__dirname, '../data');
const RT = ['rtnotz', 'rtdwl', 'rtptc', 'rttfa', 'rttcu'];

// base campaign code by family (originalId 'core' -> our base code 'notz')
const BASE_CODE = { core: 'notz', dwl: 'dwl', ptc: 'ptc', tfa: 'tfa', tcu: 'tcu' };

const clean = (s) =>
  (s || '')
    .replace(/<\/?[ib]>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
const q = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;

const rows = [['base', 'rt', 'id', 'type', 'title', 'text', 'list_items', 'suggest_shared', 'earnable_in_base']];

for (const code of RT) {
  const db = JSON.parse(fs.readFileSync(path.join(DATA, `${code}-db.json`), 'utf8'));
  const en = JSON.parse(fs.readFileSync(path.join(DATA, `${code}-en.json`), 'utf8'));
  const base = BASE_CODE[db.originalId] ?? db.originalId;
  for (const a of db.achievements) {
    const t = en.achievements[a.id] || {};
    const items = t.items ? Object.values(t.items).map(clean).join(' | ') : '';
    // Returns add no new scenarios, so default suggestion is "Y" (shared).
    rows.push([base, code, a.id, a.type, clean(t.title), clean(t.text), items, 'Y', '']);
  }
}

process.stdout.write(rows.map((r) => r.map(q).join(',')).join('\n') + '\n');
