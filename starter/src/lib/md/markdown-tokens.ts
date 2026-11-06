import { marked, type TokensList } from 'marked';

/**
 * Lexes markdown for `<SvelteMarkdown source={...}>`.
 *
 * svelte-marked's own bundled marked turns each paragraph of a loose list item into a bare `text` token,
 * which it renders with no wrapper, so a bullet with several paragraphs (blank line, then indented text)
 * comes out as one run-together block. This marked emits `paragraph` tokens for them instead.
 */
export function markdownTokens(source: string): TokensList {
	return marked.lexer(source);
}
