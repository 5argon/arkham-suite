// Shared helpers for the campaign-data build tools: paths, JSON IO, the campaign code list, the
// ArkhamCards reference-directory index, and curation injection.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = path.resolve(here, '../data');
export const CURATION_DIR = path.resolve(here, '../curation');
export const REF_DIR = path.resolve(here, '../references/arkham-cards-data-master');
export const REF_CAMPAIGNS = path.join(REF_DIR, 'campaigns');
export const REF_RETURN_CAMPAIGNS = path.join(REF_DIR, 'return_campaigns');
export const PACK_DIR = path.resolve(here, '../references/pack');

export const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
export const exists = (p) => fs.existsSync(p);

/** Every official campaign code the pipeline builds. */
export const ALL_CODES = [
  'notz', 'dwl', 'ptc', 'tfa', 'tcu', 'tdea', 'tdeb', 'tic', 'eoe', 'tskc', 'fhv', 'tdc',
  'rtnotz', 'rtdwl', 'rtptc', 'rttfa', 'rttcu', 'boa', 'cob', 'fof', 'gob', 'side',
];

/** Return-to campaign -> base campaign code (the family). */
export const RT_TO_BASE = { rtnotz: 'notz', rtdwl: 'dwl', rtptc: 'ptc', rttfa: 'tfa', rttcu: 'tcu' };

/** ArkhamCards effect types that write to the campaign log. */
export const LOG_EFFECT_TYPES = new Set([
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

/** The campaign codes named on the command line: `<code>…`, or every code for `--all` / nothing. */
export function codesFromArgs(args, { allByDefault = true } = {}) {
  const codes = args.filter((a) => !a.startsWith('--'));
  if (args.includes('--all') || (!codes.length && allByDefault)) return ALL_CODES;
  return codes;
}

let idIndex = null;
/**
 * Reference-directory index: campaign.json `id` (and the directory name as an alias) ->
 * `{ dir, kind }`. The directory name is not always the campaign id (dir `notz` has id `core`).
 */
export function buildIdIndex() {
  if (idIndex) return idIndex;
  idIndex = new Map();
  for (const [base, kind] of [
    [REF_CAMPAIGNS, 'campaign'],
    [REF_RETURN_CAMPAIGNS, 'return'],
  ]) {
    if (!exists(base)) continue;
    for (const name of fs.readdirSync(base)) {
      const dir = path.join(base, name);
      const cj = path.join(dir, 'campaign.json');
      if (!fs.statSync(dir).isDirectory() || !exists(cj)) continue;
      const id = readJson(cj).id ?? name;
      if (!idIndex.has(id)) idIndex.set(id, { dir, kind });
      if (!idIndex.has(name)) idIndex.set(name, { dir, kind });
    }
  }
  return idIndex;
}

/**
 * Insert a curation key right after `code` (keeping a stable file shape), unless the key is
 * already present and `force` is off. Returns a status string for the caller to log.
 */
export function injectCurationKey(code, key, value, force) {
  const p = path.join(CURATION_DIR, `${code}.json`);
  if (!exists(p)) return 'no curation file — skipped';
  const cur = readJson(p);
  if (cur[key] && !force) return `${key} already present — kept (use --force to overwrite)`;
  const { code: c, ...rest } = cur;
  fs.writeFileSync(p, JSON.stringify({ code: c, [key]: value, ...rest }, null, 2) + '\n');
  return null;
}
