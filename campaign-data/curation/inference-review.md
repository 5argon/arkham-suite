# Achievement inference review

Per achievement: if a call is wrong, write your fix after **✏️** (leave blank if fine).
Legend — 🔮 inferred (auto from the log) · ✍️ manual (tick by hand) · ❓ needs your input.

---

## The Dream-Quest (`tdea`)

### ❓ Needs your input

#### `reunited` — Reunited and it Feels So Good

> Win The Dream-Eaters as an interconnected 8-part campaign, and have both groups reunite during the epilogue.

- Question: CROSS-CAMPAIGN: reunion pairs a tdea dreamers-outcome with a tdeb investigators-outcome (returned_to_reality/never_escaped/still_in_the_dreamlands live in tdeb). Mapping: anyOf[(nyarlathoteps_invasion_has_begun & returned_to_reality),(dreamers_awoke & returned_to_reality),(dreamers_stayed_in_dreamlands_forever & still_in_the_dreamlands),(never_escaped & dreamers_traveled_beneath_the_monastery)]. Needs linked-mode (8-part) cross-campaign inference — not yet supported.
- Scenario: — (campaign-wide)
- ✏️ This complicated condition should be handled by checking manually, not automatically. But we still validate partially by : when player check this, and it can't find either pair exist, we can still warn that there are expected logs that are prerequisite to earn this. Can we support this?

### 🔮 Inferred — check the rule

#### `follow_orders` — Do You Always Follow Orders?

> Do not stray from the path in Beyond the Gates of Sleep.

- Rule: NOT recorded: campaign_notes.strayed_from_the_path
- Scenario: beyond_the_gates_of_sleep
- ✏️

#### `losing_my_religion` — Losing My Religion

> In a single playthrough, find and uncover all 10 Signs of the Gods in The Search for Kadath.

- Rule: count[evidence_of_kadath] ≥ 10
- Scenario: the_search_for_kadath
- ✏️

#### `cat_killer` — Fantasy Flight Games (®) Does Not Condone Accomplishing This Achievement

> Break the law of Ulthar in The Search for Kadath.

- Rule: recorded: campaign_notes.broken_the_law_of_ulthar
- Scenario: the_search_for_kadath
- ✏️

#### `line_in_the_sand` — Line in the Sand

> Win The Dream-Quest campaign with at least three Ultimatums active.

- Rule: ultimatums ≥ 3
- Scenario: — (campaign-wide)
- ✏️

#### `dreamlands_expertise` — Dreamlands Expertise

> Win the The Dream-Quest campaign on Expert difficulty.

- Rule: difficulty = expert
- Scenario: — (campaign-wide)
- ✏️

#### `beware_black_cat` — Beware The Black Cat

> Complete The Dream-Eaters campaign with okay, fine, have it your way then recorded in your Campaign Log.

- Rule: recorded: campaign_notes.threaten_black_cat
- Scenario: — (campaign-wide)
- ✏️

### ✍️ Manual — no log trace (skim)

#### `so_cute` — Aww, But They're So Cute

> Do not defeat a single [[Zoog]] enemy in Beyond the Gates of Sleep.

- Why manual: Not defeating any Zoog is a mid-scenario play constraint; no campaign-log key records it.
- Scenario: beyond_the_gates_of_sleep
- ✏️

#### `spy` — Tactical Espionage Action

> Complete Dark Side of the Moon with each investigator's alarm level at zero.

- Why manual: Alarm levels at zero is a mid-scenario state not recorded in the campaign log.
- Scenario: dark_side_of_the_moon
- ✏️

#### `moon_lizard` — Moon Lizards? I Don't Believe They Exist

> Defeat the Moon Lizard in Dark Side of the Moon.

- Why manual: Defeating the Moon Lizard is a mid-scenario feat with no campaign-log trace.
- Scenario: dark_side_of_the_moon
- ✏️

#### `barkham` — Barkham Horror Enthusiast

> Defeat 1 or more Cats from Saturn using a fight ability on either a cat ally or a dog ally.

- Why manual: Defeating Cats from Saturn via a fight on an ally is a mid-scenario action, not logged.
- Scenario: dark_side_of_the_moon
- ✏️

#### `high_priest` — Only Way To Be Sure

> Reduce the High Priest Not to Be Described to 1 remaining health, then shove it down a well anyway in Where the Gods Dwell.

- Why manual: Shoving the High Priest down a well is a mid-scenario act with no recorded log entry.
- Scenario: where_the_gods_dwell
- ✏️

#### `hidden_nylar` — Give Them Something To Talk About

> In a single round, add every hidden form of Nyarlathotep to the victory display in Where the Gods Dwell.

- Why manual: Adding every hidden Nyarlathotep form in a single round is a mid-scenario timing feat; not logged.
- Scenario: where_the_gods_dwell
- ✏️

#### `final_form` — This Isn't Even My Final Form!

> Expose and then defeat Nyarlathotep's True Shape in Where the Gods Dwell.

- Why manual: Exposing and defeating the True Shape is a mid-scenario feat; no distinct campaign-log key.
- Scenario: where_the_gods_dwell
- ✏️

#### `dont_tell` — Don't Tell Anyone, But...

> Using the ability on The Great Hall, give 6 different hidden cards to another investigator in Where the Gods Dwell.

- Why manual: Using The Great Hall ability to pass 6 hidden cards is mid-scenario; not recorded.
- Scenario: where_the_gods_dwell
- ✏️

---

## The Web of Dreams (`tdeb`)

### 🔮 Inferred — check the rule

#### `remember_this_place` — I Remember This Place

> Find a way out of the Underworld in Point of No Return.

- Rule: recorded: campaign_notes.found_a_way_out_of_the_underworld
- Scenario: point_of_no_return
- ✏️

#### `line_in_the_sand` — Line in the Sand

> Win The Web of Dreams campaign with at least three Ultimatums active.

- Rule: ultimatums ≥ 3
- Scenario: — (campaign-wide)
- ✏️

#### `underworld_expertise` — Underworld Expertise

> Win the The Web of Dreams campaign on Expert difficulty.

- Rule: difficulty = expert
- Scenario: — (campaign-wide)
- ✏️

### ✍️ Manual — no log trace (skim)

#### `spiders` — Everyone's a Feminist Until There Is a Spider Around:

> Defeat twenty [[Spider]] enemies. Keep track with tally marks in your Campaign Log. (Note: swarm cards do not count.)

- Why manual: Tally of 20 defeated Spiders is tracked by the achievement counter itself (type:count, max:20); no count/investigatorCount log section records it (only steps_of_the_bridge count exists).
- Scenario: — (campaign-wide)
- ✏️

#### `carter_method` — The Carter Method

> Let every location get infested, then seal all of them in Waking Nightmare.

- Why manual: In-scenario feat (infest all locations then seal them in Waking Nightmare); no campaign-log entry.
- Scenario: waking_nightmare
- ✏️

#### `doctor_is_in` — The Doctor is In

> Take Dr. Shivani Maheswaran with you and do not let her take any amount of damage or horror in Waking Nightmare.

- Why manual: In-scenario feat (keep Dr. Maheswaran free of damage/horror); recruiting her is logged but the no-damage condition is not.
- Scenario: waking_nightmare
- ✏️

#### `deja_vu` — Déjà Vu

> Resolve every free triggered ability on every location in A Thousand Shapes of Horror (not counting the Mysterious Stairs during act 2).

- Why manual: In-scenario feat (resolve every free triggered ability on every location); not recorded.
- Scenario: a_thousand_shapes_of_horror
- ✏️

#### `casa_loma` — The Casa Loma Maneuver

> Escape the endless stairs with The Unnamable at the topmost staircase in A Thousand Shapes of Horror.

- Why manual: In-scenario feat (escape endless stairs with The Unnamable at topmost staircase); not recorded.
- Scenario: a_thousand_shapes_of_horror
- ✏️

#### `bad_advice` — Bad Advice

> Flip over every location at least once in Point of No Return.

- Why manual: In-scenario feat (flip over every location at least once); not recorded.
- Scenario: point_of_no_return
- ✏️

#### `march_of_ghouls` — March of the Ghouls

> Have 4 [[Ghoul]] enemies attached to Richard Upton Pickman in Point of No Return.

- Why manual: In-scenario feat (4 Ghouls attached to Pickman); not recorded.
- Scenario: point_of_no_return
- ✏️

#### `ishimura` — The Ishimura Flex

> In a single round, defeat all 4 Legs of Atlach-Nacha in Weaver of the Cosmos.

- Why manual: In-scenario feat (defeat all 4 Legs of Atlach-Nacha in a single round); not recorded.
- Scenario: weaver_of_the_cosmos
- ✏️

#### `spin_me_round` — You Spin Me Right 'Round:

> Ensure that Atlach-Nacha spins a full 360 degrees in a single phase in Weaver of the Cosmos.

- Why manual: In-scenario feat (Atlach-Nacha spins 360 degrees in a single phase); not recorded.
- Scenario: weaver_of_the_cosmos
- ✏️

#### `master_of_unlocking` — Master of Unlocking

> Use The Silver Key to cancel a total of at least 10 horror throughout the course of a single scenario.

- Why manual: In-scenario feat (cancel 10 horror with The Silver Key in one scenario); not recorded.
- Scenario: — (campaign-wide)
- ✏️

---

## The Innsmouth Conspiracy (`tic`)

### 🔮 Inferred — check the rule

#### `wake_up` — “You Wake Up In A Room...”

> Recover each of the following memories throughout The Innsmouth Conspiracy campaign:

- Rule: ALL of — recorded: memories_recovered.meeting_with_thomas_dawson; recorded: memories_recovered.battle_with_a_horrifying_devil; recorded: memories_recovered.decision_to_stick_together; recorded: memories_recovered.encounter_with_a_secret_cult; recorded: memories_recovered.a_deal_with_joe_sargent; recorded: memories_recovered.a_followed_lead; recorded: memories_recovered.an_intervention; recorded: memories_recovered.a_jailbreak; recorded: memories_recovered.discovery_of_a_strange_idol; recorded: memories_recovered.discovery_of_an_unholy_mantle; recorded: memories_recovered.discovery_of_a_mystical_relic; recorded: memories_recovered.conversation_with_mr_moore; recorded: memories_recovered.lifecycle_of_a_deep_one; recorded: memories_recovered.stinging_betrayal; recorded: memories_recovered.horrific_truth
- Scenario: — (campaign-wide)
- ✏️

#### `line_in_the_sand` — Line in the Sand

> Win The Innsmouth Conspiracy campaign with at least three Ultimatums active.

- Rule: ultimatums ≥ 3
- Scenario: — (campaign-wide)
- ✏️

#### `expertise` — Innsmouth Expertise

> Win The Innsmouth Conspiracy campaign on Expert difficulty.

- Rule: difficulty = expert
- Scenario: — (campaign-wide)
- ✏️

### ✍️ Manual — no log trace (skim)

#### `die_already` — Would You Just Die Already

> Defeat The Amalgam 5 or more times in The Pit of Despair.

- Why manual: Defeating The Amalgam 5+ times in The Pit of Despair is an in-scenario feat with no campaign-log record.
- Scenario: the_pit_of_despair
- ✏️

#### `elementary` — Elementary, Dear Dawson

> Guess both the correct [[Suspect]] and [[Hideout]] in The Vanishing of Elina Harper.

- Why manual: Hidden accuse\_\* entries record which suspect/hideout was accused, and mission_succeeded exists, but no log key records the CORRECT answer, so a correct double-guess can't be derived from recorded keys. [confirmed manual by review]
- Scenario: the_vanishing_of_elina_harper
- ✏️

#### `no_break_stride` — Ain’t Nothin Gonna Break My Stride

> Destroy every barrier in In Too Deep.

- Why manual: Destroying every barrier in In Too Deep is an in-scenario feat not recorded in the campaign log.
- Scenario: in_too_deep
- ✏️

#### `speeding_ticket` — Speeding Ticket

> Reach Falcon Point Approach without voluntarily stopping any vehicles, getting out of any vehicles, or entering a copy of Long Way Around in Horror in High Gear.

- Why manual: Log records reached_falcon_point_before/after_sunrise, but that is not the same as never stopping/exiting a vehicle or avoiding Long Way Around. [confirmed manual by review]
- Scenario: horror_in_high_gear
- ✏️

#### `locked_in_here` — You’re Locked In Here With Me

> Complete A Light in the Fog without any investigators getting captured.

- Why manual: Completing A Light in the Fog without any investigator captured is an in-scenario state not recorded in the campaign log.
- Scenario: a_light_in_the_fog
- ✏️

#### `fish_out_of_water` — Fish Out of Water

> Complete Into the Maelstrom with each investigator still wearing their Diving Suits.

- Why manual: Each investigator still wearing their Diving Suit at the end of Into the Maelstrom is a board state not recorded in the campaign log (possesses_a_diving_suit is recorded in A Light in the Fog, not at the finale).
- Scenario: into_the_maelstrom
- ✏️

#### `dont_wake_daddy` — Don’t Wake Daddy

> Complete both The Lair of Dagon and Into the Maelstrom without waking Dagon or Hydra.

- Why manual: dagon_still_slumbers/dagon_has_awakened exist for Dagon, but no log entry represents Hydra's state. [confirmed manual by review]
- Scenario: — (campaign-wide)
- ✏️

#### `gone_fishing` — Gone Fishing

> Defeat 20 [[Deep One]] enemies. Keep track with tally marks in your Campaign Log.

- Why manual: Tally of 20 Deep One defeats is tracked only on the achievement itself (type count max 20); there is no count/investigatorCount section recording Deep One kills.
- Scenario: — (campaign-wide)
- ✏️

#### `full_build` — Full Build

> Equip the Waveworn Idol, Awakened Mantle and Headdress of Y’ha-nthlei at the same time.

- Why manual: Equipping the three relics simultaneously is an in-scenario board state not recorded in the campaign log.
- Scenario: — (campaign-wide)
- ✏️

#### `bigger_fish` — Bigger Fish to Fry

> Complete The Innsmouth Conspiracy campaign without defeating a single [[Deep One]] enemy.

- Why manual: Completing the campaign without defeating any Deep One is not recorded; no campaign-log section tracks Deep One defeats.
- Scenario: — (campaign-wide)
- ✏️

---

## Edge of the Earth (`eoe`)

### 🔮 Inferred — check the rule

#### `safe_bet` — Safe Bet

> Camp at a location with a shelter value of 8 in Ice and Death, Part I.

- Rule: recorded: campaign_notes.camp_crystalline_cavern
- Scenario: ice_and_death_part_1
- ✏️

#### `in_your_head` — In Your Head

> Finish Fatal Mirage with nine story cards in the victory display.

- Rule: section[memories_banished] count ≥ 9
- Scenario: fatal_mirage
- ✏️

#### `knock_knock` — Knock, Knock

> Collect, activate, and place all five seals in The Heart of Madness, Part I.

- Rule: ALL of — recorded: seals_placed.seal_a; recorded: seals_placed.seal_b; recorded: seals_placed.seal_c; recorded: seals_placed.seal_d; recorded: seals_placed.seal_e
- Scenario: the_heart_of_madness_part_1
- ✏️

#### `the_cold_never_bothered_me` — The Cold Never Bothered Me

> Win the Edge of the Earth campaign with eight [frost] tokens in the chaos bag at the end of the campaign.

- Rule: chaosToken
- Scenario: — (campaign-wide)
- ✏️

#### `hell_froze_over` — Hell Froze Over

> Win the Edge of the Earth campaign with zero [frost] tokens in the chaos bag at the end of the campaign.

- Rule: chaosToken
- Scenario: — (campaign-wide)
- ✏️

#### `there_and_back_again` — There and Back Again

> Win the Edge of the Earth campaign with each of the following survivors:

- Rule: per item (9) — partnerStatus, …
- Scenario: — (campaign-wide)
- ✏️

#### `line_in_the_snow` — Line in the… Snow

> Win the Edge of the Earth campaign with at least three Ultimatums active.

- Rule: ultimatums ≥ 3
- Scenario: — (campaign-wide)
- ✏️

#### `antarctic_expertise` — Antarctic Expertise

> Win the Edge of the Earth campaign on Expert difficulty

- Rule: difficulty = expert
- Scenario: — (campaign-wide)
- ✏️

### ✍️ Manual — no log trace (skim)

#### `look_at_all_this_stuff` — Look at All This Stuff!

> Recover all seven supplies in Ice and Death, and carry all of them to The Summit in To the Forbidden Peaks.

- Why manual: Derivable in principle: all 7 supplies recovered AND none crossed off (cross_off_missing_expedition_assets). But the supplies_recovered section is not exposed as -en entries yet — needs supply-tracking plumbing.
- Scenario: to_the_forbidden_peaks
- ✏️

#### `chaos_chaos` — Chaos Chaos

> Collect and spend a total of ten or more keys in City of the Elder Things.

- Why manual: Scenario tie is city_of_the_elder_things — kohaku now models City of the Elder Things as ONE scenario (the three versions are setup-card presentation only, not distinct scenario identities).
- Scenario: city_of_the_elder_things
- ✏️

#### `mad_with_power` — Mad With Power

> Simultaneously exhaust fifteen copies of The Nameless Madness in The Heart of Madness, Part II.

- Why manual: Exhausting fifteen Nameless Madness copies is an in-scenario board state, not recorded.
- Scenario: the_heart_of_madness_part_2
- ✏️

#### `construct_additional_pylons` — Construct Additional Pylons

> Collapse all five Mist-Pylons and escape with your life in The Heart of Madness, Part II.

- Why manual: Collapsing all five Mist-Pylons and escaping is an in-scenario feat; no log section records pylon collapses.
- Scenario: the_heart_of_madness_part_2
- ✏️

#### `the_sound_of_madness` — The Sound of Madness

> Draw 10 copies of "Tekeli-li!" during a single game.

- Why manual: Drawing 10 Tekeli-li tokens in one game is an in-scenario event; no count section exists for it.
- Scenario: — (campaign-wide)
- ✏️

#### `sorry_im_all_out_of_dog_puns` — Sorry, I'm All Out of Dog Puns

> Have Anyu and four or more other assets with "Dog" in their title in play at the same time.

- Why manual: Anyu plus four Dog assets in play is an in-scenario board state, not recorded.
- Scenario: — (campaign-wide)
- ✏️

#### `kind_of_a_hat_on_a_hat` — Kind of a Hat on a Hat

> Play a Wooden Sledge from a Backpack, then immediately use its ability to attach a backpack to it.

- Why manual: Playing a Wooden Sledge from a Backpack and re-attaching is a card-play sequence with no log trace.
- Scenario: — (campaign-wide)
- ✏️

#### `this_was_your_idea` — This Was Your Idea

> Use Professor William Dyer's ability to heal at least 4 horror from Danforth during a single scenario.

- Why manual: Healing 4 horror from Danforth via Dyer's ability is an in-scenario action; no count section records it.
- Scenario: — (campaign-wide)
- ✏️

#### `no_respect_for_the_dead` — No Respect For the Dead

> Control at least five assets from the Memorials of the Lost encounter set at the same time.

- Why manual: Controlling five Memorials of the Lost assets at once is an in-scenario board state, not recorded.
- Scenario: — (campaign-wide)
- ✏️

#### `wuk_wuk_boom` — Wuk Wuk Boom

> Use Dynamite to defeat two Giant Albino Penguins at the same time.

- Why manual: Using Dynamite to defeat two Giant Albino Penguins at once is an in-scenario feat with no log trace.
- Scenario: — (campaign-wide)
- ✏️

#### `abandoned_and_alone` — Abandoned and Alone

> Win the Edge of the Earth campaign without ever bringing a partner asset along with you during a scenario.

- Why manual: expedition_team is a partner-status section and confronted-demons is in campaign_notes, but no entry records per-scenario 'brought a partner along'. [confirmed manual by review]
- Scenario: — (campaign-wide)
- ✏️

#### `friends_forever` — Friends Forever

> Bring the same partner with you in each scenario, ensure that they have confronted their demons, and win the Edge of the Earth campaign with them still alive.

- Why manual: Confronted-demons is recorded per partner in campaign_notes and partner alive/dead is in expedition_team, but 'bring the SAME partner in each scenario' is a per-scenario selection not logged. [confirmed manual by review]
- Scenario: — (campaign-wide)
- ✏️

---

## The Scarlet Keys (`tskc`)

### ❓ Needs your input

#### `all_hollow` — All Hollow

> Learn about a place where Outsiders dwell and travel there to unlock Without a Trace.

- Question: Does reaching/playing scenario 26 'Without a Trace' leave a campaign-log entry that uniquely marks it was unlocked (e.g. is the presence of any scenario-26 entry like cell_blew_the_whistle sufficient to imply it was played/unlocked), or is unlocking it untracked in the campaign log?
- Scenario: without_a_trace
- ✏️ Either the cell blew the whistle, the cell threw away the whistle must be recorded when you visit there so either being present can imply this achievement.

### 🔮 Inferred — check the rule

#### `red_looks_good` — Red Looks Good on Me

> Join the Red Coterie in Congress of the Keys.

- Rule: recorded: campaign_notes.cell_joined_the_red_coterie
- Scenario: congress_of_the_keys
- ✏️

#### `bloody_red` — Bloody Red Revolution

> Overthrow the Red Coterie in Congress of the Keys.

- Rule: recorded: campaign_notes.cell_overthrew_the_red_coterie
- Scenario: congress_of_the_keys
- ✏️

#### `speed_demon` — Speed Demon

> Win The Scarlet Keys campaign with only 17 or fewer time passed.

- Rule: count[time] ≤ 17
- Scenario: — (campaign-wide)
- ✏️

#### `badge` — Here is Your Badge

> Win The Scarlet Keys campaign and earn yourself a permanent position in the Foundation.

- Rule: recorded: campaign_notes.cell_was_given_a_permanent_position
- Scenario: — (campaign-wide)
- ✏️

#### `heart` — Key to My Heart

> Collect each of the following keys throughout The Scarlet Keys campaign:

- Rule: per item (11) — recorded in section[keys]: eye_of_ravens, …
- Scenario: — (campaign-wide)
- ✏️

#### `line_in_sand` — Line in the Sand

> Win The Scarlet Keys campaign with at least three Ultimatums active.

- Rule: ultimatums ≥ 3
- Scenario: — (campaign-wide)
- ✏️

#### `global_expertise` — Global Expertise

> Win The Scarlet Keys campaign on Expert difficulty.

- Rule: difficulty = expert
- Scenario: — (campaign-wide)
- ✏️

### ✍️ Manual — no log trace (skim)

#### `clued_in` — Clued In

> Do not spend or drop a single clue via treachery cards in Riddles and Rain.

- Why manual: No-clue-spent-via-treachery feat in Riddles and Rain; not recorded in any campaign-log key.
- Scenario: riddles_and_rain
- ✏️

#### `take_that` — Take That, Ghulat

> Ensure that not a single civilian is slain in Dead Heat.

- Why manual: Civilian slain tally tracked only in hidden per-scenario count entry (dh_slain_civilians) inside the hidden section, not a referenceable count-section id; not expressible via logCount.
- Scenario: dead_heat
- ✏️

#### `whats_in_a_name` — What’s in a Name?

> Tell Amaranth her real name in Dead Heat.

- Why manual: Note: campaign_notes.cell_knows_amaranths_real_name records that the cell KNOWS Amaranth's name (learned in Quid Pro Quo SF), but the achievement is specifically TELLING Amaranth her name in Dead Heat, a distinct mid-scenario choice with no log entry. Manual.
- Scenario: dead_heat
- ✏️

#### `porque` — Porque No Los Dos?

> Defeat both copies of Desi simultaneously in Dancing Mad.

- Why manual: Defeating both Desi copies simultaneously is an in-scenario combat feat with no log trace.
- Scenario: dancing_mad
- ✏️

#### `lost_and_found` — Lost and Found

> Take control of the Twisted Antiprism without a single clue on Clues Unveiled in Dealings in the Dark.

- Why manual: Taking the Twisted Antiprism with no clues on Clues Unveiled is a mid-scenario board-state feat; not logged.
- Scenario: dealings_in_the_dark
- ✏️

#### `tower_defense` — I Like Tower Defense Games

> Defend The Claret Knight without any Key Locuses being destroyed in Dogs of War v. I.

- Why manual: Defending the Claret Knight with no Key Locuses destroyed is an in-scenario feat; not logged.
- Scenario: dogs_of_war
- ✏️

#### `play_with_food` — Play With Your Food

> Steal The Light of Pharos from either The Claret Knight or The Beast in a Cowl of Crimson while they have exactly 1 health remaining in Dogs of War v. II or v. III.

- Why manual: Stealing The Light of Pharos at exactly 1 health is an in-scenario timing feat; not logged.
- Scenario: dogs_of_war
- ✏️

#### `destroyed_chimera` — More Like “Destroyed” Chimera

> Defeat all five forms of the Void Chimera in a single session of On Thin Ice.

- Why manual: Defeating all five Void Chimera forms in one session is an in-scenario feat; not logged.
- Scenario: on_thin_ice
- ✏️

#### `watch_watcher` — Who Watches the Watcher?

> Unlock a secret final act in Sanguine Shadows.

- Why manual: Unlocking a secret final act in Sanguine Shadows is an in-scenario branch; only hidden notes (cast_a_light/seeing_red) exist, no referenceable campaign-log outcome entry.
- Scenario: sanguine_shadows
- ✏️

#### `under_umbrella` — Under My Umbrella

> Do not let Tzu San Niang devour a single Geist enemy in Shades of Suffering.

- Why manual: Preventing Tzu San Niang from devouring any Geist is an in-scenario feat; not logged.
- Scenario: shades_of_suffering
- ✏️

#### `powers_combined` — With Your Powers Combined…

> Shift 5 keys in a single turn.

- Why manual: Shifting 5 keys in a single turn is an in-scenario action feat; not logged.
- Scenario: — (campaign-wide)
- ✏️

#### `gift_of_gab` — Gift of Gab

> Ensure that Commissioner Taylor orders you to “talk” 3 times during a single campaign.

- Why manual: Taylor ordering you to 'talk' 3 times is an in-play occurrence with no campaign-log counter.
- Scenario: — (campaign-wide)
- ✏️

#### `cuisine` — “I’m Just Here for the Local Cuisine”

> In a single campaign, sample cuisine and/or visit bars or cafes from the following locations: Marrakesh, Havana, Buenos Aires, Tokyo, and Kuala Lumpur.

- Why manual: Sampling cuisine/bars across the listed cities is a flavor feat with no recorded log key.
- Scenario: — (campaign-wide)
- ✏️

#### `trust_nobody` — Trust Nobody

> Win The Scarlet Keys campaign with 4 [elder_thing] tokens in the chaos bag and without ever removing any [elder_thing] tokens.

- Why manual: Chaos-bag composition (4 elder_thing tokens, never removed) is not recorded in the campaign log.
- Scenario: — (campaign-wide)
- ✏️

#### `trust_everybody` — Trust Everybody

> Win The Scarlet Keys campaign with 4 [tablet] tokens in the chaos bag and without ever removing any [tablet] tokens.

- Why manual: Chaos-bag composition (4 tablet tokens, never removed) is not recorded in the campaign log.
- Scenario: — (campaign-wide)
- ✏️

---

## The Drowned City (`tdc`)

### ❓ Needs your input

#### `skip_to_the_end` — Skip to the End

> Defeat Cthulhu in Sepulchre of the Sleeper.

- Question: In Sepulchre of the Sleeper, does recording campaign_notes.halted_cthulhus_awakening correspond exactly to defeating Cthulhu in that scenario, or can the awakening be halted without defeating Cthulhu (making the achievement a stricter sub-case)?
- Scenario: sepulchre_of_the_sleeper
- ✏️ That's right, halted_cthulhus_awakening always implies defeating it.

#### `obligations` — Obligations

> Finish The Drowned City campaign with the following tasks completed:

- Question: Is per-task completion derivable for the eight obligations tasks (walk*in_faith, toe_the_line, good_money, prove_your_worth, dreams_of_destruction, do_no_harm, no_place_like_home, plumb_the_depths)? The log only has hidden picked*\* notes (chosen) plus a single hidden 'tasks_done' note and the 'task_progress' investigatorCount section — does any of these encode that all eight specific tasks were completed?
- Scenario: — (campaign-wide)
- ✏️All tasks are completed if it has 5 progress or higher. So if dynamic inference works in other campaigns like FHV for checking relationship, this here should work the same way.

### 🔮 Inferred — check the rule

#### `one_first_last_job` — One First Last Job

> Complete The Drowned City campaign once on any difficulty.

- Rule: ANY of — recorded: campaign_notes.cthulhu_annihilated_the_city_of_arkham; recorded: campaign_notes.cthulhu_was_driven_away; recorded: campaign_notes.cthulhu_was_banished; recorded: campaign_notes.cthulhu_was_banished_but_arkham_was_destroyed
- Scenario: — (campaign-wide)
- ✏️

#### `alien_dropout` — Alien School Dropout

> Complete the campaign without translating a single alien glyph.

- Rule: count[glyphs] ≤ 0
- Scenario: — (campaign-wide)
- ✏️

#### `alien_grad` — Alien School Graduate

> Translate all 26 alien glyphs during a single playthrough of The Drowned City campaign.

- Rule: count[glyphs] ≥ 26
- Scenario: — (campaign-wide)
- ✏️

#### `empty_handed` — Empty Handed

> Return from R'lyeh without having collected any [[Artifact]] story assets.

- Rule: count[artifacts_earned] ≤ 0
- Scenario: — (campaign-wide)
- ✏️

#### `powers_combined` — With Your Powers Combined…

> Finish The Drowned City campaign having earned the following artifacts:

- Rule: ALL of — recorded: artifacts_earned.barrier_node; recorded: artifacts_earned.obsidian_claw; recorded: artifacts_earned.shard; recorded: artifacts_earned.grisly_mask; recorded: artifacts_earned.tidal_tablet; recorded: artifacts_earned.clah_horror
- Scenario: — (campaign-wide)
- ✏️

#### `line_in_the_sand` — Line in the Sand

> Win The Drowned City campaign with at least three Ultimatums active.

- Rule: ultimatums ≥ 3
- Scenario: — (campaign-wide)
- ✏️

#### `expertise` — R’lyeh Expertise

> Win The Drowned City campaign on Expert difficulty.

- Rule: difficulty = expert
- Scenario: — (campaign-wide)
- ✏️

### ✍️ Manual — no log trace (skim)

#### `season_two` — Season Two

> Play through the campaign on hard or expert mode using 4 investigators from 4 different previous campaigns.

- Why manual: Difficulty is recorded, but investigator provenance (4 from 4 different previous campaigns) is not captured in the campaign log.
- Scenario: — (campaign-wide)
- ✏️

#### `cliff` — Cliff Diver

> Complete the campaign without ever bringing a diving suit along.

- Why manual: Whether a diving suit was ever brought along is an in-scenario equipment choice not recorded in the campaign log.
- Scenario: — (campaign-wide)
- ✏️

#### `coup` — This is a Coup

> Defeat both Naomi O’Bannion and Sadie Sheldon in One Last Job using only the act 3a parley ability.

- Why manual: Defeating both targets using only the act 3a parley ability is an in-scenario method, not recorded.
- Scenario: one_last_job
- ✏️

#### `search` — Thorough Search

> End The Western Wall with every location revealed.

- Why manual: Ending The Western Wall with every location revealed is in-scenario board state, not recorded in the log.
- Scenario: the_western_wall
- ✏️

#### `tidal_flip` — Tidal Flip Minigame

> Complete The Drowned Quarter with each location revealed and not flooded.

- Why manual: Each location revealed and not flooded at end of The Drowned Quarter is in-scenario state, not recorded.
- Scenario: the_drowned_quarter
- ✏️

#### `acolyte` — No Acolyte Left Behind

> Rescue 5 cultists in The Apiary.

- Why manual: Rescuing 5 cultists in The Apiary is an in-scenario count; only hidden saved/devoured outcome flags exist, not a rescued-cultist tally.
- Scenario: the_apiary
- ✏️

#### `kill_the_adds` — Kill the Adds

> Defeat Mother in The Apiary using only her Forced effect.

- Why manual: Defeating Mother using only her Forced effect is an in-scenario method, not recorded.
- Scenario: the_apiary
- ✏️

#### `deep_end` — In The Deep End

> Escape The Grand Vault with the Tidal Tablet after every location has been fully flooded.

- Why manual: Escaping with the Tidal Tablet after every location fully flooded is an in-scenario board condition; only artifact-earned is recorded, not the flooded-while-escaping requirement.
- Scenario: the_grand_vault
- ✏️

#### `sorry` — Sorry, Didn’t See You There

> Beat Court of the Ancients without moving the Great Lift after the Colossal Tyrant spawns.

- Why manual: Not moving the Great Lift after the Colossal Tyrant spawns is an in-scenario action constraint, not recorded.
- Scenario: court_of_the_ancients
- ✏️

#### `sky_rider` — Sky Rider

> End your turn in open sky at least 5 times during a single game of Obsidian Canyons.

- Why manual: Ending your turn in open sky 5 times in a single game is in-scenario play, not recorded.
- Scenario: obsidian_canyons
- ✏️

#### `stay_dead` — WHY. WON’T. YOU. STAY. DEAD?!

> Add The Inescapable to the victory display at least 20 times during a single campaign.

- Why manual: Adding The Inescapable to the victory display 20 times in a campaign is an in-scenario tally not recorded in the log.
- Scenario: — (campaign-wide)
- ✏️

---

## The Feast of Hemlock Vale (`fhv`)

### 🔮 Inferred — check the rule

#### `apertif` — Aperitif

> Complete The Feast of Hemlock Vale campaign once on any difficulty.

- Rule: ANY of — recorded: campaign_notes.the_vale_was_saved; recorded: campaign_notes.the_vale_burned; recorded: campaign_notes.barely_survived; recorded: campaign_notes.became_the_true_feast_of_hemlock_vale; recorded: campaign_notes.investigators_sacrificed_themselves_for_the_vale
- Scenario: — (campaign-wide)
- ✏️

#### `life_of_the_party` — Life of the Party

> Complete The Feast of Hemlock Vale campaign with each resident at Relationship Level 2 or higher.

- Rule: ALL of — count[rachel] ≥ 2; count[leah] ≥ 2; count[simeon] ≥ 2; count[william] ≥ 2; count[river] ≥ 2; count[gideon] ≥ 2; count[judith] ≥ 2; count[theo] ≥ 2
- Scenario: — (campaign-wide)
- ✏️

#### `settling_the_score` — Settling the Score

> Defeat the Thing in the Depths in The Thing in the Depths.

- Rule: recorded: campaign_notes.thing_in_the_depths_was_defeated
- Scenario: the_thing_in_the_depths
- ✏️

#### `high_dive` — High Dive

> Sacrifice yourself for the Vale in Fate of the Vale.

- Rule: recorded: campaign_notes.investigators_sacrificed_themselves_for_the_vale
- Scenario: fate_of_the_vale
- ✏️

#### `best_friends_forever` — Best Friends Forever!

> Reach Relationship Level 6 with the following residents:

- Rule: per item (5) — count[leah] ≥ 6, …
- Scenario: — (campaign-wide)
- ✏️

#### `know_your_place` — Know Your Place

> Win The Feast of Hemlock Vale campaign with Mother Rachel at Relationship Level 3.

- Rule: count[rachel] ≥ 3
- Scenario: — (campaign-wide)
- ✏️

#### `heart_of_steel` — Heart of Steel

> Win The Feast of Hemlock Vale campaign with Judith Park at Relationship Level 7.

- Rule: count[judith] ≥ 7
- Scenario: — (campaign-wide)
- ✏️

#### `holding_out_for_a_himbo` — Holding Out for a Himbo

> Win The Feast of Hemlock Vale campaign with Theo Peters at Relationship Level 7.

- Rule: count[theo] ≥ 7
- Scenario: — (campaign-wide)
- ✏️

#### `line_in_the_sand` — Line in the Sand

> Win The Feast of Hemlock Vale campaign with at least three Ultimatums active.

- Rule: ultimatums ≥ 3
- Scenario: — (campaign-wide)
- ✏️

#### `hemlock_expertise` — Hemlock Expertise

> Win The Feast of Hemlock Vale campaign on Expert difficulty

- Rule: difficulty = expert
- Scenario: — (campaign-wide)
- ✏️

### ✍️ Manual — no log trace (skim)

#### `unshattered` — Unshattered

> Achieve every ending in this campaign.

- Why manual: "Achieve every ending" spans multiple separate playthroughs; a single campaign log can only ever hold one ending. Cross-playthrough meta-achievement with no single-log trace.
- Scenario: — (campaign-wide)
- ✏️

#### `a_strong_silent_type` — A Strong, Silent Type

> Finish The Feast of Hemlock Vale campaign without voluntarily triggering any codex entries.

- Why manual: "Without voluntarily triggering any codex entries." Codex entries are hidden-section notes (fhv*\*\_codex*\*) confirmed in fhv-db.json as hidden:true internal branching flags. The achievement is about NOT triggering optional ones; there is no positive log proving abstention.
- Scenario: — (campaign-wide)
- ✏️

#### `colour_outside_the_lines` — Colour Outside the Lines

> Skip both The Twisted Hollow and The Longest Night during a single playthrough.

- Why manual: "Skip both The Twisted Hollow and The Longest Night." Skipping a scenario leaves no positive log; the per-scenario notes (e.g. western_woods, faced_the_night_alone) only appear when the scenario IS played, and their absence is not reliably distinguishable from other branches. In-scenario routing choice with no affirmative trace.
- Scenario: — (campaign-wide)
- ✏️

#### `dancing_queen` — Dancing Queen

> Share a dance with 4 different residents during The Second Evening prelude.

- Why manual: "Share a dance with 4 different residents during The Second Evening." Per-resident dance notes exist (leah/simeon/william/river/gideon/judith/theo \_shared_a_dance plus campaign_notes.helen_shared_a_dance), but the DSL has no count-of-distinct-keys-across-sections operator; requiring 4 distinct from a set of 8 is not expressible as a simple log/logCount rule.
- Scenario: — (campaign-wide)
- ✏️

#### `audrey_3` — Audrey III

> Complete a scenario engaged with a Poisonblossom having 10 or more overgrowth on it.

- Why manual: "Complete a scenario engaged with a Poisonblossom having 10+ overgrowth." Pure in-scenario board state; nothing recorded in the campaign log.
- Scenario: — (campaign-wide)
- ✏️

#### `hold_onto_your_potatoes` — Hold on to your Potatoes!

> Complete Written in Rock with both a resident and the Prismatic Shard asset under your control.

- Why manual: "Complete Written in Rock with both a resident and the Prismatic Shard asset under your control." In-scenario control/asset state; no campaign-log trace.
- Scenario: written_in_rock
- ✏️

#### `dream_home_breakover` — Dream Home Breakover

> Complete Hemlock House with 10 locations in the victory display.

- Why manual: "Complete Hemlock House with 10 locations in the victory display." In-scenario victory-display count; not logged in the campaign data.
- Scenario: hemlock_house
- ✏️

#### `here_crabby_crabby` — “Here, Crabby Crabby!”

> Make the Limulus Hybrid flip at least 8 times during The Lost Sister.

- Why manual: "Make the Limulus Hybrid flip at least 8 times during The Lost Sister." In-scenario flip counter; nothing recorded in the campaign log.
- Scenario: the_lost_sister
- ✏️

#### `a_different_kind_of_string_ops` — A Different Kind of Sting Ops

> Complete The Silent Heath without spawning the Brood Queen.

- Why manual: "Complete The Silent Heath without spawning the Brood Queen." In-scenario enemy-spawn avoidance; no affirmative log entry tracks it.
- Scenario: the_silent_heath
- ✏️

#### `wait_theres_no_shrouded_shrine` — Wait, There’s No Shrouded Shrine?

> Survive The Twisted Hollow in Standalone Mode until you reach at least Darkness Level 10.

- Why manual: "Survive The Twisted Hollow in Standalone Mode until Darkness Level 10." Standalone-mode in-scenario darkness threshold; not recorded in campaign log.
- Scenario: the_twisted_hollow
- ✏️

#### `bear_necessities` — Bear Necessities

> Defeat the Ursine Hybrid in The Longest Night using only scenario card effects.

- Why manual: "Defeat the Ursine Hybrid in The Longest Night using only scenario card effects." Method-constrained in-scenario feat; the bear notes (the_bear_was_wounded, theo_distracted_the_bear) don't capture the defeat-by-scenario-effects condition.
- Scenario: the_longest_night
- ✏️

#### `lets_do_the_time_warp` — Let’s Do the Time Warp!

> Complete the Lambs to the Slaughter Resolution in Prelude: The Final Evening.

- Why manual: "Complete the Lambs to the Slaughter Resolution in Prelude: The Final Evening." No dedicated note for that specific resolution; the Final Evening notes (lied_to_mother_rachel / interrupted_the_feast / the_hemlocks_made_a_truce / bertie_perished) don't isolate the Lambs to the Slaughter branch.
- Scenario: — (campaign-wide)
- ✏️

#### `oblivion_shmoblivion` — Oblivion Shmoblivion

> Win the Fate of the Vale with each Cosmic Emissary enemy in the victory display.

- Why manual: "Win the Fate of the Vale with each Cosmic Emissary enemy in the victory display." In-scenario victory-display composition; not captured by any campaign-log note.
- Scenario: fate_of_the_vale
- ✏️

#### `captivating_scream` — Captivating Scream

> Win The Feast of Hemlock Vale campaign as Patrice Hathaway.

- Why manual: "Win the campaign as Patrice Hathaway." Depends on the investigator chosen, which is not recorded in this campaign log data.
- Scenario: — (campaign-wide)
- ✏️

---

## Return to The Night of the Zealot (`rtnotz`)

### ❓ Needs your input

#### `break_the_circle` — Break the Circle

> Complete “The Devourer Below” without Umôrdhoth spawning.

- Question: Does the campaign note 'the ritual to summon Umordhoth was broken' (campaign_notes.ritual_broken) reliably imply Umordhoth never spawned, while 'umordhoth_repelled' implies he did spawn, so that ritual_broken alone satisfies this achievement?
- Scenario: return_to_the_devourer_below
- ✏️ Yes ritual_broken implies it didn't spawn.

### 🔮 Inferred — check the rule

#### `dont_trust_her` — I Don't Trust Her

> When given the option to add Lita Chantler to your deck, refuse to do so.

- Rule: recorded: campaign_notes.lita_finds_others
- Scenario: return_to_the_gathering
- ✏️

#### `insurance` — Insurance Doesn’t Cover Ghouls

> Burn your house to the ground in “The Gathering.”

- Rule: recorded: campaign_notes.house_burned
- Scenario: return_to_the_gathering
- ✏️

#### `conspiracy_of_silence` — Conspiracy of Silence

> Find and interrogate all six unique cultists in “The Midnight Masks.”

- Rule: section[cultists_interrogated] count ≥ 6
- Scenario: return_to_the_midnight_masks
- ✏️

#### `notz_line_in_the_sand` — Line in the Sand

> Win the Night of the Zealot campaign with at least three Ultimatums active.

- Rule: ultimatums ≥ 3
- Scenario: — (campaign-wide)
- ✏️

#### `arkham_expertise` — Arkham Expertise

> Win the Night of the Zealot campaign on Expert difficulty.

- Rule: difficulty = expert
- Scenario: — (campaign-wide)
- ✏️

### ✍️ Manual — no log trace (skim)

#### `zealots_revent` — The Zealot's Revenge

> Have Lita Chantler’s [reaction] ability deal the killing blow to the Ghoul Priest.

- Why manual: Lita's reaction dealing the killing blow to the Ghoul Priest is an in-scenario event with no campaign-log trace.
- Scenario: — (campaign-wide)
- ✏️

#### `do_i_have_to` — …But Do I Have To?

> In “The Midnight Masks,” have each investigator remain in Your House for the first three rounds.

- Why manual: Every investigator remaining in Your House for three rounds is an in-scenario positioning feat with no log trace.
- Scenario: return_to_the_midnight_masks
- ✏️

#### `tour_of_arkham` — Tour of Arkham

> Trigger each of the “once per game” abilities on all of the locations in play in “The Midnight Masks.”

- Why manual: Triggering each location's once-per-game ability is an in-scenario feat with no log trace.
- Scenario: return_to_the_midnight_masks
- ✏️

#### `do_you_get_it_now` — Do You Get It Now?

> Trigger the Forced ability on Billy Cooper by defeating the Ghoul Priest at his location.

- Why manual: Triggering Billy Cooper's Forced ability by defeating the Ghoul Priest at his location is an in-scenario event not recorded in the log.
- Scenario: return_to_the_midnight_masks
- ✏️

#### `pinch_hitter` — Pinch Hitter

> Defeat three [[Ghoul]] enemies with a Baseball Bat without it breaking.

- Why manual: Defeating three Ghouls with a Baseball Bat without it breaking is an in-scenario feat with no log trace.
- Scenario: — (campaign-wide)
- ✏️

#### `even_death_may_die` — Even Death May Die

> Defeat Umôrdhoth while the Vault of Earthly Demise is attached to it.

- Why manual: Defeating Umordhoth with the Vault of Earthly Demise attached is an in-scenario event; not recorded distinctly in the log.
- Scenario: return_to_the_devourer_below
- ✏️

#### `theyre_just_misunderstood` — They’re Just Misunderstood

> Win the Night of the Zealot campaign without defeating a single unique [[Cultist]] enemy.

- Why manual: Winning without defeating a single unique Cultist enemy is not tracked in the campaign log.
- Scenario: — (campaign-wide)
- ✏️

#### `umordhoths_favor` — Umôrdhoth’s Favor

> Win the Night of the Zealot campaign without defeating a single [[Ghoul]] enemy.

- Why manual: Winning without defeating a single Ghoul enemy is not tracked in the campaign log.
- Scenario: — (campaign-wide)
- ✏️

---

## Return to The Dunwich Legacy (`rtdwl`)

### ❓ Needs your input

#### `they_arent_getting_away_with_this` — They Aren’t Getting Away With This

> Win The Dunwich Legacy campaign as “Ashcan” Pete with Duke listed under “Sacrificed to Yog-Sothoth.”

- Question: Can earned-state be derived from the 'sacrificed' (cards) section containing the Duke card combined with the player having chosen Ashcan Pete as their investigator? Is there a DSL rule for card-present-in-a-cards-section or for investigator identity, and does winning the campaign need to be checked too?
- Scenario: — (campaign-wide)
- ✏️ Yes, Duke in that section indeed can be automatically implied for this. However, as Duke is not the expected listing card, I think this is too much. Let them check themself.

#### `tabula_rasa` — Tabula Rasa

> Win The Dunwich Legacy campaign with no [tablet] or [elder_thing] tokens in the chaos bag.

- Question: Does recorded campaign data capture the chaos bag's token composition (specifically absence of tablet and elder_thing tokens) so this can be auto-derived, or is it a manual setup feat?
- Scenario: — (campaign-wide)
- ✏️ We did have a system to check chaos bag now right, as used in TSK? So we should use that.

### 🔮 Inferred — check the rule

#### `first_rule_of_arkham` — First Rule of Arkham

> Burn The Necronomicon in “The Miskatonic Museum.”

- Rule: recorded: campaign_notes.destroyed_necronomicon
- Scenario: return_to_the_miskatonic_museum
- ✏️

#### `gangs_all_here` — The Gang’s All Here

> In “The Survivors,” the following characters survived The Dunwich Legacy:

- Rule: per item (5) — recorded: campaign_notes.henry_armitage_survived, …
- Scenario: — (campaign-wide)
- ✏️

#### `no_brood_left_behind` — No Brood Left Behind

> Have no Broods of Yog-Sothoth escape into the wild in “Undimensioned and Unseen.”

- Rule: recorded: campaign_notes.no_brood_escaped
- Scenario: return_to_undimensioned_and_unseen
- ✏️

#### `dwl_line_in_the_sand` — Line in the Sand

> Win The Dunwich Legacy campaign with at least three Ultimatums active.

- Rule: ultimatums ≥ 3
- Scenario: — (campaign-wide)
- ✏️

#### `dunwich_expertise` — Dunwich Expertise

> Win The Dunwich Legacy campaign on Expert difficulty.

- Rule: difficulty = expert
- Scenario: — (campaign-wide)
- ✏️

### ✍️ Manual — no log trace (skim)

#### `what_is_this_stuff` — What Is This Stuff, Anyway?

> Defeat The Experiment using the Alchemical Concoction in “Extracurricular Activities”.

- Why manual: Only experiment_defeated is recorded; the method (using the Alchemical Concoction) leaves no log trace.
- Scenario: return_to_extracurricular_activity
- ✏️

#### `no_void_for_you` — No Void For You

> Complete “The Miskatonic Museum” without ever defeating the Hunting Horror.

- Why manual: Mid-scenario condition (never defeating the Hunting Horror) is not recorded in the campaign log.
- Scenario: return_to_the_miskatonic_museum
- ✏️

#### `all_aboard` — All Aboard

> Complete “The Essex County Express” without letting any Helpless Passengers leave play.

- Why manual: Whether Helpless Passengers left play during Essex County Express is not recorded in the log.
- Scenario: return_to_the_essex_county_express
- ✏️

#### `remind_me_not_to_piss_her_off` — Remind Me Not To Piss Her Off

> Defeat either version of Seth Bishop while Naomi O’Bannion is under your control.

- Why manual: Defeating Seth Bishop while Naomi O'Bannion is under control is a mid-scenario feat not recorded in the log.
- Scenario: — (campaign-wide)
- ✏️

#### `eureka` — Eureka!

> Identify the Strange Solution.

- Why manual: Identifying the Strange Solution is an in-scenario event with no corresponding campaign-log entry.
- Scenario: — (campaign-wide)
- ✏️

#### `beyond_what_veil` — Beyond What Veil?

> Take 10 damage from Beyond the Veil without being defeated.

- Why manual: Taking 10 damage from Beyond the Veil without being defeated is an in-scenario feat, not logged.
- Scenario: — (campaign-wide)
- ✏️

#### `here_we_go_again` — Here We Go Again

> Have Dr. Henry Armitage, Dr. Francis Morgan, and Professor Warren Rice in play at the same time.

- Why manual: Having the three allies in play at the same time is a board-state feat, not recorded in the log.
- Scenario: — (campaign-wide)
- ✏️

#### `bird_hunting` — Bird Hunting

> Defeat 3 Whippoorwills in a single turn.

- Why manual: Defeating 3 Whippoorwills in a single turn is an in-scenario feat with no log trace.
- Scenario: — (campaign-wide)
- ✏️

---

## Return to The Path to Carcosa (`rtptc`)

### ❓ Needs your input

#### `path_of_death` — The Path of Death

> Use your Clasp of Black Onyx to find a shortcut in “The Pallid Mask.”

- Question: Does 'Use your Clasp of Black Onyx to find a shortcut in The Pallid Mask' correspond to any recorded campaign-log entry (e.g. gated on campaign_notes.took_onyx_clasp), or is the shortcut use itself untracked and thus manual?
- Scenario: return_to_the_pallid_mask
- ✏️ Correct, not recorded. Must be manually written. To check this hoever, took_onyx_clasp must be there first. Can be a tangent validation if they are attempting to check this without that log.

#### `path_is_mine` — The Path is Mine

> Win The Path to Carcosa campaign with less than 2 Doubt and Conviction in total.

- Question: Is there a supported inference for 'sum of two count sections (doubt + conviction) < 2'? allOf(logCount doubt max:1, logCount conviction max:1) is insufficient since it permits 1+1=2, so should this remain manual?
- Scenario: — (campaign-wide)
- ✏️ This is not a sum, it means both must be less than 2. Our inference should be able to AND?

### 🔮 Inferred — check the rule

#### `first_steps` — First Steps

> Interview the following VIPs in “The Last King”:

- Rule: per item (5) — recorded in section[vips_interviewed]: 03065b, …
- Scenario: return_to_the_last_king
- ✏️

#### `path_is_false` — The Path is False

> Win The Path to Carcosa campaign with 8 Doubt.

- Rule: count[doubt] ≥ 8
- Scenario: — (campaign-wide)
- ✏️

#### `path_is_real` — The Path is Real

> Win The Path to Carcosa campaign with 8 Conviction.

- Rule: count[conviction] ≥ 8
- Scenario: — (campaign-wide)
- ✏️

#### `ptc_line_in_the_sand` — Line in the Sand

> Win The Path to Carcosa campaign with at least three Ultimatums active.

- Rule: ultimatums ≥ 3
- Scenario: — (campaign-wide)
- ✏️

#### `carcosa_expertise` — Carcosa Expertise

> Win The Path to Carcosa campaign on Expert difficulty.

- Rule: difficulty = expert
- Scenario: — (campaign-wide)
- ✏️

### ✍️ Manual — no log trace (skim)

#### `fair_warning` — Fair Warning

> Defeat the Royal Emissary three times during a single playthrough of “Curtain Call.”

- Why manual: Defeat Royal Emissary 3x in Curtain Call is a mid-scenario feat; no campaign-log entry records it. Confirmed no matching entry in en map.
- Scenario: return_to_curtain_call
- ✏️

#### `crashing_the_party` — Crashing the Party

> Defeat the [[Lunatic]] version of Dianne Devine in “The Last King.”

- Why manual: Defeating the Lunatic Dianne Devine in The Last King is a mid-scenario feat with no campaign-log trace.
- Scenario: return_to_the_last_king
- ✏️

#### `for_prying_eyes` — For Prying Eyes

> Add the Hidden Library to the victory display in “Echoes of the Past.”

- Why manual: Adding the Hidden Library to the victory display in Echoes of the Past is mid-scenario; no log entry records it.
- Scenario: return_to_echoes_of_the_past
- ✏️

#### `cuckoos_nest` — The Cuckoo's Nest

> Resign with Daniel Chesterfield under an investigator’s control in “The Unspeakable Oath.”

- Why manual: Resigning with Daniel Chesterfield under control in The Unspeakable Oath is not a recorded campaign-log key (only escaped_the_asylum/attacked_as_you_escaped_arkham/king_claimed_victims are recorded).
- Scenario: return_to_the_unspeakable_oath
- ✏️

#### `take_a_look_at_this` — Take A Look At This!

> Parley with the Host of Insanity in “The Unspeakable Oath.”

- Why manual: Parleying with the Host of Insanity is a mid-scenario action with no campaign-log trace.
- Scenario: return_to_the_unspeakable_oath
- ✏️

#### `guessing_game` — Guessing Game

> Advance to the final agenda of one agenda deck before advacing the first agenda of the other agenda deck in “Black Stars Rise.”

- Why manual: Advancing one agenda deck to its final agenda before the other's first is an in-scenario timing feat with no log trace.
- Scenario: return_to_black_stars_rise
- ✏️

#### `hastur_made_me_do_it` — Hastur Made Me Do It

> Defeat Hastur in “Dim Carcosa” while a Possession treachery is in your hand.

- Why manual: Defeating Hastur while a Possession treachery is in hand is a mid-scenario condition not recorded in the campaign log.
- Scenario: return_to_dim_carcosa
- ✏️

#### `say_my_name` — Say My Name

> After you have heeded Daniel’s warning, speak the name of HASTUR aloud seven or more times during a single scenario (or its setup).

- Why manual: Speaking the name HASTUR aloud seven+ times is a real-world table feat with no recordable log entry.
- Scenario: — (campaign-wide)
- ✏️

#### `get_back_here` — Get Back Here

> Win The Path to Carcosa campaign having never ended a scenario with The Man in the Pallid Mask in play

- Why manual: Winning while never ending a scenario with The Man in the Pallid Mask in play is not tracked in the campaign log.
- Scenario: — (campaign-wide)
- ✏️

---

## Return to The Forgotten Age (`rttfa`)

### ❓ Needs your input

#### `scenario_5_what` — Scenario 5-What?

> Skip “Heart of the Elders, Part 1.”

- Question: When the investigators skip 'Heart of the Elders, Part 1', is that decision captured by any recorded campaign-log entry (e.g. paths*known count being absent/zero, or a hidden flag like hote_consult*\*), such that skipping can be derived from saved log data?
- Scenario: return_to_heart_of_the_elders_part_1
- ✏️ Yes, 6 paths are known to you is what can be checked since this would skip.

#### `patricide` — Patricide

> Defeat Yig in “The Depths of Yoth.”

- Question: When Yig is defeated in 'The Depths of Yoth', which campaign-log entry (if any) is recorded as a result, and does defeating Yig map to relic_is_missing / found_missing_relic / nexus_is_near or a hidden flag that can be derived from saved data?
- Scenario: return_to_the_depths_of_yoth
- ✏️ Nothing recorded. Must be manually written.

#### `hes_got_a_point` — He's Got a Point

> Side with Alejandro in “Shattered Aeons.”

- Question: Siding with Alejandro vs Ichtaca in 'Shattered Aeons' — is that choice uniquely recorded in the campaign log (e.g. fabric_of_time_unwoven, gave_relic_to_alejandro, or forging_own_path), or is it only an in-scenario setup decision with no distinct log entry?
- Scenario: return_to_shattered_aeons
- ✏️ This is inferrable if the "investigators saved the civilization of the Yithians" then surely it means they sided with Alejandro. But if they sided but fail to win the campaign, that isn't recorded. Therefore we should let player check this on their own.

#### `valusia_sounds_great` — Valusia Sounds Great

> Side with Ichtaca in “Shattered Aeons.”

- Question: Siding with Ichtaca in 'Shattered Aeons' — which campaign-log entry uniquely records this choice (e.g. one of investigators_saved_serpents / investigators_saved_yithians / mended_tear_in_time), if any?
- Scenario: return_to_shattered_aeons
- ✏️ This is inferrable if the "investigators saved the civilization of the Serpents" then surely it means they sided with Ichtaca. But if they sided but fail to win the campaign, that isn't recorded. Therefore we should let player check this on their own.

#### `we_have_an_understanding` — We Have an Understanding

> Win The Forgotten Age campaign without ever dealing any damage to the Harbinger of Valusia.

- Question: The 'harbinger_alive' note records '#X# damage'. If the investigators never dealt damage to the Harbinger of Valusia all campaign, does that produce a recorded harbinger_alive entry with X=0 (or its starting health), so 'never dealt damage' can be inferred from the logged value?
- Scenario: — (campaign-wide)
- ✏️ That's right, you can check X=0 or the lack of that damage remembering log for this.

#### `who_needs_any_of_this_junk` — Who Needs Any of This Junk?

> Win The Forgotten Age campaign without purchasing any supplies.

- Question: Does the saved 'supplies' section let us derive 'never purchased any supplies' (i.e. is there a way to tell that recorded supplies were never bought at the Provisions store), or is purchasing untracked relative to other supply gains?
- Scenario: — (campaign-wide)
- ✏️ Supplies section empty means never purchased, yes. Because even if you purchase rations and medicine and consume it, they should be cross off, so there are still trace of purchase in that case. Since supplies are per investigator logs you need to check for all investigators for the inference.

### 🔮 Inferred — check the rule

#### `hope_for_humanity` — Hope for Humanity

> Restore Ichtaca’s faith in humanity in “The Boundary Beyond.”

- Rule: recorded: campaign_notes.ichtaca_has_confidence
- Scenario: return_to_the_boundary_beyond
- ✏️

#### `beyond_perfection` — Beyond Perfection:

> Complete all eight tasks on act 2 of “The City of Archives” during a single playthrough.

- Rule: recorded: campaign_notes.process_was_perfected
- Scenario: return_to_the_city_of_archives
- ✏️

#### `i_remember_everything` — I Remember Everything

> Restore Alejandro’s memories in “The City of Archives.”

- Rule: recorded: campaign_notes.process_was_successful
- Scenario: return_to_the_city_of_archives
- ✏️

#### `dont_tread_on_me` — Don’t Tread on Me

> Win The Forgotten Age campaign with no tally marks recorded under Yig’s Fury in your Campaign Log

- Rule: count[yigs_fury] ≤ 0
- Scenario: — (campaign-wide)
- ✏️

#### `bane_of_yig` — Bane of Yig

> Win The Forgotten Age campaign with 25+ tally marks recorded under Yig’s Fury in your Campaign Log.

- Rule: count[yigs_fury] ≥ 25
- Scenario: — (campaign-wide)
- ✏️

#### `if_i_could_turn_back_time` — If I Could Turn Back Time

> Forge your own path, unlock Scenario IX, and win The Forgotten Age campaign.

- Rule: ALL of — recorded: campaign_notes.forging_own_path; recorded: campaign_notes.turned_back_time
- Scenario: — (campaign-wide)
- ✏️

#### `yoth_expertise` — Yoth Expertise

> Win The Forgotten Age campaign on Expert difficulty

- Rule: difficulty = expert
- Scenario: — (campaign-wide)
- ✏️

### ✍️ Manual — no log trace (skim)

#### `why_did_it_have_to_be_snakes` — Why Did It Have to Be Snakes?

> Defeat twenty [[Serpent]] enemies.

- Why manual: Defeating 20 Serpent enemies is an in-scenario tally; no campaign-log entry records it.
- Scenario: — (campaign-wide)
- ✏️

#### `watch_them_unravel` — Watch Them Unravel

> Complete all four act decks during a single playthrough of “Threads of Fate.”

- Why manual: Completing all four act decks in a single Threads of Fate playthrough is an in-scenario feat; no log entry records it.
- Scenario: return_to_threads_of_fate
- ✏️

#### `built_up_an_immunity` — I’ve Built Up An Immunity

> Win The Forgotten Age campaign without ever becoming poisoned.

- Why manual: Never becoming poisoned across the campaign is an in-scenario condition with no campaign-log entry tracking poison status.
- Scenario: — (campaign-wide)
- ✏️

---

## Return to The Circle Undone (`rttcu`)

### ❓ Needs your input

#### `speak_the_words_aloud` — duolA sdroW eht kaepS

> Win The Circle Undone campaign by discovering and reversing an ancient incantation.

- Question: For Return to The Circle Undone, which recorded campaign-log entries uniquely distinguish the 'discover and reverse an ancient incantation' winning ending (speak_the_words_aloud) from the 'craft a spell to contain Azathoth / azathoth_slumbers' ending (weaver_of_shadow_and_mist)? Both produce campaign_notes.azathoth_slumbers. Is the reversal ending tied to campaign_notes.witches_spell_broken (vs witches_spell_cast) and/or campaign_notes.accepted_fate vs rejected_fate, and is there a distinct Before the Black Throne resolution entry for it?
- Scenario: — (campaign-wide)
- ✏️ You are right, cannot be differentiated from logs alone. However azathoth_slumbers is indeed one thing that must exist if player wanted to manually check this. (and Strange Incantation and Bloody Tree Carvings must be among the memento discovered) Want to still validate this case then? (If they check, and this log is not included, then still can warn user that there might be problems.) Does our system support this?

### 🔮 Inferred — check the rule

#### `carl_shmarl` — Carl Shmarl

> Become part of the Silver Twilight Lodge's Inner Circle, then betray them in "Union and Disillusion."

- Rule: ALL of — recorded: campaign_notes.inducted_into_the_inner_circle; recorded: campaign_notes.sided_with_the_coven
- Scenario: return_to_union_and_disillusion
- ✏️

#### `threefold_rule` — The Threefold Rule

> Join forces with Erynn and turn on her coven in "Union and Disillusion."

- Rule: ALL of — recorded: campaign_notes.erynn_joined_investigators; recorded: campaign_notes.sided_with_the_lodge
- Scenario: return_to_union_and_disillusion
- ✏️

#### `new_world_order` — New World Order

> Help the Silver Twilight Lodge win The Circle Undone campaign.

- Rule: recorded: campaign_notes.sided_with_the_lodge
- Scenario: — (campaign-wide)
- ✏️

#### `immortality_sounds_nice` — Immortality Sounds Nice

> Help Anette's Coven win The Circle Undone campaign.

- Rule: recorded: campaign_notes.sided_with_the_coven
- Scenario: — (campaign-wide)
- ✏️

#### `member_these` — 'Member These?

> Discover the following Mementos:

- Rule: per item (10) — recorded: mementos.mesmerizing_flute, …
- Scenario: — (campaign-wide)
- ✏️

#### `case_closed` — Case Closed

> Save each of the following characters from a terrible fate:

- Rule: per item (4) — recorded: 05048.alive, …
- Scenario: — (campaign-wide)
- ✏️

#### `music_of_the_outer_gods` — Music of the Outer Gods

> Accept your fate and win The Circle Undone campaign by joining the Pipers of Azathoth.

- Rule: ALL of — recorded: campaign_notes.accepted_fate; recorded: campaign_notes.lead_investigator_joins_pipers
- Scenario: — (campaign-wide)
- ✏️

#### `weaver_of_shadow_and_mist` — Weaver of Shadow and Mist

> Reject your fate and win The Circle Undone campaign by crafting a spell to contain Azathoth.

- Rule: ALL of — recorded: campaign_notes.rejected_fate; recorded: campaign_notes.azathoth_slumbers
- Scenario: — (campaign-wide)
- ✏️

#### `fine_print` — Fine Print

> Win The Circle Undone campaign by signing your name in The Black Book of Azathoth.

- Rule: recorded: campaign_notes.signed_the_black_book
- Scenario: — (campaign-wide)
- ✏️

#### `circle_expertise` — Circle Expertise

> Win The Circle Undone campaign on Expert difficulty.

- Rule: difficulty = expert
- Scenario: — (campaign-wide)
- ✏️

### ✍️ Manual — no log trace (skim)

#### `who_you_gonna_call` — Who You Gonna Call?

> Defeat 13 [[Geist]] or [[Spectral]] enemies. Enemies who are not discarded or added to the victory display do not count.

- Why manual: Defeat 13 Geist/Spectral enemies across the campaign; no campaign-log count section records this tally (the db count achievement is the tracker UI, not a recorded log section).
- Scenario: — (campaign-wide)
- ✏️

#### `savior_of_humanity` — Savior of Humanity

> Rescue every [[Silver Twilight]] enemy who appears in "At Death's Doorstep."

- Why manual: Rescue every Silver Twilight enemy in At Death's Doorstep; an in-scenario feat with no recorded log key.
- Scenario: return_to_at_deaths_doorstep
- ✏️

#### `would_read_again` — 10/10 Would Read Again

> Using the Black Book, take a total of 10 horror with its ability throughout the campaign.

- Why manual: Take a total of 10 horror via the Black Book ability over the campaign; nothing in the log tracks this cumulative horror.
- Scenario: — (campaign-wide)
- ✏️

#### `more_like_excursion` — More Like Excursion

> Complete "In the Clutches of Chaos" without a single incursion occurring.

- Why manual: Complete In the Clutches of Chaos with no incursion occurring; in-scenario condition with no log key recording incursions.
- Scenario: return_to_in_the_clutches_of_chaos
- ✏️
