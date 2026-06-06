import {
  CompleteConfirmation,
  ConfirmationSet,
  TransferChoiceId,
  TransferId,
  TransferIn,
  TransferOut,
} from "./confirmation.js"
import { Box, BoxId, CardId, Insufficient } from "./interface.js"
import { BoxToCardMap, CardToBoxMap } from "./owner.js"

export interface CompleteOptions {
  /**
   * Prevent pulling any cards from these boxes when completing.
   */
  lockBoxes: BoxId[]
}

export interface CompleteBox {
  /**
   * Box to complete.
   */
  boxId: BoxId

  /**
   * If a card needs to be removed from {@link boxId}, they move to this box by default.
   * User can use the confirmation object to change destination among {@link removeOptions}.
   */
  removeTo: BoxId

  /**
   * Additional allowed destinations for excess cards, presented as choices on each outgoing transfer
   * (for example each deck's side deck). {@link removeTo} is always the first / pre-selected choice.
   */
  removeOptions?: BoxId[]

  /**
   * If a card needs to be added to {@link boxId}, search candidates from these boxes in order before
   * searching other boxes.
   */
  addPriorities?: BoxId[]
}

/**
 * One place a card can be pulled from: a (box, card) pair that holds at least one physical copy.
 * A box with several copies of a card is still a single option, but can back several transfers up to
 * its quantity. This is why `sources.length` reflects distinct source boxes, not physical copies.
 */
interface SourceOption {
  choiceId: TransferChoiceId
  card: CardId
  boxId: BoxId
  /**
   * Physical copies in the box at the start of the operation (constant).
   */
  physicalQty: number
  /**
   * Copies of this option not yet reserved by a transfer in this operation.
   */
  availableQty: number
  /**
   * The transfer that most recently reserved a copy from this option, or `null` if none has.
   */
  currentlySelectedBy: TransferId | null
}

/**
 * Shared mutable state threaded through every box completion so reservations and id counters
 * are global across the whole complete operation.
 */
interface CompleteContext {
  options: SourceOption[]
  optionById: Map<TransferChoiceId, SourceOption>
  completeBoxIds: Set<BoxId>
  lockBoxIds: Set<BoxId>
  ownerBoxes: Box[]
  boxToCardMap: BoxToCardMap
  substituteMap: Map<CardId, CardId[]>
  sideDeckGroups: BoxId[][]
  defaultBoxRank: Map<BoxId, number>
  /**
   * Per side deck group, how many copies of a card we have already planned to pull in this
   * complete operation (keyed `${groupIndex} ${cardId}`). Avoids double-pulling for the group
   * when several of its boxes are completed in one call.
   */
  groupPlanned: Map<string, number>
  nextTransferId: () => TransferId
  nextChoiceId: () => TransferChoiceId
}

export function completeLogic(
  completeBoxes: CompleteBox[],
  _cardToBoxMap: CardToBoxMap,
  boxToCardMap: BoxToCardMap,
  ownerBoxes: Box[],
  substituteMap: Map<CardId, CardId[]>,
  sideDeckGroups: BoxId[][],
  options: CompleteOptions | undefined,
): CompleteConfirmation {
  const completeBoxIds = new Set(completeBoxes.map((cb) => cb.boxId))
  const lockBoxIds = new Set(options?.lockBoxes ?? [])

  // Validate up front so an unknown box id fails before any work.
  completeBoxes.forEach((completeBox) => {
    if (!ownerBoxes.some((box) => box.id === completeBox.boxId)) {
      throw new Error(`Box to complete ${completeBox.boxId} not found`)
    }
  })

  let transferCounter = 0
  let choiceCounter = 0
  const context: CompleteContext = {
    options: [],
    optionById: new Map(),
    completeBoxIds: completeBoxIds,
    lockBoxIds: lockBoxIds,
    ownerBoxes: ownerBoxes,
    boxToCardMap: boxToCardMap,
    substituteMap: substituteMap,
    sideDeckGroups: sideDeckGroups,
    defaultBoxRank: new Map(ownerBoxes.map((box, index) => [box.id, index])),
    groupPlanned: new Map(),
    nextTransferId: () => transferCounter++,
    nextChoiceId: () => choiceCounter++,
  }

  // A candidate box is any box that is not being completed and not locked. Build one global set of
  // (box, card) source options from those boxes; reservations deplete availability across all boxes.
  ownerBoxes.forEach((box) => {
    if (completeBoxIds.has(box.id) || lockBoxIds.has(box.id)) {
      return
    }
    const counts = new Map<CardId, number>()
    ;(boxToCardMap.get(box.id) ?? []).forEach((cardId) => {
      counts.set(cardId, (counts.get(cardId) ?? 0) + 1)
    })
    counts.forEach((qty, cardId) => {
      const option: SourceOption = {
        choiceId: context.nextChoiceId(),
        card: cardId,
        boxId: box.id,
        physicalQty: qty,
        availableQty: qty,
        currentlySelectedBy: null,
      }
      context.options.push(option)
      context.optionById.set(option.choiceId, option)
    })
  })

  const running: ConfirmationSet = {
    insufficients: [],
    transferIns: [],
    transferOuts: [],
  }
  completeBoxes.forEach((completeBox) => {
    const additional = completeOneBox(completeBox, context)
    running.insufficients.push(...additional.insufficients)
    running.transferIns.push(...additional.transferIns)
    running.transferOuts.push(...additional.transferOuts)
  })

  // Normalize: each exposed source's `currentlySelectedBy` reflects the final global reservation,
  // even for transfers built before that option was reserved by a later transfer.
  running.transferIns.forEach((transfer) => {
    transfer.sources.forEach((source) => {
      source.currentlySelectedBy =
        context.optionById.get(source.id)?.currentlySelectedBy ?? null
    })
  })

  return new CompleteConfirmation(
    running.transferIns,
    running.transferOuts,
    running.insufficients,
  )
}

function acceptableCardsOf(
  cardId: CardId,
  substituteMap: Map<CardId, CardId[]>,
): CardId[] {
  return [cardId, ...(substituteMap.get(cardId) ?? [])]
}

function countInBox(
  boxToCardMap: BoxToCardMap,
  boxId: BoxId,
  cardId: CardId,
): number {
  return (boxToCardMap.get(boxId) ?? []).filter((c) => c === cardId).length
}

function groupOf(
  boxId: BoxId,
  sideDeckGroups: BoxId[][],
): { index: number; boxIds: BoxId[] } | undefined {
  const index = sideDeckGroups.findIndex((group) => group.includes(boxId))
  if (index === -1) {
    return undefined
  }
  return { index: index, boxIds: sideDeckGroups[index] }
}

/**
 * Cards are not moved yet, but later box that gets complete will have to respect those that earlier
 * boxes already taken (via shared reservations in {@link CompleteContext}). Returned confirmation set
 * is only the new entries for one box to be completed.
 */
function completeOneBox(
  completeBox: CompleteBox,
  context: CompleteContext,
): ConfirmationSet {
  const insufficients: Insufficient[] = []
  const transferIns: TransferIn[] = []
  const transferOuts: TransferOut[] = []
  const boxToComplete = context.ownerBoxes.find(
    (box) => box.id === completeBox.boxId,
  )
  if (boxToComplete === undefined) {
    throw new Error("Box to complete not found")
  }

  const sideGroup = groupOf(completeBox.boxId, context.sideDeckGroups)

  // Boxes we are allowed to pull from for THIS box. Side deck completion never pulls from its own
  // neighbor group (those copies are the shared backing already counted toward the group).
  const isCandidateSource = (boxId: BoxId): boolean => {
    if (context.completeBoxIds.has(boxId) || context.lockBoxIds.has(boxId)) {
      return false
    }
    if (sideGroup && sideGroup.boxIds.includes(boxId)) {
      return false
    }
    return true
  }

  const boxRank = (boxId: BoxId): number => {
    const priorities = completeBox.addPriorities ?? []
    const priorityIndex = priorities.indexOf(boxId)
    if (priorityIndex !== -1) {
      return priorityIndex
    }
    return priorities.length + (context.defaultBoxRank.get(boxId) ?? 0)
  }

  // ----- ADD side: bring each blueprint card up to the required quantity -----
  boxToComplete.blueprint.forEach((blueprintCard) => {
    const acceptable = acceptableCardsOf(blueprintCard.id, context.substituteMap)
    const cardRank = new Map<CardId, number>(
      acceptable.map((c, index) => [c, index]),
    )

    let needed: number
    let current: number
    if (sideGroup) {
      // The group only needs to physically hold the maximum single-deck demand of this card.
      needed = maxGroupDemand(
        blueprintCard.id,
        sideGroup.boxIds,
        context.ownerBoxes,
      )
      const physicalInGroup = sideGroup.boxIds.reduce(
        (sum, boxId) =>
          sum + countInBox(context.boxToCardMap, boxId, blueprintCard.id),
        0,
      )
      const planKey = `${sideGroup.index} ${blueprintCard.id}`
      current = physicalInGroup + (context.groupPlanned.get(planKey) ?? 0)
    } else {
      // Substitute copies physically already in this box count toward the requirement so we do
      // not pull duplicates of them.
      current = acceptable.reduce(
        (sum, c) =>
          sum + countInBox(context.boxToCardMap, completeBox.boxId, c),
        0,
      )
      needed = blueprintCard.quantity
    }

    const missing = Math.max(0, needed - current)

    // Candidate source options (exact first, then substitutes), ordered by box priority then default.
    const candidates = context.options
      .filter(
        (option) =>
          isCandidateSource(option.boxId) && acceptable.includes(option.card),
      )
      .sort((a, b) => {
        const boxDiff = boxRank(a.boxId) - boxRank(b.boxId)
        if (boxDiff !== 0) {
          return boxDiff
        }
        const cardDiff =
          (cardRank.get(a.card) ?? 0) - (cardRank.get(b.card) ?? 0)
        if (cardDiff !== 0) {
          return cardDiff
        }
        return a.choiceId - b.choiceId
      })

    let unsatisfied = 0
    for (let copyIndex = 0; copyIndex < missing; copyIndex++) {
      const transferId = context.nextTransferId()
      const sources = candidates.map((option) => ({
        id: option.choiceId,
        card: option.card,
        sourceBoxId: option.boxId,
        currentlySelectedBy: option.currentlySelectedBy,
      }))
      const transfer: TransferIn = {
        id: transferId,
        destinationBoxId: completeBox.boxId,
        chosenSource: null,
        sources: sources,
      }
      const pick = candidates.find((option) => option.availableQty > 0)
      if (pick) {
        pick.availableQty -= 1
        pick.currentlySelectedBy = transferId
        transfer.chosenSource = pick.choiceId
        if (sideGroup) {
          const planKey = `${sideGroup.index} ${blueprintCard.id}`
          context.groupPlanned.set(
            planKey,
            (context.groupPlanned.get(planKey) ?? 0) + 1,
          )
        }
      } else {
        unsatisfied++
      }
      transferIns.push(transfer)
    }

    if (unsatisfied > 0) {
      const acceptableOptions = context.options.filter(
        (option) =>
          isCandidateSource(option.boxId) && acceptable.includes(option.card),
      )
      const ownedOutside = acceptableOptions.reduce(
        (sum, option) => sum + option.physicalQty,
        0,
      )
      const ownedLocations = new Set<BoxId>(
        acceptableOptions.map((option) => option.boxId),
      )
      if (!sideGroup && current > 0) {
        ownedLocations.add(completeBox.boxId)
      }
      insufficients.push({
        cardId: blueprintCard.id,
        copiesRequired: needed,
        copiesOwned: current + ownedOutside,
        ownedCopylocations: Array.from(ownedLocations),
      })
    }
  })

  // ----- REMOVE side: eject excess physical copies to removeTo (or another allowed destination) -----
  const removeDestinations = Array.from(
    new Set<BoxId>([completeBox.removeTo, ...(completeBox.removeOptions ?? [])]),
  )
  const physicalCards = context.boxToCardMap.get(completeBox.boxId) ?? []
  const distinctCards = Array.from(new Set(physicalCards))
  distinctCards.forEach((cardId) => {
    const physical = countInBox(context.boxToCardMap, completeBox.boxId, cardId)
    let excess: number
    if (sideGroup) {
      // The group should hold at most the maximum single-deck demand; anything beyond, that
      // physically sits in this box, is excess.
      const maxDemand = maxGroupDemand(
        cardId,
        sideGroup.boxIds,
        context.ownerBoxes,
      )
      const physicalInGroup = sideGroup.boxIds.reduce(
        (sum, boxId) => sum + countInBox(context.boxToCardMap, boxId, cardId),
        0,
      )
      const groupExcess = Math.max(0, physicalInGroup - maxDemand)
      excess = Math.min(groupExcess, physical)
    } else {
      const allowed = blueprintAllowanceFor(
        cardId,
        boxToComplete.blueprint,
        context.substituteMap,
      )
      excess = Math.max(0, physical - allowed)
    }
    for (let i = 0; i < excess; i++) {
      const destinations = removeDestinations.map((destinationBoxId) => ({
        id: context.nextChoiceId(),
        destinationBoxId: destinationBoxId,
      }))
      transferOuts.push({
        id: context.nextTransferId(),
        card: cardId,
        sourceBoxId: completeBox.boxId,
        destinationBoxId: completeBox.removeTo,
        // The first destination is removeTo, pre-selected.
        chosenDestination: destinations[0].id,
        destinations: destinations,
      })
    }
  })

  return { insufficients: insufficients, transferIns: transferIns, transferOuts: transferOuts }
}

/**
 * The maximum blueprint quantity of a card across the boxes of a side deck group. Side decks share
 * physical cards, so the group only needs to hold the largest single request, not the sum.
 */
function maxGroupDemand(
  cardId: CardId,
  groupBoxIds: BoxId[],
  ownerBoxes: Box[],
): number {
  return groupBoxIds.reduce((max, boxId) => {
    const box = ownerBoxes.find((b) => b.id === boxId)
    const q = box?.blueprint.find((c) => c.id === cardId)?.quantity
    return Math.max(max, q ?? 0)
  }, 0)
}

/**
 * How many physical copies of {@link cardId} the blueprint permits to stay in the box.
 * A card counts toward a blueprint entry if it is that exact card, or a substitute of it; but here
 * we only need the allowance for THIS card id, so we count the blueprint demand it can satisfy.
 */
function blueprintAllowanceFor(
  cardId: CardId,
  blueprint: { id: CardId; quantity: number }[],
  substituteMap: Map<CardId, CardId[]>,
): number {
  const exact = blueprint.find((c) => c.id === cardId)?.quantity ?? 0
  if (exact > 0) {
    return exact
  }
  // Otherwise this card may be a substitute that fills some other blueprint card's demand.
  let asSubstitute = 0
  blueprint.forEach((blueprintCard) => {
    const subs = substituteMap.get(blueprintCard.id) ?? []
    if (subs.includes(cardId)) {
      asSubstitute = Math.max(asSubstitute, blueprintCard.quantity)
    }
  })
  return asSubstitute
}
