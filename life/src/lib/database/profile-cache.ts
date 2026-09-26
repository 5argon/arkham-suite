/**
 * The in-memory precompute cache: each profile subject's payload in three segments (meta, logs,
 * cards), each rebuilt only when the signature of its inputs changes. Never saved — stripped
 * before IndexedDB and file export, rebuilt after load.
 */
import type { CardsSegment, LogsSegment, MetaSegment } from '$lib/profile/profile-types';

/** Bump when a builder's output changes, so a running session drops segments built by older code. */
export const CACHE_VERSION = 128;

/** The cache key for the account-wide profile. */
export const ACCOUNT_SUBJECT = '__account__';

export interface CachedSegment<T> {
	sig: string;
	data: T;
}

export interface SubjectCache {
	meta: CachedSegment<MetaSegment>;
	logs: CachedSegment<LogsSegment>;
	cards: CachedSegment<CardsSegment>;
}

export interface ProfileCache {
	version: number;
	/** Keyed by {@link ACCOUNT_SUBJECT}, a roster member uid or a play-group uid. */
	subjects: Record<string, SubjectCache>;
}
