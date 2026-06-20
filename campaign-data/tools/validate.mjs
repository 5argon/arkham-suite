#!/usr/bin/env node
// Validates final `<code>-db.json` + `<code>-en.json` for internal consistency,
// spoiler-span validity, and completeness against the deterministic draft.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../data');
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const exists = (p) => fs.existsSync(p);

// Valid kohaku Scenario codes (parsed from the enum) for achievement.scenario ties.
const SCENARIO_TS = path.resolve(
  __dirname,
  '../../kohaku/src/type/game/scenario.ts'
);
const SCENARIO_CODES = (() => {
  try {
    const src = fs.readFileSync(SCENARIO_TS, 'utf8');
    const enumBody = src.slice(src.indexOf('export enum Scenario'), src.indexOf('export interface'));
    return new Set([...enumBody.matchAll(/= '([a-z0-9_]+)'/g)].map((m) => m[1]));
  } catch {
    return null; // kohaku not available — skip the check
  }
})();

const SECTION_TYPES = new Set([
  'notes', 'count', 'cards', 'investigatorCount', 'investigatorChecklist',
  'checklist', 'partner', 'relationship', 'supplies', 'scarletKeys', 'glyphs',
  'calendar', 'header',
]);
const ENTRY_KINDS = new Set(['note', 'count', 'cards', 'investigatorCount', 'text', 'task']);

function validate(code) {
  const errs = [];
  const warns = [];
  const dbPath = path.join(DATA_DIR, `${code}-db.json`);
  const enPath = path.join(DATA_DIR, `${code}-en.json`);
  if (!exists(dbPath) || !exists(enPath)) {
    errs.push('missing final files');
    return { code, errs, warns };
  }
  const db = readJson(dbPath);
  const en = readJson(enPath);
  const draftDb = readJson(path.join(DATA_DIR, `${code}-db.draft.json`));

  // structural
  if (db.code !== code) errs.push(`db.code ${db.code} != ${code}`);
  if (en.code !== code) errs.push(`en.code ${en.code} != ${code}`);
  const sectionIds = new Set(db.sections.map((s) => s.id));
  for (const s of db.sections) {
    if (!SECTION_TYPES.has(s.type)) errs.push(`bad section type ${s.id}:${s.type}`);
    if (!(s.id in en.sections)) warns.push(`section ${s.id} has no en title`);
  }
  for (const e of db.entries) {
    if (!ENTRY_KINDS.has(e.kind)) errs.push(`bad entry kind ${e.section}.${e.id}:${e.kind}`);
    if (!sectionIds.has(e.section)) errs.push(`entry ${e.id} -> unknown section ${e.section}`);
    const key = `${e.section}.${e.id}`;
    const hidden = e.hidden || db.sections.find((s) => s.id === e.section)?.hidden;
    if (!hidden && !(key in en.entries)) errs.push(`entry ${key} has no en text`);
  }
  // en entries must map back to a db entry
  const dbKeys = new Set(db.entries.map((e) => `${e.section}.${e.id}`));
  for (const key of Object.keys(en.entries)) {
    if (!dbKeys.has(key)) errs.push(`en entry ${key} has no db entry`);
    const sp = en.entries[key].spoiler;
    if (sp) {
      if (!Array.isArray(sp)) errs.push(`spoiler not array: ${key}`);
      else for (const span of sp) {
        if (typeof span !== 'string' || !span) errs.push(`empty spoiler span: ${key}`);
        else if (!en.entries[key].text.includes(span)) errs.push(`spoiler "${span}" not in text: ${key}`);
      }
    }
  }
  // achievements parity + inference validity
  // `bucket` = where unknown-key problems go. `infer` rules feed errs (fatal);
  // `requires` prerequisites feed warns, since a cross-campaign rule (e.g. the
  // 8-part `reunited`) may legitimately reference keys outside this campaign.
  const checkInfer = (inf, aid, bucket = errs) => {
    if (!inf || typeof inf !== 'object') return;
    if (inf.type === 'log' || inf.type === 'logAbsent') {
      if (!(inf.key in en.entries)) bucket.push(`infer ${aid}: unknown log key "${inf.key}"`);
    } else if (inf.type === 'logCount') {
      const isSection = db.sections.some((s) => s.id === inf.key);
      if (!isSection && !(inf.key in en.entries)) bucket.push(`infer ${aid}: unknown count key "${inf.key}"`);
    } else if (inf.type === 'sectionHas' || inf.type === 'sectionCount' || inf.type === 'partnerStatus') {
      if (!db.sections.some((s) => s.id === inf.section)) bucket.push(`infer ${aid}: unknown section "${inf.section}"`);
    } else if (inf.type === 'allOf' || inf.type === 'anyOf') {
      (inf.of || []).forEach((s) => checkInfer(s, aid, bucket));
    } else if (!['difficulty', 'ultimatums', 'chaosToken'].includes(inf.type)) {
      bucket.push(`infer ${aid}: unknown type "${inf.type}"`);
    }
  };
  const dbAch = new Set(db.achievements.map((a) => a.id));
  for (const a of db.achievements) {
    if (!(a.id in en.achievements)) errs.push(`achievement ${a.id} has no en`);
    if (a.type === 'list' && (!a.items || !a.items.length)) warns.push(`list achievement ${a.id} has no items`);
    if (!a.family) warns.push(`achievement ${a.id} has no family`);
    if (a.infer) checkInfer(a.infer, a.id);
    if (a.itemInfer) {
      for (const [itemId, ii] of Object.entries(a.itemInfer)) {
        checkInfer(ii, `${a.id}.${itemId}`);
        if (a.items && !a.items.includes(itemId)) errs.push(`itemInfer ${a.id}.${itemId} not in items[]`);
      }
    }
    if (a.requires) checkInfer(a.requires, `${a.id} (requires)`, warns);
    if (a.scenario && SCENARIO_CODES && !SCENARIO_CODES.has(a.scenario))
      errs.push(`achievement ${a.id}: unknown scenario code "${a.scenario}"`);
  }
  for (const id of Object.keys(en.achievements)) {
    if (!dbAch.has(id)) errs.push(`en achievement ${id} has no db`);
  }

  // validators: entries must resolve and be a set of ≥2
  for (const v of db.validators || []) {
    if (!Array.isArray(v.entries) || v.entries.length < 2) errs.push(`validator has <2 entries`);
    for (const key of v.entries || []) {
      if (!(key in en.entries)) errs.push(`validator references unknown entry "${key}"`);
    }
  }

  // completeness vs draft: every non-dropped draft entry must survive
  const finalKeys = dbKeys;
  let missing = 0;
  for (const e of draftDb.entries) {
    const key = `${e.section}.${e.id}`;
    if (!finalKeys.has(key)) missing++;
  }
  if (missing) warns.push(`${missing} draft entries dropped from final (intentional drops ok)`);

  return { code, errs, warns, stats: { entries: db.entries.length, sections: db.sections.length, ach: db.achievements.length } };
}

const ALL = [
  'notz', 'dwl', 'ptc', 'tfa', 'tcu', 'tdea', 'tdeb', 'tic', 'eoe', 'tskc', 'fhv', 'tdc',
  'rtnotz', 'rtdwl', 'rtptc', 'rttfa', 'rttcu', 'boa', 'fof', 'gob', 'side',
];
const arg = process.argv[2];
const codes = arg === '--all' || !arg ? ALL : [arg];
let totalErr = 0;
for (const c of codes) {
  const r = validate(c);
  totalErr += r.errs.length;
  const tag = r.errs.length ? 'FAIL' : 'ok  ';
  console.log(`${tag} ${c.padEnd(8)} ${r.stats ? `entries=${r.stats.entries} ach=${r.stats.ach}` : ''}`);
  r.errs.forEach((e) => console.log(`     ✗ ${e}`));
  if (process.env.VERBOSE) r.warns.forEach((w) => console.log(`     ~ ${w}`));
}
console.log(totalErr ? `\n${totalErr} error(s).` : '\nAll valid.');
process.exit(totalErr ? 1 : 0);
