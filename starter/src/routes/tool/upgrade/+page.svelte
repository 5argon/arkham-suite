<script lang="ts">
	import UpgradeLayout from '$lib/design/pages/tool/upgrade/layout/UpgradeLayout.svelte';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import { getAllCards, loadAllTabooLists } from '$lib/card-data';
	import help from '$lib/md/upgrade.md?raw';
	import * as m from '$lib/paraglide/messages.js';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const cards = getAllCards();
	const tabooLists = loadAllTabooLists();
</script>

<OpenGraph
	description="Plan out how you progress your deck throughout the campaign with automatic XP calculations in each step."
	image="image/resource/upgrade.webp"
	title="Upgrade Planner"
	url="/tool/upgrade"
/>

<UpgradeLayout
	{cards}
	helpMd={help}
	pageTitle={m.tool_upgrade_title()}
	restoreResult={data.restoreResult}
	{tabooLists}
/>
