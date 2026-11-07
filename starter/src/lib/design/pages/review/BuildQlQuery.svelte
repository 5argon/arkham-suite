<!--
@component
A BuildQL query with its parts colored, and what each field in it is. The start every preset
shares goes on a smaller first line, so the lines below are what this one is about, two clauses
to a line.
-->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import {
		type BuildQlField,
		type BuildQlTokenKind,
		fieldsOf,
		tokenizeBuildQl
	} from '$lib/review/buildql';
	import { buildQlLines } from '$lib/review/buildql-lines';

	interface Prop {
		/**
		 * The start every preset shares.
		 */
		prefix: string;
		/**
		 * The rest, what this preset is about.
		 */
		query: string;
	}
	const { prefix: prefixText, query }: Prop = $props();

	const prefix = $derived(tokenizeBuildQl(prefixText));
	const tokens = $derived(tokenizeBuildQl(query));
	const fields = $derived(fieldsOf([...prefix, ...tokens]));
	/**
	 * The chapter and investigator every search starts with get the first row to themselves.
	 */
	const prefixCount = $derived(fieldsOf(prefix).length);
	/**
	 * Whether a field is the second of its row on wider screens, which keeps some room from the first.
	 */
	const isSecond = (i: number) => (i < prefixCount ? i : i - prefixCount) % 2 === 1;

	/**
	 * How a field is compared, and whether it finds the cards that don't match.
	 */
	function matchText({ match, negated, list }: BuildQlField): string {
		if (list && match === 'fuzzy') {
			return negated ? m.review_buildql_fuzzy_none() : m.review_buildql_fuzzy_any();
		}
		if (list) return negated ? m.review_buildql_exact_none() : m.review_buildql_exact_any();
		if (match === 'fuzzy') return negated ? m.review_buildql_fuzzy_not() : m.review_buildql_fuzzy();
		if (match === 'exact') return negated ? m.review_buildql_exact_not() : m.review_buildql_exact();
		return negated ? m.review_buildql_pattern_not() : m.review_buildql_pattern();
	}
	const lines = $derived(buildQlLines(tokens));

	const colors: Record<BuildQlTokenKind, string> = {
		field: 'text-sky-700 dark:text-sky-300',
		operator: 'text-rose-600 dark:text-rose-300',
		string: 'text-emerald-700 dark:text-emerald-300',
		regex: 'text-orange-700 dark:text-orange-300',
		number: 'text-amber-700 dark:text-amber-300',
		keyword: 'text-violet-700 dark:text-violet-300',
		paren: 'text-neutral-500 dark:text-neutral-400',
		list: 'text-neutral-500 dark:text-neutral-400',
		space: '',
		other: ''
	};
</script>

<div class="w-max max-w-[min(32rem,calc(100vw-2rem))] py-2">
	<code
		class="block font-mono text-[0.65rem] leading-snug wrap-break-word whitespace-pre-wrap opacity-80"
	>
		{#each prefix as token, i (i)}<span class={colors[token.kind]}>{token.text}</span>{/each}
	</code>
	{#each lines as line, l (l)}
		<code
			class="block font-mono text-xs leading-snug wrap-break-word whitespace-pre-wrap {l > 0
				? 'pl-[1ch]'
				: ''}"
		>
			{#each line as token, i (i)}<span class={colors[token.kind]}>{token.text}</span>{/each}
		</code>
	{/each}
	{#if fields.length > 0}
		<!-- Two fields to a row on wider screens. Each column is as wide as its longest entry, so the
		 pairs line up. -->
		<dl
			class="mt-2 grid grid-cols-[max-content_max-content] gap-x-3 gap-y-0.5 text-xs sm:grid-cols-[max-content_max-content_max-content_max-content]"
		>
			{#each fields as field, i (`${field.alias}-${field.match}-${field.negated}-${field.list}`)}
				<dt
					class={[
						'font-mono whitespace-nowrap',
						i === prefixCount && 'sm:col-start-1',
						isSecond(i) && 'sm:pl-4'
					]}
				>
					<span class={colors.field}>{field.alias}</span>
					{#if field.operator}<span class={colors.operator}> {field.operator}</span>{/if}
				</dt>
				<dd class="text-primary-900 dark:text-primary-100">
					{field.name}
					{#if field.match}
						<span class="text-primary-700 dark:text-primary-300">({matchText(field)})</span>
					{/if}
				</dd>
			{/each}
		</dl>
	{/if}
</div>
