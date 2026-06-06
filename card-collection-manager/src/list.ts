import { CardId, Card, BoxId, Box } from "./interface.js"
import { BoxToCardMap } from "./owner.js"

/**
 * This entire interface should be enough to make all the UI that display current state of owner,
 * arranged logically. (owner -> box groups -> boxes -> cards / required cards)
 */
export interface OwnerList {
  boxes: ListBox[]
}

export type CombinedBlueprints = Card[]

export interface ListBox {
  id: BoxId

  /**
   * Each item you can make a UI such as : Card Name (physical quantity / blueprint quantity)
   * It is possible that physical quantity is higher than blueprint quantity.
   * It is also possible that blueprint quantity is 0.
   */
  cards: ListBoxCard[]
}

export interface ListBoxCard {
  id: CardId
  physicalQuantity: number
  blueprintQuantity: number

  /**
   * Might be defined when physical quantity is not enough for blueprint,
   * but there are other free cards (blueprint 0, physical 1+) in this box that are used as substitute.
   * Each item is one quantity.
   */
  substitutes?: CardId[]
}

/**
 * Tally of a side deck neighbor group. Because side decks share physical cards, the group only needs
 * to physically hold the maximum single-deck demand of each card (not the sum). This lets the user
 * verify that a deliberately-incomplete side deck is "correctly incomplete".
 */
export interface SideDeckGroupTally {
  boxIds: BoxId[]
  cards: SideDeckGroupTallyCard[]
}

export interface SideDeckGroupTallyCard {
  id: CardId

  /**
   * How many physical copies the whole group should hold right now: the maximum blueprint quantity
   * of this card across the boxes in the group.
   */
  expectedPhysical: number

  /**
   * How many physical copies the group actually holds right now, summed across all boxes in the group.
   */
  actualPhysical: number
}

export function combineBoxBlueprints(boxes: Box[]): Card[] {
  const combined: Card[] = boxes.reduce<Card[]>((acc, box) => {
    box.blueprint.forEach((card) => {
      const existingCard = acc.find(
        (existingCard) => existingCard.id === card.id,
      )
      if (existingCard) {
        existingCard.quantity += card.quantity
      } else {
        acc.push({ id: card.id, quantity: card.quantity })
      }
    })
    return acc
  }, [])
  return combined
}

export function listFromOwner(
  boxes: Box[],
  boxToCardsMap: BoxToCardMap,
): OwnerList {
  const listBoxes: ListBox[] = []
  boxes.forEach((box) => {
    const cardToListBoxCardMap = new Map<CardId, ListBoxCard>()
    const cardsInBox = boxToCardsMap.get(box.id) || []
    cardsInBox.forEach((cardId) => {
      let listBoxCard = cardToListBoxCardMap.get(cardId)
      if (!listBoxCard) {
        listBoxCard = {
          id: cardId,
          physicalQuantity: 0,
          blueprintQuantity: 0,
        }
        cardToListBoxCardMap.set(cardId, listBoxCard)
      }
      listBoxCard.physicalQuantity += 1
    })
    box.blueprint.forEach((card) => {
      let listBoxCard = cardToListBoxCardMap.get(card.id)
      if (!listBoxCard) {
        listBoxCard = {
          id: card.id,
          physicalQuantity: 0,
          blueprintQuantity: 0,
        }
        cardToListBoxCardMap.set(card.id, listBoxCard)
      }
      listBoxCard.blueprintQuantity += card.quantity
    })
    listBoxes.push({
      id: box.id,
      cards: Array.from(cardToListBoxCardMap.values()),
    })
  })
  return {
    boxes: listBoxes,
  }
}

/**
 * Compute the "correctly incomplete" tally for each side deck neighbor group.
 * For each card, `expectedPhysical` is the maximum blueprint quantity across the group's boxes,
 * and `actualPhysical` is the total physical copies currently held across the group.
 */
export function sideDeckGroupTallies(
  boxes: Box[],
  boxToCardsMap: BoxToCardMap,
  sideDeckGroups: BoxId[][],
): SideDeckGroupTally[] {
  return sideDeckGroups.map((groupBoxIds) => {
    const expected = new Map<CardId, number>()
    const actual = new Map<CardId, number>()
    groupBoxIds.forEach((boxId) => {
      const box = boxes.find((b) => b.id === boxId)
      box?.blueprint.forEach((card) => {
        expected.set(
          card.id,
          Math.max(expected.get(card.id) ?? 0, card.quantity),
        )
      })
      const physical = boxToCardsMap.get(boxId) ?? []
      physical.forEach((cardId) => {
        actual.set(cardId, (actual.get(cardId) ?? 0) + 1)
      })
    })
    const cardIds = new Set<CardId>([...expected.keys(), ...actual.keys()])
    const cards: SideDeckGroupTallyCard[] = Array.from(cardIds).map(
      (cardId) => ({
        id: cardId,
        expectedPhysical: expected.get(cardId) ?? 0,
        actualPhysical: actual.get(cardId) ?? 0,
      }),
    )
    return {
      boxIds: [...groupBoxIds],
      cards: cards,
    }
  })
}
