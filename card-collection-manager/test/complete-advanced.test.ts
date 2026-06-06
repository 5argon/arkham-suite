import { test } from "vitest"
import { Owner } from "../src"

function physical(owner: Owner, boxId: string, cardId: string): number {
  const box = owner.list().boxes.find((b) => b.id === boxId)
  return box?.cards.find((c) => c.id === cardId)?.physicalQuantity ?? 0
}

test("excess cards go out to removeTo", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection")
  owner.createBox("deck")
  owner.setBlueprint("collection", [{ id: "card-1", quantity: 2 }])
  owner.initialize("collection")
  // Put an unblueprinted card physically into the empty-blueprint deck.
  owner.moveCards("collection", "deck", [{ id: "card-1", quantity: 1 }])

  const confirmation = owner.complete([
    { boxId: "deck", removeTo: "collection" },
  ])
  expect(confirmation.transfers.in.length).toBe(0)
  expect(confirmation.transfers.out.length).toBe(1)
  expect(confirmation.transfers.out[0].card).toBe("card-1")
  expect(confirmation.transfers.out[0].sourceBoxId).toBe("deck")
  expect(confirmation.transfers.out[0].destinationBoxId).toBe("collection")

  owner.executeComplete(confirmation)
  expect(physical(owner, "deck", "card-1")).toBe(0)
  expect(physical(owner, "collection", "card-1")).toBe(2)
})

test("substitute card is pulled when exact is unavailable", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection")
  owner.createBox("deck")
  owner.setBlueprint("collection", [{ id: "card-1-alt", quantity: 1 }])
  owner.setBlueprint("deck", [{ id: "card-1", quantity: 1 }])
  owner.addCompletionSubstituteMap("card-1", ["card-1-alt"])
  owner.initialize("collection")

  const confirmation = owner.complete([
    { boxId: "deck", removeTo: "collection" },
  ])
  expect(confirmation.insufficients).toEqual([])
  expect(confirmation.transfers.in.length).toBe(1)
  expect(confirmation.transfers.in[0].sources[0].card).toBe("card-1-alt")

  owner.executeComplete(confirmation)
  // The deck physically holds the substitute, satisfying its blueprint for card-1.
  expect(physical(owner, "deck", "card-1-alt")).toBe(1)
})

test("substitute already in the box counts toward current and is not duplicated", ({
  expect,
}) => {
  const owner = new Owner()
  owner.createBox("collection")
  owner.createBox("deck")
  owner.setBlueprint("collection", [
    { id: "card-1", quantity: 1 },
    { id: "card-1-alt", quantity: 1 },
  ])
  owner.setBlueprint("deck", [{ id: "card-1", quantity: 1 }])
  owner.addCompletionSubstituteMap("card-1", ["card-1-alt"])
  owner.initialize("collection")
  owner.moveCards("collection", "deck", [{ id: "card-1-alt", quantity: 1 }])

  const confirmation = owner.complete([
    { boxId: "deck", removeTo: "collection" },
  ])
  // Already satisfied by the substitute physically present; nothing pulled, nothing ejected.
  expect(confirmation.transfers.in.length).toBe(0)
  expect(confirmation.transfers.out.length).toBe(0)
})

test("addPriorities pre-selects the preferred source box", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection")
  owner.createBox("session1")
  owner.createBox("deck")
  owner.setBlueprint("collection", [{ id: "card-1", quantity: 2 }])
  owner.initialize("collection")
  owner.moveCards("collection", "session1", [{ id: "card-1", quantity: 1 }])
  owner.setBlueprint("deck", [{ id: "card-1", quantity: 1 }])

  const confirmation = owner.complete([
    { boxId: "deck", removeTo: "collection", addPriorities: ["session1"] },
  ])
  const transfer = confirmation.transfers.in[0]
  expect(transfer.sources.length).toBe(2)
  const chosen = transfer.sources.find((s) => s.id === transfer.chosenSource)
  expect(chosen?.sourceBoxId).toBe("session1")
})

test("insufficient when not enough copies exist", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection")
  owner.createBox("deck")
  owner.setBlueprint("collection", [{ id: "card-1", quantity: 1 }])
  owner.setBlueprint("deck", [{ id: "card-1", quantity: 2 }])
  owner.initialize("collection")

  const confirmation = owner.complete([
    { boxId: "deck", removeTo: "collection" },
  ])
  expect(confirmation.insufficients.length).toBe(1)
  expect(confirmation.insufficients[0].cardId).toBe("card-1")
  expect(confirmation.insufficients[0].copiesRequired).toBe(2)
  expect(confirmation.insufficients[0].copiesOwned).toBe(1)
  // One transfer satisfied, one left without a chosen source.
  expect(confirmation.transfers.in.length).toBe(2)
  expect(
    confirmation.transfers.in.filter((t) => t.chosenSource === null).length,
  ).toBe(1)
})

test("reservations are shared across multiple completed boxes", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection")
  owner.createBox("deck1")
  owner.createBox("deck2")
  owner.setBlueprint("collection", [{ id: "card-1", quantity: 1 }])
  owner.setBlueprint("deck1", [{ id: "card-1", quantity: 1 }])
  owner.setBlueprint("deck2", [{ id: "card-1", quantity: 1 }])
  owner.initialize("collection")

  const confirmation = owner.complete([
    { boxId: "deck1", removeTo: "collection" },
    { boxId: "deck2", removeTo: "collection" },
  ])
  // Only one physical copy exists: the first box gets it, the second is insufficient.
  expect(
    confirmation.transfers.in.filter((t) => t.chosenSource !== null).length,
  ).toBe(1)
  expect(confirmation.insufficients.length).toBe(1)

  owner.executeComplete(confirmation)
  expect(physical(owner, "deck1", "card-1")).toBe(1)
  expect(physical(owner, "deck2", "card-1")).toBe(0)
})
