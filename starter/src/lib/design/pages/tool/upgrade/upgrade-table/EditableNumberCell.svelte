<script lang="ts">
	import { InlineTextBox } from '@5argon/arkham-life-ui';

	interface Props {
		currentNumber: number;
		prefixText?: string;
		suffixText?: string;
		editingLevel?: 'editable' | 'just-text' | 'greyed-out';
		onEndEdit?: (n: number) => void;
	}

	let {
		currentNumber,
		prefixText = '',
		suffixText = '',
		editingLevel = 'editable',
		onEndEdit = () => {}
	}: Props = $props();

	function inputKeyboardHandler(e: KeyboardEvent & { currentTarget: HTMLInputElement }) {
		if (e.key === 'Enter') {
			e.currentTarget.blur();
			const parsed = parseInt(e.currentTarget.value, 10);
			if (!isNaN(parsed)) {
				onEndEdit(parsed);
			} else {
				onEndEdit(0);
			}
		}
	}

	function inputCommitHandler(e: Event & { currentTarget: HTMLInputElement }) {
		const parsed = parseInt(e.currentTarget.value, 10);
		if (!isNaN(parsed)) {
			onEndEdit(parsed);
		} else {
			onEndEdit(0);
		}
	}

	let currentNumberString = $derived(currentNumber.toString());
</script>

<span class="prefix-suffix mx-0.5 select-none text-xs text-primary-300 dark:text-primary-600"
	>{prefixText}</span
>
{#if editingLevel === 'just-text'}<span
		class="arkham-number inline-flex h-6 w-8 items-center justify-end pr-1 font-['ArkhamNumber'] text-primary-800 dark:text-primary-200"
		>{currentNumber}</span
	>{:else}<span
		><InlineTextBox
			bind:value={currentNumberString}
			disabled={editingLevel === 'greyed-out'}
			align="right"
			class="w-8 pr-1"
			onchange={inputCommitHandler}
			onkeyup={inputKeyboardHandler}
		/>
	</span>{/if}<span
	class="prefix-suffix text-xs text-primary-300 dark:text-primary-600 mx-0.5 select-none"
	>{suffixText}</span
>
