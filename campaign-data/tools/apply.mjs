#!/usr/bin/env node
// Merges a per-campaign curation file into the deterministic draft to produce
// the final `<code>-db.json` + `<code>-en.json`.
//
//   draft (complete, no spoilers)  +  _curation/<code>.json  ->  final files
//
// Curation file shape (all keys optional except code):
//   {
//     "code": "dwl",
//     "spoilers": { "<section>.<id>": ["span", ...], ... },
//     "sections": {            // structure/override exotic sections
//       "<sectionId>": {
//         "type": "partner",
//         "freeform": true,
//         "items": [ { "id": "...", "code": "...", "label": "Display Name" } ]
//       }
//     },
//     "drop": ["<section>.<id>", ...]   // entries to remove (bookkeeping noise)
//   }
//
// Re-runnable: re-extract + re-apply rebuilds finals without losing curation.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../data');
const CURATION_DIR = path.resolve(__dirname, '../curation');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const exists = (p) => fs.existsSync(p);

// Return-to campaign -> base campaign code (the family). Used to aggregate
// earned-state and to inject `shared` achievements into the base campaign.
const RT_TO_BASE = { rtnotz: 'notz', rtdwl: 'dwl', rtptc: 'ptc', rttfa: 'tfa', rttcu: 'tcu' };
const familyOf = (code) => RT_TO_BASE[code] || code;

// A `scenario` tag in the curation is the *base* scenario slot (e.g. `the_gathering`),
// which is right when a shared achievement is injected into the base campaign. But a
// Return-to campaign surfaces the `return_to_*` kohaku code, so the per-scenario UI
// filter only matches if we translate the tag when emitting the RT campaign's own data.
// The kohaku enum value is uniformly `return_to_<base>` for every code in use; version
// variants (e.g. in_the_clutches_of_chaos -> _1/_2) are reconciled separately.
const toReturnScenario = (sc) => (sc ? `return_to_${sc}` : sc);

// Build the map baseCode -> [shared achievements inherited from its RT family].
// Reads each RT campaign's draft (achievement defs + en text) and curation
// (the `shared`/`infer` overrides). Empty until the review sets `shared` flags.
function buildSharedInjections() {
  const out = {};
  for (const [rt, base] of Object.entries(RT_TO_BASE)) {
    const dbPath = path.join(DATA_DIR, `${rt}-db.draft.json`);
    const enPath = path.join(DATA_DIR, `${rt}-en.draft.json`);
    const curPath = path.join(CURATION_DIR, `${rt}.json`);
    if (!exists(dbPath) || !exists(curPath)) continue;
    const db = readJson(dbPath);
    const en = exists(enPath) ? readJson(enPath) : { achievements: {} };
    const ach = (readJson(curPath).achievements) || {};
    for (const a of db.achievements || []) {
      const ov = ach[a.id];
      if (!ov || !ov.shared) continue;
      (out[base] ||= []).push({
        from: rt,
        def: { id: a.id, type: a.type, items: a.items, max: a.max, infer: ov.infer, itemInfer: ov.itemInfer, requires: ov.requires, scenario: ov.scenario },
        en: en.achievements?.[a.id] ?? { title: a.id, text: '' },
      });
    }
  }
  return out;
}
let SHARED_INJECTIONS = null;

// Whether every log reference in an inference rule resolves in this campaign.
function inferResolves(infer, en, db) {
  if (!infer || typeof infer !== 'object') return true;
  switch (infer.type) {
    case 'log':
    case 'logAbsent':
      return infer.key in en.entries;
    case 'logCount':
      return db.sections.some((s) => s.id === infer.key) || infer.key in en.entries;
    case 'sectionHas':
    case 'sectionCount':
    case 'partnerStatus':
      return db.sections.some((s) => s.id === infer.section);
    case 'allOf':
    case 'anyOf':
      return (infer.of || []).every((s) => inferResolves(s, en, db));
    default:
      return true;
  }
}

// Validate that an inference rule's log references resolve to real entries /
// sections in this campaign. Difficulty/ultimatums need no data reference.
function checkInfer(infer, en, db, code, warnings, aid) {
  if (!infer || typeof infer !== 'object') return;
  switch (infer.type) {
    case 'log':
    case 'logAbsent':
      if (!en.entries[infer.key]) warnings.push(`${code}: infer ${aid} -> unknown log key "${infer.key}"`);
      break;
    case 'logCount': {
      const isSection = db.sections.some((s) => s.id === infer.key);
      if (!isSection && !en.entries[infer.key])
        warnings.push(`${code}: infer ${aid} -> unknown count key "${infer.key}"`);
      break;
    }
    case 'sectionHas':
    case 'sectionCount':
    case 'partnerStatus':
      if (!db.sections.some((s) => s.id === infer.section))
        warnings.push(`${code}: infer ${aid} -> unknown section "${infer.section}"`);
      break;
    case 'allOf':
    case 'anyOf':
      for (const sub of infer.of || []) checkInfer(sub, en, db, code, warnings, aid);
      break;
    case 'difficulty':
    case 'ultimatums':
    case 'chaosToken':
      break;
    default:
      warnings.push(`${code}: infer ${aid} -> unknown inference type "${infer.type}"`);
  }
}

// Strip helper fields (underscore-prefixed) recursively.
function clean(obj) {
  if (Array.isArray(obj)) return obj.map(clean);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith('_')) continue;
      if (v === undefined) continue;
      out[k] = clean(v);
    }
    return out;
  }
  return obj;
}

function apply(code) {
  const dbDraft = readJson(path.join(DATA_DIR, `${code}-db.draft.json`));
  const enDraft = readJson(path.join(DATA_DIR, `${code}-en.draft.json`));
  const curPath = path.join(CURATION_DIR, `${code}.json`);
  const cur = exists(curPath) ? readJson(curPath) : {};

  const warnings = [];

  // ---- sections: apply structure/overrides ----
  const sectionOverrides = cur.sections || {};
  const enItems = { ...(enDraft.items || {}) };
  const db = clean(dbDraft);
  db.sections = db.sections.map((s) => {
    const ov = sectionOverrides[s.id];
    if (!ov) return s;
    const merged = { ...s };
    if (ov.type) merged.type = ov.type;
    if (ov.freeform !== undefined) merged.freeform = ov.freeform;
    if (ov.hidden !== undefined) merged.hidden = ov.hidden || undefined;
    // special-section state schema
    for (const f of ['statuses', 'trackBearer', 'perInvestigator', 'min', 'max']) {
      if (ov[f] !== undefined) merged[f] = ov[f];
    }
    if (ov.items) {
      merged.items = ov.items.map((it) => {
        const { label, ...rest } = it; // label -> -en; structured stats stay in -db
        if (label) enItems[it.id] = label;
        return rest;
      });
    }
    return merged;
  });

  // ---- drop bookkeeping entries ----
  const dropSet = new Set(cur.drop || []);
  const keyOf = (e) => `${e.section}.${e.id}`;
  if (dropSet.size) {
    db.entries = db.entries.filter((e) => !dropSet.has(keyOf(e)));
  }

  // ---- en: spoilers ----
  const en = clean(enDraft);
  const spoilers = cur.spoilers || {};
  for (const [key, entry] of Object.entries(en.entries)) {
    const spans = spoilers[key];
    if (spans && spans.length) {
      const valid = [];
      for (const span of spans) {
        if (entry.text.includes(span)) valid.push(span);
        else warnings.push(`${code}: spoiler "${span}" not a substring of "${key}" text`);
      }
      if (valid.length) entry.spoiler = valid;
      else delete entry.spoiler;
    } else {
      delete entry.spoiler; // no spoiler -> omit field
    }
  }
  // flag spoiler keys that don't match any entry
  for (const key of Object.keys(spoilers)) {
    if (!en.entries[key]) warnings.push(`${code}: spoiler key "${key}" matches no entry`);
  }
  // drop dropped entries from en too
  if (dropSet.size) {
    for (const k of Object.keys(en.entries)) if (dropSet.has(k)) delete en.entries[k];
  }
  if (Object.keys(enItems).length) en.items = enItems;

  // ---- validators (story-branch consistency rules) ----
  if (Array.isArray(cur.validators) && cur.validators.length) {
    const enKeys = new Set(Object.keys(en.entries));
    db.validators = cur.validators.map((v) => {
      for (const key of v.entries || []) {
        if (!enKeys.has(key)) warnings.push(`${code}: validator references unknown entry "${key}"`);
      }
      return { type: v.type || 'mutuallyExclusive', entries: v.entries, scenario: v.scenario || undefined };
    });
  }

  // ---- achievements: family stamping, shared/infer overrides, injection ----
  if (!SHARED_INJECTIONS) SHARED_INJECTIONS = buildSharedInjections();
  const achOverrides = cur.achievements || {};
  const fam = familyOf(code);
  for (const a of db.achievements) {
    a.family = fam;
    const ov = achOverrides[a.id];
    if (ov) {
      if (ov.shared) a.shared = true;
      if (ov.infer) a.infer = ov.infer;
      if (ov.itemInfer) a.itemInfer = ov.itemInfer;
      if (ov.requires) a.requires = ov.requires;
      if (ov.scenario) a.scenario = ov.scenario;
    }
    // RT campaign's own data: base scenario slot -> return_to_* surfaced code.
    if (a.scenario && code in RT_TO_BASE) a.scenario = toReturnScenario(a.scenario);
    if (a.infer) checkInfer(a.infer, en, db, code, warnings, a.id);
    if (a.itemInfer) for (const ii of Object.values(a.itemInfer)) checkInfer(ii, en, db, code, warnings, a.id);
    if (a.requires) checkInfer(a.requires, en, db, code, warnings, a.id);
  }
  // Inject shared achievements inherited from the Return-to family member.
  const inject = SHARED_INJECTIONS[code] || [];
  const have = new Set(db.achievements.map((a) => a.id));
  for (const item of inject) {
    if (have.has(item.def.id)) continue;
    const def = { id: item.def.id, type: item.def.type, family: code, from: item.from };
    if (item.def.items) def.items = item.def.items;
    if (item.def.max !== undefined) def.max = item.def.max;
    const enAch = { ...item.en };
    if (item.def.itemInfer) {
      // A `list` achievement is a version-aware superset: the Return-to version
      // adds items (e.g. return-only mementos). Each item carries its own link,
      // so keep only the items whose link resolves in the base — the base shows
      // fewer boxes while the per-item earned-state stays synchronized by id.
      // Items with no link are kept (not log-gated).
      const keptItems = [];
      const keptInfer = {};
      for (const it of item.def.items || Object.keys(item.def.itemInfer)) {
        const ii = item.def.itemInfer[it];
        if (!ii || inferResolves(ii, en, db)) {
          keptItems.push(it);
          if (ii) keptInfer[it] = ii;
        } else if (enAch.items && it in enAch.items) {
          enAch.items = { ...enAch.items };
          delete enAch.items[it];
        }
      }
      def.items = keptItems;
      if (Object.keys(keptInfer).length) def.itemInfer = keptInfer;
    } else if (item.def.infer) {
      if (inferResolves(item.def.infer, en, db)) def.infer = item.def.infer;
      else warnings.push(`${code}: shared "${def.id}" infer depends on keys absent in base; injected without inference`);
    }
    // A `requires` prerequisite is graceful (undefined when keys absent), so it is
    // safe to inject even if its keys live in the other family member.
    if (item.def.requires) def.requires = item.def.requires;
    if (item.def.scenario) def.scenario = item.def.scenario;
    db.achievements.push(def);
    en.achievements[item.def.id] = enAch;
    have.add(def.id);
  }

  fs.writeFileSync(path.join(DATA_DIR, `${code}-db.json`), JSON.stringify(db, null, 2) + '\n');
  fs.writeFileSync(path.join(DATA_DIR, `${code}-en.json`), JSON.stringify(en, null, 2) + '\n');

  const spoileredCount = Object.values(en.entries).filter((e) => e.spoiler).length;
  console.log(
    `${code.padEnd(8)} entries=${String(db.entries.length).padStart(4)} spoilered=${String(
      spoileredCount
    ).padStart(4)} curation=${exists(curPath) ? 'yes' : 'NONE'}${
      warnings.length ? ` warnings=${warnings.length}` : ''
    }`
  );
  warnings.forEach((w) => console.warn('  ! ' + w));
  return warnings.length;
}

const ALL = [
  'notz', 'dwl', 'ptc', 'tfa', 'tcu', 'tdea', 'tdeb', 'tic', 'eoe', 'tskc', 'fhv', 'tdc',
  'rtnotz', 'rtdwl', 'rtptc', 'rttfa', 'rttcu', 'boa', 'fof', 'gob', 'side',
];

const arg = process.argv[2];
const codes = arg === '--all' || !arg ? ALL : [arg];
let warn = 0;
for (const c of codes) warn += apply(c);
if (warn) console.error(`\n${warn} warning(s).`);
