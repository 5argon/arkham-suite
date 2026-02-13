# Starter Deck Specifications

The definition of one "starter deck" actually consist of multiple decks and other additional metadata working together.

## Requirements

- Beginners have limited amount products they could work with. So each starter deck as one unit should be able to list summary of required products.
- Beginners cannot work the XP deck backwards on their own. The starter deck should include the initial state at the start of Scenario 1, with all other cards required in the future gathered in the Side Deck.
- However when they browse what starter decks they want to play, they want to see representative, fun XP cards that the deck eventually grows into around the middle of campaign.
- Upgrade plan is optional but recommended. It could be embedded inside deck description, but we prefer having an explicit page to show it because beginners might not want to start reading the description yet.
- Starter Deck should be able to mark some Side Deck cards as optional. They will NOT count in the summary of required products. Therefore we can mark optional cards by specifying the card pool of the starter deck explicitly, any other cards out of pool became optional. Also the overlap processing tool will skip processing all optional cards.
- Intro Markdown is required, so they can read excerpt of the description in the starter deck listing.
- "Series" is a new metadata specifying subfolder of one author's decks. This let user see other decks in the same series quickly, because they are likely using the same product pool. Author used to put series on the deck's name in arkhamDB, we should offer a new overridden name that removes all those suffixes.

## Implementation

```ts
interface StarterDeck {
	name: string
	author: string
	series: string
	startingDeck: Deck
	decks: {
		name: string
		deck: Deck
		representative?: boolean
	}
}
```
