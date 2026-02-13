# Team Assembler

Let's say you have quite a number of unplayed decks sitting for some time, and your other members has theirs too, or
maybe some teammates are OK to borrow other's deck. Anyway, it's time for a new adventure!

As you are all excitedly picking which decks for each players and talk about roles to fill, the biggest downer is going
to be when you find out at the end that the team you made ended up wanting some of very popular cards at the same
time ("Deck overlaps") despite carefully not choosing the same class of investigators. Deckbuilding Requirement is what
makes this game so interesting after all.

If the overlaps is difficult to resolve (replacing these cards throws deck balance off), it may leads to some members
having to pick an another deck they have in reserve, and it may lead to chain reaction that overlaps with an another
player that wasn't overlapping earlier, and so on.

It can gets quite tedious to try all the combinations among decks you have, and you may have overlooked some possible
cool compositions with low overlaps. I believe this is where computer is good at helping!

This tool will exhaustively make a team of **every possible combinations** among decks you input, returning some
insights, so you can make the final call what your party could be. It will do so for 2, 3, and 4 player count, literally
hundreds of combinations with just a few input decks.

Old time fans may not appreciate this tool that much, all the min-maxed decks in arkhamdb uses a few cards here and
there all over the place (which is also cost prohibitive) and pretty much rarely clash among other min-maxed decks. But
new players gotta start somewhere and along the way taking interest in deckbuilding. As they are trying to make use of
what they have and built their growing deck collection, it results in high overlaps due to concentration of card
creatively used to the fullest. I think this tool is very fitting for arkham-starter, a website for new generation
players slowly building their collections.

Ps. This tool can be thought of a standalone version of the core feature of the finished arkham-starter.com website.
Instead of entering decks manually, you can select and assemble your team from a lot of beginner friendly starter decks
using low pack count, which would unfortunately overlaps easier, and this tool will help resolve that.

## Workflow overview

1. Input tons of deck URL you are interested in, but not sure which among them would work together. They can come from
   different authors as well.
2. Press "Analyze" button and wait for it to download all the decks and try out all the team compositions for you.
3. Browse through the resulting teams which are sorted by degree of overlaps. You may find interesting comp with no or
   easy to resolve overlaps this way. Filtering, sorting, and "Current Team" feature may help finding what you want
   faster.

## Demo

This tool has a URL sharing feature which let you direct viewer to browse team comps, or for yourself to continue adding
more decks and get a new URL. I want to demo you this tool using this feature as well.

(Open each demo in a new tab by holding Ctrl / Cmd before clicking, or you cannot continue reading this documentation.)

### [Killbray's 5 Better Starter Decks](/tool/assembler?i=CgkKBTMzOTM3EAEKCQoFMzM5NDIQAQoJCgUzMzk0MxABCgkKBTMzOTQ0EAEKCQoFMzM5NDUQAQ%3D%3D)

There is no better set of decks that can prove the tool is working than this. Killbray modified the FFG crappy starter
deck around for Revised Core Set release making them all better, while **still preserving the ready-to-play nature**
because even if all 5 decks are built simultaneously, there is 0 overlap. (And you can play maximum of 4 in this game,
not 5.)

I know his decks are perfectly independent when even the "Zero Overlap Only" filter is checked, it does not affect the
outcome count at all. Two Players tab came out 10 combinations, Three Players tab came out 10 combinations, and lastly
Four Players tab came out 5 combinations. Combinatoric math just checks out!

### [10 decks using only 1 Investigator Expansion](/tool/assembler?i=CgkKBTM1NTg4EAEKCQoFMzU2OTMQAQoJCgUzNTgzOBABCgkKBTM1NDYwEAEKCQoFMzU1MTEQAQoJCgUzNzEzMxABCgkKBTM3MTMyEAEKCQoFMzYxMjcQAQoJCgUzNzEzMRABCgkKBTM2MTUzEAE%3D)

I have made 10 decks using only Edge of the Earth Investigator Expansion + Revised Core Set, for players onboarding the
repackaged format in 2021. (10 possible investigators) Though these decks are economical, the limited card pool also
increase the chance of overlaps greatly and it is not clear which can be played together, especially in 3+ players.
Granted, I designed these decks in a vacuum to be the best on its own, not thinking about the other decks in the team
also wanting to share the cards.

Immediately, I see 10 two players team that has 0 overlaps, and about 20 more teams with easy to resolve overlaps. The
real value is in three players tab. I was genuinely surprised at how some of these 3-man teams only mildly clash in
basic skill cards.

### [Multi-authors team compositions](/tool/assembler?i=CiMaIU15IGRlY2tzIChFZGdlIG9mIHRoZSBFYXJ0aCBvbmx5KQoJCgUzNTU4OBABCgkKBTM1NjkzEAEKCQoFMzU4MzgQAQoJCgUzNTQ2MBABCgkKBTM1NTExEAEKCQoFMzcxMzMQAQoJCgUzNzEzMhABCgkKBTM2MTI3EAEKCQoFMzcxMzEQAQoJCgUzNjE1MxABCjQaMlZhbGVudGluMTMzMSdzIGRlY2tzIChEdW53aWNoICsgRWRnZSBvZiB0aGUgRWFydGgpCgkKBTM2NDc4EAEKCQoFMzY0MDIQAQoJCgUzNjU0OBABCgkKBTM2NTEzEAEKCQoFMzY1MzgQAQ%3D%3D)

Supposed you go on and purchase The Dunwich Legacy Investigator Expansion following your first expansion Edge of the
Earth, as they release the repackage. Now you really want to try out the new Dunwich investigators with Edge of the
Earth cards you owned for a while. (It's like time travelling to the future, release-wise.)

User Valentin1331 has made that exact kind of decks, 5 decks using Revised Core Set + EotE + Dunwich expansions of 5
Dunwich investigators. Using this tool with those 5 decks
are [already insightful](/tool/assembler?i=CgkKBTM2NDc4EAEKCQoFMzY0MDIQAQoJCgUzNjU0OBABCgkKBTM2NTEzEAEKCQoFMzY1MzgQAQ%3D%3D),
but what if I ask to combine that result with the previous demo? Maybe there is an interesting 3 players team of Core
Set + Dunwich + Edge of the Earth investigators?

Visiting this demo reveals me an insight I could not found out on my own easily. There are even 2 teams with 0 overlap
in Three Players section, a very rare occurence. In the previous demo, there was no 0 overlap teams in Three Players
section. So more choices reveals more possibilities, which the tool will sort up for you. There is also quite a few four
players team that I think the overlaps are not hard to resolve.

This demo also shows it is possible to include comments (prefix with `//`) for organizational purpose.

## Decks compatible with this tool

All arkhamdb.com decks are usable. But it works to the fullest only if the deck contains **all the information** about
the cards it is going to use **in one deck**. There is no option to link 2 separated "0 XP deck" and "29 XP deck"
together to 1 entry.

Therefore the most suitable format is a 0 XP deck, that also lists all the cards used in upgrading in its **Side Deck**.
This kind of deck still can have a separated deck in its full XP glory if you want. (Or use
my [Upgrade Planner](/tool/upgrade) text export to note how to upgrade in the Description section and have just 1
version of the deck.) The point is this deck contains all the cards it is going to use in further into the campaign.

Each overlaps will be marked with `-S` if the entry came from the Side Deck section, help you evaluate the conflict even
more.

## Deck input secret features

In the text box that you paste the deck URL or ID, if the line starts with `//`, it is a comment instead. Comment is
displayed in the result as-is. The sharing URL feature remember just the deck's ID and not their readable URL, so when
coming back comments can be helpful if you used a lot of decks.

Additionally, if you type your comment in this format `// User:5argon (61394)`, deck ownership is enriched with a
readable name and a link you can follow, only if the user ID matches. This is unfortunately because arkhamdb only give
me the user ID with no way to get the name for published decks. We manually match the name this way. (If arkhamdb.com
some day expose an API that turn ID number into name, then this feature will be removed.)

## Current Team: Doing incremental composition

As more investigators are locked into the team, the analysis result below will be filtered more and more to help you
find the remaining members. Move a deck into the team by pressing the arrow button.

It can also be useful in situation like you are inviting new players to try out the game, and that player would like to
play a specific deck that they liked the story of that investigator, but you as a seasoned player can play whatever that
clash the least with that deck. Then you lock in the deck of that player, and browse the result below what can you
choose to go with it.

## Resolving overlaps

After you found some teams you would like to go with, inevitably with a bit of overlaps, you may proxy or move to
alternative cards on the cloned decks. You maybe wondering if there is anymore automated tool to help with doing that,
but no, it must be done in your head (lol!). It cannot possibly know what are "good alternative" of the conflicted
cards. This is as far as machine can go.

Here are general guidelines :

- You should remember if a card is very important or queued for removal on upgrades. For example, overlapping \*
  \*Unexpected Courage** or **Emergency Cache\*\* are often removed to make space for high level cards and not impacting
  the deck much if replaced with something else.
- If a card belongs to that investigator's limited splash cards quota, often it is a very important card. For example,
  Zoey using 1x **Holy Rosary** clashes with Agnes using 2x **Holy Rosary**. It might be a better idea to remove one
  from Agnes, since Zoey is using her 5 splash cards quota for this asset it's better be critical for something else
  down her high level Guardian cards.

However there are some kind of overlaps that can be solved easily :

- Overlaps of Permanent Asset cards can be easily pretended that you have one after spending the XP, or find a random
  piece of paper and write something on it. Since they do not need to go into the deck, a genuine card is not required.
- Overlaps of cards that has a bonus copy in Revised Core Set. For example, 3 decks all using Charisma card entry **from
  Dunwich Legacy** will be shown as overlaps 3/2, since Dunwich box gave you 2. However you actually have 4 copies, not
  2, because Revised Core Set also gave you 2 more.
- Overlaps of cards that has a duplicate in Investigator Starter Decks. This is very likely to be **Vicious Blow** and \*
  \*Deduction\*\* entry from Core Set. (arkhamdb never pick card entries from the Starter Decks if there is one in the Core
  Set.) If you have Nathaniel Cho or Harvey Walters, then you have 2 more copies of each that can resolve conflict
  naturally.
- Overlaps of generic Core Set draw-1 double icon skills. There are some other level 0 cards also with double icons or
  more, but not neutral and the draw effect is replaced with something else. Examples from the first 4 expansions :
  - Willpower : Cunning Distraction, Uncage the Soul, Logical Reasoning, Perseverance.
  - Combat : Oops!, "I'll see you in hell!", Coup de Grâce.
  - Intellect : "Look what I found!", Evidence!, Working a Hunch, Unearth the Ancients, Truth from Fiction.
  - Agility : "I'm outta here!", Hiding Spot, Waylay, Narrow Escape, Dumb Luck.
  - Wild : Rise to the Occassion, Inquiring Mind.

## Filters

Total combinations analyzed may be huge. You can apply some filters to narrow them down.

- **Respect Current Team** : Make the investigators locked into the team via "Current Team" feature effective. You can
  turn this off to ignore the feature temporarily but still keep your team.
- **No Same Class** : Do not include teams that has more than one of the same class. This is a popular and intuitive
  team composition rule. Note that some investigators of different classes can still clash into the same role and make a
  bad team. You still need some game knowledge to select the right one. Some investigator class can be deceiving (e.g.
  Edge of the Earth investigators), so turning this off may reveal something interesting too.
- **Limit 99 Results** : Cap to only 99 results after filtering and sorting, for each tab of player count. This is
  because with just about ~10 input decks, the combination can explodes to something absurd like 400 results in Four
  Players section.
- **Zero Overlap Only** : Only show teams with no overlap at all. You can gather cards for these teams without conflict
  resolution. But such results are very rare unless the decks are using very unconventional cards. So this is off by
  default.
- **No Same User** : Prevent building a team that contains deck published by the same arkhamdb.com user. Intended so
  that each player will get one of their own deck to play in the team. Unfortunately, arkhamdb.com does not expose
  username of "unpublished but public" deck. It can only do so for you for published decks. (Published deck also exposes
  only user ID number, there is no way to know the username from that ID.)

There is also one **built-in filter** applied : Teams with the same investigator by name are already removed. (You
cannot do so by the game rule, there is a unique star in front of investigator's name.) This make it possible to include
multiple decks of the same investigator and the tool will take care of not pairing among those decks for you.

## Sorting

The default "Less Overlap First" should be the choice you want, since you want to spend time playing the game more than
fixing a lot of overlaps.

There is an another sorting "Combination Order" which exists only because that was the way algorithm outputs before
sorting. There should be no reason you want to see this ordering other than curiousity. Supposed that there are 4 decks
`[A, B, C, D]`, then with Two Players, the ordering would be : `AB AC AD BC BD CD`.

## Coming soon?

Maybe not exactly soon, but a todo list.

- Filter out teams that use a card from Investigator Expansion you don't have.
