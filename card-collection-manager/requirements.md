# Background of the LCG format

In LCG format there is no booster pack. A unit of purchase is bigger without randomization, and you have defined number of copies of cards in your collection that you take a part of them out to play. Most players won't buy duplicates of a product just for convenience of having many pre-built decks ready to go. 

Typical flow to start and stop playing therefore is bringing cards in and out of your collection to make decks. LCG format encourages change up the deck every new session/campaign because you got a full playset on single purchase to mix things up. Moreover, LCG cards are often shared to multiple players in your play group despite you are the only owner of these cards.

Because a full collection of LCGs is huge you might not be bringing all that to where you play every time. But game rule often let each player change up their decks at some point within limitations. To help with this, each player might request a "side deck" of inactive cards they could browse to change up their deck when the game allows.

So when a game is on-going (possibly a long campaign game, you are not tearing down all the decks as soon as you stop playing that day), you have as many as player count active decks + side decks separated from your collection. (e.g. For 4 players game, you would have 8 active "decks" if you count side deck.) Your collection is now missing that many cards.

# Problems this tries to solve

## Quantity of cards are less than theoretical limit

While the "buy once and get everything" aspect is great, but there are unfortunate downsides as well. LCGs are unlikely to be as generous as giving every cards enough copies for max amount of player to use up to maximum allowed at the same time.

Usually they give as many as theoretical limit for 1 player, and game instead use faction system that limits what cards can each player use, so if they are on different factions, you have somewhat ensured not stepping on each other cards. But still there are neutral faction cards, or trait-based access design, that eventually you could request the same card for too many copies.

With as many as 8 decks for 4 players game, it can get difficult to spot if combined amount of some cards are over the quantity that you have in your collection or not especially if each player built their decks separately. (Note that all these decks are valid rule-wise, just that you can't built them with one collection without a duplicate purchase.)

## Side Decks are virtual

Despite the above problem, Side Deck cards that each player could request you to bring, can technically combine to over physical quantity that you have because they are not in play. (Think of the as just a list of cards.) It is only a problem if they eventually decided to move those cards from Side Deck to main deck.

For example, all 4 players requested 2 copies of a card in their side deck, total to 8 copies. Game only give you 2 copies of this card because that is the maximum amount a single deck could use. You don't "need" 8 physical copies of this card until someone start moving them to main deck.

But in physical world those 2 physical copies need to be in someone's actual Side Deck, regardless of everyone's virtual list. If it ended up that someone else wants to move 1 copy that card into the main deck, they need to know whose Side Deck has the physical cards. At the same time deduct the possible quantity that everyone else could move into the main deck from 2 to 1.

This hints that this tool needs to be able to flag a "box" to differentiate main and side deck. When performing a "fill" action, a box that is flagged as side deck is more lenient : it could be incomplete as long as those physical copies could be obtained from someone else's side deck. It also then requires a "box of boxes" to specify possible "neighbors" that the Side Deck could be shared.

## Concurrent sessions

You as the only owner might want to run many concurrent sessions with different set of players and decks. In ideal world you would completely clean up everything back to collection and make new set of decks on each session switch. But that takes a lot of time, and it felt bad after you realized your 2nd or 3rd session doesn't have that many overlaps as you thought. (The characters you use are significantly different.)

But trying to move around as many little card as possible to switch session can be very confusing, especially when also allowing Side Deck to be virtual, as explained.

## Multiple choices

When you start having multiple concurrent sessions, other sessions started to became a target of cards you need to pull from as well, not just your collection anymore. 

And because there are multiple quantity of a card, you can make a choice where to pull that card from. For example the game gave you 2 copies of a card. To start the 1st session, someone need 1 copy of this card so you bring it out from your collection. There is 1 copy left in your collection. Now you want to switch to the 2nd concurrent session, and there is someone that need 1 copy of this card as well.

You have a choice of whether to bring this card from the 1st session, or bring the remaining copy out from your collection. These choices cannot be automatic. Sometimes logistic could be a problem (e.g. Collection is at home, but you have the 1st session cards right here), sometimes you want to prioritize not having to go back to the collection and want to move cards around between active sessions.

Depending on how you want to resolve these "conflicts", the session switch action is now order-dependent. Moving around physical cards to make a session active in different orders and different conflict resolution leads to different state of where all your physical cards are. It can make you feel quite uneasy until you could dissolve all sessions back to the collection to finally know they you still have every cards.

## Tallying incomplete collection

Because you get fixed amount of cards in LCGs, it is critical to tally your collection if you are not missing anything, even the so called binder fodder cards. A single missing card makes an incomplete collection. Getting a replacement is not easy as a unit of purchase is big, unlike CCGs where you could go buy singles.

You can do so when all the cards are finally back to the collection. Depending on how you organize your collection, instead of grand total count, you can check in smaller grouping and see if any group totals to less than expected.

But with multiple concurrent sessions combined with campaign-style game, cards might not come back to the collection for long time. As you switch active sessions back and forth, each time sometimes pulling new cards from the collection or move around cards between session, each time a player might update their Side Deck and so on. It can get messy and you don't know anymore where are a specific card.

A way to make you more confident in this situation is that you should be able to tally an incomplete collection / decks as well. A collection / inactive concurrent session will have less than required amount of cards. This tool should tell you how many cards those incomplete state supposed to have right now, so you can count and be confident that they are "correctly incomplete" at this moment.