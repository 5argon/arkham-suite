#!/usr/bin/env node
// Applies detected log validators: writes confident ones into curation, copies
// base-campaign validators into their Return-to counterparts (shared log), and
// emits a Markdown review (with entry texts) for the uncertain ones.
//
//   node write-validators.mjs <workflow-output.json>
//
// Input: { results: [ { code, validators:[{entries,scenario,confidence,reason}] } ] }

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.resolve(__dirname, '../data');
const CUR = path.resolve(__dirname, '../curation');
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const exists = (p) => fs.existsSync(p);

const BASE_TO_RT = { notz: 'rtnotz', dwl: 'rtdwl', ptc: 'rtptc', tfa: 'rttfa', tcu: 'rttcu' };

const inPath = process.argv[2];
if (!inPath) { console.error('usage: node write-validators.mjs <workflow-output.json>'); process.exit(1); }
const results = (readJson(inPath).results || []);

const enOf = (code) => (exists(path.join(DATA, `${code}-en.json`)) ? readJson(path.join(DATA, `${code}-en.json`)) : { entries: {} });
const txt = (en, key) => en.entries[key]?.text ?? `(unknown ${key})`;

function writeCurationValidators(code, validators) {
  const p = path.join(CUR, `${code}.json`);
  const cur = exists(p) ? readJson(p) : { code };
  if (validators.length) cur.validators = validators.map((v) => ({ type: 'mutuallyExclusive', entries: v.entries, scenario: v.scenario }));
  else delete cur.validators;
  fs.writeFileSync(p, JSON.stringify(cur, null, 2) + '\n');
}

const review = ['# Log validator review', '',
  'Mutually-exclusive log sets — at most one of each set should ever be recorded.',
  '**✅ Applied** are confident; **❓ Needs your call** are not auto-applied — confirm or reject after **✏️**.', ''];

let appliedCount = 0, unsureCount = 0;
for (const r of results) {
  if (!r || !r.code) continue;
  const en = enOf(r.code);
  const sure = (r.validators || []).filter((v) => v.confidence === 'sure' && (v.entries || []).length >= 2);
  const unsure = (r.validators || []).filter((v) => v.confidence !== 'sure' && (v.entries || []).length >= 2);
  writeCurationValidators(r.code, sure);
  appliedCount += sure.length;
  unsureCount += unsure.length;

  // propagate confident base validators to the Return-to campaign (shared log).
  const rt = BASE_TO_RT[r.code];
  if (rt) {
    const rtEn = enOf(rt);
    const carried = sure
      .map((v) => ({ ...v, entries: v.entries.filter((k) => k in rtEn.entries) }))
      .filter((v) => v.entries.length >= 2);
    writeCurationValidators(rt, carried);
  }

  review.push('---', '', `## ${r.code}`, '');
  for (const [label, list] of [['### ✅ Applied', sure], ['### ❓ Needs your call', unsure]]) {
    if (!list.length) continue;
    review.push(label, '');
    for (const v of list) {
      review.push(`- _${v.scenario || '?'}_ — ${v.reason || ''}`);
      for (const k of v.entries) review.push(`  - \`${k}\` — ${txt(en, k)}`);
      review.push('  - ✏️ ', '');
    }
  }
}

fs.writeFileSync(path.join(CUR, 'validators-review.md'), review.join('\n') + '\n');
console.log(`applied=${appliedCount} unsure=${unsureCount} (+ copied confident base validators to returns)`);
console.log('wrote _curation/validators-review.md');
