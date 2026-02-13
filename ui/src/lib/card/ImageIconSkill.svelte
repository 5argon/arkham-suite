<script lang="ts">
	import { SkillIcon } from '@5argon/arkham-kohaku';
	import clsx from 'clsx';
	interface Prop {
		icon: SkillIcon;
	}
	const { icon }: Prop = $props();
	function iconPathForSkillIcon(skillIcon: SkillIcon) {
		let iconFileName: string = '';
		switch (skillIcon) {
			case SkillIcon.Agility:
				iconFileName = 'agility';
				break;
			case SkillIcon.Combat:
				iconFileName = 'combat';
				break;
			case SkillIcon.Intellect:
				iconFileName = 'intellect';
				break;
			case SkillIcon.Willpower:
				iconFileName = 'willpower';
				break;
			case SkillIcon.Wild:
				iconFileName = 'wild';
				break;
			default:
				throw new Error(`Unknown skill icon ${skillIcon}`);
		}
		return `/image/icon/stat/${iconFileName}.png`;
	}
</script>

{#snippet renderSkillIcon(skillIcon: SkillIcon)}
	<i class="relative select-none">
		<div
			class="bg-primary-200 dark:bg-primary-600 absolute inset-0 h-full w-full rotate-45 scale-90 transform"
		></div>
		<img
			width={14}
			height={14}
			src={iconPathForSkillIcon(skillIcon)}
			alt={skillIcon}
			class={clsx('relative object-cover object-center')}
		/>
	</i>
{/snippet}

{@render renderSkillIcon(icon)}
