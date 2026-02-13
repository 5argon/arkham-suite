<script lang="ts">
  import type { ArkhamInlineIcon } from "@5argon/arkham-kohaku";

  interface Prop {
    icon: ArkhamInlineIcon;
  }
  const { icon }: Prop = $props();

  // Dynamically import the icon component based on type
  function getIconComponent(iconType: ArkhamInlineIcon) {
    switch (iconType) {
      case '[reaction]':
        return import('../individual/svelte/Reaction1.svelte');
      case '[action]':
        return import('../individual/svelte/Action1.svelte');
      case '[fast]':
        return import('../individual/svelte/Free1.svelte');
      case '[elder_sign]':
        return import('../individual/svelte/ElderSign1.svelte');
      case '[skull]':
        return import('../individual/svelte/Skull1.svelte');
      case '[cultist]':
        return import('../individual/svelte/Cultist1.svelte');
      case '[tablet]':
        return import('../individual/svelte/Tablet1.svelte');
      case '[elder_thing]':
        return import('../individual/svelte/ElderThing1.svelte');
      case '[auto_fail]':
        return import('../individual/svelte/AutoFail1.svelte');
      case '[curse]':
        return import('../individual/svelte/Curse1.svelte');
      case '[bless]':
        return import('../individual/svelte/Bless1.svelte');
      case '[willpower]':
        return import('../individual/svelte/Willpower1.svelte');
      case '[intellect]':
        return import('../individual/svelte/Intellect1.svelte');
      case '[combat]':
        return import('../individual/svelte/Combat1.svelte');
      case '[agility]':
        return import('../individual/svelte/Agility1.svelte');
      case '[wild]':
        return import('../individual/svelte/Wild1.svelte');
      case '[mystic]':
        return import('../individual/svelte/Mystic1.svelte');
      case '[rogue]':
        return import('../individual/svelte/Rogue1.svelte');
      case '[seeker]':
        return import('../individual/svelte/Seeker1.svelte');
      case '[survivor]':
        return import('../individual/svelte/Survivor1.svelte');
      case '[guardian]':
        return import('../individual/svelte/Guardian1.svelte');
      case '[neutral]':
        return import('../individual/svelte/Neutral1.svelte');
      case '[health]':
        return import('../individual/svelte/Health1.svelte');
      case '[sanity]':
        return import('../individual/svelte/Sanity1.svelte');
      case '[per_investigator]':
        return import('../individual/svelte/PerInvestigator1.svelte');
      case '[frost]':
        return import('../individual/svelte/Frost1.svelte');
      case '[seal_a]':
        return import('../individual/svelte/SealA1.svelte');
      case '[seal_b]':
        return import('../individual/svelte/SealB1.svelte');
      case '[seal_c]':
        return import('../individual/svelte/SealC1.svelte');
      case '[seal_d]':
        return import('../individual/svelte/SealD1.svelte');
      case '[seal_e]':
        return import('../individual/svelte/SealE1.svelte');
      default:
        const _exhaustive: never = iconType;
        throw new Error(`Unhandled inline icon: ${_exhaustive}`);
    }
  }

  const iconComponent = $derived(getIconComponent(icon));
</script>

{#await iconComponent}
  <!-- Optional: Loading state -->
  <span class="icon-loading" aria-label="Loading icon">...</span>
{:then module}
  {@const Icon = module.default}
  <Icon />
{:catch error}
  <!-- Error fallback -->
  <span class="icon-error" aria-label="Icon failed to load">⚠</span>
{/await}

<style>
  .icon-loading,
  .icon-error {
    display: inline;
    font-size: 0.75em;
  }
</style>
