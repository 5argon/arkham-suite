# Build Spec: `tsk-solver`

You are building **`tsk-solver`**, a framework-agnostic TypeScript package that
computes optimal campaign routes for the Arkham Horror LCG campaign *The Scarlet
Keys* (TSK). All game logic lives in this package; the web app (React or Svelte)
is a thin form that calls `solve()` and renders the results. The package ships
its own i18n strings (via Paraglide) so the UI never hardcodes campaign text.

This is a route planner that ignores spoilers on purpose — it is the inverse of
how the campaign is meant to be discovered. The user gives constraints; the
solver returns a small set of distinct, playable "recipes" or a proof that the
constraints cannot all be satisfied.

The campaign data is provided as **`tsk_database.json`** (ships inside the
package, see §9). Treat it as the single source of truth. Do **not** invent map
connections, time costs, or resolutions — read them from the JSON.

---

## 1. Deliverables

A publishable npm package with:

```
tsk-solver/
  package.json            # ESM, "type":"module", exports map, no framework deps
  tsconfig.json           # strict: true
  src/
    index.ts              # public API surface (solve, types)
    types.ts              # all exported types
    data/
      tsk_database.json   # the provided database (committed)
      load.ts             # typed loader + integrity validation
    graph/
      graph.ts            # dynamic adjacency, BFS, distance matrix
      state.ts            # CampaignState machine
    solver/
      solve.ts            # orchestrator
      waypoints.ts        # constraints -> required nodes/outcomes (incl. chains)
      search.ts           # state-aware route search
      timefloor.ts        # lower-bound / impossibility proofs
      sequence.ts         # ordered-constraint scoring
      ticket.ts           # Expedited Ticket optimization
      archetypes.ts       # scoring per archetype
      diversity.ts        # Jaccard clustering + clamp
    i18n/
      messages/en.json    # Paraglide source messages (+ fr, es, it stubs)
      recipe.ts           # turns a Recipe into localized strings
  tests/                  # Vitest suites (see §11)
  README.md               # full docs (see §10)
```

Constraints:
- **No UI / framework imports.** Pure TS + the JSON. No DOM, no React/Svelte.
- **Deterministic.** Same input → byte-identical output. No `Math.random`, no
  `Date.now`, no Set/Map iteration order that leaks into output ordering. Sort
  every collection before returning.
- ESM, Node 18+, `strict` TypeScript, zero runtime deps except `@inlang/paraglide-js`.

---

## 2. Domain model

### 2.1 The map is a state-dependent weighted directed graph
- 36 location nodes (`locations[]` in the JSON). Every travel path (an entry in
  a node's `connections`) costs **1 time**. Edges are bidirectional in the data
  but model them as directed for generality.
- Travel cost between A and B = number of paths used = BFS hop count, **on the
  graph that is currently unlocked** (see §2.3).
- You may pass through a node without stopping; passing through still costs 1 per
  path. Stopping at a node "plays" whatever is there (`scenario_id`).
- **Stop-lockout:** once you stop at a node you cannot stop there again
  (`time_mechanics.stop_lockout`). Track visited-stops in state.

### 2.2 Node kinds (`node_kind`)
- `start` — London. The campaign begins here (prologue *Riddles and Rain*).
- `scenario` — a combat session with `resolutions[]` (see §2.5).
- `finale` — Tunguska / *Congress of the Keys*. Reaching it ends the campaign.
- `interlude` — non-combat story node; has `outcomes[]`, usually low/zero time.
- `side_story` — green node; free to pass through, costs time = XP cost if played.

### 2.3 Locked nodes make the graph dynamic (critical)
A node with `status: "locked"` **cannot be entered at all** — neither stopped at
nor passed through — until its `unlock_condition` flag is set in
`CampaignState.flags`. This is the heart of the problem and the reason naive
"shortest path on the full map" estimates are wrong.

Locked nodes and what unlocks them (all encoded in the JSON):
- `tunguska` ← `code_59Z_written` (Beta status report at box 15, or forced by Omega)
- `bermuda_triangle` ← `code_56Y_written` (Romulus and Remus in Rome, requires off-mission)
- `kuala_lampur` ← `code_46Q_written` (Blood, Sweat, and Tea in Hong Kong)
- `hong_kong` ← `code_50S_written` (The Coiled Serpent in Shanghai, or Psi marker)
- `manokwari` ← `code_45P_written` (Theory of Annihilation / Paranatural Selection)
- `kabul`, `quito`, `san_juan`, `reykjavik` ← `code_14C_written` (Zeta status report)
- `london` revisit (`dead_and_gone`, file 27-H) ← `code_27H_written` (Ringing Hollow in Sydney).
  Note London is also the `start`; the prologue is always playable, but you cannot
  *return and stop* for the 27-H interlude until 27-H is written.

The distance matrix is therefore **not static**. Recompute reachability against
the set of currently-unlocked nodes whenever state changes, or compute distances
lazily per search state. (A practical implementation: incremental BFS keyed by
the frozen set of unlocked nodes; memoize per unlock-set.)

### 2.4 Campaign state machine (`state.ts`)
`CampaignState` tracks at minimum:
```ts
interface CampaignState {
  node: NodeId;                  // current location
  timePassed: number;            // boxes filled
  visitedStops: Set<NodeId>;     // stop-lockout
  flags: Set<string>;            // log entries + unlock codes (e.g. off_mission, code_56Y_written)
  keys: Map<KeyId, BearerId>;    // key -> bearer (investigator | enemy | story_asset)
  allies: Set<AllyId>;           // deck-bound story assets recruited
  assets: Set<string>;           // e.g. mysterious_whistle, expedited_ticket, foundation_intel
  bless: number; curse: number;  // chaos tokens (cap 4)
  xpBonus: number;               // accumulated bonus XP (for Scholar)
  trust: number; deception: number; // running tallies (see §7)
  hasTicket: boolean;            // unused Expedited Ticket in hand
  markers: Map<string, number>;  // written symbols: theta, psi, delta -> box index
}
```
Applying a resolution/outcome mutates state: add `time`, set `logs` as flags,
update `keys`, grant assets/allies, adjust trust/deception, set any `unlocks`,
write any `writes_marker`. State transitions must be pure (return a new state).

### 2.5 Resolutions and "what-if"
Each scenario has `resolutions[]`, each with: `id`, `time`, `bearer`, `key`,
`logs[]`, `xp`, optional `trauma`, `achievement`, `requires`, `no_resolution`,
`outcome` (`WIN_CAMPAIGN`/`LOSE_CAMPAIGN`). `requires` gates which resolutions
are reachable (e.g. Dogs of War R2 requires `version_v2`; Dead Heat R3 requires
`call_amaranth_true_name`).

For every scenario node the solver must be able to model both **win** (an
optimal resolution that satisfies the user's goals) and **lose** (a
`no_resolution` entry). The output must expose the delta in time and the
downstream effect of each, because losing a scenario often still marks time and
changes the finale vote. `LOSE_CAMPAIGN` resolutions (Without a Trace no-res,
Congress R2) are dead ends and must be pruned from any winning route.

### 2.6 Status reports (time interrupts)
`status_reports` are triggered by time. Two types:
- `box_symbol` — fires when `timePassed` crosses the symbol's box. Beta (box 15)
  writes 59-Z (unlocks Tunguska). Omega (final box) forces travel to Tunguska →
  finale. Zeta steals a key and writes 14-C. Alpha/Gamma add curse/weakness.
  Epsilon adds recurring enemies. The solver must inject these as automatic state
  changes when the time threshold is reached during a route.
- `written_marker` — Theta/Psi/Delta are written into the time track by specific
  outcomes at a box offset (`writes_marker.offset` boxes ahead of current time).
  They gate later nodes/interludes (e.g. Delta gates Metamorphosis to ≤10 time
  later; Psi/Theta unlock Hong Kong / The Safehouse).

---

## 3. Public API

```ts
export function solve(input: SolveInput): SolveOutput;

interface SolveInput {
  constraints: Constraint[];        // ordered; index = priority order
  preferences?: {
    respectOrder?: boolean;         // honor constraint order (see §6)
    maxScenarios?: number;          // hard cap on combat sessions played (see §5)
    maxResults?: number;            // default 5
    difficulty?: 'easy'|'standard'|'hard'|'expert';
    allowExpeditedTicket?: boolean; // default true
    ticketUse?: { mode: 'auto' } | { mode: 'manual', jumpTo: NodeId };
    locale?: 'en'|'fr'|'es'|'it';
  };
}

type SolveOutput =
  | { ok: true;  recipes: Recipe[] }            // 1..maxResults distinct routes
  | { ok: false; proof: ImpossibilityProof };   // constraints provably unsatisfiable
```

### 3.1 Constraint types
A `Constraint` is a discriminated union. Support at least:
```ts
type Constraint =
  | { kind: 'visit_scenario';   scenario: ScenarioId }                       // L1: just play it
  | { kind: 'scenario_resolution'; scenario: ScenarioId; resolution: ResId } // L2: specific outcome
  | { kind: 'scenario_version'; scenario: ScenarioId; version: string }      // L3: specific version
  | { kind: 'get_key';          key: KeyId; bearer?: 'investigator' }        // key, optionally held by you
  | { kind: 'recruit_ally';     ally: AllyId }                               // deck-bound story asset
  | { kind: 'achievement';      id: AchievementId }                          // e.g. speed_demon
  | { kind: 'narrative_chain';  id: ChainId }                                // e.g. understand_aliki
  | { kind: 'visit_node';       node: NodeId }                               // hit a map node
  | { kind: 'avoid_scenario';   scenario: ScenarioId }                       // exclude (e.g. shades_of_suffering)
  | { kind: 'reach_ending';     trial: string }                             // e.g. join / overthrow Coterie
  | { kind: 'finale_outcome';   outcome: 'WIN' };
```
Each constraint expands (in `waypoints.ts`) into required nodes + required
outcomes + required flags, pulling from `narrative_chains`, `scenarios`,
`allies`, and `keys` in the JSON. A `narrative_chain` constraint expands to its
ordered `waypoints[]`; an `achievement` like `whats_in_a_name` expands to the
resolution that satisfies it.

### 3.2 Recipe shape
```ts
interface Recipe {
  archetype: 'speedrunner'|'collector'|'loyalist'|'renegade'|'scholar';
  steps: Step[];            // ordered, exhaustive (every travel + stop)
  totalTime: number;
  scenarioCount: number;
  keysHeld: KeyId[];        // by an investigator at finale
  alliesRecruited: AllyId[];
  trust: number; deception: number;
  endingBranch: string;     // predicted Trial outcome / epilogue
  warnings: LocalizedString[];   // e.g. "entering Marrakesh at T>=15 skips Act 1"
  satisfies: ConstraintRef[];    // which input constraints this recipe meets
}

interface Step {
  type: 'travel'|'stop'|'play'|'use_ticket'|'status_report'|'finale';
  node?: NodeId;
  pathCost?: number;             // time added by this travel leg
  scenario?: ScenarioId;
  resolution?: ResId;            // for stops; mark "any" when no specific res is required
  resolutionRequired: boolean;   // false => "any resolution OK" (see §3.3)
  reason?: LocalizedString;      // why this step / why this resolution
  timeAfter: number;
}
```

### 3.3 Resolution menu semantics (important)
Every `stop`/`play` step must declare whether a **specific** resolution is
required or **any** resolution is acceptable:
- `resolutionRequired: false` → "Any resolution OK" (the user only wanted to hit
  the node, or any outcome yields the needed key/flag).
- `resolutionRequired: true` → name the exact `resolution` and put the reason in
  `reason` (e.g. "Resolution 2 — needed to defeat the Void Chimera and keep The
  Sable Glass", or "Resolution 3 — required for achievement What's in a Name?").
When a goal is satisfiable by multiple resolutions (e.g. The Last Blossom comes
from Dead Heat R3 **or** R4), default to the lowest-time one unless another
constraint (achievement, sequence, trust/deception) forces a specific one.

---

## 4. Core algorithms

### 4.1 Distance / reachability
Implement BFS hop-count on the **currently unlocked** subgraph. Provide
`distance(state, from, to)` and `reachableFrom(state, from)`. Memoize by the
frozen unlocked-node set. Locked nodes are absent from the graph until their flag
is set; do not allow pass-through of locked nodes.

### 4.2 Route search (`search.ts`)
A state-space search from `start` (London) to `finale` (Tunguska):
- Expand by choosing the next *stop* among reachable required/eligible nodes;
  travel cost = `distance` on the current unlocked graph; apply the chosen
  resolution/outcome to produce the successor state.
- Respect: stop-lockout, locked-node gating, `requires` on resolutions/outcomes,
  `maxScenarios`, and status-report interrupts that fire as time accumulates.
- Prune branches that exceed any active time cap or that can no longer reach a
  remaining required waypoint (admissible lower-bound pruning, §4.3).
- Use uniform-cost / A* with the time-floor as the heuristic; cap explored states
  to keep the front-end responsive (document the cap in the README).

### 4.3 Time floor & impossibility proof (`timefloor.ts`)
The package's headline feature: **confidently prove** some constraint sets are
unsatisfiable, with arithmetic.

Compute a lower bound for a set of required waypoints W given current state:
```
timeFloor(W) = prologueTime
             + minTravelToVisitAll(W)        // Steiner/permutation lower bound on unlocked graph
             + sum(minResolutionTime(w) for w in W)   // cheapest qualifying resolution per node
             + forcedInterruptTime(W)         // e.g. unlock prerequisites
```
- `minTravelToVisitAll` — because exact Steiner/TSP is expensive, use an
  admissible lower bound (e.g. max over required pairs of shortest path, or an MST
  of the required-node metric closure on the unlocked graph). It must never
  overestimate.
- If a required node is locked and its unlock prerequisites add mandatory detours,
  include those nodes in W transitively before bounding.

`ImpossibilityProof` must be human-legible and cite real numbers:
```ts
interface ImpossibilityProof {
  conflict: string;                 // e.g. "speed_demon vs understand_aliki"
  cap: number;                      // e.g. 17
  breakdown: { label: string; value: number }[]; // prologue, travel legs, resolutions...
  floor: number;                    // sum
  message: LocalizedString;         // "Minimum travel alone is X; mandatory resolutions add Y; floor Z > cap."
}
```
Also detect **scenario-count** impossibility (a goal set needs more sessions than
`maxScenarios`) and **logical** impossibility (mutually exclusive flags — e.g.
"Aliki is on your side" requires blowing the whistle, while recruiting Agent
Quinn as a deck asset requires disposing of it; both cannot hold).

> Worked example to reproduce in a test (numbers from the real graph):
> "Speed Demon (≤17) + Understand Aliki". On the dynamically-unlocked graph the
> mandatory waypoints (Sydney → Kathmandu → London/27-H → Rome → Bermuda
> Triangle, plus Tunguska) require well over 17 travel paths *before* resolution
> time; add the prologue and the Without a Trace / On Thin Ice resolution marks
> and the floor exceeds 17. Return `ok:false` with the arithmetic. (Compute the
> exact figures from the JSON at test time rather than hardcoding them.)

### 4.4 Expedited Ticket (`ticket.ts`)
The ticket is acquired at San Francisco or Moscow (Quid Pro Quo, choose
"fast travel") and is **manually used** once for a 0-time jump to any unlocked
node. Model it as a consumable wildcard edge: while `hasTicket`, there is a
weight-0 edge from the current node to every unlocked node; using it flips
`hasTicket` to false.
- `ticketUse.mode: 'auto'` → the solver picks the single jump that minimizes total
  time (typically the longest mandatory leg), and the recipe emits a
  `use_ticket` step naming the exact embark point and destination.
- `ticketUse.mode: 'manual'` → reserve the jump for the user-specified `jumpTo`
  and route the rest around that fixed use.
The recipe must always state the exact moment: a `use_ticket` step with
`from`/`to` and the time saved. Acquisition is only added when it yields a net
time gain (or is the only way to satisfy a cap).

### 4.5 Archetypes (`archetypes.ts`)
Score every candidate route under each archetype's weight vector (in JSON
`archetypes`): speedrunner (min time), collector (max keys held by investigators),
loyalist (max trust), renegade (max deception), scholar (max bonus XP per time).
Pick the best route per archetype among those satisfying all constraints.

### 4.6 Diversity clamp (`diversity.ts`)
Avoid solution bloat. Generate candidates, then:
1. Compute Jaccard similarity between routes on the set of `(node, resolution)`
   pairs (`diversity.cluster_on`).
2. Cluster routes whose similarity ≥ `merge_threshold` (0.75); keep the best per
   cluster by that cluster's archetype score.
3. Return at most `maxResults` (default 5), one per archetype where possible.
4. Sort the returned list deterministically (by archetype enum order, then time).
Enforce `loyalist_vs_renegade_max_similarity` (0.6) so those two never collapse
into near-identical routes. If fewer than 5 distinct routes exist, return fewer —
never pad with duplicates.

---

## 5. Scenario-count constraint
`preferences.maxScenarios` caps how many `scenario`-kind stops a recipe may
include (for players with limited sessions). Interludes and pass-throughs don't
count; only combat scenarios do. If the required goals force more scenarios than
the cap, return an `ImpossibilityProof` of type scenario-count identifying which
goals are the bottleneck (e.g. "6 distinct keys require ≥6 scenarios, cap is 4").

## 6. Sequential priority
When `respectOrder` is true, recipes are ranked so that constraints are satisfied
in (or close to) the order the user listed them — players often want a key *early*
to use its shift ability in later scenarios, not just at the finale.
- Score each candidate by the alignment of its acquisition order with the
  requested order (use an edit-distance / Kendall-tau style penalty), with a bias
  toward earlier `timePassed` of acquisition.
- The primary recipe should acquire constraint #1 first even if a different route
  is shorter overall; surface a `warning` if honoring the order is materially
  slower ("Honoring this order costs +N time vs the fastest route").
- When `respectOrder` is false, ignore order and optimize purely per archetype.

## 7. Trust / Deception & finale prediction
Maintain `trust`/`deception` from `trust_deception` sources as flags are set.
Predict the finale branch and epilogue using `trial_logic` (member votes from
flags) and the trust≥deception epilogue rule. Loyalist/renegade archetypes
optimize these tallies; `reach_ending` constraints (join / overthrow / spared)
must be checked against the predicted Trial branch.

---

## 8. Internationalization (Paraglide)
- Use `@inlang/paraglide-js`. All user-facing strings produced by the solver
  (recipe steps, reasons, warnings, impossibility messages) are **message
  functions**, never inline literals.
- `LocalizedString` is an opaque message-id + params object; `i18n/recipe.ts`
  resolves it for the requested `locale`. The web app calls the resolver, so the
  package owns all copy.
- Provide typed messages with params, e.g. `travel_to({city})`,
  `stop_and_play({scenario})`, `resolution_required({scenario, resolution, reason})`,
  `any_resolution_ok({scenario})`, `use_ticket({from, to, timeSaved})`,
  `warning_time_scaling({scenario, threshold, effect})`,
  `impossible({conflict, floor, cap})`, `recruit_ally({ally, node})`,
  `get_key({key, node, resolution})`.
- Ship `en.json` complete; provide `fr/es/it` files keyed identically (English
  fallback values are fine as stubs). Keep scenario/location/key IDs as stable
  keys — never translate the IDs, only display names.

## 9. Data loading & integrity (`data/load.ts`)
- Import `tsk_database.json` and expose strongly-typed accessors. Generate or
  hand-write types in `types.ts` matching the JSON shape.
- On load (and in a test), validate integrity:
  - every `connections` target exists; graph is symmetric.
  - every `scenario_id` on a node exists in `scenarios` or `interludes`.
  - every `unlock_condition` is produced by some outcome's `unlocks`/status report
    `sets` (no orphan locks).
  - every `key` referenced in resolutions exists in `keys`.
  - every `narrative_chain` waypoint references a real node/outcome.
- Fail fast with a clear error if the JSON is malformed.

## 10. README.md (required)
Write an extensive README covering:
- **Overview** — what the package does; spoiler warning.
- **The mathematical model** — state-dependent weighted directed graph; edges = 1
  time; dynamic locked-node gating; the state machine; consumable ticket edge.
- **Algorithms** — BFS distance, state-space search with time-floor heuristic,
  the admissible lower bound used for `minTravelToVisitAll`, and how
  impossibility proofs are derived (with the Speed-Demon-vs-Aliki worked example).
- **Constraint reference** — every `Constraint` kind with examples; the three
  scenario constraint levels (visit / resolution / version); all 11 keys and
  where they come from; the deck-bound allies and their recruitment chains;
  achievements; `maxScenarios`; `respectOrder`.
- **Clamped output** — Jaccard clustering, the 0.75 threshold, the 5 archetypes
  and their scoring, the loyalist/renegade distinctness guarantee.
- **i18n** — how to add a locale; how the app consumes message functions.
- **Determinism guarantees** and the state-exploration cap.

## 11. Tests (Vitest, deterministic)
Because the solver is deterministic and clamped, tests assert exact structure.
At minimum:
- **Data integrity** — all §9 checks pass against the shipped JSON.
- **Golden chain — Understand Aliki** — solving `{narrative_chain: understand_aliki}`
  yields a recipe whose stops include Sydney, Kathmandu, London(27-H), Rome,
  Bermuda Triangle in a valid (state-legal) order, ending at Tunguska.
- **Ally chain — Dr. Irawan** — solving `{recruit_ally: dr_dewi_irawan}` forces a
  meet at Rio or Perth before Manokwari, and Manokwari within ≤10 time of the
  Delta marker.
- **Impossibility — Speed Demon + Understand Aliki** — returns `ok:false` with an
  `ImpossibilityProof` whose `floor > 17`; assert the breakdown sums correctly
  (compute expected floor from the JSON, don't hardcode).
- **Scenario-count impossibility** — `{get_key x6}` with `maxScenarios:4` →
  `ok:false`, scenario-count conflict.
- **Sequential priority** — `respectOrder:true` with keys `[shade_reaper, eye_of_ravens]`
  produces a primary recipe that acquires the Shade Reaper before the Eye of Ravens
  (or warns + explains if state-illegal), distinct from the `respectOrder:false` result.
- **State gate** — requesting the London 27-H interlude without Sydney first
  yields no valid route (or a route that inserts Sydney first); never a route that
  stops at 27-H with the flag unset.
- **Expedited Ticket** — with a high-travel goal and `allowExpeditedTicket:true`,
  the chosen route contains exactly one `use_ticket` step with a 0-time jump, and
  total time is ≤ the no-ticket route.
- **Locked pass-through** — assert no recipe ever travels *through* a locked node
  before its unlock flag is set (e.g. never routes through Tunguska pre-Beta).
- **Clamp & diversity** — solving `{finale_outcome: WIN}` alone returns ≤5
  recipes, all distinct, with Jaccard(loyalist, renegade) < 0.6.
- **Resolution menu** — a recipe marks `resolutionRequired:false` on nodes only
  visited for presence, and `true` (with a reason) where a specific resolution is
  mandated (e.g. On Thin Ice R2 for the boss, Dead Heat R3 for What's in a Name?).

Tests must be non-flaky: any variance for identical input is a bug in traversal
ordering — fix the ordering, don't loosen the assertion.

---

## 12. Implementation order (suggested)
1. `data/load.ts` + `types.ts` + integrity tests (lock the data contract first).
2. `graph/` (dynamic BFS, distance memoization) + locked-pass-through test.
3. `state.ts` (pure transitions) + status-report interrupts.
4. `waypoints.ts` (constraint → requirements expansion).
5. `timefloor.ts` + impossibility tests (this is the differentiator).
6. `search.ts` (route search) + golden-chain tests.
7. `ticket.ts`, `sequence.ts`, `archetypes.ts`, `diversity.ts`.
8. `i18n/` + `solver/solve.ts` orchestration + remaining tests.
9. `README.md`.

Keep every module independently unit-testable and free of UI concerns.
