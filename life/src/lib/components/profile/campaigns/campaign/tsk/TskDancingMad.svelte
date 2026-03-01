<!--
@component
TSK — Dancing Mad. The shared scenario passport, plus room for bespoke Dancing
Mad content below it.
-->
<script lang="ts">
	import TskScenarioInfo from '$lib/components/profile/campaigns/campaign/tsk/TskScenarioInfo.svelte';
	import type { TskScenarioWidgetProps } from '$lib/components/profile/campaigns/campaign/tsk/tsk-scenario';

	let props: TskScenarioWidgetProps = $props();
</script>

<TskScenarioInfo scenarioId="dancing_mad" {...props} />
