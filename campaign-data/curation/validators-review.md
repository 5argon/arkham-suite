# Log validator review

Mutually-exclusive log sets — at most one of each set should ever be recorded.
**✅ Applied** are confident; **❓ Needs your call** are not auto-applied — confirm or reject after **✏️**.

---

## notz

### ✅ Applied

- _The Gathering_ — Confirmed in torch.json (The Gathering): resolution R1's steps set house_burned, while no_resolution, R2, and R3 each set house_standing. The fate of the house is decided once by reaching exactly one resolution, so house_burned and house_standing can never both be recorded.
  - `campaign_notes.house_burned` — your house has burned to the ground.
  - `campaign_notes.house_standing` — your house is still standing.
  - ✏️

- _The Devourer Below_ — Confirmed in tentacles.json (The Devourer Below, final scenario): no_resolution sets arkham_succumbed, R1 sets ritual_broken, R2 sets umordhoth_repelled, R3 sets lita_sacrificed. Each is the single characteristic campaign_log entry of its resolution, and the player reaches exactly one resolution, so at most one can be true.
  - `campaign_notes.arkham_succumbed` — Arkham succumbed to Umôrdhoth’s terrible vengeance.
  - `campaign_notes.ritual_broken` — the ritual to summon Umôrdhoth was broken.
  - `campaign_notes.umordhoth_repelled` — the investigators repelled Umôrdhoth.
  - `campaign_notes.lita_sacrificed` — the investigators sacrificed Lita Chantler to Umôrdhoth.
  - ✏️

---

## dwl

### ✅ Applied

- _the_miskatonic_museum_ — The three Necronomicon outcomes of The Miskatonic Museum: no_resolution sets failed_to_recover_necronomicon, R1 sets destroyed_necronomicon, R2 sets took_necronomicon. The player reaches exactly one resolution, so at most one can be recorded.
  - `campaign_notes.failed_to_recover_necronomicon` — the investigators failed to recover the Necronomicon.
  - `campaign_notes.destroyed_necronomicon` — the investigators destroyed the Necronomicon.
  - `campaign_notes.took_necronomicon` — the investigators took custody of the Necronomicon.
  - ✏️

- _blood_on_the_altar_ — The three Silas Bishop outcomes of Blood on the Altar: R1 killed_silas_bishop, R2 restored_silas_bishop, R3 banished_silas_bishop. Exactly one resolution is reached, so these are mutually exclusive.
  - `campaign_notes.killed_silas_bishop` — the investigators put Silas Bishop out of his misery.
  - `campaign_notes.restored_silas_bishop` — the investigators restored Silas Bishop.
  - `campaign_notes.banished_silas_bishop` — the investigators banished Silas Bishop.
  - ✏️

- _extracurricular_activity_ — Warren Rice's fate at Extracurricular Activity: only R1 records warren_rice_rescued; no_resolution/R2/R3/R4 all record warren_rice_kidnapped. These are alternate outcomes of the same scenario, so only one of the two log keys can be true for the character.
  - `campaign_notes.warren_rice_rescued` — the investigators rescued Professor Warren Rice.
  - `campaign_notes.warren_rice_kidnapped` — Professor Warren Rice was kidnapped.
  - ✏️

- _extracurricular_activity_ — The students' fate at Extracurricular Activity: only R2 records students_rescued, while no_resolution/R1/R4 record failed_to_save_students (R3 records neither). Alternate results of the same scenario; both keys can never co-occur.
  - `campaign_notes.students_rescued` — the students were rescued.
  - `campaign_notes.failed_to_save_students` — the investigators failed to save the students.
  - ✏️

- _the_house_always_wins_ — Francis Morgan's fate at The House Always Wins: only R2 records francis_morgan_rescued while R1/R3/R4/no_resolution record francis_morgan_kidnapped. Alternate outcomes of the same scenario; only one of the two status keys can be recorded.
  - `campaign_notes.francis_morgan_rescued` — the investigators rescued Dr. Francis Morgan.
  - `campaign_notes.francis_morgan_kidnapped` — Dr. Francis Morgan was kidnapped.
  - ✏️

- _armitages_fate_ — Armitage's Fate (Interlude I) is a single branch on unconscious_for_several_hours: the false branch records henry_armitage_rescued, the true branch records henry_armitage_kidnapped. Exactly one branch is taken, so these are mutually exclusive.
  - `campaign_notes.henry_armitage_rescued` — the investigators rescued Dr. Henry Armitage.
  - `campaign_notes.henry_armitage_kidnapped` — Dr. Henry Armitage was kidnapped.
  - ✏️

- _undimensioned_and_unseen_ — The opening choose_one input in Undimensioned and Unseen: the 'calmed' choice records calmed_townsfolk, the 'warned' choice records warned_townsfolk. A single choice with two outcomes, mutually exclusive.
  - `campaign_notes.calmed_townsfolk` — you calmed the townsfolk.
  - `campaign_notes.warned_townsfolk` — you warned the townsfolk.
  - ✏️

- _undimensioned_and_unseen_ — End of Undimensioned and Unseen records either no_brood_escaped (R2) or brood_escaped with a count (R1). These are the two alternate resolution outcomes of how many broods escaped; both cannot be recorded.
  - `campaign_notes.no_brood_escaped` — No brood escaped into the wild.
  - `campaign_notes.brood_escaped` — #X# brood escaped into the wild.
  - ✏️

- _where_doom_awaits_ — Where Doom Awaits resolutions: R1 records entered_the_gate (you step through to pursue Yog-Sothoth), while R2/no_resolution record yog_sothoth_escaped with lose_campaign. Exactly one resolution is reached, mutually exclusive.
  - `campaign_notes.entered_the_gate` — the investigators entered the gate.
  - `campaign_notes.yog_sothoth_escaped` — Yog-Sothoth tore apart the barrier between worlds, and became one with all reality.
  - ✏️

- _lost_in_time_and_space_ — Final outcomes of Lost in Time and Space: R1 closed_tear (win), R3 yog_sothoth_fled, R4 yog_sothoth_became_one_with_reality (R2 records neither). One resolution is reached, so these end-state Yog-Sothoth outcomes are mutually exclusive.
  - `campaign_notes.closed_tear` — the investigators closed the tear in reality.
  - `campaign_notes.yog_sothoth_fled` — Yog-Sothoth has fled to another dimension.
  - `campaign_notes.yog_sothoth_became_one_with_reality` — Yog-Sothoth tore apart the barriers between worlds, and became one with all reality.
  - ✏️

---

## ptc

### ✅ Applied

- _curtain_call_ — Curtain Call resolves to exactly one of two: R1 records tried_to_warn_police (mark Conviction) or R2 records chose_not_to_warn_police (mark Doubt). These are the two alternate outcomes of the single warn-the-police decision. police_are_suspicious is a same-resolution add-on that only co-occurs with tried_to_warn_police, so it is correctly excluded from this set.
  - `campaign_notes.tried_to_warn_police` — you tried to warn the police.
  - `campaign_notes.chose_not_to_warn_police` — you chose not to go to the police.
  - ✏️

- _lunacys_reward_ — Interlude I (Lunacy's Reward / Skeptic's Reward reprint) presents one house_choice with three mutually exclusive branches: go_back_in -> intruded_on_secret_meeting, block_door -> fled_dinner_party, burn_house -> slayed_the_monsters. Exactly one branch is taken, so only one entry is recorded.
  - `campaign_notes.intruded_on_secret_meeting` — you intruded on a secret meeting.
  - `campaign_notes.fled_dinner_party` — you fled the dinner party.
  - `campaign_notes.slayed_the_monsters` — you slayed the monsters at the dinner party.
  - ✏️

- _echoes_of_the_past_ — Echoes of the Past reaches exactly one resolution: R1 records took_onyx_clasp (mark Conviction), R2 records left_onyx_clasp (mark Doubt), R3 records destroyed_the_oathspeaker. These are alternate resolutions of the same scenario, so only one is the recorded outcome (later scenarios only read took_onyx_clasp, they do not re-record it). R4 records no characteristic entry and is excluded.
  - `campaign_notes.took_onyx_clasp` — you took the onyx clasp.
  - `campaign_notes.left_onyx_clasp` — you left the onyx clasp behind.
  - `campaign_notes.destroyed_the_oathspeaker` — you destroyed the oathspeaker.
  - ✏️

- _the_unspeakable_oath_ — The Unspeakable Oath reaches exactly one resolution: R1 records king_claimed_victims, R2 records attacked_as_you_escaped_arkham, R3 records escaped_the_asylum. These are alternate resolutions of one scenario, so only one is recorded (A Phantom of Truth and later scenarios only read king_claimed_victims as a condition).
  - `campaign_notes.king_claimed_victims` — the King claimed its victims.
  - `campaign_notes.escaped_the_asylum` — the investigators escaped the Asylum.
  - `campaign_notes.attacked_as_you_escaped_arkham` — the investigators were attacked as they escaped the Asylum.
  - ✏️

- _lost_soul_ — Interlude II (Lost Soul) presents one warning_choice: ignore -> ignored_daniels_warning (mark Doubt) or heed -> heeded_daniels_warning (mark Conviction). These are the two alternate outcomes of a single decision, so at most one is recorded. The separate daniel_choice (survived/possessed/did_not_survive) is a different decision and is not grouped here.
  - `campaign_notes.ignored_daniels_warning` — you ignored Daniel’s warning.
  - `campaign_notes.heeded_daniels_warning` — you heeded Daniel’s warning.
  - ✏️

- _the_pallid_mask_ — At the start of The Pallid Mask a single branch (check_intro_condition) decides the intro: if you did_not_escape_gaze OR were unable_to_find_nigel you 'awoke_inside_catacombs', otherwise you 'entered_catacombs' on your own. The branch sets exactly one of these two entries.
  - `campaign_notes.entered_catacombs` — you entered the catacombs on your own.
  - `campaign_notes.awoke_inside_catacombs` — you awoke inside the catacombs.
  - ✏️

- _a_phantom_of_truth_ — A Phantom of Truth reaches exactly one resolution, each setting one characteristic entry: R1 found_nigels_home, R2 found_nigel_engram, R3 unable_to_find_nigel, and no_resolution (resigned/defeated) records did_not_escape_gaze. Only one outcome of this single scenario can be the recorded result.
  - `campaign_notes.found_nigels_home` — you found Nigel's home.
  - `campaign_notes.found_nigel_engram` — you found Nigel Engram.
  - `campaign_notes.unable_to_find_nigel` — you were unable to find Nigel.
  - `campaign_notes.did_not_escape_gaze` — you did not escape the gaze of the phantom.
  - ✏️

- _black_stars_rise_ — Black Stars Rise's two winning resolutions are mutually exclusive: R1 records opened_path_below, R2 records opened_path_above. The player advances one of the two agenda decks to its final agenda and opens exactly one path. (The losing R3/no_resolution records carcosa_merged, which belongs to the campaign-ending set under Dim Carcosa and is excluded here.)
  - `campaign_notes.opened_path_below` — you opened the path below.
  - `campaign_notes.opened_path_above` — you opened the path above.
  - ✏️

- _dim_carcosa_ — The campaign-ending outcome: Dim Carcosa R1-R3 (win) all record prevented_hasturs_escape; R4 records carcosa_merged (Hastur rules both realms); R5 records hastur_has_you. carcosa_merged is the same lose-state also reachable at Black Stars Rise R3, but across the whole campaign exactly one of these three terminal outcomes is the recorded ending.
  - `campaign_notes.prevented_hasturs_escape` — the investigators prevented Hastur from escaping his prison.
  - `campaign_notes.carcosa_merged` — the realm of Carcosa merged with our own, and Hastur rules over them both.
  - `campaign_notes.hastur_has_you` — Hastur has you in his grasp.
  - ✏️

---

## tfa

### ✅ Applied

- _The Doom of Eztli_ — Eztli resolutions: R1 and R5 record 'investigators_recovered_relic'; R2 records 'alejandro_recovered_relic'. Exactly one resolution is reached, so only one custody outcome is recorded.
  - `campaign_notes.investigators_recovered_relic` — the investigators recovered the Relic of Ages.
  - `campaign_notes.alejandro_recovered_relic` — Alejandro recovered the Relic of Ages.
  - ✏️

- _The Untamed Wilds_ — Confirmed in wilds.json: no_resolution records 'wait_for_additional_supplies'; both R1 and R2 record 'cleared_path_to_temple'. Alternate resolutions of the same scenario - exactly one is recorded.
  - `campaign_notes.wait_for_additional_supplies` — the investigators were forced to wait for additional supplies.
  - `campaign_notes.cleared_path_to_temple` — the investigators cleared a path to the Eztli ruins.
  - ✏️

- _The Untamed Wilds_ — Single choose-one for Ichtaca's standing: R1 (and check_final_act 'talked_to_ichtaca') -> earned_ichtacas_trust; 'act_1_or_2' -> ichtaca_observed_progress; R2 (and 'fought_ichtaca') -> ichtaca_is_wary. Exactly one of the three is recorded.
  - `campaign_notes.earned_ichtacas_trust` — the investigators have earned Ichtaca’s trust.
  - `campaign_notes.ichtaca_observed_progress` — Ichtaca observed your progress with keen interest.
  - `campaign_notes.ichtaca_is_wary` — Ichtaca is wary of the investigators.
  - ✏️

- _The Untamed Wilds_ — Same Untamed Wilds resolution decides whether Alejandro joins: R2 / 'fought_ichtaca' / 'act_1_or_2' -> alejandro_followed_to_ruins; R1 / 'talked_to_ichtaca' -> alejandro_remained_at_camp. Exactly one is recorded.
  - `campaign_notes.alejandro_followed_to_ruins` — Alejandro followed the investigators into the ruins.
  - `campaign_notes.alejandro_remained_at_camp` — Alejandro chose to remain at camp.
  - ✏️

- _Expedition's End_ — choose_where_relic_goes: 'museum' records gave_relic_to_alejandro, 'hide' records gave_relic_to_harlan. A single choose-one custody decision, so only one is true.
  - `campaign_notes.gave_relic_to_alejandro` — the investigators gave custody of the relic to Alejandro.
  - `campaign_notes.gave_relic_to_harlan` — the investigators gave custody of the relic to Harlan Earnstone.
  - ✏️

- _Expedition's End_ — Same choose_where_relic_goes also sets the Alejandro relationship axis: 'museum' -> earned_alejandros_trust; 'hide' -> alejandro_on_his_own. Kept separate from the custody pair because each branch co-records custody+relationship together; within this set the two are exclusive.
  - `campaign_notes.earned_alejandros_trust` — the investigators have earned Alejandro’s trust.
  - `campaign_notes.alejandro_on_his_own` — Alejandro is continuing his research on his own.
  - ✏️

- _The City of Archives_ — choose_to_cooperate: 'cooperate' records cooperated_with_yithians, 'resist' records resisted_captivity. A single choose-one, exactly one recorded.
  - `campaign_notes.cooperated_with_yithians` — the investigators cooperated with the Yithians.
  - `campaign_notes.resisted_captivity` — the investigators resisted captivity.
  - ✏️

- _The City of Archives_ — City of Archives outcome. R1's check_number_of_tasks records exactly one of perfected (6+) / successful (5) / backfired (4) / backfired_spectacularly (3) from a single tasks_completed count; the no_resolution (all insane) path instead records had_memories_expunged. All five are alternate resolutions of the one scenario.
  - `campaign_notes.process_was_perfected` — the process was perfected.
  - `campaign_notes.process_was_successful` — the process was successful.
  - `campaign_notes.process_backfired` — the process backfired.
  - `campaign_notes.process_backfired_spectacularly` — the process backfired spectacularly.
  - `campaign_notes.had_memories_expunged` — the investigators had their memories expunged.
  - ✏️

- _Threads of Fate_ — check_act_ab choose-one: 'completed' (Act 3b) records found_missing_relic; 'in_play' records relic_is_missing. Exactly one is recorded.
  - `campaign_notes.found_missing_relic` — the investigators found the missing relic.
  - `campaign_notes.relic_is_missing` — the relic is missing.
  - ✏️

- _Threads of Fate_ — check_act_cd choose-one: 'completed' (Act 3d) records rescued_alejandro; 'in_play' records alejandro_is_missing. Exactly one is recorded.
  - `campaign_notes.rescued_alejandro` — the investigators rescued Alejandro.
  - `campaign_notes.alejandro_is_missing` — Alejandro is missing.
  - ✏️

- _Threads of Fate_ — check_act_ef choose-one: 'completed' (Act 3f) records forged_bond_with_ichtaca; 'in_play' records ichtaca_in_the_dark. Exactly one is recorded.
  - `campaign_notes.forged_bond_with_ichtaca` — the investigators forged a bond with Ichtaca.
  - `campaign_notes.ichtaca_in_the_dark` — Ichtaca is in the dark.
  - ✏️

- _The Depths of Yoth_ — Depths of Yoth resolutions: R1 records fell_into_depths; R2 records nexus_is_near. Two alternate resolutions of one scenario, only one recorded.
  - `campaign_notes.fell_into_depths` — the investigators fell into the depths.
  - `campaign_notes.nexus_is_near` — the nexus is near.
  - ✏️

- _Shattered Aeons_ — Shattered Aeons (final) resolutions: R1->mended_tear_in_time, R2->investigators_saved_serpents, R3->investigators_saved_yithians, R4 (no_resolution path)->fabric_of_time_unwoven, R5->turned_back_time. Each is a distinct resolution; exactly one ends the campaign.
  - `campaign_notes.mended_tear_in_time` — the investigators mended the tear in time.
  - `campaign_notes.investigators_saved_serpents` — the investigators saved the civilization of the Serpents.
  - `campaign_notes.investigators_saved_yithians` — the investigators saved the civilization of the Yithians.
  - `campaign_notes.fabric_of_time_unwoven` — the fabric of time is unwoven.
  - `campaign_notes.turned_back_time` — the investigarors turned back time.
  - ✏️

---

## tcu

### ✅ Applied

- _disappearance_at_the_twilight_estate_ — Verified in disappearance_at_the_twilight_estate.json step choose_05046_fate: a choose_one input 'What happened to Gavriella Mizrah?' with four choices each setting exactly one of these section-05046 entries (taken_by_the_watcher / claimed_by_specters / disappeared_into_the_mist / pulled_into_the_spectral_realm). Alternate results of one choice; at most one recorded.
  - `05046.taken_by_the_watcher` — #name# was taken by the Watcher.
  - `05046.claimed_by_specters` — #name# was claimed by specters.
  - `05046.disappeared_into_the_mist` — #name# disappeared into the mist.
  - `05046.pulled_into_the_spectral_realm` — #name# was pulled into the spectral realm.
  - ✏️

- _disappearance_at_the_twilight_estate_ — Verified step choose_05047_fate ('What happened to Jerome Davids?') is a choose_one setting exactly one of these four section-05047 fate entries. Alternate results of one choice.
  - `05047.taken_by_the_watcher` — #name# was taken by the Watcher.
  - `05047.claimed_by_specters` — #name# was claimed by specters.
  - `05047.disappeared_into_the_mist` — #name# disappeared into the mist.
  - `05047.pulled_into_the_spectral_realm` — #name# was pulled into the spectral realm.
  - ✏️

- _disappearance_at_the_twilight_estate_ — Verified step choose_05048_fate ('What happened to Valentino Rivas?') is a choose_one setting exactly one of these four section-05048 fate entries. Alternate results of one choice.
  - `05048.taken_by_the_watcher` — #name# was taken by the Watcher.
  - `05048.claimed_by_specters` — #name# was claimed by specters.
  - `05048.disappeared_into_the_mist` — #name# disappeared into the mist.
  - `05048.pulled_into_the_spectral_realm` — #name# was pulled into the spectral realm.
  - ✏️

- _disappearance_at_the_twilight_estate_ — Verified step choose_05049_fate ('What happened to Penny White?') is a choose_one setting exactly one of these four section-05049 fate entries. Alternate results of one choice.
  - `05049.taken_by_the_watcher` — #name# was taken by the Watcher.
  - `05049.claimed_by_specters` — #name# was claimed by specters.
  - `05049.disappeared_into_the_mist` — #name# disappeared into the mist.
  - `05049.pulled_into_the_spectral_realm` — #name# was pulled into the spectral realm.
  - ✏️

- _the_witching_hour_ — Verified the_witching_hour.json step choose_fate: choose_one forks accept_fate (records campaign_notes.accepted_fate) vs reject_fate (records campaign_notes.rejected_fate). Single binary decision; exactly one recorded.
  - `campaign_notes.accepted_fate` — you have accepted your fate.
  - `campaign_notes.rejected_fate` — you have rejected your fate.
  - ✏️

- _the_witching_hour_ — Verified the_witching_hour.json resolutions: R1/R2 set witches_spell_broken, R3/R4 set witches_spell_cast. One binary spell state; the player reaches exactly one resolution branch, so these are mutually exclusive.
  - `campaign_notes.witches_spell_broken` — the witches' spell was broken.
  - `campaign_notes.witches_spell_cast` — the witches' spell was cast.
  - ✏️

- _for_the_greater_good_ — Verified for_the_greater_good.json resolutions: no_resolution sets guardian_of_the_trap_emerged, R1/R2 set discovered_how_to_open_the_puzzle_box, R3 sets guardian_of_the_trap_defeated. One characteristic entry per resolution; exactly one resolution reached.
  - `campaign_notes.guardian_of_the_trap_emerged` — the guardian of the trap emerged.
  - `campaign_notes.discovered_how_to_open_the_puzzle_box` — the investigators discovered how to open the puzzle box..
  - `campaign_notes.guardian_of_the_trap_defeated` — the guardian of the trap emerged and was defeated.
  - ✏️

- _the_price_of_progress_ — Verified the_price_of_progress.json step choose_lodge: 'refuse' records enemies_of_the_lodge; 'agree'/'lie' record members_of_the_lodge. Single decision, mutually exclusive. deceiving_the_lodge co-occurs with members on the lie branch and is deliberately excluded. (enemies_of_the_lodge is also set in the Josef-disappeared branch progress_4_effects, same entry value, still exclusive with members.)
  - `campaign_notes.members_of_the_lodge` — the investigators are members of the Lodge.
  - `campaign_notes.enemies_of_the_lodge` — the investigators are enemies of the Lodge.
  - ✏️

- _at_deaths_doorstep_ — Verified at_deaths_doorstep.json resolutions: R1 sets investigators_escaped_the_spectral_realm, R2 sets learned_nothing_of_the_lodges_schemes, R3 sets never_seen_again. One characteristic entry per resolution; exactly one resolution reached.
  - `campaign_notes.investigators_escaped_the_spectral_realm` — the investigators escaped the spectral realm.
  - `campaign_notes.learned_nothing_of_the_lodges_schemes` — the investigators learned nothing of the Lodge’s schemes.
  - `campaign_notes.never_seen_again` — the investigators are never seen or heard from again.
  - ✏️

- _in_the_clutches_of_chaos_ — Verified in_the_clutches_of_chaos.json step choose_anettes_fate: a choose_one with choices alone->continued_alone, ask_for_help->asked_anette_for_assistance, under_arrest->arrested_anette, learn_spells->anette_taught_you_the_spells_of_old. These three Anette-specific outcomes are alternates of one decision; continued_alone is shared with Carl's decision so correctly excluded.
  - `campaign_notes.asked_anette_for_assistance` — the investigators asked Anette for assistance.
  - `campaign_notes.arrested_anette` — the investigators arrested Anette.
  - `campaign_notes.anette_taught_you_the_spells_of_old` — Anette taught you the spells of old.
  - ✏️

- _in_the_clutches_of_chaos_ — Verified step choose_carls_fate: a choose_one with alone->continued_alone, ask_for_help->asked_sanford_for_assistance, under_arrest->arrested_sanford, seize_control->assumed_control_of_the_silver_twilight_lodge. These three Carl-specific outcomes are alternates of one decision; continued_alone shared with Anette's decision so correctly excluded.
  - `campaign_notes.asked_sanford_for_assistance` — the investigators asked Sanford for assistance.
  - `campaign_notes.arrested_sanford` — the investigators arrested Sanford.
  - `campaign_notes.assumed_control_of_the_silver_twilight_lodge` — the investigators assumed control of the Silver Twilight Lodge.
  - ✏️

- _union_and_disillusion_ — Verified union_and_disillusion.json step point_of_no_return: explicit choose_one 'point of no return' with help_ritual->sided_with_the_lodge vs thwart_ritual->sided_with_the_coven. Binary, mutually exclusive.
  - `campaign_notes.sided_with_the_lodge` — the investigators sided with the Lodge.
  - `campaign_notes.sided_with_the_coven` — the investigators sided with the coven.
  - ✏️

- _before_the_black_throne_ — Verified before_the_black_throne.json resolutions: R1 sets azathoth_devoured_the_universe (lose), R2 sets lead_investigator_joins_pipers, R5 sets signed_the_black_book. Each is the distinct characteristic outcome of one final resolution; exactly one resolution is reached. azathoth_slumbers (shared by R2/R3/R5) is correctly excluded as non-discriminating.
  - `campaign_notes.azathoth_devoured_the_universe` — Azathoth devoured the universe.
  - `campaign_notes.lead_investigator_joins_pipers` — #name# has joined the pipers of Azathoth.
  - `campaign_notes.signed_the_black_book` — the investigators signed the Black Book of Azathoth.
  - ✏️

- _union_and_disillusion_ — Verified union_and_disillusion.json steps gavriella_alive (sets 05046.alive) and gavriella_is_dead (sets 05046.dead): end-of-campaign status, exactly one recorded. Distinct axis from her prologue fate (disappeared_into_the_mist etc.), correctly not grouped with those.
  - `05046.alive` — Gavriella is alive.
  - `05046.dead` — Gavriella Mizrah is dead.
  - ✏️

- _union_and_disillusion_ — Verified union_and_disillusion.json sets either 05047.alive or 05047.dead as Jerome's end-of-campaign status. Single status decision, distinct from his prologue fate axis.
  - `05047.alive` — Jerome is alive.
  - `05047.dead` — Jerome Davids is dead.
  - ✏️

- _union_and_disillusion_ — Verified union_and_disillusion.json sets either 05048.alive or 05048.dead as Valentino's end-of-campaign status. Single status decision, distinct from his prologue fate axis.
  - `05048.alive` — Valentino is alive.
  - `05048.dead` — Valentino Rivas is dead.
  - ✏️

- _union_and_disillusion_ — Verified union_and_disillusion.json sets either 05049.alive or 05049.dead as Penny's end-of-campaign status. Single status decision, distinct from her prologue fate axis.
  - `05049.alive` — Penny is alive.
  - `05049.dead` — Penny White is dead.
  - ✏️

---

## tdea

### ✅ Applied

- _beyond_the_gates_of_sleep_ — Beyond the Gates of Sleep alternate Zoog-encounter resolutions: R1 records 'the cats collected their tribute from the Zoogs'; R2 records 'the investigators parleyed with the Zoogs'. The player reaches exactly one resolution, so only one can be recorded. (No-resolution defeat records neither, instead recording saved_by_randolph_carter, so these two are the genuine exclusive pair.)
  - `campaign_notes.cats_collected_their_tribute` — the cats collected their tribute from the Zoogs.
  - `campaign_notes.parleyed_with_zoogs` — the investigators parleyed with the Zoogs.
  - ✏️

- _the_search_for_kadath_ — The Search for Kadath: R1 (someone escaped) records 'Randolph eluded capture'; R2 (everyone captured) records 'Randolph was captured'. These are the two mutually exclusive Randolph outcomes of the same scenario's two resolutions. Note 'virgil_was_captured' is set under BOTH R1 and R2, so it co-occurs with either and is correctly excluded from this set.
  - `campaign_notes.randolph_eluded_capture` — Randolph eluded capture.
  - `campaign_notes.randolph_was_captured` — Randolph was captured.
  - ✏️

- _dark_side_of_the_moon_ — Dark Side of the Moon: no_resolution_defeated records 'the investigators were carried to the Cold Wastes'; R1 records 'the investigators traveled to the Cold Wastes'. These are the two alternate Cold-Wastes outcomes of this scenario's two resolutions - exactly one is reached.
  - `campaign_notes.carried_to_the_cold_wastes` — the investigators were carried to the Cold Wastes.
  - `campaign_notes.travelled_to_the_cold_wastes` — the investigators traveled to the Cold Wastes.
  - ✏️

- _dark_side_of_the_moon_ — Dark Side of the Moon: no_resolution_defeated records 'Randolph Carter did not survive the voyage'; R1 records 'Randolph survived the voyage'. Direct opposite Randolph outcomes from the same scenario's two resolutions - only one is true.
  - `campaign_notes.randolph_did_not_survive_the_voyage` — Randolph Carter did not survive the voyage.
  - `campaign_notes.randolph_survived_the_voyage` — Randolph survived the voyage.
  - ✏️

- _where_the_gods_dwell_ — Where the Gods Dwell climactic confrontation resolutions: no_resolution_defeated records 'Nyarlathotep's invasion has begun', R1 records 'the dreamers escaped from Nyarlathotep's grasp', R2 records 'the dreamers banished Nyarlathotep'. Exactly one of these three end-of-battle resolutions is reached. (R1/R2 then continue to a SEPARATE choose_fate decision, which is a different validator.)
  - `campaign_notes.nyarlathoteps_invasion_has_begun` — Nyarlathotep's invasion has begun.
  - `campaign_notes.dreamers_escaped_nyarlathoteps_grasp` — the dreamers escaped from Nyarlathotep's grasp.
  - `campaign_notes.dreamers_banished_nyarlathotep` — the dreamers banished Nyarlathotep.
  - ✏️

- _where_the_gods_dwell_ — Where the Gods Dwell 'choose_fate' choose_one input (reached after R1/R2): wake_up -> R3 records 'the dreamers awoke'; remain_in_dreamlands -> R4 records 'the dreamers stayed in the Dreamlands forever'; know_another_path -> R5 records 'the dreamers traveled beneath the monastery'. One fate choice, three mutually exclusive outcomes.
  - `campaign_notes.dreamers_awoke` — the dreamers awoke.
  - `campaign_notes.dreamers_stayed_in_dreamlands_forever` — the dreamers stayed in the Dreamlands forever.
  - `campaign_notes.dreamers_traveled_beneath_the_monastery` — the dreamers traveled beneath the monastery.
  - ✏️

- _the_black_cat_ — Interlude I 'black_cat_choice' choose_one input (only when interconnected): black_cat_sent_news -> 'black_cat_delivered_news', shared_knowledge -> 'black_cat_shared_knowledge_of_the_dreamlands', warned -> 'black_cat_warned_the_others', threaten -> 'threaten_black_cat'. Exactly one branch is taken. (Secondary entries like black_cat_at_your_side / black_cat_has_a_hunch / you_asked_for_it co-occur with their respective branch and are correctly excluded.)
  - `campaign_notes.black_cat_delivered_news` — the black cat delivered news of your plight.
  - `campaign_notes.black_cat_shared_knowledge_of_the_dreamlands` — the black cat shared knowledge of the Dreamlands.
  - `campaign_notes.black_cat_warned_the_others` — the black cat warned the others.
  - `campaign_notes.threaten_black_cat` — okay, fine, have it your way then.
  - ✏️

- _the_great_ones_ — Interlude III 'black_cat_decision' choose_one input: one choice records 'the black cat spoke of Nyarlathotep', the other records 'the black cat spoke of Atlach-Nacha'. Single decision, two mutually exclusive outcomes.
  - `campaign_notes.black_cat_spoke_of_nyarlathotep` — the black cat spoke of Nyarlathotep.
  - `campaign_notes.black_cat_spoke_of_atlach_nacha` — the black cat spoke of Atlach-Nacha.
  - ✏️

---

## tdeb

### ✅ Applied

- _waking_nightmare_ — Waking Nightmare intro choose_one 'choose_doctor': choice 'doctor_come' records doctor_joined_investigation; choice 'doctor_stay' records doctor_stayed_with_patients. Exactly one branch of a single choose_one input is taken.
  - `campaign_notes.doctor_joined_investigation` — Dr. Maheswaran joined the investigation.
  - `campaign_notes.doctor_stayed_with_patients` — Dr. Maheswaran stayed with her patients.
  - ✏️

- _waking_nightmare_ — Dr. Maheswaran end-of-scenario status, one per resolution: R1/R3 -> doctor_is_alive; R2/R4 -> doctor_is_missing; no_resolution_resigned -> doctors_fate_unknown. A playthrough reaches exactly one resolution, so only one status is recorded. (no_resolution_defeated records none.)
  - `campaign_notes.doctor_is_alive` — Dr. Maheswaran is alive.
  - `campaign_notes.doctor_is_missing` — Dr. Maheswaran is missing.
  - `campaign_notes.doctors_fate_unknown` — Dr. Maheswaran’s fate is unknown.
  - ✏️

- _waking_nightmare_ — How Randolph escaped, set per resolution: R1/R2/R3 record randolph_escaped_hospital_with_investigators; R4 and no_resolution_resigned record randolph_escaped_hospital_alone. Mutually exclusive resolution outcomes of the same scenario.
  - `campaign_notes.randolph_escaped_hospital_with_investigators` — Randolph escaped the hospital with the investigators.
  - `campaign_notes.randolph_escaped_hospital_alone` — Randolph escaped the hospital on his own.
  - ✏️

- _a_thousand_shapes_of_horror_ — A Thousand Shapes of Horror resolutions set the descent outcome: R1 and R3 record randolph_survived_descent; R4 records randolph_did_not_survive_descent (R2 only redirects to R3 or R4). Alternate outcomes of the same descent decision. possess_silver_key co-occurs only with R1 and is NOT an alternate of this axis, so it is correctly excluded.
  - `campaign_notes.randolph_survived_descent` — Randolph survived the descent.
  - `campaign_notes.randolph_did_not_survive_descent` — Randolph did not survive the descent.
  - ✏️

- _weaver_of_the_cosmos_ — Final scenario bridge outcome: R1 records bridge_was_destroyed (Atlach-Nacha stopped); R2 and no_resolution record bridge_was_completed. Mutually exclusive results of the same climactic outcome.
  - `campaign_notes.bridge_was_completed` — the bridge was completed.
  - `campaign_notes.bridge_was_destroyed` — the bridge was destroyed.
  - ✏️

- _weaver_of_the_cosmos_ — Final escape outcome reached only via R1's resolution_1_branch (R3/R4/R5): R3 records returned_to_reality, R4 records never_escaped, R5 records still_in_the_dreamlands. Exactly one of these resolutions is resolved, so at most one is recorded.
  - `campaign_notes.returned_to_reality` — the investigators returned to reality.
  - `campaign_notes.never_escaped` — the investigators never escaped.
  - `campaign_notes.still_in_the_dreamlands` — the investigators are still in the Dreamlands.
  - ✏️

### ❓ Needs your call

- _b_black_cat_ — Interlude I outcome. In linked/full mode the campaign_link_branch choose_one records: shared_knowledge_of_the_dreamlands -> black_cat_has_a_hunch, warned -> black_cat_warned_the_others, threaten -> you_asked_for_it (the 'delivered_news' choice records no campaign_notes entry). In 4-part half_campaign mode the same setup branch instead records on_your_own. At most one is recorded. Unsure because black_cat_warned_the_others is the SAME key reused by Interlude II (b_oneironauts), so it can also be set there independently, and on_your_own is a campaign-mode branch rather than an in-scenario player choice, making the single-decision grouping not fully certain.
  - `campaign_notes.black_cat_has_a_hunch` — the black cat has a hunch.
  - `campaign_notes.black_cat_warned_the_others` — the black cat warned the others.
  - `campaign_notes.you_asked_for_it` — you asked for it.
  - `campaign_notes.on_your_own` — you are on your own.
  - ✏️ I think these are mutually exclusive.

- _b_oneironauts_ — Interlude II 'black_cat_decision' choose_one records exactly one of black_cat_requested_aid / black_cat_shared_knowledge_of_the_underworld / black_cat_warned_the_others. Genuine single-decision conflict within this interlude. Unsure because black_cat_warned_the_others is the SAME key also offered in Interlude I (b_black_cat), so it overlaps the other black-cat validator and the two decisions cannot be cleanly separated by entry key alone.
  - `campaign_notes.black_cat_requested_aid` — the black cat requested aid from the others.
  - `campaign_notes.black_cat_shared_knowledge_of_the_underworld` — the black cat shared knowledge of the Underworld.
  - `campaign_notes.black_cat_warned_the_others` — the black cat warned the others.
  - ✏️ Mutually exclusive within one campaign side.

- _b_great_ones_ — Interlude III (and the earlier b_oneironauts) move-cat mechanic: moving the cat to Campaign B records black_cat_at_your_side_2 and crosses off Campaign A's black_cat_at_your_side, and vice versa. Both encode 'the black cat is at your side' for opposite campaigns, so only one can stand at a time. Unsure because this is cross-campaign token/log bookkeeping (the same physical cat tracked in two logs) rather than a straightforward in-scenario resolution, and both texts read identically.
  - `campaign_notes.black_cat_at_your_side` — the black cat is at your side.
  - `campaign_notes.black_cat_at_your_side_2` — the black cat is at your side.
  - ✏️ Seems to be exclusive, yes.

---

## tic

### ✅ Applied

- _devil_reef_ — Devil Reef step 'ask_terror_of_devil_reef' is a single choose_one: agenda_1a / in-play both set terror_of_devil_reef_is_still_alive, while victory_display sets terror_of_devil_reef_is_dead. Exactly one outcome is recorded.
  - `campaign_notes.terror_of_devil_reef_is_still_alive` — the Terror of Devil Reef is still alive.
  - `campaign_notes.terror_of_devil_reef_is_dead` — the Terror of Devil Reef is dead.
  - ✏️

- _the_lair_of_dagon_ — The Lair of Dagon 'ask_dagon_asleep' choose_one records Dagon's final state as 'Deep in Slumber' (dagon_still_slumbers) or 'Awakened and Enraged' (dagon_has_awakened); dagon_has_awakened is also the no_resolution / Agenda-3b outcome. Dagon ends in exactly one state. orders_ritual_was_disrupted is deliberately excluded: it co-occurs with dagon_still_slumbers on the Act-3b path, so it is not exclusive with dagon_has_awakened.
  - `campaign_notes.dagon_still_slumbers` — Dagon still slumbers.
  - `campaign_notes.dagon_has_awakened` — Dagon has awakened.
  - ✏️

- _the_vanishing_of_elina_harper_ — The Vanishing of Elina Harper resolves to R1 (mission_failed) or R2-R7 (mission_succeeded) based on whether the investigators correctly identified the suspect and hideout. Exactly one is recorded.
  - `campaign_notes.mission_failed` — the mission failed.
  - `campaign_notes.mission_succeeded` — the mission was successful.
  - ✏️

- _horror_in_high_gear_ — Horror in High Gear has two resolutions: no_resolution sets reached_falcon_point_after_sunrise, R1 sets reached_falcon_point_before_sunrise. The investigators arrive at exactly one of these times.
  - `campaign_notes.reached_falcon_point_after_sunrise` — the investigators reached Falcon Point after sunrise.
  - `campaign_notes.reached_falcon_point_before_sunrise` — the investigators reached Falcon Point before sunrise.
  - ✏️

- _into_the_maelstrom_ — Into the Maelstrom world-end state: R2 sets plot_of_the_deep_ones_was_thwarted, R3 sets flood_has_begun (the 'Shattering the Alignment' yes/no fork after escaping via R1), and R8 sets deep_ones_have_flooded_the_earth (the all-killed loss). Exactly one of these three end states occurs. escaped_yhanthlei is excluded because it co-occurs with R2/R3; made_it_safely and Innsmouth-consumed are independent flags.
  - `campaign_notes.plot_of_the_deep_ones_was_thwarted` — the plot of the Deep Ones was thwarted.
  - `campaign_notes.flood_has_begun` — the flood has begun.
  - `campaign_notes.deep_ones_have_flooded_the_earth` — the Deep Ones have flooded the Earth.
  - ✏️

- _into_the_maelstrom_ — Into the Maelstrom final win-flavor: R2 branches via check_successful_conspiracy_4_5 to R4 (agent_harpers_mission_is_complete) or R5 (riches_of_the_deep_are_lost_forever); R3 branches via check_successful_conspiracy_6_7 to R6 (agent_harpers_mission_is_complete_at_what_cost) or R7 (riches_of_the_deep_are_destroyed_at_what_cost). The campaign ends on exactly one of these four final resolutions.
  - `campaign_notes.agent_harpers_mission_is_complete` — Agent Harper's mission is complete.
  - `campaign_notes.riches_of_the_deep_are_lost_forever` — the riches of the deep are lost forever.
  - `campaign_notes.agent_harpers_mission_is_complete_at_what_cost` — Agent Harper's mission is complete… but at what cost?
  - `campaign_notes.riches_of_the_deep_are_destroyed_at_what_cost` — the riches of the deep are destroyed… but at what cost?
  - ✏️

---

## eoe

### ✅ Applied

- _Prologue: The Side Effects of the Past_ — Prologue 'choose_believe' choose_one input: choice p2 sets 'convinced_dyer_to_allow_the_expedition', choice p3 sets 'did_not_believe_dyers_report'. Exactly one branch of one choice is taken. Confirmed in eoe_prologue.json.
  - `campaign_notes.convinced_dyer_to_allow_the_expedition` — the investigators convinced Dyer to allow the expedition.
  - `campaign_notes.did_not_believe_dyers_report` — the investigators did not believe Dyer's report.
  - ✏️

- _Ice and Death, Part III_ — The three resolutions of Ice and Death Part III each set one characteristic campaign_notes entry: no_resolution->team_barely_escaped_the_ice_shelf, R1->team_defeated_the_hunting_creatures, R2->team_fled_to_the_mountains. The player reaches exactly one resolution. Confirmed in ice_and_death_part_3.json.
  - `campaign_notes.team_barely_escaped_the_ice_shelf` — the team barely escaped the ice shelf.
  - `campaign_notes.team_defeated_the_hunting_creatures` — the team defeated the hunting creatures.
  - `campaign_notes.team_fled_to_the_mountains` — the team fled to the mountains.
  - ✏️

- _To the Forbidden Peaks_ — To the Forbidden Peaks R1 step records 'team_climbed_to_the_summit', R2 step records 'team_found_another_way_through_the_mountains' (no_resolution routes to R2). Mutually exclusive resolutions of the same scenario. Confirmed in to_the_forbidden_peaks.json.
  - `campaign_notes.team_climbed_to_the_summit` — the team climbed to the summit.
  - `campaign_notes.team_found_another_way_through_the_mountains` — the team found another way through the mountains.
  - ✏️

- _City of the Elder Things_ — City of the Elder Things R1 step records 'team_found_the_hidden_tunnel', R2 step records 'team_was_guided_to_the_hidden_tunnel'. Alternate resolutions of the same scenario. Confirmed in city_of_the_elder_things.json.
  - `campaign_notes.team_found_the_hidden_tunnel` — the team found the hidden tunnel.
  - `campaign_notes.team_was_guided_to_the_hidden_tunnel` — the team was guided to the hidden tunnel.
  - ✏️

- _The Heart of Madness, Part II_ — HoM Part II intro 'check_kensler_understands' branch: true (Kensler alive AND understands the miasma) -> step dr_kensler_has_a_plan; false -> step truth_of_the_mirage_eludes_you. Two mutually exclusive outcomes of one branch. Confirmed in the_heart_of_madness_part_2.json.
  - `campaign_notes.dr_kensler_has_a_plan` — Dr. Kensler has a plan.
  - `campaign_notes.truth_of_the_mirage_eludes_you` — the truth of the mirage eludes you.
  - ✏️

- _The Heart of Madness, Part II_ — The four resolutions of the final scenario each record one characteristic campaign_notes entry via their first step: no_resolution->nameless_madness_escaped, R1->nameless_madness_is_contained_safely_within_its_host_for_now, R2->facility_was_destroyed, R3->team_escaped_the_facility. Exactly one final resolution is reached. Confirmed in the_heart_of_madness_part_2.json.
  - `campaign_notes.nameless_madness_escaped` — the nameless madness escaped.
  - `campaign_notes.nameless_madness_is_contained_safely_within_its_host_for_now` — the nameless madness is contained safely within its host… for now.
  - `campaign_notes.facility_was_destroyed` — the facility was destroyed.
  - `campaign_notes.team_escaped_the_facility` — the team escaped the facility.
  - ✏️

- _Fatal Mirage_ — In Fatal Mirage, the Airfield memory is added to Memories Discovered (id 'airfield'); banishing it adds 'airfield' to Memories Banished and crosses out the matching Memories Discovered entry (cross_out:true, same id). The memory is either still discovered or banished, never both. Confirmed in fatal_mirage.json.
  - `memories_discovered.airfield` — Airfield
  - `memories_banished.airfield` — Airfield
  - ✏️

- _Fatal Mirage_ — Banishing the Alaskan Wilds memory adds 'alaskan_wilds' to Memories Banished and crosses out the same-id Memories Discovered entry. Discovered and banished are exclusive states of one memory. Confirmed in fatal_mirage.json.
  - `memories_discovered.alaskan_wilds` — Alaskan Wilds
  - `memories_banished.alaskan_wilds` — Alaskan Wilds
  - ✏️

- _Fatal Mirage_ — Banishing the Cluttered Dormitory memory adds 'cluttered_dormitory' to Memories Banished and crosses out the same-id Memories Discovered entry. Exclusive states of one memory. Confirmed in fatal_mirage.json.
  - `memories_discovered.cluttered_dormitory` — Cluttered Dormitory
  - `memories_banished.cluttered_dormitory` — Cluttered Dormitory
  - ✏️

- _Fatal Mirage_ — Banishing the Dr. Kensler's Office memory adds 'dr_kenslers_office' to Memories Banished and crosses out the same-id Memories Discovered entry. Exclusive states of one memory. Confirmed in fatal_mirage.json.
  - `memories_discovered.dr_kenslers_office` — Dr. Kensler's Office
  - `memories_banished.dr_kenslers_office` — Dr. Kensler's Office
  - ✏️

- _Fatal Mirage_ — Banishing the Dyer's Classroom memory adds 'dyers_classroom' to Memories Banished and crosses out the same-id Memories Discovered entry. Exclusive states of one memory. Confirmed in fatal_mirage.json.
  - `memories_discovered.dyers_classroom` — Dyer's Classroom
  - `memories_banished.dyers_classroom` — Dyer's Classroom
  - ✏️

- _Fatal Mirage_ — Banishing the Infirmary memory adds 'infirmary' to Memories Banished and crosses out the same-id Memories Discovered entry. Exclusive states of one memory. Confirmed in fatal_mirage.json.
  - `memories_discovered.infirmary` — Infirmary
  - `memories_banished.infirmary` — Infirmary
  - ✏️

- _Fatal Mirage_ — Banishing the Ottoman Front memory adds 'ottoman_front' to Memories Banished and crosses out the same-id Memories Discovered entry. Exclusive states of one memory. Confirmed in fatal_mirage.json.
  - `memories_discovered.ottoman_front` — Ottoman Front
  - `memories_banished.ottoman_front` — Ottoman Front
  - ✏️

- _Fatal Mirage_ — Banishing The Black Stone memory adds 'the_black_stone' to Memories Banished and crosses out the same-id Memories Discovered entry. Exclusive states of one memory. Confirmed in fatal_mirage.json.
  - `memories_discovered.the_black_stone` — The Black Stone
  - `memories_banished.the_black_stone` — The Black Stone
  - ✏️

### ❓ Needs your call

- _Fatal Mirage_ — The Mo'ai Statues memory is added to Memories Discovered as 'moai_statues' (plural) and added to Memories Banished as 'moai_statues' (plural), so from the player's recorded-log standpoint these are exclusive states of one memory. HOWEVER the source data's cross_out effect targets the SINGULAR id 'memories_discovered.moai_statue' (which also exists in the en map as a separate entry), so the discovered-add id and the cross_out id do not match in the reference — the exclusivity is ambiguous due to this upstream singular/plural inconsistency. Demoted to unsure for human review.
  - `memories_discovered.moai_statues` — Mo'ai Statues
  - `memories_banished.moai_statues` — Mo'ai Statues
  - ✏️ Genuine source data mistake, I think they are all supposed to be plural key to match the card's name.

---

## tskc

### ✅ Applied

- _The Foundation — choose what to tell Commissioner Taylor_ — Step 'choose_what_to_tell_taylor' is a single choose-one input: the 'share' branch records cell_told_the_truth_to_taylor, the 'withold' branch records cell_hid_the_truth_from_taylor. Exactly one branch is taken (verified in 02_the_foundation.json).
  - `campaign_notes.cell_told_the_truth_to_taylor` — the cell told the truth to Taylor.
  - `campaign_notes.cell_hid_the_truth_from_taylor` — the cell hid the truth from Taylor.
  - ✏️

- _Dealings in the Dark — respond to Ece's offer (choose_path)_ — The 'choose_path' input is a 3-way choose-one: help->cell_is_working_with_ece, lie->cell_is_deceiving_ece, refuse->cell_refused_eces_offer. Only one path is recorded (verified in 07_dealings_in_the_dark.json).
  - `campaign_notes.cell_is_working_with_ece` — the cell is working with Ece.
  - `campaign_notes.cell_is_deceiving_ece` — the cell is deceiving Ece.
  - `campaign_notes.cell_refused_eces_offer` — the cell refused Ece's offer.
  - ✏️

- _Dealings in the Dark — Ece trust at the Twisted Antiprism handover (R4 vs R5)_ — Resolution 4 records ece_trusts_the_cell and Resolution 5 records ece_does_not_trust_the_cell (no other resolution sets either). Alternate resolutions of the same handover; mutually exclusive (verified via resolution step trace).
  - `campaign_notes.ece_trusts_the_cell` — Ece trusts the cell.
  - `campaign_notes.ece_does_not_trust_the_cell` — Ece does not trust the cell.
  - ✏️

- _Dead Heat — fate of Amaranth (R3 vs R2/R4/R5)_ — Resolution 3 records amaranth_has_left_the_coterie; Resolutions 2/4/5 record have_not_seen_the_last_of_amaranth (R1 records neither). Alternate outcomes of the same Amaranth confrontation; exactly one resolution reached (verified via resolution step trace).
  - `campaign_notes.amaranth_has_left_the_coterie` — Amaranth has left the Coterie.
  - `campaign_notes.have_not_seen_the_last_of_amaranth` — you haven't seen the last of Amaranth.
  - ✏️

- _Sanguine Shadows — La Chica Roja outcome (R2 vs R1/R3)_ — Resolution 2 records chica_roja_is_on_your_side; Resolutions 1 and 3 record have_not_seen_the_last_of_la_chica_roja. One resolution is reached (verified via resolution step trace).
  - `campaign_notes.chica_roja_is_on_your_side` — La Chica Roja is on your side.
  - `campaign_notes.have_not_seen_the_last_of_la_chica_roja` — you haven't seen the last of La Chica Roja.
  - ✏️

- _The Coiled Serpent — instruct Flint (choice)_ — The 'choice' input has three branches: encourage->flint_is_working_solo, help->cell_aided_in_flints_investigation, stop->flint_abandoned_his_search. Exactly one recorded for this single decision (verified in 11_the_coiled_serpent.json).
  - `campaign_notes.flint_is_working_solo` — Flint is working solo.
  - `campaign_notes.cell_aided_in_flints_investigation` — the cell aided in Flint’s investigation.
  - `campaign_notes.flint_abandoned_his_search` — Flint abandoned his search.
  - ✏️

- _On Thin Ice — fate of Thorne (R2 vs R3)_ — Resolution 2 records have_not_seen_the_last_of_thorne; Resolution 3 records thorne_disappeared. These are the genuine resolution-bound alternate fates of Thorne. NOTE: cell_made_a_deal_with_thorne was DROPPED from this set — it is set mid-scenario by the 'work with you for now' raw_deal choice (not a resolution), is crossed off under R3, and can co-occur with R2, so it is not exclusive with these (kidnapped-then-rescued trap).
  - `campaign_notes.have_not_seen_the_last_of_thorne` — you haven’t seen the last of Thorne.
  - `campaign_notes.thorne_disappeared` — Thorne disappeared.
  - ✏️

- _Dancing Mad — Desi outcome (R1 vs no_resolution/R2)_ — Resolution 1 records desi_is_in_your_debt; the no-resolution and Resolution 2 paths record have_not_seen_the_last_of_desi. One resolution is reached (verified via resolution step trace).
  - `campaign_notes.desi_is_in_your_debt` — Desi is in your debt.
  - `campaign_notes.have_not_seen_the_last_of_desi` — you haven’t seen the last of Desiderio Delgado Álvarez.
  - ✏️

- _Shades of Suffering — Tzu San Niang confrontation (R1/R2/R3)_ — R1 records is_under_your_sway, R2 (and no_resolution) records have_not_seen_the_last_of, R3 records has_you_under_her_sway. Three mutually-exclusive resolutions of the same confrontation (verified via resolution step trace).
  - `campaign_notes.tzu_san_niang_is_under_your_sway` — Tzu San Niang is under your sway.
  - `campaign_notes.have_not_seen_the_last_of_tzu_san_niang` — you haven’t seen the last of Tzu San Niang.
  - `campaign_notes.tzu_san_niang_has_you_under_her_sway` — Tzu San Niang has you under her sway.
  - ✏️

- _Dogs of War — accept the Claret Knight's bargain vs assist Agent Sirry (early_choice/late_choice)_ — Both early_choice and late_choice are the same binary choose-one: accept->cell_made_a_deal_with_the_claret_knight, refuse->cell_is_assisting_agent_sirry. Exactly one is recorded (verified in 15_dogs_of_war.json).
  - `campaign_notes.cell_made_a_deal_with_the_claret_knight` — the cell made a deal with the Claret Knight.
  - `campaign_notes.cell_is_assisting_agent_sirry` — the cell is assisting Agent Sirry.
  - ✏️

- _Dogs of War — the Beast confrontation (R8 vs R3)_ — Resolution 8 records cell_aided_the_knight; Resolution 3 records cell_failed_to_fend_off_the_beast. Alternate outcomes of the same fight (have_not_seen_the_last_of_the_beast co-occurs in both and is intentionally excluded from this exclusive pair). Verified via resolution step trace.
  - `campaign_notes.cell_aided_the_knight` — the cell aided the knight.
  - `campaign_notes.cell_failed_to_fend_off_the_beast` — the cell failed to fend off the Beast.
  - ✏️

- _Whistle on the Wind — accept or refuse Aliki's offer (make_choice)_ — The 'make_choice' input offers accept->cell_possesses_a_mysterious_whistle vs reject->cell_refused_alikis_offer. Exactly one branch is taken (verified in 23_whistle_on_the_wind.json).
  - `campaign_notes.cell_possesses_a_mysterious_whistle` — the cell possesses a mysterious whistle.
  - `campaign_notes.cell_refused_alikis_offer` — the cell refused Aliki’s offer.
  - ✏️

- _Without a Trace — blow vs dispose of the whistle (whistle_choice)_ — The 'whistle_choice' input is a choose-one: summon Aliki->cell_blew_the_whistle, do it alone->cell_threw_away_the_whistle. Exactly one is recorded (verified in 26_without_a_trace.json).
  - `campaign_notes.cell_blew_the_whistle` — the cell blew the whistle.
  - `campaign_notes.cell_threw_away_the_whistle` — the cell threw away the whistle.
  - ✏️

- _Without a Trace — Aliki fate (R1/R3 vs R2/R4)_ — Resolutions 1 and 3 record aliki_is_on_your_side; Resolutions 2 and 4 record have_not_seen_the_last_of_aliki_zoni_uperetria. One resolution is reached (verified via resolution step trace).
  - `campaign_notes.aliki_is_on_your_side` — Aliki is on your side.
  - `campaign_notes.have_not_seen_the_last_of_aliki_zoni_uperetria` — you haven’t seen the last of Aliki Zoni Uperetria.
  - ✏️

- _Metamorphosis — final fate of Dr. Irawan (joined vs erased)_ — A single branch (check_delta_early) routes one option to earn_dr_irawan (records dr_irawan_joined_the_cell) and the other to dr_irawan_vanished_from_existence. These are the two mutually-exclusive terminal fates of Dr. Irawan within this scenario (verified in 17_metamorphosis.json).
  - `campaign_notes.dr_irawan_joined_the_cell` — Dr. Irawan joined the cell.
  - `campaign_notes.dr_irawan_vanished_from_existence` — Dr. Irawan vanished from existence.
  - ✏️

- _Congress of the Keys — the trial verdict before the Red Coterie_ — The trial branch chain produces exactly one verdict: escaped (tie/yays), overthrew (overthrow result), joined or spared (join result), spared (knows true nature), or destroyed from within (three eerily silent). All are alternate single-decision outcomes of the Congress trial (verified in 27_congress_of_the_keys.json).
  - `campaign_notes.cell_escaped_the_red_coterie` — the cell escaped the Red Coterie.
  - `campaign_notes.cell_overthrew_the_red_coterie` — the cell overthrew the Red Coterie.
  - `campaign_notes.cell_joined_the_red_coterie` — the cell joined the Red Coterie.
  - `campaign_notes.red_coterie_spared_the_cell` — the Red Coterie spared the cell.
  - `campaign_notes.red_coterie_was_destroyed_from_within` — the Red Coterie was destroyed from within.
  - ✏️

- _Epilogue — final disposition of the cell_ — If the cell joined the Red Coterie (check_cell_joined_the_red_coterie) the epilogue records work_together; otherwise check_trust_vs_deception records cell_was_given_a_permanent_position or cell_was_dismantled. Exactly one ending is recorded (verified in 28_epilogue.json).
  - `campaign_notes.work_together` — the Red Coterie and The Foundation agreed to work together.
  - `campaign_notes.cell_was_given_a_permanent_position` — the cell was given a permanent position.
  - `campaign_notes.cell_was_dismantled` — the cell was dismantled.
  - ✏️

### ❓ Needs your call

- _Theory of Annihilation — Irawan fork (travels on vs erased)_ — In 16_theory_of_annihilation.json one branch records dr_irawan_traveled_to_new_guinea and another records dr_irawan_vanished_from_existence — exclusive within this scenario. BUT 'traveled' is a waypoint that carries Irawan into Metamorphosis, where he may later vanish; so a campaign could record traveled here and vanished in Metamorphosis, breaking strict exclusivity. Flagged for human review.
  - `campaign_notes.dr_irawan_traveled_to_new_guinea` — Dr. Irawan traveled to New Guinea.
  - `campaign_notes.dr_irawan_vanished_from_existence` — Dr. Irawan vanished from existence.
  - ✏️ Both can exist at the same time, yes. Irawan can vanish later in Metamorphosis.

- _Blood, Sweat, and Tea — Flint fork (travels to KL vs goes missing)_ — The opening branches record flint_traveled_to_kuala_lampur (aided/solo-early paths) or agent_flint_is_missing (solo-late path) — exclusive at this fork. But flint_traveled is a waypoint that later leads to flint_rejoined_the_cell, so this is a sub-step of a larger Flint storyline; flagged for review (verified in 20_blood_sweat_and_tea.json).
  - `campaign_notes.flint_traveled_to_kuala_lampur` — Flint traveled to Kuala Lumpur.
  - `campaign_notes.agent_flint_is_missing` — Agent Flint is missing.
  - ✏️

- _Flint storyline status — rejoined vs missing vs dead_ — flint_rejoined_the_cell is set in Shades of Suffering setup (Flint present); agent_flint_is_missing is set in Blood, Sweat, and Tea (solo path); in Shades the agent_flint_is_dead step crosses off agent_flint_is_missing and records agent_flint_is_dead. Alternate final statuses but reached via a multi-step cross-out path across scenarios, not one decision; flagged for review.
  - `campaign_notes.flint_rejoined_the_cell` — Flint rejoined the cell.
  - `campaign_notes.agent_flint_is_missing` — Agent Flint is missing.
  - `campaign_notes.agent_flint_is_dead` — Agent Flint is dead.
  - ✏️

- _Ringing Hollow — Agent Quinn fate (distrust vs erased)_ — agent_quinn_vanished_from_existence is set by the time>=20 branch (check_time); agent_quinn_does_not_trust_the_cell is set on the lied-to-Taylor branch (check_cell_told_the_truth_to_taylor). These are two different branch axes — exclusive in practice but not a single decision, and distrust can later be reconciled to agent_quinn_has_your_back. Flagged for review (verified in 19_ringing_hollow.json).
  - `campaign_notes.agent_quinn_does_not_trust_the_cell` — Agent Quinn does not trust the cell.
  - `campaign_notes.agent_quinn_vanished_from_existence` — Agent Quinn vanished from existence.
  - ✏️

---

## fhv

### ✅ Applied

- _Written in Rock_ — Verified in 02_written_in_rock.json: R1 step simeon_survived, R2 step leah_saw_something (records leah_saw_something_in_the_mine), R3 step simeon_disappeared, R4 step leah_and_simeon_reunited (records leah_and_simeon_were_reunited), R5 step survived_the_horrors_in_the_rock. All five resolutions route to shared hidden R6, so exactly one is recorded.
  - `simeon.simeon_survived` — Simeon survived.
  - `leah.leah_saw_something_in_the_mine` — Leah saw something in the mine.
  - `simeon.simeon_disappeared` — Simeon disappeared.
  - `leah.leah_and_simeon_were_reunited` — Leah and Simeon were reunited.
  - `campaign_notes.survived_the_horrors_in_the_rock` — the investigators survived the horrors in the rock.
  - ✏️

- _The Silent Heath_ — Verified in 04_the_silent_heath.json: R1 records laid_the_pearl_family_to_rest, R2 records remains_were_partially_recovered; both then route into shared R3 (madame_pearls_diary, co-occurring, excluded) then R4. The two are alternate outcomes of the same Pearl-Family burial decision.
  - `campaign_notes.laid_the_pearl_family_to_rest` — the investigators laid the Pearl Family to rest.
  - `campaign_notes.remains_were_partially_recovered` — the remains were partially recovered.
  - ✏️

- _The Lost Sister_ — Verified in 05_the_lost_sister.json: check_resolution_theo_reconciled_with_helen branches true->resolution_2 (the_peters_family_was_reunited) vs false->resolution_3 (elizabeth_peters_was_saved). These are the mutually-exclusive end-states of the rescue. theo_reconciled_with_helen is the earlier precondition, correctly excluded.
  - `campaign_notes.the_peters_family_was_reunited` — The Peters family was reunited.
  - `campaign_notes.elizabeth_peters_was_saved` — Elizabeth Peters was saved.
  - ✏️

- _The Thing in the Depths_ — Verified in 06_the_thing_in_the_depths.json: R1 records chelydran_hybrid_perished, R2 records chelydran_hybrid_lived, R3 records chelydran_hybrid_devoured; each routes to shared R5. Exactly one of the three is ever recorded (R4 thing_in_the_depths_was_defeated is a separate resolution, deliberately not grouped).
  - `campaign_notes.chelydran_hybrid_perished` — the Chelydran Hybrid perished.
  - `campaign_notes.chelydran_hybrid_lived` — the Chelydran Hybrid lived.
  - `campaign_notes.chelydran_hybrid_devoured` — the Chelydran Hybrid was devoured.
  - ✏️

- _The Twisted Hollow_ — Verified in 08_the_twisted_hollow.json decide_intro choose_one: truth option records mother_rachel_showed_the_way (and adds cultist token); lie option records lost_the_path (and adds elder thing token). One binary decision, mutually exclusive.
  - `campaign_notes.mother_rachel_showed_the_way` — Mother Rachel showed the way.
  - `campaign_notes.lost_the_path` — the investigators lost the path.
  - ✏️

- _The Twisted Hollow_ — Verified in 08_the_twisted_hollow.json: R1 records bertie_was_rescued; R2 and no_resolution both record bertie_was_lost_in_the_woods. Alternate outcomes of the same end-of-scenario resolution. bertie_had_an_epiphany and bertie_perished are later separate decisions, correctly not grouped.
  - `campaign_notes.bertie_was_rescued` — Bertie was rescued.
  - `campaign_notes.bertie_was_lost_in_the_woods` — Bertie was lost in the woods.
  - ✏️

- _The Longest Night_ — Verified in 11_the_longest_night.json: R1 records captives_were_saved, R2 records many_captives_were_lost, R3 and no_resolution record all_the_captives_were_lost; each routes to shared hidden R4. Exactly one is ever recorded.
  - `campaign_notes.captives_were_saved` — the captives were saved.
  - `campaign_notes.many_captives_were_lost` — many captives were lost.
  - `campaign_notes.all_the_captives_were_lost` — all the captives were lost.
  - ✏️

- _The Final Evening_ — Verified in 13_the_final_evening.json: check_dr_marquez_has_a_plan branches true->intro_choice (a choose_one with good->believed, good_lie->lied_to_mother_rachel, death->interrupted_the_feast) and false->interrupted_the_feast directly. lied_to_mother_rachel and interrupted_the_feast are two of the three mutually-exclusive outcomes of this single decision (the third, believed, is not in the entries map).
  - `campaign_notes.lied_to_mother_rachel` — the investigators lied to Mother Rachel.
  - `campaign_notes.interrupted_the_feast` — the investigators interrupted the Feast.
  - ✏️

- _Fate of the Vale_ — Verified in 14_fate_of_the_vale.json (final scenario): no_resolution->became_the_true_feast_of_hemlock_vale, R1->dr_marquez_sacrificed_herself_for_the_vale, R2->investigators_sacrificed_themselves_for_the_vale, R3->the_vale_was_saved, R4->the_vale_burned, R5->barely_survived. Exactly one campaign ending is reached, so these six are mutually exclusive.
  - `campaign_notes.became_the_true_feast_of_hemlock_vale` — the investigators became the true Feast of Hemlock Vale.
  - `campaign_notes.dr_marquez_sacrificed_herself_for_the_vale` — Dr. Marquez sacrificed herself for the Vale.
  - `campaign_notes.investigators_sacrificed_themselves_for_the_vale` — the investigators sacrificed themselves for the Vale.
  - `campaign_notes.the_vale_was_saved` — the Vale was saved.
  - `campaign_notes.the_vale_burned` — the Vale burned.
  - `campaign_notes.barely_survived` — investigators barely survived the Feast of Hemlock Vale.
  - ✏️

---

## tdc

### ✅ Applied

- _expedition_to_ryleh_ — Interlude II: Expedition to R'lyeh has a single binary 'choose_direction' input (scenario 04, id choose_direction). The west branch records 'expedition_headed_west' (then earn_andy/west_scenario); the east branch records 'expedition_headed_east' (then earn_ruby/east_scenario). Each is set only as the resolution entry of this one choice, so exactly one direction is recorded and they cannot co-occur.
  - `campaign_notes.expedition_headed_west` — the expedition headed west.
  - `campaign_notes.expedition_headed_east` — the expedition headed east.
  - ✏️

- _one_last_job_ — One Last Job (scenario 02): the no_resolution branch records 'ruby_won_the_bet' while resolution R1 (returning with both the shipment and Ruby) records 'ruby_lost_the_bet'. These are the two alternate resolutions of the same scenario's bet, so only one can ever be true.
  - `campaign_notes.ruby_won_the_bet` — Ruby won the bet.
  - `campaign_notes.ruby_lost_the_bet` — Ruby lost the bet.
  - ✏️

- _the_apiary_ — The Apiary (scenario 07) has three characteristic resolution outcomes: R1 (west) records 'pilgrims_were_saved', R2 (west) records 'pilgrims_were_devoured', R3 (east) records 'exterminated_the_alien_parasites'. R4 is a hidden continuation of R3 setting no competing campaign note. The player reaches exactly one resolution, so these three are mutually exclusive alternates of one scenario outcome.
  - `campaign_notes.pilgrims_were_saved` — the pilgrims were saved.
  - `campaign_notes.pilgrims_were_devoured` — the pilgrims were devoured.
  - `campaign_notes.exterminated_the_alien_parasites` — the investigators exterminated the alien parasites.
  - ✏️

- _the_drowned_quarter_ — The Drowned Quarter (scenario 06): R1 grants the Barrier Node artifact (barrier_node_artifact step) while R2 records 'the_power_was_diverted'; R3 is a shared hidden continuation and no_resolution sets neither. barrier_node is earned nowhere else (in Doom of Arkham Part 1 it is only read/crossed-out, not earned), so R1 and R2 are confirmed alternate resolutions of the same scenario and never co-occur. Promoted to sure: the conflict is fully confirmed; the entries merely sit in different log sections (artifacts_earned vs campaign_notes), which does not affect exclusivity.
  - `artifacts_earned.barrier_node` — Barrier Node
  - `campaign_notes.the_power_was_diverted` — the power was diverted.
  - ✏️

- _the_doom_of_arkham_part_2_ — The Doom of Arkham Part 2 (scenario 16) opens with a binary 'choose_approach' input: the 'direct' firepower stand records 'stood_together'; the 'alternate' ritual approach (requires 5+ artifacts) records 'your_allies_have_a_plan'. Setup later branches on exactly one of these (check_act_deck reads stood_together, else your_allies_have_a_plan), confirming they are alternate outcomes of one decision.
  - `campaign_notes.stood_together` — the investigators stood together.
  - `campaign_notes.your_allies_have_a_plan` — your allies have a plan.
  - ✏️

- _the_doom_of_arkham_part_2_ — The four final resolutions of The Doom of Arkham Part 2 (scenario 16) each record exactly one Cthulhu outcome: no_resolution='annihilated the city', R1='driven away', R2='banished', R3='banished but Arkham was destroyed'. The player reaches exactly one resolution, so at most one of these can ever be recorded.
  - `campaign_notes.cthulhu_annihilated_the_city_of_arkham` — Cthulhu annihilated the city of Arkham.
  - `campaign_notes.cthulhu_was_driven_away` — Cthulhu was driven away.
  - `campaign_notes.cthulhu_was_banished` — Cthulhu was banished.
  - `campaign_notes.cthulhu_was_banished_but_arkham_was_destroyed` — Cthulhu was banished, but Arkham was destroyed.
  - ✏️

### ❓ Needs your call

- _tdc_ — These are the campaign's mutually exclusive ENDINGS across two different finale scenarios, gated by the east/west expedition direction: the east-path Sepulchre of the Sleeper R1 records 'halted_cthulhus_awakening' and ends the campaign (win_campaign), whereas the west-path Doom of Arkham Part 2 finale records one of the four Cthulhu outcomes. A single playthrough reaches only one finale, so all five are mutually exclusive as the final outcome. Kept unsure because they span DIFFERENT scenarios rather than a single resolution step, and it intentionally overlaps the Doom-only Cthulhu-outcome validator above.
  - `campaign_notes.halted_cthulhus_awakening` — the investigators halted Cthulhu's awakening.
  - `campaign_notes.cthulhu_was_driven_away` — Cthulhu was driven away.
  - `campaign_notes.cthulhu_was_banished` — Cthulhu was banished.
  - `campaign_notes.cthulhu_was_banished_but_arkham_was_destroyed` — Cthulhu was banished, but Arkham was destroyed.
  - `campaign_notes.cthulhu_annihilated_the_city_of_arkham` — Cthulhu annihilated the city of Arkham.
  - ✏️

---

## boa

### ✅ Applied

- _01_spreading_flames_ — Fate of Miskatonic University. In Spreading Flames the university either burned (miskatonic_university_burned, set in the no_resolution and R3 resolution steps) or was saved (saved_miskatonic_university, set only in the R2 resolution). A player reaches exactly one resolution, so the two outcomes cannot both be recorded. R1's 'defeated_their_masked_pursuer' is correctly NOT included: R1 runs choose_stay_or_go which then branches to R2 (saved) or R3 (burned), so it co-occurs with one of these and is not exclusive with them.
  - `campaign_notes.miskatonic_university_burned` — Miskatonic University burned.
  - `campaign_notes.saved_miskatonic_university` — the investigators saved Miskatonic University.
  - ✏️

- _02_smoke_and_mirrors_ — Identity of the harbinger of Elokoss. The 'ask_harbinger' choose_one step (run in both the no_resolution and R1 resolution step lists) records exactly one of the six People of Arkham characters as the harbinger via mutually exclusive choices, each writing a distinct \*\_harbinger note. Only one card was set aside as the true Servant of Flame, so at most one of these can be recorded.
  - `campaign_notes.david_harbinger` — David Renfield is the harbinger of Elokoss.
  - `campaign_notes.cornelia_harbinger` — Cornelia Akely is the harbinger of Elokoss.
  - `campaign_notes.naomi_harbinger` — Naomi O'Bannion is the harbinger of Elokoss.
  - `campaign_notes.earl_harbinger` — Sgt. Earl Monroe is the harbinger of Elokoss.
  - `campaign_notes.abigail_harbinger` — Abigail Foreman is the harbinger of Elokoss.
  - `campaign_notes.margaret_harbinger` — Margaret Liu is the harbinger of Elokoss.
  - ✏️

- _02_smoke_and_mirrors_ — Outcome of the search for the cult. In the no_resolution resolution, check_enemy_is_harbinger branches on the drawn enemy: true -> discovered_the_cults_whereabouts, false -> failed_in_their_search (the two boolCondition arms of one branch). R1 instead directly records discovered_the_cults_whereabouts. Whichever single resolution is reached records exactly one of these two notes, so both can never be truly recorded together.
  - `campaign_notes.discovered_the_cults_whereabouts` — the investigators discovered the cult's whereabouts.
  - `campaign_notes.failed_in_their_search` — the investigators failed in their search.
  - ✏️

- _03_queen_of_ash_ — Final campaign ending in Queen of Ash. Each of the four resolutions records exactly one characteristic outcome in its steps: no_resolution -> elokoss_was_reborn (lose_campaign), R1 -> defeated_elokoss_and_the_brethren_of_ash, R2 -> stopped_elokoss_glorious_rebirth, R3 -> flooded_the_ritual. A campaign reaches exactly one resolution, so only one of these can be truly recorded.
  - `campaign_notes.elokoss_was_reborn` — Elokoss was reborn.
  - `campaign_notes.defeated_elokoss_and_the_brethren_of_ash` — the investigators defeated Elokoss and the Brethren of Ash.
  - `campaign_notes.stopped_elokoss_glorious_rebirth` — the investigators stopped Elokoss’s glorious rebirth.
  - `campaign_notes.flooded_the_ritual` — the investigators flooded the Brethren of Ash’s summoning ritual.
  - ✏️
