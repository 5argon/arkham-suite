<script lang="ts">
	import { ChaosTokenIcon } from '@5argon/arkham-icon';
	import { ChaosToken } from '@5argon/arkham-kohaku';
	import { Dropdown, type Option } from '@5argon/arkham-life-ui';
	import {
		catalog,
		characterName,
		logText,
		optionText,
		type CoterieAttempt,
		type CoteriePathCheck,
		type MemberVoteDetail,
		type PlanTrajectory,
		type Vote,
	} from '@5argon/arkham-tsk-solver';

	// `attempt` is the plan's current "you may overthrow/join" choice ('' = let the game decide).
	// `onAttempt` is supplied only in the editor; the read-only view passes none and shows the choice as text.
	let { trajectory, attempt = '', onAttempt }: { trajectory: PlanTrajectory; attempt?: string; onAttempt?: (v: string) => void } = $props();

	const fd = $derived(trajectory.finaleDetail);
	const pred = $derived(fd.prediction);

	const judgmentLabel = (id: string) => catalog().judgments.find((j) => j.id === id)?.label ?? id;
	const epilogueLabel = (id: string) => catalog().epilogues.find((e) => e.id === id)?.label ?? id;
	const judgmentCondition = $derived(optionText('59-Z', 'COTK.judgment', pred.judgment)?.condition ?? '');
	const version = $derived(pred.version.split('.').pop()?.toUpperCase() ?? pred.version); // COTK.v2 → V2

	// Vote groups. Nay = wants the cell spared; Yea = wants it condemned (a tie counts as Yea);
	// the rest abstain or are eerily silent (silent feeds the "destroyed from within" ending).
	const byVote = (v: Vote) => fd.members.filter((m) => m.vote === v);
	const nay = $derived(byVote('nay'));
	const yea = $derived(byVote('yea'));
	const neither = $derived(fd.members.filter((m) => m.vote === 'abstain' || m.vote === 'silent'));
	const silentCount = $derived(byVote('silent').length);

	const tk = 'text-primary-700 dark:text-primary-200';

	const attemptText: Record<CoterieAttempt, string> = {
		overthrow: 'Attempt to overthrow the Coterie',
		join: 'Join the Coterie',
		asset: 'Decline — remain an asset',
	};
	const attemptOptions = $derived<Option<string>[]>([
		{ value: '', label: 'Let the Congress decide (default)' },
		...fd.attemptOptions.map((a) => ({ value: a, label: attemptText[a] })),
	]);
	// Keep the chosen attempt valid: if it's no longer one the table offers, fall back to default.
	const effectiveAttempt = $derived(fd.attemptOptions.includes(attempt as CoterieAttempt) ? attempt : '');

	const voteWord: Record<Vote, string> = { nay: 'Nay', yea: 'Yea', abstain: 'Abstain', silent: 'Silent' };
</script>

{#snippet member(m: MemberVoteDetail)}
	<li class="flex flex-col">
		<span class="text-primary-800 dark:text-primary-200">
			{characterName(m.member)}
			{#if m.vote === 'silent'}<i class="fa-solid fa-volume-xmark ml-1 text-primary-400" title="eerily silent"></i>{/if}
		</span>
		{#if !m.isDefault && m.viaLog}
			<span class="text-[0.7rem] text-primary-400">↳ {logText(m.viaLog)}</span>
		{:else if m.note}
			<span class="text-[0.7rem] text-primary-400">↳ {m.note === 'coinFlipLightOfPharosBearer' ? 'coin flip (Light of Pharos bearer)' : m.note === 'leadInvestigatorForcedToVoteYea' ? 'the lead is forced to vote Yea' : m.note}</span>
		{/if}
	</li>
{/snippet}

{#snippet pathCard(check: CoteriePathCheck, title: string)}
	<div class="flex-1 rounded-lg border p-3 {check.eligible ? 'border-secondary-300 dark:border-secondary-800 bg-secondary-50/50 dark:bg-secondary-950/20' : 'border-primary-200 dark:border-primary-800'}">
		<div class="flex items-center justify-between gap-2">
			<span class="font-heading text-primary-900 dark:text-primary-100">{title}</span>
			{#if check.eligible}
				<span class="rounded bg-secondary-200 px-1.5 py-0.5 text-[0.7rem] font-medium text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200">Open</span>
			{:else}
				<span class="rounded bg-primary-100 px-1.5 py-0.5 text-[0.7rem] font-medium text-primary-500 dark:bg-primary-900 dark:text-primary-400">Blocked</span>
			{/if}
		</div>
		<p class="mt-1 text-xs text-primary-500 dark:text-primary-400">Nays must win, and all three must vote Nay:</p>
		<ul class="mt-1 flex flex-col gap-0.5 text-sm">
			{#each check.requiredNay as id (id)}
				{@const ok = check.metNay.includes(id)}
				<li class={ok ? 'text-secondary-700 dark:text-secondary-300' : 'text-survivor-700 dark:text-survivor-300'}>
					<i class="fa-solid {ok ? 'fa-check' : 'fa-xmark'} mr-1"></i>{characterName(id)}{ok ? '' : ' — not voting Nay'}
				</li>
			{/each}
		</ul>
		{#if !check.nayWins}
			<p class="mt-1 text-xs text-survivor-600 dark:text-survivor-400">The Yeas win the overall tally, so this path is closed regardless.</p>
		{/if}
	</div>
{/snippet}

<div class="flex flex-col gap-4">
	<!-- Outcome -->
	<div class="rounded-lg border border-primary-200 dark:border-primary-800 p-4">
		<div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
			<span class="font-heading text-lg text-primary-900 dark:text-primary-100">{judgmentLabel(pred.judgment)}</span>
			<span class="text-sm text-primary-400">finale v.{version}</span>
		</div>
		{#if judgmentCondition}<p class="mt-1 text-sm text-primary-600 dark:text-primary-300">{judgmentCondition}</p>{/if}
		<div class="mt-2 flex flex-wrap gap-4 text-sm text-primary-700 dark:text-primary-300">
			<span class="flex items-center gap-1.5"><i class="fa-solid fa-flag-checkered text-primary-400"></i>{epilogueLabel(pred.epilogue)}</span>
			<span class="flex items-center gap-1.5" title="Foundation Trust">
				<span class="flex text-base"><ChaosTokenIcon chaosToken={ChaosToken.TokenTablet} circular={false} fillColor={tk} /></span>{pred.trust} Foundation Trust
			</span>
			<span class="flex items-center gap-1.5" title="Cell Deception">
				<span class="flex text-base"><ChaosTokenIcon chaosToken={ChaosToken.TokenElderThing} circular={false} fillColor={tk} /></span>{pred.deception} Cell Deception
			</span>
		</div>
	</div>

	<!-- Vote table -->
	<div class="rounded-lg border border-primary-200 dark:border-primary-800 p-4">
		<div class="mb-2 flex flex-wrap items-baseline justify-between gap-2">
			<h4 class="font-heading text-primary-900 dark:text-primary-100">The Coterie vote</h4>
			<span class="text-xs text-primary-400">Nays {pred.nay} · Yeas {pred.yea} — {pred.nayWins ? 'the cell is spared (Nays win)' : 'the cell is condemned (a tie counts as Yea)'}</span>
		</div>
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
			<div>
				<div class="mb-1 text-xs font-semibold uppercase tracking-wide text-secondary-700 dark:text-secondary-300">Nay — spare the cell ({nay.length})</div>
				<ul class="flex flex-col gap-1 text-sm">{#each nay as m (m.member)}{@render member(m)}{/each}{#if !nay.length}<li class="text-xs italic text-primary-400">none</li>{/if}</ul>
			</div>
			<div>
				<div class="mb-1 text-xs font-semibold uppercase tracking-wide text-survivor-700 dark:text-survivor-300">Yea — condemn the cell ({yea.length})</div>
				<ul class="flex flex-col gap-1 text-sm">{#each yea as m (m.member)}{@render member(m)}{/each}{#if !yea.length}<li class="text-xs italic text-primary-400">none</li>{/if}</ul>
			</div>
			<div>
				<div class="mb-1 text-xs font-semibold uppercase tracking-wide text-primary-500 dark:text-primary-400">Abstain / silent ({neither.length})</div>
				<ul class="flex flex-col gap-1 text-sm">{#each neither as m (m.member)}{@render member(m)}{/each}{#if !neither.length}<li class="text-xs italic text-primary-400">none</li>{/if}</ul>
			</div>
		</div>
		{#if silentCount >= 3}
			<p class="mt-2 text-xs text-primary-600 dark:text-primary-300"><i class="fa-solid fa-volume-xmark mr-1"></i>{silentCount} members are eerily silent (3+) — the Coterie is destroyed from within.</p>
		{/if}
	</div>

	<!-- Overthrow / Join paths -->
	<div>
		<div class="mb-2 flex flex-col gap-2 sm:flex-row">
			{@render pathCard(fd.overthrow, 'Overthrow the Coterie')}
			{@render pathCard(fd.join, 'Join the Coterie')}
		</div>
		{#if fd.attemptOptions.length}
			{#if onAttempt}
				<div class="max-w-md">
					<Dropdown value={effectiveAttempt} label="At the Congress, you may…" options={attemptOptions} onchange={(v) => onAttempt(v)} />
					<p class="mt-1 text-xs italic text-primary-400">Nays won and a coalition is in place — the guide lets you choose to overthrow, be inducted, or decline and remain an asset.</p>
				</div>
			{:else if effectiveAttempt}
				<p class="text-sm text-primary-700 dark:text-primary-300"><i class="fa-solid fa-gavel mr-1 text-primary-400"></i>At the Congress: {attemptText[effectiveAttempt as CoterieAttempt]}.</p>
			{/if}
		{/if}
	</div>

	<!-- Epilogue tally -->
	<div class="rounded-lg border border-primary-200 dark:border-primary-800 p-4">
		<h4 class="mb-1 font-heading text-primary-900 dark:text-primary-100">Epilogue — Foundation Trust vs Cell Deception</h4>
		<p class="mb-3 text-xs text-primary-500 dark:text-primary-400">Each recorded note below counts once. The larger tally decides whether the cell earns a permanent position or is dismantled.</p>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div>
				<div class="mb-1 flex items-center gap-1.5 text-sm font-semibold text-primary-800 dark:text-primary-200">
					<span class="flex text-base"><ChaosTokenIcon chaosToken={ChaosToken.TokenTablet} circular={false} fillColor={tk} /></span>Foundation Trust · {pred.trust}
				</div>
				<ul class="flex flex-col gap-0.5 text-sm">
					{#each fd.foundationTrust as c (c.log)}
						<li class={c.met ? 'text-secondary-700 dark:text-secondary-300' : 'text-primary-400'}>
							<i class="fa-solid {c.met ? 'fa-square-check' : 'fa-square'} mr-1"></i>{logText(c.log)}
						</li>
					{/each}
				</ul>
			</div>
			<div>
				<div class="mb-1 flex items-center gap-1.5 text-sm font-semibold text-primary-800 dark:text-primary-200">
					<span class="flex text-base"><ChaosTokenIcon chaosToken={ChaosToken.TokenElderThing} circular={false} fillColor={tk} /></span>Cell Deception · {pred.deception}
				</div>
				<ul class="flex flex-col gap-0.5 text-sm">
					{#each fd.cellDeception as c (c.log)}
						<li class={c.met ? 'text-survivor-700 dark:text-survivor-300' : 'text-primary-400'}>
							<i class="fa-solid {c.met ? 'fa-square-check' : 'fa-square'} mr-1"></i>{logText(c.log)}
						</li>
					{/each}
				</ul>
			</div>
		</div>
		<p class="mt-3 text-sm text-primary-700 dark:text-primary-300">
			<i class="fa-solid fa-flag-checkered mr-1 text-primary-400"></i>{epilogueLabel(pred.epilogue)}
		</p>
	</div>
</div>
