<!--
@component
One achievement row in the recording UI. Inferred achievements (def.infer /
def.itemInfer) are auto-evaluated from the recorded logs and shown checked +
disabled (a cog marks them auto). Manual achievements get a real checkbox bound
to the player's ticks; when ticked, a missing `requires` prerequisite surfaces
an inline warning. `list` achievements render per-item rows (inferred items auto,
manual items ticked).
-->
<script lang="ts">
	import type { AchievementProgress, ResolvedAchievement } from '@5argon/arkham-campaign-data';
	import {
		Checkbox,
		FaIcon,
		FaIconType,
		HoverTooltip,
		Modal,
		parseArkhamMarkup
	} from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		resolved: ResolvedAchievement;
		progress: AchievementProgress;
		/** How it's auto-derived: 'log' (gears), 'extra' (gear-code, needs the Extra tabs), 'manual' (pencil). */
		scope: 'log' | 'extra' | 'manual';
		/** Human-readable conditions it auto-checks (for the gear modal); empty for manual / unexpressible. */
		conditions: string[];
		/** True in life (show checkboxes); false = read-only display. */
		recordable: boolean;
		/** Manual tick keys present for this achievement (def.id, and def.id::itemId). */
		manual: Set<string>;
		prereq: 'ok' | 'warn' | 'unknown';
		onToggle: (itemId: string | undefined, earned: boolean) => void;
	}

	let { resolved, progress, scope, conditions, recordable, manual, prereq, onToggle }: Props =
		$props();

	const def = $derived(resolved.def);
	// 'log' and 'extra' both auto-check in arkham.life (it holds the Extra inputs); only 'manual' is hand-ticked.
	const inferred = $derived(scope !== 'manual');
	const isList = $derived(def.type === 'list' && Array.isArray(def.items));
	const statusIcon = $derived(
		scope === 'extra'
			? FaIconType.AchievementInferredExtra
			: scope === 'log'
				? FaIconType.AchievementInferred
				: FaIconType.AchievementManual
	);
	let conditionsOpen = $state(false);

	const listItems = $derived.by(() => {
		if (!isList || !def.items) return [];
		const labels = resolved.en.items ?? {};
		return def.items.map((id) => ({ id, label: labels[id] ?? id }));
	});

	function key(itemId?: string) {
		return itemId ? `${def.id}::${itemId}` : def.id;
	}
	/** Auto-derived earned (log or extra scope), when the data is present. */
	const autoEarned = $derived(inferred && progress.earned === true);
	/** Whole-achievement earned. `extra` achievements ALSO honor a manual tick — a pen-and-paper
	 *  player who never fills the Extra tab can still mark them Earned by hand. */
	const earned = $derived(scope === 'log' ? autoEarned : autoEarned || manual.has(def.id));

	// Hover tooltip for the inferred-vs-manual indicator icon (styled, like the rest
	// of the app) instead of the browser-native `title` popup.
	const tipText = $derived(
		scope === 'extra' ? m.archive_ach_tip_extra() : scope === 'log' ? m.archive_ach_tip_log() : m.archive_ach_tip_manual(),
	);
	let tipVisible = $state(false);
	let tipRef = $state<HTMLElement | null>(null);

	// Strip HTML emphasis + unwrap card links, but KEEP `[token]` icon markers — they're
	// rendered as glyphs by parseArkhamMarkup (e.g. Trust Nobody's [elder_thing]).
	function clean(text: string): string {
		return text
			.replace(/<\/?[ib]>/g, '')
			.replace(/\[\[([^\]]+)\]\]/g, '$1')
			.replace(/\s+/g, ' ')
			.trim();
	}
</script>

<li class="flex gap-3">
	<span class="text-secondary-500 dark:text-secondary-400 mt-0.5">
		<FaIcon icon={FaIconType.Achievement} />
	</span>
	<div class="min-w-0 flex-1">
		<div
			class="text-secondary-900 dark:text-secondary-100 flex items-center gap-2 font-bold"
			class:opacity-60={!earned}
		>
			{resolved.en.title}
			{#if inferred}
				<button
					type="button"
					class="text-primary-400 hover:text-secondary-500 cursor-pointer"
					aria-label={tipText}
					bind:this={tipRef}
					onmouseenter={() => (tipVisible = true)}
					onmouseleave={() => (tipVisible = false)}
					onclick={() => (conditionsOpen = true)}
				>
					<FaIcon icon={statusIcon} />
				</button>
			{:else}
				<span
					class="text-primary-400"
					role="img"
					aria-label={tipText}
					bind:this={tipRef}
					onmouseenter={() => (tipVisible = true)}
					onmouseleave={() => (tipVisible = false)}
				>
					<FaIcon icon={statusIcon} />
				</span>
			{/if}
		</div>
		<div class="text-primary-700 dark:text-primary-300 text-sm">
			{@html parseArkhamMarkup(clean(resolved.en.text))}
		</div>

		{#if isList}
			<ul class="mt-1.5 space-y-1">
				{#each listItems as it (it.id)}
					{@const itemInferred = Boolean(def.itemInfer?.[it.id])}
					{@const itemEarned = itemInferred
						? progress.items?.[it.id] === true
						: manual.has(key(it.id))}
					<li class="flex items-center gap-2 text-sm">
						{#if recordable && !itemInferred}
							<Checkbox
								label={it.label}
								checked={manual.has(key(it.id))}
								onChange={() => onToggle(it.id, !manual.has(key(it.id)))}
							/>
						{:else}
							<span
								class={itemEarned ? 'text-secondary-500' : 'text-primary-300 dark:text-primary-600'}
							>
								<FaIcon icon={FaIconType.CheckBox} />
							</span>
							<span class="text-primary-700 dark:text-primary-300" class:opacity-50={!itemEarned}
								>{it.label}</span
							>
						{/if}
					</li>
				{/each}
			</ul>
		{:else if recordable}
			<div class="mt-1.5">
				{#if autoEarned}
					<!-- Data is present (logs and, for `extra`, the Extra tab) → checked for you. -->
					<span class="text-secondary-600 inline-flex items-center gap-1.5 text-xs">
						<FaIcon icon={FaIconType.CheckBox} />
						{m.archive_ach_earned_auto()}
					</span>
				{:else if scope === 'log'}
					<span class="text-primary-500 inline-flex items-center gap-1.5 text-xs">
						<FaIcon icon={FaIconType.CheckBox} />
						{m.archive_ach_not_earned()}
					</span>
				{:else}
					<!-- `extra` (data not entered) and `manual`: a hand tick. Lets pen-and-paper players,
					     who never fill the Extra tab, still mark it Earned. -->
					<Checkbox
						label={m.archive_ach_earned()}
						checked={manual.has(def.id)}
						onChange={() => onToggle(undefined, !manual.has(def.id))}
					/>
					{#if scope === 'extra'}
						<p class="text-primary-400 mt-1 text-xs">{m.archive_ach_extra_hint()}</p>
					{/if}
					{#if manual.has(def.id) && prereq === 'warn'}
						<p class="mt-1 text-xs text-amber-600 dark:text-amber-400">{m.archive_ach_prereq_warn()}</p>
					{/if}
				{/if}
			</div>
		{/if}
	</div>

	<HoverTooltip visible={tipVisible} referenceElement={tipRef}>
		<span class="block max-w-xs py-1 text-xs text-neutral-900 dark:text-neutral-100">{tipText}</span
		>
	</HoverTooltip>
</li>

<Modal isOpen={conditionsOpen} onClose={() => (conditionsOpen = false)} title={resolved.en.title}>
	<div class="space-y-3 py-2 text-sm">
		<p class="text-primary-600 dark:text-primary-300">
			{scope === 'extra' ? m.archive_ach_modal_extra() : m.archive_ach_modal_log()}
		</p>
		{#if conditions.length}
			<ul class="text-primary-800 dark:text-primary-200 list-disc space-y-1 pl-5">
				{#each conditions as c, i (i)}
					<li>{@html parseArkhamMarkup(c)}</li>
				{/each}
			</ul>
		{:else}
			<p class="text-primary-800 dark:text-primary-200">
				{@html parseArkhamMarkup(clean(resolved.en.text))}
			</p>
		{/if}
	</div>
</Modal>
