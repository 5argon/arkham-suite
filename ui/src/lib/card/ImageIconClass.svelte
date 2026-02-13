<script lang="ts">
	import { CardClass } from '@5argon/arkham-kohaku';
	import clsx from 'clsx';
	interface Prop {
		cardClass: CardClass;
	}
	const { cardClass }: Prop = $props();
	const iconFileName: string = $derived.by(() => {
		switch (cardClass) {
			case CardClass.Guardian:
				return 'guardian';
			case CardClass.Seeker:
				return 'seeker';
			case CardClass.Rogue:
				return 'rogue';
			case CardClass.Mystic:
				return 'mystic';
			case CardClass.Survivor:
				return 'survivor';
			default:
				return '';
		}
	});
	const sizeControlClass: string = $derived.by(() => {
		switch (cardClass) {
			case CardClass.Guardian:
			case CardClass.Seeker:
			case CardClass.Rogue:
			case CardClass.Mystic:
				return 'h-4';
			case CardClass.Survivor:
				return 'w-4';
			default:
				return '';
		}
	});
	const iconPath = $derived(`/image/icon/class/${iconFileName}.png`);
</script>

{#if cardClass !== CardClass.Neutral}
	<i class="h-4 w-4 select-none flex items-center justify-center">
		<img
			src={iconPath}
			alt={cardClass}
			class={clsx('object-cover object-center', sizeControlClass)}
		/>
	</i>
{/if}
