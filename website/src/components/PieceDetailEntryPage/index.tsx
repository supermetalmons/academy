import type {CSSProperties, ReactNode} from 'react';
import Link from '@docusaurus/Link';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import InstructionSubnav from '@site/src/components/InstructionSubnav';
import {
  pieceDetailBySlug,
  pieceDetailItems,
  type PieceDetailItem,
  type PieceDetailMonEntry,
} from '@site/src/data/pieceDetails';

type PieceDetailEntryPageProps = {
  slug: string;
};

const contentStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const navRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
  flexWrap: 'wrap',
};

const navLinkStyle: CSSProperties = {
  color: '#0000EE',
  textDecoration: 'underline',
  fontSize: '0.95rem',
  lineHeight: 1.2,
  fontWeight: 700,
};

const bottomNavRowStyle: CSSProperties = {
  width: 'min(100%, 760px)',
  marginTop: '1rem',
  marginBottom: '15px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
};

const bottomNavLinkContentStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.42rem',
};

const bottomNavArrowStyle: CSSProperties = {
  lineHeight: 1,
};

const bottomNavIconStyle: CSSProperties = {
  width: '16px',
  height: '16px',
  objectFit: 'contain',
  display: 'block',
  imageRendering: 'auto',
};

const bottomNavManaPoolIconStyle: CSSProperties = {
  width: '16px',
  height: '16px',
  display: 'block',
};

const detailContentStyle: CSSProperties = {
  marginTop: '15px',
  padding: '0.2rem 0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: '0.55rem',
};

const imageSlotStyle: CSSProperties = {
  width: '130px',
  height: '130px',
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
  fontSize: '1.35rem',
  lineHeight: 1.1,
  fontWeight: 900,
  textDecoration: 'underline',
};

const textStyle: CSSProperties = {
  margin: '15px 0 0',
  fontSize: '1rem',
  lineHeight: 1.4,
  maxWidth: '700px',
};

const diagramFrameStyle: CSSProperties = {
  width: 'min(100%, 430px)',
  aspectRatio: '1 / 1',
  marginTop: '0.4rem',
  border: '1px solid #000',
  borderRadius: '8px',
  backgroundColor: '#d6d6d6',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const diagramStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  display: 'block',
  imageRendering: 'auto',
};

const missingStyle: CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  lineHeight: 1.4,
  color: '#000',
};

const monGridStyle: CSSProperties = {
  width: 'min(100%, 760px)',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '0.7rem',
};

const monDividerStyle: CSSProperties = {
  width: 'min(100%, 760px)',
  borderTop: '1px solid #000',
  margin: '15px 0',
};

const monCardStyle: CSSProperties = {
  border: '1px solid #000',
  borderRadius: '8px',
  padding: '0.55rem',
  backgroundColor: '#fff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: '212px',
  height: '100%',
};

const monImageWrapStyle: CSSProperties = {
  width: '100%',
  aspectRatio: '1 / 1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const monImageStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  imageRendering: 'auto',
  filter: 'brightness(1.06) contrast(1.06)',
};

function getMonImageStyle(entry: PieceDetailMonEntry): CSSProperties {
  if (
    entry.imageScale === undefined ||
    Math.abs(entry.imageScale - 1) < 0.001
  ) {
    return monImageStyle;
  }
  return {
    ...monImageStyle,
    transform: `scale(${entry.imageScale})`,
    transformOrigin: 'center top',
  };
}

const monNameStyle: CSSProperties = {
  margin: 'auto 0 0',
  fontSize: '0.92rem',
  lineHeight: 1.2,
  textAlign: 'center',
  fontWeight: 700,
  width: '100%',
};

function getMonNameStyle(entry: PieceDetailMonEntry): CSSProperties {
  if (entry.nameTopPaddingPx === undefined || entry.nameTopPaddingPx <= 0) {
    return monNameStyle;
  }
  return {
    ...monNameStyle,
    paddingTop: `${entry.nameTopPaddingPx}px`,
  };
}

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

function renderBottomNavIcon(item: PieceDetailItem): ReactNode {
  if (item.kind === 'manaPool') {
    return (
      <svg viewBox="0 0 1 1" style={bottomNavManaPoolIconStyle}>
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
  if (item.image) {
    return <img src={item.image} alt="" aria-hidden="true" style={bottomNavIconStyle} />;
  }
  return null;
}

export default function PieceDetailEntryPage({
  slug,
}: PieceDetailEntryPageProps): ReactNode {
  const detail = pieceDetailBySlug[slug];
  const detailIndex = detail
    ? pieceDetailItems.findIndex((item) => item.slug === detail.slug)
    : -1;
  const hasNeighborNav = detailIndex !== -1 && pieceDetailItems.length > 1;
  const previousDetail =
    hasNeighborNav
      ? pieceDetailItems[
          (detailIndex - 1 + pieceDetailItems.length) % pieceDetailItems.length
        ]
      : null;
  const nextDetail =
    hasNeighborNav
      ? pieceDetailItems[(detailIndex + 1) % pieceDetailItems.length]
      : null;

  return (
    <BlankSectionPage title="Instruction">
      <div style={contentStyle}>
        <InstructionSubnav active="basic-rules" />
        <div style={navRowStyle}>
          <Link to="/piece-details" className="mons-box-button" style={navLinkStyle}>
            ← back to piece details
          </Link>
          <Link to="/instruction" className="mons-box-button" style={navLinkStyle}>
            ↑ back to board
          </Link>
        </div>
        {detail ? (
          <article style={detailContentStyle}>
            <div style={imageSlotStyle}>
              {detail.kind === 'manaPool' ? (
                <ManaPoolPreview />
              ) : (
                <img src={detail.image} alt={`${detail.title} icon`} style={imageStyle} />
              )}
            </div>
            <h2 style={titleStyle}>{detail.title}</h2>
            <p style={textStyle}>{detail.text}</p>
            {detail.diagramImage ? (
              <div style={diagramFrameStyle}>
                <img
                  src={detail.diagramImage}
                  alt={`${detail.title} diagram`}
                  decoding="async"
                  style={diagramStyle}
                />
              </div>
            ) : null}
            {detail.monEntries && detail.monEntries.length > 0 ? (
              <>
                <div aria-hidden="true" style={monDividerStyle} />
                <section style={monGridStyle} aria-label={`${detail.title} ceramic mons`}>
                  {detail.monEntries.map((entry) => (
                    <article key={entry.image} style={monCardStyle}>
                      <div style={monImageWrapStyle}>
                        <img src={entry.image} alt={entry.name} style={getMonImageStyle(entry)} />
                      </div>
                      <p style={getMonNameStyle(entry)}>{entry.name}</p>
                    </article>
                  ))}
                </section>
              </>
            ) : null}
            {previousDetail && nextDetail ? (
              <div style={bottomNavRowStyle}>
                <Link
                  to={`/piece-details/${previousDetail.slug}`}
                  className="mons-box-button"
                  style={navLinkStyle}>
                  <span style={bottomNavLinkContentStyle}>
                    <span aria-hidden="true" style={bottomNavArrowStyle}>←</span>
                    {renderBottomNavIcon(previousDetail)}
                    <span>{previousDetail.title}</span>
                  </span>
                </Link>
                <Link
                  to={`/piece-details/${nextDetail.slug}`}
                  className="mons-box-button"
                  style={navLinkStyle}>
                  <span style={bottomNavLinkContentStyle}>
                    {renderBottomNavIcon(nextDetail)}
                    <span>{nextDetail.title}</span>
                    <span aria-hidden="true" style={bottomNavArrowStyle}>→</span>
                  </span>
                </Link>
              </div>
            ) : null}
          </article>
        ) : (
          <p style={missingStyle}>Piece detail not found.</p>
        )}
      </div>
    </BlankSectionPage>
  );
}
