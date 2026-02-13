import DOMPurify from 'dompurify';
import { marked } from 'marked';
import type { CardResolver } from '@5argon/arkham-kohaku';
import { getCardColorClass } from './coloring.js';

/**
 * Fix invalid markdown from valentin1331 template (spacing around center tags)
 */
export function cleanArkhamdbMarkdown(content: string): string {
	// Fix spacing around center tags
	let cleaned = content.replaceAll(
		/\*\*\s<center>(.*?)<\/center>\s\*\*/g,
		'**<center>$1</center>**'
	);

	// Convert double <br> sequences into proper paragraph breaks
	// This handles: <br><br>, <br>\r\n<br>, <br> <br>, etc.
	cleaned = cleaned.replaceAll(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n\n');

	return cleaned;
}

/**
 * Process markdown into HTML with colored card links
 */
export function markdownToHtml(markdown: string, cardResolver?: CardResolver): string {
	// Clean invalid markdown formatting
	let cleanedMarkdown = cleanArkhamdbMarkdown(markdown);

	// Step 1: Replace card links [Card Name](/card/12345) BEFORE parsing markdown
	// This way the colored spans are in the markdown, and marked.parse() will preserve them
	cleanedMarkdown = cleanedMarkdown.replace(
		/\[([^\]]+)\]\(\/card\/(\d+)\)/g,
		(match, cardName, cardCode) => {
			if (cardResolver) {
				try {
					const card = cardResolver.resolve(cardCode);
					if (card.cardClass) {
						const colorClass = getCardColorClass(card);
						return `<span class="card-link ${colorClass}">${cardName}</span>`;
					}
				} catch {
					// If card not found, just return the name
				}
			}
			return `<span class="card-link">${cardName}</span>`;
		}
	);

	// Step 2: Convert markdown to HTML
	// Configure marked to handle inline HTML and GFM tables
	// breaks=false because markdown has explicit <br> tags; double newlines create <p> tags
	marked.setOptions({
		breaks: false,
		gfm: true,
		async: false
	});

	const html = marked.parse(cleanedMarkdown) as string;

	// Step 3: Sanitize HTML
	// Note: Icon spans like <span class="icon-willpower"></span> are preserved
	// and rendered via webfont CSS (icons-icon.css)
	const clean = DOMPurify.sanitize(html);
	return clean;
}

/**
 * Convert markdown to plain text for preview (strips HTML and markdown formatting)
 */
export function markdownToPlainText(markdown: string): string {
	// Clean invalid markdown formatting first
	const cleaned = cleanArkhamdbMarkdown(markdown);
	
	// Convert markdown to HTML
	marked.setOptions({
		breaks: false,
		gfm: true,
		async: false
	});
	
	const html = marked.parse(cleaned) as string;
	
	// Strip all HTML tags
	const stripped = html.replace(/<[^>]*>/g, '');
	
	// Decode common HTML entities (works in SSR and browser)
	const decoded = stripped
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&nbsp;/g, ' ')
		.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
		.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
	
	// Clean up extra whitespace
	return decoded.replace(/\s+/g, ' ').trim();
}
