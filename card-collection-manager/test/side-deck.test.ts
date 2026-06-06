import { test } from "vitest"
import { Owner } from "../src"

function physical(owner: Owner, boxId: string, cardId: string): number {
  const box = owner.list().boxes.find((b) => b.id === boxId)
  return box?.cards.find((c) => c.id === cardId)?.physicalQuantity ?? 0
}

function setupFourSideDecks(): Owner {
  const owner = new Owner()
  owner.createBox("collection")
  for (let i = 1; i <= 4; i++) {
    owner.createBox(`side-${i}`)
  }
  // The game gives a playset of 2 copies of card X.
  owner.setBlueprint("collection", [{ id: "X", quantity: 2 }])
  // Every player lists 2 copies of X in their side deck (8 virtual, only 2 physical exist).
  for (let i = 1; i <= 4; i++) {
    owner.setBlueprint(`side-${i}`, [{ id: "X", quantity: 2 }])
  }
  owner.initialize("collection")
  owner.linkSideDecks("side-1", "side-2", "side-3", "side-4")
  return owner
}

test("side deck completion only pulls up to the group's max demand", ({
  expect,
}) => {
  const owner = setupFourSideDecks()

  // Completing the first side deck pulls the 2 physical copies that back the whole group.
  const conf1 = owner.complete([{ boxId: "side-1", removeTo: "collection" }])
  expect(conf1.insufficients).toEqual([])
  expect(conf1.transfers.in.length).toBe(2)
  owner.executeComplete(conf1)
  expect(physical(owner, "side-1", "X")).toBe(2)
  expect(physical(owner, "collection", "X")).toBe(0)

  // A second side deck is already backed by the group's physical copies: no pull, no insufficiency.
  const conf2 = owner.complete([{ boxId: "side-2", removeTo: "collection" }])
  expect(conf2.insufficients).toEqual([])
  expect(conf2.transfers.in.length).toBe(0)
})

test("completing two side decks in one call does not double pull", ({
  expect,
}) => {
  const owner = setupFourSideDecks()
  const conf = owner.complete([
    { boxId: "side-1", removeTo: "collection" },
    { boxId: "side-2", removeTo: "collection" },
  ])
  expect(conf.insufficients).toEqual([])
  // Only 2 copies pulled total for the group, not 4.
  expect(conf.transfers.in.filter((t) => t.chosenSource !== null).length).toBe(
    2,
  )
})

test("side deck group tally reports correctly-incomplete state", ({
  expect,
}) => {
  const owner = setupFourSideDecks()
  const conf1 = owner.complete([{ boxId: "side-1", removeTo: "collection" }])
  owner.executeComplete(conf1)

  const tallies = owner.sideDeckTallies()
  expect(tallies.length).toBe(1)
  const xTally = tallies[0].cards.find((c) => c.id === "X")
  expect(xTally?.expectedPhysical).toBe(2)
  expect(xTally?.actualPhysical).toBe(2)
})
