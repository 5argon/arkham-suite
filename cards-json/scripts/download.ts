import { AhdbCard } from "./interfaces.ts"
import { path } from "../mod.ts"
import {
  pullsDirectory,
  pullsJson,
  pullsUtilsPlayerDatabase,
} from "./constants.ts"
import { downloadImages } from "./download-images.ts"

const partialCodes: string[] = JSON.parse(await Deno.readTextFile("partial.json"))

let playerCards: AhdbCard[] = JSON.parse(
  await Deno.readTextFile(
    path.join(pullsDirectory, pullsJson, pullsUtilsPlayerDatabase),
  ),
)

const isPartial = partialCodes.length > 0
if (isPartial) {
  const codeSet = new Set(partialCodes)
  playerCards = playerCards.filter((card) => codeSet.has(card.code))
  console.log(`Partial mode: downloading ${playerCards.length} card(s) from partial.json`)
}

console.log("Downloading player card images into pulls/true/en ...")
await downloadImages(playerCards, isPartial)
console.log("Finished downloading player card images.")
