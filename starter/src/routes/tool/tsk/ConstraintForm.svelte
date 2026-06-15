<script lang="ts">
	import { Button, Checkbox, Dropdown, type Option } from '@5argon/arkham-life-ui';
	import { catalog } from '@5argon/arkham-tsk-solver';
	import { CATEGORY_LABELS, newRow, TARGETLESS, type CategoryId, type RowModel } from './helpers';

	interface Props {
		rows: RowModel[];
	}
	let { rows = $bindable() }: Props = $props();

	const cat = catalog();

	function entriesFor(category: CategoryId) {
		switch (category) {
			case 'achievement':
				return cat.achievements;
			case 'get_key':
				return cat.keys;
			case 'visit_file':
			case 'resolution':
				return cat.files;
			case 'scenario_version':
				return cat.versionedFiles;
			case 'scenario_level':
				return cat.levelFiles;
			case 'campaign_log':
				return cat.campaignLogs;
			case 'side_story':
				return cat.sideStories;
			default:
				return [];
		}
	}
	const judgmentOptions: Option<string>[] = cat.judgments.map((j) => ({ value: j.id, label: j.label }));
	const epilogueOptions: Option<string>[] = cat.epilogues.map((e) => ({ value: e.id, label: e.label }));
	const tokenOptions: Option<number>[] = [0, 1, 2, 3, 4].map((n) => ({ value: n, label: `${n}` }));
	const targetOptions = (category: CategoryId): Option<string>[] => entriesFor(category).map((e) => ({ value: e.id, label: e.label }));
	const optionOptions = (table: Record<string, { id: string; label: string }[]>, fileCode: string): Option<string>[] => (table[fileCode] ?? []).map((o) => ({ value: o.id, label: o.label }));
	const logGroupOptions: Option<string>[] = [{ value: 'all', label: 'All logs' }, ...cat.campaignLogGroups.map((g) => ({ value: g.id, label: g.label }))];
	const campaignLogOptions = (group: string): Option<string>[] => cat.campaignLogs.filter((e) => group === 'all' || (e.groups ?? []).includes(group)).map((e) => ({ value: e.id, label: e.label }));
	const noteFor = (r: RowModel): string | undefined => entriesFor(r.category).find((e) => e.id === r.target)?.note;

	function firstOption(category: CategoryId, fileCode: string): string {
		const table = category === 'resolution' ? cat.resolutions : category === 'scenario_version' ? cat.versions : category === 'scenario_level' ? cat.levels : undefined;
		return table?.[fileCode]?.[0]?.id ?? '';
	}
	function onCategoryChange(i: number) {
		const r = rows[i]!;
		r.logGroup = 'all';
		r.target = entriesFor(r.category)[0]?.id ?? '';
		r.optionId = firstOption(r.category, r.target);
		r.bearer = false;
		rows = rows;
	}
	function onLogGroupChange(i: number) {
		const r = rows[i]!;
		r.target = campaignLogOptions(r.logGroup)[0]?.value ?? '';
		rows = rows;
	}
	function onTargetChange(i: number) {
		const r = rows[i]!;
		r.optionId = firstOption(r.category, r.target);
		rows = rows;
	}
	function addRow() {
		rows = [...rows, newRow('visit_file', cat.files[0]?.id ?? '')];
	}
	function removeRow(i: number) {
		rows = rows.filter((_, idx) => idx !== i);
	}
	function clearAll() {
		rows = [];
	}
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center justify-between">
		<h3 class="font-heading text-lg text-primary-900 dark:text-primary-100">Goals {rows.length ? `(${rows.length})` : ''}</h3>
		<div class="flex gap-2">
			{#if rows.length}<Button label="Clear all" onClick={clearAll} danger />{/if}
			<Button label="+ Add goal" onClick={addRow} highlighted />
		</div>
	</div>

	<p class="text-sm italic text-primary-500 dark:text-primary-400">
		Goals are an optional checklist — the planner tells you which ones your handcrafted plan meets. Tick
		<b>NOT</b> on a row to make it a goal you want to <i>avoid</i>.
	</p>

	{#each rows as row, i (i)}
		<div class="flex flex-wrap items-end gap-2 rounded-md border p-3 {row.negate ? 'border-survivor-300 bg-survivor-50 dark:bg-survivor-950/30 dark:border-survivor-800' : 'border-primary-200 dark:border-primary-800'}">
			<span class="self-center w-5 text-center text-sm text-primary-400">{i + 1}</span>
			<div class="min-w-48">
				<Dropdown bind:value={row.category} label="Type" options={CATEGORY_LABELS} onchange={() => onCategoryChange(i)} />
			</div>
			{#if row.category === 'campaign_log'}
				<div class="min-w-44"><Dropdown bind:value={row.logGroup} label="Log group" options={logGroupOptions} onchange={() => onLogGroupChange(i)} /></div>
				<div class="min-w-56 grow"><Dropdown bind:value={row.target} label="Campaign log" options={campaignLogOptions(row.logGroup)} onchange={() => onTargetChange(i)} /></div>
			{:else if !TARGETLESS.includes(row.category)}
				<div class="min-w-56 grow"><Dropdown bind:value={row.target} label="Target" options={targetOptions(row.category)} onchange={() => onTargetChange(i)} /></div>
			{/if}
			{#if row.category === 'resolution'}
				<div class="min-w-64"><Dropdown bind:value={row.optionId} label="Resolution" options={optionOptions(cat.resolutions, row.target)} /></div>
			{/if}
			{#if row.category === 'scenario_version'}
				<div class="min-w-64"><Dropdown bind:value={row.optionId} label="Version" options={optionOptions(cat.versions, row.target)} /></div>
			{/if}
			{#if row.category === 'scenario_level'}
				<div class="min-w-72 grow"><Dropdown bind:value={row.optionId} label="Time tier" options={optionOptions(cat.levels, row.target)} /></div>
			{/if}
			{#if row.category === 'reach_judgment'}
				<div class="min-w-72 grow"><Dropdown bind:value={row.judgment} label="Coterie judgment" options={judgmentOptions} /></div>
			{/if}
			{#if row.category === 'epilogue'}
				<div class="min-w-72 grow"><Dropdown bind:value={row.epilogue} label="Epilogue" options={epilogueOptions} /></div>
			{/if}
			{#if row.category === 'chaos_mix'}
				<div class="w-32"><Dropdown bind:value={row.tablet} label="Tablet" options={tokenOptions} /></div>
				<div class="w-32"><Dropdown bind:value={row.elderThing} label="Elder Thing" options={tokenOptions} /></div>
			{/if}
			<div class="flex items-center gap-3 self-center pb-1">
				{#if row.category === 'get_key'}<Checkbox bind:checked={row.bearer} label="Held by you" />{/if}
				{#if !TARGETLESS.includes(row.category)}<Checkbox bind:checked={row.negate} label="NOT" />{/if}
				<button class="px-2 text-survivor-600 hover:text-survivor-800" onclick={() => removeRow(i)} aria-label="Remove goal">✕</button>
			</div>
			{#if noteFor(row)}<p class="w-full text-xs italic text-primary-500 dark:text-primary-400">{noteFor(row)}</p>{/if}
		</div>
	{/each}
</div>
