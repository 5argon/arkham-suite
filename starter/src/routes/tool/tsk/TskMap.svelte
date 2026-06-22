<script lang="ts">
	import { loadLogic, locationName, metadata, shortestPath, type CampaignState, type PlanTrajectory } from '@5argon/arkham-tsk-solver';
	import { drawnLegs, type RouteLeg } from './mapRender';

	// `onNodeClick` makes nodes clickable (the per-step destination picker); the overview map omits it.
	// `untilStep` limits the drawn course to the first N steps (the route up to a step's departure).
	// `fromState` (picker mode) gives the departure location + unlocked subgraph for the hover preview.
	let { trajectory, onNodeClick, untilStep, fromState }: { trajectory: PlanTrajectory; onNodeClick?: (locationId: string) => void; untilStep?: number; fromState?: CampaignState } = $props();

	const img = loadLogic().mapImage;
	const W = img.width;
	const H = img.height;
	const locations = Object.entries(loadLogic().locations);

	const startLocation = metadata().startLocation;
	const currentLocation = $derived(fromState?.location ?? startLocation);

	const drawnSteps = $derived(untilStep === undefined ? trajectory.steps : trajectory.steps.slice(0, untilStep));
	const legs = $derived.by<RouteLeg[]>(() => {
		const out: RouteLeg[] = [];
		let prev = startLocation;
		for (const s of drawnSteps) {
			out.push({ from: prev, to: s.location, ticket: !!s.usedTicket });
			prev = s.location;
		}
		return out;
	});
	const polylines = $derived(drawnLegs(legs));
	const visited = $derived(new Set<string>([startLocation, ...drawnSteps.map((s) => s.location)]));

	// Hover preview: the hop-by-hop shortest trip from the current position to the hovered node.
	let hoverNode = $state<string | null>(null);
	const previewPath = $derived(onNodeClick && fromState && hoverNode && hoverNode !== currentLocation ? shortestPath(fromState.unlocked, currentLocation, hoverNode) : []);
	const previewPolylines = $derived(previewPath.length > 1 ? drawnLegs(previewPath.slice(0, -1).map((n, i) => ({ from: n, to: previewPath[i + 1]! }))) : []);
	const previewHops = $derived(previewPath.length > 1 ? previewPath.length - 1 : 0);

	const MARKER_FILL: Record<string, string> = { scenario: '#1e7bff', locked: '#ff2424', sideStory: '#14d63a', secret: '#c81fff' };
	const pts = (pp: { x: number; y: number }[]) => pp.map((p) => `${(p.x * W).toFixed(1)},${(p.y * H).toFixed(1)}`).join(' ');
	const src = '/image/tsk/scarlet_keys_map.webp';
	const px = (id: string) => loadLogic().locations[id]!.position.x * W;
	const py = (id: string) => loadLogic().locations[id]!.position.y * H;
</script>

<div class="relative w-full overflow-hidden rounded-lg border border-primary-200 dark:border-primary-800" style="aspect-ratio: {W} / {H}">
	<img {src} alt="The Scarlet Keys world map" class="absolute inset-0 h-full w-full object-fill" loading="lazy" />
	<svg class="absolute inset-0 h-full w-full" viewBox="0 0 {W} {H}" role="img" aria-label="Planned course">
		<defs>
			<marker id="tsk-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
				<path d="M0,0 L10,5 L0,10 z" fill="#ffd000" />
			</marker>
			<marker id="tsk-arrow-preview" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
				<path d="M0,0 L10,5 L0,10 z" fill="#00ccff" />
			</marker>
		</defs>
		<!-- planned course -->
		{#each polylines as leg, i (i)}
			<polyline points={pts(leg.points)} fill="none" stroke={leg.ticket ? '#ff19d4' : '#ffd000'} stroke-width="14" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray={leg.ticket ? '36 28' : undefined} marker-end="url(#tsk-arrow)" opacity="0.9" />
		{/each}
		<!-- hover preview (hop-by-hop trip to the hovered node) -->
		{#each previewPolylines as leg, i (i)}
			<polyline points={pts(leg.points)} fill="none" stroke="#00ccff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4 26" marker-end="url(#tsk-arrow-preview)" />
		{/each}
		<!-- nodes -->
		{#each locations as [id, loc] (id)}
			{@const on = visited.has(id)}
			{@const cur = currentLocation === id && !!fromState}
			{@const inPreview = previewPath.includes(id)}
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<g
				role={onNodeClick ? 'button' : undefined}
				tabindex={onNodeClick ? 0 : undefined}
				class={onNodeClick ? 'cursor-pointer' : ''}
				onclick={() => onNodeClick?.(id)}
				onkeydown={(e) => e.key === 'Enter' && onNodeClick?.(id)}
				onmouseenter={() => onNodeClick && (hoverNode = id)}
				onmouseleave={() => onNodeClick && (hoverNode = null)}
			>
				<title>{locationName(id)}</title>
				{#if onNodeClick}<circle cx={loc.position.x * W} cy={loc.position.y * H} r="60" fill="transparent" />{/if}
				{#if cur}<circle cx={loc.position.x * W} cy={loc.position.y * H} r="40" fill="none" stroke="#14d63a" stroke-width="9" />{/if}
				{#if on && !cur}<circle cx={loc.position.x * W} cy={loc.position.y * H} r="30" fill="none" stroke="#ffd000" stroke-width="6" />{/if}
				{#if inPreview && !cur}<circle cx={loc.position.x * W} cy={loc.position.y * H} r="26" fill="none" stroke="#00ccff" stroke-width="6" />{/if}
				<circle cx={loc.position.x * W} cy={loc.position.y * H} r={onNodeClick ? 20 : 16} fill={MARKER_FILL[loc.markerType] ?? '#64748b'} stroke="white" stroke-width="3" />
			</g>
		{/each}
		<!-- hovered destination: trip cost label -->
		{#if hoverNode && previewHops > 0}
			<g pointer-events="none">
				<rect x={px(hoverNode) - 52} y={py(hoverNode) - 78} width="104" height="40" rx="8" fill="#00ccff" />
				<text x={px(hoverNode)} y={py(hoverNode) - 50} text-anchor="middle" fill="white" font-size="28" font-weight="700">+{previewHops} time</text>
			</g>
		{/if}
	</svg>
</div>
<div class="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-primary-500 dark:text-primary-400">
	<span><span class="inline-block h-2 w-2 rounded-full align-middle" style="background:#1e7bff"></span> scenario</span>
	<span><span class="inline-block h-2 w-2 rounded-full align-middle" style="background:#ff2424"></span> locked</span>
	<span><span class="inline-block h-2 w-2 rounded-full align-middle" style="background:#14d63a"></span> side story</span>
	<span><span class="inline-block h-2 w-2 rounded-full align-middle" style="background:#c81fff"></span> secret</span>
	<span><span class="inline-block h-1 w-4 align-middle" style="background:#ffd000"></span> route</span>
	<span><span class="inline-block h-1 w-4 align-middle" style="background:#ff19d4"></span> ticket warp</span>
	{#if onNodeClick}<span><span class="inline-block h-1 w-4 align-middle" style="background:#00ccff"></span> hover preview</span>{/if}
</div>
