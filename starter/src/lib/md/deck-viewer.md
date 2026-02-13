# Alternate arkhamdb Deck Viewer

The real purpose of this site is to host starter decks for newcomers that do not want to immediately deckbuild, so I
want to develop the UI that helps them the most to understand all the cards at glance, and quickly gather cards from
that deck to get the game started. Since this site does not need any deckbuilding feature, I have more room to work on
better presentation for viewing.

This tool allow you to use that deck viewer UI intended for beginners, but instead import **any deck from arkhamdb.com**
to view on it.

For experienced player, maybe it can still be useful for more advanced grouping / sorting feature which is not available
on arkhamdb's UI, checklist toggling when gathering the cards, or simply for content creation when you want to show your
deck more graphically.

It fetches a deck by ID (from the URL `?id=___` query string) via [arkhamdb.com public API](https://arkhamdb.com/api/).
Note that there are 2 URLs of this tool : `/deck/view?id=___` and `/decklist/view?id=___` which only works with ID from
unpublished and published deck respectively, like in arkhamdb.com. (Published deck and unpublised deck runs different
number, it is possible for one number to exist for different published and unpublished decks.)

## Shortcut to this viewer from arkhamdb.com

I have setup a redirect URL such that when you are viewing your deck in arkhamdb.com (published or not) you can change "
arkhamdb" to "arkham-starter" and press enter then it should work out the URL transformation for you.

## Design

Many new players I invited to join the party expressed that when using arkhamdb.com, while the deckbuilder is good (but
not all of them wanted to get into deckbuilding immediately), they wanted to see "cards laid out on the table" like when
they built the deck physically instead of having to click/hover on each card. I did just that.

Everything has pack icon and collector's number. Beginner has limited collection and don't know where all the meta cards
everyone are abusing came from, UI that help learning Investigator Expansion should be priority. It also helps finding
the cards by looking just at the bottom right corner, especially for newcomers that hadn't decided on how to organize
their cards just yet.

Also you can see commit skill icons for each card. I think beginners need to familiarize with icons and how important
they are on each card as a basic teamplay feature. It is also easier to spot cost curve problem as I also put the cost
on each card entry as well.

## Some feature highlights

- Click on deck's name to go to the original deck on arkhamdb.com
- You can click on the card to toggle it, to help when assembling the deck.
- Grouping and Sorting is a bit more flexible than in arkhamdb.com so it can be adjusted to fit how your collection
  looks like.
- Investigator Expansion based packs used and card count information. (It even assume unreleased repackages to exist
  now.) How many pack icons you have basically shows real-world cost of your deck.
- All old Core Set cards used in a deck are forwarded to Revised Core Set card ID.
- Side Deck is accounted in "packs used". In arkhamdb.com Side Deck is ignored completely in display and in search.
- Five "representative cards" thumbnails. Starter decks in this site would have five such hand-picked cards for some
  sneak peek into the deck while user browse on the listing page. But since this renderer is being adapted to render any
  deck from arkhamdb.com with no such information, they are chosen automatically from XP cards you have in your deck /
  side deck.

## Currently unsupported

Many more are unsupported, but for example :

- Nothing about XP, next, previous deck : Not in priority since all the starter decks in this site would be at 0 XP.
- Inspecting (magnifying) a card will come later. There should be a check box that determine whether it should inspect
  or toggle a card on touching it.
