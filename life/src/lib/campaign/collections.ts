/**
 * collections.ts — lifetime collection completion per campaign (the TDC glyph
 * wall, TSK Scarlet Keys vault, FHV areas surveyed, …). For each item-set section
 * with a fixed roster (`section.items`), shows which items the player has ever
 * recorded across all plays of the family. Pure + serializable.
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import { buildUnionState, type CampaignRecord } from './achievement-aggregate';

const COLLECTION_TYPES = new Set(['cards', 'scarletKeys', 'glyphs', 'checklist', 'investigatorChecklist']);

export interface CollectionItem {
  id: string;
  label: string;
  collected: boolean;
}
export interface Collection {
  sectionId: string;
  title: string;
  items: CollectionItem[];
  collectedCount: number;
}
export interface CampaignCollections {
  family: string;
  name: string;
  collections: Collection[];
}

export function buildCollections(records: CampaignRecord[]): CampaignCollections[] {
  const byFamily = new Map<string, CampaignRecord[]>();
  for (const rec of records) {
    const log = getCampaignLog(rec.campaignCode);
    if (!log) continue;
    const family = log.db.originalId ?? log.db.code;
    let arr = byFamily.get(family);
    if (!arr) {
      arr = [];
      byFamily.set(family, arr);
    }
    arr.push(rec);
  }

  const out: CampaignCollections[] = [];
  for (const [family, recs] of byFamily) {
    const union = buildUnionState(recs);
    const codes = new Set<string>([family]);
    for (const r of recs) {
      const log = getCampaignLog(r.campaignCode);
      if (log) codes.add(log.db.code);
    }
    const collections: Collection[] = [];
    const seen = new Set<string>();
    let name = family;
    for (const code of codes) {
      const log = getCampaignLog(code);
      if (!log) continue;
      if (code === family) name = log.db.name;
      for (const sec of log.db.sections) {
        if (!COLLECTION_TYPES.has(sec.type) || !sec.items?.length || seen.has(sec.id)) continue;
        seen.add(sec.id);
        const collected = union.recordedSectionItems[sec.id] ?? new Set<string>();
        const items: CollectionItem[] = sec.items.map((it) => ({
          id: it.id,
          // Roster labels live in en.items for most sections, but some (TDC
          // glyphs) carry them only as composite entry text (`glyphs.<id>`).
          label: log.en.items?.[it.id] ?? log.en.entries?.[`${sec.id}.${it.id}`]?.text ?? it.id,
          collected: collected.has(it.id),
        }));
        collections.push({
          sectionId: sec.id,
          title: log.en.sections[sec.id] ?? sec.id,
          items,
          collectedCount: items.filter((i) => i.collected).length,
        });
      }
    }
    if (collections.length) out.push({ family, name, collections });
  }
  return out;
}
