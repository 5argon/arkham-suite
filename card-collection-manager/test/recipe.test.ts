import { test } from "vitest"
import { MoveResultItem, Owner } from "../src"

function recipeItems(owner: Owner): MoveResultItem[] {
  return [...owner.recipe().moveResults].sort((a, b) =>
    `${a.card}${a.fromBoxId}${a.toBoxId}`.localeCompare(
      `${b.card}${b.fromBoxId}${b.toBoxId}`,
    ),
  )
}

test("no recipe right after initialize", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection")
  owner.setBlueprint("collection", [{ id: "X", quantity: 2 }])
  owner.initialize("collection")
  expect(owner.hasPendingRecipe()).toBe(false)
  expect(owner.recipe().moveResults).toEqual([])
})

test("recipe accumulates across multiple planning operations", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection")
  owner.createBox("deckA")
  owner.createBox("deckB")
  owner.setBlueprint("collection", [{ id: "X", quantity: 2 }])
  owner.setBlueprint("deckA", [{ id: "X", quantity: 1 }])
  owner.setBlueprint("deckB", [{ id: "X", quantity: 1 }])
  owner.initialize("collection")

  owner.executeComplete(
    owner.complete([{ boxId: "deckA", removeTo: "collection" }]),
  )
  owner.executeComplete(
    owner.complete([{ boxId: "deckB", removeTo: "collection" }]),
  )

  // Two distinct planned transfers add up into one recipe.
  expect(recipeItems(owner)).toEqual<MoveResultItem[]>([
    { card: "X", fromBoxId: "collection", toBoxId: "deckA", quantity: 1 },
    { card: "X", fromBoxId: "collection", toBoxId: "deckB", quantity: 1 },
  ])
})

test("recipe optimizes away needless back-and-forth", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection")
  owner.createBox("deck")
  owner.setBlueprint("collection", [{ id: "X", quantity: 1 }])
  owner.initialize("collection")

  // Plan a round trip: move X out to the deck, then bring it back.
  owner.moveCards("collection", "deck", [{ id: "X", quantity: 1 }])
  owner.moveCards("deck", "collection", [{ id: "X", quantity: 1 }])

  // The working state matches the committed state again, so the recipe is empty.
  expect(owner.hasPendingRecipe()).toBe(false)
  expect(owner.recipe().moveResults).toEqual([])
})

test("recipe collapses a chained hop into a single net transfer", ({
  expect,
}) => {
  const owner = new Owner()
  owner.createBox("collection")
  owner.createBox("deckA")
  owner.createBox("deckB")
  owner.setBlueprint("collection", [{ id: "X", quantity: 1 }])
  owner.initialize("collection")

  // collection -> deckA, then deckA -> deckB. Net effect: collection -> deckB.
  owner.moveCards("collection", "deckA", [{ id: "X", quantity: 1 }])
  owner.moveCards("deckA", "deckB", [{ id: "X", quantity: 1 }])

  expect(recipeItems(owner)).toEqual<MoveResultItem[]>([
    { card: "X", fromBoxId: "collection", toBoxId: "deckB", quantity: 1 },
  ])
})

test("confirm accepts the after-state and clears the recipe", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection")
  owner.createBox("deck")
  owner.setBlueprint("collection", [{ id: "X", quantity: 1 }])
  owner.setBlueprint("deck", [{ id: "X", quantity: 1 }])
  owner.initialize("collection")

  owner.executeComplete(
    owner.complete([{ boxId: "deck", removeTo: "collection" }]),
  )
  expect(owner.hasPendingRecipe()).toBe(true)

  owner.confirm()
  expect(owner.hasPendingRecipe()).toBe(false)
  expect(owner.recipe().moveResults).toEqual([])
})

test("revert discards the pending plan", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection")
  owner.createBox("deck")
  owner.setBlueprint("collection", [{ id: "X", quantity: 1 }])
  owner.setBlueprint("deck", [{ id: "X", quantity: 1 }])
  owner.initialize("collection")

  owner.executeComplete(
    owner.complete([{ boxId: "deck", removeTo: "collection" }]),
  )
  owner.revert()

  expect(owner.hasPendingRecipe()).toBe(false)
  const collection = owner.list().boxes.find((b) => b.id === "collection")
  expect(collection?.cards.find((c) => c.id === "X")?.physicalQuantity).toBe(1)
  const deck = owner.list().boxes.find((b) => b.id === "deck")
  expect(deck?.cards.find((c) => c.id === "X")?.physicalQuantity ?? 0).toBe(0)
})

test("a pending recipe survives JSON save/load", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection")
  owner.createBox("deck")
  owner.setBlueprint("collection", [{ id: "X", quantity: 1 }])
  owner.setBlueprint("deck", [{ id: "X", quantity: 1 }])
  owner.initialize("collection")
  owner.executeComplete(
    owner.complete([{ boxId: "deck", removeTo: "collection" }]),
  )

  const restored = Owner.fromJSON(JSON.parse(JSON.stringify(owner.toJSON())))
  expect(restored.hasPendingRecipe()).toBe(true)
  expect(restored.recipe()).toEqual(owner.recipe())

  restored.confirm()
  expect(restored.hasPendingRecipe()).toBe(false)
})
