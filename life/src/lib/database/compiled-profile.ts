/**
 * The compiled profile (`.ahlifepro`): a profile payload with every English string that can be
 * re-derived from campaign-data dropped, leaving ids, numbers and user data. It is a public data
 * contract, so meaningful derived numbers belong in the payload as named fields rather than being
 * computed in components. `hydrateCompiledProfile` restores the dropped strings.
 */
import type { ProfilePayload, ProfileSubject } from '$lib/profile/profile-types';

/** Bumped on every breaking change to the file's shape; see compiled-profile-versions.md. */
export const COMPILED_PROFILE_VERSION = 59;

/** The oldest format whose blob shapes the current widgets read. */
const MIN_COMPILED_PROFILE_VERSION = 59;

function omit<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K> {
	const out = { ...obj };
	for (const k of keys) delete out[k];
	return out;
}

const withoutName = <T extends { name: string }>(r: T) => omit(r, ['name']);

export function stripCompiledProfile(p: ProfilePayload) {
	return {
		...p,
		achievements: {
			families: p.achievements.families.map((f) => ({
				...omit(f, ['name']),
				achievements: f.achievements.map((a) => ({
					...omit(a, ['title', 'text']),
					items: a.items?.map((it) => omit(it, ['label']))
				}))
			})),
			custom: p.achievements.custom.map((c) => omit(c, ['title', 'description'])),
			coverage: p.achievements.coverage.map((cov) => ({
				...omit(cov, ['campaignName']),
				groups: cov.groups.map((g) => ({
					...g,
					branches: g.branches.map((b) => omit(b, ['text']))
				}))
			}))
		},
		clearGrid: p.clearGrid.map(withoutName),
		soloClearGrid: p.soloClearGrid.map(withoutName),
		trueSoloClearGrid: p.trueSoloClearGrid.map(withoutName),
		winLossRecord: p.winLossRecord.map(withoutName),
		endings: p.endings.map((e) => ({
			...omit(e, ['name']),
			endings: e.endings.map((x) => omit(x, ['text']))
		})),
		collections: p.collections.map((c) => ({
			...omit(c, ['name']),
			collections: c.collections.map((col) => ({
				...omit(col, ['title']),
				items: col.items.map((i) => omit(i, ['label']))
			}))
		})),
		scenarios: p.scenarios.map((c) => ({
			...omit(c, ['name']),
			scenarios: c.scenarios.map((sc) => ({
				...omit(sc, ['name']),
				choices: sc.choices?.map((ch) => omit(ch, ['label']))
			}))
		})),
		standaloneUsage: p.standaloneUsage.map((s) => ({
			...omit(s, ['name']),
			standalones: s.standalones.map(withoutName)
		})),
		standalones: p.standalones.map(withoutName)
	};
}

export type CompiledProfile = ReturnType<typeof stripCompiledProfile>;

/** The file envelope. `subject` is repeated at the top so a viewer can show the header without
 *  parsing the whole profile. */
export interface CompiledProfileFile {
	kind: 'arkham-life-compiled-profile';
	v: number;
	/** ISO-8601. */
	exportedAt: string;
	subject: ProfileSubject;
	profile: CompiledProfile;
}

export class CompiledProfileError extends Error {}

export function makeCompiledProfileFile(
	subject: ProfileSubject,
	payload: ProfilePayload,
	exportedAt: string
): CompiledProfileFile {
	return {
		kind: 'arkham-life-compiled-profile',
		v: COMPILED_PROFILE_VERSION,
		exportedAt,
		subject,
		profile: stripCompiledProfile(payload)
	};
}

/** Validate the envelope and version; the profile body is trusted to match its version. */
export function parseCompiledProfileFile(value: unknown): CompiledProfileFile {
	const v = value as Record<string, unknown> | null;
	if (
		typeof v !== 'object' ||
		v === null ||
		v.kind !== 'arkham-life-compiled-profile' ||
		typeof v.v !== 'number' ||
		typeof v.profile !== 'object' ||
		v.profile === null
	) {
		throw new CompiledProfileError('This file is not a recognizable compiled profile.');
	}
	if (v.v > COMPILED_PROFILE_VERSION) {
		throw new CompiledProfileError(
			`This compiled profile was made by a newer version (format ${v.v}). Please update first.`
		);
	}
	if (v.v < MIN_COMPILED_PROFILE_VERSION) {
		throw new CompiledProfileError(
			`This compiled profile is too old to open (format ${v.v}). Export it again from arkham.life.`
		);
	}
	return value as CompiledProfileFile;
}
