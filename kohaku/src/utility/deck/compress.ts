import pako from 'pako';
import type { AhdbDeck } from '../../type/data/deck.js';

/**
 * Compresses an AhdbDeck to a base64-encoded, gzipped string.
 * Includes all fields without any truncation.
 */
export function compressDeck(ahdbDeck: AhdbDeck): string {
  const json = JSON.stringify(ahdbDeck);
  const compressed = pako.gzip(json);
  const base64 = btoa(String.fromCharCode(...compressed));
  return base64;
}

/**
 * Compresses an AhdbDeck to a base64-encoded, gzipped string with minimal fields.
 * Keeps only essential fields needed for deck viewing: slots, sideSlots, ignoreDeckLimitSlots,
 * investigator_code, taboo_id, and meta (only extra_deck field).
 */
export function compressDeckTruncated(ahdbDeck: AhdbDeck): string {
  // Parse meta to extract only extra_deck
  let minimalMeta = '';
  try {
    const parsedMeta = JSON.parse(ahdbDeck.meta || '{}');
    if (parsedMeta.extra_deck) {
      minimalMeta = JSON.stringify({ extra_deck: parsedMeta.extra_deck });
    }
  } catch {
    // If meta parsing fails, use empty object
    minimalMeta = '{}';
  }

  // Create minimal deck with only essential fields
  const minimalDeck: Partial<AhdbDeck> = {
    name: ahdbDeck.name,
    investigator_code: ahdbDeck.investigator_code,
    slots: ahdbDeck.slots,
    sideSlots: ahdbDeck.sideSlots,
    ignoreDeckLimitSlots: ahdbDeck.ignoreDeckLimitSlots,
    taboo_id: ahdbDeck.taboo_id,
    meta: minimalMeta,
  };

  const json = JSON.stringify(minimalDeck);
  const compressed = pako.gzip(json);
  const base64 = btoa(String.fromCharCode(...compressed));
  return base64;
}

/**
 * Decompresses a base64-encoded, gzipped string back to an AhdbDeck.
 * Fills in default values for fields that may be missing from minimal compression.
 */
export function decompressDeck(compressed: string): AhdbDeck {
  try {
    // Decode from base64
    const binaryString = atob(compressed);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Decompress
    const decompressed = pako.ungzip(bytes, { to: 'string' });
    const deck = JSON.parse(decompressed) as Partial<AhdbDeck>;

    // Fill in default values for any missing fields
    return {
      id: deck.id ?? 0,
      name: deck.name ?? '',
      date_creation: deck.date_creation ?? new Date().toISOString(),
      date_update: deck.date_update ?? new Date().toISOString(),
      description_md: deck.description_md ?? '',
      user_id: deck.user_id ?? null,
      investigator_code: deck.investigator_code ?? '',
      investigator_name: deck.investigator_name ?? '',
      slots: deck.slots ?? null,
      sideSlots: deck.sideSlots ?? null,
      ignoreDeckLimitSlots: deck.ignoreDeckLimitSlots ?? null,
      version: deck.version ?? '0.1',
      xp: deck.xp ?? null,
      xp_spent: deck.xp_spent ?? null,
      xp_adjustment: deck.xp_adjustment ?? null,
      exile_string: deck.exile_string ?? null,
      taboo_id: deck.taboo_id ?? 0,
      meta: deck.meta ?? '{}',
      tags: deck.tags ?? '',
      previous_deck: deck.previous_deck ?? null,
      next_deck: deck.next_deck ?? null,
      problem: deck.problem ?? null,
    };
  } catch (error) {
    throw new Error(
      `Failed to decompress deck: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
