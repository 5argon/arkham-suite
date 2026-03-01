/**
 * remark-doc-images — mdsvex remark plugin for the in-app docs system.
 *
 * Authors write co-located images as plain markdown: `![alt](./shot.webp)`, with the file next to
 * the `.md`. This rewrites such relative image URLs to the SERVED static path
 * `/docs/<docPath>/<basename>`, where `<docPath>` is the doc's folder relative to `src/lib/docs/`.
 * The image files themselves are mirrored into `static/docs/**` by the doc-images Vite plugin
 * (see vite.config.ts / scripts/sync-doc-images.mjs). Pure string rewrite — no imports, no AST
 * gymnastics — so it's robust across mdsvex / Vite versions.
 *
 * Duplicate filenames are safe: each doc keeps its own `/docs/<docPath>/` namespace.
 */

const DOCS_SEGMENT = 'src/lib/docs/';

/**
 * Best-effort source path of the markdown file from the remark VFile.
 * @param {{ path?: string, filename?: string, history?: string[] }} file
 * @returns {string}
 */
function filePathOf(file) {
	return file?.path ?? file?.filename ?? file?.history?.[0] ?? '';
}

export function remarkDocImages() {
	/**
	 * @param {any} tree mdast root
	 * @param {{ path?: string, filename?: string, history?: string[] }} file
	 */
	return (tree, file) => {
		const abs = filePathOf(file).replace(/\\/g, '/');
		const at = abs.lastIndexOf(DOCS_SEGMENT);
		if (at < 0) return; // not a docs file — leave it alone
		// e.g. ".../src/lib/docs/archive/edit/finish-date/en.md" → "archive/edit/finish-date"
		const relFromDocs = abs.slice(at + DOCS_SEGMENT.length); // "archive/edit/finish-date/en.md"
		const docDir = relFromDocs.slice(0, relFromDocs.lastIndexOf('/')); // "archive/edit/finish-date"

		/** @param {any} node */
		const visit = (node) => {
			if (!node || typeof node !== 'object') return;
			if (node.type === 'image' && typeof node.url === 'string' && /^\.\.?\//.test(node.url)) {
				// Resolve ./ and ../ against the doc folder and PRESERVE sub-paths, so the rewritten
				// URL matches exactly where sync-doc-images mirrors the file (it copies the full
				// src/lib/docs/** structure into static/docs/**).
				/** @type {string[]} */
				const parts = [];
				for (const seg of `${docDir}/${node.url}`.split('/')) {
					if (seg === '' || seg === '.') continue;
					else if (seg === '..') parts.pop();
					else parts.push(seg);
				}
				node.url = `/docs/${parts.join('/')}`;
			}
			if (Array.isArray(node.children)) for (const child of node.children) visit(child);
		};
		visit(tree);
	};
}

export default remarkDocImages;
