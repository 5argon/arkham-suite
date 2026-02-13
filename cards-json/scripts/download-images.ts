import { AhdbCard } from "./interfaces.ts"
import { path, emptyDir } from "../mod.ts"
import { initialize } from "@imagemagick/deno"
import {
  pullsDirectory,
  pullsCard,
  pullsImagesTrue,
  makeCardImageDownloadUrl,
} from "./constants.ts"
import { fetchWithRetries } from "./fetch.ts"

const concurrentLimit = 110
initialize()

export async function downloadImages(cards: AhdbCard[]): Promise<void> {
  const pi = path.join(pullsDirectory, pullsCard)
  const truePath = path.join(pi, pullsImagesTrue)
  const trueEnglish = path.join(truePath, "en")
  await emptyDir(trueEnglish)
  for (let i = 0; i < cards.length; i += concurrentLimit) {
    const cardBatch = cards.slice(i, i + concurrentLimit)
    console.log(
      `Downloading images for cards ${i} to ${i + cardBatch.length} of total ${
        cards.length
      }`,
    )
    await Promise.all(cardBatch.map((x) => downloadSingleCard(x, trueEnglish)))
  }
}

async function downloadSingleCard(
  card: AhdbCard,
  truePath: string,
): Promise<void> {
  function backCodeExtract(c: AhdbCard): string {
    if (c.backimagesrc !== undefined) {
      const s = c.backimagesrc ?? ""
      const filename = s.match(/([\w\d_-]*)\.?[^\\/]*$/i)
      return filename?.[1] ?? ""
    } else if (c.back_link !== undefined) {
      return c.back_link
    } else {
      return c.code + "b"
    }
  }
  const regularFileName = card.code
  await downloadImageSingleCard(regularFileName, truePath)
  let backCode: string | null = null
  if (card.double_sided) {
    backCode = backCodeExtract(card)
    await downloadImageSingleCard(backCode, truePath)
  }
}

export async function downloadImageSingleCard(
  cardCode: string,
  destination: string,
): Promise<void> {
  const imagePath = makeCardImageDownloadUrl(cardCode)
  let imageResult: Response
  try {
    // console.log("Fetching : " + imagePath)
    imageResult = await fetchWithRetries(imagePath)
    if (imageResult.status !== 200) {
      console.log("Fetching failed for : " + imagePath)
      return
    }
    // console.log("Fetching done : " + imagePath)
  } catch {
    console.log("Fetching failed for : " + imagePath)
    return
  }
  // console.log("Download done : " + imagePath)
  const abuf = await imageResult.arrayBuffer()
  const writeTo = path.join(destination, cardCode + ".avif")
  // console.log("Writing to : " + writeTo)
  await Deno.writeFile(writeTo, new Uint8Array(abuf))
}

/**
 * Relative unit in 0.0 ~ 0.1
 */
export interface CropTarget {
  x: number
  y: number
  w: number
  h: number
}
