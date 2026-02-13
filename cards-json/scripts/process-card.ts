import { AhdbCard } from "./interfaces.ts"
import { emptyDir, path } from "../mod.ts"
import { decode, encode } from "@jsquash/avif"
import { encode as encodePng } from "@jsquash/png"
import { createCanvas } from "@deno/canvas"
import {
  ImageMagick,
  MagickFormat,
  initialize,
} from "@imagemagick/deno"
import { CropTarget } from "./download-images.ts"
import {
  pullsDirectory,
  pullsCard,
  pullsImagesTrue,
  pullsImagesFullSmall,
  pullsImagesFullp,
  pullsImagesSquare,
  pullsImagesSquareSmall,
  pullsImagesStrip,
} from "./constants.ts"
import { ensureDir } from "../mod.ts"

const concurrentLimit = 100

export async function processImages(
  cards: AhdbCard[],
  clean: boolean,
): Promise<void> {
  await initialize()
  const pi = path.join(pullsDirectory, pullsCard)
  await ensureDir(pi)
  const truePath = path.join(pi, pullsImagesTrue)
  const fullPath = path.join(pi, pullsImagesFullp)
  const fullSmallPath = path.join(pi, pullsImagesFullSmall)
  const squarePath = path.join(pi, pullsImagesSquare)
  const stripPath = path.join(pi, pullsImagesStrip)
  const squareSmallPath = path.join(pi, pullsImagesSquareSmall)
  if (clean) {
    await Promise.all([
      emptyDir(fullPath),
      emptyDir(fullSmallPath),
      emptyDir(squarePath),
      emptyDir(stripPath),
      emptyDir(squareSmallPath),
    ])
  } else {
    // Ensure directories exist when not cleaning
    await Promise.all([
      ensureDir(fullPath),
      ensureDir(fullSmallPath),
      ensureDir(squarePath),
      ensureDir(stripPath),
      ensureDir(squareSmallPath),
    ])
  }
  for (let i = 0; i < cards.length; i += concurrentLimit) {
    const cardBatch = cards.slice(i, i + concurrentLimit)
    console.log(
      `Processing images for cards ${i} to ${i + cardBatch.length} of ${
        cards.length
      }`,
    )
    await Promise.all(
      cardBatch.map((x) => {
        const frontPromise = processSingleCard(
          x.code,
          x.imagesrc,
          x.type_code,
          truePath,
          fullPath,
          squarePath,
          stripPath,
          squareSmallPath,
          fullSmallPath,
          false,
          clean,
        )
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
        let backPromise = Promise.resolve()
        let backCode: string | null = null
        // If card is truly linked to back, that back card will have its own entry (hidden on) and use the first
        // processing function.
        if (x.double_sided) {
          backCode = backCodeExtract(x)
          backPromise = processSingleCard(
            backCode,
            x.backimagesrc,
            x.type_code,
            truePath,
            fullPath,
            squarePath,
            stripPath,
            squareSmallPath,
            fullSmallPath,
            true,
            clean,
          )
        }
        return Promise.all([frontPromise, backPromise])
      }),
    )
  }
}

/**
 * Full card should already exist at full path, it decodes and crops into the other versions.
 */
export async function processSingleCard(
  cardCode: string,
  cardImageSrc: string | undefined,
  cardTypeCode: string,
  truePath: string,
  fullPath: string,
  squarePath: string,
  stripPath: string,
  squareSmallPath: string,
  fullSmallPath: string,
  back: boolean,
  clean: boolean,
): Promise<void> {
  // "en" is always used to make square, square-small, strip.
  const defaultLanguage = "en"
  
  // If not cleaning, check if all destination files already exist
  if (!clean) {
    const destFiles = [
      path.join(squarePath, cardCode + ".avif"),
      path.join(stripPath, cardCode + ".avif"),
      path.join(squareSmallPath, cardCode + ".avif"),
      path.join(fullPath, defaultLanguage, cardCode + ".avif"),
      path.join(fullSmallPath, defaultLanguage, cardCode + ".avif"),
    ]
    
    let allExist = true
    for (const filePath of destFiles) {
      try {
        const stat = await Deno.stat(filePath)
        if (!stat.isFile) {
          allExist = false
          break
        }
      } catch {
        allExist = false
        break
      }
    }
    
    if (allExist) {
      // console.log(`Skipping ${cardCode} - all destination files exist`)
      return
    }
  }
  
  const p = path.join(truePath, defaultLanguage, cardCode + ".avif")
  let read: Uint8Array
  try {
    read = await Deno.readFile(p)
  } catch {
    // If card does not have image, silently skipping.
    // It is possible that it was patched.
    if (cardImageSrc !== undefined) {
      console.log("Image not found in true folder " + cardCode)
    }
    return
  }
  let fullImageEnglish: ImageData
  try {
    fullImageEnglish = await decode(read)
  } catch {
    console.log("Error decoding image " + cardCode)
    return
  }
  let squareTarget: CropTarget | undefined
  let stripTarget: CropTarget | undefined
  switch (cardTypeCode) {
    case "investigator": {
      if (!back) {
        squareTarget = {
          x: 7 / 418,
          y: 56 / 300,
          w: 218 / 418,
          h: 218 / 300,
        }
        stripTarget = {
          x: 7 / 418,
          y: 80 / 300,
          w: 218 / 418,
          h: 72.7 / 300,
        }
      } else {
        squareTarget = {
          x: 37 / 1050,
          y: 51 / 733,
          w: 297 / 1050,
          h: 297 / 733,
        }
        stripTarget = {
          x: 20 / 1050,
          y: 93 / 733,
          w: 340 / 1050,
          h: 113.4 / 733,
        }
      }
      break
    }
    case "asset":
      squareTarget = {
        x: 131 / 606,
        y: 95.5 / 842,
        w: 336 / 606,
        h: 336 / 842,
      }
      stripTarget = {
        x: 83 / 606,
        y: 137.3 / 842,
        w: 446 / 606,
        h: 148.7 / 842,
      }
      break
    case "event":
      squareTarget = {
        x: 135 / 606,
        y: 58 / 842,
        w: 328 / 606,
        h: 328 / 842,
      }
      stripTarget = {
        x: 83 / 606,
        y: 168.3 / 842,
        w: 495 / 606,
        h: 165 / 842,
      }
      break
    case "skill":
      squareTarget = {
        x: 105 / 606,
        y: 116 / 842,
        w: 414 / 606,
        h: 414 / 842,
      }
      stripTarget = {
        x: 81 / 606,
        y: 159.7 / 842,
        w: 438 / 606,
        h: 146 / 842,
      }
      break
    case "treachery":
      squareTarget = {
        x: 143.5 / 606,
        y: 23 / 842,
        w: 311 / 606,
        h: 311 / 842,
      }
      stripTarget = {
        x: 143.5 / 606,
        y: 150 / 842,
        w: 311 / 606,
        h: 103.7 / 842,
      }
      break
    case "enemy":
      squareTarget = {
        x: 169.5 / 606,
        y: 541 / 842,
        w: 259 / 606,
        h: 259 / 842,
      }
      stripTarget = {
        x: 14 / 606,
        y: 555 / 842,
        w: 578 / 606,
        h: 192.7 / 842,
      }
      break
    case "location":
      squareTarget = {
        x: 223.5 / 750,
        y: 163 / 1050,
        w: 303 / 750,
        h: 303 / 1050,
      }
      stripTarget = {
        x: 140 / 750,
        y: 227 / 1050,
        w: 470 / 750,
        h: 156.7 / 1050,
      }
      break
    case "story":
      squareTarget = {
        x: 169.5 / 606,
        y: 541 / 842,
        w: 259 / 606,
        h: 259 / 842,
      }
      stripTarget = {
        x: 14 / 606,
        y: 555 / 842,
        w: 578 / 606,
        h: 192.7 / 842,
      }
      break
    case "scenario": {
      squareTarget = {
        x: 333.5 / 750,
        y: 104 / 1050,
        w: 83 / 750,
        h: 83 / 1050,
      }
      stripTarget = {
        x: 278 / 750,
        y: 113.3 / 1050,
        w: 194 / 750,
        h: 64.7 / 1050,
      }
      break
    }
    case "act": {
      if (!back) {
        squareTarget = {
          x: 668 / 1050,
          y: 199 / 750,
          w: 352 / 1050,
          h: 352 / 750,
        }
        stripTarget = {
          x: 668 / 1050,
          y: 316.3 / 750,
          w: 352 / 1050,
          h: 117.4 / 750,
        }
      } else {
        squareTarget = {
          x: 9 / 1050,
          y: 41 / 750,
          w: 168 / 1050,
          h: 168 / 750,
        }
        stripTarget = {
          x: 9 / 1050,
          y: 46 / 750,
          w: 168 / 1050,
          h: 56 / 750,
        }
      }
      break
    }
    case "agenda": {
      if (!back) {
        squareTarget = {
          x: 31 / 1050,
          y: 199 / 750,
          w: 352 / 1050,
          h: 352 / 750,
        }
        stripTarget = {
          x: 31 / 1050,
          y: 316.3 / 750,
          w: 352 / 1050,
          h: 117.4 / 750,
        }
      } else {
        squareTarget = {
          x: 9 / 1050,
          y: 41 / 750,
          w: 168 / 1050,
          h: 168 / 750,
        }
        stripTarget = {
          x: 9 / 1050,
          y: 46 / 750,
          w: 168 / 1050,
          h: 56 / 750,
        }
      }
      break
    }
    case "key": {
      squareTarget = {
        x: 195 / 750,
        y: 137 / 1050,
        w: 360 / 750,
        h: 360 / 1050,
      }
      stripTarget = {
        x: 93 / 750,
        y: 223 / 1050,
        w: 564 / 750,
        h: 188 / 1050,
      }
      break
    }
    case "enemy_location": {
      squareTarget = {
        x: 184.4 / 716,
        y: 216.4 / 1030,
        w: 347.2 / 716,
        h: 347.2 / 1030,
      }
      stripTarget = {
        x: 37 / 716,
        y: 283 / 1030,
        w: 642 / 716,
        h: 214 / 1030,
      }
      break
    }
    case "upgrade":
      squareTarget = {
        x: 169.5 / 425,
        y: 12 / 600,
        w: 86 / 425,
        h: 86 / 600,
      }
      stripTarget = {
        x: 166 / 425,
        y: 568.5 / 600,
        w: 93 / 425,
        h: 31 / 600,
      }
      break
    default:
      break
  }

  function cropImageData(image: ImageData, target: CropTarget): ImageData {
    const croppedWidth = Math.floor(image.width * target.w)
    const croppedHeight = Math.floor(image.height * target.h)
    const cropStartX = Math.floor(image.width * target.x)
    const cropStartY = Math.floor(image.height * target.y)
    const canvas = createCanvas(image.width, image.height)
    const ctx = canvas.getContext("2d")
    try {
      ctx.putImageData(image, 0, 0)
    } catch (e) {
      console.log("Error putting image data of " + cardCode)
      console.log(e)
      // Continue with a blank image.
    }
    const croppedImageData = ctx.getImageData(
      cropStartX,
      cropStartY,
      croppedWidth,
      croppedHeight,
    )
    canvas.dispose()
    return new ImageData(croppedImageData.data, croppedWidth, croppedHeight)
  }

  async function createAvifBufferWithResize(
    image: ImageData,
    keepAspectRatio: boolean,
    width?: number,
    height?: number,
  ): Promise<Uint8Array> {
    let resizedWidth: number
    let resizedHeight: number

    // Figure out width and height with keepAspectRatio option
    if (keepAspectRatio) {
      if (width !== undefined && height !== undefined) {
        // "Contain" strategy, ensuring both sides not exceeding specified size, also keeping ratio.
        const widthRatio = width / image.width
        const heightRatio = height / image.height
        if (widthRatio < heightRatio) {
          resizedWidth = width
          resizedHeight = Math.floor(widthRatio * image.height)
        } else {
          resizedWidth = Math.floor(heightRatio * image.width)
          resizedHeight = height
        }
      } else if (width !== undefined) {
        resizedWidth = width
        resizedHeight = Math.floor((width / image.width) * image.height)
      } else if (height !== undefined) {
        resizedWidth = Math.floor((height / image.height) * image.width)
        resizedHeight = height
      } else {
        throw new Error("Either width or height must be provided.")
      }
    } else {
      if (width === undefined || height === undefined) {
        throw new Error(
          "Both width and height must be provided if not keeping aspect ratio.",
        )
      }
      resizedWidth = width
      resizedHeight = height
    }

    // Resize with good interpolation with imagemagick
    const pngBuffer = await encodePng(image)
    const pngByteArray = new Uint8Array(pngBuffer)
    const resizedImageData = ImageMagick.read(pngByteArray, (image) => {
      image.resize(resizedWidth, resizedHeight)
      return image.write(MagickFormat.Rgba, (buffer) => {
        return new ImageData(
          new Uint8ClampedArray(buffer),
          image.width,
          image.height,
        )
      })
    })

    // TODO: Push the size smaller with quality settings.
    const avif = await encode(resizedImageData, {})
    return new Uint8Array(avif)
  }

  let squarePromise = Promise.resolve()
  let stripPromise = Promise.resolve()
  let squareSmallPromise = Promise.resolve()
  if (squareTarget !== undefined && stripTarget !== undefined) {
    const square = await cropImageData(fullImageEnglish, squareTarget)
    const strip = await cropImageData(fullImageEnglish, stripTarget)
    const squareSmall = await cropImageData(fullImageEnglish, squareTarget)
    const p1 = path.join(squarePath, cardCode + ".avif")
    const p2 = path.join(stripPath, cardCode + ".avif")
    const p3 = path.join(squareSmallPath, cardCode + ".avif")
    squarePromise = Deno.writeFile(
      p1,
      await createAvifBufferWithResize(square, false, 128, 128),
    )
    stripPromise = Deno.writeFile(
      p2,
      await createAvifBufferWithResize(strip, false, 96, 32),
    )
    squareSmallPromise = Deno.writeFile(
      p3,
      await createAvifBufferWithResize(squareSmall, false, 32, 32),
    )
  }

  async function makeFullAndFullSmallOfLanguage(lang: string) {
    let fullImage: ImageData
    if (lang === defaultLanguage) {
      fullImage = fullImageEnglish
    } else {
      const p = path.join(truePath, lang, cardCode + ".avif")
      let read: Uint8Array
      try {
        read = await Deno.readFile(p)
        console.log("Alternate language image found " + p)
        try {
          fullImage = await decode(read)
        } catch {
          console.log("Error decoding image " + cardCode)
          return
        }
      } catch {
        // console.log("Image of card " + card.code + " not found in " + lang)
        return
      }
    }

    await ensureDir(path.join(fullPath, lang))
    await ensureDir(path.join(fullSmallPath, lang))

    const fullSmallJoinedPath = path.join(
      fullSmallPath,
      lang,
      cardCode + ".avif",
    )
    const fullJoinedPath = path.join(fullPath, lang, cardCode + ".avif")
    const fullEncode = new Uint8Array(fullImage.data.buffer)

    const fullSmallPromise = Deno.writeFile(
      fullSmallJoinedPath,
      await createAvifBufferWithResize(fullImage, true, 256, 256),
    )
    let resizedFull = fullEncode
    resizedFull = await createAvifBufferWithResize(fullImage, true, 640, 640)
    const fullPromise = Deno.writeFile(fullJoinedPath, resizedFull)
    await Promise.all([fullSmallPromise, fullPromise])
  }

  const fullFullSmallEnglishPromise =
    makeFullAndFullSmallOfLanguage(defaultLanguage)

  // Look inside `true/[language]` if this card has other language images.
  // If found, make full and full-small of that language.
  // List directories in `true` directory.
  const fullFullSmallOtherLanguagesPromise: Promise<void>[] = []
  for await (const dirEntry of Deno.readDir(truePath)) {
    if (dirEntry.isDirectory && dirEntry.name !== defaultLanguage) {
      fullFullSmallOtherLanguagesPromise.push(
        makeFullAndFullSmallOfLanguage(dirEntry.name),
      )
    }
  }

  await Promise.all([
    fullFullSmallEnglishPromise,
    ...fullFullSmallOtherLanguagesPromise,
    squarePromise,
    stripPromise,
    squareSmallPromise,
  ])
}
