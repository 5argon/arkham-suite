#!/usr/bin/env node
// Proposes (and optionally injects) a curation `scenarios` override mapping each
// raw ArkhamCards entry-scenario tag (e.g. `02_one_last_job`, set by extract.mjs
// from the source filename) to the canonical kohaku `Scenario` enum value, so
// scenario-frequency / per-scenario features line up with the rest of the app.
//
// Auto-mapping: strip a leading `NN_` / `NNa_` index, collapse a trailing
// `_part_N`, and (for Return-to) try a `return_to_` prefix; accept the candidate
// when it is a real kohaku Scenario (preferring one this campaign's achievements
// already surface). Tags that don't resolve (interludes, epilogues, prologues,
// campaign-wide `campaign`, standalone-pack scenarios) are reported as UNMAPPED
// for hand-curation — they are intentionally left as-is by the override.
//
// Usage:
//   node scenario-sync.mjs <code> | --all          # print proposals
//   node scenario-sync.mjs --all --write           # inject curation `scenarios`

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Scenario } from '../../kohaku/dist/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.resolve(__dirname, '../data');
const CURATION = path.resolve(__dirname, '../curation');
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const exists = (p) => fs.existsSync(p);

const KOHAKU = new Set(Object.values(Scenario));

// Hand aliases for AC-internal short ids that don't transform mechanically.
// (Seeded with the classic core scenarios; extend per-campaign as needed.)
const ALIASES = {
  torch: 'the_gathering',
  arkham: 'the_midnight_masks',
  tentacles: 'the_devourer_below',
  // TFA / DWL real scenarios whose AC short id differs from the kohaku enum.
  wilds: 'the_untamed_wilds',
  eztli: 'the_doom_of_eztli',
  essex_county_express: 'the_essex_county_express',
};

const RT_TO_BASE = { rtnotz: 'notz', rtdwl: 'dwl', rtptc: 'ptc', rttfa: 'tfa', rttcu: 'tcu' };

function candidates(raw, isRT) {
  const out = [];
  const noIdx = raw.replace(/^\d+[a-z]?_/, '');
  const noPart = noIdx.replace(/_part_\d+$/, '');
  for (const c of [raw, noIdx, noPart]) {
    out.push(c);
    if (ALIASES[c]) out.push(ALIASES[c]);
    if (isRT) out.push(`return_to_${c}`, `return_to_${ALIASES[c] ?? c}`);
  }
  return out;
}

function propose(code) {
  const dbPath = path.join(DATA, `${code}-db.json`);
  if (!exists(dbPath)) return null;
  const db = readJson(dbPath);
  const achScenarios = new Set(db.achievements.map((a) => a.scenario).filter(Boolean));
  const isRT = code in RT_TO_BASE;
  const tags = [...new Set(db.entries.map((e) => e.scenario))].filter(Boolean);

  const map = {};
  const identity = [];
  const unmapped = [];
  for (const raw of tags) {
    if (raw.startsWith('$')) continue;
    if (KOHAKU.has(raw)) {
      identity.push(raw);
      continue;
    }
    // Prefer a candidate the campaign's achievements already surface, else any kohaku scenario.
    const cands = candidates(raw, isRT);
    const best = cands.find((c) => c !== raw && achScenarios.has(c)) ?? cands.find((c) => c !== raw && KOHAKU.has(c));
    if (best) map[raw] = best;
    else unmapped.push(raw);
  }
  return { code, map, identity, unmapped };
}

function injectCuration(code, map, force) {
  const p = path.join(CURATION, `${code}.json`);
  if (!exists(p)) {
    console.log(`  ${code}: no curation file — skipped`);
    return;
  }
  const cur = readJson(p);
  if (cur.scenarios && !force) {
    console.log(`  ${code}: scenarios already present — kept (use --force)`);
    return;
  }
  if (!Object.keys(map).length) {
    console.log(`  ${code}: nothing to map`);
    return;
  }
  const { code: c, ...rest } = cur;
  const next = { code: c, scenarios: map, ...rest };
  fs.writeFileSync(p, JSON.stringify(next, null, 2) + '\n');
  console.log(`  ${code}: wrote ${Object.keys(map).length} scenario mappings`);
}

const ALL = [
  'notz', 'dwl', 'ptc', 'tfa', 'tcu', 'tdea', 'tdeb', 'tic', 'eoe', 'tskc', 'fhv', 'tdc',
  'rtnotz', 'rtdwl', 'rtptc', 'rttfa', 'rttcu', 'boa', 'fof', 'gob', 'side',
];

const args = process.argv.slice(2);
const write = args.includes('--write');
const force = args.includes('--force');
const codes = args.includes('--all') ? ALL : args.filter((a) => !a.startsWith('--'));
if (!codes.length) {
  console.error('usage: node scenario-sync.mjs <code> | --all [--write] [--force]');
  process.exit(1);
}

for (const code of codes) {
  const r = propose(code);
  if (!r) {
    console.log(`${code.padEnd(7)} (no db)`);
    continue;
  }
  const mapped = Object.keys(r.map).length;
  console.log(
    `${code.padEnd(7)} mapped=${String(mapped).padStart(2)} identity=${String(r.identity.length).padStart(2)} unmapped=${String(r.unmapped.length).padStart(2)}`,
  );
  if (!write) {
    for (const [raw, k] of Object.entries(r.map)) console.log(`    ${raw}  ->  ${k}`);
    if (r.unmapped.length) console.log(`    UNMAPPED: ${r.unmapped.join(', ')}`);
  } else {
    injectCuration(code, r.map, force);
  }
}
