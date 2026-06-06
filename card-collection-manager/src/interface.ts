export type BoxId = string
export type CardId = string

export interface Card {
  id: CardId
  quantity: number
}

export interface Box {
  id: BoxId
  blueprint: Card[]
}

export interface Insufficient {
  cardId: string
  copiesRequired: number
  copiesOwned: number
  ownedCopylocations: BoxId[]
}
