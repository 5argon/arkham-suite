<!--
@component
TSK — Riddles and Rain. The shared scenario passport, plus room for bespoke
Riddles and Rain content below it.
-->
<script lang="ts">
	import TskScenarioInfo from '$lib/components/profile/campaigns/campaign/tsk/TskScenarioInfo.svelte';
	import type { TskScenarioWidgetProps } from '$lib/components/profile/campaigns/campaign/tsk/tsk-scenario';

	let props: TskScenarioWidgetProps = $props();
</script>

<TskScenarioInfo scenarioId="riddles_and_rain" {...props} />
