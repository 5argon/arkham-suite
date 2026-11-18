import { WIDGET_CATALOGUE, type WidgetDef } from '$lib/campaign/profile/profile-widgets';
import * as m from '$lib/paraglide/messages.js';
import { SHARED_RENDERERS } from './shared-renderers';
import type { WidgetRenderer } from './widget-renderer';
import dwl from '../campaigns/campaign/dwl';
import eote from '../campaigns/campaign/eote';
import fhv from '../campaigns/campaign/fhv';
import notz from '../campaigns/campaign/notz';
import ptc from '../campaigns/campaign/ptc';
import tcu from '../campaigns/campaign/tcu';
import tdc from '../campaigns/campaign/tdc';
import tdea from '../campaigns/campaign/tdea';
import tdeb from '../campaigns/campaign/tdeb';
import tfa from '../campaigns/campaign/tfa';
import tic from '../campaigns/campaign/tic';
import tsk from '../campaigns/campaign/tsk';

/** Every catalogue widget's renderer, by widget id. */
export const WIDGET_RENDERERS: Record<string, WidgetRenderer> = {
	...SHARED_RENDERERS,
	...notz,
	...dwl,
	...ptc,
	...tfa,
	...tcu,
	...tdea,
	...tdeb,
	...tic,
	...eote,
	...tsk,
	...fhv,
	...tdc
};

/** Catalogue ids with no renderer; kept empty by a test. */
export const UNRENDERED_WIDGETS = WIDGET_CATALOGUE.filter((w) => !WIDGET_RENDERERS[w.id]).map(
	(w) => w.id
);

/** The frame title when the renderer has none: the catalogue label, with the class on a class page. */
export function defaultWidgetTitle(def: WidgetDef, classFilter: string | null): string {
	if (classFilter && def.classLabel && !def.variantClass)
		return def.classLabel({ cls: m.shared_class({ class: classFilter }) });
	return def.label();
}
