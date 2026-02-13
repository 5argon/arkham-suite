<script lang="ts">
  import { ChaosToken } from "@5argon/arkham-kohaku";
  import type { ComponentType } from "svelte";

  interface Prop {
    chaosToken: ChaosToken;
    fillColor?: string;
    overlayColor?: string;
    highlightColor?: string;
    circular?: boolean;
  }
  const {
    chaosToken,
    fillColor = "",
    overlayColor = "",
    highlightColor = "",
    circular = false,
  }: Prop = $props();

  function getFillComponent(token: ChaosToken) {
    switch (token) {
      // Number tokens and Frost use TokenNumberFill
      case ChaosToken.TokenP1:
      case ChaosToken.Token0:
      case ChaosToken.TokenM1:
      case ChaosToken.TokenM2:
      case ChaosToken.TokenM3:
      case ChaosToken.TokenM4:
      case ChaosToken.TokenM5:
      case ChaosToken.TokenM6:
      case ChaosToken.TokenM7:
      case ChaosToken.TokenM8:
      case ChaosToken.TokenFrost:
        return import("../individual/svelte/TokenNumberFill.svelte");

      // Symbol tokens use specific fill components
      case ChaosToken.TokenSkull:
        return import("../individual/svelte/TokenSymbolFill.svelte");
      case ChaosToken.TokenCultist:
        return import("../individual/svelte/TokenCultistFill.svelte");
      case ChaosToken.TokenTablet:
        return import("../individual/svelte/TokenTabletFill.svelte");
      case ChaosToken.TokenElderThing:
        return import("../individual/svelte/TokenElderThingFill.svelte");
      case ChaosToken.TokenAutofail:
        return import("../individual/svelte/TokenSymbolFill.svelte");
      case ChaosToken.TokenElderSign:
        return import("../individual/svelte/TokenElderSignFill.svelte");
      case ChaosToken.TokenBless:
        return import("../individual/svelte/TokenBlessFill.svelte");
      case ChaosToken.TokenCurse:
        return import("../individual/svelte/TokenCurseFill.svelte");
      default:
        const _exhaustive: never = token;
        throw new Error(`Unhandled chaos token: ${_exhaustive}`);
    }
  }

  function getOverlayComponent(token: ChaosToken) {
    switch (token) {
      // Number tokens use TokenNumberOverlay
      case ChaosToken.TokenP1:
      case ChaosToken.Token0:
      case ChaosToken.TokenM1:
      case ChaosToken.TokenM2:
      case ChaosToken.TokenM3:
      case ChaosToken.TokenM4:
      case ChaosToken.TokenM5:
      case ChaosToken.TokenM6:
      case ChaosToken.TokenM7:
      case ChaosToken.TokenM8:
        return import("../individual/svelte/TokenNumberOverlay.svelte");

      // Symbol tokens use specific overlay components
      case ChaosToken.TokenSkull:
        return import("../individual/svelte/TokenSkullOverlay.svelte");
      case ChaosToken.TokenCultist:
        return import("../individual/svelte/TokenCultistOverlay.svelte");
      case ChaosToken.TokenTablet:
        return import("../individual/svelte/TokenTabletOverlay.svelte");
      case ChaosToken.TokenElderThing:
        return import("../individual/svelte/TokenElderThingOverlay.svelte");
      case ChaosToken.TokenAutofail:
        return import("../individual/svelte/TokenAutoFailOverlay.svelte");
      case ChaosToken.TokenElderSign:
        return import("../individual/svelte/TokenElderSignOverlay.svelte");
      case ChaosToken.TokenBless:
        return import("../individual/svelte/TokenBlessOverlay.svelte");
      case ChaosToken.TokenCurse:
        return import("../individual/svelte/TokenCurseOverlay.svelte");
      case ChaosToken.TokenFrost:
        return import("../individual/svelte/TokenFrostOverlay.svelte");
      default:
        const _exhaustive: never = token;
        throw new Error(`Unhandled chaos token: ${_exhaustive}`);
    }
  }

  function getHighlightComponent(token: ChaosToken) {
    switch (token) {
      case ChaosToken.TokenP1:
        return import("../individual/svelte/Token1Highlight.svelte");
      case ChaosToken.Token0:
        return import("../individual/svelte/Token0Highlight.svelte");
      case ChaosToken.TokenM1:
        return import("../individual/svelte/TokenMinus1Highlight.svelte");
      case ChaosToken.TokenM2:
        return import("../individual/svelte/TokenMinus2Highlight.svelte");
      case ChaosToken.TokenM3:
        return import("../individual/svelte/TokenMinus3Highlight.svelte");
      case ChaosToken.TokenM4:
        return import("../individual/svelte/TokenMinus4Highlight.svelte");
      case ChaosToken.TokenM5:
        return import("../individual/svelte/TokenMinus5Highlight.svelte");
      case ChaosToken.TokenM6:
        return import("../individual/svelte/TokenMinus6Highlight.svelte");
      case ChaosToken.TokenM7:
        return import("../individual/svelte/TokenMinus7Highlight.svelte");
      case ChaosToken.TokenM8:
        return import("../individual/svelte/TokenMinus8Highlight.svelte");
      case ChaosToken.TokenSkull:
        return import("../individual/svelte/TokenSkullHighlight.svelte");
      case ChaosToken.TokenCultist:
        return import("../individual/svelte/TokenCultistHighlight.svelte");
      case ChaosToken.TokenTablet:
        return import("../individual/svelte/TokenTabletHighlight.svelte");
      case ChaosToken.TokenElderThing:
        return import("../individual/svelte/TokenElderThingHighlight.svelte");
      case ChaosToken.TokenAutofail:
        return import("../individual/svelte/TokenAutoFailHighlight.svelte");
      case ChaosToken.TokenElderSign:
        return import("../individual/svelte/TokenElderSignHighlight.svelte");
      case ChaosToken.TokenFrost:
        return import("../individual/svelte/TokenFrostHighlight.svelte");
      case ChaosToken.TokenBless:
        return import("../individual/svelte/TokenBlessOverlay.svelte");
      case ChaosToken.TokenCurse:
        return import("../individual/svelte/TokenCurseOverlay.svelte");
      default:
        const _exhaustive: never = token;
        throw new Error(`Unhandled chaos token: ${_exhaustive}`);
    }
  }

  function getSealedComponent(token: ChaosToken) {
    switch (token) {
      case ChaosToken.TokenP1:
        return import("../individual/svelte/Token1Sealed.svelte");
      case ChaosToken.Token0:
        return import("../individual/svelte/Token0Sealed.svelte");
      case ChaosToken.TokenM1:
        return import("../individual/svelte/TokenMinus1Sealed.svelte");
      case ChaosToken.TokenM2:
        return import("../individual/svelte/TokenMinus2Sealed.svelte");
      case ChaosToken.TokenM3:
        return import("../individual/svelte/TokenMinus3Sealed.svelte");
      case ChaosToken.TokenM4:
        return import("../individual/svelte/TokenMinus4Sealed.svelte");
      case ChaosToken.TokenM5:
        return import("../individual/svelte/TokenMinus5Sealed.svelte");
      case ChaosToken.TokenM6:
        return import("../individual/svelte/TokenMinus6Sealed.svelte");
      case ChaosToken.TokenM7:
        return import("../individual/svelte/TokenMinus7Sealed.svelte");
      case ChaosToken.TokenM8:
        return import("../individual/svelte/TokenMinus8Sealed.svelte");
      case ChaosToken.TokenSkull:
        return import("../individual/svelte/TokenSkullSealed.svelte");
      case ChaosToken.TokenCultist:
        return import("../individual/svelte/TokenCultistSealed.svelte");
      case ChaosToken.TokenTablet:
        return import("../individual/svelte/TokenTabletSealed.svelte");
      case ChaosToken.TokenElderThing:
        return import("../individual/svelte/TokenElderThingSealed.svelte");
      case ChaosToken.TokenAutofail:
        return import("../individual/svelte/TokenAutoFailSealed.svelte");
      case ChaosToken.TokenElderSign:
        return import("../individual/svelte/TokenElderSignSealed.svelte");
      case ChaosToken.TokenFrost:
        return import("../individual/svelte/TokenFrostSealed.svelte");
      case ChaosToken.TokenBless:
        return import("../individual/svelte/TokenBlessSealed.svelte");
      case ChaosToken.TokenCurse:
        return import("../individual/svelte/TokenCurseSealed.svelte");
      default:
        const _exhaustive: never = token;
        throw new Error(`Unhandled chaos token: ${_exhaustive}`);
    }
  }

  // Derived reactive values
  const fillComponent = $derived(getFillComponent(chaosToken));
  const overlayComponent = $derived(getOverlayComponent(chaosToken));
  const highlightComponent = $derived(getHighlightComponent(chaosToken));
  const sealedOutlineComponent = $derived(
    circular ? import("../individual/svelte/TokenSealedOutline.svelte") : null,
  );
  const sealedComponent = $derived(
    circular ? getSealedComponent(chaosToken) : null,
  );
</script>

{#if circular}
  <span
    class="relative inline-block"
    style="line-height: 0; vertical-align: middle;"
  >
    <!-- Sealed Outline Layer -->
    {#if sealedOutlineComponent}
      {#await sealedOutlineComponent}
        <div class="icon-loading" aria-label="Loading icon"></div>
      {:then module}
        {@const OutlineIcon = module.default}
        <span
          class={`absolute inset-0 ${fillColor}`}
          style="line-height: 0; display: block;"
        >
          <OutlineIcon />
        </span>
      {/await}
    {/if}

    <!-- Sealed Token Layer -->
    {#if sealedComponent}
      {#await sealedComponent}
        <!-- Loading -->
      {:then module}
        {@const SealedIcon = module.default}
        <span
          class={`relative ${fillColor}`}
          style="line-height: 0; display: block;"
        >
          <SealedIcon />
        </span>
      {:catch error}
        <div class="icon-error" aria-label="Icon failed to load">
          <span>⚠</span>
        </div>
      {/await}
    {/if}
  </span>
{:else}
  <span
    class="relative inline-block"
    style="line-height: 0; vertical-align: middle;"
  >
    <!-- Fill Layer -->
    {#if fillComponent}
      {#await fillComponent}
        <div class="icon-loading" aria-label="Loading icon"></div>
      {:then module}
        {@const FillIcon = module.default}
        <span
          class={`absolute inset-0 ${fillColor}`}
          style="line-height: 0; display: block;"
        >
          <FillIcon />
        </span>
      {/await}
    {/if}

    <!-- Overlay Layer -->
    {#if overlayComponent}
      {#await overlayComponent}
        <!-- Loading -->
      {:then module}
        {@const OverlayIcon = module.default}
        <span
          class={`absolute inset-0 ${overlayColor}`}
          style="line-height: 0; display: block;"
        >
          <OverlayIcon />
        </span>
      {/await}
    {/if}

    <!-- Highlight Layer -->
    {#if highlightComponent}
      {#await highlightComponent}
        <!-- Loading -->
      {:then module}
        {@const HighlightIcon = module.default}
        <span
          class={`relative ${highlightColor}`}
          style="line-height: 0; display: block;"
        >
          <HighlightIcon />
        </span>
      {/await}
    {/if}
  </span>
{/if}
