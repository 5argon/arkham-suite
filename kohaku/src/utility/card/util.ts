import { randomBasicWeakness } from '../../type/data/ahdb-card.js';
import { CardPack } from '../../type/game/card-pack.js';
import { Card, CardCode, CardResolver, CardType } from '../../type/index.js';

export function isHorizontalCard(card: Card): boolean {
		return (
			card.cardType === CardType.Investigator ||
			card.cardType === CardType.Act ||
			card.cardType === CardType.Agenda
		);
}

export function isRandomBasicWeakness(card: Card): boolean {
  return card.code === randomBasicWeakness;
}

/**
 * Calculate the commit power of a card.
 * The commit power is the highest total icon count when committing to any single skill test.
 * Start with wilds and add them to the highest non-wild stat.
 * 
 * Example: Card with 1 combat, 1 intellect, 2 wilds → Commit power is 3
 * (can commit for either 3 combat or 3 intellect)
 */
export function getCommitPower(card: Card): number {
  const wilds = card.skillWild ?? 0;
  const combat = card.skillCombat ?? 0;
  const agility = card.skillAgility ?? 0;
  const intellect = card.skillIntellect ?? 0;
  const willpower = card.skillWillpower ?? 0;
  
  const maxStat = Math.max(combat, agility, intellect, willpower);
  return wilds + maxStat;
}

export function isUnknownCardNumber(pack: CardPack | null, num: number): boolean {
  return num === 1000 || num === 0;
}

export function isOldCore(cardId: string): boolean {
  return cardId in coreToRcoreMap;
}

export function coreToRcore(cardId: string): string {
  if (isOldCore(cardId)) {
    return coreToRcoreMap[cardId];
  }
  return cardId;
}

export function coreCardToRcoreCard(card: Card, cardResolver: CardResolver): Card {
  const rcoreCode = coreToRcore(card.code);
  return cardResolver.resolve(rcoreCode);
}

export function uniqueCards(cards: Card[]): Card[] {
  const seen = new Set<string>();
  const result: Card[] = [];
  for (const card of cards) {
    if (!seen.has(card.code)) {
      seen.add(card.code);
      result.push(card);
    }
  }
  return result;
}

/**
 * Find all other cards required to play with the input card.
 * Currently it only means the cards bonded to the input card.
 */
export function findLinkedCards(card: Card): CardCode[] {
  return card.bondedCards ?? [];
}

export function rcoreToCore(cardId: string): string {
  const flip = Object.fromEntries(
    Object.entries(coreToRcoreMap).map(([k, v]) => {
      return [v, k];
    })
  );
  if (cardId in flip) {
    return flip[cardId];
  }
  return cardId;
}

const coreToRcoreMap: { [k: string]: string } = {
  '01001': '01501',
  '01002': '01502',
  '01003': '01503',
  '01004': '01504',
  '01005': '01505',
  '01006': '01506',
  '01007': '01507',
  '01008': '01508',
  '01009': '01509',
  '01010': '01510',
  '01011': '01511',
  '01012': '01512',
  '01013': '01513',
  '01014': '01514',
  '01015': '01515',
  '01016': '01516',
  '01017': '01517',
  '01018': '01518',
  '01019': '01519',
  '01020': '01520',
  '01021': '01521',
  '01022': '01522',
  '01023': '01523',
  '01024': '01524',
  '01025': '01525',
  '01026': '01526',
  '01027': '01527',
  '01028': '01528',
  '01029': '01529',
  '01030': '01530',
  '01031': '01531',
  '01032': '01532',
  '01033': '01533',
  '01034': '01534',
  '01035': '01535',
  '01036': '01536',
  '01037': '01537',
  '01038': '01538',
  '01039': '01539',
  '01040': '01540',
  '01041': '01541',
  '01042': '01542',
  '01043': '01543',
  '01044': '01544',
  '01045': '01545',
  '01046': '01546',
  '01047': '01547',
  '01048': '01548',
  '01049': '01549',
  '01050': '01550',
  '01051': '01551',
  '01052': '01552',
  '01053': '01553',
  '01054': '01554',
  '01055': '01555',
  '01056': '01556',
  '01057': '01557',
  '01058': '01558',
  '01059': '01559',
  '01060': '01560',
  '01061': '01561',
  '01062': '01562',
  '01063': '01563',
  '01064': '01564',
  '01065': '01565',
  '01066': '01566',
  '01067': '01567',
  '01068': '01568',
  '01069': '01569',
  '01070': '01570',
  '01071': '01571',
  '01072': '01572',
  '01073': '01573',
  '01074': '01574',
  '01075': '01575',
  '01076': '01576',
  '01077': '01577',
  '01078': '01578',
  '01079': '01579',
  '01080': '01580',
  '01081': '01581',
  '01082': '01582',
  '01083': '01583',
  '01084': '01584',
  '01085': '01585',
  '01086': '01586',
  '01087': '01587',
  '01088': '01588',
  '01089': '01589',
  '01090': '01590',
  '01091': '01591',
  '01092': '01592',
  '01093': '01593',
  '01094': '01594',
  '01095': '01595',
  '01096': '01596',
  '01097': '01597',
  '01098': '01598',
  '01099': '01599',
  '01100': '01600',
  '01101': '01601',
  '01102': '01602',
  '01103': '01603',
};
