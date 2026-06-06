import { test } from "vitest"
import { combineMoveResultItems, MoveResultItem } from "../src"

test("combine sums same-direction moves of the same card", ({ expect }) => {
  const combined = combineMoveResultItems([
    { card: "card-1", fromBoxId: "a", toBoxId: "b", quantity: 1 },
    { card: "card-1", fromBoxId: "a", toBoxId: "b", quantity: 1 },
    { card: "card-1", fromBoxId: "a", toBoxId: "b", quantity: 1 },
  ])
  expect(combined).toEqual<MoveResultItem[]>([
    { card: "card-1", fromBoxId: "a", toBoxId: "b", quantity: 3 },
  ])
})

test("combine keeps different cards / routes separate", ({ expect }) => {
  const combined = combineMoveResultItems([
    { card: "card-1", fromBoxId: "a", toBoxId: "b", quantity: 1 },
    { card: "card-2", fromBoxId: "a", toBoxId: "b", quantity: 2 },
    { card: "card-1", fromBoxId: "b", toBoxId: "c", quantity: 1 },
  ])
  expect(combined.length).toBe(3)
})

test("combine cancels opposing moves fully", ({ expect }) => {
  const combined = combineMoveResultItems([
    { card: "card-1", fromBoxId: "a", toBoxId: "b", quantity: 2 },
    { card: "card-1", fromBoxId: "b", toBoxId: "a", quantity: 2 },
  ])
  expect(combined).toEqual<MoveResultItem[]>([])
})

test("combine cancels opposing moves partially", ({ expect }) => {
  const combined = combineMoveResultItems([
    { card: "card-1", fromBoxId: "a", toBoxId: "b", quantity: 3 },
    { card: "card-1", fromBoxId: "b", toBoxId: "a", quantity: 1 },
  ])
  expect(combined).toEqual<MoveResultItem[]>([
    { card: "card-1", fromBoxId: "a", toBoxId: "b", quantity: 2 },
  ])
})

test("combine flips direction when reverse is larger", ({ expect }) => {
  const combined = combineMoveResultItems([
    { card: "card-1", fromBoxId: "a", toBoxId: "b", quantity: 1 },
    { card: "card-1", fromBoxId: "b", toBoxId: "a", quantity: 4 },
  ])
  expect(combined).toEqual<MoveResultItem[]>([
    { card: "card-1", fromBoxId: "b", toBoxId: "a", quantity: 3 },
  ])
})

test("combine drops self-moves", ({ expect }) => {
  const combined = combineMoveResultItems([
    { card: "card-1", fromBoxId: "a", toBoxId: "a", quantity: 2 },
  ])
  expect(combined).toEqual<MoveResultItem[]>([])
})
