/**
 * Shared loader for per-card STAT METADATA (level / type / weakness subtype / commit icons), resolved from
 * the monorepo's resolved card database (`ui/src/routes/card/cards.json`). Used by the
 * ingress scripts (`scaffold-untagged`, `assemble-tagged-cards`) so every
 * `tagged-cards/<pack>.ts` carries the metadata tag authors need to judge
 * icon/level/type-aware tags.
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { root } from "./lib.ts";

export type WeaknessSubtype = "weakness" | "basicweakness";

export interface CardMetadata {
  level?: number;
  cardType?: string;
  /** Set on weakness cards (signature, bonded and basic) — they are never tagged. */
  subtype?: WeaknessSubtype;
  icons: string[];
}

const weaknessSubtype = (v: unknown): WeaknessSubtype | undefined =>
  v === "weakness" || v === "basicweakness" ? v : undefined;

const ICON_KEYS = ["willpower", "intellect", "combat", "agility", "wild"] as const;

const CARDS_JSON = join(root, "..", "ui", "src", "routes", "card", "cards.json");

let cache: Map<string, CardMetadata> | null = null;

/**
 * code → {level, cardType, subtype, icons}. Best-effort: returns an empty map if the resolved
 * card database can't be read (so the ingress never hard-fails for a volunteer whose
 * checkout lacks it — the cards just go un-enriched). Codes absent from the resolved
 * DB (new sets it doesn't know yet) fall back to this package's json/input/<pack>.json
 * files, whose stats come from the raw pack data; an input reprint with no subtype of its own
 * takes its `duplicateOf` original's.
 */
export async function loadCardMetadata(): Promise<Map<string, CardMetadata>> {
  if (cache) return cache;
  const map = new Map<string, CardMetadata>();
  const duplicateOf = new Map<string, string>();
  // fallback layer first, so the resolved DB overrides it where both exist
  try {
    const inputDir = join(root, "json", "input");
    for (const f of (await readdir(inputDir)).filter((f) => f.endsWith(".json"))) {
      for (const c of JSON.parse(await readFile(join(inputDir, f), "utf8")) as Record<string, unknown>[]) {
        if (!c.code) continue;
        map.set(c.code as string, {
          level: c.xp as number | undefined,
          cardType: c.type as string | undefined,
          subtype: weaknessSubtype(c.subtype),
          icons: (c.icons as string[]) ?? [],
        });
        if (typeof c.duplicateOf === "string") duplicateOf.set(c.code as string, c.duplicateOf);
      }
    }
  } catch {
    /* input files are optional */
  }
  try {
    const cards: Record<string, unknown>[] = JSON.parse(await readFile(CARDS_JSON, "utf8"));
    for (const c of cards) {
      const icons: string[] = [];
      for (const k of ICON_KEYS) {
        const n = (c[`skill_${k}`] as number) ?? 0;
        for (let i = 0; i < n; i++) icons.push(k);
      }
      map.set(c.code as string, {
        level: typeof c.xp === "number" ? c.xp : undefined,
        cardType: c.type_code as string | undefined,
        subtype: weaknessSubtype(c.subtype_code) ?? map.get(c.code as string)?.subtype,
        icons,
      });
    }
  } catch {
    // leave the map empty; callers emit no metadata fields
  }
  for (const [code, original] of duplicateOf) {
    const m = map.get(code);
    if (m && !m.subtype) m.subtype = map.get(original)?.subtype;
  }
  return (cache = map);
}

/** The metadata fields as `.ts` object lines (4-space indent), for the .ts emitters. */
export function metadataLines(meta: CardMetadata | undefined): string[] {
  if (!meta) return [];
  const lines: string[] = [];
  if (typeof meta.level === "number") lines.push(`    level: ${meta.level},`);
  if (meta.cardType) lines.push(`    cardType: ${JSON.stringify(meta.cardType)},`);
  if (meta.subtype) lines.push(`    subtype: ${JSON.stringify(meta.subtype)},`);
  lines.push(`    icons: [${meta.icons.map((i) => JSON.stringify(i)).join(", ")}],`);
  return lines;
}
