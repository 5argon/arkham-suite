/**
 * Moved to the shared `ui` package so both `starter` and `life` render Arkham
 * inline markup identically. Re-exported here to keep existing import sites
 * (`$lib/utility/arkham-markup`) stable.
 */
export { parseArkhamMarkup } from '@5argon/arkham-life-ui';
