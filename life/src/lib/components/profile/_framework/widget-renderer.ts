import type { Component } from 'svelte';
import type { BespokeBlobs, BespokeFamily } from '$lib/campaign/campaigns/registry';
import type { WidgetSlot } from '$lib/campaign/profile/profile-settings';
import type { WidgetDef } from '$lib/campaign/profile/widget-def';
import type { ProfilePayload } from '$lib/profile/profile-types';
import type { CampaignWidgetProps, WidgetContext } from './widget-context';

/** Everything a renderer may read to build its component's props. */
export interface RenderContext {
	payload: ProfilePayload;
	def: WidgetDef;
	slot: WidgetSlot;
	/** Set on a campaign detail page. */
	family: string | null;
	/** Set on a class detail page. */
	classFilter: string | null;
	ctx: WidgetContext;
	/** The page campaign's aggregate. */
	blob: unknown;
	/** Rows of the page's campaign, or every row on an aggregate page. */
	slice<T extends { family: string }>(rows: T[]): T[];
	/** The page campaign's row. */
	pick<T extends { family: string }>(rows: T[]): T | null;
}

export interface WidgetRenderer {
	// The props builder is typed against the component where the renderer is declared.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	component: Component<any>;
	props: (c: RenderContext) => object;
	/** Overrides the catalogue label, e.g. to add a count. */
	title?: (c: RenderContext) => string;
}

export function widget<P extends object>(
	component: Component<P>,
	props: (c: RenderContext) => P,
	title?: (c: RenderContext) => string
): WidgetRenderer {
	return { component: component as Component<object>, props, title };
}

type CampaignEntry<B> =
	| Component<CampaignWidgetProps<B>>
	| { component: Component<CampaignWidgetProps<B>>; props?: object; title?: (c: RenderContext, blob: B | null) => string };

/** A campaign widget whose component also takes fixed props, e.g. which villager it shows. */
export function withProps<B, E extends object>(
	component: Component<CampaignWidgetProps<B> & E>,
	props: E
): { component: Component<CampaignWidgetProps<B>>; props: E } {
	return { component: component as unknown as Component<CampaignWidgetProps<B>>, props };
}

/** Renderers for one campaign's widgets, each given the family's aggregate and the slot context. */
export function campaignRenderers<F extends BespokeFamily>(
	_family: F,
	entries: Record<string, CampaignEntry<NonNullable<BespokeBlobs[F]>>>
): Record<string, WidgetRenderer> {
	type B = NonNullable<BespokeBlobs[F]>;
	return Object.fromEntries(
		Object.entries(entries).map(([id, entry]) => {
			const { component, props, title } =
				typeof entry === 'function' ? { component: entry, props: undefined, title: undefined } : entry;
			const renderer: WidgetRenderer = {
				component: component as Component<object>,
				props: (c) => ({ ...props, blob: c.blob as B | null, ctx: c.ctx }),
				title: title && ((c) => title(c, c.blob as B | null))
			};
			return [id, renderer];
		})
	);
}
