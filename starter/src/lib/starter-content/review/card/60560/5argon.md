---
by: 5argon
date: 2026-11-09
environment: evergreen
---

Get a draw to cover your mistakes while you're trying your best! That includes any Mythos Phase tests you're not good at. Even in the simplest case, when I can't do anything because an enemy is on me, I'll just evade or punch it for a chance to draw.

But Survivors are known to intentionally do their worst and try to get sneaky benefits from it : [<span class="fg-survivor">"Look what I found!"</span>](/card/12078), for example.

Then there are retry cards like [<span class="fg-survivor">Daniel Jameson</span>](/card/60555), [<span class="fg-survivor">Old Compass</span>](/card/60558), and [<span class="fg-survivor">Old Compass (2)</span>](/card/12083), which let you retry after drawing 1 card from [<span class="fg-survivor">Rabbit's Foot</span>](/card/60560), on top of their other benefits. If they get annoyed and just want to succeed, there's always [<span class="fg-survivor">Timely Intervention</span>](/card/12081), [<span class="fg-survivor">Timely Intervention (3)</span>](/card/60582), or [<span class="fg-survivor">Scrape By</span>](/card/12082).

It's a good reason to get [<span class="fg-neutral">Relic Hunter</span>](/card/12096) since 1 play cost is cheap, and then you can stack other game progressing accessories on top of it. For example, [<span class="fg-survivor">Isabelle Barnes</span>](/card/12013) might use [<span class="fg-mystic">Bloodstone</span>](/card/60457) for health and <span class="icon-willpower"></span>, with [<span class="fg-survivor">Rabbit's Foot</span>](/card/60560) providing the draw, and can even flex to double up 2x [<span class="fg-mystic">Bloodstone</span>](/card/60457) if needed.

# Using the newly drawn card against Retaliate / Alert

Daniela, with [<span class="fg-survivor">Rabbit's Foot</span>](/card/60560), failed her attack against a Retaliate enemy. She triggered its <span class="icon-reaction"></span> in the "after" of ST.6 to draw a card, and drew [<span class="fg-guardian">Lesson Learned</span>](/card/12022). Can she play [<span class="fg-guardian">Lesson Learned</span>](/card/12022) right away?

The same question might arise when evading an Alert enemy, and you have other cards that respond to attacks, like : [<span class="fg-guardian">Restrained</span>](/card/60165), [<span class="fg-mystic">Blood Ward</span>](/card/60472), [<span class="fg-mystic">Retribution</span>](/card/60473), [<span class="fg-guardian">Counterattack</span>](/card/12026).

Consequences are in ST.7. Retaliate happens as the final bad consequence of the test, after all other consequences (including ones you added with skills like [<span class="fg-survivor">On the Brink</span>](/card/60569)). Since you already had [<span class="fg-guardian">Lesson Learned</span>](/card/12022) in hand back in the "after" of ST.6, playing it here is no problem.

{{timing 4.006 4.007}}

{{rule 1.127 "after applying all results for that skill test, that enemy performs an attack against the attacking investigator"}}

{{rule 4.007 "Resolve the appropriate consequences"}}

# [<span class="fg-survivor">"Look what I found!"</span>](/card/12078)

You tried your best, investigated with no [<span class="fg-survivor">"Look what I found!"</span>](/card/12078) in hand, and failed by 1 or 2. You think, "At least I get a draw," and <span class="icon-reaction"></span> [<span class="fg-survivor">Rabbit's Foot</span>](/card/60560). You drew [<span class="fg-survivor">"Look what I found!"</span>](/card/12078). Can you play it right away, given that you have 2 resources?

Both [<span class="fg-survivor">Rabbit's Foot</span>](/card/60560) and [<span class="fg-survivor">"Look what I found!"</span>](/card/12078) must be triggered or played in ST.6, since that is where you determine that you've failed the skill test. "After" doesn't mean the next step. It denotes the ordering within that step. Since it is exactly the same ST.6 and the same "after", you get to sequence them however you like. In this case, you don't have [<span class="fg-survivor">"Look what I found!"</span>](/card/12078) at first, but you do after drawing a card. Any card you draw that uses the same "after" of ST.6 can be played.

{{timing 4.006}}

{{rule 4.006 "skill value is less than the difficulty" "by revealing the [auto_fail] symbol"}}

{{rule 1.150 "The word \"after\""}}

An example that won't work is [<span class="fg-survivor">Rabbit's Foot</span>](/card/60560) drawing into [<span class="fg-survivor">Scrape By</span>](/card/12082). Its timing is the "when" of ST.6, which has already passed, so you can no longer play it to turn the test into a success.

# [<span class="fg-survivor">Daniel Jameson</span>](/card/60555) / [<span class="fg-survivor">Old Compass</span>](/card/60558) / [<span class="fg-survivor">Old Compass (2)</span>](/card/12083)

If you squint, these retriers differ slightly in timing!

- [<span class="fg-survivor">Daniel Jameson</span>](/card/60555) : "<span class="icon-reaction"></span> After you fail" is the same timing as [<span class="fg-survivor">Rabbit's Foot</span>](/card/60560), [<span class="fg-survivor">"Look what I found!"</span>](/card/12078) and so on, so the retry is **queued** in the "after" of ST.6, if you decide to trigger that <span class="icon-reaction"></span>.
- [<span class="fg-survivor">Old Compass</span>](/card/60558) / [<span class="fg-survivor">Old Compass (2)</span>](/card/12083) : "If you fail" means the compass "adds a new consequence", like [<span class="fg-survivor">On the Brink</span>](/card/60569) and [<span class="fg-survivor">On the Brink (2)</span>](/card/12084) do (or positive ones like [<span class="fg-survivor">Do-or-Die</span>](/card/60568)), so the retry is **queued** within ST.7, if you choose to say yes to that "may".

Ultimately, tests in this game can't be nested. They get **queued** until the current test resolves. It's not like the new test happens right away within ST.6 or ST.7.

{{rule 1.135 "If the first skill test in a queue was part of an action, any subsequent skill tests do not initiate until that action has finished resolving."}}

As for [<span class="fg-survivor">Rabbit's Foot</span>](/card/60560), both retriers let you see the card drawn by [<span class="fg-survivor">Rabbit's Foot</span>](/card/60560) before you decide whether to retry.

- With [<span class="fg-survivor">Daniel Jameson</span>](/card/60555), which has exactly the same "after" ST.6 timing, you can sequence the <span class="icon-reaction"></span> of [<span class="fg-survivor">Rabbit's Foot</span>](/card/60560) to draw first, see the card, then decide whether to trigger the <span class="icon-reaction"></span> of [<span class="fg-survivor">Daniel Jameson</span>](/card/60555).
- With [<span class="fg-survivor">Old Compass</span>](/card/60558) / [<span class="fg-survivor">Old Compass (2)</span>](/card/12083), you would have already drawn a card with [<span class="fg-survivor">Rabbit's Foot</span>](/card/60560) back in ST.6, and can answer the "may" with that new card in hand.

# [<span class="fg-survivor">On the Brink (2)</span>](/card/12084)

To strengthen your understanding of [<span class="fg-survivor">Rabbit's Foot</span>](/card/60560)'s timing: [<span class="fg-survivor">On the Brink (2)</span>](/card/12084) adds a card draw on failure just like the <span class="icon-reaction"></span> of [<span class="fg-survivor">Rabbit's Foot</span>](/card/60560), but skill cards add their effects as an additional test **consequence**. So you get the card in ST.7, not in the earlier ST.6 like with [<span class="fg-survivor">Rabbit's Foot</span>](/card/60560).

Besides being a cool pop quiz, this likely only matters when you are also playing with [<span class="fg-survivor">Daniel Jameson</span>](/card/60555), whose <span class="icon-reaction"></span> condition is exactly the same "after" ST.6 as [<span class="fg-survivor">Rabbit's Foot</span>](/card/60560). So when you are deciding whether to retry with [<span class="fg-survivor">Daniel Jameson</span>](/card/60555), you have already seen the new card drawn by [<span class="fg-survivor">Rabbit's Foot</span>](/card/60560), but not yet the card drawn by [<span class="fg-survivor">On the Brink (2)</span>](/card/12084).

On the other hand, if you initiated the test with [<span class="fg-survivor">Old Compass</span>](/card/60558) / [<span class="fg-survivor">Old Compass (2)</span>](/card/12083), the "may attempt the test again" effect is added as a consequence, just like [<span class="fg-survivor">On the Brink (2)</span>](/card/12084). So you would be able to see the card drawn by [<span class="fg-survivor">On the Brink (2)</span>](/card/12084) as well before answering that question, since you can order the additional consequences as you wish.

{{rule 4.007 "If there are multiple results to be applied during this step, the investigator performing the test applies those results in the order of their choice."}}