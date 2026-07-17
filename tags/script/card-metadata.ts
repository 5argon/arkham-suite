/**
 * Shared loader for per-card STAT METADATA (level / type / commit icons), resolved from
 * the monorepo's resolved card database (`ui/src/routes/card/cards.json`). Used by the
 * ingress (`scaffold-untagged`, `assemble-tagged-cards`) and the one-off backfill
 * (`enrich-metadata`) so every `tagged-cards/<pack>.ts` carries the metadata tag authors
 * need to judge icon/level/type-aware tags — without it living in the tag data itself.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export interface CardMetadata {
  level?: number;
  cardType?: string;
  icons: string[];
}

const ICON_KEYS = ["willpower", "intellect", "combat", "agility", "wild"] as const;

const here = dirname(fileURLToPath(import.meta.url));
const CARDS_JSON = join(here, "..", "..", "ui", "src", "routes", "card", "cards.json");

let cache: Map<string, CardMetadata> | null = null;

/**
 * code → {level, cardType, icons}. Best-effort: returns an empty map if the resolved
 * card database can't be read (so the ingress never hard-fails for a volunteer whose
 * checkout lacks it — the cards just go un-enriched). Codes absent from the resolved
 * DB (new sets it doesn't know yet) fall back to this package's json/input/<pack>.json
 * files, whose stats come from the raw pack data.
 */
export async function loadCardMetadata(): Promise<Map<string, CardMetadata>> {
  if (cache) return cache;
  const map = new Map<string, CardMetadata>();
  // fallback layer first, so the resolved DB overrides it where both exist
  try {
    const inputDir = join(here, "..", "json", "input");
    const { readdir } = await import("node:fs/promises");
    for (const f of (await readdir(inputDir)).filter((f) => f.endsWith(".json"))) {
      for (const c of JSON.parse(await readFile(join(inputDir, f), "utf8")) as Record<string, unknown>[]) {
        if (!c.code) continue;
        map.set(c.code as string, {
          level: c.xp as number | undefined,
          cardType: c.type as string | undefined,
          icons: (c.icons as string[]) ?? [],
        });
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
        icons,
      });
    }
  } catch {
    // leave the map empty; callers emit no metadata fields
  }
  return (cache = map);
}

/** The metadata fields as `.ts` object lines (4-space indent), for the .ts emitters. */
export function metadataLines(meta: CardMetadata | undefined): string[] {
  if (!meta) return [];
  const lines: string[] = [];
  if (typeof meta.level === "number") lines.push(`    level: ${meta.level},`);
  if (meta.cardType) lines.push(`    cardType: ${JSON.stringify(meta.cardType)},`);
  lines.push(`    icons: [${meta.icons.map((i) => JSON.stringify(i)).join(", ")}],`);
  return lines;
}
