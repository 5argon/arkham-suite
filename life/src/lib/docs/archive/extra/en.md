## The Extra tab

The **Extra** tab records details that ArkhamCards' final campaign log doesn't capture on its own,
so the profile's per-scenario widgets have something to show. For each scenario you can record:

- **Victory display** — the Victory Points (VP) you banked that scenario (drives the Victory Points Highscore).
- **Resolution** — which ending you reached (lights up Resolution Coverage and disambiguates a few
  win/loss tallies).
- **Scenario-specific inputs** — e.g. Dead Heat's rescued / slain civilians, Sanguine Shadows'
  targets kept.

You can also log **standalone** side scenarios you played inside the campaign.

## Empty is not zero

Leaving a number box blank means **"not recorded"**. It is not the same as 0.

This matters because when you lose in a typical scenario, a step that checks the Victory Display follows (and it might be 0). However when you fail a scenario that ends the campaign, there is no checking Victory Display step compared to when you win. In this case, you should left it blank instead of typing 0. (If you use ArkhamCards, the UI will accordingly not even have Victory Display section.) This will preserve the dash (—) in the XP highscore tracking.
