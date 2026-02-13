<script lang="ts">
	import clsx from 'clsx';

	export let small: boolean = false;
</script>

<div
	class={clsx(
		small ? 'border-l-[2px]' : 'border-l-[4px]',
		'border-primary-600/50 dark:border-primary-400/50'
	)}
>
	<div class={clsx('border-wrapper', 'border-primary-500/50')}>
		<div class="border-inner relative">
			<div class={clsx(small ? 'h-5 w-5' : 'h-8 w-8')}></div>
		</div>
	</div>
</div>

<style>
	.border-wrapper-left-extend {
		border-left-width: 4px;
	}

	.border-wrapper {
		border-width: 1px;
		border-style: dashed;
	}

	.border-inner {
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-style: dashed;
	}
</style>
