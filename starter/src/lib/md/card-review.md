Do you want to submit a beginner-oriented, long-form review for this site, or are you just curious how the card reviews here differ from, say, arkhamdb.com?

In short, they work more like the medium- to long-form card reviews written in blogs like https://derbk.com/ancientevils/ than the "card comments" on arkhamdb.com. You can write long-form reviews on arkhamdb.com too, but its interface and style lean towards social interaction and short insights, or even a personal play story from one specific campaign with one specific investigator.

# Examples

Please find my reviews for "Paint the Town Red", "Lesson Learned", "Bandages", "Right Tool for the Job" to see what I'm going for.

You can also see extra features like sub-heading being card name. That affects how the site is compiled and forms rich network of cross-linking reviews. (e.g. If Bandages has a subsection about Isabelle Barnes, the Isabelle Barnes card review page now know that Bandages and other cards in the game that was linked to it.) How to do this is outlined in the below section about submitting your reviews.

# More explanations

- You want to "give a talk" about a single card, as if every card were an investigator card with infinite depth, so much so that you feel it'd look out of place on arkhamdb.com. Talk as if the game's brand new, just came out in 2026. Yes, you can be excited about Vicious Blow again here without sounding pretentious.
- You can state the obvious, which might not be obvious to beginners. You don't have to worry about whether something is technical enough to be worth stating. For example, the fact that there's a player window after an enemy has moved, or that you can have 2 copies of a card with a reaction trigger and trigger them at the same time, or that an AoO occurs before you move to a new location, can be stated repeatedly for beginners.
- You can confidently say what others have already said. Each review is standalone. Think of it as an article on your personal website. You are not building the page on top of others' comments. You don't need to say "no one has mentioned this yet", as is commonly seen on arkhamdb.com.
- It is Chapter 2 only by default, and moreover, each review must be pinned to a point in time of the Current Environment.

  If you say a card is the best at something or the best on some investigator, it is already implied that it is the best or worst among the cards in the pinned environment. You don't have to keep repeating the "ifs" or saying "this is a Chapter 2 review" for fear of getting comments like "why not use this or that obviously better card instead", and you don't have to feel obligated to update the review whenever the environment shifts.

  It also adds excitement to the prose. You can see an interesting phenomenon on arkhamdb.com in the reviews of new Core Set 2026 cards. Completely new players with zero knowledge of the game don't come there to talk excitedly about them, while veterans players can't help comparing them with 2000+ previous cards and end up thinking there is nothing else to say.

  On this site, where beginners are the audience by default, I think that makes writing an article within the environment pretty fun!

- Chapter 2 standard extends to the campaign side. For example, with evasion, aloof, elusive being more relevant, or how doubling up high XP cards might already be half of your possible XP earnings in Small Campaign Expansion. You can confidently say things about opportunity cost, and unlikely advantage of some cards that is purchase earlier or later in the campaign. 
- You can add a new review pinned to a different environment to build on an older, more thorough review, this time stating only your additional views because new cards were introduced and old cards rotated out. In this case, you are allowed to talk about the one product that was just pushed out. The UI can also state this fact.
- You can review from the perspective of a more limited pool within the pinned environment. For example, you might say it is the best option if you have just this one product and the Evergreen products. It's geared towards beginners, after all. For example, I've said that there is no damage healing card besides Bandages in Core 2026, until you get either Marie or Miguel decks.

# What doesn't fit well here

This is a niche site. These styles of review are better served on arkhamdb.com:

- A personal experience from one play, in one campaign, with one exact investigator, rather than a long-form general purpose review. Short comments and opinions, or small "did you know" tips about one specific combo or one specific investigator using the card. Here I highly recommend writing "from the ground up".
- Reviews that assume players have a full collection, which is extremely expensive. So many things get said that beginners can't really get excited about without spending more. This is already addressed by the environment pinning.

# Interested to submit a review?

This site is fully static and there is no input form. If you are interested in having your lengthy ramblings about one card here, you can write your review in the same format as a deck's description, as an `.md` file. Then send it to me as an attachment on Discord (`5argon`) or by e-mail (`pyasry@gmail.com`, please put something like "arkham-starter.com card review submission" in the subject so it is easier to notice), so I can add it and rebuild the site with the new review.

- File name format example: `5argon-the-grapevine-2.md` (name, card name, card level if needed for disambiguation)
- I recommend using the arkham.build deck description editor, which can add colored card links by pressing `Tab` and choose the style of "Paragraph (Colored)". Then copying the text into an `.md` file before sending it to me. Just create a dummy deck to use as your writing pad. It supports automatically saving unfinished writings too, even if your browser crashed without pressing Save!
- The `#` Markdown heading syntax gets special handling. If the heading contains a card link (e.g. `# [Izzie](/card/12013)`), it is rendered as a good-looking subsection with the text inside `[]` not mattering anymore. For example, "Lesson Learned" has a subsection specifically about "Daniela Reyes", so I put a link to the investigator card in the `#` heading. Unlike a card mentioned outside of `#`, this creates networks of review linking. When someone visits the Daniela Reyes card review page, they will see a link to "Lesson Learned" and all other cards mentioning it.
- You don't have to copy rules into your review. Put a rule from the Grimoire (the rules reference, also on https://arkham.build/rules) on a line of its own by its number, and the site quotes it in a small box with a link to it. The number is at the end of the rule's link on arkham.build, like `https://arkham.build/rules#grimoire-entry-1.098` for "Move".
  - `{{rule 1.098}}` quotes the whole rule.
  - `{{rule 1.098 "enter the new location"}}` quotes only the lines with those words. Add more `"phrases"` for more lines. Write a `"` inside a phrase as `\"`, like `{{rule 1.083 "the word \"would\" changes"}}`.
  - `{{rule 3.140 4}}` quotes only item 4 of a numbered list.
  - Please only use `>` for quoting rules. A review shows every `>` quote as a rule.
- You can also show one of the 5 timing diagrams (the 4 phases and the skill test) with a step highlighted. Put the step's number from the Grimoire on a line of its own. See my review of "Gather Intel" for one.
  - `{{timing 3.320}}` shows the Enemy phase with step 3.2 (hunter and patrol enemies move) highlighted.
  - `{{timing after 3.320}}` highlights the player window after step 3.2 instead. `before 3.330` points at the same one.
  - Put several together to highlight more, like `{{timing 3.320 after 3.320}}`.
  - Steps are numbered `3.110` to `3.460` for the 4 phases (step 1.1 to 4.6) and `4.001` to `4.008` for the skill test (step 1 to 8). `{{timing 3.100}}` to `{{timing 3.400}}` shows a phase with nothing highlighted.
- I don't mind about also having your review existing elsewhere as well (arkhamdb.com, your personal blog, your video channel, etc.) you are free to provide a link towards your original source. This link will have special rendering UI in the site. This might be good if you wanted more eyes (especially beginner's eyes) towards your work.