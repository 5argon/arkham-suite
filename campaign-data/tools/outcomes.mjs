#!/usr/bin/env node
// Proposes (and optionally injects) win/loss `outcome` tags for campaign-log
// entries by traversing the ArkhamCards resolution -> step graph.
//
// For each scenario file, each resolution in `resolutions[]` reaches a set of
// steps (directly, through `type:resolution` steps, and through `input.choices[].steps`).
// If the reached steps fire a `{type:campaign_data, setting:result, value:win|lose}`
// effect, every `campaign_log*` entry recorded along that path is a clear-signal
// for that outcome. A key reached by BOTH a win and a lose resolution is
// ambiguous and dropped. Keys are filtered to entries that survive into the
// final `<code>-en.json` (so dropped/hidden bookkeeping never tags).
//
// Usage:
//   node outcomes.mjs <code>         # print proposal for one campaign
//   node outcomes.mjs --all          # print proposals for every campaign
//   node outcomes.mjs --all --write  # inject into curation/<code>.json "outcomes"
//                                     # (only when absent; --force overwrites)
//
// The curation `outcomes` block stays the source of truth (hand-verifiable);
// this tool seeds it and, re-run, doubles as a drift check.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.resolve(__dirname, '../data');
const CURATION = path.resolve(__dirname, '../curation');
const REF = path.resolve(__dirname, '../references/arkham-cards-data-master');
const CAMP = path.join(REF, 'campaigns');
const RETCAMP = path.join(REF, 'return_campaigns');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const exists = (p) => fs.existsSync(p);

const LOG_TYPES = new Set([
  'campaign_log',
  'campaign_log_count',
  'campaign_log_cards',
  'campaign_log_investigator_count',
  'campaign_log_text',
  'campaign_log_task',
  'campaign_log_assign_task',
  'campaign_log_cards_switch',
  'freeform_campaign_log',
]);

// ---- reference dir resolution (mirrors extract.mjs) ----
function buildIdIndex() {
  const index = new Map();
  for (const base of [CAMP, RETCAMP]) {
    if (!exists(base)) continue;
    for (const name of fs.readdirSync(base)) {
      const dir = path.join(base, name);
      const cj = path.join(dir, 'campaign.json');
      if (!fs.statSync(dir).isDirectory() || !exists(cj)) continue;
      const id = readJson(cj).id ?? name;
      if (!index.has(id)) index.set(id, dir);
      if (!index.has(name)) index.set(name, dir);
    }
  }
  return index;
}
const ID_INDEX = buildIdIndex();

function sourceDirs(code) {
  const dir = ID_INDEX.get(code);
  if (!dir) return [];
  const dirs = [dir];
  const camp = readJson(path.join(dir, 'campaign.json'));
  const baseDir = camp.original_id && ID_INDEX.get(camp.original_id);
  if (baseDir) dirs.push(baseDir);
  return dirs;
}

// ---- collect effects directly attached to a step (incl. counter-input confirm) ----
function ownEffects(step) {
  const out = [];
  if (Array.isArray(step.effects)) out.push(...step.effects);
  if (step.input && Array.isArray(step.input.effects)) out.push(...step.input.effects);
  return out;
}

function scanEffect(e, results, logKeys) {
  if (!e || typeof e !== 'object') return;
  if (e.type === 'campaign_data' && e.setting === 'result' && (e.value === 'win' || e.value === 'lose')) {
    results.add(e.value);
  } else if (LOG_TYPES.has(e.type) && e.section && e.id != null && !String(e.id).startsWith('$')) {
    logKeys.add(`${e.section}.${e.id}`);
  }
}

// Reach the result(s) + campaign_log keys from a set of entry step ids.
function reach(stepIds, steps, resById) {
  const results = new Set();
  const logKeys = new Set();
  const seen = new Set();
  const stack = [...(stepIds || [])];
  while (stack.length) {
    const id = stack.pop();
    if (id == null || seen.has(id)) continue;
    seen.add(id);
    const step = steps.get(id);
    if (!step) continue;
    for (const e of ownEffects(step)) scanEffect(e, results, logKeys);
    if (step.input && Array.isArray(step.input.choices)) {
      for (const c of step.input.choices) {
        if (Array.isArray(c.effects)) for (const e of c.effects) scanEffect(e, results, logKeys);
        if (Array.isArray(c.steps)) for (const sid of c.steps) stack.push(sid);
      }
    }
    if (step.type === 'resolution' && step.resolution && resById.has(step.resolution)) {
      for (const sid of resById.get(step.resolution).steps || []) stack.push(sid);
    }
  }
  return { results, logKeys };
}

function traverseScenario(scn, win, loss) {
  const steps = new Map();
  for (const s of scn.steps || []) if (s && s.id) steps.set(s.id, s);
  const resById = new Map();
  for (const r of scn.resolutions || []) if (r && r.id) resById.set(r.id, r);
  for (const r of scn.resolutions || []) {
    const { results, logKeys } = reach(r.steps, steps, resById);
    const isWin = results.has('win');
    const isLose = results.has('lose');
    if (isWin && !isLose) for (const k of logKeys) win.add(k);
    else if (isLose && !isWin) for (const k of logKeys) loss.add(k);
  }
}

// Print, per scenario file, each resolution's result + the campaign_log keys it
// records — the ground truth for hand-authoring the hard (two-axis / inverted)
// campaigns.
function debug(code) {
  const dirs = sourceDirs(code);
  const enPath = path.join(DATA, `${code}-en.json`);
  const enKeys = exists(enPath) ? new Set(Object.keys(readJson(enPath).entries || {})) : null;
  for (const d of dirs) {
    for (const f of fs.readdirSync(d)) {
      if (!f.endsWith('.json') || f === 'campaign.json') continue;
      let scn;
      try {
        scn = readJson(path.join(d, f));
      } catch {
        continue;
      }
      const steps = new Map();
      for (const s of scn.steps || []) if (s && s.id) steps.set(s.id, s);
      const resById = new Map();
      for (const r of scn.resolutions || []) if (r && r.id) resById.set(r.id, r);
      const lines = [];
      for (const r of scn.resolutions || []) {
        const { results, logKeys } = reach(r.steps, steps, resById);
        if (!results.size && !logKeys.size) continue;
        const keys = [...logKeys].filter((k) => !enKeys || enKeys.has(k));
        if (!results.size && !keys.length) continue;
        lines.push(`    ${r.id} [${[...results].join('/') || '—'}]: ${keys.join(', ') || '(no surviving log entry)'}`);
      }
      if (lines.length) console.log(`  ${f}\n${lines.join('\n')}`);
    }
  }
}

function propose(code) {
  const dirs = sourceDirs(code);
  if (!dirs.length) return null;
  const win = new Set();
  const loss = new Set();
  for (const d of dirs) {
    for (const f of fs.readdirSync(d)) {
      if (!f.endsWith('.json') || f === 'campaign.json') continue;
      let scn;
      try {
        scn = readJson(path.join(d, f));
      } catch {
        continue;
      }
      traverseScenario(scn, win, loss);
    }
  }
  // Ambiguous keys (reached by both a win and a lose resolution) are dropped.
  const ambiguous = [...win].filter((k) => loss.has(k));
  for (const k of ambiguous) {
    win.delete(k);
    loss.delete(k);
  }
  // Keep only keys that survive into the final -en.json entries.
  const enPath = path.join(DATA, `${code}-en.json`);
  const enKeys = exists(enPath) ? new Set(Object.keys(readJson(enPath).entries || {})) : null;
  const filter = (set) =>
    [...set].filter((k) => !enKeys || enKeys.has(k)).sort();
  const missing = enKeys
    ? [...win, ...loss].filter((k) => !enKeys.has(k))
    : [];
  return { win: filter(win), loss: filter(loss), ambiguous: ambiguous.sort(), missing: missing.sort() };
}

function injectCuration(code, proposal, force) {
  const p = path.join(CURATION, `${code}.json`);
  if (!exists(p)) {
    console.log(`  ${code}: no curation file — skipped`);
    return;
  }
  const cur = readJson(p);
  if (cur.outcomes && !force) {
    console.log(`  ${code}: outcomes already present — kept (use --force to overwrite)`);
    return;
  }
  // Insert `outcomes` right after `code` to keep a stable shape.
  const { code: c, ...rest } = cur;
  const next = {
    code: c,
    outcomes: {
      _notes: 'Auto-proposed by tools/outcomes.mjs from the ArkhamCards resolution->step graph; verify before trusting.',
      win: proposal.win,
      loss: proposal.loss,
    },
    ...rest,
  };
  fs.writeFileSync(p, JSON.stringify(next, null, 2) + '\n');
  console.log(`  ${code}: wrote outcomes win=${proposal.win.length} loss=${proposal.loss.length}`);
}

const ALL = [
  'notz', 'dwl', 'ptc', 'tfa', 'tcu', 'tdea', 'tdeb', 'tic', 'eoe', 'tskc', 'fhv', 'tdc',
  'rtnotz', 'rtdwl', 'rtptc', 'rttfa', 'rttcu', 'boa', 'fof', 'gob', 'side',
];

const args = process.argv.slice(2);
const write = args.includes('--write');
const force = args.includes('--force');
const dbg = args.includes('--debug');
const codes = args.includes('--all') ? ALL : args.filter((a) => !a.startsWith('--'));
if (!codes.length) {
  console.error('usage: node outcomes.mjs <code> | --all [--write] [--force] [--debug]');
  process.exit(1);
}

if (dbg) {
  for (const code of codes) {
    console.log(`== ${code} ==`);
    debug(code);
  }
  process.exit(0);
}

for (const code of codes) {
  const proposal = propose(code);
  if (!proposal) {
    console.log(`${code.padEnd(8)} (no reference dir)`);
    continue;
  }
  console.log(
    `${code.padEnd(8)} win=${String(proposal.win.length).padStart(2)} loss=${String(
      proposal.loss.length
    ).padStart(2)}${proposal.ambiguous.length ? ` ambiguous=${proposal.ambiguous.length}` : ''}${
      proposal.missing.length ? ` (dropped ${proposal.missing.length} non-entry)` : ''
    }`
  );
  if (!write) {
    if (proposal.win.length) console.log('  win :', proposal.win.join(', '));
    if (proposal.loss.length) console.log('  loss:', proposal.loss.join(', '));
    if (proposal.ambiguous.length) console.log('  amb :', proposal.ambiguous.join(', '));
  } else {
    injectCuration(code, proposal, force);
  }
}
