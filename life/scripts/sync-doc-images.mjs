/**
 * sync-doc-images — mirror co-located doc images into the static folder.
 *
 * Docs live in `src/lib/docs/**` with images co-located next to their `.md` (e.g.
 * `src/lib/docs/archive/edit/finish-date/finish-date.webp`). At runtime they're referenced as
 * `/docs/<docPath>/<file>` (rewritten by remark-doc-images). This copies every image under
 * `src/lib/docs/**` to `static/docs/**`, preserving the relative path so those URLs resolve.
 *
 * `static/docs/` is git-ignored (generated). Run via `yarn docs:sync`, or automatically by the
 * doc-images Vite plugin (build + dev watcher). Idempotent.
 */
import { readdirSync, mkdirSync, copyFileSync, existsSync, rmSync } from 'node:fs'
import { join, relative, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url)) // the `life/` package root
const DOCS = join(ROOT, 'src/lib/docs')
const OUT = join(ROOT, 'static/docs')
const IMAGE_EXT = new Set(['.webp', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.avif'])

/** Copy every co-located doc image into static/docs (mirrored structure). Returns the count. */
export function syncDocImages() {
	// Exact mirror: drop stale copies first so a renamed/deleted source image doesn't linger.
	rmSync(OUT, { recursive: true, force: true })
	if (!existsSync(DOCS)) return 0
	let copied = 0
	const walk = (dir) => {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			const full = join(dir, entry.name)
			if (entry.isDirectory()) {
				walk(full)
			} else if (IMAGE_EXT.has(extname(entry.name).toLowerCase())) {
				const dest = join(OUT, relative(DOCS, full))
				mkdirSync(dirname(dest), { recursive: true })
				copyFileSync(full, dest)
				copied++
			}
		}
	}
	walk(DOCS)
	return copied
}

// CLI: `node scripts/sync-doc-images.mjs`
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
	const n = syncDocImages()
	console.log(`[docs:sync] copied ${n} image(s) → static/docs`)
}
