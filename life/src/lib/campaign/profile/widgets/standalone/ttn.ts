/** Traces to Nowhere's own widgets and its page layout. */
import * as m from '$lib/paraglide/messages.js';
import { full, split, standaloneWidgets } from '../../widget-def';

export default standaloneWidgets(
	'side.ttn',
	[{ id: 'ttnCulprit', label: m.standalone_ttn_culprit_title, scenario: 'ttn' }],
	() => [
		split('standaloneOverview', 'standaloneReward'),
		full('ttnCulprit'),
		split('standaloneSources', 'standaloneDeckXp'),
		full('standalonePlays')
	]
);
