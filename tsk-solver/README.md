# @5argon/arkham-tsk-solver

A framework-agnostic TypeScript solver that computes **optimal campaign routes** for the
Arkham Horror LCG campaign *The Scarlet Keys* (TSK), or **proves with arithmetic** that a set
of constraints cannot all be satisfied.

> ⚠️ **Massive spoiler warning.** This package is the *inverse* of how TSK is meant to be
> discovered. The campaign is a nonlinear, spoiler-driven globe-trot; this tool plans it
> backwards from your goals. Merely *naming* the constraints (which scenarios, which
> resolutions, which keys, which ending) reveals the campaign's structure. Use it for replays,
> achievement hunts, and "gauntlet" planning — not for a blind first run.

The package is pure TypeScript + a JSON database. No DOM, no React/Svelte. Deterministic:
identical input → byte-identical output. The only runtime dependency is
`@inlang/paraglide-js` (for localized output strings).

```ts
import { solve } from '@5argon/arkham-tsk-solver';

const out = solve({
  constraints: [{ kind: 'narrative_chain', id: 'understand_aliki' }],
  preferences: { maxPerScenarioCount: 6, locale: 'en' },
});

if (out.ok) {
  for (const recipe of out.recipes) console.log(recipe.scenarioCount, recipe.totalTime, recipe.playedScenarios);
} else {
  console.log(out.proof.kind, out.proof.floor, '>', out.proof.cap);
}
```

---

## 1. The mathematical model

TSK is modeled as a **state-dependent, weighted, directed graph**.

- **Nodes** are the 36 map locations. **Edges** are the map's `connections`; every travel path
  costs **1 time** (BFS hop count). Travel cost between A and B is the number of paths used; you
  may pass *through* unlocked nodes for free of stopping (still 1 time per hop), but **stopping**
  at a node "plays" whatever is there.
- **Stop-lockout**: once you stop at a node you cannot stop there again (London is the sole
  exception — its prologue *and* the 27-H revisit are two permitted stops).
- **Dynamic locked nodes** are the heart of the problem. A `status: "locked"` node can be
  neither stopped at nor *passed through* until its `unlock_condition` flag is present in
  campaign state. So the distance matrix is **not static** — it is recomputed against the set of
  currently-unlocked nodes. We memoize BFS keyed by the frozen set of unlock flags.
  - London is `status: "locked"` in the data but is the campaign *start*; it is always
    travel-accessible. Only its 27-H revisit *stop* is gated (by `code_27H_written`).
- **The campaign state machine** ([`graph/state.ts`](src/graph/state.ts)) tracks current node,
  time passed, visited stops, flags (log entries + unlock codes), keys→bearer, allies, assets,
  Tablet/Elder-Thing chaos tokens, bonus XP, trust/deception, ticket possession, and written
  markers. Transitions are **pure** (return a fresh state).
- **Time interrupts**: when time crosses a box bearing a status-report symbol, the report fires
  automatically. Only **Beta (box 15 → writes 59-Z, unlocks Tunguska)** and **Omega (final box →
  forced finale)** have fixed positions in the data, so only those are auto-fired; written
  markers (Psi → unlock Hong Kong, etc.) fire when their written box is crossed.
- **The Expedited Ticket** is a consumable weight-0 wildcard edge: a single 0-time jump to any
  unlocked node, acquired at a Quid Pro Quo node ("fast travel").

### Modeling assumptions (where the data is silent)

The shipped `tsk_database.json` is enriched from the campaign guide but is still the single
source of truth. A few deliberate, documented choices:

- **Chaos tokens.** TSK's special tokens are **Tablet** and **Elder Thing** (the campaign-guide
  PDF mis-rendered them as "bless"/"curse"). State carries them as `tablet`/`elderThing`.
- **Status-report boxes.** The time track carries α@7, ε@10, β@15, ζ@20, γ@24, ω@final. β unlocks
  Tunguska; **ζ@20 steals an investigator-held Key** and unlocks the 14-C nodes (Kabul, Quito, San
  Juan, Reykjavík); ω forces the finale. Reports fire automatically as time crosses their box.
- **Key theft + take-back.** A route that crosses ζ@20 still holding Key(s) loses a random one. The
  recipe warns, and `keyTakeBackSites` (default 1) makes such routes pass through that many 14-C
  "Ruses and Reclamation" sites to recover it (raise it for insurance against the "wrong leads"
  randomness). Routes that finish before ζ never trigger it — Speed-Demon runs need no take-back.
- **`requires` strings.** Many are *play-time decisions* (e.g. "told_truth_to_taylor",
  "call_amaranth_true_name"). The solver only blocks an option on tokens it actually routes for
  (unlock codes, curated routing flags/assets, markers, time conditions, versions). Everything
  else is assumed satisfiable by player choice — and documented as such.
- **Side-story XP costs** (green nodes) come from each standalone's entry XP cost (= time spent if
  played). Standalone nodes are never inserted into a plan unless requested (a side-story constraint
  or the Wellspring of Fortune key). Scenario `time_tiers` give the entry-time "level" (`Lv. N/M`)
  shown per stop; opportunistic XP / chaos-bag "freebies" are surfaced per recipe.

---

## 2. Algorithms

### BFS distance / reachability ([`graph/graph.ts`](src/graph/graph.ts))
`distance(flags, from, to)` and `reachableFrom(flags, from)` run BFS on the subgraph induced by
the *currently unlocked* nodes, memoized per the canonical signature of present unlock flags.
Locked nodes are absent, so the solver can never route through one before its flag is set.

### State-space search with an A\* time-floor heuristic ([`solver/search.ts`](src/solver/search.ts))
A uniform-cost / A\* search from London to the Tunguska finale. A "move" picks a reachable stop
node, travels (BFS distance on the current unlocked graph), stops, and applies one stop option.
The search honors stop-lockout, locked-node gating, resolution `requires`, the scenario cap,
forbidden scenarios, status-report interrupts, and the active time cap; it prunes LOSE_CAMPAIGN
dead ends and treats the finale as **terminal** (legal only once all other goals are met).

Priority is `f = g + h`:
- `g` = time passed so far.
- `h` = an **admissible** lower bound on remaining time =
  `max(beta_box − time, dist(node, finale), max over unmet goals of dist(node, nearest goal node))`,
  with distances on the *fully-unlocked* graph (a supergraph, so its distances never overestimate
  the dynamic ones). Admissibility means the first goal A\* pops is time-optimal — exactly as plain
  Dijkstra would, but with the wasted breadth pruned away.

The search runs in two passes: a *minimal* candidate set first (fast for self-sufficient chains
like Understand Aliki, which already exceeds the Beta floor), then — only if that finds nothing —
a *capped enrichment pool* of value-bearing, time-advancing nodes so under-constrained queries can
accrue the time needed to reach Beta@15 and so archetypes/diversity have material. State
exploration is capped (`maxStates`, default 30 000) to stay responsive; the cap is documented and
configurable.

### Admissible time floor + impossibility proofs ([`solver/timefloor.ts`](src/solver/timefloor.ts))
The headline feature: cheaply **prove** a constraint set is unsatisfiable.

```
timeFloor = travel + Σ minStopTime(forced nodes) , clamped below by the finale-unlock floor (Beta+1)
```

- `travel` is a **precedence-respecting** shortest path (Held-Karp) that starts at London, ends at
  Tunguska, and visits every *forced* (single-candidate) waypoint, using full-graph distances and
  honoring the precedence the narrative chains and locked-node unlocks impose. Because real routes
  must visit those waypoints in *some* legal order and each segment is ≥ the full-graph shortest
  path, this is an admissible lower bound — yet tight enough to expose real conflicts.
- Every quantity is computed from the JSON, never hardcoded.

**Worked example — "Speed Demon (≤17) + Understand Aliki".** The Aliki chain forces, in order,
Sydney → Kathmandu → London(27-H revisit) → Rome → Bermuda Triangle → Tunguska. On the
precedence-respecting full graph this back-and-forth (London↔Australia↔Nepal↔London↔Italy↔Atlantic
↔Siberia) costs **well over 17 travel paths** *before* resolution time; adding the prologue and the
mandatory resolution marks pushes the floor past 17. `solve` returns `ok: false` with a `time_floor`
proof whose `breakdown` sums to the floor (the test recomputes the figure from the JSON rather than
asserting a magic number).

Also detected: **scenario-count** impossibility (N distinct scenario-only keys need ≥ N combat
sessions; if that exceeds `maxScenarios`, return a `scenario_count` proof) and **logical**
impossibility (mutually exclusive choices, e.g. "Aliki on your side" via *blow the whistle* versus
recruiting Agent Quinn via *dispose of the whistle*).

### Expedited Ticket ([`solver/ticket.ts`](src/solver/ticket.ts))
Optimized **post-hoc** on a finished route (to keep the hot search loop small): try inserting the
ticket acquisition before the route's longest leg and replacing that leg with a 0-time jump,
re-simulating to verify legality and net savings. `auto` picks the jump that minimizes total time;
`manual` reserves it for a fixed node. The recipe emits exactly one `use_ticket` step naming the
embark point, destination, and time saved — and only when it is a net gain.

### Diversity by scenario count ([`solver/diversity.ts`](src/solver/diversity.ts))
The solver computes a broad pool of winning routes; players browse them by **how many combat
scenarios** they want to play. So routes are **bucketed by scenario count**, and within each bucket
we keep a diverse set:
1. Compute Jaccard similarity between routes on `(visited nodes, (node, resolution) pairs)`.
2. Within each scenario-count bucket, keep up to `maxPerScenarioCount` (default 6) routes that are
   pairwise distinct (similarity < `merge_threshold`, 0.75), cheapest-time representative first.
3. Round-robin across buckets up to `maxResults` (default 48) so small and large playthroughs stay
   represented; sort by (scenario count, time). Never padded with duplicates.

Each recipe reports its `playedScenarios` (for grouping + scenario-icon display) and, per scenario
stop, a time-based **level** (`Lv. N/M — …`, e.g. Dealings in the Dark "Lv. 3/4 — clues equal to the
investigators") read from the scenario's `time_tiers`. (Earlier versions organized output by five
fixed archetypes; that was replaced by scenario-count diversity.)

### Finale prediction ([`solver/trial.ts`](src/solver/trial.ts))
The Coterie's Trial-1 vote is reproduced from the guide's per-member rules: each member votes
yea/nay/abstain/silent from the campaign log, with the "knows true nature → Trial 6" and "≥3 silent
→ Trial 7" overrides, then the nay-overthrow / nay-join / asset tally. The epilogue branch follows
the Foundation-Trust ≥ Cell-Deception rule. `reach_ending` constraints and the finale achievements
check against this prediction.

---

## 3. Constraint reference

A `Constraint` is a discriminated union; any constraint may carry `negate: true` to **exclude**
routes that satisfy it (a generalization of `avoid_scenario`). Negated node/scenario constraints
forbid *stopping* there (pass-through is still allowed, per the campaign rule); negated
key/ally/resolution/version/chain constraints filter out routes that obtain them.

| kind | meaning |
|---|---|
| `visit_scenario` | play a scenario (any resolution) |
| `scenario_resolution` | a specific resolution (resolutionRequired = true) |
| `scenario_version` | a specific version (e.g. Dancing Mad v2) |
| `get_key` (`bearer?: 'investigator'`) | obtain a key, optionally held by the cell |
| `recruit_ally` | recruit a deck-bound story asset (expands its recruitment chain) |
| `achievement` | see §4 |
| `narrative_chain` | an ordered chain, e.g. `understand_aliki`, `recruit_dr_irawan` |
| `visit_node` | hit a map node (incl. green side-story nodes) |
| `avoid_scenario` | exclude a scenario (≡ `visit_scenario` + `negate`) |
| `reach_ending` | target a Trial branch / epilogue |
| `finale_outcome: 'WIN'` | the implicit goal of every route |

**Three scenario constraint levels:** visit (just play it) → resolution (a specific outcome) →
version (a specific setup). **The 11 keys** and their sources are listed in the database `keys[]`
and `The Eleven Keys` table; some come from interludes (Bale Engine, Ruinous Chime, Mirroring
Blade) and one from a side story (Wellspring of Fortune ← Fortune and Folly at Monte Carlo).
**Deck-bound allies** (Inspector Flint, Agent Quinn, Dr. Irawan, Foundation Intel) expand their
recruitment chains. **`maxScenarios`** caps combat sessions; **`respectOrder`** ranks recipes by
how closely acquisition order matches the requested order (warning if structurally impossible).

---

## 4. Achievements

All 23 campaign achievements are selectable constraints. Routable ones expand to a routing
requirement (time cap, resolution, version, visit, difficulty, finale branch, epilogue);
*skill-based* achievements (e.g. *Porque No Los Dos?*) route you to the scenario **in the version
where the feat is possible** — the table feat itself is up to play. `key_to_my_heart` (collect all
11 keys) is a **cross-playthrough** achievement and is **excluded from single-run planning** (use
`get_key` directly instead).

Every recipe additionally reports **`earnableAchievements`**: each achievement the route *earns*
(`guaranteed`) or *makes possible* (`in_session`), flagged as requested or a surprise bonus — so a
player can discover achievements they didn't plan for.

---

## 5. Output

`solve` returns `{ ok: true; recipes: Recipe[] }` or `{ ok: false; proof: ImpossibilityProof }`.
A `Recipe` has ordered `steps` (every travel/stop/play/use_ticket/status_report/finale), totals,
keys held, allies, trust/deception, Tablet/Elder-Thing counts, predicted `endingBranch`,
`warnings`, `satisfies` (which constraints it meets), and `earnableAchievements`. All user-facing
strings are opaque `LocalizedString` descriptors — see §6.

---

## 6. Internationalization (Paraglide)

The solver core emits `{ id, params }` descriptors; it has **no** locale dependency. Only
[`i18n/recipe.ts`](src/i18n/recipe.ts) resolves them, via the Paraglide-generated message functions
in `src/paraglide/`. Resolve a single string with `resolveLocalized(ls, locale)` or a whole recipe
with `resolveRecipe(recipe, locale)`. `en` ships complete; `fr`/`es`/`it` are keyed identically
(English fallbacks). Scenario/location/key **IDs are stable keys and never translated** — only
display names. To add a locale: add `messages/<lang>.json`, list it in `project.inlang`, and run
`npm run paraglide`.

---

## 7. Determinism guarantees

- No `Math.random`, no `Date.now`.
- Every returned collection is sorted before returning; BFS neighbor order and heap tie-breaks are
  deterministic (lexicographic on a stable sequence key).
- State exploration is bounded by `maxStates` (default 30 000) and `maxDepth` (14). Same input ⇒
  byte-identical output. Any variance for identical input is a traversal-ordering bug, not a
  tolerance to loosen.

---

## 8. Development

```bash
npm run paraglide   # compile i18n message functions -> src/paraglide
npm run build       # tsc -b -> dist
npm test            # vitest (data integrity, golden chains, impossibility proofs, diversity, …)
```

The test suite asserts exact structure (the solver is deterministic and clamped). See `tests/`.
