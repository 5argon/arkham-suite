<!--
@component
Button with room for graphic, text, subtext, and accent color.
You can also use it for toggle buttons. Show the active state by passing the active prop.
TODO: Make the tab index work.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';

	interface Prop {
		text: string;
		graphic: string;

		/**
		 * If a function, outermost element is `<button>`. If a string, outermost element is `<a href>`.
		 */
		onClick: (() => void) | string;

		subtext?: string;
		accentColor?: string;
		/**
		 * `undefined` has different look from both `true` and `false`.
		 */
		active?: boolean;
		small?: boolean;
		children?: Snippet;
	}
	const { text, subtext, graphic, onClick, accentColor, active, small, children }: Prop = $props();
</script>

{#snippet inside()}
	<div class:small class:big={!small} class="h-full w-full" style="--accent-color:{accentColor}">
		<div
			class="bg-primary-400/30 dark:bg-primary-950/30
			dark:hover:bg-primary-300/30 hover:bg-primary-400/60 dark:active:bg-secondary-200/40
			active:bg-secondary-600/40 group h-full w-full p-1"
		>
			<div
				class="background-part colored-border h-full w-full border-2"
				class:bg-inactive={active === false}
				class:bg-active={active === true}
				style="background-image: url('{graphic}')"
			>
				<div class="relative h-full w-full">
					<div
						class:bg-darken-button={active === undefined}
						class:bg-darken-toggle-active={active === true}
						class:bg-darken-toggle-inactive={active === false}
						class="absolute flex h-full w-full group-hover:bg-black/30 group-active:bg-black/20"
					></div>
					{#if active === true}
						<div class="absolute ml-1 text-white">
							✓
						</div>
					{/if}
					{#if children}
						<div class="absolute top-0 right-0 p-px z-10 text-white flex items-center justify-center">
							{@render children()}
						</div>
					{/if}
					<div class="absolute flex h-full w-full flex-col items-end justify-end">
						{#if subtext}
							<svg
								class="block opacity-60 group-hover:opacity-80"
								class:svg-big={!small}
								class:svg-small={small}
								viewBox="0 0 602 111"
								version="1.1"
								xmlns="http://www.w3.org/2000/svg"
								xmlns:xlink="http://www.w3.org/1999/xlink"
								xml:space="preserve"
								style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"
							>
								<g transform="matrix(1,0,0,1,-340,-183)">
									<path d="M471,183L942,183L942,294L340,294L471,183Z" />
								</g>
							</svg>
						{:else}
							<svg
								class="block opacity-60 group-hover:opacity-80"
								class:svg-big={!small}
								class:svg-small={small}
								viewBox="0 0 602 111"
								version="1.1"
								xmlns="http://www.w3.org/2000/svg"
								xmlns:xlink="http://www.w3.org/1999/xlink"
								xml:space="preserve"
								style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"
							>
								<g transform="matrix(1,0,0,1,-340,-183)">
									<path d="M431.5,214.179L942,214.179L942,294L340,294L431.5,214.179Z" />
								</g>
							</svg>
						{/if}
					</div>
					<div
						class="absolute flex h-full w-full flex-col items-end justify-end"
						class:padding-small={small}
						class:padding-big={!small}
					>
						<div
							class="text leading-none text-white"
							class:text1-small={small}
							class:text1-big={!small}
						>
							{text}
						</div>
						{#if subtext}
							<div
								class="subtext text-xs leading-none text-white"
								class:text2-small={small}
								class:text2-big={!small}
							>
								{subtext}
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{/snippet}

{#if typeof onClick === 'function'}
	<button
		type="button"
		class="cursor-pointer"
		onclick={() => {
			onClick?.();
		}}
	>
		{@render inside()}
	</button>
{:else}
	<a href={resolve(onClick,{})} class="cursor-pointer">
		{@render inside()}
	</a>
{/if}

<style>
	.text {
		font-family: 'Heading';
	}

	.subtext {
		font-family: 'Main';
	}

	.big {
		width: 400px;
		height: 100px;
	}

	.small {
		width: 250px;
		height: 70px;
	}

	.svg-big {
		width: 280px;
	}

	.svg-small {
		width: 180px;
	}

	.padding-big {
		padding: 0.35rem;
	}

	.padding-small {
		padding: 0.25rem;
	}

	.text1-big {
		font-size: 1.2em;
	}

	.text2-big {
		font-size: 0.8em;
	}

	.text1-small {
		font-size: 0.8em;
	}

	.text2-small {
		font-size: 0.6em;
	}

	.bg-darken-button {
		background-color: rgba(0, 0, 0, 0.4);
	}

	.bg-darken-toggle-active {
		background-color: rgba(0, 0, 0, 0.1);
	}

	.bg-darken-toggle-inactive {
		background-color: rgba(0, 0, 0, 0.5);
	}

	.bg-inactive {
		filter: grayscale(70%);
	}

	.background-part {
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
	}

	.colored-border {
		border-color: var(--accent-color);
	}

	svg {
		color: var(--accent-color);
	}

	svg > g > path {
		fill: currentColor;
	}
</style>
