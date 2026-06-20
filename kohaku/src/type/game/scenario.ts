import { EncounterSet } from './encounter-set.js';

/**
 * Comprehensive enum of all scenarios in Arkham Horror: The Card Game.
 * This includes core campaign scenarios, return to campaigns, and standalone scenarios.
 */
export enum Scenario {
  // Night of the Zealot
  TheGathering = 'the_gathering',
  TheMidnightMasks = 'the_midnight_masks',
  TheDevourerBelow = 'the_devourer_below',
  ReturnToTheGathering = 'return_to_the_gathering',
  ReturnToTheMidnightMasks = 'return_to_the_midnight_masks',
  ReturnToTheDevourerBelow = 'return_to_the_devourer_below',

  // The Dunwich Legacy
  ExtracurricularActivity = 'extracurricular_activity',
  TheHouseAlwaysWins = 'the_house_always_wins',
  TheMiskatonicMuseum = 'the_miskatonic_museum',
  TheEssexCountyExpress = 'the_essex_county_express',
  BloodOnTheAltar = 'blood_on_the_altar',
  UndimensionedAndUnseen = 'undimensioned_and_unseen',
  WhereDoomAwaits = 'where_doom_awaits',
  LostInTimeAndSpace = 'lost_in_time_and_space',
  ReturnToExtracurricularActivity = 'return_to_extracurricular_activity',
  ReturnToTheHouseAlwaysWins = 'return_to_the_house_always_wins',
  ReturnToTheMiskatonicMuseum = 'return_to_the_miskatonic_museum',
  ReturnToTheEssexCountyExpress = 'return_to_the_essex_county_express',
  ReturnToBloodOnTheAltar = 'return_to_blood_on_the_altar',
  ReturnToUndimensionedAndUnseen = 'return_to_undimensioned_and_unseen',
  ReturnToWhereDoomAwaits = 'return_to_where_doom_awaits',
  ReturnToLostInTimeAndSpace = 'return_to_lost_in_time_and_space',

  // The Path to Carcosa
  CurtainCall = 'curtain_call',
  TheLastKing = 'the_last_king',
  EchoesOfThePast = 'echoes_of_the_past',
  TheUnspeakableOath = 'the_unspeakable_oath',
  APhantomOfTruth = 'a_phantom_of_truth',
  ThePallidMask = 'the_pallid_mask',
  BlackStarsRise = 'black_stars_rise',
  DimCarcosa = 'dim_carcosa',
  ReturnToCurtainCall = 'return_to_curtain_call',
  ReturnToTheLastKing = 'return_to_the_last_king',
  ReturnToEchoesOfThePast = 'return_to_echoes_of_the_past',
  ReturnToTheUnspeakableOath = 'return_to_the_unspeakable_oath',
  ReturnToAPhantomOfTruth = 'return_to_a_phantom_of_truth',
  ReturnToThePallidMask = 'return_to_the_pallid_mask',
  ReturnToBlackStarsRise = 'return_to_black_stars_rise',
  ReturnToDimCarcosa = 'return_to_dim_carcosa',

  // The Forgotten Age
  TheUntamedWilds = 'the_untamed_wilds',
  TheDoomOfEztli = 'the_doom_of_eztli',
  ThreadsOfFate = 'threads_of_fate',
  TheBoundaryBeyond = 'the_boundary_beyond',
  HeartOfTheEldersPart1 = 'heart_of_the_elders_part_1',
  HeartOfTheEldersPart2 = 'heart_of_the_elders_part_2',
  TheCityOfArchives = 'the_city_of_archives',
  TheDepthsOfYoth = 'the_depths_of_yoth',
  ShatteredAeons = 'shattered_aeons',
  TurnBackTime = 'turn_back_time',
  ReturnToTheUntamedWilds = 'return_to_the_untamed_wilds',
  ReturnToTheDoomOfEztli = 'return_to_the_doom_of_eztli',
  ReturnToThreadsOfFate = 'return_to_threads_of_fate',
  ReturnToTheBoundaryBeyond = 'return_to_the_boundary_beyond',
  ReturnToHeartOfTheEldersPart1 = 'return_to_heart_of_the_elders_part_1',
  ReturnToHeartOfTheEldersPart2 = 'return_to_heart_of_the_elders_part_2',
  ReturnToTheCityOfArchives = 'return_to_the_city_of_archives',
  ReturnToTheDepthsOfYoth = 'return_to_the_depths_of_yoth',
  ReturnToShatteredAeons = 'return_to_shattered_aeons',
  ReturnToTurnBackTime = 'return_to_turn_back_time',

  // The Circle Undone
  DisappearanceAtTheTwilightEstate = 'disappearance_at_the_twilight_estate',
  TheWitchingHour = 'the_witching_hour',
  AtDeathsDoorstep = 'at_deaths_doorstep',
  TheSecretName = 'the_secret_name',
  TheWagesOfSin = 'the_wages_of_sin',
  ForTheGreaterGood = 'for_the_greater_good',
  UnionAndDisillusion = 'union_and_disillusion',
  InTheClutchesOfChaos = 'in_the_clutches_of_chaos',
  BeforeTheBlackThrone = 'before_the_black_throne',
  ReturnToDisappearanceAtTheTwilightEstate = 'return_to_disappearance_at_the_twilight_estate',
  ReturnToTheWitchingHour = 'return_to_the_witching_hour',
  ReturnToAtDeathsDoorstep = 'return_to_at_deaths_doorstep',
  ReturnToTheSecretName = 'return_to_the_secret_name',
  ReturnToTheWagesOfSin = 'return_to_the_wages_of_sin',
  ReturnToForTheGreaterGood = 'return_to_for_the_greater_good',
  ReturnToUnionAndDisillusion = 'return_to_union_and_disillusion',
  ReturnToInTheClutchesOfChaos1 = 'return_to_in_the_clutches_of_chaos_1',
  ReturnToInTheClutchesOfChaos2 = 'return_to_in_the_clutches_of_chaos_2',
  ReturnToBeforeTheBlackThrone = 'return_to_before_the_black_throne',

  // The Innsmouth Conspiracy
  ThePitOfDespair = 'the_pit_of_despair',
  TheVanishingOfElinaHarper = 'the_vanishing_of_elina_harper',
  InTooDeep = 'in_too_deep',
  DevilReef = 'devil_reef',
  HorrorInHighGear = 'horror_in_high_gear',
  ALightInTheFog = 'a_light_in_the_fog',
  TheLairOfDagon = 'the_lair_of_dagon',
  IntoTheMaelstrom = 'into_the_maelstrom',

  // The Dream-Eaters
  BeyondTheGatesOfSleep = 'beyond_the_gates_of_sleep',
  WakingNightmare = 'waking_nightmare',
  TheSearchForKadath = 'the_search_for_kadath',
  AThousandShapesOfHorror = 'a_thousand_shapes_of_horror',
  DarkSideOfTheMoon = 'dark_side_of_the_moon',
  PointOfNoReturn = 'point_of_no_return',
  WhereTheGodsDwell = 'where_the_gods_dwell',
  WeaverOfTheCosmos = 'weaver_of_the_cosmos',

  // Edge of the Earth
  IceAndDeathPart1 = 'ice_and_death_part_1',
  IceAndDeathPart2 = 'ice_and_death_part_2',
  IceAndDeathPart3 = 'ice_and_death_part_3',
  FatalMirage = 'fatal_mirage',
  ToTheForbiddenPeaks = 'to_the_forbidden_peaks',
  CityOfTheElderThings1 = 'city_of_the_elder_things_1',
  CityOfTheElderThings2 = 'city_of_the_elder_things_2',
  CityOfTheElderThings3 = 'city_of_the_elder_things_3',
  TheHeartOfMadnessPart1 = 'the_heart_of_madness_part_1',
  TheHeartOfMadnessPart2 = 'the_heart_of_madness_part_2',

  // The Scarlet Keys
  RiddlesAndRain = 'riddles_and_rain',
  DeadHeat = 'dead_heat',
  SanguineShadows = 'sanguine_shadows',
  DealingsInTheDark = 'dealings_in_the_dark',
  DancingMad = 'dancing_mad',
  OnThinIce = 'on_thin_ice',
  DogsOfWar = 'dogs_of_war',
  ShadesOfSuffering = 'shades_of_suffering',
  WithoutATrace = 'without_a_trace',
  CongressOfTheKeys = 'congress_of_the_keys',

  // The Feast of Hemlock Vale
  WrittenInRock = 'written_in_rock',
  HemlockHouse = 'hemlock_house',
  TheSilentHeath = 'the_silent_heath',
  TheLostSister = 'the_lost_sister',
  TheThingInTheDepths = 'the_thing_in_the_depths',
  TheTwistedHollow = 'the_twisted_hollow',
  TheLongestNight = 'the_longest_night',
  FateOfTheVale = 'fate_of_the_vale',

  // The Drowned City
  OneLastJob = 'one_last_job',
  TheWesternWall = 'the_western_wall',
  TheDrownedQuarter = 'the_drowned_quarter',
  TheApiary = 'the_apiary',
  TheGrandVault = 'the_grand_vault',
  CourtOfTheAncients = 'court_of_the_ancients',
  ObsidianCanyons = 'obsidian_canyons',
  SepulchreOfTheSleeper = 'sepulchre_of_the_sleeper',
  TheDoomOfArkham = 'the_doom_of_arkham',

  // Brethren of Ash
  SpreadingFlames = 'spreading_flames',
  SmokeAndMirrors = 'smoke_and_mirrors',
  QueenOfAsh = 'queen_of_ash',
}

/**
 * Structured data about a scenario, including its index and representative encounter set.
 */
export interface ScenarioData {
  /** The scenario enum value */
  scenario: Scenario;
  /** The scenario's index/order within its campaign (1-based) */
  index: number;
  /** The primary encounter set that represents this scenario */
  representativeSet: EncounterSet;
}

/**
 * Mapping of all scenarios to their data.
 * This is a comprehensive record containing index and representative set information
 * for every scenario in the game.
 */
export const scenarioData: Record<Scenario, ScenarioData> = {
  // Night of the Zealot
  [Scenario.TheGathering]: {
    scenario: Scenario.TheGathering,
    index: 1,
    representativeSet: EncounterSet.TheGathering,
  },
  [Scenario.TheMidnightMasks]: {
    scenario: Scenario.TheMidnightMasks,
    index: 2,
    representativeSet: EncounterSet.TheMidnightMasks,
  },
  [Scenario.TheDevourerBelow]: {
    scenario: Scenario.TheDevourerBelow,
    index: 3,
    representativeSet: EncounterSet.TheDevourerBelow,
  },
  [Scenario.ReturnToTheGathering]: {
    scenario: Scenario.ReturnToTheGathering,
    index: 1,
    representativeSet: EncounterSet.ReturnToTheGathering,
  },
  [Scenario.ReturnToTheMidnightMasks]: {
    scenario: Scenario.ReturnToTheMidnightMasks,
    index: 2,
    representativeSet: EncounterSet.ReturnToTheMidnightMasks,
  },
  [Scenario.ReturnToTheDevourerBelow]: {
    scenario: Scenario.ReturnToTheDevourerBelow,
    index: 3,
    representativeSet: EncounterSet.ReturnToTheDevourerBelow,
  },

  // The Dunwich Legacy
  [Scenario.ExtracurricularActivity]: {
    scenario: Scenario.ExtracurricularActivity,
    index: 1,
    representativeSet: EncounterSet.ExtracurricularActivity,
  },
  [Scenario.TheHouseAlwaysWins]: {
    scenario: Scenario.TheHouseAlwaysWins,
    index: 2,
    representativeSet: EncounterSet.TheHouseAlwaysWins,
  },
  [Scenario.TheMiskatonicMuseum]: {
    scenario: Scenario.TheMiskatonicMuseum,
    index: 3,
    representativeSet: EncounterSet.TheMiskatonicMuseum,
  },
  [Scenario.TheEssexCountyExpress]: {
    scenario: Scenario.TheEssexCountyExpress,
    index: 4,
    representativeSet: EncounterSet.TheEssexCountyExpress,
  },
  [Scenario.BloodOnTheAltar]: {
    scenario: Scenario.BloodOnTheAltar,
    index: 5,
    representativeSet: EncounterSet.BloodOnTheAltar,
  },
  [Scenario.UndimensionedAndUnseen]: {
    scenario: Scenario.UndimensionedAndUnseen,
    index: 6,
    representativeSet: EncounterSet.UndimensionedAndUnseen,
  },
  [Scenario.WhereDoomAwaits]: {
    scenario: Scenario.WhereDoomAwaits,
    index: 7,
    representativeSet: EncounterSet.WhereDoomAwaits,
  },
  [Scenario.LostInTimeAndSpace]: {
    scenario: Scenario.LostInTimeAndSpace,
    index: 8,
    representativeSet: EncounterSet.LostInTimeAndSpace,
  },
  [Scenario.ReturnToExtracurricularActivity]: {
    scenario: Scenario.ReturnToExtracurricularActivity,
    index: 1,
    representativeSet: EncounterSet.ReturnToExtracurricularActivity,
  },
  [Scenario.ReturnToTheHouseAlwaysWins]: {
    scenario: Scenario.ReturnToTheHouseAlwaysWins,
    index: 2,
    representativeSet: EncounterSet.ReturnToTheHouseAlwaysWins,
  },
  [Scenario.ReturnToTheMiskatonicMuseum]: {
    scenario: Scenario.ReturnToTheMiskatonicMuseum,
    index: 5,
    representativeSet: EncounterSet.ReturnToTheMiskatonicMuseum,
  },
  [Scenario.ReturnToTheEssexCountyExpress]: {
    scenario: Scenario.ReturnToTheEssexCountyExpress,
    index: 6,
    representativeSet: EncounterSet.ReturnToTheEssexCountyExpress,
  },
  [Scenario.ReturnToBloodOnTheAltar]: {
    scenario: Scenario.ReturnToBloodOnTheAltar,
    index: 7,
    representativeSet: EncounterSet.ReturnToBloodOnTheAltar,
  },
  [Scenario.ReturnToUndimensionedAndUnseen]: {
    scenario: Scenario.ReturnToUndimensionedAndUnseen,
    index: 8,
    representativeSet: EncounterSet.ReturnToUndimensionedAndUnseen,
  },
  [Scenario.ReturnToWhereDoomAwaits]: {
    scenario: Scenario.ReturnToWhereDoomAwaits,
    index: 9,
    representativeSet: EncounterSet.ReturnToWhereDoomAwaits,
  },
  [Scenario.ReturnToLostInTimeAndSpace]: {
    scenario: Scenario.ReturnToLostInTimeAndSpace,
    index: 10,
    representativeSet: EncounterSet.ReturnToLostInTimeAndSpace,
  },

  // The Path to Carcosa
  [Scenario.CurtainCall]: {
    scenario: Scenario.CurtainCall,
    index: 1,
    representativeSet: EncounterSet.CurtainCall,
  },
  [Scenario.TheLastKing]: {
    scenario: Scenario.TheLastKing,
    index: 2,
    representativeSet: EncounterSet.TheLastKing,
  },
  [Scenario.EchoesOfThePast]: {
    scenario: Scenario.EchoesOfThePast,
    index: 3,
    representativeSet: EncounterSet.EchoesOfThePast,
  },
  [Scenario.TheUnspeakableOath]: {
    scenario: Scenario.TheUnspeakableOath,
    index: 4,
    representativeSet: EncounterSet.TheUnspeakableOath,
  },
  [Scenario.APhantomOfTruth]: {
    scenario: Scenario.APhantomOfTruth,
    index: 5,
    representativeSet: EncounterSet.APhantomOfTruth,
  },
  [Scenario.ThePallidMask]: {
    scenario: Scenario.ThePallidMask,
    index: 6,
    representativeSet: EncounterSet.ThePallidMask,
  },
  [Scenario.BlackStarsRise]: {
    scenario: Scenario.BlackStarsRise,
    index: 7,
    representativeSet: EncounterSet.BlackStarsRise,
  },
  [Scenario.DimCarcosa]: {
    scenario: Scenario.DimCarcosa,
    index: 8,
    representativeSet: EncounterSet.DimCarcosa,
  },
  [Scenario.ReturnToCurtainCall]: {
    scenario: Scenario.ReturnToCurtainCall,
    index: 1,
    representativeSet: EncounterSet.ReturnToCurtainCall,
  },
  [Scenario.ReturnToTheLastKing]: {
    scenario: Scenario.ReturnToTheLastKing,
    index: 2,
    representativeSet: EncounterSet.ReturnToTheLastKing,
  },
  [Scenario.ReturnToEchoesOfThePast]: {
    scenario: Scenario.ReturnToEchoesOfThePast,
    index: 3,
    representativeSet: EncounterSet.ReturnToEchoesOfThePast,
  },
  [Scenario.ReturnToTheUnspeakableOath]: {
    scenario: Scenario.ReturnToTheUnspeakableOath,
    index: 4,
    representativeSet: EncounterSet.ReturnToTheUnspeakableOath,
  },
  [Scenario.ReturnToAPhantomOfTruth]: {
    scenario: Scenario.ReturnToAPhantomOfTruth,
    index: 5,
    representativeSet: EncounterSet.ReturnToAPhantomOfTruth,
  },
  [Scenario.ReturnToThePallidMask]: {
    scenario: Scenario.ReturnToThePallidMask,
    index: 6,
    representativeSet: EncounterSet.ReturnToThePallidMask,
  },
  [Scenario.ReturnToBlackStarsRise]: {
    scenario: Scenario.ReturnToBlackStarsRise,
    index: 7,
    representativeSet: EncounterSet.ReturnToBlackStarsRise,
  },
  [Scenario.ReturnToDimCarcosa]: {
    scenario: Scenario.ReturnToDimCarcosa,
    index: 8,
    representativeSet: EncounterSet.ReturnToDimCarcosa,
  },

  // The Forgotten Age
  [Scenario.TheUntamedWilds]: {
    scenario: Scenario.TheUntamedWilds,
    index: 1,
    representativeSet: EncounterSet.TheUntamedWilds,
  },
  [Scenario.TheDoomOfEztli]: {
    scenario: Scenario.TheDoomOfEztli,
    index: 2,
    representativeSet: EncounterSet.TheDoomOfEztli,
  },
  [Scenario.ThreadsOfFate]: {
    scenario: Scenario.ThreadsOfFate,
    index: 3,
    representativeSet: EncounterSet.ThreadsOfFate,
  },
  [Scenario.TheBoundaryBeyond]: {
    scenario: Scenario.TheBoundaryBeyond,
    index: 4,
    representativeSet: EncounterSet.TheBoundaryBeyond,
  },
  [Scenario.HeartOfTheEldersPart1]: {
    scenario: Scenario.HeartOfTheEldersPart1,
    index: 5,
    representativeSet: EncounterSet.HeartOfTheElders,
  },
  [Scenario.HeartOfTheEldersPart2]: {
    scenario: Scenario.HeartOfTheEldersPart2,
    index: 6,
    representativeSet: EncounterSet.HeartOfTheElders,
  },
  [Scenario.TheCityOfArchives]: {
    scenario: Scenario.TheCityOfArchives,
    index: 7,
    representativeSet: EncounterSet.TheCityOfArchives,
  },
  [Scenario.TheDepthsOfYoth]: {
    scenario: Scenario.TheDepthsOfYoth,
    index: 8,
    representativeSet: EncounterSet.TheDepthsOfYoth,
  },
  [Scenario.ShatteredAeons]: {
    scenario: Scenario.ShatteredAeons,
    index: 9,
    representativeSet: EncounterSet.ShatteredAeons,
  },
  [Scenario.TurnBackTime]: {
    scenario: Scenario.TurnBackTime,
    index: 10,
    representativeSet: EncounterSet.TurnBackTime,
  },
  [Scenario.ReturnToTheUntamedWilds]: {
    scenario: Scenario.ReturnToTheUntamedWilds,
    index: 1,
    representativeSet: EncounterSet.ReturnToTheUntamedWilds,
  },
  [Scenario.ReturnToTheDoomOfEztli]: {
    scenario: Scenario.ReturnToTheDoomOfEztli,
    index: 2,
    representativeSet: EncounterSet.ReturnToTheDoomOfEztli,
  },
  [Scenario.ReturnToThreadsOfFate]: {
    scenario: Scenario.ReturnToThreadsOfFate,
    index: 3,
    representativeSet: EncounterSet.ReturnToThreadsOfFate,
  },
  [Scenario.ReturnToTheBoundaryBeyond]: {
    scenario: Scenario.ReturnToTheBoundaryBeyond,
    index: 4,
    representativeSet: EncounterSet.ReturnToTheBoundaryBeyond,
  },
  [Scenario.ReturnToHeartOfTheEldersPart1]: {
    scenario: Scenario.ReturnToHeartOfTheEldersPart1,
    index: 5,
    representativeSet: EncounterSet.ReturnToPillarsOfJudgment,
  },
  [Scenario.ReturnToHeartOfTheEldersPart2]: {
    scenario: Scenario.ReturnToHeartOfTheEldersPart2,
    index: 6,
    representativeSet: EncounterSet.ReturnToKnyan,
  },
  [Scenario.ReturnToTheCityOfArchives]: {
    scenario: Scenario.ReturnToTheCityOfArchives,
    index: 7,
    representativeSet: EncounterSet.ReturnToTheCityOfArchives,
  },
  [Scenario.ReturnToTheDepthsOfYoth]: {
    scenario: Scenario.ReturnToTheDepthsOfYoth,
    index: 8,
    representativeSet: EncounterSet.ReturnToTheDepthsOfYoth,
  },
  [Scenario.ReturnToShatteredAeons]: {
    scenario: Scenario.ReturnToShatteredAeons,
    index: 9,
    representativeSet: EncounterSet.ReturnToShatteredAeons,
  },
  [Scenario.ReturnToTurnBackTime]: {
    scenario: Scenario.ReturnToTurnBackTime,
    index: 10,
    representativeSet: EncounterSet.ReturnToTurnBackTime,
  },

  // The Circle Undone
  [Scenario.DisappearanceAtTheTwilightEstate]: {
    scenario: Scenario.DisappearanceAtTheTwilightEstate,
    index: 1,
    representativeSet: EncounterSet.DisappearanceAtTheTwilightEstate,
  },
  [Scenario.TheWitchingHour]: {
    scenario: Scenario.TheWitchingHour,
    index: 2,
    representativeSet: EncounterSet.TheWitchingHour,
  },
  [Scenario.AtDeathsDoorstep]: {
    scenario: Scenario.AtDeathsDoorstep,
    index: 3,
    representativeSet: EncounterSet.AtDeathsDoorstep,
  },
  [Scenario.TheSecretName]: {
    scenario: Scenario.TheSecretName,
    index: 4,
    representativeSet: EncounterSet.TheSecretName,
  },
  [Scenario.TheWagesOfSin]: {
    scenario: Scenario.TheWagesOfSin,
    index: 5,
    representativeSet: EncounterSet.TheWagesOfSin,
  },
  [Scenario.ForTheGreaterGood]: {
    scenario: Scenario.ForTheGreaterGood,
    index: 6,
    representativeSet: EncounterSet.ForTheGreaterGood,
  },
  [Scenario.UnionAndDisillusion]: {
    scenario: Scenario.UnionAndDisillusion,
    index: 7,
    representativeSet: EncounterSet.UnionAndDisillusion,
  },
  [Scenario.InTheClutchesOfChaos]: {
    scenario: Scenario.InTheClutchesOfChaos,
    index: 8,
    representativeSet: EncounterSet.InTheClutchesOfChaos,
  },
  [Scenario.BeforeTheBlackThrone]: {
    scenario: Scenario.BeforeTheBlackThrone,
    index: 10,
    representativeSet: EncounterSet.BeforeTheBlackThrone,
  },
  [Scenario.ReturnToDisappearanceAtTheTwilightEstate]: {
    scenario: Scenario.ReturnToDisappearanceAtTheTwilightEstate,
    index: 1,
    representativeSet: EncounterSet.ReturnToDisappearanceAtTheTwilightEstate,
  },
  [Scenario.ReturnToTheWitchingHour]: {
    scenario: Scenario.ReturnToTheWitchingHour,
    index: 2,
    representativeSet: EncounterSet.ReturnToTheWitchingHour,
  },
  [Scenario.ReturnToAtDeathsDoorstep]: {
    scenario: Scenario.ReturnToAtDeathsDoorstep,
    index: 3,
    representativeSet: EncounterSet.ReturnToAtDeathsDoorstep,
  },
  [Scenario.ReturnToTheSecretName]: {
    scenario: Scenario.ReturnToTheSecretName,
    index: 4,
    representativeSet: EncounterSet.ReturnToTheSecretName,
  },
  [Scenario.ReturnToTheWagesOfSin]: {
    scenario: Scenario.ReturnToTheWagesOfSin,
    index: 5,
    representativeSet: EncounterSet.ReturnToTheWagesOfSin,
  },
  [Scenario.ReturnToForTheGreaterGood]: {
    scenario: Scenario.ReturnToForTheGreaterGood,
    index: 6,
    representativeSet: EncounterSet.ReturnToForTheGreaterGood,
  },
  [Scenario.ReturnToUnionAndDisillusion]: {
    scenario: Scenario.ReturnToUnionAndDisillusion,
    index: 7,
    representativeSet: EncounterSet.ReturnToUnionAndDisillusion,
  },
  [Scenario.ReturnToInTheClutchesOfChaos1]: {
    scenario: Scenario.ReturnToInTheClutchesOfChaos1,
    index: 8,
    representativeSet: EncounterSet.ReturnToInTheClutchesOfChaos,
  },
  [Scenario.ReturnToInTheClutchesOfChaos2]: {
    scenario: Scenario.ReturnToInTheClutchesOfChaos2,
    index: 9,
    representativeSet: EncounterSet.ReturnToInTheClutchesOfChaos,
  },
  [Scenario.ReturnToBeforeTheBlackThrone]: {
    scenario: Scenario.ReturnToBeforeTheBlackThrone,
    index: 10,
    representativeSet: EncounterSet.ReturnToBeforeTheBlackThrone,
  },

  // The Innsmouth Conspiracy
  [Scenario.ThePitOfDespair]: {
    scenario: Scenario.ThePitOfDespair,
    index: 1,
    representativeSet: EncounterSet.ThePitOfDespair,
  },
  [Scenario.TheVanishingOfElinaHarper]: {
    scenario: Scenario.TheVanishingOfElinaHarper,
    index: 2,
    representativeSet: EncounterSet.TheVanishingOfElinaHarper,
  },
  [Scenario.InTooDeep]: {
    scenario: Scenario.InTooDeep,
    index: 3,
    representativeSet: EncounterSet.InTooDeep,
  },
  [Scenario.DevilReef]: {
    scenario: Scenario.DevilReef,
    index: 4,
    representativeSet: EncounterSet.DevilReef,
  },
  [Scenario.HorrorInHighGear]: {
    scenario: Scenario.HorrorInHighGear,
    index: 5,
    representativeSet: EncounterSet.HorrorInHighGear,
  },
  [Scenario.ALightInTheFog]: {
    scenario: Scenario.ALightInTheFog,
    index: 6,
    representativeSet: EncounterSet.ALightInTheFog,
  },
  [Scenario.TheLairOfDagon]: {
    scenario: Scenario.TheLairOfDagon,
    index: 7,
    representativeSet: EncounterSet.TheLairOfDagon,
  },
  [Scenario.IntoTheMaelstrom]: {
    scenario: Scenario.IntoTheMaelstrom,
    index: 8,
    representativeSet: EncounterSet.IntoTheMaelstrom,
  },

  // The Dream-Eaters
  [Scenario.BeyondTheGatesOfSleep]: {
    scenario: Scenario.BeyondTheGatesOfSleep,
    index: 1,
    representativeSet: EncounterSet.BeyondTheGatesOfSleep,
  },
  [Scenario.WakingNightmare]: {
    scenario: Scenario.WakingNightmare,
    index: 2,
    representativeSet: EncounterSet.WakingNightmare,
  },
  [Scenario.TheSearchForKadath]: {
    scenario: Scenario.TheSearchForKadath,
    index: 3,
    representativeSet: EncounterSet.TheSearchForKadath,
  },
  [Scenario.AThousandShapesOfHorror]: {
    scenario: Scenario.AThousandShapesOfHorror,
    index: 4,
    representativeSet: EncounterSet.AThousandShapesOfHorror,
  },
  [Scenario.DarkSideOfTheMoon]: {
    scenario: Scenario.DarkSideOfTheMoon,
    index: 5,
    representativeSet: EncounterSet.DarkSideOfTheMoon,
  },
  [Scenario.PointOfNoReturn]: {
    scenario: Scenario.PointOfNoReturn,
    index: 6,
    representativeSet: EncounterSet.PointOfNoReturn,
  },
  [Scenario.WhereTheGodsDwell]: {
    scenario: Scenario.WhereTheGodsDwell,
    index: 7,
    representativeSet: EncounterSet.WhereTheGodsDwell,
  },
  [Scenario.WeaverOfTheCosmos]: {
    scenario: Scenario.WeaverOfTheCosmos,
    index: 8,
    representativeSet: EncounterSet.WeaverOfTheCosmos,
  },

  // Edge of the Earth
  [Scenario.IceAndDeathPart1]: {
    scenario: Scenario.IceAndDeathPart1,
    index: 2,
    representativeSet: EncounterSet.IceAndDeath,
  },
  [Scenario.IceAndDeathPart2]: {
    scenario: Scenario.IceAndDeathPart2,
    index: 3,
    representativeSet: EncounterSet.IceAndDeath,
  },
  [Scenario.IceAndDeathPart3]: {
    scenario: Scenario.IceAndDeathPart3,
    index: 4,
    representativeSet: EncounterSet.IceAndDeath,
  },
  [Scenario.FatalMirage]: {
    scenario: Scenario.FatalMirage,
    index: 5,
    representativeSet: EncounterSet.FatalMirage,
  },
  [Scenario.ToTheForbiddenPeaks]: {
    scenario: Scenario.ToTheForbiddenPeaks,
    index: 6,
    representativeSet: EncounterSet.ToTheForbiddenPeaks,
  },
  [Scenario.CityOfTheElderThings1]: {
    scenario: Scenario.CityOfTheElderThings1,
    index: 7,
    representativeSet: EncounterSet.CityOfTheElderThings,
  },
  [Scenario.CityOfTheElderThings2]: {
    scenario: Scenario.CityOfTheElderThings2,
    index: 8,
    representativeSet: EncounterSet.CityOfTheElderThings,
  },
  [Scenario.CityOfTheElderThings3]: {
    scenario: Scenario.CityOfTheElderThings3,
    index: 9,
    representativeSet: EncounterSet.CityOfTheElderThings,
  },
  [Scenario.TheHeartOfMadnessPart1]: {
    scenario: Scenario.TheHeartOfMadnessPart1,
    index: 10,
    representativeSet: EncounterSet.TheHeartOfMadness,
  },
  [Scenario.TheHeartOfMadnessPart2]: {
    scenario: Scenario.TheHeartOfMadnessPart2,
    index: 11,
    representativeSet: EncounterSet.TheHeartOfMadness,
  },

  // The Scarlet Keys
  [Scenario.RiddlesAndRain]: {
    scenario: Scenario.RiddlesAndRain,
    index: 1,
    representativeSet: EncounterSet.RiddlesAndRain,
  },
  [Scenario.DeadHeat]: {
    scenario: Scenario.DeadHeat,
    index: 2,
    representativeSet: EncounterSet.DeadHeat,
  },
  [Scenario.SanguineShadows]: {
    scenario: Scenario.SanguineShadows,
    index: 3,
    representativeSet: EncounterSet.SanguineShadows,
  },
  [Scenario.DealingsInTheDark]: {
    scenario: Scenario.DealingsInTheDark,
    index: 4,
    representativeSet: EncounterSet.DealingsInTheDark,
  },
  [Scenario.DancingMad]: {
    scenario: Scenario.DancingMad,
    index: 5,
    representativeSet: EncounterSet.DancingMad,
  },
  [Scenario.OnThinIce]: {
    scenario: Scenario.OnThinIce,
    index: 6,
    representativeSet: EncounterSet.OnThinIce,
  },
  [Scenario.DogsOfWar]: {
    scenario: Scenario.DogsOfWar,
    index: 7,
    representativeSet: EncounterSet.DogsOfWar,
  },
  [Scenario.ShadesOfSuffering]: {
    scenario: Scenario.ShadesOfSuffering,
    index: 8,
    representativeSet: EncounterSet.ShadesOfSuffering,
  },
  [Scenario.WithoutATrace]: {
    scenario: Scenario.WithoutATrace,
    index: 9,
    representativeSet: EncounterSet.WithoutATrace,
  },
  [Scenario.CongressOfTheKeys]: {
    scenario: Scenario.CongressOfTheKeys,
    index: 10,
    representativeSet: EncounterSet.CongressOfTheKeys,
  },

  // The Feast of Hemlock Vale
  [Scenario.WrittenInRock]: {
    scenario: Scenario.WrittenInRock,
    index: 1,
    representativeSet: EncounterSet.WrittenInRock,
  },
  [Scenario.HemlockHouse]: {
    scenario: Scenario.HemlockHouse,
    index: 2,
    representativeSet: EncounterSet.HemlockHouse,
  },
  [Scenario.TheSilentHeath]: {
    scenario: Scenario.TheSilentHeath,
    index: 3,
    representativeSet: EncounterSet.TheSilentHeath,
  },
  [Scenario.TheLostSister]: {
    scenario: Scenario.TheLostSister,
    index: 4,
    representativeSet: EncounterSet.TheLostSister,
  },
  [Scenario.TheThingInTheDepths]: {
    scenario: Scenario.TheThingInTheDepths,
    index: 5,
    representativeSet: EncounterSet.TheThingInTheDepths,
  },
  [Scenario.TheTwistedHollow]: {
    scenario: Scenario.TheTwistedHollow,
    index: 6,
    representativeSet: EncounterSet.TheTwistedHollow,
  },
  [Scenario.TheLongestNight]: {
    scenario: Scenario.TheLongestNight,
    index: 7,
    representativeSet: EncounterSet.TheLongestNight,
  },
  [Scenario.FateOfTheVale]: {
    scenario: Scenario.FateOfTheVale,
    index: 8,
    representativeSet: EncounterSet.FateOfTheVale,
  },

  // The Drowned City
  [Scenario.OneLastJob]: {
    scenario: Scenario.OneLastJob,
    index: 1,
    representativeSet: EncounterSet.OneLastJob,
  },
  [Scenario.TheWesternWall]: {
    scenario: Scenario.TheWesternWall,
    index: 2,
    representativeSet: EncounterSet.TheWesternWall,
  },
  [Scenario.TheDrownedQuarter]: {
    scenario: Scenario.TheDrownedQuarter,
    index: 3,
    representativeSet: EncounterSet.TheDrownedQuarter,
  },
  [Scenario.TheApiary]: {
    scenario: Scenario.TheApiary,
    index: 4,
    representativeSet: EncounterSet.TheApiary,
  },
  [Scenario.TheGrandVault]: {
    scenario: Scenario.TheGrandVault,
    index: 5,
    representativeSet: EncounterSet.TheGrandVault,
  },
  [Scenario.CourtOfTheAncients]: {
    scenario: Scenario.CourtOfTheAncients,
    index: 6,
    representativeSet: EncounterSet.CourtOfTheAncients,
  },
  [Scenario.ObsidianCanyons]: {
    scenario: Scenario.ObsidianCanyons,
    index: 7,
    representativeSet: EncounterSet.ObsidianCanyons,
  },
  [Scenario.SepulchreOfTheSleeper]: {
    scenario: Scenario.SepulchreOfTheSleeper,
    index: 8,
    representativeSet: EncounterSet.SepulchreOfTheSleeper,
  },
  [Scenario.TheDoomOfArkham]: {
    scenario: Scenario.TheDoomOfArkham,
    index: 9,
    representativeSet: EncounterSet.TheDoomOfArkhamPart1,
  },

  // Brethren of Ash
  [Scenario.SpreadingFlames]: {
    scenario: Scenario.SpreadingFlames,
    index: 1,
    representativeSet: EncounterSet.SpreadingFlames,
  },
  [Scenario.SmokeAndMirrors]: {
    scenario: Scenario.SmokeAndMirrors,
    index: 2,
    representativeSet: EncounterSet.SmokeAndMirrors,
  },
  [Scenario.QueenOfAsh]: {
    scenario: Scenario.QueenOfAsh,
    index: 3,
    representativeSet: EncounterSet.QueenOfAsh,
  },
};

/**
 * Helper function to get scenario data by scenario enum value.
 * Returns the scenario's index and representative encounter set.
 */
export function getScenarioData(scenario: Scenario): ScenarioData {
  return scenarioData[scenario];
}

/**
 * Overrides where a kohaku {@link Scenario} code differs from the scenario id
 * used by the ArkhamCards `arkham-cards-data` repository. Any scenario not
 * listed here maps to itself (the kohaku code is already identical).
 *
 * A value of `null` means the scenario has no direct ArkhamCards scenario id —
 * the Scarlet Keys scenarios are modelled by travel location there, not by the
 * named scenario, so they need bespoke handling.
 */
const arkhamCardsScenarioIdOverrides: Partial<Record<Scenario, string | null>> = {
  // Night of the Zealot — ArkhamCards keys these by encounter-set codename.
  [Scenario.TheGathering]: 'torch',
  [Scenario.TheMidnightMasks]: 'arkham',
  [Scenario.TheDevourerBelow]: 'tentacles',
  // ArkhamCards drops the leading "the" / uses the short id.
  [Scenario.TheEssexCountyExpress]: 'essex_county_express',
  [Scenario.ReturnToTheEssexCountyExpress]: 'return_to_essex_county_express',
  [Scenario.WhereTheGodsDwell]: 'where_gods_dwell',
  [Scenario.TheUntamedWilds]: 'wilds',
  [Scenario.TheDoomOfEztli]: 'eztli',
  // ArkhamCards keeps City of the Elder Things a single scenario (no parts).
  [Scenario.CityOfTheElderThings1]: 'city_of_the_elder_things',
  [Scenario.CityOfTheElderThings2]: 'city_of_the_elder_things',
  [Scenario.CityOfTheElderThings3]: 'city_of_the_elder_things',
  // ArkhamCards reuses the base id / keeps these single.
  [Scenario.ReturnToDisappearanceAtTheTwilightEstate]: 'disappearance_at_the_twilight_estate',
  [Scenario.ReturnToInTheClutchesOfChaos1]: 'return_to_in_the_clutches_of_chaos',
  [Scenario.ReturnToInTheClutchesOfChaos2]: 'return_to_in_the_clutches_of_chaos',
  // The Scarlet Keys — modelled by location in ArkhamCards; no 1:1 id.
  [Scenario.DeadHeat]: null,
  [Scenario.SanguineShadows]: null,
  [Scenario.DealingsInTheDark]: null,
  [Scenario.DancingMad]: null,
  [Scenario.OnThinIce]: null,
  [Scenario.DogsOfWar]: null,
  [Scenario.ShadesOfSuffering]: null,
  [Scenario.WithoutATrace]: null,
  [Scenario.CongressOfTheKeys]: null,
};

/**
 * Converts a kohaku {@link Scenario} into the scenario id used by the
 * ArkhamCards `arkham-cards-data` repository, for a future ArkhamCards
 * integration (e.g. importing a player's campaign log).
 *
 * Returns `null` when the scenario has no direct ArkhamCards equivalent
 * (some Scarlet Keys scenarios). Most scenarios map to their own code string.
 */
export function scenarioToArkhamCardsId(scenario: Scenario): string | null {
  const override = arkhamCardsScenarioIdOverrides[scenario];
  return override === undefined ? scenario : override;
}
