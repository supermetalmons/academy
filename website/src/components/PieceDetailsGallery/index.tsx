import type {CSSProperties, ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {pieceDetailItems} from '@site/src/data/pieceDetails';

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

const cardLinkStyle: CSSProperties = {
  display: 'block',
  textDecoration: 'none',
  color: 'inherit',
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
      {pieceDetailItems.map((item) => (
        <Link
          key={item.slug}
          to={`/piece-details/${item.slug}`}
          style={cardLinkStyle}
          className="piece-details-gallery-card-link">
          <article style={boxStyle} className="piece-details-gallery-card">
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
        </Link>
      ))}
    </section>
  );
}
