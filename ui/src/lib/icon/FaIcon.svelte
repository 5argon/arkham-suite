<!--
@component
Render Font Awesome icons using webfont with Tailwind styling support.
-->
<script lang="ts">
	import { FaIconType } from './fa-icon-type.js';
	import clsx from 'clsx';

	interface Prop {
		/**
		 * The icon type to display
		 */
		icon: FaIconType;
		/**
		 * Whether to animate the icon with a spinning effect
		 */
		spin?: boolean;
		/**
		 * Use duotone style with automatic theme colors
		 */
		duotone?: boolean;
		/**
		 * Invert the primary/secondary colors for better visibility on inverted backgrounds
		 */
		invertColor?: boolean;
		/**
		 * Additional CSS classes to apply
		 */
		class?: string;
	}

	const {
		icon,
		spin = false,
		duotone = false,
		invertColor = false,
		class: className
	}: Prop = $props();

	/**
	 * Map icon type to Font Awesome icon name
	 */
	function getIconName(iconType: FaIconType): string {
		const iconMap: Record<FaIconType, string> = {
			[FaIconType.LeftSingle]: 'fa-angle-left',
			[FaIconType.LeftDouble]: 'fa-angles-left',
			[FaIconType.RightSingle]: 'fa-angle-right',
			[FaIconType.RightDouble]: 'fa-angles-right',
			[FaIconType.ArrowUp]: 'fa-arrow-up',
			[FaIconType.ArrowUpAdd]: 'fa-arrow-up',
			[FaIconType.ArrowDown]: 'fa-arrow-down',
			[FaIconType.ArrowDownAdd]: 'fa-arrow-down',
			[FaIconType.ArrowLeftBordered]: 'fa-left',
			[FaIconType.ArrowRightBordered]: 'fa-right',
			[FaIconType.Delete]: 'fa-trash',
			[FaIconType.Unlock]: 'fa-lock-open',
			[FaIconType.Collapse]: 'fa-arrows-to-line',
			[FaIconType.InvestigatorRestriction]: 'fa-user-lock',
			[FaIconType.NoticeInfo]: 'fa-circle-info',
			[FaIconType.NoticeSuccess]: 'fa-circle-check',
			[FaIconType.NoticeError]: 'fa-circle-exclamation',
			[FaIconType.Loading]: 'fa-spinner',
			[FaIconType.Manual]: 'fa-book',
			[FaIconType.Plus]: 'fa-plus',
			[FaIconType.Minus]: 'fa-minus',
			[FaIconType.Grip]: 'fa-grip-dots-vertical',
			[FaIconType.Customizable]: 'fa-wrench',
			[FaIconType.Bonded]: 'fa-link',
			[FaIconType.Exceptional]: 'fa-star',
			[FaIconType.Permanent]: 'fa-block-brick',
			[FaIconType.CheckBox]: 'fa-square',
			[FaIconType.CheckBoxChecked]: 'fa-square-check',
			[FaIconType.Investigator]: 'fa-user',
			[FaIconType.Expand]: 'fa-arrow-up-right-and-arrow-down-left-from-center',
			[FaIconType.Advanced]: 'fa-triple-chevrons-up',
			[FaIconType.Reward]: 'fa-gift',
			[FaIconType.Weakness]: 'fa-skull',
			[FaIconType.AnyWeakness]: 'fa-virus',
			[FaIconType.Experience]: 'fa-arrow-up-right-dots',
			[FaIconType.Myriad]: 'fa-layer-group',
			[FaIconType.FoldoutRight]: 'fa-caret-right',
			[FaIconType.FoldoutDown]: 'fa-caret-down',
			[FaIconType.Specialist]: 'fa-circle-user-circle-exclamation',
			[FaIconType.Researched]: 'fa-graduation-cap',
			[FaIconType.Fast]: 'fa-bolt',
			[FaIconType.GroupingSorting]: 'fa-sliders-h',
			[FaIconType.CardViewModeScans]: 'fa-cards-blank',
			[FaIconType.CardViewModeList]: 'fa-list',
			[FaIconType.CardViewModeIcons]: 'fa-grid',
			[FaIconType.Dropdown]: 'fa-square-chevron-down',
			[FaIconType.EncounterSubset]: 'fa-caret-down',
			[FaIconType.SectionSeparator]: 'fa-diamond-half-stroke',
			[FaIconType.SetupReferenceNotes]: 'fa-memo',
			[FaIconType.SetupReferenceAdditionalCards]: 'fa-plus-square',
			[FaIconType.SetupReferenceSetupChanges]: 'fa-grid-round-2-plus',
			[FaIconType.SetupReferenceExplorationDeck]: 'fa-compass',
			[FaIconType.SetupReferenceSpectralDeck]: 'fa-ghost',
			[FaIconType.SetupReferenceConcealedMiniCards]: 'fa-eye-slash',
			[FaIconType.UpgradePlannerUpgradeTo]: 'fa-arrow-right',
			[FaIconType.UpgradePlannerAdd]: 'fa-plus',
			[FaIconType.UpgradePlannerXpUnlock]: 'fa-lock-open',
			[FaIconType.UpgradePlannerXpLock]: 'fa-lock',
			[FaIconType.Import]: 'fa-file-import',
			[FaIconType.Export]: 'fa-file-export',
			[FaIconType.Reset]: 'fa-rotate-left',
			[FaIconType.Add]: 'fa-circle-plus',
			[FaIconType.Edit]: 'fa-pen',
			[FaIconType.Back]: 'fa-arrow-left',
			[FaIconType.Clear]: 'fa-xmark',
			[FaIconType.CloseModal]: 'fa-xmark',
			[FaIconType.DeleteList]: 'fa-trash-can-list',
			[FaIconType.ExternalLink]: 'fa-arrow-up-right-from-square'
		};
		return iconMap[iconType];
	}

	const iconName = $derived(getIconName(icon));
	const styleClass = $derived(duotone ? 'fa-duotone-light' : 'fa-solid');
</script>

<i
	class={clsx(
		styleClass,
		iconName,
		spin && 'fa-spin',
		duotone ? 'fa-duotone' : 'fa-solid',
		invertColor && 'inverted',
		className
	)}
></i>

<style>
	.fa-duotone {
		--fa-primary-color: var(--color-primary-500);
		--fa-secondary-color: var(--color-primary-300);
	}

	:global(.dark) .fa-duotone {
		--fa-primary-color: var(--color-primary-400);
		--fa-secondary-color: var(--color-primary-600);
	}

	.fa-duotone.inverted {
		--fa-primary-color: var(--color-primary-300);
		--fa-secondary-color: var(--color-primary-500);
	}

	:global(.dark) .fa-duotone.inverted {
		--fa-primary-color: var(--color-primary-600);
		--fa-secondary-color: var(--color-primary-400);
	}
</style>
