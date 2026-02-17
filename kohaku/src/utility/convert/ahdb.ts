/**
 * Conversion functions from external AHDB (ArkhamDB) data format to Kohaku internal types.
 */

import { CardClass } from '../../type/game/card-class.js';
import { CardType, WeaknessType } from '../../type/game/card-type.js';
import { EncounterSet } from '../../type/game/encounter-set.js';
import { Product } from '../../type/game/product.js';
import { Slot } from '../../type/game/slot.js';

export function encounterSetToEncounterSet(ahdbEncounterSet: string): EncounterSet {
  switch (ahdbEncounterSet) {
    // Core Set
    case 'agents_of_cthulhu':
      return EncounterSet.AgentsOfCthulhu;
    case 'agents_of_hastur':
      return EncounterSet.AgentsOfHastur;
    case 'agents_of_shub':
      return EncounterSet.AgentsOfShubniggurath;
    case 'agents_of_yog':
      return EncounterSet.AgentsOfYogsothoth;
    case 'ancient_evils':
      return EncounterSet.AncientEvils;
    case 'chilling_cold':
      return EncounterSet.ChillingCold;
    case 'cultists':
      return EncounterSet.CultOfUmrdhoth;
    case 'pentagram':
      return EncounterSet.DarkCult;
    case 'ghouls':
      return EncounterSet.Ghouls;
    case 'locked_doors':
      return EncounterSet.LockedDoors;
    case 'nightgaunts':
      return EncounterSet.Nightgaunts;
    case 'rats':
      return EncounterSet.Rats;
    case 'striking_fear':
      return EncounterSet.StrikingFear;
    case 'tentacles':
      return EncounterSet.TheDevourerBelow;
    case 'torch':
      return EncounterSet.TheGathering;
    case 'arkham':
      return EncounterSet.TheMidnightMasks;

    // The Dunwich Legacy
    case 'armitages_fate':
      return EncounterSet.ArmitagesFate;
    case 'bad_luck':
      return EncounterSet.BadLuck;
    case 'beast_thralls':
      return EncounterSet.BeastThralls;
    case 'bishops_thralls':
      return EncounterSet.BishopsThralls;
    case 'blood_on_the_altar':
      return EncounterSet.BloodOnTheAltar;
    case 'dunwich':
      return EncounterSet.Dunwich;
    case 'essex_county_express':
      return EncounterSet.TheEssexCountyExpress;
    case 'extracurricular_activity':
      return EncounterSet.ExtracurricularActivity;
    case 'hideous_abominations':
      return EncounterSet.HideousAbominations;
    case 'lost_in_time_and_space':
      return EncounterSet.LostInTimeAndSpace;
    case 'naomis_crew':
      return EncounterSet.NaomisCrew;
    case 'sorcery':
      return EncounterSet.Sorcery;
    case 'the_beyond':
      return EncounterSet.TheBeyond;
    case 'the_house_always_wins':
      return EncounterSet.TheHouseAlwaysWins;
    case 'the_miskatonic_museum':
      return EncounterSet.TheMiskatonicMuseum;
    case 'undimensioned_and_unseen':
      return EncounterSet.UndimensionedAndUnseen;
    case 'where_doom_awaits':
      return EncounterSet.WhereDoomAwaits;
    case 'whippoorwills':
      return EncounterSet.Whippoorwills;

    // Edge of the Earth
    case 'agents_of_the_unknown':
      return EncounterSet.AgentsOfTheUnknown;
    case 'city_of_the_elder_things':
      return EncounterSet.CityOfTheElderThings;
    case 'creatures_in_the_ice':
      return EncounterSet.CreaturesInTheIce;
    case 'deadly_weather':
      return EncounterSet.DeadlyWeather;
    case 'elder_things':
      return EncounterSet.ElderThings;
    case 'expedition_team':
      return EncounterSet.ExpeditionTeam;
    case 'fatal_mirage':
      return EncounterSet.FatalMirage;
    case 'hazards_of_antarctica':
      return EncounterSet.HazardsOfAntarctica;
    case 'ice_and_death':
      return EncounterSet.IceAndDeath;
    case 'left_behind':
      return EncounterSet.LeftBehind;
    case 'lost_in_the_night':
      return EncounterSet.LostInTheNight;
    case 'memorials_of_the_lost':
      return EncounterSet.MemorialsOfTheLost;
    case 'miasma':
      return EncounterSet.Miasma;
    case 'nameless_horrors':
      return EncounterSet.NamelessHorrors;
    case 'penguins':
      return EncounterSet.Penguins;
    case 'seeping_nightmares':
      return EncounterSet.SeepingNightmares;
    case 'shoggoths':
      return EncounterSet.Shoggoths;
    case 'silence_and_mystery':
      return EncounterSet.SilenceAndMystery;
    case 'stirring_in_the_deep':
      return EncounterSet.StirringInTheDeep;
    case 'tekelili':
      return EncounterSet.Tekelili;
    case 'the_crash':
      return EncounterSet.TheCrash;
    case 'the_great_seal':
      return EncounterSet.TheGreatSeal;
    case 'the_heart_of_madness':
      return EncounterSet.TheHeartOfMadness;
    case 'to_the_forbidden_peaks':
      return EncounterSet.ToTheForbiddenPeaks;

    // The Feast of Hemlock Vale
    case 'agents_of_the_colour':
      return EncounterSet.AgentsOfTheColour;
    case 'blight':
      return EncounterSet.Blight;
    case 'day_of_rain':
      return EncounterSet.DayOfRain;
    case 'day_of_rest':
      return EncounterSet.DayOfRest;
    case 'day_of_the_feast':
      return EncounterSet.DayOfTheFeast;
    case 'fate_of_the_vale':
      return EncounterSet.FateOfTheVale;
    case 'fire':
      return EncounterSet.Fire;
    case 'heirlooms':
      return EncounterSet.Heirlooms;
    case 'hemlock_house':
      return EncounterSet.HemlockHouse;
    case 'horrors_in_the_rock':
      return EncounterSet.HorrorsInTheRock;
    case 'mutations':
      return EncounterSet.Mutations;
    case 'myconids':
      return EncounterSet.Myconids;
    case 'refractions':
      return EncounterSet.Refractions;
    case 'residents':
      return EncounterSet.Residents;
    case 'the_final_day':
      return EncounterSet.TheFinalDay;
    case 'the_first_day':
      return EncounterSet.TheFirstDay;
    case 'the_forest':
      return EncounterSet.TheForest;
    case 'the_longest_night':
      return EncounterSet.TheLongestNight;
    case 'the_lost_sister':
      return EncounterSet.TheLostSister;
    case 'the_second_day':
      return EncounterSet.TheSecondDay;
    case 'the_silent_heath':
      return EncounterSet.TheSilentHeath;
    case 'the_thing_in_the_depths':
      return EncounterSet.TheThingInTheDepths;
    case 'the_twisted_hollow':
      return EncounterSet.TheTwistedHollow;
    case 'the_vale':
      return EncounterSet.TheVale;
    case 'transfiguration':
      return EncounterSet.Transfiguration;
    case 'written_in_rock':
      return EncounterSet.WrittenInRock;

    // Parallel
    case 'all_or_nothing':
      return EncounterSet.AllOrNothing;
    case 'bad_blood':
      return EncounterSet.BadBlood;
    case 'by_the_book':
      return EncounterSet.ByTheBook;
    case 'laid_to_rest':
      return EncounterSet.LaidToRest;
    case 'read_or_die':
      return EncounterSet.ReadOrDie;
    case 'red_tide_rising':
      return EncounterSet.RedTideRising;
    case 'relics_of_the_past':
      return EncounterSet.RelicsOfThePast;

    // The Path to Carcosa
    case 'a_phantom_of_truth':
      return EncounterSet.APhantomOfTruth;
    case 'black_stars_rise':
      return EncounterSet.BlackStarsRise;
    case 'byakhee':
      return EncounterSet.Byakhee;
    case 'cult_of_the_yellow_sign':
      return EncounterSet.CultOfTheYellowSign;
    case 'curtain_call':
      return EncounterSet.CurtainCall;
    case 'decay':
      return EncounterSet.DecayAndFilth;
    case 'delusions':
      return EncounterSet.Delusions;
    case 'dim_carcosa':
      return EncounterSet.DimCarcosa;
    case 'echoes_of_the_past':
      return EncounterSet.EchoesOfThePast;
    case 'evil_portents':
      return EncounterSet.EvilPortents;
    case 'flood':
      return EncounterSet.TheFloodBelow;
    case 'hasturs_gift':
      return EncounterSet.HastursGift;
    case 'hauntings':
      return EncounterSet.Hauntings;
    case 'inhabitants_of_carcosa':
      return EncounterSet.InhabitantsOfCarcosa;
    case 'stranger':
      return EncounterSet.TheStranger;
    case 'the_last_king':
      return EncounterSet.TheLastKing;
    case 'the_pallid_mask':
      return EncounterSet.ThePallidMask;
    case 'the_unspeakable_oath':
      return EncounterSet.TheUnspeakableOath;
    case 'vortex':
      return EncounterSet.TheVortexAbove;

    // The Circle Undone
    case 'agents_of_azathoth':
      return EncounterSet.AgentsOfAzathoth;
    case 'anettes_coven':
      return EncounterSet.AnettesCoven;
    case 'at_deaths_doorstep':
      return EncounterSet.AtDeathsDoorstep;
    case 'before_the_black_throne':
      return EncounterSet.BeforeTheBlackThrone;
    case 'city_of_sins':
      return EncounterSet.CityOfSins;
    case 'disappearance_at_the_twilight_estate':
      return EncounterSet.DisappearanceAtTheTwilightEstate;
    case 'for_the_greater_good':
      return EncounterSet.ForTheGreaterGood;
    case 'in_the_clutches_of_chaos':
      return EncounterSet.InTheClutchesOfChaos;
    case 'inexorable_fate':
      return EncounterSet.InexorableFate;
    case 'music_of_the_damned':
      return EncounterSet.MusicOfTheDamned;
    case 'realm_of_death':
      return EncounterSet.RealmOfDeath;
    case 'secrets_of_the_universe':
      return EncounterSet.SecretsOfTheUniverse;
    case 'silver_twilight_lodge':
      return EncounterSet.SilverTwilightLodge;
    case 'spectral_predators':
      return EncounterSet.SpectralPredators;
    case 'the_secret_name':
      return EncounterSet.TheSecretName;
    case 'the_wages_of_sin':
      return EncounterSet.TheWagesOfSin;
    case 'the_watcher':
      return EncounterSet.TheWatcher;
    case 'the_witching_hour':
      return EncounterSet.TheWitchingHour;
    case 'trapped_spirits':
      return EncounterSet.TrappedSpirits;
    case 'union_and_disillusion':
      return EncounterSet.UnionAndDisillusion;
    case 'witchcraft':
      return EncounterSet.Witchcraft;

    // The Drowned City
    case 'alien_machinery':
      return EncounterSet.AlienMachinery;
    case 'cosmic_legacy':
      return EncounterSet.CosmicLegacy;
    case 'court_of_the_ancients':
      return EncounterSet.CourtOfTheAncients;
    case 'deep_ones':
      return EncounterSet.DeepOnes;
    case 'domination':
      return EncounterSet.Domination;
    case 'dreams':
      return EncounterSet.Dreams;
    case 'elder_mist':
      return EncounterSet.ElderMist;
    case 'obsidian_canyons':
      return EncounterSet.ObsidianCanyons;
    case 'one_last_job':
      return EncounterSet.OneLastJob;
    case 'pilgrims':
      return EncounterSet.Pilgrims;
    case 'rlyeh':
      return EncounterSet.Rlyeh;
    case 'sepulchre_of_the_sleeper':
      return EncounterSet.SepulchreOfTheSleeper;
    case 'star_spawn':
      return EncounterSet.StarSpawn;
    case 'stowaways':
      return EncounterSet.Stowaways;
    case 'tasks':
      return EncounterSet.Tasks;
    case 'tdc_expedition':
      return EncounterSet.TdcExpedition;
    case 'tdc_flood':
      return EncounterSet.TdcFlood;
    case 'the_apiary':
      return EncounterSet.TheApiary;
    case 'the_doom_of_arkham_part_1':
      return EncounterSet.TheDoomOfArkhamPart1;
    case 'the_doom_of_arkham_part_2':
      return EncounterSet.TheDoomOfArkhamPart2;
    case 'the_drowned_quarter':
      return EncounterSet.TheDrownedQuarter;
    case 'the_grand_vault':
      return EncounterSet.TheGrandVault;
    case 'the_inescapable':
      return EncounterSet.TheInescapable;
    case 'the_western_wall':
      return EncounterSet.TheWesternWall;
    case 'undersea_creatures':
      return EncounterSet.UnderseaCreatures;

    // The Dream-Eaters
    case 'agents_of_atlach_nacha':
      return EncounterSet.AgentsOfAtlachNacha;
    case 'agents_of_nyarlathotep':
      return EncounterSet.AgentsOfNyarlathotep;
    case 'a_thousand_shapes_of_horror':
      return EncounterSet.AThousandShapesOfHorror;
    case 'beyond_the_gates_of_sleep':
      return EncounterSet.BeyondTheGatesOfSleep;
    case 'corsairs':
      return EncounterSet.Corsairs;
    case 'creatures_of_the_underworld':
      return EncounterSet.CreaturesOfTheUnderworld;
    case 'dark_side_of_the_moon':
      return EncounterSet.DarkSideOfTheMoon;
    case 'descent_into_the_pitch':
      return EncounterSet.DescentIntoThePitch;
    case 'dreamers_curse':
      return EncounterSet.DreamersCurse;
    case 'dreamlands':
      return EncounterSet.Dreamlands;
    case 'merging_realities':
      return EncounterSet.MergingRealities;
    case 'point_of_no_return':
      return EncounterSet.PointOfNoReturn;
    case 'spiders':
      return EncounterSet.Spiders;
    case 'terror_of_the_vale':
      return EncounterSet.TerrorOfTheVale;
    case 'the_search_for_kadath':
      return EncounterSet.TheSearchForKadath;
    case 'waking_nightmare':
      return EncounterSet.WakingNightmare;
    case 'weaver_of_the_cosmos':
      return EncounterSet.WeaverOfTheCosmos;
    case 'where_the_gods_dwell':
      return EncounterSet.WhereTheGodsDwell;
    case 'whispers_of_hypnos':
      return EncounterSet.WhispersOfHypnos;
    case 'zoogs':
      return EncounterSet.Zoogs;

    // The Forgotten Age
    case 'agents_of_yig':
      return EncounterSet.AgentsOfYig;
    case 'expedition':
      return EncounterSet.Expedition;
    case 'eztli':
      return EncounterSet.TheDoomOfEztli;
    case 'flux':
      return EncounterSet.TemporalFlux;
    case 'guardians_of_time':
      return EncounterSet.GuardiansOfTime;
    case 'heart_of_the_elders':
      return EncounterSet.HeartOfTheElders;
    case 'knyan':
      return EncounterSet.Knyan;
    case 'pillars_of_judgment':
      return EncounterSet.PillarsOfJudgment;
    case 'pnakotic_brotherhood':
      return EncounterSet.PnakoticBrotherhood;
    case 'poison':
      return EncounterSet.Poison;
    case 'rainforest':
      return EncounterSet.Rainforest;
    case 'ruins':
      return EncounterSet.ForgottenRuins;
    case 'serpents':
      return EncounterSet.Serpents;
    case 'shattered_aeons':
      return EncounterSet.ShatteredAeons;
    case 'the_boundary_beyond':
      return EncounterSet.TheBoundaryBeyond;
    case 'the_city_of_archives':
      return EncounterSet.TheCityOfArchives;
    case 'the_depths_of_yoth':
      return EncounterSet.TheDepthsOfYoth;
    case 'threads_of_fate':
      return EncounterSet.ThreadsOfFate;
    case 'traps':
      return EncounterSet.DeadlyTraps;
    case 'turn_back_time':
      return EncounterSet.TurnBackTime;
    case 'venom':
      return EncounterSet.YigsVenom;
    case 'wilds':
      return EncounterSet.TheUntamedWilds;

    // The Innsmouth Conspiracy
    case 'a_light_in_the_fog':
      return EncounterSet.ALightInTheFog;
    case 'agents_of_dagon':
      return EncounterSet.AgentsOfDagon;
    case 'agents_of_hydra':
      return EncounterSet.AgentsOfHydra;
    case 'creatures_of_the_deep':
      return EncounterSet.CreaturesOfTheDeep;
    case 'devil_reef':
      return EncounterSet.DevilReef;
    case 'flooded_caverns':
      return EncounterSet.FloodedCaverns;
    case 'fog_over_innsmouth':
      return EncounterSet.FogOverInnsmouth;
    case 'horror_in_high_gear':
      return EncounterSet.HorrorInHighGear;
    case 'in_too_deep':
      return EncounterSet.InTooDeep;
    case 'into_the_maelstrom':
      return EncounterSet.IntoTheMaelstrom;
    case 'malfunction':
      return EncounterSet.Malfunction;
    case 'rising_tide':
      return EncounterSet.RisingTide;
    case 'shattered_memories':
      return EncounterSet.ShatteredMemories;
    case 'syzygy':
      return EncounterSet.Syzygy;
    case 'the_lair_of_dagon':
      return EncounterSet.TheLairOfDagon;
    case 'the_locals':
      return EncounterSet.TheLocals;
    case 'the_pit_of_despair':
      return EncounterSet.ThePitOfDespair;
    case 'the_vanishing_of_elina_harper':
      return EncounterSet.TheVanishingOfElinaHarper;

    // The Scarlet Keys
    case 'agents_of_the_outside':
      return EncounterSet.AgentsOfTheOutside;
    case 'agents_of_yuggoth':
      return EncounterSet.AgentsOfYuggoth;
    case 'beyond_the_beyond':
      return EncounterSet.BeyondTheBeyond;
    case 'cleanup_crew':
      return EncounterSet.CleanupCrew;
    case 'congress_of_the_keys':
      return EncounterSet.CongressOfTheKeys;
    case 'crimson_conspiracy':
      return EncounterSet.CrimsonConspiracy;
    case 'dancing_mad':
      return EncounterSet.DancingMad;
    case 'dark_veiling':
      return EncounterSet.DarkVeiling;
    case 'dead_heat':
      return EncounterSet.DeadHeat;
    case 'dealings_in_the_dark':
      return EncounterSet.DealingsInTheDark;
    case 'dogs_of_war':
      return EncounterSet.DogsOfWar;
    case 'globetrotting':
      return EncounterSet.Globetrotting;
    case 'mysteries_abound':
      return EncounterSet.MysteriesAbound;
    case 'on_thin_ice':
      return EncounterSet.OnThinIce;
    case 'outsiders':
      return EncounterSet.Outsiders;
    case 'red_coterie':
      return EncounterSet.RedCoterie;
    case 'riddles_and_rain':
      return EncounterSet.RiddlesAndRain;
    case 'sanguine_shadows':
      return EncounterSet.SanguineShadows;
    case 'scarlet_sorcery':
      return EncounterSet.ScarletSorcery;
    case 'secret_war':
      return EncounterSet.SecretWar;
    case 'shades_of_suffering':
      return EncounterSet.ShadesOfSuffering;
    case 'shadow_of_a_doubt':
      return EncounterSet.ShadowOfADoubt;
    case 'spatial_anomaly':
      return EncounterSet.SpatialAnomaly;
    case 'spreading_corruption':
      return EncounterSet.SpreadingCorruption;
    case 'strange_happenings':
      return EncounterSet.StrangeHappenings;
    case 'without_a_trace':
      return EncounterSet.WithoutATrace;

    // Return to... Cycles
    // Return to The Dunwich Legacy
    case 'beyond_the_threshold':
      return EncounterSet.BeyondTheThreshold;
    case 'creeping_cold':
      return EncounterSet.CreepingCold;
    case 'erratic_fear':
      return EncounterSet.ErraticFear;
    case 'resurgent_evils':
      return EncounterSet.ResurgentEvils;
    case 'return_to_blood_on_the_altar':
      return EncounterSet.ReturnToBloodOnTheAltar;
    case 'return_to_extracurricular_activities':
      return EncounterSet.ReturnToExtracurricularActivity;
    case 'return_to_lost_in_time_and_space':
      return EncounterSet.ReturnToLostInTimeAndSpace;
    case 'return_to_the_essex_county_express':
      return EncounterSet.ReturnToTheEssexCountyExpress;
    case 'return_to_the_house_always_wins':
      return EncounterSet.ReturnToTheHouseAlwaysWins;
    case 'return_to_the_miskatonic_museum':
      return EncounterSet.ReturnToTheMiskatonicMuseum;
    case 'return_to_undimensioned_and_unseen':
      return EncounterSet.ReturnToUndimensionedAndUnseen;
    case 'return_to_where_doom_awaits':
      return EncounterSet.ReturnToWhereDoomAwaits;
    case 'secret_doors':
      return EncounterSet.SecretDoors;
    case 'yog_sothoths_emissaries':
      return EncounterSet.YogSothothsEmissaries;

    // Return to The Night of the Zealot
    case 'ghouls_of_umôrdhoth':
      return EncounterSet.GhoulsOfUmordhoth;
    case 'return_cult':
      return EncounterSet.ReturnToCultOfUmordhoth;
    case 'return_to_the_devourer_below':
      return EncounterSet.ReturnToTheDevourerBelow;
    case 'return_to_the_gathering':
      return EncounterSet.ReturnToTheGathering;
    case 'return_to_the_midnight_masks':
      return EncounterSet.ReturnToTheMidnightMasks;
    case 'the_devourers_cult':
      return EncounterSet.TheDevourersCult;

    // Return to The Path to Carcosa
    case 'decaying_reality':
      return EncounterSet.DecayingReality;
    case 'delusory_evils':
      return EncounterSet.DelusoryEvils;
    case 'hasturs_envoys':
      return EncounterSet.HastursEnvoys;
    case 'maddening_delusions':
      return EncounterSet.MaddeningDelusions;
    case 'neurotic_fear':
      return EncounterSet.NeuroticFear;
    case 'return_to_a_phantom_of_truth':
      return EncounterSet.ReturnToAPhantomOfTruth;
    case 'return_to_black_stars_rise':
      return EncounterSet.ReturnToBlackStarsRise;
    case 'return_to_curtain_call':
      return EncounterSet.ReturnToCurtainCall;
    case 'return_to_dim_carcosa':
      return EncounterSet.ReturnToDimCarcosa;
    case 'return_to_echoes_of_the_past':
      return EncounterSet.ReturnToEchoesOfThePast;
    case 'return_to_the_last_king':
      return EncounterSet.ReturnToTheLastKing;
    case 'return_to_the_pallid_mask':
      return EncounterSet.ReturnToThePallidMask;
    case 'return_to_the_unspeakable_oath':
      return EncounterSet.ReturnToTheUnspeakableOath;

    // Return to The Circle Undone
    case 'bloodthirsty_spirits':
      return EncounterSet.BloodthirstySpirits;
    case 'chilling_mists':
      return EncounterSet.ChillingMists;
    case 'city_of_the_damned':
      return EncounterSet.CityOfTheDamned;
    case 'hexcraft':
      return EncounterSet.Hexcraft;
    case 'impending_evils':
      return EncounterSet.ImpendingEvils;
    case 'return_to_at_deaths_doorstep':
      return EncounterSet.ReturnToAtDeathsDoorstep;
    case 'return_to_before_the_black_throne':
      return EncounterSet.ReturnToBeforeTheBlackThrone;
    case 'return_to_disappearance_at_the_twilight_estate':
      return EncounterSet.ReturnToDisappearanceAtTheTwilightEstate;
    case 'return_to_for_the_greater_good':
      return EncounterSet.ReturnToForTheGreaterGood;
    case 'return_to_in_the_clutches_of_chaos':
      return EncounterSet.ReturnToInTheClutchesOfChaos;
    case 'return_to_the_secret_name':
      return EncounterSet.ReturnToTheSecretName;
    case 'return_to_the_wages_of_sin':
      return EncounterSet.ReturnToTheWagesOfSin;
    case 'return_to_the_witching_hour':
      return EncounterSet.ReturnToTheWitchingHour;
    case 'return_to_union_and_disillusion':
      return EncounterSet.ReturnToUnionAndDisillusion;
    case 'unspeakable_fate':
      return EncounterSet.UnspeakableFate;
    case 'unstable_realm':
      return EncounterSet.UnstableRealm;

    // Return to The Forgotten Age
    case 'cult_of_pnakotus':
      return EncounterSet.CultOfPnakotus;
    case 'doomed_expedition':
      return EncounterSet.DoomedExpedition;
    case 'return_to_knyan':
      return EncounterSet.ReturnToKnyan;
    case 'return_to_pillars_of_judgment':
      return EncounterSet.ReturnToPillarsOfJudgment;
    case 'return_to_shattered_aeons':
      return EncounterSet.ReturnToShatteredAeons;
    case 'return_to_the_boundary_beyond':
      return EncounterSet.ReturnToTheBoundaryBeyond;
    case 'return_to_the_city_of_archives':
      return EncounterSet.ReturnToTheCityOfArchives;
    case 'return_to_the_depths_of_yoth':
      return EncounterSet.ReturnToTheDepthsOfYoth;
    case 'return_to_the_doom_of_eztli':
      return EncounterSet.ReturnToTheDoomOfEztli;
    case 'return_to_the_rainforest':
      return EncounterSet.ReturnToTheRainforest;
    case 'return_to_the_untamed_wilds':
      return EncounterSet.ReturnToTheUntamedWilds;
    case 'return_to_threads_of_fate':
      return EncounterSet.ReturnToThreadsOfFate;
    case 'return_to_turn_back_time':
      return EncounterSet.ReturnToTurnBackTime;
    case 'temporal_hunters':
      return EncounterSet.TemporalHunters;
    case 'venomous_hate':
      return EncounterSet.VenomousHate;

    // Standalone Scenarios
    // The Blob That Ate Everything
    case 'blob_that_ate_everything_else':
      return EncounterSet.TheBlobThatAteEverythingElse;
    case 'migo_incursion_2':
      return EncounterSet.MigoIncursionII;

    // The Blob That Ate Everything (original)
    case 'blob':
      return EncounterSet.TheBlobThatAteEverything;
    case 'blob_epic_multiplayer':
      return EncounterSet.TheBlobThatAteEverythingEpicMultiplayer;
    case 'blob_single_group':
      return EncounterSet.TheBlobThatAteEverythingSingleGroup;
    case 'migo_incursion':
      return EncounterSet.MigoIncursion;

    // Carnevale of Horrors
    case 'venice':
      return EncounterSet.CarnevaleOfHorrors;

    // Curse of the Rougarou
    case 'bayou':
      return EncounterSet.TheBayou;
    case 'rougarou':
      return EncounterSet.CurseOfTheRougarou;

    // Film Fatale
    case 'abominable_contessa':
      return EncounterSet.AbominableContessa;
    case 'cosmic_journey':
      return EncounterSet.CosmicJourney;
    case 'film_fatale':
      return EncounterSet.FilmFatale;
    case 'forgotten_island':
      return EncounterSet.ForgottenIsland;

    // Fortune and Folly
    case 'fortune_and_folly':
      return EncounterSet.FortuneAndFolly;
    case 'fortunes_chosen':
      return EncounterSet.FortunesChosen;
    case 'plan_in_shambles':
      return EncounterSet.PlanInShambles;

    // Guardians of the Abyss
    case 'abyssal_gifts':
      return EncounterSet.AbyssalGifts;
    case 'abyssal_tribute':
      return EncounterSet.AbyssalTribute;
    case 'brotherhood_of_the_beast':
      return EncounterSet.BrotherhoodOfTheBeast;
    case 'sands_of_egypt':
      return EncounterSet.SandsOfEgypt;
    case 'the_eternal_slumber':
      return EncounterSet.TheEternalSlumber;
    case 'the_nights_usurper':
      return EncounterSet.TheNightsUsurper;

    // Murder at the Excelsior Hotel
    case 'alien_interference':
      return EncounterSet.AlienInterference;
    case 'dark_rituals':
      return EncounterSet.DarkRituals;
    case 'excelsior_management':
      return EncounterSet.ExcelsiorManagement;
    case 'murder_at_the_excelsior_hotel':
      return EncounterSet.MurderAtTheExcelsiorHotel;
    case 'sins_of_the_past':
      return EncounterSet.SinsOfThePast;
    case 'vile_experiments':
      return EncounterSet.VileExperiments;

    // The Labyrinths of Lunacy
    case 'epic_multiplayer':
      return EncounterSet.TheLabyrinthsOfLunacyEpicMultiplayer;
    case 'in_the_labyrinths_of_lunacy':
      return EncounterSet.TheLabyrinthsOfLunacy;
    case 'single_group':
      return EncounterSet.TheLabyrinthsOfLunacySingleGroup;

    // Machinations Through Time
    case 'machinations_through_time':
      return EncounterSet.MachinationsThroughTime;
    case 'machinations_through_time_epic_multiplayer':
      return EncounterSet.MachinationsThroughTimeEpicMultiplayer;
    case 'machinations_through_time_single_group':
      return EncounterSet.MachinationsThroughTimeSingleGroup;

    // The Midwinter Gala
    case 'the_midwinter_gala':
      return EncounterSet.TheMidwinterGala;

    // War of the Outer Gods
    case 'children_of_paradise':
      return EncounterSet.ChildrenOfParadise;
    case 'death_of_stars':
      return EncounterSet.DeathOfStars;
    case 'swarm_of_assimilation':
      return EncounterSet.SwarmOfAssimilation;
    case 'war_of_the_outer_gods':
      return EncounterSet.WarOfTheOuterGods;

    default:
      throw new Error(`Unknown AHDB encounter set: ${ahdbEncounterSet}`);
  }
}

export function factionToCardClass(faction: string): CardClass {
  switch (faction) {
    case 'guardian':
      return CardClass.Guardian;
    case 'seeker':
      return CardClass.Seeker;
    case 'rogue':
      return CardClass.Rogue;
    case 'mystic':
      return CardClass.Mystic;
    case 'survivor':
      return CardClass.Survivor;
    case 'neutral':
      return CardClass.Neutral;
    case 'mythos':
      throw new Error(`Mythos faction exist in arkhamdb but it cannot be converted into a class`);
    default:
      throw new Error(`Unknown faction: ${faction}`);
  }
}

export function typeToCardType(type: string): CardType {
  switch (type) {
    case 'investigator':
      return CardType.Investigator;
    case 'asset':
      return CardType.Asset;
    case 'treachery':
      return CardType.Treachery;
    case 'event':
      return CardType.Event;
    case 'skill':
      return CardType.Skill;
    case 'enemy':
      return CardType.Enemy;
    case 'location':
      return CardType.Location;
    case 'scenario':
      return CardType.Scenario;
    case 'agenda':
      return CardType.Agenda;
    case 'act':
      return CardType.Act;
    case 'story':
      return CardType.Story;
    case 'key':
      return CardType.Key;
    case 'enemy_location':
      return CardType.EnemyLocation;
    case 'upgrade':
      return CardType.Upgrade;
    default:
      throw new Error(`Unknown card type: ${type}`);
  }
}

export function subtypeCodeToWeaknessType(
  subtype_code: string | undefined
): WeaknessType | undefined {
  if (!subtype_code) {
    return undefined;
  }
  switch (subtype_code) {
    case 'basicweakness':
      return WeaknessType.BasicWeakness;
    case 'weakness':
      return WeaknessType.Weakness;
    default:
      throw new Error(`Unknown weakness type: ${subtype_code}`);
  }
}

export function slotStringToSlots(slotString: string | undefined): Slot[] | undefined {
  if (slotString === undefined || slotString === '') {
    return undefined;
  }
  return slotString.split('. ').map((slot) => slotToSlot(slot));
}

export function slotToSlot(ahdbSlot: string): Slot {
  switch (ahdbSlot) {
    case 'Ally':
      return Slot.Ally;
    case 'Accessory':
      return Slot.Accessory;
    case 'Hand':
      return Slot.Hand;
    case 'Hand x2':
      return Slot.HandX2;
    case 'Body':
      return Slot.Body;
    case 'Arcane':
      return Slot.Arcane;
    case 'Tarot':
      return Slot.Tarot;
    case 'Arcane x2':
      return Slot.ArcaneX2;
    case 'Head':
      return Slot.Head;
    default:
      throw new Error(`Unknown AHDB slot: ${ahdbSlot}`);
  }
}

export function coreToRcoreProduct(product: Product): Product {
  if (product === Product.CoreSet) {
    return Product.RevisedCoreSet;
  }
  return product;
}

export function codeToProduct(packCode: string, encounterCode: string | undefined): Product {
  switch (packCode) {
    case 'core':
      return Product.CoreSet;
    case 'rcore':
      return Product.RevisedCoreSet;
    case 'dwl':
    case 'tmm':
    case 'tece':
    case 'bota':
    case 'uau':
    case 'wda':
    case 'litas':
      return encounterCode
        ? Product.TheDunwichLegacyCampaignExpansion
        : Product.TheDunwichLegacyInvestigatorExpansion;
    case 'dwlp':
      return Product.TheDunwichLegacyInvestigatorExpansion;
    case 'dwlc':
      return Product.TheDunwichLegacyCampaignExpansion;
    case 'ptc':
    case 'eotp':
    case 'tuo':
    case 'apot':
    case 'tpm':
    case 'bsr':
    case 'dca':
      return encounterCode
        ? Product.ThePathToCarcosaCampaignExpansion
        : Product.ThePathToCarcosaInvestigatorExpansion;
    case 'ptcp':
      return Product.ThePathToCarcosaInvestigatorExpansion;
    case 'ptcc':
      return Product.ThePathToCarcosaCampaignExpansion;
    case 'tfa':
    case 'tof':
    case 'tbb':
    case 'hote':
    case 'tcoa':
    case 'tdoy':
    case 'sha':
      return encounterCode
        ? Product.TheForgottenAgeCampaignExpansion
        : Product.TheForgottenAgeInvestigatorExpansion;
    case 'tfap':
      return Product.TheForgottenAgeInvestigatorExpansion;
    case 'tfac':
      return Product.TheForgottenAgeCampaignExpansion;
    case 'tcu':
    case 'tsn':
    case 'wos':
    case 'fgg':
    case 'uad':
    case 'icc':
    case 'bbt':
      return encounterCode
        ? Product.TheCircleUndoneCampaignExpansion
        : Product.TheCircleUndoneInvestigatorExpansion;
    case 'tcup':
      return Product.TheCircleUndoneInvestigatorExpansion;
    case 'tcuc':
      return Product.TheCircleUndoneCampaignExpansion;
    case 'tde':
    case 'sfk':
    case 'tsh':
    case 'dsm':
    case 'pnr':
    case 'wgd':
    case 'woc':
      return encounterCode
        ? Product.TheDreamEatersCampaignExpansion
        : Product.TheDreamEatersInvestigatorExpansion;
    case 'tdep':
      return Product.TheDreamEatersInvestigatorExpansion;
    case 'tdec':
      return Product.TheDreamEatersCampaignExpansion;
    case 'tic':
    case 'itd':
    case 'def':
    case 'hhg':
    case 'lif':
    case 'lod':
    case 'itm':
      return encounterCode
        ? Product.TheInnsmouthConspiracyCampaignExpansion
        : Product.TheInnsmouthConspiracyInvestigatorExpansion;
    case 'ticp':
      return Product.TheInnsmouthConspiracyInvestigatorExpansion;
    case 'ticc':
      return Product.TheInnsmouthConspiracyCampaignExpansion;
    case 'eoep':
      return Product.EdgeOfTheEarthInvestigatorExpansion;
    case 'eoec':
      return Product.EdgeOfTheEarthCampaignExpansion;
    case 'tskp':
      return Product.TheScarletKeysInvestigatorExpansion;
    case 'tskc':
      return Product.TheScarletKeysCampaignExpansion;
    case 'fhvp':
      return Product.TheFeastOfHemlockValeInvestigatorExpansion;
    case 'fhvc':
      return Product.TheFeastOfHemlockValeCampaignExpansion;
    case 'tdcp':
      return Product.TheDrownedCityInvestigatorExpansion;
    case 'tdcc':
      return Product.TheDrownedCityCampaignExpansion;
    case 'rtnotz':
      return Product.ReturnToTheNightOfTheZealot;
    case 'rtdwl':
      return Product.ReturnToTheDunwichLegacy;
    case 'rtptc':
      return Product.ReturnToThePathToCarcosa;
    case 'rttfa':
      return Product.ReturnToTheForgottenAge;
    case 'rttcu':
      return Product.ReturnToTheCircleUndone;
    case 'nat':
      return Product.NathanielCho;
    case 'har':
      return Product.HarveyWalters;
    case 'win':
      return Product.WinifredHabbamock;
    case 'jac':
      return Product.JacquelineFine;
    case 'ste':
      return Product.StellaClark;
    case 'cotr':
      return Product.CurseOfTheRougarou;
    case 'coh':
      return Product.CarnevaleOfHorrors;
    case 'lol':
      return Product.TheLabyrinthsOfLunacy;
    case 'guardians':
      return Product.GuardiansOfTheAbyss;
    case 'hotel':
      return Product.MurderAtTheExcelsiorHotel;
    case 'blob':
      return Product.TheBlobThatAteEverything;
    case 'wog':
      return Product.WarOfTheOuterGods;
    case 'mtt':
      return Product.MachinationsThroughTime;
    case 'fof':
      return Product.FortuneAndFolly;
    case 'blbe':
      return Product.TheBlobThatAteEverythingElse;
    case 'tmg':
      return Product.TheMidwinterGala;
    case 'film_fatale':
      return Product.FilmFatale;
    case 'rod':
    case 'aon':
    case 'bad':
    case 'btb':
    case 'rtr':
    case 'otr':
    case 'ltr':
    case 'ptr':
    case 'rop':
    case 'hfa':
    case 'pap':
    case 'aof':
    case 'enc':
      return Product.ParallelInvestigators;
    case 'hoth':
    case 'books':
    case 'tdor':
    case 'iotv':
    case 'tdg':
    case 'tftbw':
    case 'bob':
    case 'dre':
    case 'promo':
      return Product.Promotional;
    case 'core_2026':
      return Product.CoreSet2026;
    default:
      throw new Error(`Unknown pack code: ${packCode}`);
  }
}

export function cycleCodeToProducts(cycleCode: string): Product[] {
  switch (cycleCode) {
    case 'core':
      return [Product.CoreSet, Product.RevisedCoreSet, Product.CoreSet2026];
    case 'dwl':
      return [
        Product.TheDunwichLegacyInvestigatorExpansion,
        Product.TheDunwichLegacyCampaignExpansion,
      ];
    case 'ptc':
      return [
        Product.ThePathToCarcosaInvestigatorExpansion,
        Product.ThePathToCarcosaCampaignExpansion,
      ];
    case 'tfa':
      return [
        Product.TheForgottenAgeInvestigatorExpansion,
        Product.TheForgottenAgeCampaignExpansion,
      ];
    case 'tcu':
      return [
        Product.TheCircleUndoneInvestigatorExpansion,
        Product.TheCircleUndoneCampaignExpansion,
      ];
    case 'tde':
      return [
        Product.TheDreamEatersInvestigatorExpansion,
        Product.TheDreamEatersCampaignExpansion,
      ];
    case 'tic':
      return [
        Product.TheInnsmouthConspiracyInvestigatorExpansion,
        Product.TheInnsmouthConspiracyCampaignExpansion,
      ];
    case 'eoe':
      return [
        Product.EdgeOfTheEarthInvestigatorExpansion,
        Product.EdgeOfTheEarthCampaignExpansion,
      ];
    case 'tsk':
      return [
        Product.TheScarletKeysInvestigatorExpansion,
        Product.TheScarletKeysCampaignExpansion,
      ];
    case 'fhv':
      return [
        Product.TheFeastOfHemlockValeInvestigatorExpansion,
        Product.TheFeastOfHemlockValeCampaignExpansion,
      ];
    case 'tdc':
      return [
        Product.TheDrownedCityInvestigatorExpansion,
        Product.TheDrownedCityCampaignExpansion,
      ];
    case 'side_stories':
      return [
        Product.CurseOfTheRougarou,
        Product.CarnevaleOfHorrors,
        Product.TheLabyrinthsOfLunacy,
        Product.GuardiansOfTheAbyss,
        Product.MurderAtTheExcelsiorHotel,
        Product.TheBlobThatAteEverything,
        Product.WarOfTheOuterGods,
        Product.MachinationsThroughTime,
        Product.FortuneAndFolly,
        Product.TheBlobThatAteEverythingElse,
        Product.TheMidwinterGala,
        Product.FilmFatale,
      ];
    case 'promotional':
      return [Product.Promotional];
    case 'return':
      return [
        Product.ReturnToTheNightOfTheZealot,
        Product.ReturnToTheDunwichLegacy,
        Product.ReturnToThePathToCarcosa,
        Product.ReturnToTheForgottenAge,
        Product.ReturnToTheCircleUndone,
      ];
    case 'investigator':
      return [
        Product.NathanielCho,
        Product.HarveyWalters,
        Product.WinifredHabbamock,
        Product.JacquelineFine,
        Product.StellaClark,
      ];
    case 'parallel':
      return [Product.ParallelInvestigators];
    default:
      throw new Error(`Unknown cycle code: ${cycleCode}`);
  }
}