/** A non-investigator Scarlet Key bearer. A Key they hold is not the cell's. */
export interface ScarletKeyBearer {
	/** The code stored as the bearer value. */
	code: string;
	name: string;
	/** The editor dropdown's optgroup. */
	group: string;
}

/** The eleven Red Coterie members, plus Abarran, who bears The Wellspring of Fortune when the
 *  players lose the Fortune and Folly standalone. */
export const SCARLET_KEY_NPC_BEARERS: ScarletKeyBearer[] = [
	{ code: 'ztsk_rgm', name: 'The Red-Gloved Man', group: 'Red Coterie' },
	{ code: 'ztsk_amaranth', name: 'Amaranth', group: 'Red Coterie' },
	{ code: 'ztsk_knight', name: 'The Claret Knight', group: 'Red Coterie' },
	{ code: 'ztsk_beast', name: 'The Beast in a Cowl of Crimson', group: 'Red Coterie' },
	{ code: 'ztsk_chica', name: 'La Chica Roja', group: 'Red Coterie' },
	{ code: 'ztsk_watcher', name: 'The Sanguine Watcher', group: 'Red Coterie' },
	{ code: 'ztsk_thorne', name: 'Thorne', group: 'Red Coterie' },
	{ code: 'ztsk_desi', name: 'Desiderio Delgado Álvarez', group: 'Red Coterie' },
	{ code: 'ztsk_niang', name: 'Tzu San Niang', group: 'Red Coterie' },
	{ code: 'ztsk_aliki', name: 'Aliki Zoni Uperetria', group: 'Red Coterie' },
	{ code: 'ztsk_ece', name: 'Ece Şahin', group: 'Red Coterie' },
	{ code: '88034a', name: 'Abarran Arrigorriagakoa', group: 'Fortune and Folly' }
];

export const SCARLET_KEY_NPC_CODES = new Set(SCARLET_KEY_NPC_BEARERS.map((n) => n.code));
