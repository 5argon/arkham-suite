<script lang="ts">
	import { loadLogic, locationName, mapRoute, metadata, shortestPath, type CampaignState, type PlanTrajectory, type RouteStop } from '@5argon/arkham-tsk-solver';
	import { drawnLegs, routeColor, type EdgeLeg } from './mapRender';

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

	// Hop-by-hop course (legs threaded through real intermediate nodes), stops vs pass-throughs, order.
	const route = $derived(mapRoute(trajectory, untilStep));
	// Each stop-to-stop leg → one drawable edge per hop; the arrowhead sits on the leg's final hop only.
	const edgeLegs = $derived.by<EdgeLeg[]>(() => {
		const out: EdgeLeg[] = [];
		for (const leg of route.legs) {
			if (leg.ticket) {
				out.push({ from: leg.from, to: leg.to, ticket: true, order: leg.order, arrow: true });
			} else {
				for (let k = 0; k < leg.hops.length - 1; k++) {
					out.push({ from: leg.hops[k]!, to: leg.hops[k + 1]!, order: leg.order, arrow: k === leg.hops.length - 2 });
				}
			}
		}
		return out;
	});
	const polylines = $derived(drawnLegs(edgeLegs));

	// Stops keyed by node (a node revisited across steps holds several); the pure pass-through set.
	const stopsByNode = $derived.by(() => {
		const m = new Map<string, RouteStop[]>();
		for (const st of route.stops) {
			const arr = m.get(st.node);
			if (arr) arr.push(st);
			else m.set(st.node, [st]);
		}
		return m;
	});
	const passThrough = $derived(new Set(route.passThrough));
	/** Travel-order progress (0..1) for the gradient: stop #1 = 0, last stop = 1. */
	const prog = (order: number) => (route.stopCount > 1 ? (order - 1) / (route.stopCount - 1) : 1);

	// Hover preview: the hop-by-hop shortest trip from the current position to the hovered node.
	let hoverNode = $state<string | null>(null);
	const previewPath = $derived(onNodeClick && fromState && hoverNode && hoverNode !== currentLocation ? shortestPath(fromState.unlocked, currentLocation, hoverNode) : []);
	const previewPolylines = $derived(previewPath.length > 1 ? drawnLegs(previewPath.slice(0, -1).map((n, i) => ({ from: n, to: previewPath[i + 1]!, arrow: i === previewPath.length - 2 }))) : []);
	const previewHops = $derived(previewPath.length > 1 ? previewPath.length - 1 : 0);

	const MARKER_FILL: Record<string, string> = { scenario: '#1e7bff', locked: '#ff2424', sideStory: '#14d63a', secret: '#c81fff' };
	const pts = (pp: { x: number; y: number }[]) => pp.map((p) => `${(p.x * W).toFixed(1)},${(p.y * H).toFixed(1)}`).join(' ');
	const src = '/image/tsk/scarlet_keys_map.webp';
	const px = (id: string) => loadLogic().locations[id]!.position.x * W;
	const py = (id: string) => loadLogic().locations[id]!.position.y * H;

	// Arrowhead drawn as a plain triangle (in map px) at a leg's tip, pointing along its final segment.
	// Done by hand rather than an SVG <marker> so it can take the leg's gradient colour and a fixed
	// size (a stroke-width-scaled marker rendered far too large, and `context-stroke` fell back to black).
	const ARROW_LEN = 30;
	function arrowHead(pp: { x: number; y: number }[], len = ARROW_LEN, inset = 36): string {
		if (pp.length < 2) return '';
		const tip = pp[pp.length - 1]!;
		const prev = pp[pp.length - 2]!;
		const dx = (tip.x - prev.x) * W;
		const dy = (tip.y - prev.y) * H;
		const d = Math.hypot(dx, dy) || 1e-6;
		const ux = dx / d;
		const uy = dy / d;
		// Pull the tip back from the node centre so it reads just outside the destination circle.
		const tx = tip.x * W - ux * inset;
		const ty = tip.y * H - uy * inset;
		const bx = tx - ux * len;
		const by = ty - uy * len;
		const half = len * 0.6;
		const nx = -uy;
		const ny = ux;
		return `${tx.toFixed(1)},${ty.toFixed(1)} ${(bx + nx * half).toFixed(1)},${(by + ny * half).toFixed(1)} ${(bx - nx * half).toFixed(1)},${(by - ny * half).toFixed(1)}`;
	}
</script>

<div class="relative w-full overflow-hidden rounded-lg border border-primary-200 dark:border-primary-800" style="aspect-ratio: {W} / {H}">
	<img {src} alt="The Scarlet Keys world map" class="absolute inset-0 h-full w-full object-fill" loading="lazy" />
	<svg class="absolute inset-0 h-full w-full" viewBox="0 0 {W} {H}" role="img" aria-label="Planned course">
		<!-- planned course: one polyline per hop, shaded by travel order (early = amber, late = gold) -->
		{#each polylines as leg, i (i)}
			<polyline points={pts(leg.points)} fill="none" stroke={routeColor(prog(leg.order), leg.ticket)} stroke-width="14" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray={leg.ticket ? '36 28' : undefined} opacity="0.92" />
			{#if leg.arrow}
				<polygon points={arrowHead(leg.points)} fill={routeColor(prog(leg.order), leg.ticket)} opacity="0.92" />
			{/if}
		{/each}
		<!-- hover preview (hop-by-hop trip to the hovered node) -->
		{#each previewPolylines as leg, i (i)}
			<polyline points={pts(leg.points)} fill="none" stroke="#00ccff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4 26" />
			{#if leg.arrow}
				<polygon points={arrowHead(leg.points, 26)} fill="#00ccff" />
			{/if}
		{/each}
		<!-- nodes -->
		{#each locations as [id, loc] (id)}
			{@const stopsHere = stopsByNode.get(id)}
			{@const cur = currentLocation === id && !!fromState}
			{@const through = passThrough.has(id)}
			{@const inPreview = previewPath.includes(id)}
			{@const cx = loc.position.x * W}
			{@const cy = loc.position.y * H}
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
				{#if onNodeClick}<circle {cx} {cy} r="60" fill="transparent" />{/if}
				{#if cur}<circle {cx} {cy} r="40" fill="none" stroke="#14d63a" stroke-width="9" />{/if}
				{#if stopsHere && !cur}<circle {cx} {cy} r="32" fill="none" stroke={routeColor(prog(stopsHere[0]!.order))} stroke-width="9" />{/if}
				{#if through && !cur}<circle {cx} {cy} r="22" fill="none" stroke="#fcd34d" stroke-width="6" stroke-dasharray="6 10" opacity="0.85" />{/if}
				{#if inPreview && !cur}<circle {cx} {cy} r="26" fill="none" stroke="#00ccff" stroke-width="6" />{/if}
				<circle {cx} {cy} r={onNodeClick ? 20 : 16} fill={MARKER_FILL[loc.markerType] ?? '#64748b'} stroke="white" stroke-width="3" />
				{#if stopsHere}
					{@const labels = stopsHere.map((s) => s.order).join('·')}
					{@const bw = Math.max(50, labels.length * 26 + 26)}
					<g pointer-events="none">
						<rect x={cx + 34 - bw / 2} y={cy - 69} width={bw} height="50" rx="25" fill={routeColor(prog(stopsHere[0]!.order))} stroke="white" stroke-width="3" />
						<text x={cx + 34} y={cy - 44} text-anchor="middle" dominant-baseline="central" fill="white" font-size="40" font-weight="700">{labels}</text>
					</g>
				{/if}
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
	<span><span class="inline-block h-1 w-5 align-middle" style="background:linear-gradient(to right,#d97706,#fde047)"></span> route (1 → last)</span>
	<span><span class="inline-block h-1 w-5 align-middle" style="background:#ff19d4"></span> ticket warp</span>
	<span><span class="inline-block h-3 w-3 rounded-full align-middle" style="border:2px solid #d97706"></span> stop (numbered)</span>
	<span><span class="inline-block h-3 w-3 rounded-full align-middle" style="border:2px dashed #fcd34d"></span> pass-through</span>
	{#if onNodeClick}<span><span class="inline-block h-1 w-5 align-middle" style="background:#00ccff"></span> hover preview</span>{/if}
</div>
