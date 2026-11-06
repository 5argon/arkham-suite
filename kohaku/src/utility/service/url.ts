export const arkhamdbBaseUrl = 'https://arkhamdb.com';
export const arkhamBuildBaseUrl = 'https://arkham.build';
const arkhamdbApiPublic: string[] = [arkhamdbBaseUrl, 'api', 'public'];
export const arkhamdbApiOneCard = [...arkhamdbApiPublic, 'card'];
export const arkhamdbApiAllCards = [...arkhamdbApiPublic, 'cards'];
export const arkhamdbApiPublishedDeck = [...arkhamdbApiPublic, 'decklist'];
export const arkhamdbApiPublicDeck = [...arkhamdbApiPublic, 'deck'];
export const arkhamdbApiPacks = [...arkhamdbApiPublic, 'packs'];
export const arkhamdbApiTaboos = [...arkhamdbApiPublic, 'taboos'];

export const arkhamdbUrlPublishedDeck = [arkhamdbBaseUrl, 'decklist', 'view'];
export const arkhamdbUrlPublicDeck = [arkhamdbBaseUrl, 'deck', 'view'];
export const arkhamdbUrlCard = [arkhamdbBaseUrl, 'card'];

const arkhamBuildApiPublic = ['https://api.arkham.build/v1/public'];
export const arkhamBuildApiShare = [...arkhamBuildApiPublic, 'share'];
export const arkhamBuildApiAdditionalMetadata = [...arkhamBuildApiPublic, 'additional_metadata'];
export const arkhamBuildUrlShare = [arkhamBuildBaseUrl, 'share'];
export const arkhamBuildUrlView = [arkhamBuildBaseUrl, 'deck', 'view'];
export const arkhamBuildUrlCard = [arkhamBuildBaseUrl, 'card'];

function joinPath(...s: string[]): string {
  return s.join('/');
}

export function createArkhamDbCardUrl(cardId: string): string {
  return joinPath(...arkhamdbApiOneCard, cardId);
}

/**
 * Reviews on ArkhamDB stay on the printing they were written on, so give it the original printing.
 */
export function createArkhamDbCardReviewsBrowserUrl(cardCode: string): string {
  return `${joinPath(...arkhamdbUrlCard, cardCode)}#reviews-header`;
}

export function createArkhamDbPacksUrl(): string {
  return joinPath(...arkhamdbApiPacks);
}

export function createArkhamDbTaboosUrl(): string {
  return joinPath(...arkhamdbApiTaboos);
}

export function createArkhamBuildShareUrl(deckId: string | number): string {
  const stringDeckId = typeof deckId === 'number' ? deckId.toString() : deckId;
  return joinPath(...arkhamBuildApiShare, stringDeckId);
}

export function createArkhamBuildAdditionalMetadataUrl(amk: string): string {
  return joinPath(...arkhamBuildApiAdditionalMetadata, amk);
}

export function createArkhamDbPublishedDeckUrl(deckId: string | number): string {
  const stringDeckId = typeof deckId === 'number' ? deckId.toString() : deckId;
  return joinPath(...arkhamdbApiPublishedDeck, stringDeckId);
}

export function createArkhamDbPublicDeckUrl(deckId: string | number): string {
  const stringDeckId = typeof deckId === 'number' ? deckId.toString() : deckId;
  return joinPath(...arkhamdbApiPublicDeck, stringDeckId);
}

export function createArkhamDbPublishedDeckBrowserUrl(deckId: string | number): string {
  const stringDeckId = typeof deckId === 'number' ? deckId.toString() : deckId;
  return joinPath(...arkhamdbUrlPublishedDeck, stringDeckId);
}

export function createArkhamDbPublicDeckBrowserUrl(deckId: string | number): string {
  const stringDeckId = typeof deckId === 'number' ? deckId.toString() : deckId;
  return joinPath(...arkhamdbUrlPublicDeck, stringDeckId);
}

export function createArkhamBuildShareBrowserUrl(deckId: string | number): string {
  const stringDeckId = typeof deckId === 'number' ? deckId.toString() : deckId;
  return joinPath(...arkhamBuildUrlShare, stringDeckId);
}

export function createArkhamBuildCardBrowserUrl(cardCode: string): string {
  return joinPath(...arkhamBuildUrlCard, cardCode);
}

export function createArkhamBuildViewBrowserUrl(deckId: string | number): string {
  const stringDeckId = typeof deckId === 'number' ? deckId.toString() : deckId;
  return joinPath(...arkhamBuildUrlView, stringDeckId);
}
