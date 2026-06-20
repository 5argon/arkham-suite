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

  // Collect every log effect across all source files.
  const raw = [];
  for (const d of dirs) {
    for (const file of listJsonFiles(d)) {
      let json;
      try {
        json = readJson(file);
      } catch (e) {
        console.error(`  ! parse error ${file}: ${e.message}`);
        continue;
      }
      collectEffects(json, scenarioName(file), raw);
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
  };

  // ---- Build draft -en.json (English) ----
  // Card-item labels for -en (resolved card names).
  const itemNames = {};
  for (const arr of cardItemsBySection.values()) {
    for (const it of arr) itemNames[it.code] = cardName(it.code);
  }

  const sectionTitle = (s) => s.title ?? (CARD_CODE.test(s.id) ? cardName(s.id) ?? s.id : s.id);
  const en = {
    code,
    name: campaign.name,
    sections: Object.fromEntries(sectionDefs.map((s) => [s.id, sectionTitle(s)])),
    items: Object.keys(itemNames).length ? itemNames : undefined,
    entries: Object.fromEntries(
      entries
        .filter((e) => isRow(e) && !entryHidden(e))
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
  };

  return { db, en, stats: { effects: raw.length, entries: entries.length, sections: sectionDefs.length } };
}

function write(code) {
  const { db, en, stats } = extract(code);
  fs.writeFileSync(path.join(DATA_DIR, `${code}-db.draft.json`), JSON.stringify(db, null, 2) + '\n');
  fs.writeFileSync(path.join(DATA_DIR, `${code}-en.draft.json`), JSON.stringify(en, null, 2) + '\n');
  console.log(
    `${code.padEnd(8)} effects=${String(stats.effects).padStart(4)} entries=${String(stats.entries).padStart(
      4
    )} sections=${stats.sections}`
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
