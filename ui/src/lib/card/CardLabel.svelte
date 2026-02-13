<script lang="ts" module>
	import { CardClass, type CardClass as CardClassType } from '@5argon/arkham-kohaku';

	export interface CardLabelProp {
		text: string;
		color?: CardClassType;
	}
</script>

<script lang="ts">
	import clsx from 'clsx';

	interface Prop {
		label: CardLabelProp;
	}

	const { label }: Prop = $props();

	function getColorClass(color?: CardClassType): string {
		switch (color) {
			case CardClass.Guardian:
				return 'bg-guardian-500 dark:bg-guardian-400 text-white dark:text-black';
			case CardClass.Seeker:
				return 'bg-seeker-500 dark:bg-seeker-400 text-white dark:text-black';
			case CardClass.Rogue:
				return 'bg-rogue-500 dark:bg-rogue-400 text-white dark:text-black';
			case CardClass.Mystic:
				return 'bg-mystic-500 dark:bg-mystic-400 text-white dark:text-black';
			case CardClass.Survivor:
				return 'bg-survivor-500 dark:bg-survivor-400 text-white dark:text-black';
			case CardClass.Neutral:
				return 'bg-neutral-500 dark:bg-neutral-400 text-white dark:text-black';
			default:
				return 'bg-secondary-500 dark:bg-secondary-400 text-white dark:text-black';
		}
	}

	const colorClass = $derived(getColorClass(label.color));
</script>

<span
	class={clsx(
		colorClass,
		'inline-block rounded-xs px-1 text-[0.6rem] font-medium leading-tight'
	)}
>
	{label.text}
</span>
