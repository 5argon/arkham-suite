/**
 * This was a script used to kickstart the `json/input/pack` folder.
 * Maybe I fix this later when TDC came out to add more to work with.
 */

import { expandGlob } from "https://deno.land/std/fs/mod.ts"
import { join } from "https://deno.land/std/path/mod.ts"

const aiFolder = "./ai"
const rawFolder = "./raw"
const processedFolder = "./processed"

const pluralToSingular = {
  ammo: "ammo",
  charges: "charge",
  secrets: "secret",
  supplies: "supply",
  resources: "resource",
}

const tagPatterns = [
  {
    pattern: /Uses \((\d+) (\w+)\)/g,
    tag: (match: string[]) => [
      `uses_starting_${match[1]}`,
      `uses_type_${
        pluralToSingular[match[2].toLowerCase()] || match[2].toLowerCase()
      }`,
    ],
  },
  { pattern: /Fast\./g, tag: () => ["fast_play"] },
  {
    pattern: /<b>(Fight|Evade|Investigate|Parley|Resign|Engage|Move)\.<\/b>/gi,
    tag: (match: string[]) => [`bold_${match[1].toLowerCase()}`],
  },
  {
    pattern: /\+(\d+) \[(willpower|combat|intellect|agility)\]/g,
    tag: (match: string[]) => [`boost_${match[2]}_${match[1]}`],
  },
  {
    pattern: /\[\[(?!Elite|Research)(.*?)\]\]/g,
    tag: (match: string[]) => [`trait_${match[1].toLowerCase()}`],
  },
  {
    pattern: /\+(\d+) damage/g,
    tag: (match: string[]) => [`damage_plus_${match[1]}`],
  },
  { pattern: /non-\[\[Elite\]\]/g, tag: () => ["elite_unusable"] },
  { pattern: /replenish/gi, tag: () => ["uses_replenish"] },
  { pattern: /Limit 1 per deck\./g, tag: () => ["limit_1_per_deck"] },
  {
    pattern: /Limit 1 .* per deck\./gi,
    tag: () => ["limit_1_per_deck"],
  },
  {
    pattern: /Limit 1 per investigator\./g,
    tag: () => ["limit_1_per_investigator"],
  },
  {
    pattern: /gain(s?) (\d+) resource(s?)/gi,
    tag: (match: string[]) => [`gain_resource_${match[2]}`],
  },
  {
    pattern: /\[action\]( \[action\])+/g,
    tag: () => ["cost_action_multiple"],
  },
  {
    pattern: /Max 1 committed per skill test\./g,
    tag: () => ["max_1_commit"],
  },
  {
    pattern: /draw(s?) (\d+) card(s?)/gi,
    tag: (match: string[]) => [`draw_player_${match[2]}`],
  },
  {
    pattern: /Max once per game/gi,
    tag: () => ["max_per_game_1"],
  },
  {
    pattern: /Max twice per game/gi,
    tag: () => ["max_per_game_2"],
  },
  {
    pattern: /Fast\. Play only during your turn\./gi,
    tag: () => ["timing_fast_during_your_turn"],
  },
  {
    pattern: /Fast\. Play during any \[free\] player window\./gi,
    tag: () => ["timing_fast_during_any_window"],
  },
  {
    pattern: /deck only\./gi,
    tag: () => ["deck_restriction"],
  },
  {
    pattern: /\[(skull|cultist|tablet|elder_thing|auto_fail|elder_sign|bless|curse)\]/gi,
    tag: (match: string[]) => [`chaos_reveal_token_${match[1].toLowerCase()}`],
  },
  {
    pattern: /Add your \[(combat|agility|willpower|intellect)\]/gi,
    tag: (match: string[]) => [`stat_add_${match[1].toLowerCase()}`],
  },
  {
    pattern: /\[action\].*?exhaust.*?:/gi,
    tag: () => ["cost_action_exhaust_self"],
  },
  {
    pattern: /\[reaction\].*?exhaust.*?:/gi,
    tag: () => ["cost_reaction_exhaust_self"],
  },
  {
    pattern: /\[free\].*?exhaust.*?:/gi,
    tag: () => ["cost_fast_exhaust_self"],
  },
  {
    pattern: /test \[(intellect|combat|agility|willpower)\] \((.)\)/gi,
    tag: (match: string[]) => [`initiate_test_${match[1].toLowerCase()}_${match[2].toLowerCase()}`],
  },
  {
    pattern: /succeed by (\d+)/gi,
    tag: (match: string[]) => [`succeed_by_${match[1]}`],
  },
  {
    pattern: /take (\d+) damage/gi,
    tag: () => ["take_damage"],
  },
  {
    pattern: /take (\d+) horror/gi,
    tag: () => ["take_horror"],
  },
  {
    pattern: /If .* has no .* discard it\./gi,
    tag: () => ["discard_zero_uses"],
  },
  {
    pattern: /Customizable\./gi,
    tag: () => ["customizable"],
  },
  {
    pattern: /not engaged with you/gi,
    tag: () => ["engage_not_with_you"],
  },
  {
    pattern: /engaged with you/gi,
    tag: () => ["engage_with_you"],
  },
]

async function processRawFile(filePath: string) {
  const content = await Deno.readTextFile(filePath)
  const rawCards = JSON.parse(content)
  
  // Convert raw format to ai format
  const aiCards = rawCards.map((card: any) => ({
    name: card.name,
    code: card.code,
    text: card.text,
    tags: [] // Initialize empty tags array
  }))

  // Write to ai folder with same filename
  const fileName = filePath.split("/").pop()!
  const aiFilePath = join(aiFolder, fileName)
  await Deno.writeTextFile(aiFilePath, JSON.stringify(aiCards, null, 2))
}

async function processAiFile(filePath: string) {
  const content = await Deno.readTextFile(filePath)
  const cards = JSON.parse(content)

  cards.forEach((card: any) => {
    if (
      card.tags !== undefined &&
      Array.isArray(card.tags) &&
      card.tags.length > 0
    ) {
      return
    }
    const text = card.text
    if (!text) return
    
    if (!Array.isArray(card.tags)) {
      card.tags = []
    }

    tagPatterns.forEach(({ pattern, tag }) => {
      const matches = [...text.matchAll(pattern)]
      matches.forEach((match) => {
        const tags = tag(match)
        // don't add duplicates
        for (const tag of tags) {
          if (!card.tags.includes(tag)) {
            card.tags.push(tag)
          }
        }
      })
    })
    card.tags = card.tags.sort((a, b) => {
      if (a.startsWith("fast_play") && !b.startsWith("fast_play")) return -1
      if (!a.startsWith("fast_play") && b.startsWith("fast_play")) return 1
      if (a.startsWith("uses_") && !b.startsWith("uses_")) return -1
      if (!a.startsWith("uses_") && b.startsWith("uses_")) return 1
      return a.localeCompare(b)
    })
  })

  const processedFilePath = join(processedFolder, filePath.split("/").pop()!)
  await Deno.writeTextFile(processedFilePath, JSON.stringify(cards, null, 2))
}

async function main() {
  // Process raw files first
  for await (const entry of expandGlob(`${rawFolder}/*.json`)) {
    if (entry.isFile) {
      await processRawFile(entry.path)
    }
  }

  // Then process ai files (including newly converted ones)
  for await (const entry of expandGlob(`${aiFolder}/*.json`)) {
    if (entry.isFile) {
      await processAiFile(entry.path)
    }
  }
}

main()