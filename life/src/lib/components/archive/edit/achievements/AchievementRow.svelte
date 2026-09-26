<!--
@component
One achievement in the editor. A log-inferred one shows its state (the gear opens what it checks);
a manual one, or an Extra-inferred one without its data, gets a tick box, warning when its
prerequisite is missing. A `list` achievement has a row per item.
-->
<script lang="ts">
	import type { AchievementProgress, ResolvedAchievement } from '@5argon/arkham-campaign-data';
	import {
		Checkbox,
		FaIcon,
		FaIconType,
		Modal,
		parseArkhamMarkup
	} from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { manualTickKey } from '$lib/campaign/records/recorded-state';
	import HoverTip from '$lib/components/profile/_primitives/HoverTip.svelte';
	import { HoverTipState } from '$lib/components/profile/_primitives/hover-tip.svelte';

	interface Props {
		resolved: ResolvedAchievement;
		progress: AchievementProgress;
		/** How it checks itself: from the log, from the log plus Extra inputs, or not at all. */
		scope: 'log' | 'extra' | 'manual';
		/** What it checks, for the gear modal; empty for manual ones. */
		conditions: string[];
		/** Manual tick keys (see `manualTickKey`). */
		manual: Set<string>;
		prereq: 'ok' | 'warn' | 'unknown';
		onToggle: (itemId: string | undefined, earned: boolean) => void;
	}

	let { resolved, progress, scope, conditions, manual, prereq, onToggle }: Props = $props();

	const def = $derived(resolved.def);
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

	const key = (itemId?: string) => manualTickKey(def.id, itemId);
	const autoEarned = $derived(inferred && progress.earned === true);
	/** An `extra` achievement also takes a manual tick, for players who never fill the Extra tab. */
	const earned = $derived(scope === 'log' ? autoEarned : autoEarned || manual.has(def.id));

	const tipText = $derived(
		scope === 'extra' ? m.archive_ach_tip_extra() : scope === 'log' ? m.archive_ach_tip_log() : m.archive_ach_tip_manual(),
	);
	const tip = new HoverTipState();

	// Strips emphasis and card links; `[token]` markers stay for parseArkhamMarkup to draw.
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
					onmouseenter={(e) => tip.showText(tipText, e)}
					onmouseleave={tip.hide}
					onclick={() => (conditionsOpen = true)}
				>
					<FaIcon icon={statusIcon} />
				</button>
			{:else}
				<span
					class="text-primary-400"
					role="img"
					aria-label={tipText}
					onmouseenter={(e) => tip.showText(tipText, e)}
					onmouseleave={tip.hide}
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
						{#if !itemInferred}
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
		{:else}
			<div class="mt-1.5">
				{#if autoEarned}
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

	<HoverTip {tip} />
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
