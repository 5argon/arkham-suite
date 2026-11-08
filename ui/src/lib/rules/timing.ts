/**
 * The 5 timing diagrams of the Grimoire, the four phases and the skill test, as steps and player
 * windows in order. Steps go by the Grimoire's own ids, so `3.320` is step 3.2 of the Enemy phase.
 *
 * Markdown calls one up on a line of its own:
 *
 * ```
 * {{timing 3.320}}             Enemy phase, step 3.2 highlighted
 * {{timing after 3.320}}       Enemy phase, the player window after step 3.2 highlighted
 * {{timing 3.320 before 3.330}} both of the above, as many as wanted
 * {{timing 3.300}}             Enemy phase, nothing highlighted
 * {{timing 4.003}}             Skill test, step 3 highlighted
 * ```
 */

export type TimingDiagramId = 'mythos' | 'investigation' | 'enemy' | 'upkeep' | 'skill-test';

export type TimingRow = { kind: 'step'; id: string; number: string } | { kind: 'window' };

export interface TimingDiagramShape {
	id: TimingDiagramId;
	/**
	 * The Grimoire entry of the whole phase, which calls up the diagram with nothing highlighted. The
	 * skill test has none.
	 */
	grimoireId?: string;
	rows: TimingRow[];
}

/**
 * A diagram to draw, with the rows to highlight by their place in it.
 */
export interface TimingSpec {
	diagram: TimingDiagramId;
	highlighted: number[];
}

const step = (id: string, number: string): TimingRow => ({ kind: 'step', id, number });
const playerWindow: TimingRow = { kind: 'window' };

export const timingDiagrams: TimingDiagramShape[] = [
	{
		id: 'mythos',
		grimoireId: '3.100',
		rows: [
			step('3.110', '1.1'),
			step('3.120', '1.2'),
			step('3.130', '1.3'),
			step('3.140', '1.4'),
			playerWindow,
			step('3.150', '1.5')
		]
	},
	{
		id: 'investigation',
		grimoireId: '3.200',
		rows: [
			step('3.210', '2.1'),
			playerWindow,
			step('3.220', '2.2'),
			playerWindow,
			step('3.221', '2.2.1'),
			step('3.222', '2.2.2'),
			step('3.230', '2.3')
		]
	},
	{
		id: 'enemy',
		grimoireId: '3.300',
		rows: [
			step('3.310', '3.1'),
			step('3.320', '3.2'),
			playerWindow,
			step('3.330', '3.3'),
			playerWindow,
			step('3.340', '3.4')
		]
	},
	{
		id: 'upkeep',
		grimoireId: '3.400',
		rows: [
			step('3.410', '4.1'),
			playerWindow,
			step('3.420', '4.2'),
			step('3.430', '4.3'),
			step('3.440', '4.4'),
			step('3.450', '4.5'),
			step('3.460', '4.6')
		]
	},
	{
		id: 'skill-test',
		rows: [
			step('4.001', '1'),
			playerWindow,
			step('4.002', '2'),
			playerWindow,
			step('4.003', '3'),
			step('4.004', '4'),
			step('4.005', '5'),
			step('4.006', '6'),
			step('4.007', '7'),
			step('4.008', '8')
		]
	}
];

/**
 * Where the diagram is in the Grimoire on arkham.build.
 */
export function timingDiagramHref(shape: TimingDiagramShape): string {
	const anchor =
		shape.grimoireId === undefined
			? 'grimoire-section-skill_test_timing'
			: `grimoire-entry-${shape.grimoireId}`;
	return `https://arkham.build/rules#${anchor}`;
}

export function timingDiagram(id: TimingDiagramId): TimingDiagramShape {
	return timingDiagrams.find((diagram) => diagram.id === id)!;
}

/**
 * Reads what follows `timing` in a directive. Returns what's wrong with it instead, if anything.
 */
export function parseTiming(args: string): TimingSpec | string {
	const words = args.split(/[\s,]+/).filter((word) => word !== '');
	if (words.length === 0) return 'say which step to show, like {{timing 3.320}}';
	let diagram: TimingDiagramShape | undefined;
	const highlighted: number[] = [];
	const use = (found: TimingDiagramShape, word: string): string | undefined => {
		if (diagram !== undefined && diagram !== found) {
			return `${word} is not in the same diagram as the rest`;
		}
		diagram = found;
	};
	for (let i = 0; i < words.length; i++) {
		const word = words[i];
		const side = word === 'after' || word === 'before' ? word : undefined;
		const id = side === undefined ? word : words[++i];
		if (id === undefined) return `${word} needs a step after it, like ${word} 3.320`;
		const whole = timingDiagrams.find(
			(shape) => shape.grimoireId !== undefined && shape.grimoireId === id
		);
		if (whole !== undefined && side === undefined) {
			const problem = use(whole, id);
			if (problem) return problem;
			continue;
		}
		const found = timingDiagrams.find((shape) =>
			shape.rows.some((row) => row.kind === 'step' && row.id === id)
		);
		if (found === undefined) return `${id} is not a step of any timing diagram`;
		const problem = use(found, id);
		if (problem) return problem;
		const at = found.rows.findIndex((row) => row.kind === 'step' && row.id === id);
		if (side === undefined) {
			highlighted.push(at);
			continue;
		}
		const windowAt = side === 'after' ? at + 1 : at - 1;
		if (found.rows[windowAt]?.kind !== 'window') {
			return `there is no player window ${side} ${id}`;
		}
		highlighted.push(windowAt);
	}
	return { diagram: diagram!.id, highlighted: [...new Set(highlighted)].sort((a, b) => a - b) };
}

const directive = /^\{\{timing\s+([^}\n]*)\}\}[ \t]*$/gm;
const placeholder = /<div data-timing="([\w-]+):([\d,]*)"><\/div>/g;

/**
 * Turns each timing directive on a line of its own into an empty element the HTML can be split at.
 * One that doesn't make sense is left as it is, so the mistake shows.
 */
export function expandTimingDirectives(markdown: string): string {
	return markdown.replace(directive, (whole, args: string) => {
		const spec = parseTiming(args);
		if (typeof spec === 'string') return whole;
		return `\n<div data-timing="${spec.diagram}:${spec.highlighted.join(',')}"></div>\n`;
	});
}

/**
 * Takes timing directives out, where only the words matter.
 */
export function stripTimingDirectives(markdown: string): string {
	return markdown.replace(directive, '');
}

/**
 * What's wrong with each timing directive in some markdown.
 */
export function timingDirectiveProblems(markdown: string): string[] {
	return [...markdown.matchAll(directive)].flatMap((match) => {
		const spec = parseTiming(match[1]);
		return typeof spec === 'string' ? [`${match[0].trim()}: ${spec}`] : [];
	});
}

export type TimingSegment = { kind: 'html'; html: string } | { kind: 'timing'; timing: TimingSpec };

/**
 * Cuts processed HTML apart at its timing diagrams.
 */
export function splitTimingDiagrams(html: string): TimingSegment[] {
	const segments: TimingSegment[] = [];
	let end = 0;
	for (const match of html.matchAll(placeholder)) {
		segments.push({ kind: 'html', html: html.slice(end, match.index) });
		segments.push({
			kind: 'timing',
			timing: {
				diagram: match[1] as TimingDiagramId,
				highlighted: match[2] === '' ? [] : match[2].split(',').map(Number)
			}
		});
		end = match.index + match[0].length;
	}
	segments.push({ kind: 'html', html: html.slice(end) });
	return segments.filter((segment) => segment.kind !== 'html' || segment.html.trim() !== '');
}
