import { test } from "vitest"
import { Owner } from "../src"

function physical(owner: Owner, boxId: string, cardId: string): number {
  const box = owner.list().boxes.find((b) => b.id === boxId)
  return box?.cards.find((c) => c.id === cardId)?.physicalQuantity ?? 0
}

function sourceBoxes(
  owner: Owner,
  boxId: string,
): string[] {
  const conf = owner.complete([{ boxId: boxId, removeTo: "collection" }])
  return conf.transfers.in.flatMap((t) =>
    t.sources.map((s) => s.sourceBoxId),
  )
}

/**
 * Two campaigns each use one copy of a card that ships with 2 copies. "Campaign Overlap" would flag
 * this as an overlap, but physically the player just gives one copy to each campaign. Here both
 * campaigns complete with no conflict and no insufficiency.
 */
test("scenario: a 2-copy card is split across two campaigns", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection")
  owner.createBox("campA")
  owner.createBox("campB")
  owner.setBlueprint("collection", [{ id: "X", quantity: 2 }])
  owner.setBlueprint("campA", [{ id: "X", quantity: 1 }])
  owner.setBlueprint("campB", [{ id: "X", quantity: 1 }])
  owner.initialize("collection")

  owner.executeComplete(
    owner.complete([{ boxId: "campA", removeTo: "collection" }]),
  )
  owner.executeComplete(
    owner.complete([{ boxId: "campB", removeTo: "collection" }]),
  )

  expect(physical(owner, "campA", "X")).toBe(1)
  expect(physical(owner, "campB", "X")).toBe(1)
  expect(physical(owner, "collection", "X")).toBe(0)
})

/**
 * Three campaigns contend for a 2-copy card. Playing A then B leaves the collection empty, so playing
 * C must steal from A or B. Breaking down B sends cards back to the collection, after which completing
 * C pulls from the collection instead. State depends on the order of operations.
 */
test("scenario: order-dependent stealing and breaking down a campaign", ({
  expect,
}) => {
  const owner = new Owner()
  owner.createBox("collection")
  owner.createBox("campA")
  owner.createBox("campB")
  owner.createBox("campC")
  owner.setBlueprint("collection", [{ id: "X", quantity: 2 }])
  owner.setBlueprint("campA", [{ id: "X", quantity: 1 }])
  owner.setBlueprint("campB", [{ id: "X", quantity: 1 }])
  owner.setBlueprint("campC", [{ id: "X", quantity: 1 }])
  owner.initialize("collection")

  // Play A, then B. Collection is now empty; A and B each hold a copy.
  owner.executeComplete(
    owner.complete([{ boxId: "campA", removeTo: "collection" }]),
  )
  owner.executeComplete(
    owner.complete([{ boxId: "campB", removeTo: "collection" }]),
  )
  expect(physical(owner, "collection", "X")).toBe(0)

  // To play C, the only sources are the other campaigns (A and B) — the tool surfaces both choices.
  expect(sourceBoxes(owner, "campC").sort()).toEqual(["campA", "campB"])

  // Break down B back to the collection.
  owner.emptyBox("campB", "collection")
  expect(physical(owner, "collection", "X")).toBe(1)

  // Now completing C can pull from the collection (and still from A).
  expect(sourceBoxes(owner, "campC").sort()).toEqual(["campA", "collection"])
})

/**
 * When several sources are available, the player can resolve the choice and submit it back. The state
 * updates exactly as requested.
 */
test("scenario: player resolves which box to pull from", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection")
  owner.createBox("campA")
  owner.createBox("campB")
  owner.createBox("campC")
  owner.setBlueprint("collection", [{ id: "X", quantity: 2 }])
  owner.setBlueprint("campA", [{ id: "X", quantity: 1 }])
  owner.setBlueprint("campB", [{ id: "X", quantity: 1 }])
  owner.setBlueprint("campC", [{ id: "X", quantity: 1 }])
  owner.initialize("collection")
  owner.executeComplete(
    owner.complete([{ boxId: "campA", removeTo: "collection" }]),
  )
  owner.executeComplete(
    owner.complete([{ boxId: "campB", removeTo: "collection" }]),
  )

  const confirmation = owner.complete([
    { boxId: "campC", removeTo: "collection" },
  ])
  const transfer = confirmation.transfers.in[0]
  const preselected = transfer.sources.find((s) => s.id === transfer.chosenSource)
  const other = transfer.sources.find((s) => s.id !== transfer.chosenSource)
  expect(preselected).toBeDefined()
  expect(other).toBeDefined()

  // Switch the choice to the other campaign and submit.
  confirmation.changeTransferInSource(transfer.id, other!.id)
  expect(confirmation.transfers.in[0].chosenSource).toBe(other!.id)

  owner.executeComplete(confirmation)
  expect(physical(owner, "campC", "X")).toBe(1)
  // The campaign we chose to pull from lost its copy; the other still has it.
  expect(physical(owner, other!.sourceBoxId, "X")).toBe(0)
  expect(physical(owner, preselected!.sourceBoxId, "X")).toBe(1)
})

/**
 * The player can manually grab extra cards from the collection beyond the deck recipe.
 */
test("scenario: manual over-recipe pull is allowed", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection")
  owner.createBox("campA")
  owner.setBlueprint("collection", [
    { id: "X", quantity: 1 },
    { id: "Y", quantity: 2 },
  ])
  owner.setBlueprint("campA", [{ id: "X", quantity: 1 }])
  owner.initialize("collection")

  owner.executeComplete(
    owner.complete([{ boxId: "campA", removeTo: "collection" }]),
  )
  // Take an extra Y that the recipe never asked for.
  owner.moveCards("collection", "campA", [{ id: "Y", quantity: 1 }])

  const campA = owner.list().boxes.find((b) => b.id === "campA")
  const y = campA?.cards.find((c) => c.id === "Y")
  expect(y?.physicalQuantity).toBe(1)
  expect(y?.blueprintQuantity).toBe(0)
})
