type DividerToc = DividerData[];

interface DividerData {
	groupName: string;
	description: string;
	link?: string;
	items: DividerDataItem[];
}

interface DividerDataItem {
	name: string;
	count: number;
	description: string;
}

export const dividerData: DividerToc = [
	{
		groupName: 'Core Set',
		description:
			'All recurring Core Set encounters. Includes a special The Midnight Mask divider for the often called for 5 cards of that scenario.',
		items: [{ name: 'Core Set', count: 14, description: '' }]
	},
	{
		groupName: 'Player Cards',
		description:
			'Organize player cards in various ways, all regardless of which expansions they came from.',
		items: [
			{ name: 'Player - Class No Levels', count: 14, description: '' },
			{ name: 'Player - Class With Levels', count: 14, description: '' },
			{ name: 'Player - Customizable With Set Strip', count: 11, description: '' },
			{ name: 'Player - Customizable', count: 11, description: '' },
			{ name: 'Player - Investigator By Set', count: 11, description: '' },
			{ name: 'Player - Investigator', count: 6, description: '' },
			{ name: 'Player - Misc', count: 4, description: '' },
			{ name: 'Player - Multi-Class', count: 16, description: '' },
			{ name: 'Player - Slot Requirement', count: 27, description: '' },
			{ name: 'Extra', count: 8, description: '' }
		]
	},
	{
		groupName: 'Player Cards : CCQ (Cycle Class Quantity)',
		description:
			'Alternate player card organization by Investigator Expansion, then by class of that expansion. The encounter set-like quantity counter can prevent lost card.',
		items: [
			{ name: 'CCQ - Core Set', count: 8, description: '' },
			{ name: 'CCQ - Revised Core Set', count: 8, description: '' },
			{ name: 'CCQ - Investigator Starter Decks', count: 5, description: '' },
			{ name: 'CCQ - The Dunwich Legacy', count: 6, description: '' },
			{ name: 'CCQ - The Path to Carcosa', count: 6, description: '' },
			{ name: 'CCQ - The Forgotten Age', count: 6, description: '' },
			{ name: 'CCQ - The Circle Undone', count: 7, description: '' },
			{ name: 'CCQ - The Dream-Eaters', count: 6, description: '' },
			{ name: 'CCQ - Edge of the Earth', count: 11, description: '' },
			{ name: 'CCQ - The Scarlet Keys', count: 6, description: '' },
			{ name: 'CCQ - The Feast of Hemlock Vale', count: 6, description: '' },
			{ name: 'CCQ - Return To', count: 5, description: '' }
		],
		link: 'something'
	},
	{
		groupName: 'Player Cards : CNR (Collector Number Range)',
		description:
			'Alternate player card organization by Investigator Expansion, then by from-to range of collector number. Newer expansions with contiguous card class when running through numbers get class-colored corner.',
		items: [
			{ name: 'CNR - Core Set', count: 8, description: '' },
			{ name: 'CNR - Investigator Starter Decks', count: 5, description: '' },
			{ name: 'CNR - The Dunwich Legacy', count: 7, description: '' },
			{ name: 'CNR - The Path to Carcosa', count: 7, description: '' },
			{ name: 'CNR - The Forgotten Age', count: 7, description: '' },
			{ name: 'CNR - The Dream-Eaters', count: 7, description: '' },
			{ name: 'CNR - The Circle Undone', count: 7, description: '' },
			{ name: 'CNR - The Innsmouth Conspiracy', count: 7, description: '' },
			{ name: 'CNR - Edge of the Earth', count: 8, description: '' },
			{ name: 'CNR - The Scarlet Keys', count: 6, description: '' },
			{ name: 'CNR - The Feast of Hemlock Vale', count: 6, description: '' },
			{ name: 'CNR - Return To', count: 5, description: '' }
		],
		link: 'something'
	},
	{
		groupName: 'Encounter : Campaign',
		description:
			'Campaign encounter set dividers. Each one has the encounter set icon, its name, and a small colored strip of the campaign name.',
		items: [
			{ name: 'Campaign - Night of the Zealot', count: 3, description: '' },
			{ name: 'Campaign - The Dunwich Legacy', count: 18, description: '' },
			{ name: 'Campaign - The Path to Carcosa', count: 19, description: '' },
			{ name: 'Campaign - The Forgotten Age', count: 22, description: '' },
			{ name: 'Campaign - The Circle Undone', count: 21, description: '' },
			{ name: 'Campaign - The Dream-Eaters', count: 20, description: '' },
			{ name: 'Campaign - The Innsmouth Conspiracy', count: 18, description: '' },
			{ name: 'Campaign - Edge of the Earth', count: 24, description: '' },
			{ name: 'Campaign - The Scarlet Keys', count: 26, description: '' },
			{ name: 'Campaign - The Feast of Hemlock Vale', count: 26, description: '' }
		]
	},
	{
		groupName: 'Encounter : Return To Campaign',
		description:
			'Return To Campaign encounter set dividers. Each one has the encounter set icon, its name, and a small colored strip of the campaign name.',
		items: [
			{ name: 'Campaign - Return to the Night of the Zealot', count: 6, description: '' },
			{ name: 'Campaign - Return to the Dunwich Legacy', count: 14, description: '' },
			{ name: 'Campaign - Return to the Path to Carcosa', count: 13, description: '' },
			{ name: 'Campaign - Return to the Forgotten Age', count: 14, description: '' },
			{ name: 'Campaign - Return to the Circle Undone', count: 16, description: '' }
		]
	},
	{
		groupName: 'Encounter : Custom Campaign',
		description:
			'I want to support hard work of custom campaign authors, I hope these dividers can invite you to give them a try.',
		items: [
			{ name: 'Custom - Alice in Wonderland', count: 19, description: '' },
			{ name: 'Custom - Cyclopean Foundations', count: 20, description: '' },
			{ name: 'Custom - Dark Matter', count: 16, description: '' }
		]
	},
	{
		groupName: 'Encounter : Side Scenarios',
		description: 'Standalones and challenge scenarios',
		items: [
			{ name: 'Standalone - Curse of the Rougarou', count: 3, description: '' },
			{ name: 'Standalone - Carnevale of Horrors', count: 2, description: '' },
			{ name: 'Standalone - The Labyrinths of Lunacy', count: 4, description: '' },
			{ name: 'Standalone - Guardians of the Abyss', count: 7, description: '' },
			{ name: 'Standalone - Murder at the Excelsior Hotel', count: 7, description: '' },
			{ name: 'Standalone - The Blob That Ate Everything', count: 8, description: '' },
			{ name: 'Standalone - War of the Outer Gods', count: 5, description: '' },
			{ name: 'Standalone - Machinations Through Time', count: 4, description: '' },
			{ name: 'Standalone - Fortune and Folly', count: 4, description: '' },
			{ name: 'Standalone - Barkham Horror', count: 2, description: '' },
			{ name: 'Challenge Scenario', count: 7, description: '' }
		]
	}
];
