import { test } from "vitest"
import { BoxId, CardId, Insufficient, Owner, TransferId } from "../src"

function setup(): Owner {
  const owner = new Owner()
  owner.createBox("collection-box")
  owner.createBox("campaign-1-deck-1")
  owner.createBox("campaign-1-deck-2")
  owner.createBox("campaign-1-deck-3")
  owner.createBox("campaign-1-deck-4")
  owner.createBox("campaign-1-side-deck-1")
  owner.createBox("campaign-1-side-deck-2")
  owner.createBox("campaign-1-side-deck-3")
  owner.createBox("campaign-1-side-deck-4")
  owner.createBox("campaign-2-deck-1")
  owner.createBox("campaign-2-deck-2")
  owner.createBox("campaign-2-deck-3")
  owner.createBox("campaign-2-deck-4")
  return owner
}

test("complete from collection", ({ expect }) => {
  const owner = setup()
  owner.setBlueprint("collection-box", [
    { id: "card-1", quantity: 2 },
    { id: "card-2", quantity: 1 },
  ])
  owner.setBlueprint("campaign-1-deck-1", [{ id: "card-1", quantity: 1 }])
  owner.setBlueprint("campaign-1-deck-2", [{ id: "card-2", quantity: 1 }])
  owner.initialize("collection-box")
  const confirmation = owner.complete([
    { boxId: "campaign-1-deck-1", removeTo: "collection-box" },
  ])
  expect(confirmation.insufficients).toEqual<Insufficient[]>([])
  expect(confirmation.transfers.in.length).toBe(1)
  expect(confirmation.transfers.in[0].destinationBoxId).toBe<BoxId>(
    "campaign-1-deck-1",
  )
  expect(confirmation.transfers.in[0].sources.length).toBe(1)
  expect(confirmation.transfers.in[0].sources[0].sourceBoxId).toBe<BoxId>(
    "collection-box",
  )
  expect(confirmation.transfers.in[0].sources[0].card).toBe<CardId>("card-1")
  expect(
    confirmation.transfers.in[0].sources[0].currentlySelectedBy,
  ).toBe<TransferId>(confirmation.transfers.in[0].id)
  const result = owner.executeComplete(confirmation)
  expect(result.moveResults.length).toBe(1)
  expect(result.moveResults[0].card).toBe<CardId>("card-1")
  expect(result.moveResults[0].quantity).toBe(1)
  expect(result.moveResults[0].fromBoxId).toBe<BoxId>("collection-box")
  expect(result.moveResults[0].toBoxId).toBe<BoxId>("campaign-1-deck-1")

  // After executing, the deck physically holds its blueprint and collection lost one copy.
  const list = owner.list()
  const deck = list.boxes.find((b) => b.id === "campaign-1-deck-1")
  const collection = list.boxes.find((b) => b.id === "collection-box")
  expect(deck?.cards).toEqual([
    { id: "card-1", physicalQuantity: 1, blueprintQuantity: 1 },
  ])
  expect(
    collection?.cards.find((c) => c.id === "card-1")?.physicalQuantity,
  ).toBe(1)
})
