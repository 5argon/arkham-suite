# The Profile (Draft)

"Profile" is a career profile screen of sorts similar to live service competitive online games. This kind of system aims
to motivate the player to do better, to try something new and fill the blanks, or simply to admire or show off their
love of the game to social networks.

The UI will provide customizable "blank spots" to suit your needs. For example, if you don't care about Easy and Expert
difficulty you can turn it off so it doesn't appear that you are "missing out" not having cleared Easy or Expert of a
campaign.

By importing **final state of campaigns** you had accumulated, the system will analyze and present fun information back
to you. You may remembered which campaign you had cleared Standard or Hard already, but it maybe hard to answer more
complex question like :

- Which card you hadn't managed to purchase into the deck at all?
- Which Investigator Expansion as a whole is under-utilized?
- Did we ever took a particular branch in the story in a particular campaign?
- Unique official achievements (in newer releases and Return To) you had unlocked across all plays.
- How many wins without any Guardian and Seeker in the team?

## The ID

You are required to register an ID to get a place to keep your campaigns. You get a sharing URL based on this ID
username.

The ID does not represent an individual playing the game but rather a profile as a whole. Inside the ID you may create
players, including yourself, to identify each deck. (This is unlike ArkhamCards app where each ID represents one player
and each player joins a campaign hosted by one of the players.)

## The input

The unit of input is each ending state of a campaign. Once you input a campaign, they are **copied** to my database and
becomes read-only. There is no way to edit it, you can only delete. If you delete any previous input, the profile is
recomputed at that point. This make my code simpler and cheaper to host as the profile only changes when you add or
delete a campaign.

- Which campaign and which difficulty level you played.
- **Unpublished but public** decks registered and upgraded along the campaign in arkhamdb.com. Only the final version is
  required for each player, it will follow back to the first 0 XP version. You can also inclde all the killed / insane
  decks and flag them as such. From this, it knows total XP you gained in a scenario and also all the cards you managed
  to purchase into your deck. It does not care which arkhamdb the deck came from, you manually assign player again in
  the input UI.
- If the same player is assigned to all decks included, the campaign is automatically marked as True Solo.
- All the things written in Campaign log. To prevent spoilers of unseen choices, the input form will let you type freely
  what you have in the log, and autocomplete will appear to confirm if you indeed meant this one or not.
- Achievements you had unlocked in that run.
- You can tag the run with arbitrary labels. For example you played this at yearly convention, you played this with
  house rules, etc.
- One arbitrary photo per campaign. You can use this opportunity to take a picture of your gaming desk before you clean
  up the game, for example.
- You can mark whether to allow this campaign to be included in the global analytics or not. Later on when there is
  enough users using this system, I maybe able to run a "automatic poll" of things across all AHLCG horror players, if
  you allow it.
- Start and finish date. Both sides optional.

Decks are copied completely at the point of import. The history will not disappear if they are deleted from
arkhamdb.com / suddenly made private.

## Advanced Input

For players looking to analyze even deeper, turning on Advanced Input will let them bookkeep performance based on **each
individual scenario**. Turning this on and the campaign is marked as "Advanced". These data are advanced in a sense that
they requires player to jot down somewhere else not in the campaign log after each scenario, to be input when the
campaign ends, so much more involved to record.

- Scenario play time.
- Ending resolution you got.
- Ending Act / Agenda number.
- Ending doom count.
- Experience gained.
- "Remembered that" (This wording is strictly scenario-specific.)
- Other scenario-specific choices that is not remembered in the campaign log.

While these are not rememberd automatically in ArkhamCards app, you can use the custom campaign log feature to write
them down while you play. Perhaps more importantly, Advanced Input is not generic and therefore not available until that
campaign is repackaged and I finally completed it (lol).
