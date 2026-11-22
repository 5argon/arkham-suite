import { standaloneRenderers } from '../../_framework/widget-renderer';
import BlobDevoured from './BlobDevoured.svelte';
import CohRevelers from './CohRevelers.svelte';
import EncoreUpgrades from './EncoreUpgrades.svelte';
import FilmFilms from './FilmFilms.svelte';
import FofHeist from './FofHeist.svelte';
import FofStakeout from './FofStakeout.svelte';
import LolGroups from './LolGroups.svelte';
import MehCulprit from './MehCulprit.svelte';
import MehMonroe from './MehMonroe.svelte';
import MomDistricts from './MomDistricts.svelte';
import MttVariants from './MttVariants.svelte';
import MwgFactions from './MwgFactions.svelte';
import MwgScore from './MwgScore.svelte';
import TesDreamers from './TesDreamers.svelte';

export default {
	...standaloneRenderers('side.fortune_and_folly_part_1', {
		fofHeist: FofHeist,
		fofStakeout: FofStakeout
	}),
	...standaloneRenderers('side.the_midwinter_gala', {
		mwgScore: MwgScore,
		mwgFactions: MwgFactions
	}),
	...standaloneRenderers('side.carnevale_of_horrors', { cohRevelers: CohRevelers }),
	...standaloneRenderers('side.the_eternal_slumber', { tesDreamers: TesDreamers }),
	...standaloneRenderers('side.murder_at_the_excelsior_hotel', {
		mehCulprit: MehCulprit,
		mehMonroe: MehMonroe
	}),
	...standaloneRenderers('side.film_fatale', { filmFilms: FilmFilms }),
	...standaloneRenderers('side.blob_that_ate_everything', { blobDevoured: BlobDevoured }),
	...standaloneRenderers('side.blob_that_ate_everything_else', { blobElseDevoured: BlobDevoured }),
	...standaloneRenderers('side.in_the_labyrinths_of_lunacy', { lolGroups: LolGroups }),
	...standaloneRenderers('side.meddling_of_meowlathotep', { momDistricts: MomDistricts }),
	...standaloneRenderers('side.machinations_through_time', { mttVariants: MttVariants }),
	...standaloneRenderers('side.enthralling_encore', { encUpgrades: EncoreUpgrades })
};
