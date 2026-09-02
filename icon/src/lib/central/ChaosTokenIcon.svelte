<script lang="ts">
  import { ChaosToken } from "@5argon/arkham-kohaku";
  import type { Component } from "svelte";

  interface Prop {
    chaosToken: ChaosToken;
    /** Render the sealed (outline ring + symbol) variant instead of the layered token face. */
    sealed?: boolean;
    /**
     * Border ring / outline selection:
     *  - Non-sealed: draws a thin ring around the token (only for number/symbol/frost tokens).
     *  - Sealed: INVERTED — `false` (default) uses the bordered outline tinted with the token
     *    accent color; `true` uses the no-border outline tinted with the neutral D20 color.
     */
    border?: boolean;
    /**
     * Ignore the built-in token colors and render every layer in the inherited font color
     * (currentColor). Useful for monochrome contexts where the token should follow the text.
     */
    noColor?: boolean;
    /**
     * Skip the circular gradient disc behind the non-sealed token face, leaving just the layered
     * glyph (the disc is already absent in sealed / noColor modes).
     */
    noDisc?: boolean;
  }
  const {
    chaosToken,
    sealed = false,
    border = false,
    noColor = false,
    noDisc = false,
  }: Prop = $props();

  // ---------------------------------------------------------------------------
  // Built-in colors.
  // ---------------------------------------------------------------------------
  const BONE = "#E6E1D3"; // overlay tone shared by almost every token
  const WHITE = "#FFFBF2"; // highlight tone shared by number/symbol tokens
  const NUMBER_FILL = "#394852"; // symbol-fill tone behind the number tokens
  const D20 = "#475259"; // theme fallback used by sealed number tokens

  interface TokenColors {
    fill?: string;
    overlay?: string;
    highlight?: string;
    /** Color of the outline ring + symbol in sealed mode. */
    sealed: string;
  }

  function getColors(token: ChaosToken): TokenColors {
    switch (token) {
      case ChaosToken.TokenP1:
        return {
          fill: NUMBER_FILL,
          overlay: "#ECBA59",
          highlight: WHITE,
          sealed: D20,
        };
      case ChaosToken.Token0:
      case ChaosToken.TokenM1:
      case ChaosToken.TokenM2:
      case ChaosToken.TokenM3:
      case ChaosToken.TokenM4:
      case ChaosToken.TokenM5:
      case ChaosToken.TokenM6:
      case ChaosToken.TokenM7:
      case ChaosToken.TokenM8:
        return {
          fill: NUMBER_FILL,
          overlay: BONE,
          highlight: WHITE,
          sealed: D20,
        };
      case ChaosToken.TokenFrost:
        return {
          fill: "#3D3A63",
          overlay: BONE,
          highlight: WHITE,
          sealed: "#3D3A63",
        };
      case ChaosToken.TokenSkull:
        return {
          fill: "#552D2D",
          overlay: BONE,
          highlight: WHITE,
          sealed: "#552D2D",
        };
      case ChaosToken.TokenCultist:
        return {
          fill: "#314629",
          overlay: BONE,
          highlight: WHITE,
          sealed: "#314629",
        };
      case ChaosToken.TokenTablet:
        return {
          fill: "#294146",
          overlay: BONE,
          highlight: WHITE,
          sealed: "#294146",
        };
      case ChaosToken.TokenElderThing:
        return {
          fill: "#442946",
          overlay: BONE,
          highlight: WHITE,
          sealed: "#442946",
        };
      case ChaosToken.TokenAutofail:
        // No fill layer.
        return { overlay: BONE, highlight: "#8D181E", sealed: "#7D1318" };
      case ChaosToken.TokenElderSign:
        return {
          fill: "#427DAD",
          overlay: BONE,
          highlight: BONE,
          sealed: "#4477A1",
        };
      case ChaosToken.TokenBless:
        // No highlight layer.
        return { fill: "#9D702A", overlay: BONE, sealed: "#9D702A" };
      case ChaosToken.TokenCurse:
        // No highlight layer.
        return { fill: "#35232F", overlay: BONE, sealed: "#3A2342" };
      case ChaosToken.TokenBlood:
        // The fill artwork carries its own red; keep the accent in sync with it.
        return {
          fill: "#C22026",
          overlay: BONE,
          highlight: WHITE,
          sealed: "#C22026",
        };
      default:
        const _exhaustive: never = token;
        throw new Error(`Unhandled chaos token: ${_exhaustive}`);
    }
  }

  // The non-sealed token sits on a circular radial-gradient "disc" backdrop.
  function getDiscGradient(token: ChaosToken): string {
    switch (token) {
      case ChaosToken.TokenFrost:
        return "radial-gradient(circle at 50% 50%, #3D3A63 66%, #495483 100%)";
      case ChaosToken.TokenAutofail:
        return "radial-gradient(circle at 50% 50%, #8D181E 75%, #6A0B10 100%)";
      case ChaosToken.TokenElderSign:
        return "radial-gradient(circle at 50% 50%, #33A1FB 0%, #3C8AC9 50%, #457398 100%)";
      case ChaosToken.TokenBless:
        return "radial-gradient(circle at 50% 50%, #9C702A 25%, #695823 100%)";
      case ChaosToken.TokenCurse:
        return "radial-gradient(circle at 50% 50%, #362330 25%, #3B224A 100%)";
      case ChaosToken.TokenBlood:
        return "radial-gradient(circle at 50% 50%, #C22026 40%, #7A1418 100%)";
      default:
        // Cream disc shared by the number and symbol tokens.
        return "radial-gradient(circle at 50% 50%, #FFFBF2 60%, #D6CFB9 100%)";
    }
  }

  function getFillComponent(token: ChaosToken) {
    switch (token) {
      // Number tokens use the SYMBOL fill shape.
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
        return import("../individual/svelte/TokenSymbolFill.svelte");

      // Frost is the only token that uses the NUMBER fill shape (token_number_fill).
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
      // Auto-fail has NO fill layer (only overlay + highlight).
      case ChaosToken.TokenAutofail:
        return null;
      case ChaosToken.TokenElderSign:
        return import("../individual/svelte/TokenElderSignFill.svelte");
      case ChaosToken.TokenBless:
        return import("../individual/svelte/TokenBlessFill.svelte");
      case ChaosToken.TokenCurse:
        return import("../individual/svelte/TokenCurseFill.svelte");
      case ChaosToken.TokenBlood:
        return import("../individual/svelte/TokenBloodFill.svelte");
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
      case ChaosToken.TokenBlood:
        return import("../individual/svelte/TokenBloodOverlay.svelte");
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
      case ChaosToken.TokenBlood:
        return import("../individual/svelte/TokenBloodHighlight.svelte");
      // Bless and Curse have NO highlight layer (only fill + overlay).
      case ChaosToken.TokenBless:
      case ChaosToken.TokenCurse:
        return null;
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
      case ChaosToken.TokenBlood:
        return import("../individual/svelte/TokenBloodSealed.svelte");
      case ChaosToken.TokenBless:
        return import("../individual/svelte/TokenBlessSealed.svelte");
      case ChaosToken.TokenCurse:
        return import("../individual/svelte/TokenCurseSealed.svelte");
      default:
        const _exhaustive: never = token;
        throw new Error(`Unhandled chaos token: ${_exhaustive}`);
    }
  }

  // Each token assembles a different set of layers, in a token-specific paint order.
  // We build an ordered list (bottom -> top) so missing layers are simply absent and
  // unusual orderings (e.g. Elder Sign paints its fill ON TOP of the overlay) are data.
  type Layer = {
    kind: "fill" | "overlay" | "highlight";
    component: Promise<{ default: Component }>;
    color?: string;
  };

  const layers = $derived.by((): Layer[] => {
    const fill = getFillComponent(chaosToken);
    const overlay = getOverlayComponent(chaosToken);
    const highlight = getHighlightComponent(chaosToken);
    const colors = getColors(chaosToken);

    // Elder Sign is the exception: its symbol fill paints above the overlay.
    const fillAboveOverlay = chaosToken === ChaosToken.TokenElderSign;

    const result: Layer[] = [];
    const fillLayer: Layer | null = fill
      ? { kind: "fill", component: fill, color: colors.fill }
      : null;
    const overlayLayer: Layer | null = overlay
      ? { kind: "overlay", component: overlay, color: colors.overlay }
      : null;

    if (fillAboveOverlay) {
      if (overlayLayer) result.push(overlayLayer);
      if (fillLayer) result.push(fillLayer);
    } else {
      if (fillLayer) result.push(fillLayer);
      if (overlayLayer) result.push(overlayLayer);
    }
    if (highlight) {
      result.push({
        kind: "highlight",
        component: highlight,
        color: colors.highlight,
      });
    }
    return result;
  });

  // The non-sealed border ring is only drawn for the
  // number/symbol/frost tokens — not for auto_fail/elder_sign/bless/curse.
  function tokenSupportsBorderRing(token: ChaosToken): boolean {
    switch (token) {
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
      case ChaosToken.TokenSkull:
      case ChaosToken.TokenCultist:
      case ChaosToken.TokenTablet:
      case ChaosToken.TokenElderThing:
      case ChaosToken.TokenFrost:
        return true;
      default:
        return false;
    }
  }

  const BORDER_RING_COLOR = "#9B9B9B";

  const showBorderRing = $derived(
    !sealed && border && tokenSupportsBorderRing(chaosToken),
  );

  // Disc backdrop for non-sealed tokens (suppressed in noColor / sealed / noDisc modes).
  const discGradient = $derived(
    !sealed && !noColor && !noDisc ? getDiscGradient(chaosToken) : null,
  );

  // Sealed mode inverts `border`: default uses the bordered outline tinted with the
  // token accent color; border=true uses the no-border outline tinted with neutral D20.
  const sealedColor = $derived(border ? D20 : getColors(chaosToken).sealed);

  const sealedOutlineComponent = $derived(
    sealed
      ? border
        ? import("../individual/svelte/TokenSealedOutlineNoBorder.svelte")
        : import("../individual/svelte/TokenSealedOutline.svelte")
      : null,
  );
  const sealedComponent = $derived(
    sealed ? getSealedComponent(chaosToken) : null,
  );

  // Build the inline style for a layer, honoring the noColor escape hatch.
  // `display: flex` lays the inline-block `.icon` svg out as a flex item so the
  // span's box equals the glyph box exactly — without it the svg's baseline slack
  // makes the wrapper taller than the symbol and the disc backdrop sits off-center.
  function layerStyle(position: string, color?: string): string {
    const base = `${position} line-height: 0; display: flex;`;
    return noColor || !color ? base : `${base} color: ${color};`;
  }
</script>

{#if sealed}
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
        <span style={layerStyle("position: absolute; inset: 0;", sealedColor)}>
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
        <span style={layerStyle("position: relative;", sealedColor)}>
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
    <!-- Disc backdrop: the circular radial-gradient body behind the symbol layers. -->
    {#if discGradient}
      <span
        aria-hidden="true"
        style={`position: absolute; inset: 0; border-radius: 50%; background: ${discGradient};`}
      ></span>
    {/if}

    <!--
      Layers paint bottom -> top in array order. The last layer is `relative` so it
      gives the wrapper its intrinsic size; the rest are absolutely stacked on top of it.
    -->
    {#each layers as layer, i (layer.kind)}
      {#await layer.component}
        {#if i === 0}
          <div class="icon-loading" aria-label="Loading icon"></div>
        {/if}
      {:then module}
        {@const LayerIcon = module.default}
        <span
          style={layerStyle(
            i === layers.length - 1
              ? "position: relative;"
              : "position: absolute; inset: 0;",
            layer.color,
          )}
        >
          <LayerIcon />
        </span>
      {/await}
    {/each}

    <!-- Border ring: a thin circle drawn on top. -->
    {#if showBorderRing}
      <span
        aria-hidden="true"
        style={`position: absolute; inset: 0; border-radius: 50%; line-height: 0; display: block; border: 1px solid ${noColor ? "currentColor" : BORDER_RING_COLOR};`}
      ></span>
    {/if}
  </span>
{/if}
