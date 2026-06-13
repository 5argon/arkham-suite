<!--
@component
"Report errors" panel for a tag audit: pick wrongly-tagged cards (search limited to
tagged cards), give a reason, and copy a Markdown report to paste back for iteration.
-->
<script lang="ts">
	import { Button, CardFormMultiple, SectionSeparator } from '@5argon/arkham-life-ui';
	import type { Card } from '@5argon/arkham-kohaku';
	import { tagRepo } from '$lib/tag-browser';

	let {
		tagType,
		tagDisplayName,
		allCards
	}: { tagType: string; tagDisplayName: string; allCards: Card[] } = $props();

	const taggedCodes = new Set(tagRepo.cards.map((c) => c.code));
	const cardMap = $derived(new Map(allCards.map((c) => [c.code, c])));

	let wrongCodes = $state<string[]>([]);
	let reason = $state('');
	let copied = $state(false);

	function buildMarkdown(): string {
		const lines = [
			`### Tag audit: ${tagDisplayName} (\`${tagType}\`)`,
			'',
			'**Wrongly tagged cards:**'
		];
		if (wrongCodes.length === 0) lines.push('- (none selected)');
		for (const code of wrongCodes) lines.push(`- ${cardMap.get(code)?.name ?? code} (${code})`);
		lines.push('', '**Reason:**', reason.trim() || '(none given)');
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
		Add cards that are wrongly tagged with <strong>{tagDisplayName}</strong> (the search is limited
		to tagged cards), give a reason, then copy a Markdown report to paste back.
	</p>

	<CardFormMultiple
		cards={allCards}
		filter={(card: Card) => taggedCodes.has(card.code)}
		label="Wrongly tagged cards"
		selectedCodes={wrongCodes}
		onSelectionChange={(codes: string[]) => {
			wrongCodes = codes;
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
