import { campaignRenderers, withProps } from '$lib/components/profile/_framework/widget-renderer';
import TskCongressOfTheKeys from './TskCongressOfTheKeys.svelte';
import TskDeadHeat from './TskDeadHeat.svelte';
import TskDealingsInTheDark from './TskDealingsInTheDark.svelte';
import TskErasedFromExistence from './TskErasedFromExistence.svelte';
import TskKeyQuest from './TskKeyQuest.svelte';
import TskKeysWall from './TskKeysWall.svelte';
import TskRoutings from './TskRoutings.svelte';
import TskSanguineShadows from './TskSanguineShadows.svelte';
import TskSideQuests from './TskSideQuests.svelte';
import TskStatScenario from './TskStatScenario.svelte';
import TskTheTrial from './TskTheTrial.svelte';
import TskTokenBalance from './TskTokenBalance.svelte';
import TskTrustDeception from './TskTrustDeception.svelte';

export default campaignRenderers('tskc', {
	tskKeysObtained: withProps(TskKeysWall, { mode: 'obtained' as const }),
	tskKeysBearer: withProps(TskKeysWall, { mode: 'bearer' as const }),
	tskRoutes: TskRoutings,
	tskTrustDeception: TskTrustDeception,
	tskTokenBalance: TskTokenBalance,
	tskTrial: TskTheTrial,
	tskErased: TskErasedFromExistence,
	tskBaleEngine: withProps(TskKeyQuest, { quest: 'baleEngine' as const }),
	tskRuinousChime: withProps(TskKeyQuest, { quest: 'ruinousChime' as const }),
	tskSideQuests: TskSideQuests,
	tskScenario_riddles_and_rain: TskStatScenario,
	tskScenario_dead_heat: TskDeadHeat,
	tskScenario_sanguine_shadows: TskSanguineShadows,
	tskScenario_dealings_in_the_dark: TskDealingsInTheDark,
	tskScenario_dancing_mad: TskStatScenario,
	tskScenario_on_thin_ice: TskStatScenario,
	tskScenario_dogs_of_war: TskStatScenario,
	tskScenario_shades_of_suffering: TskStatScenario,
	tskScenario_without_a_trace: TskStatScenario,
	tskScenario_congress_of_the_keys: TskCongressOfTheKeys
});
