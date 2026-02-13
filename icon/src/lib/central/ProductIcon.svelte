<script lang="ts">
  import { Product } from "@5argon/arkham-kohaku";
  import type { ComponentType } from "svelte";

  interface Prop {
    product: Product;
  }
  const { product }: Prop = $props();

  // Dynamically import the icon component based on product type
  function getIconComponent(prod: Product) {
    switch (prod) {
      case Product.RandomBasicWeakness:
      case Product.CoreSet:
      case Product.RevisedCoreSet:
        return import("../individual/svelte/Core.svelte");
      case Product.TheDunwichLegacyInvestigatorExpansion:
      case Product.TheDunwichLegacyCampaignExpansion:
        return import("../individual/svelte/Set.svelte");
      case Product.ThePathToCarcosaCampaignExpansion:
      case Product.ThePathToCarcosaInvestigatorExpansion:
        return import("../individual/svelte/Carcosa.svelte");
      case Product.TheForgottenAgeCampaignExpansion:
      case Product.TheForgottenAgeInvestigatorExpansion:
        return import("../individual/svelte/TheForgottenAge.svelte");
      case Product.TheCircleUndoneCampaignExpansion:
      case Product.TheCircleUndoneInvestigatorExpansion:
        return import("../individual/svelte/TheCircleUndone.svelte");
      case Product.TheDreamEatersCampaignExpansion:
      case Product.TheDreamEatersInvestigatorExpansion:
        return import("../individual/svelte/Dream.svelte");
      case Product.TheInnsmouthConspiracyCampaignExpansion:
      case Product.TheInnsmouthConspiracyInvestigatorExpansion:
        return import("../individual/svelte/Tic.svelte");
      case Product.EdgeOfTheEarthCampaignExpansion:
        return import("../individual/svelte/EoeCampaign.svelte");
      case Product.EdgeOfTheEarthInvestigatorExpansion:
        return import("../individual/svelte/Eoe.svelte");
      case Product.TheScarletKeysCampaignExpansion:
        return import("../individual/svelte/Tskc.svelte");
      case Product.TheScarletKeysInvestigatorExpansion:
        return import("../individual/svelte/Tsk.svelte");
      case Product.TheFeastOfHemlockValeCampaignExpansion:
        return import("../individual/svelte/Fhvc.svelte");
      case Product.TheFeastOfHemlockValeInvestigatorExpansion:
        return import("../individual/svelte/Fhvp.svelte");
      case Product.TheDrownedCityCampaignExpansion:
        return import("../individual/svelte/Tdcc.svelte");
      case Product.TheDrownedCityInvestigatorExpansion:
        return import("../individual/svelte/Tdcp.svelte");
      case Product.ReturnToTheNightOfTheZealot:
        return import("../individual/svelte/Rtnotz.svelte");
      case Product.ReturnToTheDunwichLegacy:
        return import("../individual/svelte/ReturnToTheDunwichLegacy.svelte");
      case Product.ReturnToThePathToCarcosa:
        return import("../individual/svelte/ReturnToThePathToCarcosa.svelte");
      case Product.ReturnToTheForgottenAge:
        return import("../individual/svelte/ReturnToTheForgottenAge.svelte");
      case Product.ReturnToTheCircleUndone:
        return import("../individual/svelte/Rttcu.svelte");
      case Product.NathanielCho:
        return import("../individual/svelte/Nate.svelte");
      case Product.HarveyWalters:
        return import("../individual/svelte/Harvey.svelte");
      case Product.WinifredHabbamock:
        return import("../individual/svelte/Winifred.svelte");
      case Product.JacquelineFine:
        return import("../individual/svelte/Jacqueline.svelte");
      case Product.StellaClark:
        return import("../individual/svelte/Stella.svelte");
      case Product.CurseOfTheRougarou:
        return import("../individual/svelte/CurseOfTheRougarou.svelte");
      case Product.CarnevaleOfHorrors:
        return import("../individual/svelte/Carnevale.svelte");
      case Product.TheLabyrinthsOfLunacy:
        return import("../individual/svelte/InTheLabyrinthsOfLunacy.svelte");
      case Product.GuardiansOfTheAbyss:
        return import("../individual/svelte/Guardians.svelte");
      case Product.MurderAtTheExcelsiorHotel:
        return import("../individual/svelte/MurderAtTheExcelsiorHotel.svelte");
      case Product.TheBlobThatAteEverything:
        return import("../individual/svelte/TheBlobThatAteEverything.svelte");
      case Product.TheBlobThatAteEverythingElse:
        return import("../individual/svelte/BlobThatAteEverythingElse.svelte");
      case Product.WarOfTheOuterGods:
        return import("../individual/svelte/WarOfTheOuterGods.svelte");
      case Product.MachinationsThroughTime:
        return import("../individual/svelte/MachinationsThroughTime.svelte");
      case Product.FortuneAndFolly:
        return import("../individual/svelte/FortuneAndFolly.svelte");
      case Product.FilmFatale:
        return import("../individual/svelte/FilmFatale.svelte");
      case Product.TheMidwinterGala:
        return import("../individual/svelte/Gala.svelte");
      case Product.ParallelInvestigators:
        return import("../individual/svelte/Parallel.svelte");
      case Product.Promotional:
        return import("../individual/svelte/Novella.svelte");
      case Product.CoreSet2026:
        return import("../individual/svelte/CoreSet2026.svelte");
      default:
        const _exhaustive: never = prod;
        throw new Error(`Unhandled product: ${_exhaustive}`);
    }
  }

  const iconComponent = $derived(getIconComponent(product));
</script>

{#await iconComponent}
  <!-- Optional: Loading state -->
  <div class="icon-loading" aria-label="Loading icon">
    <!-- You can add a spinner or placeholder here if needed -->
  </div>
{:then module}
  {@const Icon = module.default}
  <Icon />
{:catch error}
  <!-- Error fallback -->
  <div class="icon-error" aria-label="Icon failed to load">
    <span>⚠</span>
  </div>
{/await}
