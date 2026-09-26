<!-- @component Official achievements per campaign with their text; list achievements expand into their items. -->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { FaIcon, FaIconType, parseArkhamMarkup } from '@5argon/arkham-life-ui';
	import type { ProfileFamily } from '$lib/campaign/achievements/achievement-aggregate';
	import { HoverTip, HoverTipState } from '$lib/components/profile/_primitives';

	let {
		families,
		showFamilyName = true
	}: {
		families: ProfileFamily[];
		showFamilyName?: boolean;
	} = $props();

	const tip = new HoverTipState();
</script>

{#snippet hint(text: string, detail: string, cls: string)}
	<span
		role="img"
		aria-label={detail}
		class="cursor-default {cls}"
		onmouseenter={(e) => tip.showText(detail, e)}
		onmouseleave={tip.hide}>{text}</span
	>
{/snippet}

{#if families.length}
	<div class="space-y-5">
		{#each families as fam (fam.family)}
			<div>
				{#if showFamilyName}
					<div class="mb-1.5 flex items-baseline justify-between">
						<h3 class="font-bold text-black dark:text-white">{fam.name}</h3>
						<span class="text-primary-500 text-sm tabular-nums">{fam.earned}/{fam.total}</span>
					</div>
				{/if}
				<ul class="space-y-2.5">
					{#each fam.achievements as a (a.id)}
						<li class="text-sm" class:opacity-45={!a.earned}>
							<div class="flex items-center gap-2">
								<span
									class={a.earned
										? 'text-yellow-500 dark:text-yellow-400'
										: 'text-primary-300 dark:text-primary-600'}
								>
									<FaIcon icon={FaIconType.Achievement} />
								</span>
								<span class="font-medium text-black dark:text-white">{a.title}</span>
								{#if a.earnCount > 1}
									{@render hint(
										`×${a.earnCount}`,
										m.campaign_achievements_earned_in_plays({ count: a.earnCount }),
										'text-secondary-600 dark:text-secondary-400 text-xs font-semibold tabular-nums'
									)}
								{/if}
								{#if a.earnedTiers.length}
									{@render hint(
										a.earnedTiers.map((t) => t[0]).join(''),
										m.campaign_achievements_earned_on({ tiers: a.earnedTiers.join(', ') }),
										'text-primary-400 text-[0.6rem] font-semibold tracking-wide uppercase'
									)}
								{/if}
							</div>
							{#if a.text}
								<p class="text-primary-500 mt-0.5 pl-6 text-xs">{@html parseArkhamMarkup(a.text)}</p>
							{/if}
							{#if a.items?.length}
								<ul class="mt-1 grid grid-cols-1 gap-x-4 gap-y-0.5 pl-6 sm:grid-cols-2">
									{#each a.items as it (it.id)}
										<li class="flex items-center gap-1.5 text-xs" class:opacity-50={!it.earned}>
											<span
												class={it.earned ? 'text-secondary-500' : 'text-primary-300 dark:text-primary-600'}
											>
												<FaIcon icon={FaIconType.CheckBox} />
											</span>
											<span class="text-primary-700 dark:text-primary-300">{it.label}</span>
										</li>
									{/each}
								</ul>
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
	<HoverTip {tip} />
{/if}
