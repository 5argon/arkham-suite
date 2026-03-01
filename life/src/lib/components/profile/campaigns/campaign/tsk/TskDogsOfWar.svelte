<!--
@component
TSK — Dogs of War. The shared scenario passport, plus room for bespoke Dogs of
War content below it.
-->
<script lang="ts">
	import TskScenarioInfo from '$lib/components/profile/campaigns/campaign/tsk/TskScenarioInfo.svelte';
	import type { TskScenarioWidgetProps } from '$lib/components/profile/campaigns/campaign/tsk/tsk-scenario';

	let props: TskScenarioWidgetProps = $props();
</script>

<TskScenarioInfo scenarioId="dogs_of_war" {...props} />
