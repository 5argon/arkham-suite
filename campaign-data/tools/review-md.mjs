#!/usr/bin/env node
// Generates the human-friendly Markdown inference review from the persisted
// classifications + the final -en/-db files. One achievement per section,
// grouped by campaign then status, with an ✏️ line to type corrections.
//
//   node review-md.mjs  ->  ../_curation/inference-review.md

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.resolve(__dirname, '../data');
const CUR = path.resolve(__dirname, '../curation');
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

const NAME = {
  tdea: 'The Dream-Quest', tdeb: 'The Web of Dreams', tic: 'The Innsmouth Conspiracy',
  eoe: 'Edge of the Earth', tskc: 'The Scarlet Keys', tdc: 'The Drowned City',
  fhv: 'The Feast of Hemlock Vale', rtnotz: 'Return to The Night of the Zealot',
  rtdwl: 'Return to The Dunwich Legacy', rtptc: 'Return to The Path to Carcosa',
  rttfa: 'Return to The Forgotten Age', rttcu: 'Return to The Circle Undone',
};
const ORDER = ['tdea', 'tdeb', 'tic', 'eoe', 'tskc', 'tdc', 'fhv', 'rtnotz', 'rtdwl', 'rtptc', 'rttfa', 'rttcu'];

function fmt(inf) {
  if (!inf) return '';
  switch (inf.type) {
    case 'difficulty': return 'difficulty = expert';
    case 'ultimatums': return `ultimatums ≥ ${inf.min}`;
    case 'logCount': {
      const { min, max, key } = inf;
      const r = min != null && max == null ? `≥ ${min}` : max != null && min == null ? `≤ ${max}` : `${min}..${max}`;
      return `count[${key}] ${r}`;
    }
    case 'log': return `recorded: ${inf.key}`;
    case 'logAbsent': return `NOT recorded: ${inf.key}`;
    case 'sectionHas': return `recorded in section[${inf.section}]: ${inf.item}`;
    case 'sectionCount': {
      const { min, max, section } = inf;
      const r = min != null && max == null ? `≥ ${min}` : max != null && min == null ? `≤ ${max}` : `${min}..${max}`;
      return `section[${section}] count ${r}`;
    }
    case 'allOf': return 'ALL of — ' + inf.of.map(fmt).join('; ');
    case 'anyOf': return 'ANY of — ' + inf.of.map(fmt).join('; ');
    default: return inf.type;
  }
}
function fmtItemInfer(itemInfer) {
  const rules = Object.values(itemInfer);
  return `per item (${rules.length}) — ${fmt(rules[0])}${rules.length > 1 ? ', …' : ''}`;
}
const clean = (s) => (s || '').replace(/\n/g, ' ').replace(/<\/?[ib]>/g, '').trim();

const cls = Object.fromEntries(
  readJson(path.join(CUR, '_inference-classifications.json')).classifications.map((c) => [c.code, c.achievements])
);

const out = [
  '# Achievement inference review',
  '',
  'Per achievement: if a call is wrong, write your fix after **✏️** (leave blank if fine).',
  'Legend — 🔮 inferred (auto from the log) · ✍️ manual (tick by hand) · ❓ needs your input.',
  '',
];

for (const code of ORDER) {
  const en = readJson(path.join(DATA, `${code}-en.json`));
  const db = readJson(path.join(DATA, `${code}-db.json`));
  const defOf = Object.fromEntries(db.achievements.map((a) => [a.id, a]));
  const scenarioOf = Object.fromEntries(db.achievements.map((a) => [a.id, a.scenario]));
  const groups = { unsure: [], infer: [], manual: [] };
  for (const a of cls[code] || []) {
    // status reflects the CURRENT data: an added infer/itemInfer overrides an
    // earlier manual/unsure classification.
    const def = defOf[a.id];
    const status = def && (def.infer || def.itemInfer) ? 'infer' : a.status;
    (groups[status] || groups.manual).push(a);
  }

  out.push('---', '', `## ${NAME[code]} (\`${code}\`)`, '');
  const sections = [
    ['unsure', '### ❓ Needs your input'],
    ['infer', '### 🔮 Inferred — check the rule'],
    ['manual', '### ✍️ Manual — no log trace (skim)'],
  ];
  for (const [st, header] of sections) {
    if (!groups[st].length) continue;
    out.push(header, '');
    for (const a of groups[st]) {
      const e = en.achievements[a.id] || {};
      const scen = scenarioOf[a.id];
      const def = defOf[a.id];
      out.push(`#### \`${a.id}\` — ${clean(e.title || a.id)}`, `> ${clean(e.text)}`);
      if (st === 'infer') out.push(`- Rule: ${def?.itemInfer ? fmtItemInfer(def.itemInfer) : fmt(def?.infer || a.infer)}`);
      if (st === 'unsure') out.push(`- Question: ${clean(a.question || a.reason)}`);
      if (st === 'manual') out.push(`- Why manual: ${clean(a.reason)}`);
      out.push(`- Scenario: ${scen || '— (campaign-wide)'}`, '- ✏️ ', '');
    }
  }
}

fs.writeFileSync(path.join(CUR, 'inference-review.md'), out.join('\n') + '\n');
const total = ORDER.reduce((n, c) => n + (cls[c]?.length || 0), 0);
console.log(`wrote _curation/inference-review.md (${total} achievements)`);
