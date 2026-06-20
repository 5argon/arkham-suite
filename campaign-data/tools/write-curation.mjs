#!/usr/bin/env node
// Converts the curation-workflow output (arrays) into per-campaign
// `_curation/<code>.json` files in the shape apply.mjs consumes (object maps).
//
//   node write-curation.mjs <workflow-output.json>
//
// Input: { curations: [ { code, spoilers:[{key,spans}], sections:[{id,...}], drop?, notes? } ] }

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CURATION_DIR = path.resolve(__dirname, '../curation');

const inPath = process.argv[2];
if (!inPath) {
  console.error('usage: node write-curation.mjs <workflow-output.json>');
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(inPath, 'utf8'));
const curations = data.curations || data;

for (const c of curations) {
  if (!c || !c.code) continue;
  const out = { code: c.code };
  if (c.notes) out._notes = c.notes;
  if (Array.isArray(c.spoilers) && c.spoilers.length) {
    out.spoilers = {};
    for (const s of c.spoilers) {
      if (s && s.key && Array.isArray(s.spans) && s.spans.length) out.spoilers[s.key] = s.spans;
    }
  }
  if (Array.isArray(c.sections) && c.sections.length) {
    out.sections = {};
    for (const s of c.sections) {
      if (!s || !s.id) continue;
      const { id, ...rest } = s;
      out.sections[id] = rest;
    }
  }
  if (Array.isArray(c.drop) && c.drop.length) out.drop = c.drop;
  fs.writeFileSync(path.join(CURATION_DIR, `${c.code}.json`), JSON.stringify(out, null, 2) + '\n');
  console.log(`wrote _curation/${c.code}.json (spoilers=${Object.keys(out.spoilers || {}).length})`);
}
