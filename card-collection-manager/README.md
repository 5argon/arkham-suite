# @5argon/arkham-collection

Provide a data structures to manage **physical** LCG card game collection. [Read about the problems here](./requirements.md) why this problem needs a dedicated library to solve.

It is designed to be generic, but I originally made this for Arkham Horror : The Card Game. If some features looked weird to you, it is probably trying to cater to this game.

## Features

"Owner" is a state machine object that represents you that owns the LCG collection. Call a series of operations on it to change its state. Perform a list operation on Owner to view its present state. You can serialize these states and recreate an owner starting from it.

Owner consists of boxes. One box holds a "blueprint", the filled state of that box, and "physical cards" that are actually in that box right now. In typical game, you would create a box to represent your collection, and more boxes to represent player decks. Your collection has a blueprint of every cards that you bought. Deck's blueprint is the player's deck.

Owner has operation to create boxes and modify their blueprint. However both operations doesn't do anything with physical copies. Most operation only move around cards as is the case in real world.

### The "Initialize" Operation

Currently, there is only one operation that could mint cards into owner which is "initialize". The operation causes a single box to have physical cards exactly like its blueprint, and empty all other boxes. Therefore this operation heavily implies you have a box representing the collection.

There is no operation that adds arbitrary cards into the system because there is no booster pack opening in LCGs, cards rarely changes until you buy the next product. At that moment you modify the collection box's blueprint then initialize again.

### The "Complete" Operation

The most important operation is the "complete" operation. You can select any number of boxes to be made complete to their blueprints. It then searches through all other boxes to pull cards from, presenting you all the choices if there are many copies of them but you required less. It pre-select a choice if possible, accounting for your priority options.

Additionally, there could be excess cards in the selected boxes to be completed, which they will be going out. You must configure destinations for outgoing cards, such as going back to the collection, or going to each deck's "side deck".

This operation returns a completion confirmation object that you can use to change some movement decisions if there are other options available. You can also build a UI with this object. Executing this confirmation object with the owner to actually perform the operation.

### Substitute Cards

In LCG there are cards that are considered essentially the same, but technically they are different cards product-wise. Because you purchase each LCG product once, it is not intuitive to just combine quantity of those 'essentially same cards'. (They might have a different collector number on the card, but everything else is the same.)

Instead, we can keep them separated in terms of card identity (ID) and mark them as potential substitutes for each other. This affects "complete" operation. It will search for substitute cards as well. If you ended up allowing it to pull substitute cards (technically not exactly matching the blueprint), the next time you run the list operation, you can see that the blueprint is satisfied by substitutes.

### Side Decks (neighbor groups)

Side decks are virtual lists: many players can list the same card in their side deck, far beyond the physical copies you own. Those copies only need to physically exist when someone actually moves them into a main deck. Flag side decks and link the ones that physically share cards into a neighbor group with `markSideDeck` / `linkSideDecks`. When you `complete` a side deck, the group is only required to physically hold the **maximum single-deck demand** of each card (not the sum across the group). A side deck can therefore stay "correctly incomplete", backed by its neighbors. `sideDeckTallies()` reports, per group, the expected vs actual physical quantity so you can verify a deliberately-incomplete state.

When excess cards leave a completed box, they go to that box's `removeTo` by default. You can offer the player alternative destinations (for example each deck's side deck) via `removeOptions`, and they pick one with `changeTransferOutDestination`. Choosing `null` keeps the excess card in place — that is how a player deliberately keeps more cards than the blueprint asked for.

### The recipe (plan, then confirm)

Every operation mutates a **working ("after") state** while remembering the last confirmed **("before") state**. The player can plan freely — run `complete` and resolve conflicts as many times as they like, move cards manually, etc. — and at any point `recipe()` returns the **final, optimized list of physical transfers** to get from the before-state to the after-state. It is built by diffing the two states, so needless back-and-forth cancels out and only the net moves remain; every move goes from a box that currently holds the copies to one that needs them, so they can be performed in any order. Once the player has physically performed the recipe, `confirm()` accepts the after-state as the new before-state (the recipe becomes empty). `revert()` throws away the whole plan instead. Saving with `toJSON()` mid-plan preserves both states, so a pending recipe survives save/load.

### Other operations

You can move all physical cards in one box to another, or move just some of them. Movement and `complete` execution are atomic — if any part of a batch is impossible, nothing is applied.

Any movement operation including "complete" will return a data that summarizes the move. This data could be combined, it will resolve moves that cancels out each other as well.

Owner provides `toJSON()` and the static `Owner.fromJSON()` to serialize and recreate its internal state with a simple plain object, suitable for saving to and loading from a JSON file.

## API summary

`Owner` is the entry point. Key methods:

- `createBox(id)`, `setBlueprint(id, cards)`, `deleteBox(id)` — define boxes and their blueprints.
- `initialize(id)` — mint physical cards equal to one box's blueprint and empty all others.
- `emptyBox(from, to)`, `moveCards(from, to, cards)` — move physical cards; return a `MoveResult`.
- `list()` — current physical-vs-blueprint state per box per card.
- `complete(boxes, options?)` → `CompleteConfirmation`; adjust choices with `changeTransferInSource` / `changeTransferOutDestination`, then `executeComplete(confirmation)` → `MoveResult` to actually move cards.
- `recipe()` → `Recipe` (the final optimized transfers), `hasPendingRecipe()`, `confirm()` (accept after-state), `revert()` (discard plan).
- `addCompletionSubstituteMap(cardId, substituteIds)` / `clearCompletionSubstituteMap()` — substitutes for `complete`.
- `markSideDeck(id)` / `linkSideDecks(...ids)` / `sideDeckTallies()` — side deck neighbor groups.
- `toJSON()` / `Owner.fromJSON(serialized)` — save and load (preserves a pending recipe).

`combineMoveResults` / `combineMoveResultItems` combine and net out a series of moves (opposing moves cancel).