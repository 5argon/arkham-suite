export type CompiledMf2Subset = (params: Record<string, number | string>) => string;

type Pieces = Piece[];
type Piece = RegularString | Bracket;
interface RegularString {
	text: string;
}

interface Bracket {
	variableName: string;
	special?: SpecialSelect | SpecialPlural;
}

interface SpecialSelect {
	type: 'select';
	cases: Record<string, Pieces>;
}

export interface PluralMessage {
	zero?: SingleOrNone;
	one?: SingleOrNone;
	other?: SingleOrNone;
}

type SingleOrNone = string;

export class PluralResolver {
	private message: (count: number) => PluralMessage;
	constructor(message: (count: number) => PluralMessage) {
		this.message = message;
	}

	public resolve(count: number): string {
		const message = this.message(count);
		if (count === 0 && message.zero) return message.zero;
		if (count === 1 && message.one) return message.one;
		if (message.other) return message.other;
		return '';
	}
}

type PluralType = '=0' | '=1' | 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

interface SpecialPlural {
	type: 'plural';
	cases: Record<PluralType, Pieces>;
}

/**
 *
 */
export function compile(message: string): CompiledMf2Subset {
	const topmostPieces = compileRecursive(message);
	return (params: Record<string, number | string>) => {
		return resolveRecursive(topmostPieces, params);
	};
}

function compileRecursive(message: string): Pieces {
	const pieces: Piece[] = [];
	let i = 0;
	while (i < message.length) {
		if (message[i] === '{') {
			const endBracket = findClosingBracket(message, i);
			const content = message.slice(i + 1, endBracket);
			const [variableName, ...rest] = splitContent(content);
			if (rest.length === 0) {
				pieces.push({ variableName: variableName.trim() });
			} else {
				const type = rest[0].trim();
				if (type === 'select') {
					const cases = parseSelectCases(rest.slice(1).join(','));
					pieces.push({ variableName: variableName.trim(), special: { type: 'select', cases } });
				} else if (type === 'plural') {
					const cases = parsePluralCases(rest.slice(1).join(','));
					pieces.push({ variableName: variableName.trim(), special: { type: 'plural', cases } });
				}
			}
			i = endBracket + 1;
		} else {
			const nextBracket = message.indexOf('{', i);
			const text = nextBracket === -1 ? message.slice(i) : message.slice(i, nextBracket);
			pieces.push({ text });
			i += text.length;
		}
	}
	return pieces;
}

function splitContent(content: string): string[] {
	const result = [];
	let depth = 0;
	let start = 0;
	for (let i = 0; i < content.length; i++) {
		if (content[i] === '{') depth++;
		if (content[i] === '}') depth--;
		if (content[i] === ',' && depth === 0) {
			result.push(content.slice(start, i).trim());
			start = i + 1;
		}
	}
	result.push(content.slice(start).trim());
	return result;
}

function findClosingBracket(message: string, start: number): number {
	let depth = 1;
	for (let i = start + 1; i < message.length; i++) {
		if (message[i] === '{') depth++;
		if (message[i] === '}') depth--;
		if (depth === 0) return i;
	}
	throw new Error('Unmatched bracket ' + message);
}

function parseSelectCases(content: string): Record<string, Pieces> {
	const cases: Record<string, Pieces> = {};
	let i = 0;
	while (i < content.length) {
		const keyStart = i;
		while (content[i] !== '{' && i < content.length) i++;
		const key = content.slice(keyStart, i).trim();
		const valueStart = i + 1;
		const valueEnd = findClosingBracket(content, i);
		const value = content.slice(valueStart, valueEnd);
		cases[key] = compileRecursive(value);
		i = valueEnd + 1;
	}
	return cases;
}

function parsePluralCases(content: string): Record<PluralType, Pieces> {
	const cases: Record<string, Pieces> = {};
	let i = 0;
	while (i < content.length) {
		const keyStart = i;
		while (content[i] !== '{' && i < content.length) i++;
		const key = content.slice(keyStart, i).trim() as PluralType;
		const valueStart = i + 1;
		const valueEnd = findClosingBracket(content, i);
		const value = content.slice(valueStart, valueEnd);
		cases[key] = compileRecursive(value);
		i = valueEnd + 1;
	}
	return cases;
}

/**
 * The params stay the same at all recursive level to match variable name.
 */
function resolveRecursive(pieces: Pieces, params: Record<string, number | string>): string {
	return pieces
		.map((piece) => {
			if ('text' in piece) {
				return piece.text;
			} else {
				if (!(piece.variableName in params)) {
					return '';
				}
				const value = params[piece.variableName];
				if (piece.special) {
					if (piece.special.type === 'select') {
						const caseKey = value in piece.special.cases ? value : 'other';
						return resolveRecursive(piece.special.cases[caseKey], params);
					} else if (piece.special.type === 'plural') {
						const caseKey = getPluralCaseKey(value as number, piece.special.cases);
						return resolveRecursive(piece.special.cases[caseKey], params).replace(
							'#',
							value.toString()
						);
					}
				} else {
					return value.toString();
				}
			}
		})
		.join('');
}

function getPluralCaseKey(value: number, cases: Record<PluralType, Pieces>): PluralType {
	if (`=${value}` in cases) return `=${value}` as PluralType;
	if (value === 0 && 'zero' in cases) return 'zero';
	if (value === 1 && 'one' in cases) return 'one';
	if (value === 2 && 'two' in cases) return 'two';
	if (value < 5 && 'few' in cases) return 'few';
	if (value >= 5 && 'many' in cases) return 'many';
	return 'other';
}

// Nesting example :
// { SEL1, select,
//     other {
//       { PLUR1, plural,
//         one {1}
//         other {
//           { SEL2, select, other {Deep in the heart.} }
//         }
//       }
//     }
//   }

// Variables
// The most common way to use MessageFormat is for simple variable replacement. MessageFormat may look odd at first, but it's actually fairly simple. One way to think about the { and } is that every level of them bring you into and out-of "literal" and "code" mode.

// By default (like in the previous example), you are just writing a literal. Then the first level of brackets brings you into one of several data-driven situations. The most simple is variable replacement.

// Simply putting a variable name in between { and } will place that variable there in the output.

// const MessageFormat = require('messageformat');
// const mf = new MessageFormat('en');
// const varMessage = mf.compile('His name is {NAME}.');

// varMessage({ NAME: 'Jed' }); // 'His name is Jed.'

// SelectFormat
// SelectFormat is a lot like a switch statement for your messages. Often it's used to select gender in a string. The format of the statement is {varname, select, this{...} that{...} other{...}}, where varname matches a key in the data you give to the resulting function, and 'this' and 'that' are some of the string-equivalent values that it may have. The other key is required, and is selected if no other case matches.

// Note: Comparison is made using the JavaScript == operator, so if a key is left out of the input data, the case undefined{...} would match that.

// const MessageFormat = require('messageformat');
// const mf = new MesssageFormat('en');
// const selectMessage = mf.compile(
//   `{ GENDER, select,
//        male {He}
//        female {She}
//        other {They}
//    } liked this.`
// );

// selectMessage({ GENDER: 'male' }); // 'He liked this.'
// selectMessage({ GENDER: 'female' }); // 'She liked this.'
// selectMessage({}); // 'They liked this.'

// PluralFormat
// PluralFormat is a similar mechanism to SelectFormat, but specific to numerical values. The key that is chosen is generated from the specified input variable by a locale-specific plural function.

// The numeric input is mapped to a plural category, some subset of zero, one, two, few, many, and other depending on the locale and the type of plural. English, for instance, uses one and other for cardinal plurals (e.g. "one result", "many results") and one, two, few, and other for ordinal plurals (e.g. "1st result", "2nd result", etc). For information on which keys are used by your locale, please refer to the CLDR table of plural rules.

// For some languages, The number of printed digits is significant (e.g. "1 meter", "1.0 meters"); to account for that you may pass in the value as a stringified representation of the number.

// Matches for exact values are available with the = prefix, e.g. =0 and =1.

// The keyword for cardinal plurals is plural, and for ordinal plurals is selectordinal.

// Within a plural statement, # will be replaced by the variable value.

// const MessageFormat = require('messageformat');
// const mf = new MessageFormat('en');
// const messages = mf.compile({
//   results: `There { COUNT, plural,
//                     =0 {are no results}
//                     one {is one result}
//                     other {are # results}
//                   }.`,
//   position: `You are { POS, selectordinal,
//                        one {#st}
//                        two {#nd}
//                        few {#rd}
//                        other {#th}
//                      } in the queue.`
// });

// messages.results({ COUNT: 0 }); // 'There are no results.'
// messages.results({ COUNT: 1 }); // 'There is one result.'
// messages.results({ COUNT: 100 }); // 'There are 100 results.'
// messages.position({ POS: 1 }); // 'You are 1st in the queue.'
// messages.position({ POS: 33 }); // 'You are 33rd in the queue.'
