import { AhdbCard } from "./interfaces.ts";

export function manualEdit(p: AhdbCard[]) {
  // Customizable
  manualEditOne(p, "09021", (c) => {
    addCustCard(c, p, "09021", 129);
  });
  manualEditOne(p, "09022", (c) => {
    addCustCard(c, p, "09022", 130);
  });
  manualEditOne(p, "09023", (c) => {
    addCustCard(c, p, "09023", 131);
  });

  manualEditOne(p, "09040", (c) => {
    addCustCard(c, p, "09040", 132);
  });
  manualEditOne(p, "09041", (c) => {
    addCustCard(c, p, "09041", 133);
  });
  manualEditOne(p, "09042", (c) => {
    addCustCard(c, p, "09042", 134);
  });

  manualEditOne(p, "09059", (c) => {
    addCustCard(c, p, "09059", 135);
  });
  manualEditOne(p, "09060", (c) => {
    addCustCard(c, p, "09060", 136);
  });
  manualEditOne(p, "09061", (c) => {
    addCustCard(c, p, "09061", 137);
  });

  manualEditOne(p, "09079", (c) => {
    addCustCard(c, p, "09079", 138);
  });
  manualEditOne(p, "09080", (c) => {
    addCustCard(c, p, "09080", 139);
  });
  manualEditOne(p, "09081", (c) => {
    addCustCard(c, p, "09081", 140);
  });

  manualEditOne(p, "09099", (c) => {
    addCustCard(c, p, "09099", 141);
  });
  manualEditOne(p, "09100", (c) => {
    addCustCard(c, p, "09100", 142);
  });
  manualEditOne(p, "09101", (c) => {
    addCustCard(c, p, "09101", 143);
  });

  manualEditOne(p, "09119", (c) => {
    addCustCard(c, p, "09119", 144);
  });
}

/**
 * Makes a customizable card as a valid card that comes in the same box as "tskp".
 * Their code is the original code with a "b" at the end.
 */
function addCustCard(card: AhdbCard, p: AhdbCard[], c: string, pos: number) {
  const n: Partial<AhdbCard> = {
    code: c + "b",
    name: card.name,
    subname: "Upgrade Sheet",
    position: pos,
    type_code: "upgrade",
    pack_code: "tskp",
    faction_code: card.faction_code,
    quantity: 3,
    hidden: true,
  };
  p.push(n as AhdbCard);
}

function manualEditOne(p: AhdbCard[], c: string, edit: (c: AhdbCard) => void) {
  const found = p.find((x) => x.code === c);
  if (found) {
    edit(found);
    return;
  }
  throw new Error("Not found for manual edit " + c);
}
