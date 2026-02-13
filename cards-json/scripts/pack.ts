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

// Second pass: Resolve duplicate_of references
const resolvedCards: Card[] = []
for (const card of allCards) {
  if (card.duplicate_of) {
    // Get the target card
    const targetCard = cardMap.get(card.duplicate_of)
    
    if (targetCard) {
      // Create a new card by copying all fields from target, then overriding with current card's fields
      const resolvedCard = { ...targetCard, ...card }
      resolvedCards.push(resolvedCard)
      console.log(`Resolved ${card.code} as duplicate of ${card.duplicate_of}`)
    } else {
      console.warn(`Warning: duplicate_of target ${card.duplicate_of} not found for card ${card.code}`)
      resolvedCards.push(card)
    }
  } else {
    resolvedCards.push(card)
  }
}

console.log(`Resolved ${resolvedCards.length} cards`)

// Ensure output directory exists
const outputDir = path.join(pullsDirectory, pullsJson)
await Deno.mkdir(outputDir, { recursive: true })

// Write output
const outputPath = path.join(outputDir, pullsUtilsPlayerDatabase)
await Deno.writeTextFile(outputPath, JSON.stringify(resolvedCards))

console.log(`Wrote cards.json to ${outputPath}`)
console.log("DONE")
