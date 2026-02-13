<script lang="ts">
	import { Slot } from '@5argon/arkham-kohaku';
	import clsx from 'clsx';
	interface Prop {
		slots?: Slot[];
	}
	const { slots }: Prop = $props();
	function iconPathForSlot(slot: Slot) {
		let iconFileName: string = '';
		switch (slot) {
			case Slot.Ally:
				iconFileName = 'ally';
				break;
			case Slot.Accessory:
				iconFileName = 'accessory';
				break;
			case Slot.Hand:
				iconFileName = 'one-hand';
				break;
			case Slot.HandX2:
				iconFileName = 'two-hand';
				break;
			case Slot.Body:
				iconFileName = 'body';
				break;
			case Slot.Arcane:
				iconFileName = 'one-arcane';
				break;
			case Slot.ArcaneX2:
				iconFileName = 'two-arcane';
				break;
			case Slot.Tarot:
				iconFileName = 'tarot';
				break;
			case Slot.Head:
				iconFileName = 'head';
				break;
			default:
				throw new Error(`Unknown slot ${slot}`);
		}
		return `/image/icon/slot/${iconFileName}.png`;
	}
</script>

{#if slots !== undefined}
	{#if slots.length === 0}
		<!-- Still reserve the same space, but renders nothing. -->
		<i class="h-5 w-5 flex-shrink-0"></i>
	{:else}
		{#each slots as slot, i (i)}
			<i class="h-5 w-5 flex-shrink-0 flex items-center select-none">
				<img
					width={24}
					height={24}
					src={iconPathForSlot(slot)}
					alt={slot}
					class={clsx('object-cover object-center')}
				/>
			</i>
		{/each}
	{/if}
{:else}
	<!-- Undefined slot still reserve the same space, but renders nothing. -->
	<i class="h-5 w-5 flex-shrink-0"></i>
{/if}
