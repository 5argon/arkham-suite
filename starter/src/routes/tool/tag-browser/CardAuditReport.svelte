<!--
@component
Card-scoped "Report a tagging error" panel for the single-card audit page: describe what's
wrong with this card's tags and copy a Markdown report (card + its current tags + reason).
-->
<script lang="ts">
	import type { Card } from '@5argon/arkham-kohaku';
	import MarkdownReportPanel from './MarkdownReportPanel.svelte';

	let {
		card,
		tagLines,
		compoundLines = []
	}: { card: Card; tagLines: string[]; compoundLines?: string[] } = $props();

	function buildMarkdown(reason: string): string {
		const lines = [`### Card audit: ${card.name} (\`${card.code}\`)`, '', '**Current tags:**'];
		if (tagLines.length === 0) lines.push('- (none)');
		for (const t of tagLines) lines.push(`- ${t}`);
		lines.push('', '**Compound Tags:**');
		if (compoundLines.length === 0) lines.push('- (none)');
		for (const c of compoundLines) lines.push(`- ${c}`);
		lines.push('', "**What's wrong:**", reason || '(none given)');
		return lines.join('\n');
	}
</script>

<MarkdownReportPanel
	title="Report a tagging error"
	inner
	placeholder="e.g. this should be a self-heal, not an ally heal; missing the 'search' tag; the boost amount is wrong…"
	{buildMarkdown}
>
	{#snippet intro()}
		Describe what's wrong with <strong>{card.name}</strong>'s tags, then copy a Markdown report to
		paste back.
	{/snippet}
</MarkdownReportPanel>
