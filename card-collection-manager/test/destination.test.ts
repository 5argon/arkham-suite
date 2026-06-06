import { test } from "vitest"
import { Owner } from "../src"

function physical(owner: Owner, boxId: string, cardId: string): number {
  const box = owner.list().boxes.find((b) => b.id === boxId)
  return box?.cards.find((c) => c.id === cardId)?.physicalQuantity ?? 0
}

function setupExcess(): Owner {
  const owner = new Owner()
  owner.createBox("collection")
  owner.createBox("deck")
  owner.createBox("side")
  owner.setBlueprint("collection", [{ id: "X", quantity: 1 }])
  owner.initialize("collection")
  // Put an unblueprinted X physically into the deck so completing the deck creates excess.
  owner.moveCards("collection", "deck", [{ id: "X", quantity: 1 }])
  return owner
}

test("excess offers multiple destinations and the default is removeTo", ({
  expect,
}) => {
  const owner = setupExcess()
  const confirmation = owner.complete([
    { boxId: "deck", removeTo: "collection", removeOptions: ["side"] },
  ])
  const out = confirmation.transfers.out
  expect(out.length).toBe(1)
  expect(out[0].destinations.map((d) => d.destinationBoxId)).toEqual([
    "collection",
    "side",
  ])
  const chosen = out[0].destinations.find(
    (d) => d.id === out[0].chosenDestination,
  )
  expect(chosen?.destinationBoxId).toBe("collection")
})

test("player can route excess to a chosen destination", ({ expect }) => {
  const owner = setupExcess()
  const confirmation = owner.complete([
    { boxId: "deck", removeTo: "collection", removeOptions: ["side"] },
  ])
  const out = confirmation.transfers.out[0]
  const sideChoice = out.destinations.find((d) => d.destinationBoxId === "side")
  confirmation.changeTransferOutDestination(out.id, sideChoice!.id)

  owner.executeComplete(confirmation)
  expect(physical(owner, "deck", "X")).toBe(0)
  expect(physical(owner, "side", "X")).toBe(1)
  expect(physical(owner, "collection", "X")).toBe(0)
})

test("player can keep an excess card by choosing no destination", ({
  expect,
}) => {
  const owner = setupExcess()
  const confirmation = owner.complete([
    { boxId: "deck", removeTo: "collection", removeOptions: ["side"] },
  ])
  const out = confirmation.transfers.out[0]
  confirmation.changeTransferOutDestination(out.id, null)

  owner.executeComplete(confirmation)
  // The excess stays in the deck.
  expect(physical(owner, "deck", "X")).toBe(1)
})

test("moveCards is atomic: an invalid card leaves state untouched", ({
  expect,
}) => {
  const owner = new Owner()
  owner.createBox("collection")
  owner.createBox("deck")
  owner.setBlueprint("collection", [{ id: "X", quantity: 1 }])
  owner.initialize("collection")

  // X exists but Y does not; the whole call must fail without moving X.
  expect(() =>
    owner.moveCards("collection", "deck", [
      { id: "X", quantity: 1 },
      { id: "Y", quantity: 1 },
    ]),
  ).toThrowError()
  expect(physical(owner, "collection", "X")).toBe(1)
  expect(physical(owner, "deck", "X")).toBe(0)
})

test("executeComplete is atomic when a chosen source went stale", ({
  expect,
}) => {
  const owner = new Owner()
  owner.createBox("collection")
  owner.createBox("deckA")
  owner.createBox("deckB")
  owner.setBlueprint("collection", [
    { id: "X", quantity: 1 },
    { id: "Y", quantity: 1 },
  ])
  owner.setBlueprint("deckA", [
    { id: "X", quantity: 1 },
    { id: "Y", quantity: 1 },
  ])
  owner.initialize("collection")

  const confirmation = owner.complete([
    { boxId: "deckA", removeTo: "collection" },
  ])
  // Drain X out from under the plan before executing.
  owner.moveCards("collection", "deckB", [{ id: "X", quantity: 1 }])

  expect(() => owner.executeComplete(confirmation)).toThrowError()
  // Y was not partially moved into deckA.
  expect(physical(owner, "deckA", "Y")).toBe(0)
  expect(physical(owner, "collection", "Y")).toBe(1)
})
