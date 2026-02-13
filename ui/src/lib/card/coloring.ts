import { cardClass, CardClass, type Card, type ClassSlots } from '@5argon/arkham-kohaku';

export function getCardColorClass(card: Card): string {
	let textColorClass: string;
	if (card.cardClass === undefined) {
		textColorClass = 'text-neutral-700 dark:text-neutral-300';
	} else {
		if (cardClass.isMulticlass(card.cardClass)) {
			textColorClass = 'text-multiclass-700 dark:text-multiclass-300';
		} else {
			switch (card.cardClass.class1) {
				case CardClass.Guardian:
					textColorClass = 'text-guardian-700 dark:text-guardian-300';
					break;
				case CardClass.Seeker:
					textColorClass = 'text-seeker-700 dark:text-seeker-300';
					break;
				case CardClass.Rogue:
					textColorClass = 'text-rogue-700 dark:text-rogue-300';
					break;
				case CardClass.Mystic:
					textColorClass = 'text-mystic-700 dark:text-mystic-300';
					break;
				case CardClass.Survivor:
					textColorClass = 'text-survivor-700 dark:text-survivor-300';
					break;
				case CardClass.Neutral:
					textColorClass = 'text-neutral-700 dark:text-neutral-300';
					break;
			}
		}
	}
	return textColorClass;
}

export function getCardColorClassBorder(card: Card): string {
	let borderColorClass: string;
	if (card.cardClass === undefined) {
		borderColorClass = 'border-neutral-700 dark:border-neutral-300';
	} else {
		if (cardClass.isMulticlass(card.cardClass)) {
			borderColorClass = 'border-multiclass-700 dark:border-multiclass-300';
		} else {
			switch (card.cardClass.class1) {
				case CardClass.Guardian:
					borderColorClass = 'border-guardian-700 dark:border-guardian-300';
					break;
				case CardClass.Seeker:
					borderColorClass = 'border-seeker-700 dark:border-seeker-300';
					break;
				case CardClass.Rogue:
					borderColorClass = 'border-rogue-700 dark:border-rogue-300';
					break;
				case CardClass.Mystic:
					borderColorClass = 'border-mystic-700 dark:border-mystic-300';
					break;
				case CardClass.Survivor:
					borderColorClass = 'border-survivor-700 dark:border-survivor-300';
					break;
				case CardClass.Neutral:
					borderColorClass = 'border-neutral-700 dark:border-neutral-300';
					break;
			}
		}
	}
	return borderColorClass;
}

export function getCardColorClassBackground(
	cardClassParam: ClassSlots | undefined,
	tone?: 'darker' | 'lighter'
): string {
	let bgColorClass: string;
	if (cardClassParam === undefined) {
		if (tone === 'darker') {
			bgColorClass = 'bg-neutral-200 dark:bg-neutral-900';
		} else if (tone === 'lighter') {
			bgColorClass = 'bg-neutral-400 dark:bg-neutral-600';
		} else {
			bgColorClass = 'bg-neutral-300 dark:bg-neutral-800';
		}
	} else {
		if (cardClass.isMulticlass(cardClassParam)) {
			if (tone === 'darker') {
				bgColorClass = 'bg-multiclass-200 dark:bg-multiclass-900';
			} else if (tone === 'lighter') {
				bgColorClass = 'bg-multiclass-400 dark:bg-multiclass-600';
			} else {
				bgColorClass = 'bg-multiclass-300 dark:bg-multiclass-800';
			}
		} else {
			switch (cardClassParam.class1) {
				case CardClass.Guardian:
					bgColorClass =
						tone === 'darker'
							? 'bg-guardian-200 dark:bg-guardian-900'
							: tone === 'lighter'
								? 'bg-guardian-400 dark:bg-guardian-600'
								: 'bg-guardian-300 dark:bg-guardian-800';
					break;
				case CardClass.Seeker:
					bgColorClass =
						tone === 'darker'
							? 'bg-seeker-200 dark:bg-seeker-900'
							: tone === 'lighter'
								? 'bg-seeker-400 dark:bg-seeker-600'
								: 'bg-seeker-300 dark:bg-seeker-800';
					break;
				case CardClass.Rogue:
					bgColorClass =
						tone === 'darker'
							? 'bg-rogue-200 dark:bg-rogue-900'
							: tone === 'lighter'
								? 'bg-rogue-400 dark:bg-rogue-600'
								: 'bg-rogue-300 dark:bg-rogue-800';
					break;
				case CardClass.Mystic:
					bgColorClass =
						tone === 'darker'
							? 'bg-mystic-200 dark:bg-mystic-900'
							: tone === 'lighter'
								? 'bg-mystic-400 dark:bg-mystic-600'
								: 'bg-mystic-300 dark:bg-mystic-800';
					break;
				case CardClass.Survivor:
					bgColorClass =
						tone === 'darker'
							? 'bg-survivor-200 dark:bg-survivor-900'
							: tone === 'lighter'
								? 'bg-survivor-400 dark:bg-survivor-600'
								: 'bg-survivor-300 dark:bg-survivor-800';
					break;
				case CardClass.Neutral:
					bgColorClass =
						tone === 'darker'
							? 'bg-neutral-200 dark:bg-neutral-900'
							: tone === 'lighter'
								? 'bg-neutral-400 dark:bg-neutral-600'
								: 'bg-neutral-300 dark:bg-neutral-800';
					break;
			}
		}
	}
	return bgColorClass;
}
