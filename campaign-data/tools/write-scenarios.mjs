#!/usr/bin/env node
// Merges achievement→scenario ties into the per-campaign curation files
// (adds `achievements.<id>.scenario`). Preserves existing curation content.
//
//   node write-scenarios.mjs <workflow-output.json>
//
// Input: { ties: [ { code, ties:[{id,scenario,reason}] } ] }

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CURATION_DIR = path.resolve(__dirname, '../curation');

const inPath = process.argv[2];
if (!inPath) {
  console.error('usage: node write-scenarios.mjs <workflow-output.json>');
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(inPath, 'utf8'));
const campaigns = data.ties || data;

let tied = 0;
let wide = 0;
for (const c of campaigns) {
  if (!c || !c.code) continue;
  const curPath = path.join(CURATION_DIR, `${c.code}.json`);
  const cur = fs.existsSync(curPath) ? JSON.parse(fs.readFileSync(curPath, 'utf8')) : { code: c.code };
  cur.achievements ||= {};
  for (const t of c.ties || []) {
    if (t.scenario) {
      cur.achievements[t.id] = { ...(cur.achievements[t.id] || {}), scenario: t.scenario };
      tied++;
    } else {
      wide++;
    }
  }
  if (!Object.keys(cur.achievements).length) delete cur.achievements;
  fs.writeFileSync(curPath, JSON.stringify(cur, null, 2) + '\n');
}
console.log(`tied=${tied} campaignWide=${wide}`);
