# Database

Site is hosted on Supabase and so using PostgreSQL. This document provide overview of all the tables available. It's a player profile site so these tables are structured in a manner that could be queried in as finely grained way as possible.

## deck_chains

Deck can be upgraded in this game as a part of campaign play, each row of this table represents an entire chain of upgrades of the deck. This site doesn't use linked list style deck (next, prev) like arkhamdb.

Decks can be in 2 places in this site :

- As a part of campaign or standalone session. These count into the user's statistics.
- As a part of manually archived deck.

## decks

In this service decks can be stored in 2 places :

- In an archived campaign. There, a deck is paired with a player who played that deck, along with campaign-only states such as trauma.