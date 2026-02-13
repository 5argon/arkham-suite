import { AhdbCard } from "./interfaces.ts"
import { path } from "../mod.ts"
import {
  pullsDirectory,
  pullsJson,
  pullsUtilsPlayerDatabase,
} from "./constants.ts"
import { processImages } from "./process-card.ts"

/**
 * Works completely on whats in the `pulls/card/true/[language]` directory.
 * All languages gets their processed form in `full/[language]` and `full-small/[language]` directory.
 * The `en` language gets transformed into language-agnostic `square`, `square-small`, `strip`.
 * Finally writes a `valid.json` file.
 */

const args = Deno.args
const cleanFlagIndex = args.indexOf("-c")
const clean = cleanFlagIndex !== -1

if (clean) {
  args.splice(cleanFlagIndex, 1)
}

let playerCards: AhdbCard[] = JSON.parse(
  await Deno.readTextFile(
    path.join(pullsDirectory, pullsJson, pullsUtilsPlayerDatabase),
  ),
)

if (args.length > 0) {
  const cardCodes = new Set(args)
  playerCards = playerCards.filter((card) => cardCodes.has(card.code))
}

await processImages(playerCards, clean)
