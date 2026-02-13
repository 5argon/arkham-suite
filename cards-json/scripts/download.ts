import { AhdbCard } from "./interfaces.ts"
import { path } from "../mod.ts"
import {
  pullsDirectory,
  pullsJson,
  pullsUtilsPlayerDatabase,
} from "./constants.ts"
import { downloadImages } from "./download-images.ts"

const playerCards: AhdbCard[] = JSON.parse(
  await Deno.readTextFile(
    path.join(pullsDirectory, pullsJson, pullsUtilsPlayerDatabase),
  ),
)

console.log("Downloading player card images into pulls/true/en ...")
await downloadImages(playerCards)
console.log("Finished downloading player card images.")
