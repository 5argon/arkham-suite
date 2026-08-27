<script lang="ts">
	import { goto, replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		BorderedContainer,
		Button,
		FaIconType,
		MarginText,
		PageLead
	} from '@5argon/arkham-life-ui';

	import { getAllCards } from '$lib/card-data';
	import * as m from '$lib/paraglide/messages.js';
	import { getFromStorage, removeFromStorage, saveToStorage, STORAGE_KEYS } from '$lib/storage';
	import { decodeEvergreen, encodeEvergreen } from '$lib/tool/evergreen-team/codec';
	import { defaultTeamInfo } from '$lib/tool/evergreen-team/team-info';
	import type { EvergreenSetup, EvergreenState } from '$lib/tool/evergreen-team/types';

	import PlanningPhase from './planning/PlanningPhase.svelte';
	import SetupPhase from './setup/SetupPhase.svelte';

	interface Prop {
		/**
		 * State decoded from a shared ?t= link; null starts at the setup phase.
		 */
		restored: EvergreenState | null;
	}
	const { restored }: Prop = $props();

	const getInitial = () => restored;
	let planningState = $state<EvergreenState | null>(getInitial());
	const getInitialSavedDraft = () =>
		restored === null ? getFromStorage<string | null>(STORAGE_KEYS.EVERGREEN_DRAFT, null) : null;
	let savedDraft = $state<string | null>(getInitialSavedDraft());

	/**
	 * Called from event handlers after every mutation: keeps ?t= current so
	 * refresh never loses work, and autosaves to this browser.
	 */
	function persist() {
		if (planningState === null) return;
		const encoded = encodeEvergreen($state.snapshot(planningState) as EvergreenState);
		replaceState(`?t=${encoded}`, {});
		saveToStorage(STORAGE_KEYS.EVERGREEN_DRAFT, encoded);
	}

	function handleProceed(setup: EvergreenSetup) {
		planningState = {
			setup,
			decks: setup.investigators.map((investigator) => ({ investigator, main: {}, side: {} })),
			pickMode: 'max',
			mergeProducts: false,
			info: defaultTeamInfo()
		};
		savedDraft = null;
		persist();
	}

	function continueSaved() {
		if (savedDraft === null) return;
		const decoded = decodeEvergreen(savedDraft, getAllCards());
		savedDraft = null;
		if (decoded === null) {
			removeFromStorage(STORAGE_KEYS.EVERGREEN_DRAFT);
			return;
		}
		planningState = decoded;
		persist();
	}

	function discardSaved() {
		savedDraft = null;
		removeFromStorage(STORAGE_KEYS.EVERGREEN_DRAFT);
	}

	function handleDeleteTeam() {
		if (!window.confirm(m.tool_evergreen_team_delete_team_confirm())) return;
		planningState = null;
		savedDraft = null;
		removeFromStorage(STORAGE_KEYS.EVERGREEN_DRAFT);
		goto(resolve('/tool/team-builder', {}));
	}
</script>

<PageLead description={m.tool_evergreen_team_description()} title={m.tool_evergreen_team_title()} />

{#if planningState === null}
	{#if savedDraft !== null}
		<MarginText>
			<div class="mb-4">
				<BorderedContainer>
					<div class="flex flex-col items-center gap-2 p-1">
						<span class="text-primary-900 dark:text-primary-100">
							{m.tool_evergreen_team_continue_saved()}
						</span>
						<div class="flex flex-nowrap items-center gap-3">
							<Button
								highlighted
								icon={FaIconType.Import}
								label={m.tool_evergreen_team_continue_button()}
								onClick={continueSaved}
							/>
							<Button
								danger
								icon={FaIconType.Delete}
								label={m.tool_evergreen_team_discard_button()}
								onClick={discardSaved}
							/>
						</div>
					</div>
				</BorderedContainer>
			</div>
		</MarginText>
	{/if}
	<SetupPhase onProceed={handleProceed} />
{:else}
	<PlanningPhase team={planningState} onDeleteTeam={handleDeleteTeam} onChange={persist} />
{/if}
