<!--
@component
The "Extra" tab — per-scenario data that is NOT reverse-engineerable from the
final campaign log: the victory-display highscore (points earned, the pilot),
the resolution reached, and named choices the log never records (e.g. PtC's
Hastur version in Dim Carcosa). Plus the standalone scenarios played *inside* this
campaign (an ordered list). All ride the reserved `__xp` / `__resolution` /
`__choice` / `__standalone` sections and the existing logs save flow.
-->
<script lang="ts">
	import type { CampaignLog } from '@5argon/arkham-campaign-data';
	import { standaloneScenarios } from '@5argon/arkham-campaign-data';
	import {
		Checkbox,
		Dropdown,
		EncounterSetIcon,
		FaIcon,
		FaIconType,
		Modal,
		parseArkhamMarkup,
		RadioButtons,
		TextInput
	} from '@5argon/arkham-life-ui';
	import Doc from '$lib/docs/Doc.svelte';
	import TskEditNote from './TskEditNote.svelte';
	import { getScenarioData, Scenario } from '@5argon/arkham-kohaku';
	import { campaignScenarios } from '$lib/campaign/campaign-log-source';
	import { choicesForScenario, choicesForStandalone } from '$lib/campaign/scenario-extras';
	import {
		isVersionLogInferable,
		scenarioTiersByName,
		tierOptionLabel
	} from '$lib/campaign/tsk-solver';
	import { resolutionLabel } from '$lib/campaign/resolutions';
	import {
		entriesInSection,
		makeEntry,
		replaceSection,
		standaloneDraftsFromLogs,
		standalonesToEntries,
		RESERVED,
		type LocalLog,
		type StandaloneEntry
	} from '$lib/campaign/recorded-state';

	interface Props {
		log: CampaignLog;
		canEdit: boolean;
		localLogs: LocalLog[];
		/** Autosave callback: receives the next logs after each edit. */
		onLogsChange: (next: LocalLog[]) => void;
	}
	let { log, canEdit, localLogs, onLogsChange }: Props = $props();

	let docOpen = $state(false);

	const scenarios = $derived(campaignScenarios(log));

	// Scenarios that can be SKIPPED — a manual flag (not inferrable from the log).
	// EotE's Ice and Death Part II / Part III can be bypassed.
	const SKIPPABLE = new Set(['ice_and_death_part_2', 'ice_and_death_part_3']);
	const skippedSet = $derived(
		new Set(entriesInSection(localLogs, RESERVED.scenarioSkipped).map((l) => l.key))
	);
	function setSkipped(scenario: string, on: boolean) {
		const others = entriesInSection(localLogs, RESERVED.scenarioSkipped).filter(
			(l) => l.key !== scenario
		);
		const next = on ? [...others, makeEntry(RESERVED.scenarioSkipped, scenario, [])] : others;
		onLogsChange(replaceSection(localLogs, RESERVED.scenarioSkipped, next));
	}

	// ── Standalone scenarios played inside this campaign ──────────────────────
	// The catalogue (names + resolutions) is campaign-data's Side Scenarios.
	const standaloneCatalog = standaloneScenarios();
	const standaloneName = new Map(standaloneCatalog.map((s) => [s.scenario, s.name]));
	const standaloneOptions = [
		{ value: '', label: '— pick a standalone —' },
		...standaloneCatalog.map((s) => ({ value: s.scenario, label: s.name }))
	];
	function resolutionOptionsFor(id: string) {
		const res = standaloneCatalog.find((s) => s.scenario === id)?.resolutions ?? [];
		return [
			{ value: '', label: '—' },
			...res.map((r) => ({ value: r, label: resolutionLabel(r) }))
		];
	}
	const standalones = $derived(standaloneDraftsFromLogs(localLogs));
	function writeStandalones(list: StandaloneEntry[]) {
		onLogsChange(replaceSection(localLogs, RESERVED.standalones, standalonesToEntries(list)));
	}
	function addStandalone() {
		writeStandalones([...standalones, { standalone: '' }]);
	}
	function removeStandalone(i: number) {
		writeStandalones(standalones.filter((_, j) => j !== i));
	}
	// Changing the standalone resets the resolution (it belongs to the old scenario).
	function setStandalone(i: number, value: string) {
		writeStandalones(standalones.map((e, j) => (j === i ? { standalone: value } : e)));
	}
	function setStandaloneResolution(i: number, value: string) {
		writeStandalones(
			standalones.map((e, j) => (j === i ? { ...e, resolution: value || undefined } : e))
		);
	}
	// A standalone's custom Extra control (e.g. Fortune and Folly's Completed Tasks),
	// stored on the standalone instance's own `choices` map. Counters clamp to bounds.
	function setStandaloneChoice(
		i: number,
		choiceId: string,
		raw: string,
		control: 'dropdown' | 'radio' | 'counter',
		min = 0,
		max = Number.POSITIVE_INFINITY
	) {
		let value = raw;
		if (control === 'counter') {
			const t = raw.trim();
			value = t === '' ? '' : String(Math.max(min, Math.min(max, Number(t) || 0)));
		}
		writeStandalones(
			standalones.map((e, j) => {
				if (j !== i) return e;
				const choices = { ...(e.choices ?? {}) };
				if (value) choices[choiceId] = value;
				else delete choices[choiceId];
				return { ...e, choices: Object.keys(choices).length ? choices : undefined };
			})
		);
	}
	function setStandaloneVictory(i: number, value: string) {
		const t = value.trim();
		const v = t === '' ? undefined : Number(t) || 0;
		writeStandalones(standalones.map((e, j) => (j === i ? { ...e, victoryDisplay: v } : e)));
	}

	// scenario id -> its first-choice resolutions (from campaign-data).
	const resolutionsByScenario = $derived(
		new Map((log.db.scenarioMeta ?? []).map((m) => [m.id, m.resolutions ?? []]))
	);

	// Victory display rides the historic `__xp` reserved section (key = scenario id).
	const vpByScenario = $derived.by(() => {
		const m = new Map<string, string>();
		for (const l of entriesInSection(localLogs, RESERVED.scenarioXp)) {
			m.set(l.key, l.args.find((a) => a.type === 'number')?.value ?? '');
		}
		return m;
	});
	const resolutionByScenario = $derived.by(() => {
		const m = new Map<string, string>();
		for (const l of entriesInSection(localLogs, RESERVED.scenarioResolution)) {
			m.set(l.key, l.args.find((a) => a.type === 'string')?.value ?? '');
		}
		return m;
	});
	const choiceByKey = $derived.by(() => {
		const m = new Map<string, string>();
		for (const l of entriesInSection(localLogs, RESERVED.scenarioChoice)) {
			m.set(l.key, l.args.find((a) => a.type === 'string')?.value ?? '');
		}
		return m;
	});

	// Prefer the real scenario title from campaign-data (e.g. "On Thin Ice"), which
	// is keyed by the location-style scenario id (e.g. "anchorage"). Fall back to a
	// title-cased id only when no name is published.
	// The 10 playable TSK scenarios (and other campaigns' scenarios) carry a kohaku
	// Scenario id, which resolves to a representative encounter-set icon.
	const KOHAKU_SCENARIOS = new Set<string>(Object.values(Scenario));
	function scenarioIconSet(id: string) {
		if (!KOHAKU_SCENARIOS.has(id)) return null;
		try {
			return getScenarioData(id as Scenario)?.representativeSet ?? null;
		} catch {
			return null;
		}
	}

	function scenarioName(id: string): string {
		const published = log.en.scenarioNames?.[id];
		if (published) return published;
		return id
			.replace(/^\d+[a-z]?_/, '')
			.replace(/_/g, ' ')
			.replace(/\b\w/g, (c) => c.toUpperCase());
	}
	function setVp(scenario: string, value: string) {
		const others = entriesInSection(localLogs, RESERVED.scenarioXp).filter(
			(l) => l.key !== scenario
		);
		const trimmed = value.trim();
		const next =
			trimmed === ''
				? others
				: [
						...others,
						makeEntry(RESERVED.scenarioXp, scenario, [
							{ type: 'number', value: String(Number(trimmed) || 0) }
						])
					];
		onLogsChange(replaceSection(localLogs, RESERVED.scenarioXp, next));
	}
	function setResolution(scenario: string, value: string) {
		const others = entriesInSection(localLogs, RESERVED.scenarioResolution).filter(
			(l) => l.key !== scenario
		);
		const next = value
			? [...others, makeEntry(RESERVED.scenarioResolution, scenario, [{ type: 'string', value }])]
			: others;
		onLogsChange(replaceSection(localLogs, RESERVED.scenarioResolution, next));
	}
	function setChoice(scenario: string, choiceId: string, value: string) {
		const key = `${scenario}.${choiceId}`;
		const others = entriesInSection(localLogs, RESERVED.scenarioChoice).filter(
			(l) => l.key !== key
		);
		const next = value
			? [...others, makeEntry(RESERVED.scenarioChoice, key, [{ type: 'string', value }])]
			: others;
		onLogsChange(replaceSection(localLogs, RESERVED.scenarioChoice, next));
	}
	function setChoiceCounter(
		scenario: string,
		choiceId: string,
		raw: string,
		min = 0,
		max = Number.POSITIVE_INFINITY
	) {
		const t = raw.trim();
		if (t === '') {
			setChoice(scenario, choiceId, '');
			return;
		}
		const n = Math.max(min, Math.min(max, Number(t) || 0));
		setChoice(scenario, choiceId, String(n));
	}
	/** Resolve a recorded choice value to its display label (radio/dropdown). */
	function choiceOptionLabel(ch: { options: { value: string; label: string }[] }, value: string) {
		return ch.options.find((o) => o.value === value)?.label ?? value;
	}

	// ── TSK-solver scenario tiers (level = time-scaling, version = variant) ──────
	const tierByKey = $derived.by(() => {
		const m = new Map<string, string>();
		for (const l of entriesInSection(localLogs, RESERVED.scenarioTier)) {
			m.set(l.key, l.args.find((a) => a.type === 'string')?.value ?? '');
		}
		return m;
	});
	function setTier(scenario: string, kind: 'level' | 'version', value: string) {
		const key = `${scenario}.${kind}`;
		const others = entriesInSection(localLogs, RESERVED.scenarioTier).filter((l) => l.key !== key);
		const next = value
			? [...others, makeEntry(RESERVED.scenarioTier, key, [{ type: 'string', value }])]
			: others;
		onLogsChange(replaceSection(localLogs, RESERVED.scenarioTier, next));
	}

	// ── Has-this-scenario-been-touched? ──────────────────────────────────────────
	// Each scenario's form starts EMPTY (dimmed). It lights up once any of its Extra
	// fields holds a value — and an empty form is meaningfully distinct from one that
	// records a 0 (e.g. a victory display of zero). The composite `__choice` / tier
	// keys are prefixed `"<scenario>."`; the rest are keyed by the scenario id alone.
	function scenarioHasData(s: string): boolean {
		if ((vpByScenario.get(s) ?? '') !== '') return true;
		if ((resolutionByScenario.get(s) ?? '') !== '') return true;
		if (skippedSet.has(s)) return true;
		const prefix = `${s}.`;
		for (const k of choiceByKey.keys()) if (k.startsWith(prefix)) return true;
		for (const k of tierByKey.keys()) if (k.startsWith(prefix)) return true;
		return false;
	}
	// Wipe every Extra field of a single scenario back to empty (≠ a form full of 0s),
	// across all the reserved sections it can ride in.
	function clearScenario(s: string) {
		const prefix = `${s}.`;
		let next = localLogs;
		next = replaceSection(
			next,
			RESERVED.scenarioXp,
			entriesInSection(next, RESERVED.scenarioXp).filter((l) => l.key !== s)
		);
		next = replaceSection(
			next,
			RESERVED.scenarioResolution,
			entriesInSection(next, RESERVED.scenarioResolution).filter((l) => l.key !== s)
		);
		next = replaceSection(
			next,
			RESERVED.scenarioSkipped,
			entriesInSection(next, RESERVED.scenarioSkipped).filter((l) => l.key !== s)
		);
		next = replaceSection(
			next,
			RESERVED.scenarioChoice,
			entriesInSection(next, RESERVED.scenarioChoice).filter((l) => !l.key.startsWith(prefix))
		);
		next = replaceSection(
			next,
			RESERVED.scenarioTier,
			entriesInSection(next, RESERVED.scenarioTier).filter((l) => !l.key.startsWith(prefix))
		);
		onLogsChange(next);
	}
</script>

<!-- Renders a choice label with Arkham icon glyphs (e.g. Dealings' Act 2 Setup, whose
     options are written as `[skull]` / `[cultist]` markup). Plain labels pass through. -->
{#snippet glyphLabel(text: string)}{@html parseArkhamMarkup(text)}{/snippet}

<div class="mt-4 max-w-xl space-y-2">
	<TskEditNote {log} tab="extra" />
	<div class="mb-2 flex items-start justify-between gap-2">
		<p class="text-primary-500 text-sm">
			Extra per-scenario data that will enrich certain widgets in the profile. These can't be known
			from the campaign log, but if you use ArkhamCards guided campaign, you can go into each
			scenario and see them.
		</p>
		<button
			type="button"
			onclick={() => (docOpen = true)}
			aria-label="About the Extra tab"
			title="About the Extra tab"
			class="text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200 shrink-0 cursor-pointer leading-none"
		>
			<FaIcon icon={FaIconType.NoticeInfo} />
		</button>
	</div>
	{#each scenarios as s (s)}
		{@const choices = choicesForScenario(log, s)}
		{@const resolutions = resolutionsByScenario.get(s) ?? []}
		{@const iconSet = scenarioIconSet(s)}
		{@const tiers = scenarioTiersByName(scenarioName(s))}
		{@const touched = scenarioHasData(s)}
		<div class="border-primary-100 dark:border-primary-800 rounded border p-3">
			<div class="mb-2 flex items-center justify-between gap-2">
				<!-- Only the name dims while the form is empty — dimming the inputs too would
				     make them read as disabled. -->
				<p
					class="flex items-center gap-2 font-medium text-black transition-opacity dark:text-white"
					class:opacity-40={!touched}
				>
					{#if iconSet}
						<span class="text-primary-700 dark:text-primary-300 text-xl leading-none">
							<EncounterSetIcon encounterSet={iconSet} />
						</span>
					{/if}
					{scenarioName(s)}
				</p>
				{#if canEdit && touched}
					<button
						type="button"
						class="text-primary-400 shrink-0 px-2 py-1 text-sm leading-none hover:text-red-500"
						title="Clear this scenario's Extra fields"
						aria-label="Clear this scenario's Extra fields"
						onclick={() => clearScenario(s)}
					>
						<FaIcon icon={FaIconType.Clear} />
					</button>
				{/if}
			</div>

			<!-- The two universal per-scenario extras, on one line. -->
			<div class="flex flex-wrap items-start gap-4">
				<div class="w-28 shrink-0">
					{#if canEdit}
						<TextInput
							label="Victory display"
							value={vpByScenario.get(s) ?? ''}
							placeholder="—"
							oninput={(v) => setVp(s, v)}
						/>
					{:else}
						<p class="text-primary-500 text-xs">Victory display</p>
						<p class="text-primary-700 dark:text-primary-300 tabular-nums">
							{vpByScenario.get(s) || '—'}
						</p>
					{/if}
				</div>
				{#if resolutions.length}
					<div class="min-w-0 flex-1">
						{#if canEdit}
							<Dropdown
								label="Resolution"
								value={resolutionByScenario.get(s) ?? ''}
								options={[
									{ value: '', label: '—' },
									...resolutions.map((r) => ({ value: r, label: resolutionLabel(r) }))
								]}
								onchange={(v) => setResolution(s, v)}
							/>
						{:else}
							<p class="text-primary-500 text-xs">Resolution</p>
							<p class="text-primary-700 dark:text-primary-300">
								{resolutionLabel(resolutionByScenario.get(s) ?? '') || '—'}
							</p>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Skipped flag (manual; e.g. EotE Ice and Death Part II / Part III). -->
			{#if SKIPPABLE.has(s)}
				<div class="mt-2">
					{#if canEdit}
						<Checkbox
							label="Skipped"
							checked={skippedSet.has(s)}
							onChange={() => setSkipped(s, !skippedSet.has(s))}
						/>
					{:else if skippedSet.has(s)}
						<span class="text-primary-500 text-xs">Skipped</span>
					{/if}
				</div>
			{/if}

			<!-- Campaign-specific named choices (e.g. PtC's Hastur version, TSK's Act 2
			     Setup radio / Sanguine Shadows targets counter), each its own field. -->
			{#each choices as ch (ch.id)}
				{@const recorded = choiceByKey.get(`${s}.${ch.id}`) ?? ''}
				<div class="mt-2 max-w-xs">
					{#if canEdit}
						{#if ch.control === 'counter'}
							<div class="w-28">
								<TextInput
									label={ch.label}
									value={recorded}
									placeholder="—"
									oninput={(v) => setChoiceCounter(s, ch.id, v, ch.min, ch.max)}
								/>
							</div>
						{:else if ch.control === 'radio'}
							<RadioButtons
								vertical
								label={ch.label}
								selectedValue={recorded}
								onChange={(v) => setChoice(s, ch.id, String(v))}
								choices={[{ value: '', label: '—' }, ...ch.options]}
								renderLabel={glyphLabel}
							/>
						{:else}
							<Dropdown
								label={ch.label}
								value={recorded}
								options={[{ value: '', label: '—' }, ...ch.options]}
								onchange={(v) => setChoice(s, ch.id, v)}
							/>
						{/if}
					{:else}
						<p class="text-primary-500 text-xs">{ch.label}</p>
						<p class="text-primary-700 dark:text-primary-300">
							{#if ch.control === 'counter'}{recorded || '—'}{:else}<!--
								-->{@html parseArkhamMarkup(
									choiceOptionLabel(ch, recorded) || '—'
								)}{/if}
						</p>
					{/if}
				</div>
			{/each}

			<!-- TSK-solver tiers the log can't reveal: the time-scaling "level" and the
			     scenario "version" played (e.g. On Thin Ice's doom-per-5-time tier). -->
			{#if tiers.levels.length || tiers.versions.length}
				<div class="flex flex-wrap gap-3">
					{#if tiers.levels.length}
						{@const lvl = tierByKey.get(`${s}.level`) ?? ''}
						<div class="min-w-0 flex-1">
							{#if canEdit}
								<Dropdown
									label="Level (time tier)"
									value={lvl}
									options={[
										{ value: '', label: '—' },
										...tiers.levels.map((o) => ({ value: o.id, label: o.label }))
									]}
									onchange={(v) => setTier(s, 'level', v)}
								/>
							{:else}
								<p class="text-primary-500 text-xs">Level (time tier)</p>
								<p class="text-primary-700 dark:text-primary-300">
									{lvl ? tierOptionLabel(scenarioName(s), lvl) : '—'}
								</p>
							{/if}
						</div>
					{/if}
					{#if tiers.versions.length && !isVersionLogInferable(s)}
						{@const ver = tierByKey.get(`${s}.version`) ?? ''}
						<div class="min-w-0 flex-1">
							{#if canEdit}
								<Dropdown
									label="Version"
									value={ver}
									options={[
										{ value: '', label: '—' },
										...tiers.versions.map((o) => ({ value: o.id, label: o.label }))
									]}
									onchange={(v) => setTier(s, 'version', v)}
								/>
							{:else}
								<p class="text-primary-500 text-xs">Version</p>
								<p class="text-primary-700 dark:text-primary-300">
									{ver ? tierOptionLabel(scenarioName(s), ver) : '—'}
								</p>
							{/if}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/each}

	<!-- Standalone scenarios played somewhere inside this campaign (ordered list). -->
	<div class="border-primary-200 dark:border-primary-700 mt-6 border-t pt-4">
		<p class="mb-1 font-medium text-black dark:text-white">Standalone scenarios played</p>
		<p class="text-primary-500 mb-3 text-sm">
			Side / standalone scenarios you played at some point during this campaign. We record what you
			played (in order), not where. Note each one's victory display and resolution like a regular
			scenario.
		</p>

		{#if standalones.length}
			<div class="space-y-2">
				{#each standalones as st, i (i)}
					<div
						class="border-primary-100 dark:border-primary-800 flex flex-col gap-3 rounded border p-2"
					>
						<div class="flex flex-wrap items-end gap-3">
							{#if canEdit}
								<div class="min-w-0 flex-1">
									<Dropdown
										label="Standalone"
										value={st.standalone}
										options={standaloneOptions}
										onchange={(v) => setStandalone(i, v)}
									/>
								</div>
								<div class="-mb-2 w-24 shrink-0">
									<TextInput
										label="Victory display"
										value={st.victoryDisplay != null ? String(st.victoryDisplay) : ''}
										placeholder="—"
										oninput={(v) => setStandaloneVictory(i, v)}
									/>
								</div>
								<div class="w-40 shrink-0">
									<Dropdown
										label="Resolution"
										value={st.resolution ?? ''}
										options={resolutionOptionsFor(st.standalone)}
										onchange={(v) => setStandaloneResolution(i, v)}
									/>
								</div>
								<button
									type="button"
									class="text-primary-400 shrink-0 px-2 py-1.5 text-sm hover:text-red-500"
									title="Remove standalone"
									aria-label="Remove standalone"
									onclick={() => removeStandalone(i)}
								>
									✕
								</button>
							{:else}
								<div class="min-w-0 flex-1">
									<p class="font-medium text-black dark:text-white">
										{(standaloneName.get(st.standalone) ?? st.standalone) || '—'}
									</p>
									<p class="text-primary-500 text-xs">
										{st.victoryDisplay != null ? `VP ${st.victoryDisplay}` : 'no VP recorded'} ·
										{st.resolution ? resolutionLabel(st.resolution) : 'no resolution'}
									</p>
								</div>
							{/if}
						</div>

						<!-- Standalone-specific Extra controls (e.g. Fortune and Folly's
						     Completed Tasks counter), declared in the 'side' catalogue. -->
						{#if st.standalone}
							{@const stChoices = choicesForStandalone(st.standalone)}
							{#each stChoices as ch (ch.id)}
								{@const recorded = st.choices?.[ch.id] ?? ''}
								<div class="max-w-xs">
									{#if canEdit}
										{#if ch.control === 'counter'}
											<div class="w-28">
												<TextInput
													label={ch.label}
													value={recorded}
													placeholder="—"
													oninput={(v) =>
														setStandaloneChoice(i, ch.id, v, 'counter', ch.min, ch.max)}
												/>
											</div>
										{:else if ch.control === 'radio'}
											<RadioButtons
												vertical
												label={ch.label}
												selectedValue={recorded}
												onChange={(v) => setStandaloneChoice(i, ch.id, String(v), 'radio')}
												choices={[{ value: '', label: '—' }, ...ch.options]}
											/>
										{:else}
											<Dropdown
												label={ch.label}
												value={recorded}
												options={[{ value: '', label: '—' }, ...ch.options]}
												onchange={(v) => setStandaloneChoice(i, ch.id, v, 'dropdown')}
											/>
										{/if}
									{:else}
										<p class="text-primary-500 text-xs">{ch.label}</p>
										<p class="text-primary-700 dark:text-primary-300">
											{ch.control === 'counter'
												? recorded || '—'
												: choiceOptionLabel(ch, recorded) || '—'}
										</p>
									{/if}
								</div>
							{/each}
						{/if}

						{#if st.standalone && canEdit}
							<p
								class="text-primary-400 border-primary-100 dark:border-primary-800 border-t pt-2 text-xs italic"
							>
								Add this standalone's log entries in the Logs tab — they now appear in the Campaign
								Notes dropdown, recorded in play order.
							</p>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-primary-400 text-sm">No standalones recorded.</p>
		{/if}

		{#if canEdit}
			<button
				type="button"
				class="text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 mt-3 text-sm font-medium"
				onclick={addStandalone}
			>
				+ Add standalone
			</button>
		{/if}
	</div>
</div>

<Modal isOpen={docOpen} onClose={() => (docOpen = false)} title="The Extra tab" maxWidth="lg">
	<div class="py-2">
		<Doc path="archive/extra" />
	</div>
</Modal>
