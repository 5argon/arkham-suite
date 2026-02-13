import { walk } from 'https://deno.land/std@0.210.0/fs/mod.ts'
import { emptyDir, ensureDir } from 'https://deno.land/std/fs/mod.ts'
import { Image } from 'https://deno.land/x/imagescript/mod.ts'
import { resize } from 'https://deno.land/x/deno_image/mod.ts'

const setToName: { [key: string]: string } = {
	DWLC: 'The Dunwich Legacy (Campaign Expansion)',
	DWLP: 'The Dunwich Legacy (Investigator Expansion)',
	PTCC: 'The Path to Carcosa (Campaign Expansion)',
	PTCP: 'The Path to Carcosa (Investigator Expansion)',
	TFAC: 'The Forgotten Age (Campaign Expansion)',
	TFAP: 'The Forgotten Age (Investigator Expansion)',
	TCUP: 'The Circle Undone (Investigator Expansion)',
	TCUC: 'The Circle Undone (Campaign Expansion)',
	TDEP: 'The Dream-Eaters (Investigator Expansion)',
	TDEC: 'The Dream-Eaters (Campaign Expansion)',
	TICC: 'The Innsmouth Conspiracy (Campaign Expansion)',
	TICP: 'The Innsmouth Conspiracy (Investigator Expansion)',
	EOTEP: 'Edge of the Earth (Investigator Expansion)',
	EOTEC: 'Edge of the Earth (Campaign Expansion)',
	TSKP: 'The Scarlet Keys (Investigator Expansion)',
	TSKC: 'The Scarlet Keys (Campaign Expansion)',
	FHVP: 'The Feast of Hemlock Vale (Investigator Expansion)',
	FHVC: 'The Feast of Hemlock Vale (Campaign Expansion)',
	SS: 'Standalone Scenario',
	PAR: 'Parallel Investigator',
}

interface ResultSet {
	index: number
	setCode: string
	setName: string
	items: ResultItem[]
	itemCount: number
	printedQuantity: number
}

interface ResultItem {
	setCode: string
	setName: string
	hash: string
	name: string
	description: string
	members: ResultItemMember[]
}

interface ResultItemMember {
	variation: number
	quantity: number
	frontName: string
	backName: string
}

interface HashToDescription {
	hash: string
	description: string
}

let items = new Map<string, ResultItem>()
const hashToDescription = new Map<string, HashToDescription>()

for await (const entry of walk('deno/utility-mini-card/full', {
	includeDirs: false,
})) {
	// Naming format : SET-NAME-NAME-ETC-1-x2-A.png
	// SET: Able to map into full name and automatically categorize into folders.
	// NAME: Any amount of names until we reach variation number.
	// 1: Variation number. Must contain A and B of the same number.
	// x2: Quantity, both front and back must use the same number.
	// A/B: Front/Back
	if (entry.name === '.DS_Store') {
		continue
	}
	if (entry.isFile) {
		const fullName = entry.name
		const [set, ...nameParts] = fullName.split('-')
		const frontOrBack = nameParts.pop()
		let front: boolean
		switch (frontOrBack) {
			case 'A.png':
				front = true
				break
			case 'B.png':
				front = false
				break
			default:
				throw new Error(`Invalid front/back: ${frontOrBack} of ${fullName}`)
		}
		const quantityOrNot = nameParts[nameParts.length - 1]
		// If there is no x, then quantity is 1, and don't pop it.
		let quantity = 1
		if (quantityOrNot.startsWith('x')) {
			const quantityText = nameParts.pop()
			if (quantityText !== undefined) {
				quantity = parseInt(quantityText.slice(1))
			}
		}

		// If no variation number, it is 1.
		let variation = 1
		const variationOrNot = nameParts[nameParts.length - 1]
		const parsedVariation = parseInt(variationOrNot)
		if (!isNaN(parsedVariation)) {
			nameParts.pop()
			variation = parsedVariation
		}

		const title = nameParts.join('-')
		const hash = `${set}-${title}`
		hashToDescription.set(hash, { hash: hash, description: '(No Description)' })

		let previousItem = items.get(hash)
		if (previousItem === undefined) {
			if (setToName[set] === undefined) {
				throw new Error(`Unknown set: ${set}`)
			}
			const setName = setToName[set]
			const resultItem: ResultItem = {
				setCode: set,
				setName: setName,
				hash: hash,
				name: title,
				description: '(No Description)',
				members: [],
			}
			items = items.set(hash, resultItem)
			previousItem = resultItem
		}
		if (previousItem !== undefined) {
			// Search for same variation and quantity, to fill in the other side.
			const previousMember = previousItem.members.find((member) => {
				if (member.variation === variation && member.quantity === quantity) {
					return true
				}
				return false
			})
			if (previousMember !== undefined) {
				if (front) {
					previousMember.frontName = fullName
				} else {
					previousMember.backName = fullName
				}
			} else {
				previousItem.members.push({
					variation: variation,
					quantity: quantity,
					frontName: front ? fullName : '',
					backName: front ? '' : fullName,
				})
			}
		}
	}
}

// Load previous util-mini-hash-to-description.json first to merge and then write back.
let previousHashToDescriptionArray: HashToDescription[] = []
try {
	const previousHashToDescriptionJson = await Deno.readTextFile(
		'src/lib/data/util-mini-hash-to-description.json',
	)
	previousHashToDescriptionArray = JSON.parse(previousHashToDescriptionJson)
} catch {
	// OK if file doesn't exist.
}

for (const previousHashToDescription of previousHashToDescriptionArray) {
	if (
		hashToDescription.has(previousHashToDescription.hash) &&
		previousHashToDescription.description !== ''
	) {
		hashToDescription.set(previousHashToDescription.hash, previousHashToDescription)
	}
}

const hashToDescriptionArray: HashToDescription[] = Array.from(hashToDescription.values())
hashToDescriptionArray.sort((a, b) => {
	if (a.hash < b.hash) {
		return -1
	}
	if (a.hash > b.hash) {
		return 1
	}
	return 0
})

const hashToDescriptionJson = JSON.stringify(hashToDescriptionArray, undefined, 2)
await Deno.writeTextFile('src/lib/data/util-mini-hash-to-description.json', hashToDescriptionJson)
console.log(`Wrote ${hashToDescriptionArray.length} items to util-mini-hash-to-description.json`)

// Merge description into items.
items.forEach((item) => {
	if (hashToDescription.has(item.hash)) {
		const htd = hashToDescription.get(item.hash)
		if (htd !== undefined) {
			item.description = htd.description
		}
	}
})

const resultItemArray = Array.from(items.values())
resultItemArray.forEach((resultItem) => {
	resultItem.members.sort((a, b) => {
		if (a.variation < b.variation) {
			return -1
		}
		if (a.variation > b.variation) {
			return 1
		}
		return 0
	})
})

resultItemArray.sort((a, b) => {
	if (a.setCode < b.setCode) {
		return -1
	}
	if (a.setCode > b.setCode) {
		return 1
	}
	if (a.name < b.name) {
		return -1
	}
	if (a.name > b.name) {
		return 1
	}
	return 0
})

const resultSet = new Map<string, ResultSet>()
resultItemArray.forEach((resultItem) => {
	let resultSetItem = resultSet.get(resultItem.setCode)
	if (resultSetItem === undefined) {
		let setIndex = 1
		Object.entries(setToName).forEach(([setCode, setName], i) => {
			if (setCode == resultItem.setCode) {
				setIndex = i
			}
		})

		resultSetItem = {
			index: setIndex,
			setCode: resultItem.setCode,
			setName: resultItem.setName,
			items: [],
			itemCount: 0,
			printedQuantity: 0,
		}
		resultSet.set(resultItem.setCode, resultSetItem)
	}
	resultSetItem.itemCount += 1
	resultSetItem.items.push(resultItem)
	for (const member of resultItem.members) {
		resultSetItem.printedQuantity += member.quantity
	}
})

// Write util-mini-db.json
const resultSetArray = Array.from(resultSet.values())
resultSetArray.sort((a, b) => {
	if (a.index < b.index) {
		return -1
	}
	if (a.index > b.index) {
		return 1
	}
	return 0
})
const resultItemArrayJson = JSON.stringify(resultSetArray, undefined, 2)
await Deno.writeTextFile('src/lib/data/util-mini-db.json', resultItemArrayJson)
console.log(`Wrote ${resultItemArray.length} items to util-mini-db.json`)

await emptyDir('deno/utility-mini-card/drive')
await emptyDir('deno/utility-mini-card/mpc')
await emptyDir('static/image/custom/utility-mini-card')

// Crop images and write to display folder.
const promises: Promise<void>[] = []
for (const resultItem of resultItemArray) {
	for (const member of resultItem.members) {
		promises.push(processSingleCard(resultItem, member, false))
		promises.push(processSingleCard(resultItem, member, true))
	}
}
await Promise.all(promises)
console.log('Processed all images.')

async function processSingleCard(
	item: ResultItem,
	member: ResultItemMember,
	back: boolean,
): Promise<void> {
	const name = back ? member.backName : member.frontName
	const fullPath = `deno/utility-mini-card/full/${name}`
	const displayPath = `static/image/custom/utility-mini-card/${name}`
	const image = await Image.decode(await Deno.readFile(fullPath))
	const cropped = image.clone().crop(156, 134, 816, 555)
	const croppedForDisplay = image.clone().crop(190, 170, 743, 485)

	// MPC and Drive folder has subfolders by their set.
	const folderName = item.setName
	await ensureDir(`deno/utility-mini-card/mpc/${folderName}`)
	await ensureDir(`deno/utility-mini-card/drive/${folderName}`)
	await Deno.writeFile(`deno/utility-mini-card/drive/${folderName}/${name}`, await image.encode())
	// Vertical with : Front = Top on right, Back = Top on left
	const mpcFlipped = cropped.clone().rotate(back ? 90 : -90)
	await Deno.writeFile(
		`deno/utility-mini-card/mpc/${folderName}/${name}`,
		await mpcFlipped.encode(),
	)

	const resized = await resize(await croppedForDisplay.encode(), { width: 256 })
	await Deno.writeFile(displayPath, resized)
}
