import { test } from "vitest"
import { Owner } from "../src"

test("serialization round-trips through JSON", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection")
  owner.createBox("deck")
  owner.createBox("side-1")
  owner.setBlueprint("collection", [
    { id: "card-1", quantity: 2 },
    { id: "card-2", quantity: 1 },
  ])
  owner.setBlueprint("deck", [{ id: "card-1", quantity: 1 }])
  owner.setBlueprint("side-1", [{ id: "card-2", quantity: 1 }])
  owner.addCompletionSubstituteMap("card-1", ["card-1-alt"])
  owner.linkSideDecks("side-1")
  owner.initialize("collection")
  owner.moveCards("collection", "deck", [{ id: "card-1", quantity: 1 }])

  // Simulate saving to a file and loading back.
  const restored = Owner.fromJSON(JSON.parse(JSON.stringify(owner.toJSON())))

  expect(restored.list()).toEqual(owner.list())
  expect(restored.sideDeckTallies()).toEqual(owner.sideDeckTallies())

  // The restored owner behaves the same: completing the deck is already satisfied.
  const confirmation = restored.complete([
    { boxId: "deck", removeTo: "collection" },
  ])
  expect(confirmation.transfers.in.length).toBe(0)
})
