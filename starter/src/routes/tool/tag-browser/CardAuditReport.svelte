<!--
@component
Card-scoped "Report a tagging error" panel for the single-card audit page: describe what's
wrong with this card's tags and copy a Markdown report (card + its current tags + reason)
to paste back for iteration.
-->
<script lang="ts">
	import { Button, SectionSeparator } from '@5argon/arkham-life-ui';
	import type { Card } from '@5argon/arkham-kohaku';

	let {
		card,
		tagLines,
		compoundLines = []
	}: { card: Card; tagLines: string[]; compoundLines?: string[] } = $props();

	// Fresh state per card: the parent remounts this via {#key} on the focused code.
	let reason = $state('');
	let copied = $state(false);

	function buildMarkdown(): string {
		const lines = [`### Card audit: ${card.name} (\`${card.code}\`)`, '', '**Current tags:**'];
		if (tagLines.length === 0) lines.push('- (none)');
		for (const t of tagLines) lines.push(`- ${t}`);
		lines.push('', '**Compound Tags:**');
		if (compoundLines.length === 0) lines.push('- (none)');
		for (const c of compoundLines) lines.push(`- ${c}`);
		lines.push('', "**What's wrong:**", reason.trim() || '(none given)');
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

<div class="mt-8">
	<SectionSeparator title="Report a tagging error" inner />
	<p class="text-primary-600 dark:text-primary-300 mt-1 mb-3 text-sm">
		Describe what's wrong with <strong>{card.name}</strong>'s tags, then copy a Markdown report to
		paste back.
	</p>

	<textarea
		bind:value={reason}
		oninput={() => (copied = false)}
		rows="3"
		placeholder="e.g. this should be a self-heal, not an ally heal; missing the 'search' tag; the boost amount is wrong…"
		class="border-primary-300 text-primary-900 dark:border-primary-600 dark:bg-primary-900 dark:text-primary-100 w-full rounded border bg-white px-3 py-2 text-sm"
	></textarea>

	<div class="mt-3">
		<Button label={copied ? 'Copied!' : 'Copy report as Markdown'} onClick={copy} />
	</div>
</div>
