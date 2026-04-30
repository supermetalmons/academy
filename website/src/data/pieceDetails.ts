export type PieceDetailKind = 'image' | 'manaPool';

export type PieceDetailMonEntry = {
  name: string;
  image: string;
  imageScale?: number;
  nameTopPaddingPx?: number;
};

export type PieceDetailItem = {
  slug: string;
  title: string;
  text: string;
  image?: string;
  kind: PieceDetailKind;
  monEntries?: PieceDetailMonEntry[];
};

const ceramicMonEntriesBySlug: Record<string, PieceDetailMonEntry[]> = {
  angel: [
    {name: 'applecrème', image: '/assets/ceramic/angel-applecreme.png'},
    {
      name: 'cloud gabber',
      image: '/assets/ceramic/angel-cloud-gabber.png',
      imageScale: 0.82,
    },
    {name: 'gerp', image: '/assets/ceramic/angel-gerp.png', imageScale: 0.82},
    {name: 'king snowbie', image: '/assets/ceramic/angel-king-snowbie.png'},
    {
      name: 'prophet of mull',
      image: '/assets/ceramic/angel-prophet-of-mull.png',
      nameTopPaddingPx: 7,
    },
  ],
  demon: [
    {name: 'mega gwazi', image: '/assets/ceramic/demon-gwazi.png'},
    {name: 'notchur', image: '/assets/ceramic/demon-notchur.png'},
    {name: 'scordior', image: '/assets/ceramic/demon-scordior.png'},
    {name: 'speklmic', image: '/assets/ceramic/demon-speklmic.png', imageScale: 0.87},
    {name: 'zemred', image: '/assets/ceramic/demon-zemred.png'},
  ],
  drainer: [
    {name: 'glazie', image: '/assets/ceramic/drainer-glazie.png'},
    {name: 'gon with helmet', image: '/assets/ceramic/drainer-gon-with-helmey.png'},
    {
      name: 'gummy deino',
      image: '/assets/ceramic/drainer-gummy-deino.png',
      imageScale: 0.82,
    },
    {name: 'hatchat', image: '/assets/ceramic/drainer-hatchat.png'},
    {name: 'omom', image: '/assets/ceramic/drainer-omom.png'},
    {name: 'tripgib', image: '/assets/ceramic/drainer-tripgib.png'},
    {name: 'zwubbi', image: '/assets/ceramic/drainer-zwubbi.png'},
  ],
  mystic: [
    {name: 'estalibur', image: '/assets/ceramic/mystic-estalibur.png'},
    {
      name: 'masstar integrity',
      image: '/assets/ceramic/mystic-masstar-integrity.png',
      imageScale: 1.05,
    },
    {name: 'miyggis', image: '/assets/ceramic/mystic-miyggis.png', imageScale: 0.82},
    {name: 'shiwy', image: '/assets/ceramic/mystic-shiwy.png', imageScale: 0.82},
  ],
  spirit: [
    {name: 'gnamnut', image: '/assets/ceramic/spirit-gnamnut.png'},
    {name: 'lord idgecreist', image: '/assets/ceramic/spirit-lord-idgecreist.png'},
    {name: 'melmut', image: '/assets/ceramic/spirit-melut.png', imageScale: 0.87},
    {name: 'omen statue', image: '/assets/ceramic/spirit-omen-statue.png'},
    {name: 'owg', image: '/assets/ceramic/spirit-owg.png'},
    {name: 'slxxxxxxer', image: '/assets/ceramic/spirit-slxxxxxxer.png'},
  ],
};

export const pieceDetailItems: PieceDetailItem[] = [
  {
    slug: 'drainer',
    title: 'Drainer',
    text: 'Can move onto mana and carry mana.',
    image: '/assets/mons/drainer.png',
    kind: 'image',
    monEntries: ceramicMonEntriesBySlug.drainer,
  },
  {
    slug: 'spirit',
    title: 'Spirit',
    text: 'Can target any piece exactly two tiles away and push it one tile in any direction.',
    image: '/assets/mons/spirit.png',
    kind: 'image',
    monEntries: ceramicMonEntriesBySlug.spirit,
  },
  {
    slug: 'mystic',
    title: 'Mystic',
    text: 'Attacks two tiles away diagonally. Can target through/over other pieces.',
    image: '/assets/mons/mystic.png',
    kind: 'image',
    monEntries: ceramicMonEntriesBySlug.mystic,
  },
  {
    slug: 'demon',
    title: 'Demon',
    text: 'Attacks two tiles away orthoganally. Moves to target location and cannot target through other pieces.',
    image: '/assets/mons/demon.png',
    kind: 'image',
    monEntries: ceramicMonEntriesBySlug.demon,
  },
  {
    slug: 'angel',
    title: 'Angel',
    text: 'Protects adjacent friendly mons from incoming demon or mystic attacks.',
    image: '/assets/mons/angel.png',
    kind: 'image',
    monEntries: ceramicMonEntriesBySlug.angel,
  },
  {
    slug: 'white-mana',
    title: 'White Mana',
    text: 'Bring mana to a corner pool to score 1 point. Can be mana moved at the end of your turn.',
    image: '/assets/mons/mana.png',
    kind: 'image',
  },
  {
    slug: 'black-mana',
    title: 'Black Mana',
    text: 'Bring enemy mana to a corner pool to score 2 points. Cannot be mana moved.',
    image: '/assets/mons/manaB.png',
    kind: 'image',
  },
  {
    slug: 'super-mana',
    title: 'Super Mana',
    text: 'Bring super mana to a corner pool to score 2 points. Returns to center tile if drainer is fainted while holding.',
    image: '/assets/mons/supermana.png',
    kind: 'image',
  },
  {
    slug: 'item-pickup',
    title: 'Item Pickup',
    text: 'Move onto an item to pick it up. You must choose between either option.',
    image: '/assets/mons/bombOrPotion.png',
    kind: 'image',
  },
  {
    slug: 'bomb',
    title: 'Bomb',
    text: 'Can be thrown at an enemy mon up to 3 tiles away. The bomb is spent when it hits.',
    image: '/assets/mons/bomb.png',
    kind: 'image',
  },
  {
    slug: 'potion',
    title: 'Potion',
    text: 'Adds one extra active ability resource to your turn.',
    image: '/assets/mons/potion.png',
    kind: 'image',
  },
  {
    slug: 'movement-points',
    title: 'Movement Points',
    text: 'Each turn you have 5 movement points you can use on any mon.',
    image: '/assets/mons/resources/statusMove.webp',
    kind: 'image',
  },
  {
    slug: 'active-abilities',
    title: 'Active Abilities',
    text: 'Each turn you have one active ability point you can use on your spirit, demon, or mystic.',
    image: '/assets/mons/resources/statusAction.webp',
    kind: 'image',
  },
  {
    slug: 'mana-moves',
    title: 'Mana Moves',
    text: 'Each turn you have one mana move. Select one of your own mana and move it one tiles in any direction. This ends your turn.',
    image: '/assets/mons/resources/statusMana.webp',
    kind: 'image',
  },
  {
    slug: 'mana-pool',
    title: 'Mana Pool',
    text: 'Bring mana here to score points. 5 wins the game!',
    kind: 'manaPool',
  },
];

export const pieceDetailBySlug = pieceDetailItems.reduce<Record<string, PieceDetailItem>>(
  (result, item) => {
    result[item.slug] = item;
    return result;
  },
  {},
);

export const pieceDetailPathByTitle = pieceDetailItems.reduce<Record<string, string>>(
  (result, item) => {
    result[item.title] = `/piece-details/${item.slug}`;
    return result;
  },
  {},
);

export function getPieceDetailPathByTitle(title: string): string | null {
  return pieceDetailPathByTitle[title] ?? null;
}
