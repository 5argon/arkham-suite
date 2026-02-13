import { readCSVObjects } from 'https://deno.land/x/csv/mod.ts'
import { AhdbDeck } from '../src/lib/ahdb/deck.ts'

interface DeckEntry {
	modifiedDeckName: string
	deck: AhdbDeck
	raw: RawDeck
}

interface RawDeck {
	user: string
	userUrl: string
	arkhamdbUserId: string
	id: string
	renameRegex: string
	series: string
	seriesUrl: string
	upgrade: string
	upgradeBreakpoint1: string
	upgradeBreakpoint2: string
	excerpt: string
}

async function convertTsvToJson(tsvPath: string) {
	const reader = await Deno.open(tsvPath)
	const json = readCSVObjects(reader, {
		columnSeparator: ',',
		lineSeparator: '\r\n',
	})

	const rawDecks: RawDeck[] = []
	for await (const obj of json) {
		rawDecks.push(obj as unknown as RawDeck)
	}

	const downloaded = await Promise.all(rawDecks.map(download))

	// Write JSON to file
	const jsonPath = tsvPath.replace(/\.csv$/, '.json')
	await Deno.writeTextFile(jsonPath, JSON.stringify(downloaded, null, 2))

	console.log(`Conversion complete. JSON file saved at: ${jsonPath}`)
}

// Usage: deno run --allow-read --allow-write script.ts <tsv_file_path>
const tsvPath = Deno.args[0]
if (!tsvPath) {
	console.error('Please provide the path to the CSV file.')
	Deno.exit(1)
}

await convertTsvToJson(tsvPath)

async function download(r: RawDeck): Promise<DeckEntry> {
	const deck = await fetch('https://arkhamdb.com/api/public/decklist/' + r.id)
	const json = (await deck.json()) as AhdbDeck
	return {
		modifiedDeckName:
			r.renameRegex.trim() === '' ? json.name : json.name.replace(new RegExp(r.renameRegex), '$1'),
		deck: json,
		raw: r,
	}
}
