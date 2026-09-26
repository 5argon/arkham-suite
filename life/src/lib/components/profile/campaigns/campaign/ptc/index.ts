import { campaignRenderers } from '$lib/components/profile/_framework/widget-renderer';
import PtcBlackStarsRise from './PtcBlackStarsRise.svelte';
import PtcChaosTokens from './PtcChaosTokens.svelte';
import PtcCurtainCall from './PtcCurtainCall.svelte';
import PtcDimCarcosa from './PtcDimCarcosa.svelte';
import PtcDoubtConviction from './PtcDoubtConviction.svelte';
import PtcEchoes from './PtcEchoes.svelte';
import PtcLastKing from './PtcLastKing.svelte';
import PtcLostSoul from './PtcLostSoul.svelte';
import PtcPallidMask from './PtcPallidMask.svelte';
import PtcPhantom from './PtcPhantom.svelte';
import PtcStranger from './PtcStranger.svelte';
import PtcUnspeakableOath from './PtcUnspeakableOath.svelte';
import PtcVips from './PtcVips.svelte';

export default campaignRenderers('ptc', {
	ptcDoubtConviction: PtcDoubtConviction,
	ptcVips: PtcVips,
	ptcStranger: PtcStranger,
	ptcChaosTokens: PtcChaosTokens,
	ptcCurtainCall: PtcCurtainCall,
	ptcLastKing: PtcLastKing,
	ptcEchoes: PtcEchoes,
	ptcUnspeakableOath: PtcUnspeakableOath,
	ptcLostSoul: PtcLostSoul,
	ptcPhantom: PtcPhantom,
	ptcPallidMask: PtcPallidMask,
	ptcBlackStarsRise: PtcBlackStarsRise,
	ptcDimCarcosa: PtcDimCarcosa
});
