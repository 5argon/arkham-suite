import { ensureDir, path } from "../mod.ts"
import {
  pullsDirectory,
  pullsCard,
  pullsImagesTrue,
  patchDirectory,
  pullsJson,
  pullsUtilsPlayerDatabase,
} from "./constants.ts"
import { decode as decodeAvif, encode as encodeAvif } from "@jsquash/avif"
import { decode as decodeJpeg } from "@jsquash/jpeg"
import { decode as decodePng } from "@jsquash/png"
import { decode as decodeWebp } from "@jsquash/webp"
import { manualEdit } from "./manual-edit.ts"
import { AhdbCard } from "./interfaces.ts"

/**
 * Copy images from `patch/[language]/code.[jpg/jpeg/png/webp/avif]` to `pulls/card/true/[language]/code.[avif]`.
 * Then make a valid.json.
 */

/**
 * Source can be jpg, jpeg, png, webp, or avif.
 * Destination is always avif.
 */
async function patch(sourcePathWithExtension: string, destLanguage: string) {
  const sourcePath = path.join(patchDirectory, sourcePathWithExtension)
  const destPath = path.join(
    pullsDirectory,
    pullsCard,
    pullsImagesTrue,
    destLanguage,
  )
  const destPathAvif = path.join(
    destPath,
    path.basename(sourcePath, path.extname(sourcePath)) + ".avif",
  )
  // If destination file already exists, skip.
  try {
    const fileInfo = await Deno.stat(destPathAvif)
    if (fileInfo.isFile) {
      // console.log(`Skipping ${sourcePathWithExtension} to ${destPathAvif}`)
      return
    }
  } catch {
    // File does not exist.
  }

  const sourceExtension = path.extname(sourcePath).slice(1)
  console.log("Patching " + sourcePathWithExtension)
  const source = await Deno.readFile(sourcePath)
  let imageData: ImageData
  if (sourceExtension === "avif") {
    imageData = await decodeAvif(source)
  } else if (sourceExtension === "jpg" || sourceExtension === "jpeg") {
    imageData = await decodeJpeg(source)
  } else if (sourceExtension === "png") {
    try {
      imageData = await decodePng(source)
    } catch (e) {
      console.log("Error decoding png", sourcePathWithExtension)
      return
    }
  } else if (sourceExtension === "webp") {
    try {
      imageData = await decodeWebp(source)
    } catch (e) {
      console.log("Error decoding webp", sourcePathWithExtension)
      return
    }
  } else {
    throw new Error(`Unsupported source extension: ${sourceExtension}`)
  }
  const destAvif = await encodeAvif(imageData)
  await ensureDir(destPath)
  await Deno.writeFile(destPathAvif, new Uint8Array(destAvif))
  console.log(`Patched ${sourcePathWithExtension} to ${destPathAvif}`)
}

const patchFolder = path.join(patchDirectory)
// Iterate through all languages.
for await (const dir of Deno.readDir(patchFolder)) {
  if (!dir.isDirectory) {
    continue
  }
  const language = dir.name
  const languageFolder = path.join(patchFolder, language)
  const patchPromises = []
  for await (const file of Deno.readDir(languageFolder)) {
    if (!file.isFile) {
      continue
    }
    if (
      ![".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(
        path.extname(file.name),
      )
    ) {
      continue
    }
    patchPromises.push(patch(path.join(language, file.name), language))
  }
  await Promise.all(patchPromises)
}

// Apply manual edits to cards.json
console.log("Applying manual edits to cards.json...")
const playerdbPath = path.join(pullsDirectory, pullsJson, pullsUtilsPlayerDatabase)
const playerdbContent = await Deno.readTextFile(playerdbPath)
const playerdb = JSON.parse(playerdbContent) as AhdbCard[]
manualEdit(playerdb)

// Reduce JSON size by clearing text fields (keep only important keywords)
console.log("Clearing text fields to reduce JSON size...")
const importantKeywords = ["Fast.", "Reward.", "Advanced.", "Researched."]
const extractKeywords = (text: string | undefined) => {
  if (!text) return ""
  const found = importantKeywords.filter(keyword => text.includes(keyword))
  return found.join(" ")
}

for (const card of playerdb) {
  card.text = extractKeywords(card.text)
  card.flavor = extractKeywords(card.flavor)
  if ((card as any).back_text !== undefined) {
    (card as any).back_text = extractKeywords((card as any).back_text)
  }
  if ((card as any).back_flavor !== undefined) {
    (card as any).back_flavor = extractKeywords((card as any).back_flavor)
  }
}

await Deno.writeTextFile(playerdbPath, JSON.stringify(playerdb))
console.log("Applied manual edits to cards.json")
