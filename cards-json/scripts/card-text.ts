import { path } from "../mod.ts"

/**
 * cards.json has its text stripped to stay small, and the pack folder this reads is not in git. The
 * Card Reviews pages show full text, so this writes what they need to a file that is committed and
 * only ever read on the server.
 */

interface PackCard {
  code: string
  pack_code: string
  duplicate_of?: string
  faction_code?: string
  [key: string]: unknown
}

const packDirectory = "pack"
const outputFile = "../starter/src/lib/server/data/card-text.json"

/**
 * Packs of the products Card Reviews covers. Add new Chapter Two player card packs here. The Chapter
 * One ones are for its older reviews, whose cards are spread over these packs.
 */
const reviewPacks = new Set([
  "core_2026", "tom", "car", "and", "mar", "mig",
  "rcore", "nat", "har", "win", "jac", "ste",
  "dwl", "tmm", "tece", "bota", "uau", "wda", "litas",
  "ptc", "eotp", "tuo", "apot", "tpm", "bsr", "dca",
  "tfa", "tof", "tbb", "hote", "tcoa", "tdoy", "sha",
  "tcu", "tsn", "wos", "fgg", "uad", "icc", "bbt",
  "tde", "tsh", "dsm", "pnr", "wgd", "woc",
  "tic", "itd", "def", "hhg", "lif", "lod", "itm",
  "eoep", "tskp", "fhvp", "tdcp",
])

const textFields = ["traits", "text", "flavor", "back_text", "back_flavor", "customization_text"]

async function collectJsonFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  for await (const entry of Deno.readDir(dir)) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory) {
      files.push(...await collectJsonFiles(fullPath))
    } else if (entry.isFile && entry.name.endsWith(".json")) {
      files.push(fullPath)
    }
  }
  return files
}

const allCards: PackCard[] = []
for (const file of await collectJsonFiles(packDirectory)) {
  allCards.push(...JSON.parse(await Deno.readTextFile(file)) as PackCard[])
}
const byCode = new Map(allCards.map((card) => [card.code, card]))

/**
 * A reprint can list only what differs from the card it duplicates.
 */
function resolved(card: PackCard): PackCard {
  const original = card.duplicate_of === undefined ? undefined : byCode.get(card.duplicate_of)
  return original === undefined ? card : { ...resolved(original), ...card }
}

/**
 * The first printing, which is where what's been said about a reprint elsewhere usually is.
 */
function originalOf(card: PackCard): PackCard {
  const original = card.duplicate_of === undefined ? undefined : byCode.get(card.duplicate_of)
  return original === undefined ? card : originalOf(original)
}

const output: Record<string, Record<string, string>> = {}
for (const card of allCards) {
  if (!reviewPacks.has(card.pack_code)) continue
  const full = resolved(card)
  if (full.faction_code === "mythos") continue
  const fields: Record<string, string> = {}
  for (const field of textFields) {
    const value = full[field]
    if (typeof value === "string" && value.length > 0) fields[field] = value
  }
  const original = originalOf(card)
  if (original.code !== card.code) fields.original = original.code
  output[card.code] = fields
}

const sorted = Object.fromEntries(Object.entries(output).sort(([a], [b]) => a.localeCompare(b)))
await Deno.mkdir(path.dirname(outputFile), { recursive: true })
await Deno.writeTextFile(outputFile, JSON.stringify(sorted, null, "\t") + "\n")
console.log(`Wrote text of ${Object.keys(sorted).length} cards to ${outputFile}`)
