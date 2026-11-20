import { path } from "../mod.ts"
import { aliasesFile, findUpstream, PreviewCard, readAliases, readPreviewCards } from "./preview.ts"

/**
 * Hands preview cards over to the community's data once the `pack` folder has them.
 *
 * Run from `cards-json` after replacing `pack` with upstream's. Without `--write` it only reports:
 * which preview cards the community has now, under which code, and every field that differs from
 * what was typed in from the preview. With `--write` it also:
 *
 * - removes those cards from `preview/` and their images from `patch/`,
 * - for a card whose code changed, records the old code in `preview/aliases.json` and replaces it
 *   everywhere in the folders below, renaming folders named after it.
 *
 * Usage: deno run --allow-read --allow-write ./scripts/reconcile-preview.ts [--write]
 */

const write = Deno.args.includes("--write")

/**
 * Where card codes are written by hand, relative to `cards-json`.
 */
const referenceRoots = [
  "../starter/src/lib/starter-content",
  "../starter/src/lib/md",
  "../tags",
  "../life/src/lib",
]
const referenceExtensions = new Set([".json", ".md", ".ts", ".svelte", ".yaml", ".yml"])
const skippedFolders = new Set(["node_modules", ".svelte-kit", "dist", "build", "paraglide"])

const compared = [
  "name", "subname", "pack_code", "faction_code", "faction2_code", "faction3_code", "type_code",
  "cost", "xp", "traits", "text", "flavor", "slot", "health", "sanity", "skill_willpower",
  "skill_intellect", "skill_combat", "skill_agility", "skill_wild", "is_unique", "permanent",
  "quantity", "deck_limit", "illustrator",
]

async function collectJsonFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  for await (const entry of Deno.readDir(dir)) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory) files.push(...await collectJsonFiles(fullPath))
    else if (entry.isFile && entry.name.endsWith(".json")) files.push(fullPath)
  }
  return files
}

const upstream: PreviewCard[] = []
for (const file of await collectJsonFiles("pack")) {
  upstream.push(...JSON.parse(await Deno.readTextFile(file)) as PreviewCard[])
}

const renames = new Map<string, string>()
let waiting = 0
for (const { file, cards } of await readPreviewCards()) {
  const kept: PreviewCard[] = []
  for (const card of cards) {
    const match = findUpstream(card, upstream)
    if (match === undefined) {
      waiting++
      kept.push(card)
      continue
    }
    const codeNote = match.code === card.code ? "same code" : `code ${card.code} -> ${match.code}`
    console.log(`\n${card.name}: ${codeNote}`)
    for (const field of compared) {
      const ours = JSON.stringify(card[field] ?? null)
      const theirs = JSON.stringify(match[field] ?? null)
      if (ours !== theirs) console.log(`  ${field}\n    preview:   ${ours}\n    community: ${theirs}`)
    }
    if (match.code !== card.code) renames.set(card.code, match.code)
    if (write) await removePatchImages(card.code)
  }
  if (write && kept.length !== cards.length) {
    if (kept.length === 0) await Deno.remove(file)
    else await Deno.writeTextFile(file, JSON.stringify(kept, null, "\t") + "\n")
    console.log(`\n${file}: ${cards.length - kept.length} handed over, ${kept.length} left`)
  }
}

console.log(`\n${waiting} preview card(s) not in the community's data yet.`)
if (renames.size > 0) console.log(`${renames.size} code(s) changed.`)

if (!write) {
  console.log("Nothing written. Run again with --write once the differences above look right.")
  Deno.exit(0)
}

if (renames.size > 0) {
  const aliases = await readAliases()
  for (const [from, to] of renames) aliases[from] = to
  // An earlier alias pointing at a code that just changed follows it.
  for (const [from, to] of Object.entries(aliases)) aliases[from] = renames.get(to) ?? to
  const sorted = Object.fromEntries(Object.entries(aliases).sort(([a], [b]) => a.localeCompare(b)))
  await Deno.writeTextFile(aliasesFile, JSON.stringify(sorted, null, "\t") + "\n")
  for (const root of referenceRoots) await replaceCodes(root, renames)
}

async function removePatchImages(code: string) {
  for await (const language of Deno.readDir("patch")) {
    if (!language.isDirectory) continue
    for await (const file of Deno.readDir(path.join("patch", language.name))) {
      if (file.isFile && path.basename(file.name, path.extname(file.name)) === code) {
        await Deno.remove(path.join("patch", language.name, file.name))
      }
    }
  }
}

/**
 * Codes are 5 digits with an optional letter, so a code not touching other digits or letters is a
 * reference to that card.
 */
function codePattern(codes: Iterable<string>): RegExp {
  return new RegExp(`(?<![0-9A-Za-z])(${[...codes].join("|")})(?![0-9A-Za-z])`, "g")
}

async function replaceCodes(dir: string, renames: Map<string, string>) {
  const pattern = codePattern(renames.keys())
  let entries: Deno.DirEntry[]
  try {
    entries = [...Deno.readDirSync(dir)]
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) return
    throw e
  }
  for (const entry of entries) {
    let fullPath = path.join(dir, entry.name)
    if (entry.isDirectory) {
      if (skippedFolders.has(entry.name) || entry.name.startsWith(".")) continue
      const renamed = renames.get(entry.name)
      if (renamed !== undefined) {
        const target = path.join(dir, renamed)
        await Deno.rename(fullPath, target)
        console.log(`Renamed ${fullPath} -> ${target}`)
        fullPath = target
      }
      await replaceCodes(fullPath, renames)
    } else if (entry.isFile && referenceExtensions.has(path.extname(entry.name))) {
      const text = await Deno.readTextFile(fullPath)
      const replaced = text.replace(pattern, (code) => renames.get(code) ?? code)
      if (replaced !== text) {
        await Deno.writeTextFile(fullPath, replaced)
        console.log(`Updated codes in ${fullPath}`)
      }
    }
  }
}
