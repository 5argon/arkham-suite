import { path } from "../mod.ts"

/**
 * Cards revealed in previews, typed in by hand before the community's data has them. Each file in
 * `preview/` is in the same format as a file of `pack/`, so the upstream file can take its place once
 * it's out. `reconcile-preview.ts` hands them over when that happens.
 */
export const previewDirectory = "preview"

/**
 * A temporary code that turned out wrong, mapped to the code the community's data gave the card.
 * Kept for good so what was saved with the temporary code still finds the card.
 */
export const aliasesFile = path.join(previewDirectory, "aliases.json")

export interface PreviewCard {
  code: string
  name: string
  pack_code: string
  type_code: string
  faction_code?: string
  xp?: number
  encounter_code?: string
  [key: string]: unknown
}

export async function previewFiles(): Promise<string[]> {
  const files: string[] = []
  for await (const entry of Deno.readDir(previewDirectory)) {
    if (entry.isFile && entry.name.endsWith(".json") && entry.name !== path.basename(aliasesFile)) {
      files.push(path.join(previewDirectory, entry.name))
    }
  }
  return files.sort()
}

export async function readPreviewCards(): Promise<{ file: string; cards: PreviewCard[] }[]> {
  const result: { file: string; cards: PreviewCard[] }[] = []
  for (const file of await previewFiles()) {
    result.push({ file, cards: JSON.parse(await Deno.readTextFile(file)) as PreviewCard[] })
  }
  return result
}

export async function readAliases(): Promise<Record<string, string>> {
  try {
    return JSON.parse(await Deno.readTextFile(aliasesFile)) as Record<string, string>
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) return {}
    throw e
  }
}

/**
 * Names as printed vary in apostrophes and accents between sources.
 */
export function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’‘]/g, "'")
    .trim()
    .toLowerCase()
}

/**
 * The community's card that a preview card became: the same code with the same name, otherwise the
 * same name, level and type. Encounter cards are never a match.
 */
export function findUpstream<T extends PreviewCard>(preview: PreviewCard, upstream: T[]): T | undefined {
  const name = normalizeName(preview.name)
  const sameCode = upstream.find((card) => card.code === preview.code)
  if (sameCode?.name !== undefined && normalizeName(sameCode.name) === name) return sameCode
  // A reprint lists only what differs from its original, often without a name. The original matches.
  return upstream.find(
    (card) =>
      card.name !== undefined &&
      card.encounter_code === undefined &&
      normalizeName(card.name) === name &&
      (card.xp ?? 0) === (preview.xp ?? 0) &&
      card.type_code === preview.type_code,
  )
}

/**
 * Why the preview cards can't be added to the community's cards as they are. Anything here means it's
 * time to run reconcile-preview.ts.
 */
export function previewConflicts(previews: PreviewCard[], upstream: PreviewCard[]): string[] {
  const problems: string[] = []
  const upstreamCodes = new Map(upstream.map((card) => [card.code, card]))
  const seen = new Set<string>()
  for (const card of previews) {
    if (seen.has(card.code)) problems.push(`${card.code} ${card.name}: listed twice in preview/`)
    seen.add(card.code)
    const match = findUpstream(card, upstream)
    if (match !== undefined) {
      problems.push(`${card.code} ${card.name}: the community's data has it now as ${match.code}`)
      continue
    }
    const taken = upstreamCodes.get(card.code)
    if (taken !== undefined) {
      problems.push(`${card.code} ${card.name}: the community's data gave this code to ${taken.name}`)
    }
  }
  return problems
}
