import { walk } from 'https://deno.land/std@0.210.0/fs/mod.ts'

type Result = ResultItem[]

interface ResultItem {
	lang: string
	folder: string
	items: string[]
}

interface ResultItem2 {
	folder: string
	items: string[]
}

const results: Result = []
const map = new Map<string, Set<string>>()
for await (const entry of walk('static/image/divider', { includeDirs: false })) {
	const splitted = entry.path.split('/')
	if (splitted.length === 6) {
		const folder = splitted[4]
		const fileSplit = splitted[5].split('_')
		let m = map.get(folder)
		if (m === undefined) {
			m = new Set<string>()
			map.set(folder, m)
		}
		m.add(fileSplit[2] + '_' + fileSplit[3])
	}
}

const result: ResultItem2[] = []
map.forEach((v, k) => {
	const arr = Array.from(v).sort()
	result.push({ items: arr, folder: k })
})
// for await (const entry of walk('static/image/divider', { maxDepth: 1, includeFiles: false })) {
// 	const lang = entry.name
//     console.log(entry)
// 	for await (const entry2 of walk(entry.path, { maxDepth: 1, includeFiles: false })) {
// 		const folder = entry2.name
// 		const items: string[] = []
// 		for await (const entry3 of walk(entry2.path, { maxDepth: 1, includeDirs: false })) {
// 			items.push(entry3.name)
// 		}
// 		items.sort()
// 		results.push({ lang: lang, folder: folder, items: items })
// 	}
// }

Deno.writeTextFileSync(
	'src/routes/divider/download/divider-dir.json',
	JSON.stringify(result, undefined, 2),
)
