import { path } from "../mod.ts"
import { pullsDirectory, pullsJson, pullsUtilsPlayerDatabase } from "./constants.ts"

interface Card {
  code: string
  duplicate_of?: string
  [key: string]: any
}

console.log("Merging pack JSONs into cards.json...")

// Collect all JSON files from pack folder recursively
const packDirectory = "pack"
const allCards: Card[] = []

async function collectJsonFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  
  for await (const entry of Deno.readDir(dir)) {
    const fullPath = path.join(dir, entry.name)
    
    if (entry.isDirectory) {
      const subFiles = await collectJsonFiles(fullPath)
      files.push(...subFiles)
    } else if (entry.isFile && entry.name.endsWith('.json')) {
      files.push(fullPath)
    }
  }
  
  return files
}

// Read all JSON files and collect cards
const jsonFiles = await collectJsonFiles(packDirectory)
console.log(`Found ${jsonFiles.length} JSON files`)

for (const file of jsonFiles) {
  const content = await Deno.readTextFile(file)
  const cards = JSON.parse(content) as Card[]
  allCards.push(...cards)
}

console.log(`Loaded ${allCards.length} cards`)

// First pass: Create a map of all cards by code
const cardMap = new Map<string, Card>()
for (const card of allCards) {
  cardMap.set(card.code, card)
}

// Second pass: Resolve duplicate_of references (following chains)
function resolveDuplicate(card: Card): Card {
  if (!card.duplicate_of) return card

  const chain: string[] = [card.code]
  let current: Card = card
  const visited = new Set<string>([card.code])

  while (current.duplicate_of) {
    const nextCode = current.duplicate_of
    if (visited.has(nextCode)) {
      console.warn(`Warning: cycle detected resolving duplicate_of for ${card.code}: ${[...chain, nextCode].join(" -> ")}`)
      break
    }
    const next = cardMap.get(nextCode)
    if (!next) {
      console.warn(`Warning: duplicate_of target ${nextCode} not found for card ${current.code}`)
      break
    }
    visited.add(nextCode)
    chain.push(nextCode)
    current = next
  }

  // Merge from the deepest target outward, so closer overrides win
  let resolved: Card = { ...current }
  for (let i = chain.length - 2; i >= 0; i--) {
    const code = chain[i]
    const c = cardMap.get(code)
    if (c) resolved = { ...resolved, ...c }
  }
  console.log(`Resolved ${card.code} via chain ${chain.join(" -> ")}`)
  return resolved
}

const resolvedCards: Card[] = allCards.map(resolveDuplicate)

console.log(`Resolved ${resolvedCards.length} cards`)

// Ensure output directory exists
const outputDir = path.join(pullsDirectory, pullsJson)
await Deno.mkdir(outputDir, { recursive: true })

// Write output
const outputPath = path.join(outputDir, pullsUtilsPlayerDatabase)
await Deno.writeTextFile(outputPath, JSON.stringify(resolvedCards))

console.log(`Wrote cards.json to ${outputPath}`)
console.log("DONE")
