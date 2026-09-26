import type { DatabaseDocument } from './document';

/** Where the whole document is loaded from and saved to. */
export interface PersistenceAdapter {
	/** The stored value, unvalidated, or null when nothing is stored. */
	load(): Promise<unknown>;
	save(doc: DatabaseDocument): Promise<void>;
	clear(): Promise<void>;
}
