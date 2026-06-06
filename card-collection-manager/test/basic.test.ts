import { test } from "vitest"
import { Card, ListBoxCard, Owner } from "../src"

test("create box", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection-box")
  const box = owner.list().boxes.find((box) => box.id === "collection-box")
  expect(box).toBeDefined()
  if (box) {
    if (box) {
      expect(box.cards).toEqual<ListBoxCard[]>([])
    }
  }
})

test("create box duplicate error", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection-box")
  expect(() => owner.createBox("collection-box")).toThrowError()
})

test("set blueprint", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection-box")
  owner.setBlueprint("collection-box", [{ id: "card-1", quantity: 2 }])
  const box = owner.list().boxes.find((box) => box.id === "collection-box")
  expect(box).toBeDefined()
  if (box) {
    expect(box.cards).toEqual<ListBoxCard[]>([
      { id: "card-1", physicalQuantity: 0, blueprintQuantity: 2 },
    ])
  }
})

test("set blueprint box ID error", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection-box")
  expect(() =>
    owner.setBlueprint("collection-box-2", [{ id: "card-1", quantity: 2 }]),
  ).toThrowError()
})

test("combined blueprint", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection-box-1")
  owner.createBox("collection-box-2")
  owner.setBlueprint("collection-box-1", [
    { id: "card-1", quantity: 2 },
    { id: "card-2", quantity: 1 },
  ])
  owner.setBlueprint("collection-box-2", [{ id: "card-2", quantity: 3 }])
  const combinedBlueprints = owner.getCombinedBlueprints(
    "collection-box-1",
    "collection-box-2",
  )
  expect(combinedBlueprints).toEqual<Card[]>([
    { id: "card-1", quantity: 2 },
    { id: "card-2", quantity: 4 },
  ])
})

test("initialize", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection-box-1")
  owner.createBox("collection-box-2")
  owner.setBlueprint("collection-box-1", [{ id: "card-1", quantity: 2 }])
  owner.setBlueprint("collection-box-2", [
    { id: "card-2", quantity: 3 },
    { id: "card-3", quantity: 1 },
  ])
  owner.initialize("collection-box-2")
  const list = owner.list()
  const box1 = list.boxes.find((box) => box.id === "collection-box-1")
  const box2 = list.boxes.find((box) => box.id === "collection-box-2")
  expect(box1).toBeDefined()
  expect(box2).toBeDefined()
  if (box1 && box2) {
    expect(box1.cards).toEqual<ListBoxCard[]>([
      { id: "card-1", physicalQuantity: 0, blueprintQuantity: 2 },
    ])
    expect(box2.cards).toEqual<ListBoxCard[]>([
      { id: "card-2", physicalQuantity: 3, blueprintQuantity: 3 },
      { id: "card-3", physicalQuantity: 1, blueprintQuantity: 1 },
    ])
  }
})

test("emptying box", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection-box")
  owner.createBox("deck-box")
  owner.setBlueprint("collection-box", [
    { id: "card-1", quantity: 2 },
    { id: "card-2", quantity: 1 },
  ])
  owner.initialize("collection-box")
  owner.emptyBox("collection-box", "deck-box")
  const list = owner.list()
  const collection = list.boxes.find((box) => box.id === "collection-box")
  const deck = list.boxes.find((box) => box.id === "deck-box")
  expect(collection).toBeDefined()
  expect(deck).toBeDefined()
  if (collection && deck) {
    expect(collection.cards).toEqual<ListBoxCard[]>([
      { id: "card-1", physicalQuantity: 0, blueprintQuantity: 2 },
      { id: "card-2", physicalQuantity: 0, blueprintQuantity: 1 },
    ])
    expect(deck.cards).toEqual<ListBoxCard[]>([
      { id: "card-1", physicalQuantity: 2, blueprintQuantity: 0 },
      { id: "card-2", physicalQuantity: 1, blueprintQuantity: 0 },
    ])
  }
})

test("emptying box source error", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection-box")
  owner.createBox("deck-box")
  expect(() => owner.emptyBox("collection-box-2", "deck-box")).toThrowError()
})

test("emptying box destination error", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection-box")
  owner.createBox("deck-box")
  expect(() => owner.emptyBox("collection-box", "deck-box-2")).toThrowError()
})

test("move cards", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection-box")
  owner.createBox("deck-box")
  owner.setBlueprint("collection-box", [
    { id: "card-1", quantity: 2 },
    { id: "card-2", quantity: 1 },
  ])
  owner.initialize("collection-box")
  owner.moveCards("collection-box", "deck-box", [
    { id: "card-1", quantity: 1 },
    { id: "card-2", quantity: 1 },
  ])
  const list = owner.list()
  const collection = list.boxes.find((box) => box.id === "collection-box")
  const deck = list.boxes.find((box) => box.id === "deck-box")
  expect(collection).toBeDefined()
  expect(deck).toBeDefined()
  if (collection && deck) {
    expect(collection.cards).toEqual<ListBoxCard[]>([
      { id: "card-1", physicalQuantity: 1, blueprintQuantity: 2 },
      { id: "card-2", physicalQuantity: 0, blueprintQuantity: 1 },
    ])
    expect(deck.cards).toEqual<ListBoxCard[]>([
      { id: "card-1", physicalQuantity: 1, blueprintQuantity: 0 },
      { id: "card-2", physicalQuantity: 1, blueprintQuantity: 0 },
    ])
  }
})

test("move cards source error", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection-box")
  owner.createBox("deck-box")
  owner.setBlueprint("collection-box", [
    { id: "card-1", quantity: 2 },
    { id: "card-2", quantity: 1 },
  ])
  owner.initialize("collection-box")
  expect(() =>
    owner.moveCards("collection-box-2", "deck-box", [
      { id: "card-1", quantity: 1 },
      { id: "card-2", quantity: 1 },
    ]),
  ).toThrowError()
})

test("move cards destination error", ({ expect }) => {
  const owner = new Owner()
  owner.createBox("collection-box")
  owner.createBox("deck-box")
  owner.setBlueprint("collection-box", [
    { id: "card-1", quantity: 2 },
    { id: "card-2", quantity: 1 },
  ])
  owner.initialize("collection-box")
  expect(() =>
    owner.moveCards("collection-box", "deck-box-2", [
      { id: "card-1", quantity: 1 },
      { id: "card-2", quantity: 1 },
    ]),
  ).toThrowError()
})
