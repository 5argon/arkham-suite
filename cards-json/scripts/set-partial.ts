import { path } from "../mod.ts"

/**
 * Replaces the contents of `partial.json` with the union of all card codes
 * contained in one or more pack JSON files.
 *
 * Usage: deno run --allow-read --allow-write ./scripts/set-partial.ts <name> [<name> ...]
 *   where each <name> is a pack file like "core_2026.json".
 *
 * The script searches the `pack/` directory tree for a file whose basename
 * matches each <name> (case-insensitive). The `.json` suffix is optional.
 *
 * Codes are written as strings to preserve leading zeros and non-numeric
 * suffixes (e.g. "01000", "12179b").
 */

if (Deno.args.length === 0) {
  console.error("Usage: set-partial.ts <pack-file.json> [<pack-file.json> ...]")
  Deno.exit(1)
}

async function findPackFile(name: string): Promise<string | null> {
  const wanted = name.toLowerCase()
  for await (const sub of Deno.readDir("pack")) {
    if (!sub.isDirectory) continue
    const subDir = path.join("pack", sub.name)
    for await (const file of Deno.readDir(subDir)) {
      if (file.isFile && file.name.toLowerCase() === wanted) {
        return path.join(subDir, file.name)
      }
    }
  }
  return null
}

const codeSet = new Set<string>()

for (const arg of Deno.args) {
  const targetName = arg.toLowerCase().endsWith(".json") ? arg : `${arg}.json`
  const packPath = await findPackFile(targetName)
  if (!packPath) {
    console.error(`Could not find ${targetName} under pack/.`)
    Deno.exit(1)
  }

  const cards: { code: string }[] = JSON.parse(await Deno.readTextFile(packPath))
  let added = 0
  for (const card of cards) {
    if (typeof card.code !== "string") continue
    if (!codeSet.has(card.code)) {
      codeSet.add(card.code)
      added++
    }
  }
  console.log(`  ${packPath}: ${added} new code(s)`)
}

const codes = [...codeSet].sort()

await Deno.writeTextFile(
  "partial.json",
  JSON.stringify(codes, null, 4) + "\n",
)

console.log(`Wrote ${codes.length} code(s) to partial.json.`)
