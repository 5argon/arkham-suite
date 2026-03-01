<!--
@component
The Specialist (trait-restricted) cards widget — two dimensions over which specialist
cards you have actually fielded:

  • Investigator wall — every investigator in the game, lit when you have used ANY
    specialist card with that investigator.
  • Trait matrix — one cell per trait a specialist card can require; the cell holds
    every specialist card that allows that trait, lit only when an investigator who
    HAS that trait used it (Roland is Agency/Detective, so his use of a Police-allowed
    card does not light it on the Police row). Each lit card shows up to three of the
    investigator squares that triggered it. Cells flow 1 / 2 / 3 across to save height.

Pure card-data + the deck-derived `specialistUsage` (card code → investigator codes).
-->
<script lang="ts">
	import { CardSquare } from '@5argon/arkham-life-ui';
	import { card as cardUtils, type Card, type CardCode } from '@5argon/arkham-kohaku';
	import { getAllCards } from '$lib/card-data';
	import { isSpecialist, specialistTraitsOf, traitsOf } from '$lib/campaign/card-filters';

	let { specialistUsage }: { specialistUsage: Record<CardCode, CardCode[]> } = $props();

	const byCode = new Map(getAllCards().map((c) => [c.code, c] as const));
	/** Collapse alternate / promo printings onto the base investigator code. */
	const canonInv = (code: string): string => byCode.get(code)?.alternateOfCardCode ?? code;

	// Every specialist player card in the game, by card number.
	const specialists = $derived(
		getAllCards()
			.filter((c) => cardUtils.deckbuildingPlayerCardsFilter(c) && isSpecialist(c))
			.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
	);

	// ── Investigator dimension ──────────────────────────────────────────────────
	// Canonical investigator roster (one card per character), by set then card number
	// (the zero-padded code sorts pack-then-position).
	const roster = $derived.by((): Card[] => {
		const seen = new Map<string, Card>();
		for (const c of getAllCards()) {
			if (!cardUtils.deckbuildingInvestigatorCardsFilter(c)) continue;
			const key = c.alternateOfCardCode ?? c.code;
			const prev = seen.get(key);
			if (!prev || (!c.alternateOfCardCode && prev.alternateOfCardCode)) seen.set(key, c);
		}
		return [...seen.values()].sort((a, b) => a.code.localeCompare(b.code));
	});
	// Investigators (canonical) that used ANY specialist card.
	const usedInvestigators = $derived.by((): Set<string> => {
		const s = new Set<string>();
		for (const users of Object.values(specialistUsage)) for (const u of users) s.add(canonInv(u));
		return s;
	});
	const usedCount = $derived(roster.filter((c) => usedInvestigators.has(c.code)).length);

	// ── Trait dimension ─────────────────────────────────────────────────────────
	const invHasTrait = (invCode: string, t: string): boolean => {
		const c = byCode.get(invCode);
		return c ? traitsOf(c).includes(t) : false;
	};
	// Every trait any specialist card can require, sorted.
	const traits = $derived.by((): string[] => {
		const s = new Set<string>();
		for (const c of specialists) for (const t of specialistTraitsOf(c)) s.add(t);
		return [...s].sort();
	});
	// Per-trait: the specialist cards allowing it, each with lit state + up to three
	// triggering investigators (used the card AND have the trait).
	const rows = $derived.by(() =>
		traits.map((t) => ({
			trait: t,
			cards: specialists
				.filter((c) => specialistTraitsOf(c).includes(t))
				.map((c) => {
					const triggers = [
						...new Set((specialistUsage[c.code] ?? []).map(canonInv))
					].filter((inv) => invHasTrait(inv, t));
					return { card: c, lit: triggers.length > 0, triggers: triggers.slice(0, 3) };
				})
		}))
	);

	const titleCase = (t: string): string => t.charAt(0).toUpperCase() + t.slice(1);
</script>

{#if specialists.length}
	<div class="flex flex-col gap-4">
		<!-- Investigator wall -->
		<div>
			<p class="text-primary-500 mb-1.5 text-xs font-medium">
				Investigators who used a Specialist ({usedCount} / {roster.length})
			</p>
			<div class="flex flex-wrap gap-1.5">
				{#each roster as inv (inv.code)}
					{@const lit = usedInvestigators.has(inv.code)}
					<span title={inv.name} class={lit ? '' : 'grayscale'}>
						<CardSquare card={inv} greyedOut={!lit} />
					</span>
				{/each}
			</div>
		</div>

		<!-- Trait matrix: each trait (its label + the specialist cards that allow it) is a
		     cell; cells flow 1 / 2 / 3 across to save vertical space (up to 2+2+2 columns). -->
		<div class="grid grid-cols-1 gap-x-4 gap-y-1 md:grid-cols-2 lg:grid-cols-3">
			{#each rows as r (r.trait)}
				<div
					class="border-primary-100 dark:border-primary-800/60 flex items-start gap-2 border-b py-1.5"
				>
					<div class="text-primary-700 dark:text-primary-200 w-20 shrink-0 text-sm font-semibold">
						{titleCase(r.trait)}
					</div>
					<div class="flex flex-wrap gap-2">
						{#each r.cards as cc (cc.card.code)}
							<div class="flex flex-col items-center gap-0.5" title={cc.card.name}>
								<span class={cc.lit ? '' : 'grayscale'}>
									<CardSquare card={cc.card} greyedOut={!cc.lit} />
								</span>
								{#if cc.triggers.length}
									<div class="flex gap-0.5">
										{#each cc.triggers as tCode (tCode)}
											{@const tc = byCode.get(tCode)}
											{#if tc}
												<span title={tc.name}><CardSquare card={tc} small /></span>
											{/if}
										{/each}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}
