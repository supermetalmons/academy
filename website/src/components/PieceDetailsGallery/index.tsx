import type {CSSProperties, ReactNode} from 'react';

type GalleryItem = {
  title: string;
  text: string;
  image?: string;
  kind?: 'manaPool';
};

const galleryItems: GalleryItem[] = [
  {
    title: 'Drainer',
    text: 'Can move onto mana and carry mana.',
    image: '/assets/mons/drainer.png',
  },
  {
    title: 'Spirit',
    text: 'Can target any piece exactly two tiles away and push it one tile in any direction.',
    image: '/assets/mons/spirit.png',
  },
  {
    title: 'Mystic',
    text: 'Attacks two tiles away diagonally. Can target through/over other pieces.',
    image: '/assets/mons/mystic.png',
  },
  {
    title: 'Demon',
    text: 'Attacks two tiles away orthoganally. Moves to target location and cannot target through other pieces.',
    image: '/assets/mons/demon.png',
  },
  {
    title: 'Angel',
    text: 'Protects adjacent friendly mons from incoming demon or mystic attacks.',
    image: '/assets/mons/angel.png',
  },
  {
    title: 'White Mana',
    text: 'Bring mana to a corner pool to score 1 point. Can be mana moved at the end of your turn.',
    image: '/assets/mons/mana.png',
  },
  {
    title: 'Black Mana',
    text: 'Bring enemy mana to a corner pool to score 2 points. Cannot be mana moved.',
    image: '/assets/mons/manaB.png',
  },
  {
    title: 'Super Mana',
    text: 'Bring super mana to a corner pool to score 2 points. Returns to center tile if drainer is fainted while holding.',
    image: '/assets/mons/supermana.png',
  },
  {
    title: 'Item Pickup',
    text: 'Move onto an item to pick it up. You must choose between either option.',
    image: '/assets/mons/bombOrPotion.png',
  },
  {
    title: 'Movement Points',
    text: 'Each turn you have 5 movement points you can use on any mon.',
    image: '/assets/mons/resources/statusMove.webp',
  },
  {
    title: 'Active Abilities',
    text: 'Each turn you have one active ability point you can use on your spirit, demon, or mystic.',
    image: '/assets/mons/resources/statusAction.webp',
  },
  {
    title: 'Mana Moves',
    text: 'Each turn you have one mana move. Select one of your own mana and move it one tiles in any direction. This ends your turn.',
    image: '/assets/mons/resources/statusMana.webp',
  },
  {
    title: 'Mana Pool',
    text: 'Bring mana here to score points. 5 wins the game!',
    kind: 'manaPool',
  },
];

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '0.9rem',
};

const boxStyle: CSSProperties = {
  border: '1px solid #000',
  borderRadius: '10px',
  backgroundColor: '#fff',
  padding: '0.7rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: '0.45rem',
};

const imageSlotStyle: CSSProperties = {
  width: '88px',
  height: '88px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const imageStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  imageRendering: 'pixelated',
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  lineHeight: 1.1,
  fontWeight: 900,
  textDecoration: 'underline',
};

const textStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.9rem',
  lineHeight: 1.25,
};

const manaPoolPreviewStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'block',
  imageRendering: 'pixelated',
};

function ManaPoolPreview(): ReactNode {
  return (
    <svg viewBox="0 0 1 1" style={manaPoolPreviewStyle} shapeRendering="crispEdges">
      <rect x={0} y={0} width={1} height={1} fill="#030DF4" />
      <g opacity={0.5}>
        <rect x={0.13} y={0.2} width={0.45} height={0.03} fill="#6666FF" />
        <rect x={0.4} y={0.33} width={0.48} height={0.03} fill="#00FCFF" />
        <rect x={0.08} y={0.47} width={0.4} height={0.03} fill="#6666FF" />
        <rect x={0.34} y={0.62} width={0.42} height={0.03} fill="#00FCFF" />
        <rect x={0.15} y={0.77} width={0.5} height={0.03} fill="#6666FF" />
      </g>
    </svg>
  );
}

export default function PieceDetailsGallery(): ReactNode {
  return (
    <section style={gridStyle}>
      {galleryItems.map((item) => (
        <article key={item.title} style={boxStyle}>
          <div style={imageSlotStyle}>
            {item.kind === 'manaPool' ? (
              <ManaPoolPreview />
            ) : (
              <img src={item.image} alt={`${item.title} icon`} style={imageStyle} />
            )}
          </div>
          <h3 style={titleStyle}>{item.title}</h3>
          <p style={textStyle}>{item.text}</p>
        </article>
      ))}
    </section>
  );
}
