import { CompleteConfirmation } from "./confirmation.js"
import { Box, BoxId, Card, CardId } from "./interface.js"
import {
  OwnerList,
  SideDeckGroupTally,
  combineBoxBlueprints,
  listFromOwner,
  sideDeckGroupTallies,
} from "./list.js"
import { CompleteBox, CompleteOptions, completeLogic } from "./complete.js"
import {
  MoveResult,
  MoveResultItem,
  Recipe,
  combineMoveResultItems,
} from "./move-result.js"

/**
 * Internally maintained map to find out where the cards are per copy.
 * Box ID array has length equal to quantity of the card. Derived on demand from {@link BoxToCardMap}.
 */
export type CardToBoxMap = Map<CardId, BoxId[]>

/**
 * Internally maintained map of content of the box.
 * Card ID array is one per copy. If a box has no card, it is an empty array.
 */
export type BoxToCardMap = Map<BoxId, CardId[]>

/**
 * One physical move to perform: take one copy of {@link card} out of {@link fromBoxId} and put it in
 * {@link toBoxId}.
 */
interface PlannedMove {
  card: CardId
  fromBoxId: BoxId
  toBoxId: BoxId
}

/**
 * Plain serializable snapshot of an {@link Owner}. Produced by {@link Owner.toJSON} and consumed by
 * {@link Owner.fromJSON}, suitable for saving to and loading from a JSON file.
 */
export interface SerializedOwner {
  boxes: Box[]
  /**
   * The current working ("after") physical state, reflecting every planned operation.
   */
  boxToCards: [BoxId, CardId[]][]
  /**
   * The last confirmed ("before") physical state. Optional for backward compatibility; when missing,
   * the working state is treated as already confirmed (no pending recipe).
   */
  committedBoxToCards?: [BoxId, CardId[]][]
  substituteMap: [CardId, CardId[]][]
  sideDeckGroups: BoxId[][]
}

export class Owner {
  /**
   * Single source of physical truth for the working ("after") state, mutated by every operation:
   * each box mapped to its physical cards, one array element per copy.
   */
  private boxToCards: BoxToCardMap
  /**
   * The last confirmed ("before") physical state. The difference between this and {@link boxToCards}
   * is the pending {@link recipe} the player must physically perform. {@link confirm} accepts the
   * working state as the new committed state.
   */
  private committedBoxToCards: BoxToCardMap
  private boxes: Box[]
  private substituteMap: Map<CardId, CardId[]>
  /**
   * Flat side deck neighbor groups. Each group is a set of side decks that physically share cards.
   */
  private sideDeckGroups: BoxId[][]

  constructor() {
    this.boxToCards = new Map<BoxId, CardId[]>()
    this.committedBoxToCards = new Map<BoxId, CardId[]>()
    this.boxes = []
    this.substituteMap = new Map()
    this.sideDeckGroups = []
  }

  // ----- Private physical-state helpers (operate on the single source of truth) -----

  private static cloneBoxToCards(map: BoxToCardMap): BoxToCardMap {
    return new Map(Array.from(map, ([boxId, cards]) => [boxId, [...cards]]))
  }

  private cardsIn(boxId: BoxId): CardId[] {
    const cards = this.boxToCards.get(boxId)
    if (!cards) {
      throw new Error(`Box ID ${boxId} does not exist in boxToCardMap.`)
    }
    return cards
  }

  /**
   * Validate and apply a batch of moves atomically. Either every move succeeds, or none is applied
   * and the working state is left untouched (the error is thrown before any mutation). The returned
   * result is the combined incremental moves for just this batch.
   */
  private performMoves(moves: PlannedMove[]): MoveResult {
    const working = Owner.cloneBoxToCards(this.boxToCards)
    moves.forEach((move) => {
      const fromCards = working.get(move.fromBoxId)
      if (!fromCards) {
        throw new Error(`Box ID ${move.fromBoxId} does not exist in boxToCardMap.`)
      }
      const toCards = working.get(move.toBoxId)
      if (!toCards) {
        throw new Error(`Box ID ${move.toBoxId} does not exist in boxToCardMap.`)
      }
      const index = fromCards.indexOf(move.card)
      if (index === -1) {
        throw new Error(
          `Card ID ${move.card} not found in box ${move.fromBoxId}.`,
        )
      }
      fromCards.splice(index, 1)
      toCards.push(move.card)
    })
    this.boxToCards = working
    return {
      moveResults: combineMoveResultItems(
        moves.map((move) => ({
          card: move.card,
          fromBoxId: move.fromBoxId,
          toBoxId: move.toBoxId,
          quantity: 1,
        })),
      ),
    }
  }

  /**
   * Derive the per-copy card -> box index fresh from the canonical {@link boxToCards}.
   * The {@link complete} operation never mutates state, so a per-call snapshot can never drift.
   */
  private buildCardToBoxes(): CardToBoxMap {
    const cardToBoxes: CardToBoxMap = new Map()
    this.boxToCards.forEach((cardIds, boxId) => {
      cardIds.forEach((cardId) => {
        const locations = cardToBoxes.get(cardId) ?? []
        locations.push(boxId)
        cardToBoxes.set(cardId, locations)
      })
    })
    return cardToBoxes
  }

  private requireBox(boxId: BoxId): Box {
    const box = this.boxes.find((box) => box.id === boxId)
    if (!box) {
      throw new Error(`Box ID ${boxId} does not exist.`)
    }
    return box
  }

  // ----- Box management -----

  public createBox(newId: BoxId): void {
    const existing = this.boxes.find((box) => box.id === newId)
    if (existing) {
      throw new Error(`Box ID ${newId} already exists.`)
    }
    this.boxes.push({
      id: newId,
      blueprint: [],
    })
    this.boxToCards.set(newId, [])
    this.committedBoxToCards.set(newId, [])
  }

  public setBlueprint(boxId: BoxId, newBlueprint: Card[]) {
    const box = this.requireBox(boxId)
    box.blueprint = newBlueprint
  }

  /**
   * {@link boxId} is the ID of the box to mint physical cards equal to its blueprint.
   * All other boxes in the owner gets emptied.
   *
   * Minting establishes physical truth, so this also confirms the state: there is no pending recipe
   * immediately after initialize.
   */
  public initialize(boxId: BoxId) {
    const box = this.requireBox(boxId)
    this.cardsIn(boxId) // existence check in boxToCardMap
    this.boxToCards.forEach((_cardIds, currentBoxId) => {
      if (currentBoxId !== box.id) {
        this.boxToCards.set(currentBoxId, [])
      } else {
        // Expand the blueprint by quantity, one array element per physical copy.
        this.boxToCards.set(
          currentBoxId,
          box.blueprint.flatMap((card) =>
            Array.from<CardId>({ length: card.quantity }).fill(card.id),
          ),
        )
      }
    })
    this.committedBoxToCards = Owner.cloneBoxToCards(this.boxToCards)
  }

  /**
   *
   * @param boxId Box must be empty.
   */
  public deleteBox(boxId: BoxId): void {
    this.requireBox(boxId)
    const boxToCardsBox = this.cardsIn(boxId)
    if (boxToCardsBox.length > 0) {
      throw new Error(`Box ID ${boxId} is not empty.`)
    }
    this.boxes = this.boxes.filter((box) => box.id !== boxId)
    this.boxToCards.delete(boxId)
    this.committedBoxToCards.delete(boxId)
    this.sideDeckGroups = this.sideDeckGroups
      .map((group) => group.filter((id) => id !== boxId))
      .filter((group) => group.length > 0)
  }

  /**
   * You can implement a delete that also move cards to collection box by calling this then {@link deleteBox}, for example.
   * @param fromBoxId This box is emptied completely.
   * @param toBoxId All physical cards moved to this box.
   */
  public emptyBox(fromBoxId: BoxId, toBoxId: BoxId): MoveResult {
    this.requireBox(fromBoxId)
    this.requireBox(toBoxId)
    const moves: PlannedMove[] = this.cardsIn(fromBoxId).map((cardId) => ({
      card: cardId,
      fromBoxId: fromBoxId,
      toBoxId: toBoxId,
    }))
    return this.performMoves(moves)
  }

  /**
   * Move arbitrary cards from one box to another.
   * Error if can't find all copies of the requested cards in {@link fromBoxId}. No partial move is
   * applied when it errors.
   */
  public moveCards(
    fromBoxId: BoxId,
    toBoxId: BoxId,
    cards: Card[],
  ): MoveResult {
    this.requireBox(fromBoxId)
    this.requireBox(toBoxId)
    const moves: PlannedMove[] = []
    cards.forEach((card) => {
      for (let i = 0; i < card.quantity; i++) {
        moves.push({ card: card.id, fromBoxId: fromBoxId, toBoxId: toBoxId })
      }
    })
    return this.performMoves(moves)
  }

  public list(): OwnerList {
    return listFromOwner(this.boxes, this.boxToCards)
  }

  // ----- Recipe (before/after) workflow -----

  /**
   * The final, optimized set of physical transfers to get from the last confirmed ("before") state
   * to the current working ("after") state. Built by diffing the two states, so any back-and-forth
   * that cancels out is gone and only the net moves remain. Every move goes from a box that currently
   * holds the copies to one that needs them, so the player can perform them in any order and, starting
   * from a matching before-state, always reach the after-state.
   */
  public recipe(): Recipe {
    const before = this.committedBoxToCards
    const after = this.boxToCards

    const count = (map: BoxToCardMap, boxId: BoxId, cardId: CardId): number =>
      (map.get(boxId) ?? []).filter((c) => c === cardId).length

    const cardIds = new Set<CardId>()
    const boxIds = new Set<BoxId>()
    ;[before, after].forEach((map) => {
      map.forEach((cards, boxId) => {
        boxIds.add(boxId)
        cards.forEach((cardId) => cardIds.add(cardId))
      })
    })

    const items: MoveResultItem[] = []
    cardIds.forEach((cardId) => {
      const sources: { boxId: BoxId; qty: number }[] = []
      const sinks: { boxId: BoxId; qty: number }[] = []
      boxIds.forEach((boxId) => {
        const delta = count(after, boxId, cardId) - count(before, boxId, cardId)
        if (delta < 0) {
          sources.push({ boxId: boxId, qty: -delta })
        } else if (delta > 0) {
          sinks.push({ boxId: boxId, qty: delta })
        }
      })
      // Pair surplus boxes to deficit boxes. Totals are equal because moves conserve copies.
      let sourceIndex = 0
      sinks.forEach((sink) => {
        let need = sink.qty
        while (need > 0 && sourceIndex < sources.length) {
          const source = sources[sourceIndex]
          const take = Math.min(need, source.qty)
          items.push({
            card: cardId,
            fromBoxId: source.boxId,
            toBoxId: sink.boxId,
            quantity: take,
          })
          source.qty -= take
          need -= take
          if (source.qty === 0) {
            sourceIndex++
          }
        }
      })
    })

    return {
      moveResults: combineMoveResultItems(items),
    }
  }

  /**
   * Whether there is any pending physical transfer planned but not yet confirmed.
   */
  public hasPendingRecipe(): boolean {
    return this.recipe().moveResults.length > 0
  }

  /**
   * Accept the current working state as physically realized: the after-state becomes the new
   * confirmed before-state and the pending {@link recipe} becomes empty. Call this once the player
   * has physically performed the recipe.
   */
  public confirm(): void {
    this.committedBoxToCards = Owner.cloneBoxToCards(this.boxToCards)
  }

  /**
   * Discard the entire pending plan, restoring the working state back to the last confirmed state.
   */
  public revert(): void {
    this.boxToCards = Owner.cloneBoxToCards(this.committedBoxToCards)
  }

  // ----- Side deck neighbor groups -----

  /**
   * Flag a box as a side deck with no neighbors (a group of one). Equivalent to
   * {@link linkSideDecks} with a single box.
   */
  public markSideDeck(boxId: BoxId): void {
    this.linkSideDecks(boxId)
  }

  /**
   * Declare that these side deck boxes physically share cards. They form one neighbor group: when
   * completing any of them, the group only needs to physically hold the maximum single-deck demand
   * of each card, and a box may stay "correctly incomplete" backed by its neighbors.
   */
  public linkSideDecks(...boxIds: BoxId[]): void {
    boxIds.forEach((boxId) => this.requireBox(boxId))
    const set = new Set(boxIds)
    // Remove these boxes from any existing groups, then form a fresh group.
    this.sideDeckGroups = this.sideDeckGroups
      .map((group) => group.filter((id) => !set.has(id)))
      .filter((group) => group.length > 0)
    this.sideDeckGroups.push([...set])
  }

  /**
   * Tally each side deck group so the user can verify a deliberately-incomplete side deck holds the
   * right number of physical copies right now (the maximum single-deck demand, not the sum).
   */
  public sideDeckTallies(): SideDeckGroupTally[] {
    return sideDeckGroupTallies(this.boxes, this.boxToCards, this.sideDeckGroups)
  }

  // ----- Complete operation -----

  /**
   * Completes every specified boxes in order of {@link boxes} array.
   *
   * Adjust how the card moves on the returning object then call {@link executeComplete} to actually move the cards.
   *
   * Completing means missing cards are searched from other boxes, and excess cards are taken out, so their
   * physical content matches the blueprint exactly. Cards will not be searched among boxes that are to be completed.
   */
  public complete(
    boxes: CompleteBox[],
    options?: CompleteOptions,
  ): CompleteConfirmation {
    return completeLogic(
      boxes,
      this.buildCardToBoxes(),
      this.boxToCards,
      this.boxes,
      this.substituteMap,
      this.sideDeckGroups,
      options,
    )
  }

  /**
   * Apply a (possibly user-adjusted) confirmation. Validates the whole confirmation first; if any
   * chosen move is impossible the working state is left untouched and an error is thrown (no partial
   * application). Returns the combined incremental moves for this execution.
   */
  public executeComplete(confirmation: CompleteConfirmation): MoveResult {
    const { in: transferIns, out: transferOuts } = confirmation.transfers
    const moves: PlannedMove[] = []

    transferIns.forEach((transfer) => {
      if (transfer.chosenSource === null) {
        return
      }
      const source = transfer.sources.find((s) => s.id === transfer.chosenSource)
      if (!source) {
        throw new Error(
          `Chosen source ${transfer.chosenSource} not found in transfer ${transfer.id}.`,
        )
      }
      moves.push({
        card: source.card,
        fromBoxId: source.sourceBoxId,
        toBoxId: transfer.destinationBoxId,
      })
    })

    transferOuts.forEach((transfer) => {
      if (transfer.chosenDestination === null) {
        return
      }
      const destination = transfer.destinations.find(
        (d) => d.id === transfer.chosenDestination,
      )
      if (!destination) {
        throw new Error(
          `Chosen destination ${transfer.chosenDestination} not found in transfer ${transfer.id}.`,
        )
      }
      moves.push({
        card: transfer.card,
        fromBoxId: transfer.sourceBoxId,
        toBoxId: destination.destinationBoxId,
      })
    })

    return this.performMoves(moves)
  }

  /**
   * When combining, quantity of the same card adds up.
   */
  public getCombinedBlueprints(...boxIds: BoxId[]): Card[] {
    const boxes = boxIds.map((boxId) => this.requireBox(boxId))
    return combineBoxBlueprints(boxes)
  }

  /**
   * On {@link complete}, present all substitutes of what was in the blueprint as choices as well.
   */
  public addCompletionSubstituteMap(
    cardId: CardId,
    substituteIds: CardId[],
  ): void {
    this.substituteMap.set(cardId, substituteIds)
  }

  public clearCompletionSubstituteMap(): void {
    this.substituteMap.clear()
  }

  // ----- Serialization -----

  /**
   * Snapshot the entire owner state as a plain JSON-friendly object, suitable for saving to a file.
   * Includes both the working state and the confirmed state, so a pending recipe survives save/load.
   */
  public toJSON(): SerializedOwner {
    return {
      boxes: this.boxes.map((box) => ({
        id: box.id,
        blueprint: box.blueprint.map((card) => ({
          id: card.id,
          quantity: card.quantity,
        })),
      })),
      boxToCards: Array.from(this.boxToCards.entries()).map(([boxId, cards]) => [
        boxId,
        [...cards],
      ]),
      committedBoxToCards: Array.from(
        this.committedBoxToCards.entries(),
      ).map(([boxId, cards]) => [boxId, [...cards]]),
      substituteMap: Array.from(this.substituteMap.entries()).map(
        ([cardId, subs]) => [cardId, [...subs]],
      ),
      sideDeckGroups: this.sideDeckGroups.map((group) => [...group]),
    }
  }

  /**
   * Recreate an owner from a snapshot produced by {@link toJSON}.
   */
  public static fromJSON(serialized: SerializedOwner): Owner {
    const owner = new Owner()
    owner.boxes = serialized.boxes.map((box) => ({
      id: box.id,
      blueprint: box.blueprint.map((card) => ({
        id: card.id,
        quantity: card.quantity,
      })),
    }))
    owner.boxToCards = new Map(
      serialized.boxToCards.map(([boxId, cards]) => [boxId, [...cards]]),
    )
    // Backward compatible: without a saved committed state, treat the working state as confirmed.
    owner.committedBoxToCards = new Map(
      (serialized.committedBoxToCards ?? serialized.boxToCards).map(
        ([boxId, cards]) => [boxId, [...cards]],
      ),
    )
    owner.substituteMap = new Map(
      serialized.substituteMap.map(([cardId, subs]) => [cardId, [...subs]]),
    )
    owner.sideDeckGroups = serialized.sideDeckGroups.map((group) => [...group])
    return owner
  }
}
