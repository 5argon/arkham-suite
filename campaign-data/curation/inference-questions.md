# Achievement inference — questions for review

Inferred: 63 · Manual (not log-trackable): 116 · Unsure: 25

## tdea
- **reunited** — Is the 8-part interconnected playthrough plus both groups reuniting in the epilogue recorded by any campaign-log key (e.g. the hidden 'interconnected_campaign' note combined with a specific epilogue outcome entry), or is the reunion purely a mid-epilogue event with no log trace?
## tic
- **elementary** — In The Vanishing of Elina Harper, does the recorded campaign log (mission_succeeded plus the hidden accuse_* / circled possible_suspects/possible_hideouts entries) uniquely indicate that the players guessed BOTH the correct suspect and correct hideout, or can the mission be recorded as successful without a correct double-guess?
- **speeding_ticket** — In Horror in High Gear, does reaching Falcon Point Approach 'before sunrise' (campaign_notes.reached_falcon_point_before_sunrise) strictly imply the player never voluntarily stopped a vehicle, never exited a vehicle, and never entered Long Way Around, or are those independent conditions not captured by the sunrise log entry?
- **dont_wake_daddy** — For 'Don't Wake Daddy', is the state of Hydra (awake/asleep) ever recorded in the campaign log, or is only Dagon tracked (dagon_still_slumbers vs dagon_has_awakened)? Can the achievement be derived solely from Dagon's slumber entry, or does Hydra require an untracked mid-scenario condition?
## eoe
- **abandoned_and_alone** — Does the campaign log record, per scenario, which partner asset was taken into play, so that 'never brought a partner during any scenario' can be derived? Or is partner-along selection purely in-scenario and untracked?
- **friends_forever** — Is the specific partner taken into each scenario recorded anywhere in the log, allowing 'same partner every scenario' to be verified? (Partner death and confronted-demons are recorded; the per-scenario 'brought along' choice is the uncertain part.)
- **there_and_back_again** — For a completed campaign, are surviving expedition-team members exposed as discrete checkable log keys (e.g. expedition_team partner statuses) so each list item (kensler, dyer, ...) can be marked when that survivor was alive at a campaign win?
## tskc
- **all_hollow** — Does reaching/playing scenario 26 'Without a Trace' leave a campaign-log entry that uniquely marks it was unlocked (e.g. is the presence of any scenario-26 entry like cell_blew_the_whistle sufficient to imply it was played/unlocked), or is unlocking it untracked in the campaign log?
- **heart** — For collecting all 11 keys, should this map to the 'keys' (scarletKeys) section, and if so what infer shape represents 'all 11 key items collected/owned'? The provided DSL has no scarletKeys/list-section rule.
## tdc
- **skip_to_the_end** — In Sepulchre of the Sleeper, does recording campaign_notes.halted_cthulhus_awakening correspond exactly to defeating Cthulhu in that scenario, or can the awakening be halted without defeating Cthulhu (making the achievement a stricter sub-case)?
- **obligations** — Is per-task completion derivable for the eight obligations tasks (walk_in_faith, toe_the_line, good_money, prove_your_worth, dreams_of_destruction, do_no_harm, no_place_like_home, plumb_the_depths)? The log only has hidden picked_* notes (chosen) plus a single hidden 'tasks_done' note and the 'task_progress' investigatorCount section — does any of these encode that all eight specific tasks were completed?
## rtnotz
- **conspiracy_of_silence** — Does the 'cultists_interrogated' cards section record each unique cultist interrogated, such that the achievement is satisfied when all six unique cultists appear in that section, and is there a DSL rule to count/require entries in a cards section?
- **break_the_circle** — Does the campaign note 'the ritual to summon Umordhoth was broken' (campaign_notes.ritual_broken) reliably imply Umordhoth never spawned, while 'umordhoth_repelled' implies he did spawn, so that ritual_broken alone satisfies this achievement?
## rtdwl
- **they_arent_getting_away_with_this** — Can earned-state be derived from the 'sacrificed' (cards) section containing the Duke card combined with the player having chosen Ashcan Pete as their investigator? Is there a DSL rule for card-present-in-a-cards-section or for investigator identity, and does winning the campaign need to be checked too?
- **tabula_rasa** — Does recorded campaign data capture the chaos bag's token composition (specifically absence of tablet and elder_thing tokens) so this can be auto-derived, or is it a manual setup feat?
## rtptc
- **first_steps** — For a 'list'-type achievement requiring all 5 specific VIP cards (codes 03065b/03066b/03067b/03068b/03069b) to be recorded in the vips_interviewed cards-section, is there an inference rule (per-card or cards-section-contains) supported by the engine, or should this remain manual?
- **path_of_death** — Does 'Use your Clasp of Black Onyx to find a shortcut in The Pallid Mask' correspond to any recorded campaign-log entry (e.g. gated on campaign_notes.took_onyx_clasp), or is the shortcut use itself untracked and thus manual?
- **path_is_mine** — Is there a supported inference for 'sum of two count sections (doubt + conviction) < 2'? allOf(logCount doubt max:1, logCount conviction max:1) is insufficient since it permits 1+1=2, so should this remain manual?
## rttfa
- **scenario_5_what** — When the investigators skip 'Heart of the Elders, Part 1', is that decision captured by any recorded campaign-log entry (e.g. paths_known count being absent/zero, or a hidden flag like hote_consult_*), such that skipping can be derived from saved log data?
- **patricide** — When Yig is defeated in 'The Depths of Yoth', which campaign-log entry (if any) is recorded as a result, and does defeating Yig map to relic_is_missing / found_missing_relic / nexus_is_near or a hidden flag that can be derived from saved data?
- **hes_got_a_point** — Siding with Alejandro vs Ichtaca in 'Shattered Aeons' — is that choice uniquely recorded in the campaign log (e.g. fabric_of_time_unwoven, gave_relic_to_alejandro, or forging_own_path), or is it only an in-scenario setup decision with no distinct log entry?
- **valusia_sounds_great** — Siding with Ichtaca in 'Shattered Aeons' — which campaign-log entry uniquely records this choice (e.g. one of investigators_saved_serpents / investigators_saved_yithians / mended_tear_in_time), if any?
- **we_have_an_understanding** — The 'harbinger_alive' note records '#X# damage'. If the investigators never dealt damage to the Harbinger of Valusia all campaign, does that produce a recorded harbinger_alive entry with X=0 (or its starting health), so 'never dealt damage' can be inferred from the logged value?
- **who_needs_any_of_this_junk** — Does the saved 'supplies' section let us derive 'never purchased any supplies' (i.e. is there a way to tell that recorded supplies were never bought at the Provisions store), or is purchasing untracked relative to other supply gains?
## rttcu
- **speak_the_words_aloud** — For Return to The Circle Undone, which recorded campaign-log entries uniquely distinguish the 'discover and reverse an ancient incantation' winning ending (speak_the_words_aloud) from the 'craft a spell to contain Azathoth / azathoth_slumbers' ending (weaver_of_shadow_and_mist)? Both produce campaign_notes.azathoth_slumbers. Is the reversal ending tied to campaign_notes.witches_spell_broken (vs witches_spell_cast) and/or campaign_notes.accepted_fate vs rejected_fate, and is there a distinct Before the Black Throne resolution entry for it?
