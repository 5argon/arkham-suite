<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Button, MarginFull, MarginText, PageLead, SectionSeparator, TextParagraph } from '@5argon/arkham-life-ui';
	import { resolveLocalized, solve, type Constraint, type Recipe, type SolveOutput } from '@5argon/arkham-tsk-solver';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import ConstraintForm from './ConstraintForm.svelte';
	import RecipeDetail from './RecipeDetail.svelte';
	import ScenarioIcons from './ScenarioIcons.svelte';
	import { DEFAULT_PREFS, rowFromConstraint, toConstraint, type RowModel, type UiPreferences } from './helpers';
	import { decodeState, encodeState, type SolverShareState } from './codec';

	let revealed = $state(false);
	let rows = $state<RowModel[]>([]);
	let preferences = $state<UiPreferences>({ ...DEFAULT_PREFS });
	let result = $state<SolveOutput | null>(null);
	let solving = $state(false);
	let selectedIndex = $state<number | null>(null);
	let pending: string | null = null;
	let lastWritten: string | null = null;

	const constraints = $derived<Constraint[]>(rows.map(toConstraint).filter((c): c is Constraint => c !== null));
	const locale = $derived(preferences.locale ?? 'en');
	const recipes = $derived<Recipe[]>(result && result.ok ? result.recipes : []);
	const selectedRecipe = $derived<Recipe | undefined>(
		selectedIndex !== null ? recipes[selectedIndex] : undefined,
	);

	// Results grouped by scenario count, ascending — players browse by how many scenarios to play.
	const groups = $derived.by(() => {
		const m = new Map<number, { recipe: Recipe; index: number }[]>();
		recipes.forEach((recipe, index) => {
			const list = m.get(recipe.scenarioCount) ?? [];
			list.push({ recipe, index });
			m.set(recipe.scenarioCount, list);
		});
		return [...m.entries()].sort((a, b) => a[0] - b[0]);
	});

	afterNavigate(() => {
		const params = new URLSearchParams(page.url.search);
		const encoded = params.get('r') ?? params.get('c');
		if (encoded === lastWritten) return;
		if (!revealed) {
			pending = encoded;
			return;
		}
		applyEncoded(encoded);
	});

	function applyEncoded(encoded: string | null) {
		if (!encoded) {
			selectedIndex = null;
			return;
		}
		const state = decodeState(encoded);
		if (!state) return;
		lastWritten = encoded;
		applyShared(state);
		runSolve(false);
		selectedIndex = typeof state.index === 'number' ? state.index : null;
	}

	function applyShared(state: SolverShareState) {
		rows = (state.constraints ?? []).map((c) => rowFromConstraint(c));
		preferences = { ...DEFAULT_PREFS, ...(state.preferences ?? {}) };
	}

	function reveal() {
		revealed = true;
		const enc = pending;
		pending = null;
		if (enc) applyEncoded(enc);
	}

	function inputState(extra?: Partial<SolverShareState>): SolverShareState {
		return { constraints, preferences, ...extra };
	}
	function updateUrl(encoded: string, param: 'c' | 'r', replace: boolean) {
		lastWritten = encoded;
		goto(resolve(`/tool/tsk?${param}=${encoded}`, {}), { replaceState: replace, keepFocus: true, noScroll: true });
	}

	function runSolve(updateURL = true) {
		solving = true;
		selectedIndex = null;
		setTimeout(() => {
			result = solve({ constraints, preferences });
			solving = false;
			if (updateURL) updateUrl(encodeState(inputState()), 'c', true);
		}, 0);
	}

	function openRecipe(index: number) {
		selectedIndex = index;
		updateUrl(encodeState(inputState({ index })), 'r', false);
	}
	function backToResults() {
		selectedIndex = null;
		updateUrl(encodeState(inputState()), 'c', false);
	}

	const shareUrl = $derived(
		selectedIndex !== null
			? `https://arkham-starter.com/tool/tsk?r=${encodeState(inputState({ index: selectedIndex }))}`
			: `https://arkham-starter.com/tool/tsk?c=${encodeState(inputState())}`,
	);
</script>

<OpenGraph
	description="Plan The Scarlet Keys campaign backwards from your goals — a spoiler-heavy route solver."
	image="image/resource/tskdoc.webp"
	title="The Scarlet Keys : Route Solver"
	url="/tool/tsk"
/>

{#if !revealed}
	<MarginText>
		<div class="mx-auto mt-10 max-w-2xl rounded-lg border-2 border-survivor-400 dark:border-survivor-700 p-8 text-center">
			<div class="font-heading text-3xl text-survivor-700 dark:text-survivor-300 mb-4">⚠ Heavy Spoiler Warning</div>
			<TextParagraph>
				The TSK Route Solver is the <b>inverse</b> of how <i>The Scarlet Keys</i> is meant to be played. The
				campaign is a non-linear, discovery-driven globe-trot; this tool plans it <b>backwards</b> from the
				outcomes you want.
			</TextParagraph>
			<TextParagraph>
				Simply <b>choosing constraints</b> — which scenarios, resolutions, keys, allies, or ending — reveals the
				campaign's structure and many of its surprises. This is for <b>replays</b>, achievement runs, and custom
				"gauntlet" planning. Please play the campaign normally at least once first.
			</TextParagraph>
			<div class="mt-6">
				<Button label="I understand — reveal the solver" onClick={reveal} highlighted />
			</div>
		</div>
	</MarginText>
{:else}
	<MarginFull>
		<PageLead title="The Scarlet Keys : Route Solver" description="Specify constraints; browse distinct, playable routes grouped by how many scenarios you want to play — or a proof they can't all be satisfied." />
	</MarginFull>

	<MarginText>
		{#if selectedRecipe}
			<RecipeDetail recipe={selectedRecipe} {locale} {shareUrl} onBack={backToResults} />
		{:else}
			<ConstraintForm bind:rows bind:preferences {solving} onSolve={() => runSolve(true)} />

			{#if result}
				<SectionSeparator title="Results" />
				{#if result.ok}
					<p class="mb-4 text-sm text-primary-500 dark:text-primary-400">
						{result.recipes.length} distinct route{result.recipes.length === 1 ? '' : 's'} across {groups.length} scenario-count
						group{groups.length === 1 ? '' : 's'}. Click a route for the full plan and a shareable link.
					</p>
					{#each groups as [count, items] (count)}
						<div class="mb-6">
							<h3 class="font-heading text-lg text-primary-900 dark:text-primary-100 mb-2">
								Play {count} scenario{count === 1 ? '' : 's'} <span class="text-sm text-primary-400">({items.length})</span>
							</h3>
							<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
								{#each items as { recipe, index } (index)}
									<button
										class="rounded-lg border border-primary-200 dark:border-primary-800 p-4 text-left transition hover:border-secondary-500 hover:shadow-md"
										onclick={() => openRecipe(index)}
									>
										<div class="mb-2"><ScenarioIcons scenarios={recipe.playedScenarios} /></div>
										<div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-primary-600 dark:text-primary-300">
											<span class="rounded bg-primary-100 px-2 py-0.5 dark:bg-primary-900">{recipe.totalTime} time</span>
											<span>{recipe.keysHeld.length} keys</span>
											{#if recipe.bonusXp > 0}<span class="text-rogue-600 dark:text-rogue-400">+{recipe.bonusXp} XP</span>{/if}
											<span>Trust {recipe.trust} / Decep {recipe.deception}</span>
											{#if recipe.earnableAchievements.length}<span>{recipe.earnableAchievements.length} achievements</span>{/if}
										</div>
										{#if recipe.freebies.length}
											<div class="mt-1 text-xs text-rogue-600 dark:text-rogue-400">★ {recipe.freebies.map((f) => resolveLocalized(f, locale)).join(' · ')}</div>
										{/if}
										<div class="mt-2 text-xs text-secondary-600 dark:text-secondary-400">View full route →</div>
									</button>
								{/each}
							</div>
						</div>
					{/each}
				{:else}
					<div class="rounded-lg border-2 border-survivor-400 dark:border-survivor-700 p-5">
						<div class="font-heading text-xl text-survivor-700 dark:text-survivor-300 mb-2">No route satisfies these constraints</div>
						<p class="text-primary-800 dark:text-primary-200">{resolveLocalized(result.proof.message, locale)}</p>
						<p class="mt-1 text-sm text-primary-500">Conflict: {result.proof.conflict}</p>
						{#if result.proof.breakdown.length}
							<table class="mt-3 text-sm">
								<tbody>
									{#each result.proof.breakdown as b (b.label)}
										<tr><td class="pr-4 text-primary-500">{b.label}</td><td class="text-primary-900 dark:text-primary-100">{b.value}</td></tr>
									{/each}
									<tr class="border-t border-primary-300"><td class="pr-4 font-semibold">floor</td><td class="font-semibold">{result.proof.floor}</td></tr>
									<tr><td class="pr-4 font-semibold">cap</td><td class="font-semibold">{result.proof.cap}</td></tr>
								</tbody>
							</table>
						{/if}
					</div>
				{/if}
			{/if}
		{/if}
	</MarginText>
{/if}
