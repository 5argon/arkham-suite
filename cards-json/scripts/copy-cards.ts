import { path } from "../mod.ts"
import { pullsDirectory, pullsJson, pullsUtilsPlayerDatabase } from "./constants.ts"

// Copies the processed cards.json into the local consumer packages' static data folders.
// Kept separate from `sync` (rclone) so it can run quickly without the lengthy image upload.
const cardsJsonSrc = path.join(pullsDirectory, pullsJson, pullsUtilsPlayerDatabase)

const localTargets = [
  path.join("..", "starter", "src", "lib", "data", pullsUtilsPlayerDatabase),
  path.join("..", "life", "src", "lib", "data", pullsUtilsPlayerDatabase),
]

for (const target of localTargets) {
  console.log(`Copying cards.json to ${target}...`)
  await Deno.copyFile(cardsJsonSrc, target)
}

console.log("Done.")
