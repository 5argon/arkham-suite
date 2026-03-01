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
//         "cardFilter": { "traits": ["Ally"] },   // restrict a `cards` picker
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
    case 'scenarioChoice': {
      const sm = (db.scenarioMeta || []).find((m) => m.id === infer.scenario);
      if (!sm || !(sm.choices || []).some((c) => c.id === infer.choice))
        warnings.push(`${code}: infer ${aid} -> unknown scenarioChoice "${infer.scenario}.${infer.choice}"`);
      break;
    }
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
    if (ov.cardFilter !== undefined) merged.cardFilter = ov.cardFilter;
    if (ov.major !== undefined) merged.major = ov.major || undefined;
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

  // ---- un-hide entries the reference marks hidden but we want recordable ----
  // (e.g. EotE's Supplies Recovered: Spare Parts/Dynamite/… are real, cross-off-
  // able items, not bookkeeping noise). Their en text is emitted by extract.
  const unhideSections = new Set(cur.unhideSections || []);
  const unhideKeys = new Set(cur.unhide || []);
  if (unhideSections.size || unhideKeys.size) {
    for (const e of db.entries) {
      if (unhideSections.has(e.section) || unhideKeys.has(keyOf(e))) delete e.hidden;
    }
  }

  // ---- entry-level overrides (repeatable / cardFilter) ----
  // Keyed by "<section>.<id>"; lets curation mark a recordable entry repeatable or restrict
  // its `#name#` card picker (e.g. Fortune and Folly's Stashed/Alarm level, which carry a
  // card + number identity and so repeat). The extractor can't infer either from the tree.
  const entryOverrides = cur.entryOverrides || {};
  if (Object.keys(entryOverrides).length) {
    const known = new Set(db.entries.map(keyOf));
    for (const e of db.entries) {
      const ov = entryOverrides[keyOf(e)];
      if (!ov) continue;
      if (ov.repeatable !== undefined) e.repeatable = ov.repeatable || undefined;
      if (ov.cardFilter !== undefined) e.cardFilter = ov.cardFilter;
    }
    for (const k of Object.keys(entryOverrides))
      if (!k.startsWith('_') && !known.has(k))
        warnings.push(`${code}: entryOverride key "${k}" matches no entry`);
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

  // ---- outcomes: tag win/loss resolution entries (clear-status source) ----
  // Curation shape: "outcomes": { "win": ["<section>.<id>", ...], "loss": [...] }.
  // Stamps `entry.outcome` so the app derives "cleared on difficulty D" with one
  // set-membership test. Tag by mechanical outcome only (pyrrhic = win).
  const outcomes = cur.outcomes || {};
  if (outcomes.win || outcomes.betterWin || outcomes.loss || outcomes.special) {
    const entryByKey = new Map(db.entries.map((e) => [keyOf(e), e]));
    const tag = (keys, outcome, quality) => {
      for (const key of keys || []) {
        const e = entryByKey.get(key);
        if (!e) {
          warnings.push(`${code}: outcome ${outcome} -> unknown entry "${key}"`);
          continue;
        }
        e.outcome = outcome;
        if (quality) e.outcomeQuality = quality;
      }
    };
    tag(outcomes.win, 'win');
    tag(outcomes.betterWin, 'win', 'best'); // superior wins still clear the campaign
    tag(outcomes.special, 'special');
    tag(outcomes.loss, 'loss');
  }
  for (const k of Object.keys(outcomes)) {
    if (!['win', 'betterWin', 'loss', 'special', '_notes'].includes(k))
      warnings.push(`${code}: outcomes unknown bucket "${k}" (typo? expected win/betterWin/loss/special)`);
  }

  // ---- scenario tags: normalize raw ArkhamCards ids -> kohaku Scenario ----
  // Curation shape: "scenarios": { "<rawTag>": "<kohakuScenarioId>", ... }.
  // `extract.mjs` sets entry.scenario from the ArkhamCards filename (e.g.
  // `02_one_last_job`); this override rewrites those to the canonical kohaku
  // `Scenario` enum value so scenario-frequency / per-scenario UI align. Tags
  // left out of the map (interludes, epilogues, campaign-wide) are kept as-is.
  const scenarioMap = cur.scenarios || {};
  if (Object.keys(scenarioMap).length) {
    // A scenarios-map key is "used" if it matches an entry tag, a scenarioMeta id
    // (ArkhamCards uses location ids here, e.g. tskc `buenos_aires`), or an
    // en.scenarioNames key — any of which the remap below rewrites.
    const present = new Set([
      ...db.entries.map((e) => e.scenario),
      ...(Array.isArray(db.scenarioMeta) ? db.scenarioMeta.map((m) => m.id) : []),
      ...Object.keys(en.scenarioNames || {}),
    ]);
    for (const e of db.entries) {
      const mapped = scenarioMap[e.scenario];
      if (mapped) e.scenario = mapped;
    }
    // Keep scenarioMeta ids aligned with the remapped entry scenarios.
    if (Array.isArray(db.scenarioMeta)) {
      for (const sm of db.scenarioMeta) {
        const mapped = scenarioMap[sm.id];
        if (mapped) sm.id = mapped;
      }
    }
    // …and special-interaction scenarios (keyed off the same scenario id).
    if (Array.isArray(db.specialInteractions)) {
      for (const si of db.specialInteractions) {
        const mapped = scenarioMap[si.scenario];
        if (mapped) si.scenario = mapped;
      }
    }
    // …and the en scenario-name keys, which key off the same scenario id.
    if (en.scenarioNames) {
      const remapped = {};
      for (const [id, name] of Object.entries(en.scenarioNames)) {
        remapped[scenarioMap[id] ?? id] = name;
      }
      en.scenarioNames = remapped;
    }
    for (const raw of Object.keys(scenarioMap)) {
      if (!present.has(raw)) warnings.push(`${code}: scenarios map raw "${raw}" matches no entry`);
    }
  }

  // ---- clear scenario attribution for AMBIGUOUS entries ----
  // Curation shape: "clearScenario": ["<entryId>", ...].
  // Some campaign-log entries are recorded in MORE THAN ONE scenario — e.g. TSK's
  // "the cell was hollowed" loss, which the rules record at BOTH Without a Trace and
  // Congress of the Keys. extract.mjs can only stamp one source scenario (first in
  // flow order), which mis-attributes the derived route for the other case. Listing
  // the entry id here drops its `scenario` tag entirely, so it never forces a scenario
  // into the route; which finale was actually reached is still inferred from the OTHER,
  // unambiguous entries recorded alongside it (the whistle logs ⇒ Without a Trace, the
  // Coterie-vote logs ⇒ Congress of the Keys).
  const clearScenario = new Set(cur.clearScenario || []);
  if (clearScenario.size) {
    const ids = new Set(db.entries.map((e) => e.id));
    // Empty string (not delete) keeps the required `scenario` field present; the
    // route builder treats a falsy scenario as "unattributed" and skips it.
    for (const e of db.entries) if (clearScenario.has(e.id)) e.scenario = '';
    for (const id of clearScenario) {
      if (!ids.has(id)) warnings.push(`${code}: clearScenario id "${id}" matches no entry`);
    }
  }

  // ---- scenario display-name overrides ----
  // extract.mjs takes the ArkhamCards `scenario_name` (falling back to `full_name`).
  // For a multi-part side scenario that is one catalogue entry, `scenario_name` is a
  // part title ("Part I: The Stakeout") while `full_name` is the umbrella name
  // ("Fortune and Folly") the standalone picker should show. Curation shape:
  // "scenarioNames": { "<scenarioId>": "<display name>" }.
  if (cur.scenarioNames) {
    en.scenarioNames = en.scenarioNames || {};
    for (const [id, name] of Object.entries(cur.scenarioNames)) {
      en.scenarioNames[id] = name;
    }
  }

  // Dedup scenarioMeta by id: variant ids (e.g. fatal_mirage_2/3) collapse onto
  // one canonical id after the remap above. Keep the first (campaign order).
  if (Array.isArray(db.scenarioMeta)) {
    const seenMeta = new Set();
    db.scenarioMeta = db.scenarioMeta.filter((sm) => {
      if (seenMeta.has(sm.id)) return false;
      seenMeta.add(sm.id);
      return true;
    });
  }

  // ---- scenario choices: curated per-scenario "Extra" picks (e.g. PtC Dim
  // Carcosa's Hastur version). Language-neutral {id, options} ride on the
  // scenarioMeta entry; the label (+ optional option labels) goes to -en. ----
  const scenarioChoices = cur.scenarioChoices || {};
  if (Object.keys(scenarioChoices).length) {
    const metaById = new Map((db.scenarioMeta || []).map((m) => [m.id, m]));
    const enChoices = {};
    for (const [scenario, choices] of Object.entries(scenarioChoices)) {
      const sm = metaById.get(scenario);
      if (!sm) {
        warnings.push(`${code}: scenarioChoices for unknown scenario "${scenario}"`);
        continue;
      }
      sm.choices = choices.map((c) => {
        const out = { id: c.id, options: c.options };
        if (c.control) out.control = c.control;
        if (c.min !== undefined) out.min = c.min;
        if (c.max !== undefined) out.max = c.max;
        return out;
      });
      for (const c of choices) {
        enChoices[`${scenario}.${c.id}`] = c.optionLabels
          ? { label: c.label, options: c.optionLabels }
          : { label: c.label };
      }
    }
    if (Object.keys(enChoices).length) en.scenarioChoices = enChoices;
  }

  // ---- scenario resolution overrides: replace a scenario's first-choice resolution
  // list (e.g. Fortune and Folly's catalogue entry records Part II's outcomes, not the
  // Part I "Stakeout" resolutions extract pulls from the part-1 file). Curation shape:
  //   "scenarioResolutions": { "<scenarioId>": ["no_resolution", "R1", ...] }
  const scenarioResolutions = cur.scenarioResolutions || {};
  if (Object.keys(scenarioResolutions).length) {
    const metaById = new Map((db.scenarioMeta || []).map((m) => [m.id, m]));
    for (const [scenario, resolutions] of Object.entries(scenarioResolutions)) {
      if (scenario.startsWith('_')) continue; // helper note keys
      const sm = metaById.get(scenario);
      if (!sm) warnings.push(`${code}: scenarioResolutions for unknown scenario "${scenario}"`);
      else {
        sm.resolutions = resolutions;
        // Keep resolutionEffects consistent: extract derives them with the same
        // non-hidden heuristic, so dropping a resolution here must drop its effects
        // (trauma on a dropped resolution belongs to the path that now reaches it).
        if (sm.resolutionEffects) {
          const keep = new Set(resolutions);
          for (const resId of Object.keys(sm.resolutionEffects)) {
            if (!keep.has(resId)) delete sm.resolutionEffects[resId];
          }
          if (!Object.keys(sm.resolutionEffects).length) delete sm.resolutionEffects;
        }
      }
    }
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
      if (ov.lifeInfer) a.lifeInfer = true;
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

  // ---- special interactions: curation merge (suppress / override / add) ----
  // Curation shape under `specialInteractions`, keyed by interaction id:
  //   "<id>": { "suppress": true }                       // drop extracted noise
  //   "<id>": { "title": "...", "text": "...", "spoiler": [...],  // -en overrides
  //             "scenario": "...", "match": {...}, "scope": "...", // -db overrides
  //             "role": "...", "exclude": [...] }
  // A brand-new id (not extracted) is a curated, prose-only moment (e.g. TFA's
  // expedition leader) — it must carry match + scenario; scope defaults to 'any'.
  const siOverrides = cur.specialInteractions || {};
  {
    const siDb = Array.isArray(db.specialInteractions) ? db.specialInteractions : [];
    db.specialInteractions = undefined;
    en.specialInteractions = en.specialInteractions || {};
    // Tidy seeds: drop empty spoiler arrays + the auto-seeded `title` (the widget
    // leads with the gating condition, so we keep only the curated "why" `text`;
    // curation may re-add a title via override below if ever wanted).
    for (const v of Object.values(en.specialInteractions)) {
      if (Array.isArray(v.spoiler) && !v.spoiler.length) delete v.spoiler;
      delete v.title;
    }
    const byId = new Map(siDb.map((s) => [s.id, s]));
    const order = siDb.map((s) => s.id);
    for (const [id, ov] of Object.entries(siOverrides)) {
      if (ov && ov.suppress) {
        byId.delete(id);
        delete en.specialInteractions[id];
        continue;
      }
      const existing = byId.get(id);
      const def = existing || { id, scope: 'any', source: 'curated' };
      if (!existing) order.push(id);
      // -db fields
      for (const f of ['scenario', 'match', 'scope', 'role', 'exclude', 'optional', 'infer']) {
        if (ov[f] !== undefined) def[f] = ov[f];
      }
      byId.set(id, def);
      // -en fields
      const en0 = en.specialInteractions[id] || {};
      if (ov.title !== undefined) en0.title = ov.title;
      if (ov.text !== undefined) en0.text = ov.text;
      if (ov.spoiler !== undefined) en0.spoiler = ov.spoiler;
      en.specialInteractions[id] = en0;
    }
    const finalSi = order.filter((id) => byId.has(id)).map((id) => byId.get(id));
    // Validate: scenario resolves, match present, en text present, spoiler spans valid.
    const scenarioIds = new Set([
      ...db.entries.map((e) => e.scenario),
      ...(Array.isArray(db.scenarioMeta) ? db.scenarioMeta.map((m) => m.id) : []),
    ]);
    for (const s of finalSi) {
      if (!s.scenario || !scenarioIds.has(s.scenario))
        warnings.push(`${code}: specialInteraction "${s.id}" -> unknown scenario "${s.scenario}"`);
      if (!s.match || !s.match.kind) warnings.push(`${code}: specialInteraction "${s.id}" has no match`);
      if (s.infer) checkInfer(s.infer, en, db, code, warnings, `specialInteraction ${s.id}`);
      const e = en.specialInteractions[s.id];
      if (!e || !e.text) warnings.push(`${code}: specialInteraction "${s.id}" missing en text (the "why")`);
      else if (Array.isArray(e.spoiler)) {
        const valid = e.spoiler.filter((sp) => e.text.includes(sp));
        for (const sp of e.spoiler) if (!e.text.includes(sp)) warnings.push(`${code}: specialInteraction "${s.id}" spoiler "${sp}" not in text`);
        if (valid.length) e.spoiler = valid;
        else delete e.spoiler;
      }
    }
    // Flag curation keys that reference nothing.
    for (const id of Object.keys(siOverrides)) {
      if (!byId.has(id) && !(siOverrides[id] && siOverrides[id].suppress))
        warnings.push(`${code}: specialInteractions curation "${id}" matches nothing`);
    }
    // Drop en rows with no surviving def.
    for (const id of Object.keys(en.specialInteractions)) {
      if (!byId.has(id)) delete en.specialInteractions[id];
    }
    if (finalSi.length) db.specialInteractions = finalSi;
    if (!Object.keys(en.specialInteractions).length) delete en.specialInteractions;
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
