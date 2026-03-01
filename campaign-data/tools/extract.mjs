#!/usr/bin/env node
// Deterministic extractor: reads ArkhamCards campaign reference data and emits
// DRAFT `<code>-db.json` (language-neutral logic) + `<code>-en.json` (English text).
//
// This guarantees completeness (every campaign_log* effect is captured). The
// per-campaign agents then add the semantic layer: spoiler spans, card-name
// resolution for $input placeholders, special-section structure, pruning of
// non-recordable bookkeeping entries.
//
// Usage:
//   node extract.mjs <code>            # one campaign
//   node extract.mjs --all             # every official (non-fan) campaign
//
// Output goes to ../<code>-db.draft.json and ../<code>-en.draft.json

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../data');
const REF = path.resolve(__dirname, '../references/arkham-cards-data-master');
const CAMP = path.join(REF, 'campaigns');
const RETCAMP = path.join(REF, 'return_campaigns');
const PACK = path.resolve(__dirname, '../references/pack');

// ---- Card name index (code -> English name) -------------------------------
const CARD_CODE = /^\d{4,6}[a-z]?$/;
let CARD_INDEX = null;
function loadCardIndex() {
  if (CARD_INDEX) return CARD_INDEX;
  CARD_INDEX = new Map();
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else if (name.endsWith('.json')) {
        let json;
        try {
          json = JSON.parse(fs.readFileSync(p, 'utf8'));
        } catch {
          continue;
        }
        const cards = Array.isArray(json) ? json : [json];
        for (const c of cards) {
          if (c && typeof c === 'object' && c.code && c.name && !CARD_INDEX.has(c.code)) {
            CARD_INDEX.set(c.code, c.name);
          }
        }
      }
    }
  };
  if (fs.existsSync(PACK)) walk(PACK);
  return CARD_INDEX;
}
const cardName = (code) => loadCardIndex().get(code) ?? null;

// The directory name is NOT always the campaign id (e.g. dir `notz` has id
// `core`). Build an index from campaign.json `id` -> { dir, kind }.
function buildIdIndex() {
  const index = new Map();
  for (const [base, kind] of [
    [CAMP, 'campaign'],
    [RETCAMP, 'return'],
  ]) {
    for (const name of fs.readdirSync(base)) {
      const dir = path.join(base, name);
      const cj = path.join(dir, 'campaign.json');
      if (!fs.statSync(dir).isDirectory() || !fs.existsSync(cj)) continue;
      const id = readJson(cj).id ?? name;
      if (!index.has(id)) index.set(id, { dir, kind });
      // Also index by directory name as a fallback alias.
      if (!index.has(name)) index.set(name, { dir, kind });
    }
  }
  return index;
}
let ID_INDEX = null;

// Map our campaign code -> reference source directory.
function sourceDir(code) {
  if (!ID_INDEX) ID_INDEX = buildIdIndex();
  const hit = ID_INDEX.get(code);
  if (!hit) throw new Error(`No reference dir for ${code}`);
  return hit;
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function listJsonFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(dir, f));
}

const LOG_EFFECT_TYPES = new Set([
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

// Recursively walk a JSON tree, collecting every campaign_log* effect with the
// scenario file it came from. `condition` subtrees are skipped: a campaign_log
// CONDITION reads a value (a check), it does not record one, and carries no
// display text — only effects inside `effects`/step bodies are real recordings.
function collectEffects(node, file, out, inCondition = false) {
  if (Array.isArray(node)) {
    for (const v of node) collectEffects(v, file, out, inCondition);
    return;
  }
  if (node && typeof node === 'object') {
    if (!inCondition && typeof node.type === 'string' && LOG_EFFECT_TYPES.has(node.type)) {
      out.push({ file, effect: node });
    }
    for (const k of Object.keys(node)) {
      // do not descend into condition checks as if they were effects
      collectEffects(node[k], file, out, inCondition || k === 'condition');
    }
  }
}

function kindForType(t) {
  switch (t) {
    case 'campaign_log':
      return 'note';
    case 'campaign_log_count':
      return 'count';
    case 'campaign_log_cards':
    case 'campaign_log_cards_switch':
      return 'cards';
    case 'campaign_log_investigator_count':
      return 'investigatorCount';
    case 'campaign_log_text':
    case 'freeform_campaign_log':
      return 'text';
    case 'campaign_log_task':
    case 'campaign_log_assign_task':
      return 'task';
    default:
      return 'note';
  }
}

function scenarioName(file) {
  return path.basename(file, '.json');
}

// The resolutions a player can be sent to DIRECTLY when this scenario ends — the
// "first choice" set, in book order. ArkhamCards lists every resolution (incl.
// sub-resolutions reached only from within another, flagged `hidden`, and the
// auto `investigator_defeat`); we keep just the choosable ones: `no_resolution`
// (and its `_resigned`/`_defeated`/`_act_N` flavours) plus the non-hidden `R#`.
// So Lost in Time → [no_resolution, R1, R3] (R2/R4 hidden), House Always Wins →
// [no_resolution, R1, R2, R3, R4]. Returns undefined when the scenario has none.
function firstChoiceResolutions(json) {
  if (!Array.isArray(json?.resolutions)) return undefined;
  const ids = json.resolutions
    .filter((r) => r && r.id && !r.hidden && r.id !== 'investigator_defeat')
    .map((r) => r.id);
  return ids.length ? ids : undefined;
}

// Per first-choice resolution, the death/madness trauma it inflicts (killed /
// driven insane) plus the win/lose `result` it sets — read from the same
// resolution→step→choice→sub-resolution graph the win/lose tagging walks
// (tools/outcomes.mjs). DETERMINISTIC, so it needs no curation: "an investigator
// is killed / driven insane" is exactly an ArkhamCards `trauma` effect with
// `killed`/`insane`. Trauma reached only through an in-resolution choice is
// flagged `conditional` (the recorded `__resolution` can't tell which branch the
// player took). Returns `{ [resId]: { trauma:[…], result? } }` for the
// first-choice resolutions that carry any such trauma, or undefined when none.
function resolutionEffectsFor(json) {
  const ids = firstChoiceResolutions(json);
  if (!ids) return undefined;
  const steps = new Map();
  for (const s of json.steps || []) if (s && s.id) steps.set(s.id, s);
  const resById = new Map();
  for (const r of json.resolutions) if (r && r.id) resById.set(r.id, r);

  const scan = (e, cond, traumas, results) => {
    if (!e || typeof e !== 'object') return;
    if (e.type === 'trauma' && (e.killed || e.insane)) {
      traumas.push({
        killed: !!e.killed,
        insane: !!e.insane,
        // ArkhamCards omits `investigator` only on whole-party effects → 'all'.
        target: typeof e.investigator === 'string' ? e.investigator : 'all',
        conditional: cond,
      });
    } else if (e.type === 'campaign_data' && e.setting === 'result' && (e.value === 'win' || e.value === 'lose')) {
      results.add(e.value);
    }
  };

  // Walk every step reachable from a resolution; `cond` flips true once we
  // descend into an in-resolution choice branch.
  const walk = (startIds) => {
    const traumas = [];
    const results = new Set();
    const seen = new Set();
    const stack = (startIds || []).map((id) => [id, false]);
    while (stack.length) {
      const [id, cond] = stack.pop();
      if (id == null || seen.has(id)) continue;
      seen.add(id);
      const step = steps.get(id);
      if (!step) continue;
      if (Array.isArray(step.effects)) for (const e of step.effects) scan(e, cond, traumas, results);
      if (step.input && Array.isArray(step.input.effects))
        for (const e of step.input.effects) scan(e, cond, traumas, results);
      if (step.input && Array.isArray(step.input.choices)) {
        for (const c of step.input.choices) {
          if (Array.isArray(c.effects)) for (const e of c.effects) scan(e, true, traumas, results);
          if (Array.isArray(c.steps)) for (const sid of c.steps) stack.push([sid, true]);
        }
      }
      if (step.type === 'resolution' && step.resolution && resById.has(step.resolution)) {
        for (const sid of resById.get(step.resolution).steps || []) stack.push([sid, cond]);
      }
    }
    return { traumas, results };
  };

  const out = {};
  for (const id of ids) {
    const { traumas, results } = walk(resById.get(id)?.steps);
    if (!traumas.length) continue;
    // Dedup by (killed,insane,target); a guaranteed entry beats a conditional one.
    const byKey = new Map();
    for (const t of traumas) {
      const k = `${t.killed ? 'K' : ''}${t.insane ? 'I' : ''}@${t.target}`;
      const prev = byKey.get(k);
      if (!prev || (prev.conditional && !t.conditional)) byKey.set(k, t);
    }
    const trauma = [...byKey.values()].map((t) => {
      const o = {};
      if (t.killed) o.killed = true;
      if (t.insane) o.insane = true;
      o.target = t.target;
      if (t.conditional) o.conditional = true;
      return o;
    });
    const effect = { trauma };
    if (results.has('win') && results.has('lose')) effect.result = 'mixed';
    else if (results.has('win')) effect.result = 'win';
    else if (results.has('lose')) effect.result = 'lose';
    out[id] = effect;
  }
  return Object.keys(out).length ? out : undefined;
}

// The per-difficulty starting chaos bag, read from the campaign's difficulty
// `choose_one` input: each choice is a difficulty (easy/standard/hard/expert)
// and carries the `tokens` it adds. Returned as difficulty -> { tokenCode: count }
// so the app can seed the chaos-bag editor (and scope special tokens like frost
// to the campaigns that actually use them). Undefined when not found.
const DIFFICULTIES = new Set(['easy', 'standard', 'hard', 'expert']);
function startingChaosBags(campaign) {
  const bags = {};
  const visit = (n) => {
    if (Array.isArray(n)) return n.forEach(visit);
    if (!n || typeof n !== 'object') return;
    if (n.type === 'input' && n.input && Array.isArray(n.input.choices)) {
      for (const ch of n.input.choices) {
        const setsDifficulty = (ch.effects || []).some(
          (e) => e && e.type === 'campaign_data' && e.setting === 'difficulty'
        );
        const tokens =
          (Array.isArray(ch.tokens) && ch.tokens) ||
          (ch.effects || []).find((e) => e && e.type === 'add_chaos_token')?.tokens;
        if ((setsDifficulty || DIFFICULTIES.has(ch.id)) && Array.isArray(tokens) && ch.id) {
          const counts = {};
          for (const t of tokens) counts[t] = (counts[t] ?? 0) + 1;
          bags[ch.id] = counts;
        }
      }
    }
    for (const v of Object.values(n)) visit(v);
  };
  visit(campaign);
  return Object.keys(bags).length ? bags : undefined;
}

// ---- Special interactions (roster-gated flavor moments) -------------------
// A campaign step gates a bonus paragraph / setup role on the party's roster:
// a specific investigator code, an investigator trait, or a class/faction. The
// ArkhamCards shapes (all live on a step's `condition`):
//   • campaign_data + investigator + investigator_data:'code'|'trait'|'faction'
//       → party-wide ("if ANY chosen investigator has X") → scope 'any'
//   • type:'investigator' (investigator:'each') + investigator_data:'faction'|'trait'
//       → per-investigator ("EACH investigator with X …") → scope 'each'
// Read an investigator gate out of a single condition object (campaign_data +
// investigator, or type:'investigator'). Returns { match, scope, exclude } or null.
function gateFromOne(c) {
  if (!c || typeof c !== 'object') return null;
  const idata = c.investigator_data;
  if (!idata || !['code', 'trait', 'faction'].includes(idata)) return null;
  const isCampaign = c.type === 'campaign_data' && c.campaign_data === 'investigator';
  const isPerInv = c.type === 'investigator';
  if (!isCampaign && !isPerInv) return null;
  // Union of the option values (each option keys on a single code/trait/faction).
  const values = [];
  for (const o of c.options || []) {
    if (o && typeof o.condition === 'string' && !values.includes(o.condition)) values.push(o.condition);
  }
  if (!values.length) return null;
  const scope = isPerInv && c.investigator === 'each' ? 'each' : 'any';
  const match =
    idata === 'code' ? { kind: 'code', codes: values }
    : idata === 'trait' ? { kind: 'trait', traits: values }
    : { kind: 'faction', factions: values };
  const exclude = Array.isArray(c.exclude_investigators) ? c.exclude_investigators.slice() : undefined;
  return { match, scope, exclude };
}

// Returns { match, scope, exclude } or null. Handles compound conditions: TSK/TDC
// wrap the investigator check inside a `multi`/and/or `condition.conditions[]`
// (e.g. "an investigator has the [[Drifter]] trait" + some log state), so we look
// one level into `conditions[]` for the investigator gate.
function investigatorGate(step) {
  const c = step && step.condition;
  if (!c || typeof c !== 'object') return null;
  const direct = gateFromOne(c);
  if (direct) return direct;
  for (const sub of c.conditions || []) {
    const g = gateFromOne(sub);
    if (g) return g;
  }
  return null;
}

// Seed the English title + "why" blurb from the gating step and the payoff steps
// it points at (option-level `steps`, step-level `steps`, or inline `effects`).
// These are starting points the curation rewrites in our own words; `_story` /
// `_prompt` are curation hints (stripped on apply).
function seedSpecialEn(step, stepIndex) {
  // Collect referenced payoff step ids from the gating node: its own `steps`, and
  // each condition option's `steps` or `story_step` effects (`effects[].steps`),
  // including compound `conditions[]`. This is where the bonus paragraph lives.
  const refs = [];
  const addStepsFrom = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj.steps)) refs.push(...obj.steps);
    for (const e of obj.effects || []) if (Array.isArray(e.steps)) refs.push(...e.steps);
  };
  if (Array.isArray(step.steps)) refs.push(...step.steps);
  const conds = [step.condition, ...(step.condition.conditions || [])];
  for (const c of conds) for (const o of (c && c.options) || []) addStepsFrom(o);
  let title = null;
  let story = null;
  for (const rid of refs) {
    const rs = stepIndex.get(rid);
    if (!rs) continue;
    if (!title && (rs.title || (rs.narration && rs.narration.name))) title = rs.title || rs.narration.name;
    if (!story && rs.type === 'story' && rs.text) story = rs.text;
  }
  const prompt = step.text || step.description || null;
  return { title, story, prompt };
}

function deslug(id) {
  return id.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
}

// Collect every investigator-gated step in a scenario file as a raw special
// interaction. `scenario` is the source-file base (apply remaps it to the kohaku
// Scenario id alongside entry scenarios). Walks the WHOLE step tree: gates live
// not just on top-level steps but nested in `input.choices` (e.g. the
// Dream-Eaters' class dreams) and other sub-step bodies, with payoff steps
// referenced by id from a flat-ish pool — so we index every node-with-id first.
function collectSpecialInteractions(json, scenario) {
  const stepIndex = new Map();
  // Ids that are an option of a player-choice input (`input.choices[]`) — the
  // moment is then DECLINABLE (e.g. the Dream-Eaters' dreams), so it is `optional`
  // unless it also writes a log entry we can detect.
  const choiceOptionIds = new Set();
  const indexNodes = (n) => {
    if (Array.isArray(n)) return n.forEach(indexNodes);
    if (n && typeof n === 'object') {
      if (typeof n.id === 'string' && !stepIndex.has(n.id)) stepIndex.set(n.id, n);
      if (n.input && Array.isArray(n.input.choices)) {
        for (const c of n.input.choices) if (c && typeof c.id === 'string') choiceOptionIds.add(c.id);
      }
      for (const v of Object.values(n)) indexNodes(v);
    }
  };
  indexNodes(json);

  // The campaign-log entry a gated payoff records (so the moment is provable from
  // the log). Walks the gate node's own effects + its referenced steps' effects,
  // skipping `condition` subtrees (those read state, they don't record it).
  const payoffLogKey = (node) => {
    let key = null;
    const visit = (n, inCond) => {
      if (key) return;
      if (Array.isArray(n)) return n.forEach((x) => visit(x, inCond));
      if (!n || typeof n !== 'object') return;
      if (!inCond && n.type === 'campaign_log' && n.section && n.id) {
        key = `${n.section}.${n.id}`;
        return;
      }
      if (Array.isArray(n.steps)) for (const sid of n.steps) { const s = stepIndex.get(sid); if (s) visit(s, inCond); }
      for (const k of Object.keys(n)) visit(n[k], inCond || k === 'condition');
    };
    visit(node, false);
    return key;
  };

  const out = [];
  const seenKeys = new Set();
  const visit = (n) => {
    if (Array.isArray(n)) return n.forEach(visit);
    if (!n || typeof n !== 'object') return;
    if (typeof n.id === 'string') {
      const gate = investigatorGate(n);
      if (gate) {
        const key = `${n.id}|${gate.match.kind}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          const seed = seedSpecialEn(n, stepIndex);
          const logKey = payoffLogKey(n);
          const declinable = choiceOptionIds.has(n.id);
          out.push({
            scenario,
            stepId: n.id,
            match: gate.match,
            scope: gate.scope,
            exclude: gate.exclude,
            // Provable from the log → carry an `infer`; not provable + declinable → optional.
            infer: logKey ? { type: 'log', key: logKey } : undefined,
            optional: declinable && !logKey ? true : undefined,
            ...seed,
          });
        }
      }
    }
    for (const v of Object.values(n)) visit(v);
  };
  visit(json);
  return out;
}

function extract(code) {
  const { dir, kind } = sourceDir(code);
  const campaign = readJson(path.join(dir, 'campaign.json'));

  // For return campaigns, also pull from the base campaign dir.
  const dirs = [dir];
  let baseCampaign = null;
  if (campaign.original_id) {
    let baseDir = null;
    try {
      baseDir = sourceDir(campaign.original_id).dir;
    } catch {
      baseDir = null;
    }
    if (baseDir && fs.existsSync(baseDir)) {
      dirs.push(baseDir);
      baseCampaign = readJson(path.join(baseDir, 'campaign.json'));
    }
  }

  // Visit source files in CAMPAIGN-FLOW order (not the alphabetical order
  // readdirSync returns). An entry recorded in more than one scenario — e.g.
  // dwl's `warren_rice_kidnapped`, first recorded in extracurricular_activity
  // but ALSO re-recorded in essex_county_express (escorted ally defeated) — must
  // be attributed to the scenario where it is FIRST recorded narratively. The
  // dedup below is "first occurrence wins", so that attribution is only correct
  // if we visit scenarios in play order. Alphabetically essex_county_express
  // sorts before extracurricular_activity, which previously stamped those
  // entries with the wrong (later) scenario and dragged them to the bottom of
  // the log. Files not in the flow keep their alphabetical order (stable sort).
  const flowRank = new Map(
    [...(baseCampaign?.scenarios ?? []), ...(campaign.scenarios ?? [])].map((s, i) => [s, i])
  );
  const rankOfFile = (f) => flowRank.get(scenarioName(f)) ?? Number.MAX_SAFE_INTEGER;
  const inFlowOrder = (files) => [...files].sort((a, b) => rankOfFile(a) - rankOfFile(b));

  // Collect every log effect across all source files. Also remember each
  // scenario file's `type` (story / interlude / epilogue / …) for scenarioMeta.
  const raw = [];
  // Book/table-of-contents order is encoded in the source FILENAMES (e.g.
  // `03_dead_heat`, `05_sanguine_shadows`), NOT in campaign.json's scenario
  // arrays (ArkhamCards lists `hidden_scenarios` in its own, non-book order).
  // Capture a sortable rank from each scenario file's numeric prefix
  // (`NN` major + optional `a/b/…` minor) so scenarioMeta + the per-scenario log
  // order follow the physical campaign book. Files with no numeric prefix sort last.
  const fileRankOfBase = (base) => {
    const m = /^(\d+)([a-z]?)/.exec(base);
    if (!m) return Number.MAX_SAFE_INTEGER;
    return Number(m[1]) * 100 + (m[2] ? m[2].charCodeAt(0) - 96 : 0);
  };
  const fileRankById = new Map();
  const scenarioTypeByFile = new Map();
  const scenarioResolutionsByFile = new Map();
  const scenarioResolutionEffectsByFile = new Map();
  const scenarioNameByFile = new Map();
  const scenarioFanMade = new Set();
  const scenarioFilesSeen = new Set();
  const specialRaw = [];
  for (const d of dirs) {
    for (const file of inFlowOrder(listJsonFiles(d))) {
      let json;
      try {
        json = readJson(file);
      } catch (e) {
        console.error(`  ! parse error ${file}: ${e.message}`);
        continue;
      }
      const base = scenarioName(file);
      if (base !== 'campaign') {
        // Index by BOTH the filename base and the scenario's own `id` — branching
        // campaigns reference scenarios in `hidden_scenarios` by `json.id`
        // (`written_in_rock`), which differs from a number-prefixed filename
        // (`02_written_in_rock`); scenarioMeta keys off the id, so its type lookup
        // must too.
        const sid = json && typeof json.id === 'string' ? json.id : base;
        scenarioFilesSeen.add(base);
        if (sid !== base) scenarioFilesSeen.add(sid);
        // Remember the book-order rank for both keys (scenarioMeta keys off the id,
        // entries off the filename base).
        const fr = fileRankOfBase(base);
        if (!fileRankById.has(base)) fileRankById.set(base, fr);
        if (sid !== base && !fileRankById.has(sid)) fileRankById.set(sid, fr);
        // Only interludes/epilogues/core carry an explicit `type`; a regular
        // playable scenario file omits it.
        if (json && typeof json.type === 'string') {
          scenarioTypeByFile.set(base, json.type);
          if (sid !== base) scenarioTypeByFile.set(sid, json.type);
        }
        const res = firstChoiceResolutions(json);
        if (res) {
          scenarioResolutionsByFile.set(base, res);
          if (sid !== base) scenarioResolutionsByFile.set(sid, res);
        }
        const resEffects = resolutionEffectsFor(json);
        if (resEffects) {
          scenarioResolutionEffectsByFile.set(base, resEffects);
          if (sid !== base) scenarioResolutionEffectsByFile.set(sid, resEffects);
        }
        // Real scenario title (for the UI to label a scenario by its name rather
        // than a de-slugged id — e.g. the standalone picker).
        const name = json && (json.scenario_name || json.full_name);
        if (typeof name === 'string' && name) {
          scenarioNameByFile.set(base, name);
          if (sid !== base) scenarioNameByFile.set(sid, name);
        }
        // Fan-made content carries a `custom` block (creator + download link);
        // official FFG scenarios do not. Flag it so the standalone catalogue can
        // exclude community side-stories.
        if (json && json.custom) {
          scenarioFanMade.add(base);
          if (sid !== base) scenarioFanMade.add(sid);
        }
      }
      collectEffects(json, base, raw);
      // Special interactions key off the scenario's own `id` (json.id) — the same
      // value scenarioMeta uses — so they reconcile even when the filename differs
      // (e.g. file `prologue.json` whose id is `ptc_prologue`).
      if (base !== 'campaign') {
        const sid = json && typeof json.id === 'string' ? json.id : base;
        specialRaw.push(...collectSpecialInteractions(json, sid));
      }
    }
  }

  // Sections come from campaign_log[] (base first for return campaigns, then overlay).
  const sectionDefs = [];
  const seenSection = new Set();
  for (const src of [baseCampaign, campaign].filter(Boolean)) {
    for (const s of src.campaign_log || []) {
      if (seenSection.has(s.id) || s.id.startsWith('$')) continue;
      seenSection.add(s.id);
      sectionDefs.push(s);
    }
  }

  // Dedup entries by section+id. Merge cross-out / variants.
  const entriesMap = new Map();
  const order = [];
  for (const { file, effect } of raw) {
    const section = effect.section;
    const id = effect.id;
    // Entries without an id are usually structural counters; keep keyed by a synthetic id.
    const key = `${section}::${id ?? '(' + kindForType(effect.type) + ')'}`;
    if (!entriesMap.has(key)) {
      const e = {
        id: id ?? null,
        section,
        kind: kindForType(effect.type),
        rawType: effect.type,
        scenario: file,
        crossOut: false,
        hidden: !!effect.hidden,
        text: null,
        _texts: new Set(),
      };
      entriesMap.set(key, e);
      order.push(key);
    }
    const e = entriesMap.get(key);
    if (effect.cross_out || effect.remove) e.crossOut = true;
    if (effect.decorate) e.decorate = effect.decorate;
    if (effect.codes) e.codes = effect.codes;
    if (effect.cards) e.cardsMode = effect.cards;
    // Prefer the non-crossout text (the "add" wording) for display.
    const text = effect.text ?? effect.feminine_text ?? effect.masculine_text;
    if (text) {
      e._texts.add(text);
      if (!e.text || (effect.cross_out !== true && effect.remove !== true)) {
        if (!e.text) e.text = text;
      }
    }
  }

  const entries = order.map((k) => entriesMap.get(k));

  // Order entries narratively: by their scenario's position in the campaign
  // flow, then by first-appearance within the scenario. Source files are read
  // alphabetically, so without this the dropdown/log order is effectively
  // arbitrary (the user transcribes their physical log top-to-bottom).
  const scenarioFlow = [...(baseCampaign?.scenarios ?? []), ...(campaign.scenarios ?? [])];
  const scenarioOrderList = [];
  const seenScenario = new Set();
  const pushScenario = (s) => {
    if (s && !seenScenario.has(s)) {
      seenScenario.add(s);
      scenarioOrderList.push(s);
    }
  };
  scenarioFlow.forEach(pushScenario);
  // Append any scenario referenced by entries but missing from the flow (mirage
  // sub-scenarios, spelling drift between campaign.scenarios and filenames).
  for (const e of entries) pushScenario(e.scenario);
  const scenarioRank = new Map(scenarioOrderList.map((s, i) => [s, i]));
  // Prefer the physical book order (source-file rank); fall back to the campaign
  // flow order for scenarios with no numbered file, then to first-appearance.
  const rankOf = (s) =>
    fileRankById.has(s)
      ? fileRankById.get(s)
      : scenarioRank.has(s)
        ? Number.MAX_SAFE_INTEGER - scenarioOrderList.length + scenarioRank.get(s)
        : Number.MAX_SAFE_INTEGER;
  // Array.prototype.sort is stable, so first-appearance order is preserved
  // within each scenario.
  entries.sort((a, b) => rankOf(a.scenario) - rankOf(b.scenario));

  // Order special interactions by the same book order, then build the db list +
  // en seed map. Ids are the gating step id, namespaced by scenario only on a
  // collision (e.g. a "guardian" dream that recurs in another scenario).
  // Drop gates from fan-made scenarios (community side-stories use community
  // investigators not in the official catalogue), mirroring the standalone filter.
  const specialClean = specialRaw.filter((s) => !scenarioFanMade.has(s.scenario));
  specialClean.sort((a, b) => rankOf(a.scenario) - rankOf(b.scenario));
  const specialDb = [];
  const specialEn = {};
  const seenSpecialIds = new Set();
  for (const s of specialClean) {
    let id = s.stepId;
    if (seenSpecialIds.has(id)) id = `${s.scenario}_${s.stepId}`;
    if (seenSpecialIds.has(id)) continue; // exact dup (same step seen twice)
    seenSpecialIds.add(id);
    specialDb.push({
      id,
      scenario: s.scenario,
      match: s.match,
      scope: s.scope,
      exclude: s.exclude && s.exclude.length ? s.exclude : undefined,
      optional: s.optional || undefined,
      infer: s.infer || undefined,
      source: 'extracted',
    });
    specialEn[id] = {
      title: s.title || deslug(s.stepId),
      // Seed the blurb from the gating prompt; curation rewrites it in our words.
      text: s.prompt || s.story || s.title || '',
      spoiler: [],
      _story: s.story || undefined, // curation hint (stripped on apply)
    };
  }

  // Ordered scenario metadata (id + ArkhamCards type) following the campaign's
  // own scenario flow (so even scenarios with no recordable log entry — e.g.
  // Ice and Death, Part 2 — still get a slot, for the per-scenario XP highscore).
  // Includes `hidden_scenarios`: branching campaigns (PtC, FHV, TSKC, TDC…) keep
  // most of their scenarios there, not in the linear `scenarios`, so omitting
  // them dropped the bulk of the campaign (e.g. PtC's Dim Carcosa). A real
  // scenario file with no `type` is a playable 'story' scenario; an id with NO
  // matching file (a campaign.json typo/alias, e.g. eoe's `the_disapperance`) is
  // marked 'other' so it is never treated as playable.
  const scenarioMetaFlow = [
    ...(baseCampaign?.scenarios ?? []),
    ...(campaign.scenarios ?? []),
    ...(baseCampaign?.hidden_scenarios ?? []),
    ...(campaign.hidden_scenarios ?? []),
  ];
  const NON_SCENARIO = new Set(['campaign', 'hidden']);
  const scenarioMeta = [];
  const metaSeen = new Set();
  for (const s of scenarioMetaFlow) {
    if (!s || metaSeen.has(s) || NON_SCENARIO.has(s) || s.startsWith('$')) continue;
    metaSeen.add(s);
    const type = scenarioFilesSeen.has(s) ? scenarioTypeByFile.get(s) ?? 'story' : 'other';
    const meta = { id: s, type };
    const resolutions = scenarioResolutionsByFile.get(s);
    if (resolutions) meta.resolutions = resolutions;
    if (scenarioFanMade.has(s)) meta.fanMade = true;
    const resEffects = scenarioResolutionEffectsByFile.get(s);
    if (resEffects) meta.resolutionEffects = resEffects;
    scenarioMeta.push(meta);
  }
  // Order scenarioMeta by the physical book order (source-file rank); scenarios
  // with no numbered file (typos/aliases) keep their flow position at the end.
  // Stable, so equal ranks preserve campaign-flow order.
  const metaRankOf = (id) => (fileRankById.has(id) ? fileRankById.get(id) : Number.MAX_SAFE_INTEGER);
  scenarioMeta.sort((a, b) => metaRankOf(a.id) - metaRankOf(b.id));

  // Per-section hint: which dynamic input kinds write into this section
  // (e.g. a `cards` effect with cards=$input_value means the player records a
  // free list of cards into the section, like "Sacrificed to Yog-Sothoth").
  const sectionDynamic = new Map();
  for (const e of entries) {
    if (e.id && e.id.startsWith('$')) {
      const set = sectionDynamic.get(e.section) ?? new Set();
      set.add(e.kind);
      sectionDynamic.set(e.section, set);
    }
  }

  const isDynamic = (e) => !!e.id && e.id.startsWith('$');
  const hiddenSections = new Set(sectionDefs.filter((s) => s.hidden).map((s) => s.id));
  const entryHidden = (e) => e.hidden || hiddenSections.has(e.section);

  // Promote section type from the reference when dynamic inputs reveal its real
  // nature (e.g. a `notes` section that only receives card writes is a card
  // list). Agents verify against the reference for the exotic section types.
  // Normalize ArkhamCards' snake_case section types to our canonical camelCase.
  const TYPE_MAP = {
    investigator_count: 'investigatorCount',
    investigator_checklist: 'investigatorChecklist',
    scarlet_keys: 'scarletKeys',
  };
  function sectionType(s) {
    const base = TYPE_MAP[s.type] ?? s.type ?? 'notes';
    if (base !== 'notes') return base;
    const dyn = sectionDynamic.get(s.id);
    const hasNotes = entries.some(
      (e) => e.section === s.id && !isDynamic(e) && !isCardItem(e) && e.kind === 'note'
    );
    // Card-marker sections and card-write sections are card lists.
    if ((cardSections.has(s.id) || (dyn && dyn.has('cards'))) && !hasNotes) return 'cards';
    if (dyn && dyn.has('count') && !hasNotes) return 'count';
    return base;
  }

  // Entries whose id is a bare card code (e.g. "02040") are card markers: the
  // section records that this specific card was logged. Group them under their
  // section's `items` rather than listing them as freeform dropdown rows.
  const isCardItem = (e) => e.id && CARD_CODE.test(e.id) && cardName(e.id);
  const cardItemsBySection = new Map();
  for (const e of entries) {
    if (isCardItem(e)) {
      const arr = cardItemsBySection.get(e.section) ?? [];
      if (!arr.find((x) => x.id === e.id)) arr.push({ id: e.id, code: e.id });
      cardItemsBySection.set(e.section, arr);
    }
  }
  const cardSections = new Set(cardItemsBySection.keys());

  // Synthesize section defs for any section referenced by entries/items but not
  // declared in campaign.json's campaign_log (e.g. TCU's per-character sections
  // keyed by card code). Title resolves from the card name when the id is a code.
  const declaredSections = new Set(sectionDefs.map((s) => s.id));
  const referencedSections = new Set([
    ...entries.map((e) => e.section),
    ...cardItemsBySection.keys(),
  ]);
  for (const sid of referencedSections) {
    if (sid && !sid.startsWith('$') && !declaredSections.has(sid)) {
      const title = CARD_CODE.test(sid) ? cardName(sid) ?? sid : sid;
      sectionDefs.push({ id: sid, title });
      declaredSections.add(sid);
    }
  }

  // A displayable dropdown row needs a stable id and display text. Section
  // structure (counters, glyphs, partners, relationships) is carried by the
  // section + its items, not by these synthetic/textless rows.
  const isRow = (e) =>
    !isDynamic(e) && !isCardItem(e) && e.id != null && !!e.text && !e.section.startsWith('$');

  // Translate an entry's raw kind into the UI input parameter.
  function paramFor(e) {
    switch (e.kind) {
      case 'count':
        return { type: 'count' };
      case 'cards':
        return { type: 'cards', cards: { mode: e.codes ? 'fixed' : 'choice', codes: e.codes } };
      case 'investigatorCount':
        return { type: 'investigatorCount' };
      case 'text':
        return { type: 'text' };
      default:
        return undefined;
    }
  }

  // ---- Build draft -db.json (logic) ----
  const db = {
    code,
    name: campaign.name,
    kind, // "campaign" | "return"
    originalId: campaign.original_id ?? undefined,
    version: campaign.version ?? undefined,
    scenarios: campaign.scenarios ?? [],
    scenarioMeta,
    startingChaosBag: startingChaosBags(campaign) ?? (baseCampaign && startingChaosBags(baseCampaign)) ?? undefined,
    sections: sectionDefs.map((s) => ({
      id: s.id,
      type: sectionType(s),
      hidden: s.hidden || undefined,
      items: cardItemsBySection.get(s.id),
      // hint for curation (which dynamic inputs write here); stripped from final
      _dynamicInputs: sectionDynamic.has(s.id) ? [...sectionDynamic.get(s.id)] : undefined,
    })),
    entries: entries
      // keep only displayable dropdown rows; structure lives on sections
      .filter(isRow)
      .map((e) => ({
        id: e.id,
        section: e.section,
        kind: e.kind,
        scenario: e.scenario,
        param: paramFor(e),
        crossOut: e.crossOut || undefined,
        hidden: entryHidden(e) || undefined,
        decorate: e.decorate || undefined,
      })),
    achievements: (campaign.achievements || []).map((a) => ({
      id: a.id,
      type: a.type,
      items: a.items ? a.items.map((i) => i.id) : undefined,
      max: a.max ?? undefined,
    })),
    specialInteractions: specialDb.length ? specialDb : undefined,
  };

  // ---- Build draft -en.json (English) ----
  // Card-item labels for -en (resolved card names).
  const itemNames = {};
  for (const arr of cardItemsBySection.values()) {
    for (const it of arr) itemNames[it.code] = cardName(it.code);
  }

  // Scenario display names, keyed by the (raw) scenarioMeta id. apply.mjs remaps
  // these keys alongside the scenarioMeta ids when a `scenarios` map is present.
  const scenarioNames = {};
  for (const m of scenarioMeta) {
    const n = scenarioNameByFile.get(m.id);
    if (n) scenarioNames[m.id] = n;
  }

  const sectionTitle = (s) => s.title ?? (CARD_CODE.test(s.id) ? cardName(s.id) ?? s.id : s.id);
  const en = {
    code,
    name: campaign.name,
    sections: Object.fromEntries(sectionDefs.map((s) => [s.id, sectionTitle(s)])),
    scenarioNames: Object.keys(scenarioNames).length ? scenarioNames : undefined,
    items: Object.keys(itemNames).length ? itemNames : undefined,
    entries: Object.fromEntries(
      entries
        // Emit text for every row in a VISIBLE section — including entries the
        // reference marks `hidden` (e.g. EotE's recoverable supplies), so curation
        // can choose to surface them via `unhideSections`. Rows in fully-hidden
        // bookkeeping sections stay omitted.
        .filter((e) => isRow(e) && !hiddenSections.has(e.section))
        // Keyed by composite `section.id` — the language-neutral key, matching
        // ArkhamCards' (section, id) addressing. Ids collide across sections.
        .map((e) => [
          `${e.section}.${e.id}`,
          {
            text: e.text,
            // spoiler spans to be filled in by the per-campaign agent
            spoiler: [],
            // surface alternate phrasings so the agent can see cross-out wording etc.
            _altTexts: e._texts.size > 1 ? [...e._texts].filter((t) => t !== e.text) : undefined,
          },
        ])
    ),
    achievements: Object.fromEntries(
      (campaign.achievements || []).map((a) => [
        a.id,
        {
          title: a.title,
          text: a.text,
          items: a.items ? Object.fromEntries(a.items.map((i) => [i.id, i.text])) : undefined,
        },
      ])
    ),
    specialInteractions: Object.keys(specialEn).length ? specialEn : undefined,
  };

  return {
    db,
    en,
    stats: {
      effects: raw.length,
      entries: entries.length,
      sections: sectionDefs.length,
      special: specialDb.length,
    },
  };
}

function write(code) {
  const { db, en, stats } = extract(code);
  fs.writeFileSync(path.join(DATA_DIR, `${code}-db.draft.json`), JSON.stringify(db, null, 2) + '\n');
  fs.writeFileSync(path.join(DATA_DIR, `${code}-en.draft.json`), JSON.stringify(en, null, 2) + '\n');
  console.log(
    `${code.padEnd(8)} effects=${String(stats.effects).padStart(4)} entries=${String(stats.entries).padStart(
      4
    )} sections=${stats.sections} special=${stats.special}`
  );
}

const ALL = [
  // 12 main
  'notz', 'dwl', 'ptc', 'tfa', 'tcu', 'tdea', 'tdeb', 'tic', 'eoe', 'tskc', 'fhv', 'tdc',
  // 5 return
  'rtnotz', 'rtdwl', 'rtptc', 'rttfa', 'rttcu',
  // boa
  'boa',
  // standalones
  'fof', 'gob', 'side',
];

const arg = process.argv[2];
if (arg === '--all') {
  for (const c of ALL) write(c);
} else if (arg) {
  write(arg);
} else {
  console.error('usage: node extract.mjs <code> | --all');
  process.exit(1);
}
