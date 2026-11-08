import { Campaign, CardClass, CardType, environment, Product } from '@5argon/arkham-kohaku';
import { describe, expect, it } from 'vitest';

import { markdownToTrustedHtml } from '@5argon/arkham-life-ui/markdown';

import { recentListLimit } from '$lib/review/recent';
import { parseArkhamDbCardText } from '$lib/utility/arkham-markup';

import cardTextData from './data/card-text.json';
import {
	cardsMissingText,
	compareEntries,
	campaignReviews,
	compileCardSubsections,
	parseWrittenReview,
	type ReviewEntry,
	previewSeasonGroups,
	previewSeasonSummaries,
	recentReviews,
	reviewCardCodes,
	reviewCardPage,
	reviewProblems,
	reviewProductCards,
	reviewerSummaries,
	reviewLastModified,
	reviewProducts,
	reviewProductSummaries,
	reviewsBy,
	reviewSitemapPaths,
	type SourceJson,
	sourceProblems,
	sourceUrl,
	textFragmentUrl
} from './reviews';

const source = (overrides: Partial<SourceJson> = {}): SourceJson => ({
	by: '5argon',
	title: 'A video',
	date: '2026-11-03',
	media: { youtube: 'abcdefghijk' },
	cards: [{ code: '12028' }],
	...overrides
});

describe('review content', () => {
	it('has nothing wrong with it', () => {
		expect(reviewProblems()).toEqual([]);
	});

	it('has the text of every card with a page', () => {
		expect(cardsMissingText()).toEqual([]);
	});

	it('knows every icon in rules text, since an unknown one would show as a bracketed word', () => {
		for (const [code, fields] of Object.entries<Record<string, string>>(cardTextData)) {
			for (const field of ['text', 'back_text', 'customization_text']) {
				expect(parseArkhamDbCardText(fields[field] ?? ''), code).not.toMatch(/(?<!\[)\[[a-z_]+\]/);
			}
		}
	});

	it("keeps an editor's word in flavor text, and each line of rules text", () => {
		expect(parseArkhamDbCardText('people... [shuddered] at it')).toBe(
			'<p>people... [shuddered] at it</p>'
		);
		expect(parseArkhamDbCardText('[action] One.\n[[Item]] two.')).toBe(
			'<p><span class="icon-action"></span> One.</p><p><b><i>Item</i></b> two.</p>'
		);
	});
});

describe('source rules', () => {
	const problemsOf = (overrides: Partial<SourceJson>, preview = false) =>
		sourceProblems(source(overrides), preview).join('\n');

	it('accepts a good source', () => {
		expect(problemsOf({})).toBe('');
	});

	it('refuses what came before Chapter 2 was announced', () => {
		expect(problemsOf({ date: '2025-10-30' })).toMatch(/announcement/);
		expect(problemsOf({ date: environment.chapterTwoAnnouncedDate })).toBe('');
	});

	it('refuses a point in time that does not exist', () => {
		expect(problemsOf({ environment: 'nonsense' })).toMatch(/unknown environment/);
		expect(problemsOf({ environment: 'evergreen' })).toBe('');
	});

	it('credits exactly one person', () => {
		expect(problemsOf({ by: undefined })).toMatch(/credit/);
		expect(problemsOf({ guest: { name: 'Someone' } })).toMatch(/credit/);
		expect(problemsOf({ by: undefined, guest: { name: 'Someone' } })).toBe('');
		expect(problemsOf({ by: 'nobody-at-all' })).toMatch(/unknown contributor/);
	});

	it('wants the card a reprint reprints', () => {
		expect(problemsOf({ cards: [{ code: '60169' }] })).toMatch(/reprint, use 12025/);
	});

	it('refuses cards outside of what can be reviewed', () => {
		expect(problemsOf({ cards: [{ code: '01020' }] })).toMatch(/can be reviewed/);
	});

	it('only starts a video partway, and only jumps within an article', () => {
		expect(problemsOf({ cards: [{ code: '12028', start: '12:34' }] })).toBe('');
		expect(problemsOf({ cards: [{ code: '12028', start: '1:02:03' }] })).toBe('');
		expect(problemsOf({ cards: [{ code: '12028', start: 'soon' }] })).toMatch(/look like/);
		expect(problemsOf({ cards: [{ code: '12028', text: 'Sledgehammer' }] })).toMatch(
			/only an article/
		);
		expect(
			problemsOf({
				media: { url: 'https://example.com' },
				cards: [{ code: '12028', start: '1:00' }]
			})
		).toMatch(/only a video/);
	});
});

describe('environment slots', () => {
	const db1 = Product.PowerOfTheDreamlands;
	const db2 = Product.ChildrenOfBlood;
	const db3 = Product.TracesToNowhere;
	const inv1 = Product.TommyMuldoon;
	const inv2 = Product.CarolynFern;
	const catalog = {
		...environment.officialCurrentEnvironmentCatalog,
		deckbuildingExpansions: [db1, db2, db3],
		investigatorExpansions: [inv1, inv2]
	};

	it('fills deckbuilding slots and then investigator slots, leaving the rest empty', () => {
		expect(environment.rotatingExpansionSlots([], catalog)).toEqual([null, null, null, null]);
		expect(environment.rotatingExpansionSlots([Product.CoreSet2026, db3, inv1], catalog)).toEqual([
			db3,
			null,
			inv1,
			null
		]);
		expect(environment.rotatingExpansionSlots([db3, db2, inv2, inv1], catalog)).toEqual([
			db3,
			db2,
			inv2,
			inv1
		]);
	});
});

describe('deep links', () => {
	it('jumps to text, keeping what would end or split the directive out of it', () => {
		expect(textFragmentUrl('https://example.com/post/', 'Sledgehammer(3): Okay')).toBe(
			'https://example.com/post/#:~:text=Sledgehammer(3)%3A%20Okay'
		);
		expect(textFragmentUrl('https://example.com/', 'Well-Funded, really')).toBe(
			'https://example.com/#:~:text=Well%2DFunded%2C%20really'
		);
	});
});

describe('links', () => {
	it('opens a video where it talks about the card', () => {
		expect(sourceUrl({ youtube: 'abc' }, { start: '12:34' })).toBe(
			'https://www.youtube.com/watch?v=abc&t=754s'
		);
		expect(sourceUrl({ twitch: '123' }, { start: '1:02:03' })).toBe(
			'https://www.twitch.tv/videos/123?t=1h2m3s'
		);
		expect(sourceUrl({ youtube: 'abc' })).toBe('https://www.youtube.com/watch?v=abc');
	});

	it('opens an article at the text about the card', () => {
		expect(sourceUrl({ url: 'https://example.com/' }, { text: 'Machete: Good' })).toBe(
			'https://example.com/#:~:text=Machete%3A%20Good'
		);
		expect(sourceUrl({ url: 'https://example.com/', as: 'audio' })).toBe('https://example.com/');
	});

	it('has nothing to open for what can only be credited', () => {
		expect(sourceUrl({ discord: true })).toBeUndefined();
	});

	it('takes every external review to its own site, on every card', () => {
		for (const code of reviewCardCodes()) {
			for (const entry of reviewCardPage(code)?.entries ?? []) {
				if (entry.parts === undefined) expect(entry.externalHref, code).toMatch(/^https:\/\//);
			}
		}
	});
});

describe('pages', () => {
	it('gives one page per card, with reprints sharing the one they reprint', () => {
		const codes = reviewCardCodes();
		expect(new Set(codes).size).toBe(codes.length);
		expect(codes).toContain('12025');
		expect(codes).not.toContain('60169');
		expect(reviewCardPage('60169')).toBeUndefined();
		expect(reviewCardPage('nonsense')).toBeUndefined();
	});

	it('leaves out what is in no environment', () => {
		const products = reviewProductSummaries().map(({ product }) => product);
		expect(products).toContain(Product.CoreSet2026);
		expect(products).not.toContain(Product.ChildrenOfBlood);
		expect(products).not.toContain(Product.TracesToNowhere);
	});

	it('sends a reprint in a product to the page of what it reprints', () => {
		const reprint = reviewProductCards(Product.TommyMuldoon).find((c) => c.card.code === '60169');
		expect(reprint?.code).toBe('12025');
	});

	it('links to reviews on the printing ArkhamDB keeps them on', () => {
		expect(reviewCardPage('12073')?.arkhamdbReviewsUrl).toBe(
			'https://arkhamdb.com/card/08073#reviews-header'
		);
		expect(reviewCardPage('12028')?.arkhamdbReviewsUrl).toBe(
			'https://arkhamdb.com/card/12028#reviews-header'
		);
	});

	it('links to the card on arkham.build', () => {
		expect(reviewCardPage('12073')?.arkhamBuildUrl).toBe('https://arkham.build/card/12073');
	});

	it('has written reviews ready when building', () => {
		const written = reviewCardPage('12073')?.entries.find((entry) => entry.parts !== undefined);
		const html = written?.parts?.map((part) => (part.kind === 'text' ? part.html : '')).join('');
		expect(html).toContain('data-card-code="12015"');
		expect(reviewCardPage('12073')?.mentioned['12015']?.name).toBe('Breaking Point');
	});

	it('counts what is written here apart from everything external', () => {
		for (const { card, code, counts } of reviewProductCards(Product.CoreSet2026)) {
			const entries = reviewCardPage(code)?.entries ?? [];
			const written = entries.filter((entry) => entry.parts !== undefined);
			expect(counts.written, card.name).toBe(written.length);
			expect(counts.external, card.name).toBe(entries.length - written.length);
		}
		const bandages = reviewProductCards(Product.CoreSet2026).find((c) => c.code === '12073');
		expect(bandages?.counts.written).toBe(1);
		expect(bandages?.counts.external).toBeGreaterThan(0);
	});

	it('adds up to the same counts on the product as on its cards', () => {
		for (const { product, counts } of reviewProductSummaries()) {
			const cards = reviewProductCards(product);
			expect(counts.written, product).toBe(cards.reduce((sum, c) => sum + c.counts.written, 0));
			expect(counts.external, product).toBe(cards.reduce((sum, c) => sum + c.counts.external, 0));
		}
	});
});

describe('ordering', () => {
	const entry = (id: string, date: string, environmentDate?: string): ReviewEntry => ({
		id,
		medium: 'text',
		person: { name: 'Someone' },
		date,
		environmentDate
	});
	const ids = (entries: ReviewEntry[]) => [...entries].sort(compareEntries).map((e) => e.id);

	it('puts written reviews by their point in time and then by when they came out', () => {
		expect(
			ids([
				entry('old-point-new', '2027-09-01', '2026-04-17'),
				entry('old-point-old', '2026-05-01', '2026-04-17'),
				entry('new-point', '2027-03-01', '2027-02-19')
			])
		).toEqual(['new-point', 'old-point-new', 'old-point-old']);
	});

	it('puts everything else by when it came out', () => {
		expect(ids([entry('older', '2026-01-01'), entry('newer', '2026-02-01')])).toEqual([
			'newer',
			'older'
		]);
	});
});

describe('how pages show up in search', () => {
	const pages = () => reviewCardCodes().map((code) => reviewCardPage(code)!);

	it('gives every page its own title', () => {
		const titles = pages().map((page) => page.seo.title);
		expect(titles.filter((title, i) => titles.indexOf(title) !== i)).toEqual([]);
	});

	it('keeps headings below the page title and its sections', () => {
		const { parts } = compileCardSubsections(
			markdownToTrustedHtml('# Plain\n\n## [Marie Lambeau](/card/60451)\n\n#### Deep'),
			'r'
		);
		expect(parts[0]).toMatchObject({
			kind: 'text',
			html: expect.stringContaining('<h3>Plain</h3>')
		});
		expect(parts[1]).toMatchObject({ kind: 'cards', level: 3 });
		expect(parts[2]).toMatchObject({
			kind: 'text',
			html: expect.stringContaining('<h4>Deep</h4>')
		});
	});

	it('says the same thing whoever reviewed the card', () => {
		for (const [code, name] of [
			['12073', 'Bandages'],
			['60384', 'The Red Clock']
		]) {
			const { seo } = reviewCardPage(code)!;
			expect(seo.title).toBe(`${name} - Player Card Review`);
			expect(seo.description).toBe(
				`Player card reviews of ${name} for Arkham Horror: The Card Game.`
			);
		}
	});

	it('only has article data for what is written here', () => {
		expect(JSON.stringify(reviewCardPage('12073')!.seo.jsonLd)).toContain('"Article"');
		expect(JSON.stringify(reviewCardPage('60384')!.seo.jsonLd)).not.toContain('"Article"');
	});

	it('lists product pages, and dates only what has a review written here', () => {
		expect(reviewSitemapPaths()).toContain('/review/core-2026');
		expect(reviewLastModified('/review/card/12073')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		expect(reviewLastModified('/review/card/60384')).toBeUndefined();
	});
});

describe('written review files', () => {
	it('reads the details from the front matter and the rest as the review', () => {
		expect(
			parseWrittenReview(
				'me',
				'---\nby: 5argon\ndate: 2026-11-04\nenvironment: evergreen\n---\n\nText.\n'
			)
		).toEqual({
			id: '5argon-evergreen',
			fileName: 'me',
			by: '5argon',
			date: '2026-11-04',
			environment: 'evergreen',
			body: '\nText.\n'
		});
	});

	it('reads a guest, naming the review after them', () => {
		const review = parseWrittenReview(
			'me',
			'---\nguest:\n  name: Some One\nenvironment: evergreen\n---\nText.'
		);
		expect(review.guest).toEqual({ name: 'Some One' });
		expect(review.id).toBe('some-one-evergreen');
	});

	it('leaves a file without any as text, for the checks to catch', () => {
		const review = parseWrittenReview('me', 'Just text.');
		expect(review.body).toBe('Just text.');
		expect(review.date).toBeUndefined();
	});
});

describe('card subsections', () => {
	const link = (code: string, name = 'A Card') =>
		`<span class="card-link text-mystic" data-card-code="${code}">${name}</span>`;

	it('finds a card link in a heading of any level, and makes it something to link to', () => {
		const { parts, subsections } = compileCardSubsections(
			`<p>Intro.</p><h1>${link('60451')}</h1><p>Text.</p><h6>${link('12013')}</h6>`,
			'my-review'
		);
		expect(subsections).toEqual([
			{ code: '60451', anchor: 'my-review-60451', title: undefined },
			{ code: '12013', anchor: 'my-review-12013', title: undefined }
		]);
		expect(parts).toEqual([
			{ kind: 'text', html: '<p>Intro.</p>' },
			{ kind: 'cards', anchor: 'my-review-60451', level: 3, codes: ['60451'], title: undefined },
			{ kind: 'text', html: '<p>Text.</p>' },
			{ kind: 'cards', anchor: 'my-review-12013', level: 6, codes: ['12013'], title: undefined }
		]);
	});

	it('finds it through whatever decorates it, in real markdown', () => {
		for (const heading of [
			'## **[Marie Lambeau](/card/60451)**',
			'## [**Marie Lambeau**](/card/60451)',
			'### *[Marie Lambeau](/card/60451)*',
			'#### <span class="icon-mystic"></span> [Marie Lambeau](/card/60451)'
		]) {
			const { subsections } = compileCardSubsections(markdownToTrustedHtml(heading), 'r');
			expect(subsections, heading).toEqual([
				{ code: '60451', anchor: 'r-60451', title: undefined }
			]);
		}
	});

	it('keeps the words around the link as what the part is about', () => {
		const { subsections } = compileCardSubsections(
			markdownToTrustedHtml("## [Marie Lambeau](/card/60451): Dexter's rival & friend"),
			'r'
		);
		expect(subsections[0].title).toBe("Marie Lambeau: Dexter's rival & friend");
	});

	it('goes to every card a heading links, at the same place', () => {
		const { subsections } = compileCardSubsections(
			markdownToTrustedHtml('## [Marie Lambeau](/card/60451) and [Isabelle Barnes](/card/12013)'),
			'r'
		);
		expect(subsections.map((part) => [part.code, part.anchor])).toEqual([
			['60451', 'r-60451'],
			['12013', 'r-60451']
		]);
	});

	it('shows every card a heading links in one divider', () => {
		const { parts } = compileCardSubsections(
			markdownToTrustedHtml('## [Marie Lambeau](/card/60451), [Isabelle Barnes](/card/12013)'),
			'r'
		);
		expect(parts).toEqual([
			{ kind: 'cards', anchor: 'r-60451', level: 3, codes: ['60451', '12013'], title: undefined }
		]);
	});

	it('leaves headings without a card link, and card links in text, alone', () => {
		const source = `<h3>Plain</h3><p>${link('12013')}</p>`;
		expect(compileCardSubsections(source, 'r')).toEqual({
			parts: [{ kind: 'text', html: source }],
			subsections: []
		});
	});

	it('leaves a heading alone when the card it links is unknown', () => {
		const source = `<h3>${link('99999')}</h3>`;
		expect(compileCardSubsections(source, 'r')).toEqual({
			parts: [{ kind: 'text', html: source }],
			subsections: []
		});
	});

	it('goes by the card, whichever printing the heading linked', () => {
		expect(compileCardSubsections(`<h2>${link('60169')}</h2>`, 'r').subsections[0].code).toBe(
			'12025'
		);
	});

	it("collects onto that card's page, linking right to it", () => {
		const insight = reviewCardPage('12013')?.insights.find((i) => i.card.code === '12073');
		expect(insight).toBeDefined();
		if (insight === undefined) return;
		expect(insight.href).toMatch(/^\/review\/card\/12073#5argon-[a-z-]+-12013$/);
		expect(insight.entry.person.name).toBe('5argon');
		expect(insight.entry.environment?.label).toBe('Evergreen');
		expect('parts' in insight.entry).toBe(false);
	});

	it('keeps the anchor in the review it links to', () => {
		const page = reviewCardPage('12073');
		const review = page?.entries.find((e) => e.parts !== undefined);
		const isabelle = review?.parts?.find(
			(part) => part.kind === 'cards' && part.codes.includes('12013')
		);
		expect(isabelle).toEqual({
			kind: 'cards',
			anchor: expect.stringMatching(/^5argon-[a-z-]+-12013$/),
			level: 3,
			codes: ['12013'],
			hrefs: { '12013': '/review/card/12013' },
			title: undefined
		});
		expect(review?.id && isabelle?.kind === 'cards' && isabelle.anchor.startsWith(review.id)).toBe(
			true
		);
		expect(page?.mentioned['12013']?.name).toBe('Isabelle Barnes');
	});

	it('links mentioned cards to their review pages, but not the card under review', () => {
		const review = reviewCardPage('12073')?.entries.find((e) => e.parts !== undefined);
		const html = review?.parts?.map((part) => (part.kind === 'text' ? part.html : '')).join('');
		expect(html).toContain('<a class="card-link');
		expect(html).toContain('data-card-code="12015" href="/review/card/12015"');
		expect(html).toContain('<span class="card-link');
		expect(html).not.toContain('href="/review/card/12073"');
	});

	it("doesn't count as a review of that card, but its page can still be found", () => {
		const isabelle = reviewProductCards(Product.CoreSet2026).find((c) => c.code === '12013');
		expect(isabelle?.counts.written).toBe(0);
		expect(reviewSitemapPaths()).toContain('/review/card/12013');
	});
});

describe('campaign reviews', () => {
	it('lists what speaks about a campaign on its page, with no environment', () => {
		const reviews = campaignReviews(Campaign.ChildrenOfBlood);
		expect(reviews.length).toBeGreaterThanOrEqual(2);
		for (const entry of reviews) expect(entry.environment).toBeUndefined();
		const titles = campaignReviews(Campaign.BrethrenOfAsh).map((entry) => entry.title);
		expect(titles).toContain('Brethren of Ash: Initial thoughts');
		expect(campaignReviews(Campaign.ReturnToTheDunwichLegacy)).toEqual([]);
	});

	it('shows on the reviewer page but not in Recent, which is for player cards', () => {
		const title = 'Unboxing the New Campaign: Children of Blood (Arkham Horror the Card Game)';
		expect(reviewsBy('quick-learner').map((row) => row.entry.title)).toContain(title);
		for (const rows of [recentReviews(), recentReviews(Product.CoreSet2026)]) {
			expect(rows.every((row) => row.cards.length > 0)).toBe(true);
			expect(rows.map((row) => row.entry.title)).not.toContain('Brethren of Ash: Initial thoughts');
		}
	});

	it('needs to say what it speaks about', () => {
		const problems = (overrides: Partial<SourceJson>) =>
			sourceProblems(
				{
					title: 't',
					date: '2026-01-01',
					by: 'quick-learner',
					media: { youtube: 'x' },
					cards: [],
					...overrides
				},
				false
			);
		expect(problems({}).join()).toMatch(/which cards or campaigns/);
		expect(problems({ campaigns: [Campaign.ChildrenOfBlood] })).toEqual([]);
		expect(problems({ campaigns: ['nope' as Campaign] }).join()).toMatch(/unknown campaign/);
	});
});

describe('reviewers', () => {
	it('lists everyone with reviews and no one without', () => {
		const slugs = reviewerSummaries().map(({ slug }) => slug);
		expect(slugs).toContain('ancient-evils');
		expect(slugs).toContain('5argon');
		expect(slugs).toContain('hungry-colquhoun');
		for (const { counts } of reviewerSummaries()) {
			expect(counts.written + counts.external).toBeGreaterThan(0);
		}
	});

	it('counts reviews rather than the cards they speak about', () => {
		const { counts } = reviewerSummaries().find(({ slug }) => slug === 'ancient-evils')!;
		expect(counts.written).toBe(0);
		expect(counts.external).toBeLessThan(reviewsBy('ancient-evils').length);
		expect(counts.external).toBeGreaterThanOrEqual(20);
	});

	it('only counts as written here what can be read here', () => {
		const countsOf = (name: string) =>
			reviewerSummaries().find(({ slug }) => slug === name)?.counts;
		expect(countsOf('5argon')?.written).toBeGreaterThanOrEqual(1);
		expect(countsOf('tengo-un-plan')?.written).toBe(0);
		expect(countsOf('until-the-end-of-time')?.written).toBe(0);
	});

	it('leads a review to the page of who made it', () => {
		const row = reviewsBy('ancient-evils')[0];
		expect(row.entry.person.href).toBe('/review/reviewers/ancient-evils');
		expect(reviewSitemapPaths()).toContain('/review/reviewers/ancient-evils');
	});
});

describe('spoiler roundups', () => {
	it('gives each card a link to its own paragraph', () => {
		const roundup = reviewCardPage('12036')?.entries.find((entry) =>
			entry.title?.includes('Spoiler Roundup')
		);
		expect(roundup?.externalHref).toContain('/core-2026-spoiler-roundup-');
		expect(roundup?.externalHref).toContain('#:~:text=');
	});

	it("sits beside a creator's own preview of the same card", () => {
		const titles = reviewCardPage('12036')?.entries.map((entry) => entry.title);
		expect(titles).toContain('Core 2026: Previewing two Seeker cards!');
		expect(titles).toContain('Core 2026: Spoiler Roundup #2');
	});
});

describe('recent reviews', () => {
	const dates = (rows: ReturnType<typeof recentReviews>) =>
		rows.map((row) => Date.parse(row.entry.dateLabel ?? ''));

	it('puts the newest first, written here or elsewhere', () => {
		const rows = recentReviews();
		expect(dates(rows)).toEqual([...dates(rows)].sort((a, b) => b - a));
		expect(rows.some((row) => row.href !== undefined)).toBe(true);
		expect(rows.some((row) => row.entry.externalHref !== undefined)).toBe(true);
	});

	it('counts something covering many cards as one review', () => {
		// A video or article elsewhere is listed once, though many speak about several cards.
		const external = recentReviews().filter((row) => row.href === undefined);
		const titles = external.map((row) => `${row.entry.title} ${row.entry.dateLabel}`);
		expect(titles.length).toBeGreaterThan(0);
		expect(new Set(titles).size).toBe(titles.length);
		expect(new Set(recentReviews().map((row) => row.key)).size).toBe(recentReviews().length);
	});

	it('leaves official posts to the Preview Season pages', () => {
		expect(recentReviews().some((row) => row.entry.official)).toBe(false);
	});

	it('has only what speaks about the cards of a product, reprints included', () => {
		const tommy = recentReviews(Product.TommyMuldoon);
		expect(tommy.length).toBeGreaterThan(0);
		for (const row of tommy) {
			expect(row.cards.length, row.key).toBeGreaterThan(0);
			for (const { products } of row.cards) expect(products).toContain(Product.TommyMuldoon);
		}
		const reprint = reviewProductCards(Product.TommyMuldoon).find((c) => c.code !== c.card.code);
		expect(tommy.some((row) => row.cards.some(({ code }) => code === reprint?.code))).toBe(true);
	});

	it('goes back only so far within a product', () => {
		for (const product of reviewProducts) {
			const rows = recentReviews(product);
			const written = rows.filter((row) => row.href !== undefined);
			expect(written.length, product).toBeLessThanOrEqual(recentListLimit);
			expect(rows.length - written.length, product).toBeLessThanOrEqual(recentListLimit);
		}
	});

	it('still has the latest of each kind of whatever products get picked', () => {
		const all = recentReviews();
		for (const product of reviewProducts) {
			for (const written of [true, false]) {
				const ofKind = (rows: typeof all) =>
					rows.filter((row) => (row.href !== undefined) === written);
				const picked = ofKind(all)
					.filter((row) => row.cards.some((card) => card.products.includes(product)))
					.slice(0, recentListLimit);
				expect(
					picked.map((row) => row.entry.title),
					product
				).toEqual(ofKind(recentReviews(product)).map((row) => row.entry.title));
			}
		}
	});

	it('goes deeper within a product than across all of them', () => {
		const oldest = (rows: ReturnType<typeof recentReviews>) => Math.min(...dates(rows.slice(0, 5)));
		expect(oldest(recentReviews(Product.CarolynFern))).toBeLessThan(oldest(recentReviews()));
	});

	it('only lists the cards of what covers a few', () => {
		for (const row of recentReviews()) {
			const listed = row.cards.filter(({ card }) => card !== undefined).length;
			expect(listed, row.key).toBe(row.cards.length <= 4 ? row.cards.length : 0);
		}
	});

	it('opens something about one card right where it talks about it', () => {
		const taboo = recentReviews(Product.CoreSet2026).find((row) =>
			row.entry.title?.includes('Tabooed')
		);
		expect(taboo?.entry.externalHref).toBe('https://www.youtube.com/watch?v=tDS08o6TMDM');
	});
});

describe('collecting by person', () => {
	it("lists a contributor's reviews with the card they're about", () => {
		const row = reviewsBy('5argon').find((r) => r.card?.code === '12073');
		expect(row?.href).toMatch(/^\/review\/card\/12073#/);
	});

	it('lists what someone has said, newest first', () => {
		const dates = reviewsBy('ancient-evils').map((row) => Date.parse(row.entry.dateLabel ?? ''));
		expect(dates.length).toBeGreaterThanOrEqual(6);
		expect(dates).toEqual([...dates].sort((a, b) => b - a));
	});

	it('takes a row about something elsewhere straight there', () => {
		const row = reviewsBy('playing-board-games').find((r) => r.card?.code === '12052');
		expect(row?.href).toBeUndefined();
		expect(row?.entry.externalHref).toBe('https://www.youtube.com/watch?v=tDS08o6TMDM');
	});

	it('keeps rows light, with nothing of the content itself', () => {
		for (const { entry } of reviewsBy('ancient-evils')) {
			expect('html' in entry).toBe(false);
		}
	});

	it('finds someone who has only said things that are not about a known card yet', () => {
		expect(reviewsBy('nobody-at-all')).toEqual([]);
	});
});

describe('what a page shows', () => {
	it('can explain every point in time it mentions', () => {
		const point = reviewCardPage('12059')?.entries.find((e) => e.environment)?.environment;
		expect(point?.detail?.slots).toHaveLength(4);
		expect(point?.detail?.roster.length).toBeGreaterThan(5);
		expect(point?.detail?.evergreen[0].href).toBe('/review/core-2026');
	});

	it('has no verdicts, so readers go and find out for themselves', () => {
		for (const code of reviewCardCodes()) {
			for (const entry of reviewCardPage(code)?.entries ?? []) {
				expect('rating' in entry, code).toBe(false);
			}
		}
	});

	it('names Evergreen with no slots, even for what came before those products were all out', () => {
		const core = reviewCardPage('12059')?.entries.find((e) => e.title?.includes('2026 Core Set'));
		expect(core?.environment?.label).toBe('Evergreen');
		expect(core?.environment?.slots).toBeUndefined();
	});

	it('dates everything, apart from the point in time it speaks about', () => {
		for (const code of reviewCardCodes()) {
			for (const entry of reviewCardPage(code)?.entries ?? []) {
				expect(entry.dateLabel, code).toMatch(/\d{4}$/);
				expect(entry.environment?.label ?? '', code).not.toMatch(/\d{4}$/);
				expect(entry.environment, code).toBeDefined();
			}
		}
	});

	it('puts written reviews first, then the newest of the rest', () => {
		const entries = reviewCardPage('12073')?.entries ?? [];
		expect(entries[0].parts).toBeDefined();
		const dates = entries.slice(1).map((entry) => entry.date ?? '');
		expect(dates).toEqual([...dates].sort().reverse());
	});
});

describe('preview season', () => {
	it('pins what came out before the first environment to Evergreen', () => {
		const rows = previewSeasonGroups(Product.CoreSet2026).flatMap((group) => group.rows);
		expect(rows.length).toBeGreaterThan(0);
		for (const { entry } of rows) {
			expect(entry.preview).toBe(true);
			expect(entry.environment?.label).toBe('Evergreen');
		}
	});

	it('covers each product with what it had, and only that', () => {
		const titles = (product: Product) => previewSeasonGroups(product).map((group) => group.title);
		expect(titles(Product.CoreSet2026)).toContain('Seeker Weeks');
		expect(titles(Product.TommyMuldoon)).toEqual(['FFG Posts', 'Guardian Previews']);
		expect(titles(Product.CarolynFern)).toEqual(['FFG Posts', 'Seeker Previews']);
	});

	it('counts the previews of each product', () => {
		for (const { product, counts } of previewSeasonSummaries()) {
			const rows = previewSeasonGroups(product).flatMap((group) => group.rows);
			expect(counts.external, product).toBe(rows.length);
			expect(counts.written, product).toBe(0);
		}
	});

	it('gives whole cards to show as card lines', () => {
		const lines = previewSeasonGroups(Product.CoreSet2026).flatMap((group) =>
			group.rows.flatMap((row) => row.cards)
		);
		expect(lines.some((line) => line.card?.code === '12028')).toBe(true);
	});
});

describe('a card not in the card data yet', () => {
	const temporary = (overrides: object = {}) => ({
		name: 'Some Unreleased Card',
		type: CardType.Asset,
		class: CardClass.Guardian,
		level: 2,
		...overrides
	});
	const problemsOf = (card: object, preview = true) =>
		sourceProblems(source({ cards: [temporary(card)] }), preview).join('\n');

	it('is fine in a preview', () => {
		expect(problemsOf({})).toBe('');
		expect(problemsOf({ level: undefined })).toBe('');
		expect(problemsOf({ class: [CardClass.Guardian, CardClass.Seeker] })).toBe('');
	});

	it('only belongs in a preview', () => {
		expect(problemsOf({}, false)).toMatch(/only a preview/);
	});

	it('needs what it states to make sense', () => {
		expect(problemsOf({ name: ' ' })).toMatch(/needs a name/);
		expect(problemsOf({ type: 'nonsense' })).toMatch(/unknown type/);
		expect(problemsOf({ class: 'nonsense' })).toMatch(/unknown class/);
		expect(problemsOf({ level: 6 })).toMatch(/0 to 5/);
	});

	it('asks for the code once the card data has it', () => {
		expect(problemsOf({ name: 'Sledgehammer', level: 3 })).toMatch(/use its code 12028/);
		expect(problemsOf({ name: 'sledgehammer', level: 3 })).toMatch(/use its code 12028/);
		expect(problemsOf({ name: 'Sledgehammer', level: 1 })).toBe('');
	});
});

describe('sitemap', () => {
	it('only lists cards with something to see', () => {
		const paths = reviewSitemapPaths();
		expect(paths).toContain('/review');
		for (const path of paths.filter((p) => p.startsWith('/review/card/'))) {
			expect(reviewCardPage(path.split('/').at(-1)!)?.entries.length, path).toBeGreaterThan(0);
		}
	});
});

describe('hover text', () => {
	it('carries the text of linked cards, an investigator only by its front without flavor', () => {
		const page = reviewCardPage('12073')!;
		const isabelle = page.mentionedText['12013'];
		expect(page.mentioned['12013']).toBeDefined();
		expect(isabelle.front.text).toBeTruthy();
		expect(isabelle.front.flavor).toBeUndefined();
		expect(isabelle.back).toBeUndefined();
	});

	it('leaves out flavor on every card', () => {
		for (const code of ['12073', '12051', '12023']) {
			for (const text of Object.values(reviewCardPage(code)!.mentionedText)) {
				expect(text.front.flavor).toBeUndefined();
				expect(text.back?.flavor).toBeUndefined();
			}
		}
	});

	it('leaves out cards with no text data', () => {
		const page = reviewCardPage('12051')!;
		expect(page.mentioned['12162']).toBeDefined();
		expect(page.mentionedText['12162']).toBeUndefined();
	});
});
