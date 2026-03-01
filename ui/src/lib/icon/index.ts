export { FaIconType } from './fa-icon-type.js';
export { default as FaIcon } from './FaIcon.svelte';
// Re-export the encounter-set glyph from the icon package so consumers (e.g. life)
// can render a scenario's icon without depending on @5argon/arkham-icon directly.
export { EncounterSetIcon } from '@5argon/arkham-icon';
