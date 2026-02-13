export const inputDirectory = "input"
export const pullsDirectory = "pulls"
export const patchDirectory = "patch"
export const transformDirectory = "transform"

export const pullsCards = "cards"
export const pullsDecks = "decks"
export const pullsCard = "card"
export const pullsJson = "json"

export const pullsImagesTrue = "true"
export const pullsImagesFullp = "full"
export const pullsImagesFullSmall = "full-small"
export const pullsImagesSquare = "square"
export const pullsImagesStrip = "strip"
export const pullsImagesSquareSmall = "square-small"

export const pullsUtilsPopupDatabase = "popupdb.json"
export const pullsUtilsPlayerDatabase = "cards.json"
export const pullsUtilsTaboo = "taboos.json"
export const pullsUtilsValid = "valid.json"
export const pullsUtilsCampaignDatabase = "campaign.json"

export const baseUrl = "https://arkhamdb.com/"
export const publicApiCard = "/api/public/card/"
export const publicApiCards = "/api/public/cards/"
export const publicApiDecklist = "/api/public/decklist/"
export const publicApiPacks = "/api/public/packs/"
export const publicApiTaboos = "/api/public/taboos/"

export function makeCardImageDownloadUrl(code: string): string {
  return `https://assets.arkham.build/optimized/${code}.avif`
}
