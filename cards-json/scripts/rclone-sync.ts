import { path } from "../mod.ts"
import {
  pullsDirectory,
  pullsCard,
  pullsJson,
  pullsUtilsPlayerDatabase,
  pullsImagesFullp,
  pullsImagesFullSmall,
  pullsImagesSquare,
  pullsImagesSquareSmall,
  pullsImagesStrip,
} from "./constants.ts"

const destination = "r2ahlcg:arkham-card-images"
const partialCodes: number[] = JSON.parse(await Deno.readTextFile("partial.json"))
const cardDir = path.join(pullsDirectory, pullsCard)

async function runRclone(args: string[]): Promise<void> {
  console.log(`> rclone ${args.join(" ")}`)
  const cmd = new Deno.Command("rclone", {
    args,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  })
  const process = cmd.spawn()
  const status = await process.status
  if (!status.success) {
    throw new Error(`rclone failed with code ${status.code}`)
  }
}

if (partialCodes.length > 0) {
  console.log(`Partial mode: copying ${partialCodes.length} card code(s)...`)

  // Flat variants: files sit directly in the variant directory as {code}.avif
  const flatVariants = [pullsImagesSquare, pullsImagesSquareSmall, pullsImagesStrip]
  // Language variants: files are in {variant}/{lang}/{code}.avif subdirectories
  const langVariants = [pullsImagesFullp, pullsImagesFullSmall]

  for (const variant of flatVariants) {
    const src = path.join(cardDir, variant)
    const dst = `${destination}/${variant}`
    const args = ["copy", "-P", src, dst]
    for (const code of partialCodes) {
      args.push("--include", `/${code}.avif`)
      args.push("--include", `/${code}b.avif`)
    }
    console.log(`Copying ${variant}...`)
    await runRclone(args)
  }

  for (const variant of langVariants) {
    const src = path.join(cardDir, variant)
    const dst = `${destination}/${variant}`
    const args = ["copy", "-P", src, dst]
    for (const code of partialCodes) {
      args.push("--include", `${code}.avif`)
      args.push("--include", `${code}b.avif`)
    }
    console.log(`Copying ${variant}...`)
    await runRclone(args)
  }
} else {
  console.log("Full sync mode...")
  await runRclone(["sync", "-P", cardDir, destination])
}

// Always copy cards.json to the destination root (the sync removes it since it is not under pulls/card)
console.log("Copying cards.json to r2 destination...")
const cardsJsonSrc = path.join(pullsDirectory, pullsJson, pullsUtilsPlayerDatabase)
await runRclone(["copyto", cardsJsonSrc, `${destination}/cards.json`])

// Also copy cards.json locally to the starter package's static data folder
console.log("Copying cards.json to starter/src/lib/data/...")
const starterDataDir = path.join("..", "starter", "src", "lib", "data", pullsUtilsPlayerDatabase)
await Deno.copyFile(cardsJsonSrc, starterDataDir)

console.log("Done.")
