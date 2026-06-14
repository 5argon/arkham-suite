<script lang="ts">
	import { Button, Checkbox, Dropdown, type Option } from '@5argon/arkham-life-ui';
	import { catalog, type Difficulty, type Locale } from '@5argon/arkham-tsk-solver';
	import { CATEGORY_LABELS, newRow, TARGETLESS, type CategoryId, type RowModel, type UiPreferences } from './helpers';

	interface Props {
		rows: RowModel[];
		preferences: UiPreferences;
		solving: boolean;
		onSolve: () => void;
	}
	let { rows = $bindable(), preferences = $bindable(), solving, onSolve }: Props = $props();

	const cat = catalog();

	function entriesFor(category: CategoryId) {
		switch (category) {
			case 'achievement':
				return cat.achievements;
			case 'get_key':
				return cat.keys;
			case 'visit_scenario':
			case 'scenario_resolution':
				return cat.scenarios;
			case 'scenario_version':
				return cat.versionedScenarios;
			case 'narrative_chain':
				return cat.narrativeChains;
			case 'recruit_ally':
				return cat.allies;
			case 'side_story':
				return cat.sideStories;
			case 'visit_node':
				return cat.nodes;
			default:
				return [];
		}
	}
	const trialOptions: Option<string>[] = cat.trials.map((t) => ({ value: t.id, label: `${t.label}${t.note ? ` (${t.note})` : ''}` }));
	const tokenOptions: Option<number>[] = [0, 1, 2, 3, 4].map((n) => ({ value: n, label: `${n}` }));
	const overflowOptions: Option<number>[] = [1, 2, 3, 4, 5].map((n) => ({ value: n, label: `${n}` }));
	const targetOptions = (category: CategoryId): Option<string>[] =>
		entriesFor(category).map((e) => ({ value: e.id, label: e.label }));
	const resolutionOptions = (scenario: string): Option<string>[] =>
		(cat.resolutions[scenario] ?? []).map((r) => ({
			value: r.id,
			label: r.note ? `${r.id} — ${r.note.slice(0, 60)}` : r.id,
		}));
	const versionOptions = (scenario: string): Option<string>[] =>
		(cat.versions[scenario] ?? []).map((v) => ({
			value: v.id,
			// Prefix the version number (v1/v2/…) so it's always visible alongside the description.
			label: v.label && !v.label.toLowerCase().startsWith(v.id) ? `${v.id} — ${v.label}` : v.label || v.id,
		}));
	const noteFor = (r: RowModel): string | undefined => {
		if (r.category === 'side_story') return cat.sideStories.find((s) => s.label && s.id === r.target)?.note;
		if (r.category === 'scenario_resolution') return cat.resolutions[r.target]?.find((x) => x.id === r.resolution)?.note;
		return entriesFor(r.category).find((e) => e.id === r.target)?.note;
	};

	function onCategoryChange(i: number) {
		const r = rows[i]!;
		r.target = entriesFor(r.category)[0]?.id ?? '';
		r.resolution = cat.resolutions[r.target]?.[0]?.id ?? 'R1';
		r.version = cat.versions[r.target]?.[0]?.id ?? 'v1';
		r.bearer = false;
		rows = rows;
	}
	function onTargetChange(i: number) {
		const r = rows[i]!;
		r.resolution = cat.resolutions[r.target]?.[0]?.id ?? 'R1';
		r.version = cat.versions[r.target]?.[0]?.id ?? 'v1';
		rows = rows;
	}
	function addRow() {
		const r = newRow('achievement', cat.achievements[0]?.id ?? '');
		rows = [...rows, r];
	}
	function removeRow(i: number) {
		rows = rows.filter((_, idx) => idx !== i);
	}
	function clearAll() {
		rows = [];
	}

	const maxPerCountOptions: Option<number>[] = [3, 4, 5, 6, 8, 10].map((n) => ({ value: n, label: `${n}` }));
	const takeBackOptions: Option<number>[] = [
		{ value: 0, label: 'Warn only' },
		{ value: 1, label: '1 site' },
		{ value: 2, label: '2 sites' },
		{ value: 3, label: '3 sites' },
		{ value: 4, label: '4 sites' },
	];
	const scenarioCapOptions: Option<number>[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => ({
		value: n,
		label: n === 0 ? 'No limit' : `${n}`,
	}));
	const difficultyOptions: Option<Difficulty>[] = (['easy', 'standard', 'hard', 'expert'] as Difficulty[]).map((d) => ({
		value: d,
		label: d[0]!.toUpperCase() + d.slice(1),
	}));
	const localeOptions: Option<Locale>[] = (['en', 'fr', 'es', 'it'] as Locale[]).map((l) => ({ value: l, label: l.toUpperCase() }));

	let scenarioCap = $state<number>(preferences.maxScenarios ?? 0);
	function syncScenarioCap() {
		preferences.maxScenarios = scenarioCap === 0 ? undefined : scenarioCap;
	}
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center justify-between">
		<h3 class="font-heading text-lg text-primary-900 dark:text-primary-100">
			Constraints {rows.length ? `(${rows.length})` : ''}
		</h3>
		<div class="flex gap-2">
			{#if rows.length}<Button label="Clear all" onClick={clearAll} danger />{/if}
			<Button label="+ Add constraint" onClick={addRow} highlighted />
		</div>
	</div>

	{#if rows.length === 0}
		<p class="text-sm italic text-primary-500 dark:text-primary-400">
			No constraints — solving now finds diverse winning routes to browse. Add a constraint to narrow
			the search; tick <b>NOT</b> on any row to forbid it (you can still travel through a forbidden node, just not stop there).
		</p>
	{/if}

	{#each rows as row, i (i)}
		<div
			class="flex flex-wrap items-end gap-2 rounded-md border p-3 {row.negate
				? 'border-survivor-300 bg-survivor-50 dark:bg-survivor-950/30 dark:border-survivor-800'
				: 'border-primary-200 dark:border-primary-800'}"
		>
			<span class="self-center w-5 text-center text-sm text-primary-400">{i + 1}</span>
			<div class="min-w-48">
				<Dropdown bind:value={row.category} label="Type" options={CATEGORY_LABELS} onchange={() => onCategoryChange(i)} />
			</div>
			{#if !TARGETLESS.includes(row.category)}
				<div class="min-w-56 grow">
					<Dropdown bind:value={row.target} label="Target" options={targetOptions(row.category)} onchange={() => onTargetChange(i)} />
				</div>
			{/if}
			{#if row.category === 'scenario_resolution'}
				<div class="min-w-64">
					<Dropdown bind:value={row.resolution} label="Resolution" options={resolutionOptions(row.target)} />
				</div>
			{/if}
			{#if row.category === 'scenario_version'}
				<div class="min-w-64">
					<Dropdown bind:value={row.version} label="Version" options={versionOptions(row.target)} />
				</div>
			{/if}
			{#if row.category === 'reach_ending'}
				<div class="min-w-72 grow"><Dropdown bind:value={row.trial} label="Trial outcome" options={trialOptions} /></div>
			{/if}
			{#if row.category === 'chaos_mix'}
				<div class="w-32"><Dropdown bind:value={row.tablet} label="Tablet" options={tokenOptions} /></div>
				<div class="w-32"><Dropdown bind:value={row.elderThing} label="Elder Thing" options={tokenOptions} /></div>
			{/if}
			{#if row.category === 'chaos_overflow_xp'}
				<div class="w-28"><Dropdown bind:value={row.overflowMin} label="Min XP" options={overflowOptions} /></div>
			{/if}
			<div class="flex items-center gap-3 self-center pb-1">
				{#if row.category === 'get_key'}
					<Checkbox bind:checked={row.bearer} label="Held by you" />
				{/if}
				{#if !TARGETLESS.includes(row.category)}<Checkbox bind:checked={row.negate} label="NOT" />{/if}
				<button class="px-2 text-survivor-600 hover:text-survivor-800" onclick={() => removeRow(i)} aria-label="Remove constraint">✕</button>
			</div>
			{#if noteFor(row)}
				<p class="w-full text-xs italic text-primary-500 dark:text-primary-400">{noteFor(row)}</p>
			{/if}
		</div>
	{/each}

	<!-- Preferences -->
	<div class="rounded-md border border-primary-200 dark:border-primary-800 p-4">
		<h3 class="font-heading text-lg text-primary-900 dark:text-primary-100 mb-3">Preferences</h3>
		<div class="flex flex-wrap items-end gap-4">
			<div class="w-40"><Dropdown bind:value={preferences.maxPerScenarioCount} label="Routes per group" options={maxPerCountOptions} /></div>
			<div class="w-32"><Dropdown bind:value={scenarioCap} label="Scenario cap" options={scenarioCapOptions} onchange={syncScenarioCap} /></div>
			<div class="w-40"><Dropdown bind:value={preferences.keyTakeBackSites} label="Key take-back" options={takeBackOptions} /></div>
			<div class="w-44"><Dropdown bind:value={preferences.difficulty} label="Difficulty" options={difficultyOptions} /></div>
			<div class="w-24"><Dropdown bind:value={preferences.locale} label="Language" options={localeOptions} /></div>
			<div class="flex items-center gap-4 pb-1">
				<Checkbox bind:checked={preferences.respectOrder} label="Respect order" />
				<Checkbox bind:checked={preferences.allowExpeditedTicket} label="Allow ticket" />
			</div>
		</div>
	</div>

	<div class="flex justify-center">
		<Button label={solving ? 'Solving…' : 'Solve routes'} onClick={onSolve} highlighted disabled={solving} />
	</div>
</div>
