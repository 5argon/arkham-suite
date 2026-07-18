// sync-references.mjs — populate the local reference source that extract.mjs reads.
//
// The campaign text lives in zzorba/arkham-cards-data. We only need its campaign folders
// (not cards / i18n / errata / …), so this shallow-, blobless-, sparse-clones the repo, copies
// `campaigns/` + `return_campaigns/` into references/arkham-cards-data-master/, and drops the clone.
// The whole references/ tree is gitignored, so this only touches the local working copy.
//
//   node tools/sync-references.mjs            # both campaign folders
//   node tools/sync-references.mjs campaigns  # just one
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = 'https://github.com/zzorba/arkham-cards-data.git';
const REF_DIR = path.resolve(__dirname, '../references/arkham-cards-data-master');
const FOLDERS = process.argv.slice(2).length ? process.argv.slice(2) : ['campaigns', 'return_campaigns'];

const git = (args, opts = {}) => execFileSync('git', args, { stdio: 'inherit', ...opts });

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'arkham-cards-data-'));
try {
	console.log(`cloning ${REPO} (sparse: ${FOLDERS.join(', ')})…`);
	git(['clone', '--depth', '1', '--filter=blob:none', '--sparse', REPO, tmp]);
	git(['-C', tmp, 'sparse-checkout', 'set', ...FOLDERS]);

	fs.mkdirSync(REF_DIR, { recursive: true });
	for (const folder of FOLDERS) {
		const src = path.join(tmp, folder);
		if (!fs.existsSync(src)) throw new Error(`the repo has no "${folder}/" folder`);
		const dest = path.join(REF_DIR, folder);
		fs.rmSync(dest, { recursive: true, force: true });
		fs.cpSync(src, dest, { recursive: true });
		const count = fs.readdirSync(dest, { withFileTypes: true }).filter((d) => d.isDirectory()).length;
		console.log(`  ${folder}/ → references/arkham-cards-data-master/${folder}/ (${count} campaigns)`);
	}
	console.log('done. run `npm run regen` to rebuild the data from it.');
} finally {
	fs.rmSync(tmp, { recursive: true, force: true });
}
