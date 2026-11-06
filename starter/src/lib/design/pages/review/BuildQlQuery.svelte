<!--
@component
A BuildQL query with its parts colored, and what each field in it is. The start every preset
shares goes on a smaller first line, so the lines below are what this one is about, two clauses
to a line.
-->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { type BuildQlTokenKind, fieldsOf, tokenizeBuildQl } from '$lib/review/buildql';
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
	const lines = $derived(buildQlLines(tokens));

	const colors: Record<BuildQlTokenKind, string> = {
		field: 'text-sky-700 dark:text-sky-300',
		operator: 'text-rose-600 dark:text-rose-300',
		string: 'text-emerald-700 dark:text-emerald-300',
		regex: 'text-orange-700 dark:text-orange-300',
		number: 'text-amber-700 dark:text-amber-300',
		keyword: 'text-violet-700 dark:text-violet-300',
		paren: 'text-neutral-500 dark:text-neutral-400',
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
		<table class="mt-2 text-xs">
			<tbody>
				{#each fields as field (`${field.alias}-${field.match}`)}
					<tr>
						<td class="pr-3 font-mono whitespace-nowrap">
							<span class={colors.field}>{field.alias}</span>
							{#if field.operator}<span class={colors.operator}> {field.operator}</span>{/if}
						</td>
						<td class="text-primary-900 dark:text-primary-100">
							{field.name}
							{#if field.match === 'fuzzy'}
								<span class="text-primary-700 dark:text-primary-300"
									>({m.review_buildql_fuzzy()})</span
								>
							{:else if field.match === 'exact'}
								<span class="text-primary-700 dark:text-primary-300"
									>({m.review_buildql_exact()})</span
								>
							{:else if field.match === 'pattern'}
								<span class="text-primary-700 dark:text-primary-300"
									>({m.review_buildql_pattern()})</span
								>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>
