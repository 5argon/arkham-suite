/**
 * Side-story Extra choices ArkhamCards records somewhere other than a choose-one step.
 * See lib/extras.mjs for the context each function receives.
 */

export const choices = {
	/** Asked in Part II (`ask_completed_tasks`), which merges into the Fortune and Folly entry. */
	'fortune_and_folly_part_1.completed_tasks': ({ inputs }) => {
		const answer = inputs.filter((i) => i.step === 'ask_completed_tasks' && i.type === 'count').at(-1);
		return answer ? String(answer.payload?.count ?? 0) : undefined;
	}
};
