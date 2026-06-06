import { BoxId, CardId, Insufficient } from "./interface.js"

export type TransferId = number
export type TransferChoiceId = number

export interface ExecuteCompleteOptions {
  /**
   * After execution the blueprint is not completely satisfied, but still there is no conflict.
   */
  allowNullSource?: boolean
}

export interface Transfers {
  in: TransferIn[]
  out: TransferOut[]
}

/**
 * Each required card movement that is required to perform the complete operation.
 * One copy of card and one destination per one transfer. You can choose from available sources.
 */
export interface TransferIn {
  /**
   * Used to change the choice of this transfer.
   */
  id: TransferId
  destinationBoxId: BoxId

  /**
   * Completing the confirmation while this is `null` results in this transfer not doing anything.
   */
  chosenSource: TransferChoiceId | null

  /**
   * Each copy choose a different source choices from this array.
   */
  sources: TransferSource[]
}

export interface TransferSource {
  id: TransferChoiceId

  /**
   * Possible to be a different card than requested if this choice represent substituted card.
   */
  card: CardId

  sourceBoxId: BoxId

  /**
   * Corresponds to transfer that is currently selected this source choice.
   * `null` if it is not selected by any transfer.
   */
  currentlySelectedBy: TransferId | null
}

export interface TransferOut {
  /**
   * Used to change the choice of this transfer.
   */
  id: TransferId

  /**
   * The card that needs to go out to somewhere to complete.
   */
  card: CardId

  /**
   * The box this excess copy currently sits in (the box being completed). Needed to know
   * where the copy leaves from when executing.
   */
  sourceBoxId: BoxId

  destinationBoxId: BoxId

  /**
   * Completing the confirmation while this is `null` results in this transfer not doing anything.
   */
  chosenDestination: TransferChoiceId | null

  /**
   * Each copy choose a different source choices from this array.
   */
  destinations: TransferDestination[]
}

export interface TransferDestination {
  id: TransferChoiceId
  destinationBoxId: BoxId
}

export interface ConfirmationSet {
  insufficients: Insufficient[]
  transferIns: TransferIn[]
  transferOuts: TransferOut[]
}

/**
 * An object that provide assistant for user to fine tune the complete operation
 * and resolve conflicts step by step with appropriate feedbacks and state changes.
 */
export class CompleteConfirmation {
  private internalInsufficients: Insufficient[]
  private internalTransferIns: TransferIn[]
  private internalTransferOuts: TransferOut[]
  constructor(
    transferIns: TransferIn[],
    transferOuts: TransferOut[],
    insufficients: Insufficient[],
  ) {
    this.internalInsufficients = insufficients
    this.internalTransferIns = transferIns
    this.internalTransferOuts = transferOuts
  }

  /**
   * List all card movements that are required to perform the complete operation.
   */
  public get transfers(): Transfers {
    // Deep copy transfers so user can't change them from outside.
    const transferInsCopy: TransferIn[] = this.internalTransferIns.map(
      (transfer) => {
        const sourcesCopy: TransferSource[] = transfer.sources.map((source) => {
          return {
            id: source.id,
            card: source.card,
            sourceBoxId: source.sourceBoxId,
            currentlySelectedBy: source.currentlySelectedBy,
          }
        })
        return {
          id: transfer.id,
          destinationBoxId: transfer.destinationBoxId,
          chosenSource: transfer.chosenSource,
          sources: sourcesCopy,
        }
      },
    )
    const transferOutsCopy: TransferOut[] = this.internalTransferOuts.map(
      (transfer) => {
        const destinationsCopy: TransferDestination[] =
          transfer.destinations.map((destination) => {
            return {
              id: destination.id,
              destinationBoxId: destination.destinationBoxId,
            }
          })
        return {
          id: transfer.id,
          card: transfer.card,
          sourceBoxId: transfer.sourceBoxId,
          destinationBoxId: transfer.destinationBoxId,
          chosenDestination: transfer.chosenDestination,
          destinations: destinationsCopy,
        }
      },
    )
    return {
      in: transferInsCopy,
      out: transferOutsCopy,
    }
  }

  /**
   * If there are any entries returned, it is impossible to resolve the transfer conflicts
   * because there is not enough cards that blueprint required, even after accounting for substitutes.
   */
  public get insufficients(): Insufficient[] {
    const insufficientsCopy: Insufficient[] = this.internalInsufficients.map(
      (insufficient) => {
        return {
          cardId: insufficient.cardId,
          copiesRequired: insufficient.copiesRequired,
          copiesOwned: insufficient.copiesOwned,
          ownedCopylocations: insufficient.ownedCopylocations,
        }
      },
    )
    return insufficientsCopy
  }

  /**
   * Select different available choice of sources to transfer to destination
   * If you select an occupied source, they are swapped automatically.
   */
  public changeTransferInSource(
    transferId: TransferId,
    sourceId: TransferChoiceId,
  ): void {
    const transfer = this.internalTransferIns.find(
      (transfer) => transfer.id === transferId,
    )
    if (!transfer) {
      throw new Error(`Transfer ID ${transferId} does not exist.`)
    }
    const source = transfer.sources.find((source) => {
      return source.id === sourceId
    })
    if (!source) {
      throw new Error(`Source ID ${sourceId} does not exist.`)
    }
    const sourceBefore = transfer.chosenSource
    transfer.chosenSource = sourceId

    if (source.currentlySelectedBy !== null) {
      const found = this.internalTransferIns.find((transfer) => {
        return source.currentlySelectedBy === transfer.id
      })
      if (!found) {
        throw new Error(
          `Currently selected by transfer ID ${source.currentlySelectedBy} does not exist.`,
        )
      }
      // Swap sources, even if it is null.
      found.chosenSource = sourceBefore
    }
  }

  /**
   * Choose where an excess (outgoing) card should go among the available destinations.
   * Pass `null` to keep the excess card in place (do not move it out at all), which is how a player
   * can deliberately keep more cards than the blueprint requested.
   */
  public changeTransferOutDestination(
    transferId: TransferId,
    destinationId: TransferChoiceId | null,
  ): void {
    const transfer = this.internalTransferOuts.find(
      (transfer) => transfer.id === transferId,
    )
    if (!transfer) {
      throw new Error(`Transfer ID ${transferId} does not exist.`)
    }
    if (destinationId !== null) {
      const destination = transfer.destinations.find((destination) => {
        return destination.id === destinationId
      })
      if (!destination) {
        throw new Error(`Destination ID ${destinationId} does not exist.`)
      }
    }
    transfer.chosenDestination = destinationId
  }
}
