export interface ResultSet {
	setCode: string;
	setName: string;
	items: ResultItem[];
	itemCount: number;
	printedQuantity: number;
}

export interface ResultItem {
	setCode: string;
	setName: string;
	hash: string;
	name: string;
	description: string;
	members: ResultItemMember[];
}

export interface ResultItemMember {
	variation: number;
	quantity: number;
	frontName: string;
	backName: string;
}
