import { campaignRenderers } from '$lib/components/profile/_framework/widget-renderer';
import TfaBoundaryBeyond from './TfaBoundaryBeyond.svelte';
import TfaCityOfArchives from './TfaCityOfArchives.svelte';
import TfaCompanions from './TfaCompanions.svelte';
import TfaDepthsOfYoth from './TfaDepthsOfYoth.svelte';
import TfaDoomOfEztli from './TfaDoomOfEztli.svelte';
import TfaHarbinger from './TfaHarbinger.svelte';
import TfaHeartOfElders from './TfaHeartOfElders.svelte';
import TfaPoison from './TfaPoison.svelte';
import TfaShatteredAeons from './TfaShatteredAeons.svelte';
import TfaSupplies from './TfaSupplies.svelte';
import TfaThreadsOfFate from './TfaThreadsOfFate.svelte';
import TfaTurnBackTime from './TfaTurnBackTime.svelte';
import TfaUntamedWilds from './TfaUntamedWilds.svelte';
import TfaVengeance from './TfaVengeance.svelte';

export default campaignRenderers('tfa', {
	tfaVengeance: TfaVengeance,
	tfaSupplies: TfaSupplies,
	tfaCompanions: TfaCompanions,
	tfaHarbinger: TfaHarbinger,
	tfaPoison: TfaPoison,
	tfaWilds: TfaUntamedWilds,
	tfaEztli: TfaDoomOfEztli,
	tfaThreads: TfaThreadsOfFate,
	tfaBoundary: TfaBoundaryBeyond,
	tfaHote: TfaHeartOfElders,
	tfaArchives: TfaCityOfArchives,
	tfaYoth: TfaDepthsOfYoth,
	tfaAeons: TfaShatteredAeons,
	tfaTurnBackTime: TfaTurnBackTime
});
