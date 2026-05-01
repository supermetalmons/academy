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
  diagramImage?: string;
  kind: PieceDetailKind;
  monEntries?: PieceDetailMonEntry[];
};

export const pieceDetailsBoardDiagram = '/assets/diagrams/optimized/board.jpg';

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
    text: 'Only piece that can move onto the same tile as a mana and pick it up, and can walk through the center tile.',
    image: '/assets/mons/drainer.png',
    diagramImage: '/assets/diagrams/optimized/drainer.jpg',
    kind: 'image',
    monEntries: ceramicMonEntriesBySlug.drainer,
  },
  {
    slug: 'spirit',
    title: 'Spirit',
    text: 'Can target any piece (mana, mon, or item) exactly two tiles away and push it one tile in any direction.',
    image: '/assets/mons/spirit.png',
    diagramImage: '/assets/diagrams/optimized/spirit.jpg',
    kind: 'image',
    monEntries: ceramicMonEntriesBySlug.spirit,
  },
  {
    slug: 'mystic',
    title: 'Mystic',
    text: 'Faints a target exactly two tiles away diagonally- can shoot through/over other pieces.',
    image: '/assets/mons/mystic.png',
    diagramImage: '/assets/diagrams/optimized/mystic.jpg',
    kind: 'image',
    monEntries: ceramicMonEntriesBySlug.mystic,
  },
  {
    slug: 'demon',
    title: 'Demon',
    text: 'Faints a target exactly two tiles away orthoganally- moves to the attack location and cannot target through other pieces.',
    image: '/assets/mons/demon.png',
    diagramImage: '/assets/diagrams/optimized/demon.jpg',
    kind: 'image',
    monEntries: ceramicMonEntriesBySlug.demon,
  },
  {
    slug: 'angel',
    title: 'Angel',
    text: 'Protects adjacent friendly mons from incoming demon or mystic attacks- is itself vulnerable to attack.',
    image: '/assets/mons/angel.png',
    diagramImage: '/assets/diagrams/optimized/angel.jpg',
    kind: 'image',
    monEntries: ceramicMonEntriesBySlug.angel,
  },
  {
    slug: 'white-mana',
    title: 'White Mana',
    text: 'Bring mana to any corner pool to score 1 point. Can be mana moved at the end of your turn.',
    image: '/assets/mons/mana.png',
    kind: 'image',
  },
  {
    slug: 'black-mana',
    title: 'Black Mana',
    text: 'Bring enemy mana to any corner pool to score 2 points. Cannot be mana moved.',
    image: '/assets/mons/manaB.png',
    kind: 'image',
  },
  {
    slug: 'super-mana',
    title: 'Super Mana',
    text: 'Bring super mana to any corner pool to score 2 points. Returns to center tile if drainer is fainted while holding.',
    image: '/assets/mons/supermana.png',
    kind: 'image',
  },
  {
    slug: 'item-pickup',
    title: 'Item Pickup',
    text: 'Move onto an item to pick it up. You must choose between either option. You cannot choose the bomb if your mon is already holding a bomb or a mana.',
    image: '/assets/mons/bombOrPotion.png',
    kind: 'image',
  },
  {
    slug: 'bomb',
    title: 'Bomb',
    text: "Can be thrown up to 3 tiles away, fainting an enemy mon even through an Angel's protection. If a Demon attacks a mon holding a bomb, it's lost and both mons get fainted in the blast.",
    image: '/assets/mons/bomb.png',
    diagramImage: '/assets/diagrams/optimized/bomb.jpg',
    kind: 'image',
  },
  {
    slug: 'potion',
    title: 'Potion',
    text: 'Can be consumed on any future turn to grant one extra active ability on that turn.',
    image: '/assets/mons/potion.png',
    diagramImage: '/assets/diagrams/optimized/potion.jpg',
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

export const pieceDetailDiagramByTitle = pieceDetailItems.reduce<Record<string, string>>(
  (result, item) => {
    if (item.diagramImage) {
      result[item.title] = item.diagramImage;
    }
    return result;
  },
  {},
);
export const pieceDetailDiagramImages = pieceDetailItems.flatMap((item) =>
  item.diagramImage ? [item.diagramImage] : [],
);

export function getPieceDetailPathByTitle(title: string): string | null {
  return pieceDetailPathByTitle[title] ?? null;
}

export function getPieceDetailDiagramByTitle(title: string): string | null {
  return pieceDetailDiagramByTitle[title] ?? null;
}
