import { CardClass, type Deck } from '@5argon/arkham-kohaku';

/**
 * Whether every investigator in a proposed team has a different primary class.
 */
export function hasUniqueInvestigatorClasses(decks: readonly Deck[]): boolean {
	const classes = decks.map((deck) => deck.investigator.cardClass?.class1 ?? CardClass.Neutral);
	return new Set(classes).size === classes.length;
}
