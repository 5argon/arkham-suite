import { BoxId, CardId } from "./interface.js"

/**
 * When user performs many operations in a row, user might haven't actually move physical cards yet.
 * It is helpful if UI could combine all the moves performed automatically and show it to user to follow.
 * Combine them with {@link combineMoveResults}.
 */
export interface MoveResult {
  moveResults: MoveResultItem[]
}

/**
 * The final optimized list of physical transfers to perform. Same shape as {@link MoveResult}; named
 * separately to convey it is the netted before -> after plan, not an incremental move log.
 */
export type Recipe = MoveResult

export interface MoveResultItem {
  card: CardId
  fromBoxId: BoxId
  toBoxId: BoxId

  /**
   * You can always use quantity 1 and add multiple into the result array,
   * then later use the combine command to tally up the quantities.
   */
  quantity: number
}

/**
 * When combining, move can cancel out each other or add up quantities. Those are all processed with this method.
 */
export function combineMoveResults(moveResults: MoveResult[]): MoveResult {
  return {
    moveResults: combineMoveResultItems(
      moveResults.flatMap((result) => result.moveResults),
    ),
  }
}

const SEP = " "
function edgeKey(card: CardId, fromBoxId: BoxId, toBoxId: BoxId): string {
  return `${card}${SEP}${fromBoxId}${SEP}${toBoxId}`
}

/**
 * Combine move items that share the same (card, from, to) by summing quantity, and cancel out
 * opposing moves of the same card (A->B against B->A). Self-moves and zero-quantity results
 * are dropped from the output.
 *
 * Invariant maintained while building: for a given card, only one of the two opposing directions
 * between a pair of boxes is ever present in the accumulator at a time.
 */
export function combineMoveResultItems(
  moveResultItems: MoveResultItem[],
): MoveResultItem[] {
  const net = new Map<string, MoveResultItem>()

  const addForward = (
    card: CardId,
    fromBoxId: BoxId,
    toBoxId: BoxId,
    quantity: number,
  ): void => {
    const key = edgeKey(card, fromBoxId, toBoxId)
    const existing = net.get(key)
    if (existing) {
      existing.quantity += quantity
    } else {
      net.set(key, { card: card, fromBoxId: fromBoxId, toBoxId: toBoxId, quantity: quantity })
    }
  }

  for (const item of moveResultItems) {
    if (item.quantity === 0) {
      continue
    }
    if (item.fromBoxId === item.toBoxId) {
      // A move that ends where it started is a no-op.
      continue
    }
    const reverseKey = edgeKey(item.card, item.toBoxId, item.fromBoxId)
    const reverse = net.get(reverseKey)
    if (reverse) {
      if (reverse.quantity > item.quantity) {
        reverse.quantity -= item.quantity
      } else if (reverse.quantity === item.quantity) {
        net.delete(reverseKey)
      } else {
        // Incoming move is larger: cancel the reverse entirely and keep the remainder forward.
        const remainder = item.quantity - reverse.quantity
        net.delete(reverseKey)
        addForward(item.card, item.fromBoxId, item.toBoxId, remainder)
      }
    } else {
      addForward(item.card, item.fromBoxId, item.toBoxId, item.quantity)
    }
  }

  return Array.from(net.values()).filter((item) => item.quantity > 0)
}
