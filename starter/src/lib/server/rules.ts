/**
 * Quotes of the Grimoire put into markdown by the Grimoire's own ids, so a guide never has to bake
 * the rules into itself. On a line of its own:
 *
 * ```
 * {{rule 1.098}}                              the whole entry
 * {{rule 1.098 "enter the new location"}}     only the lines saying that, as many phrases as wanted
 * {{rule 3.140 4}}                            only numbered item 4, with what's under it
 * ```
 *
 * Each becomes a quote titled with the rule, linking to it on arkham.build.
 */
import grimoireData from './data/grimoire.json';

const grimoire: Record<string, { title: string; text: string } | undefined> = grimoireData;

const directive = /^\{\{rule\s+([^}\n]*)\}\}[ \t]*$/gm;

interface RuleQuote {
	id: string;
	numbers: number[];
	phrases: string[];
}

function parseRule(args: string): RuleQuote | string {
	const words = [...args.matchAll(/"([^"]*)"|(\S+)/g)];
	const id = words.shift()?.[2];
	if (id === undefined) return 'say which rule, like {{rule 1.098}}';
	if (grimoire[id] === undefined) return `${id} is not in the Grimoire`;
	const quote: RuleQuote = { id, numbers: [], phrases: [] };
	for (const [, phrase, word] of words) {
		if (phrase !== undefined) quote.phrases.push(phrase);
		else if (/^\d+$/.test(word)) quote.numbers.push(Number(word));
		else return `${word} should be a number of a numbered item, or a "phrase" in quotes`;
	}
	return quote;
}

/**
 * The Grimoire's own markup turned into what the site's markdown understands.
 */
function siteMarkup(text: string): string {
	return text
		.replace(/<img[^>]*>/g, '')
		.replace(/\s*<small>.*?<\/small>/g, '')
		.replace(/\[\[([^\]]+)\]\]/g, '<b><i>$1</i></b>')
		.replace(/\[([a-z_]+)\](?!\()/g, '<span class="icon-$1"></span>');
}

const indentOf = (line: string) => line.length - line.trimStart().length;
const isListItem = (line: string) => /^\s*(-|\d+\.)\s/.test(line);

/**
 * The lines of a rule a quote asks for, each a paragraph or list item of the Grimoire's text.
 */
function quotedLines(quote: RuleQuote): { lines: string[]; problems: string[] } {
	const lines = grimoire[quote.id]!.text.split('\n').filter((line) => line.trim() !== '');
	if (quote.numbers.length === 0 && quote.phrases.length === 0) return { lines, problems: [] };
	const picked = new Set<number>();
	const problems: string[] = [];
	for (const number of quote.numbers) {
		const at = lines.findIndex((line) => line.startsWith(`${number}. `));
		if (at === -1) {
			problems.push(`${quote.id} has no numbered item ${number}`);
			continue;
		}
		picked.add(at);
		for (let i = at + 1; i < lines.length && indentOf(lines[i]) > 0; i++) picked.add(i);
	}
	for (const phrase of quote.phrases) {
		const found = lines.flatMap((line, i) =>
			line.toLowerCase().includes(phrase.toLowerCase()) ? [i] : []
		);
		if (found.length === 0) problems.push(`${quote.id} doesn't say "${phrase}"`);
		for (const i of found) picked.add(i);
	}
	const kept = [...picked].sort((a, b) => a - b).map((i) => lines[i]);
	// What was under something left out comes up to the top level.
	const base = Math.min(...kept.map(indentOf));
	return { lines: kept.map((line) => line.slice(base)), problems };
}

/**
 * Markdown nests a list item only as deep as the words of the item above start, which the
 * Grimoire's 2 spaces fall short of under a numbered item.
 */
function nestForMarkdown(lines: string[]): string[] {
	return lines.map((line, i) => {
		if (indentOf(line) === 0) return line;
		const parent = lines
			.slice(0, i)
			.reverse()
			.find((above) => indentOf(above) < indentOf(line));
		const marker = parent?.match(/^\s*(?:-|\d+\.)\s/)?.[0];
		return marker === undefined ? line : ' '.repeat(marker.length) + line.trimStart();
	});
}

function quoteMarkdown(quote: RuleQuote): string {
	const rule = grimoire[quote.id]!;
	const href = `https://arkham.build/rules#grimoire-entry-${quote.id}`;
	const title = `<div class="rule-title"><a href="${href}" rel="noopener" target="_blank"><i aria-hidden="true" class="fa-solid fa-book"></i>${siteMarkup(rule.title)}</a></div>`;
	const lines = nestForMarkdown(quotedLines(quote).lines);
	// The title is an HTML block, which only a blank line ends.
	const out = [title, ''];
	lines.forEach((line, i) => {
		const together = i > 0 && isListItem(lines[i - 1]) && isListItem(line);
		if (i > 0 && !together) out.push('');
		out.push(siteMarkup(line));
	});
	return out.map((line) => (line === '' ? '>' : `> ${line}`)).join('\n');
}

/**
 * Markdown with every rule directive replaced by its quote. One that doesn't make sense is left as
 * it is, so the mistake shows.
 */
export function expandRuleDirectives(markdown: string): string {
	return markdown.replace(directive, (whole, args: string) => {
		const quote = parseRule(args);
		if (typeof quote === 'string' || quotedLines(quote).problems.length > 0) return whole;
		return quoteMarkdown(quote);
	});
}

/**
 * What's wrong with each rule directive in some markdown.
 */
export function ruleDirectiveProblems(markdown: string): string[] {
	return [...markdown.matchAll(directive)].flatMap((match) => {
		const quote = parseRule(match[1]);
		const problems = typeof quote === 'string' ? [quote] : quotedLines(quote).problems;
		return problems.map((problem) => `${match[0].trim()}: ${problem}`);
	});
}
