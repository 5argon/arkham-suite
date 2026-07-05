<!--
@component
"Report errors" panel for a tag / compound audit: pick cards, give a reason, and copy a
Markdown report to paste back for iteration. The report ALWAYS lists every member card so
you can review the whole membership at a glance and say "all of these are wrong except a
few" — flip the invert toggle to mark the few CORRECT ones and report the rest as wrong.
-->
<script lang="ts">
	import { Button, CardFormMultiple, SectionSeparator } from '@5argon/arkham-life-ui';
	import type { Card } from '@5argon/arkham-kohaku';

	let {
		tagType,
		tagDisplayName,
		allCards,
		members,
		kind = 'Tag'
	}: {
		tagType: string;
		tagDisplayName: string;
		allCards: Card[];
		/** Every card that carries this tag / compound — always printed in the report. */
		members: { code: string; name: string }[];
		kind?: 'Tag' | 'Compound';
	} = $props();

	const cardMap = $derived(new Map(allCards.map((c) => [c.code, c])));
	const memberCodes = $derived(new Set(members.map((c) => c.code)));

	let picked = $state<string[]>([]);
	let reason = $state('');
	let invert = $state(false);
	let copied = $state(false);

	const nameOf = (code: string) => cardMap.get(code)?.name ?? code;

	function buildMarkdown(): string {
		// Default: picked cards are the wrong ones. Inverted: picked are the CORRECT
		// exceptions, so every OTHER member is reported wrong.
		const wrong = invert
			? members.map((c) => c.code).filter((code) => !picked.includes(code))
			: picked;
		const lines = [
			`### ${kind} audit: ${tagDisplayName} (\`${tagType}\`)`,
			'',
			`**Wrongly tagged cards${invert ? ' (all members except the ones marked correct)' : ''}:**`
		];
		if (wrong.length === 0) lines.push('- (none selected)');
		for (const code of wrong) lines.push(`- ${nameOf(code)} (${code})`);
		lines.push('', '**Reason:**', reason.trim() || '(none given)');
		lines.push('', `**All ${members.length} cards with this ${kind.toLowerCase()}:**`);
		for (const c of members) lines.push(`- ${c.name} (${c.code})`);
		return lines.join('\n');
	}

	async function copy() {
		try {
			await navigator.clipboard.writeText(buildMarkdown());
			copied = true;
		} catch {
			copied = false;
		}
	}
</script>

<div class="mt-10">
	<SectionSeparator title="Report errors" />
	<p class="text-primary-600 dark:text-primary-300 mt-1 mb-3 text-sm">
		Mark cards for <strong>{tagDisplayName}</strong>, give a reason, then copy a Markdown report.
		The report always lists all {members.length} member cards. Use invert when most are wrong.
	</p>

	<label class="mb-3 flex items-center gap-2 text-sm">
		<input type="checkbox" bind:checked={invert} onchange={() => (copied = false)} />
		<span class="text-primary-700 dark:text-primary-200">
			The cards I pick are the <strong>correct</strong> ones — report every other member as wrong
		</span>
	</label>

	<CardFormMultiple
		cards={allCards}
		filter={(card: Card) => memberCodes.has(card.code)}
		label={invert ? 'Correct cards (the exceptions)' : 'Wrongly tagged cards'}
		selectedCodes={picked}
		onSelectionChange={(codes: string[]) => {
			picked = codes;
			copied = false;
		}}
	/>

	<label class="mt-3 block">
		<span class="text-primary-600 dark:text-primary-300 text-sm">Reason</span>
		<textarea
			bind:value={reason}
			oninput={() => (copied = false)}
			rows="3"
			placeholder="Why is the tagging wrong, and what should it be?"
			class="border-primary-300 text-primary-900 dark:border-primary-600 dark:bg-primary-900 dark:text-primary-100 mt-1 w-full rounded border bg-white px-3 py-2 text-sm"
		></textarea>
	</label>

	<div class="mt-3">
		<Button label={copied ? 'Copied!' : 'Copy report as Markdown'} onClick={copy} />
	</div>
</div>
