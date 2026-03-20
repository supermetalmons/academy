import {useEffect, useMemo, useState, type CSSProperties, type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import PuzzleFavoriteStar from '@site/src/components/PuzzleFavoriteStar';
import PuzzlePiecesThumbnail from '@site/src/components/PuzzlePiecesThumbnail';
import type {SuperMetalMonsBoardPreset} from '@site/src/components/SuperMetalMonsBoard';
import {
  PUZZLE_FAVORITES_EVENT_NAME,
  readPuzzleFavoritesFromStorage,
  type PuzzleId,
} from '@site/src/constants/puzzleFavorites';

type PuzzleSortMode = 'alphabetical' | 'created' | 'complexity';
type PuzzleCard = {
  id: PuzzleId;
  title: string;
  to: string;
  createdOrder: number;
  complexity: number;
  boardPreset: SuperMetalMonsBoardPreset;
  previewLabel: string;
  startingScoreWhite: number;
  startingScoreBlack: number;
  startingWhitePotions: number;
};

const puzzlesWrapStyle: CSSProperties = {
  width: 'min(100%, 680px)',
  margin: '0 auto',
  paddingTop: '15px',
  paddingBottom: '15px',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.85rem',
};

const toolbarStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '0.7rem',
  border: '1px solid #000',
  backgroundColor: '#fff',
  padding: '0.5rem 0.6rem',
};

const toolbarGroupStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.55rem',
};

const toolbarSortGroupStyle: CSSProperties = {
  ...toolbarGroupStyle,
  marginLeft: 'auto',
};

const toolbarLabelStyle: CSSProperties = {
  fontSize: '1rem',
  lineHeight: 1.1,
  color: '#000',
  fontWeight: 600,
};

const toolbarButtonsStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
};

const filterButtonStyle: CSSProperties = {
  width: '30px',
  height: '30px',
  border: '1px solid #000',
  backgroundColor: '#fff',
  color: '#000',
  padding: 0,
  margin: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'transform 140ms ease, filter 140ms ease',
};

const filterButtonActiveStyle: CSSProperties = {
  ...filterButtonStyle,
  backgroundColor: '#000',
  color: '#fff',
};

const filterButtonDisabledStyle: CSSProperties = {
  ...filterButtonStyle,
  cursor: 'not-allowed',
  opacity: 0.45,
};

const sortButtonStyle: CSSProperties = {
  width: '34px',
  height: '34px',
  border: '1px solid #000',
  backgroundColor: '#fff',
  color: '#000',
  padding: 0,
  margin: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'transform 140ms ease, filter 140ms ease',
};

const sortButtonActiveStyle: CSSProperties = {
  ...sortButtonStyle,
  backgroundColor: '#000',
  color: '#fff',
};

const reverseSortButtonStyle: CSSProperties = {
  ...sortButtonStyle,
  width: '30px',
  height: '30px',
  borderRadius: '999px',
  borderWidth: '1px',
};

const reverseSortButtonActiveStyle: CSSProperties = {
  ...reverseSortButtonStyle,
  backgroundColor: '#fff',
  color: '#000',
  borderWidth: '2px',
};

const sortIconStyle: CSSProperties = {
  width: '18px',
  height: '18px',
  display: 'block',
};

const filterIconStyle: CSSProperties = {
  ...sortIconStyle,
  width: '17px',
  height: '17px',
};

const puzzlesGalleryStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '1rem',
};

const puzzleCardStyle: CSSProperties = {
  border: '1px solid #000',
  backgroundColor: '#fff',
  minHeight: '156px',
  padding: 0,
  display: 'grid',
  gridTemplateColumns: 'clamp(110px, 24%, 165px) 50px minmax(0, 1fr)',
  alignItems: 'stretch',
  color: '#000',
  overflow: 'hidden',
};

const puzzleCardLinkStyle: CSSProperties = {
  color: 'inherit',
  textDecoration: 'none',
  display: 'block',
};

const puzzleCardPreviewImageStyle: CSSProperties = {
  width: '92%',
  height: '92%',
  display: 'block',
  imageRendering: 'pixelated',
};

const puzzleCardTitleStyle: CSSProperties = {
  textAlign: 'center',
  lineHeight: 1.2,
  fontSize: '1.34rem',
  fontWeight: 700,
};

const puzzleCardTextColumnStyle: CSSProperties = {
  gridColumn: '3',
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.95rem 1rem',
};

const puzzleCardImageLinkStyle: CSSProperties = {
  ...puzzleCardLinkStyle,
  gridColumn: '1',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const puzzleCardImageLinkWidePaddingStyle: CSSProperties = {
  paddingTop: '15px',
  paddingBottom: '15px',
  boxSizing: 'border-box',
};

const puzzleCardDividerColumnStyle: CSSProperties = {
  gridColumn: '2',
  display: 'flex',
  alignItems: 'stretch',
  justifyContent: 'center',
  pointerEvents: 'none',
};

const puzzleCardDividerLineStyle: CSSProperties = {
  width: '6px',
  marginTop: '10px',
  marginBottom: '10px',
  backgroundImage:
    'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%276%27 height=%2710%27 viewBox=%270 0 6 10%27%3E%3Crect x=%271.7%27 y=%273.7%27 width=%272.6%27 height=%272.6%27 transform=%27rotate(45 3 5)%27 fill=%27%23000%27/%3E%3C/svg%3E")',
  backgroundRepeat: 'repeat-y',
  backgroundPosition: 'center top',
  backgroundSize: '6px 10px',
  transform: 'translateX(35px)',
};

const puzzleCardTitleLinkStyle: CSSProperties = {
  ...puzzleCardLinkStyle,
  display: 'inline-flex',
  alignItems: 'center',
};

const puzzleCardTitleRowStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.45rem',
  maxWidth: '100%',
};

const puzzleCardTitleBlockStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.22rem',
};

const puzzleCardMetaRowStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.82rem',
  fontSize: '0.82rem',
  lineHeight: 1,
  fontWeight: 600,
  opacity: 0.7,
  transform: 'translateY(2px)',
};

const puzzleCardPotionIconsStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  minHeight: '14px',
  transform: 'translateY(-1px)',
};

const puzzleCardPotionIconStyle: CSSProperties = {
  width: '14px',
  height: '14px',
  display: 'block',
  imageRendering: 'auto',
  objectFit: 'contain',
};

const puzzleCardTitleStarOffsetStyle: CSSProperties = {
  display: 'inline-flex',
  transform: 'translate(10px, -2px)',
};

const puzzleCardTitleStarOffsetBombproofStyle: CSSProperties = {
  ...puzzleCardTitleStarOffsetStyle,
  transform: 'translate(10px, -3px)',
};

const puzzlesEmptyStateStyle: CSSProperties = {
  margin: '0.35rem 0 0',
  textAlign: 'center',
  fontStyle: 'italic',
  opacity: 0.72,
};

const puzzleCards: PuzzleCard[] = [
  {
    id: 'restraint',
    title: 'Restraint',
    to: '/puzzles/1',
    createdOrder: 1,
    complexity: 1,
    boardPreset: 'puzzle1',
    previewLabel: 'Restraint start pieces preview',
    startingScoreWhite: 3,
    startingScoreBlack: 4,
    startingWhitePotions: 1,
  },
  {
    id: 'cage-match',
    title: 'Cage Match',
    to: '/puzzles/2',
    createdOrder: 2,
    complexity: 2,
    boardPreset: 'puzzle2',
    previewLabel: 'Cage Match start pieces preview',
    startingScoreWhite: 3,
    startingScoreBlack: 3,
    startingWhitePotions: 2,
  },
  {
    id: 'bombproof',
    title: 'Bombproof',
    to: '/puzzles/3',
    createdOrder: 3,
    complexity: 3,
    boardPreset: 'puzzle3',
    previewLabel: 'Bombproof start pieces preview',
    startingScoreWhite: 2,
    startingScoreBlack: 2,
    startingWhitePotions: 1,
  },
  {
    id: 'split-formation',
    title: 'Split Formation',
    to: '/puzzles/4',
    createdOrder: 4,
    complexity: 4,
    boardPreset: 'puzzle4',
    previewLabel: 'Split Formation start pieces preview',
    startingScoreWhite: 3,
    startingScoreBlack: 3,
    startingWhitePotions: 1,
  },
];

const DEFAULT_PUZZLE_SORT_MODE: PuzzleSortMode = 'created';

function shouldApplyWidePuzzlePreviewPadding(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const primaryNav = window.document.querySelector('nav[aria-label="Primary navigation"]');
  if (!(primaryNav instanceof HTMLElement)) {
    return window.innerWidth >= 900;
  }
  const navItems = Array.from(primaryNav.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement,
  );
  if (navItems.length === 0) {
    return window.innerWidth >= 900;
  }
  const navRowCount = new Set(navItems.map((item) => item.offsetTop)).size;
  return navRowCount < 3;
}

export default function PuzzlesPage(): ReactNode {
  const [shouldApplyPreviewPadding, setShouldApplyPreviewPadding] = useState<boolean>(() =>
    shouldApplyWidePuzzlePreviewPadding(),
  );
  const [sortMode, setSortMode] = useState<PuzzleSortMode>(DEFAULT_PUZZLE_SORT_MODE);
  const [isSortReversed, setIsSortReversed] = useState(false);
  const [isFavoritesFilterEnabled, setIsFavoritesFilterEnabled] = useState(false);
  const [favoritePuzzleIds, setFavoritePuzzleIds] = useState<Set<PuzzleId>>(new Set<PuzzleId>());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    let rafA = 0;
    let rafB = 0;
    const syncPaddingMode = () => {
      const nextValue = shouldApplyWidePuzzlePreviewPadding();
      setShouldApplyPreviewPadding((current) => (current === nextValue ? current : nextValue));
    };
    const syncPaddingModeOnNextFrames = () => {
      if (rafA !== 0) {
        window.cancelAnimationFrame(rafA);
      }
      if (rafB !== 0) {
        window.cancelAnimationFrame(rafB);
      }
      rafA = window.requestAnimationFrame(() => {
        rafB = window.requestAnimationFrame(() => {
          syncPaddingMode();
        });
      });
    };
    syncPaddingModeOnNextFrames();
    window.addEventListener('resize', syncPaddingModeOnNextFrames);
    return () => {
      window.removeEventListener('resize', syncPaddingModeOnNextFrames);
      if (rafA !== 0) {
        window.cancelAnimationFrame(rafA);
      }
      if (rafB !== 0) {
        window.cancelAnimationFrame(rafB);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const syncFavorites = () => {
      setFavoritePuzzleIds(readPuzzleFavoritesFromStorage());
    };
    syncFavorites();
    window.addEventListener('storage', syncFavorites);
    window.addEventListener(PUZZLE_FAVORITES_EVENT_NAME, syncFavorites as EventListener);
    return () => {
      window.removeEventListener('storage', syncFavorites);
      window.removeEventListener(PUZZLE_FAVORITES_EVENT_NAME, syncFavorites as EventListener);
    };
  }, []);

  const sortedPuzzleCards = useMemo(() => {
    const next = [...puzzleCards];
    if (sortMode === 'alphabetical') {
      next.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortMode === 'complexity') {
      next.sort((a, b) => a.complexity - b.complexity);
    } else {
      next.sort((a, b) => a.createdOrder - b.createdOrder);
    }
    if (isSortReversed) {
      next.reverse();
    }
    return next;
  }, [sortMode, isSortReversed]);

  const visiblePuzzleCards = useMemo(
    () =>
      sortedPuzzleCards.filter((puzzle) =>
        isFavoritesFilterEnabled ? favoritePuzzleIds.has(puzzle.id) : true,
      ),
    [favoritePuzzleIds, isFavoritesFilterEnabled, sortedPuzzleCards],
  );

  return (
    <BlankSectionPage title="Puzzles">
      <section style={puzzlesWrapStyle}>
        <div style={toolbarStyle} aria-label="Puzzles sort toolbar">
          <div style={toolbarGroupStyle}>
            <span style={toolbarLabelStyle}>Filter by:</span>
            <div style={toolbarButtonsStyle}>
              <button
                type="button"
                aria-label="Show only favorited puzzles"
                title={isFavoritesFilterEnabled ? 'Show all puzzles' : 'Show only starred puzzles'}
                aria-pressed={isFavoritesFilterEnabled}
                onClick={() => setIsFavoritesFilterEnabled((current) => !current)}
                style={isFavoritesFilterEnabled ? filterButtonActiveStyle : filterButtonStyle}>
                <svg viewBox="0 0 24 24" aria-hidden="true" style={filterIconStyle}>
                  <path
                    d="M12 2.6L14.9 8.4L21.2 9.3L16.6 13.7L17.7 20L12 17L6.3 20L7.4 13.7L2.8 9.3L9.1 8.4L12 2.6Z"
                    fill={isFavoritesFilterEnabled ? 'currentColor' : 'transparent'}
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Show only completed puzzles (coming soon)"
                aria-disabled="true"
                title="Completed filter coming soon"
                style={filterButtonDisabledStyle}>
                <svg viewBox="0 0 24 24" aria-hidden="true" style={filterIconStyle} fill="none">
                  <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="M8.2 12.4L10.9 15L15.8 9.9"
                    stroke="currentColor"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div style={toolbarSortGroupStyle}>
            <span style={toolbarLabelStyle}>Sort by:</span>
            <div style={toolbarButtonsStyle}>
            <button
              type="button"
              aria-label="Sort by time created"
              title="Time Created"
              onClick={() => setSortMode('created')}
              style={sortMode === 'created' ? sortButtonActiveStyle : sortButtonStyle}>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                style={{
                  ...sortIconStyle,
                  transform: isSortReversed ? 'scaleX(-1)' : undefined,
                }}
                fill="none">
                <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M12 7.2V12L15.4 14.1"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Sort by complexity"
              title="Complexity order"
              onClick={() => setSortMode('complexity')}
              style={sortMode === 'complexity' ? sortButtonActiveStyle : sortButtonStyle}>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                style={{
                  ...sortIconStyle,
                  transform: isSortReversed ? 'scaleX(-1)' : undefined,
                }}
                fill="none">
                <rect x="3" y="13.5" width="4" height="7.5" fill="currentColor" />
                <rect x="10" y="9.5" width="4" height="11.5" fill="currentColor" />
                <rect x="17" y="5.5" width="4" height="15.5" fill="currentColor" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Sort by alphabetical order"
              title="Alphabetical order"
              onClick={() => setSortMode('alphabetical')}
              style={sortMode === 'alphabetical' ? sortButtonActiveStyle : sortButtonStyle}>
              <svg viewBox="0 0 24 24" aria-hidden="true" style={sortIconStyle} fill="none">
                <text
                  x="13"
                  y="18.2"
                  textAnchor="middle"
                  fontSize="22"
                  fontStyle="italic"
                  fontWeight="700"
                  fill="currentColor"
                  fontFamily="serif">
                  {isSortReversed ? 'Z' : 'A'}
                </text>
              </svg>
            </button>
            <button
              type="button"
              aria-label="Reverse sort order"
              title="Reverse order"
              onClick={() => setIsSortReversed((current) => !current)}
              style={isSortReversed ? reverseSortButtonActiveStyle : reverseSortButtonStyle}>
              <svg viewBox="0 0 24 24" aria-hidden="true" style={sortIconStyle} fill="none">
                <path
                  d={
                    isSortReversed
                      ? 'M12 18V6M12 6L8.8 9.2M12 6L15.2 9.2'
                      : 'M12 6V18M12 18L8.8 14.8M12 18L15.2 14.8'
                  }
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            </div>
          </div>
        </div>
        <section style={puzzlesGalleryStyle} aria-label="Puzzles gallery">
          {visiblePuzzleCards.map((puzzle) => (
            <article key={puzzle.id} style={puzzleCardStyle}>
              <Link
                to={puzzle.to}
                style={{
                  ...puzzleCardImageLinkStyle,
                  ...(shouldApplyPreviewPadding ? puzzleCardImageLinkWidePaddingStyle : undefined),
                }}
                className="instruction-lesson-card-link"
                aria-label={`Open ${puzzle.title} puzzle`}>
                <span style={puzzleCardPreviewImageStyle}>
                  <PuzzlePiecesThumbnail
                    boardPreset={puzzle.boardPreset}
                    label={puzzle.previewLabel}
                  />
                </span>
              </Link>
              <span style={puzzleCardDividerColumnStyle} aria-hidden="true">
                <span style={puzzleCardDividerLineStyle} />
              </span>
              <div style={puzzleCardTextColumnStyle}>
                <div style={puzzleCardTitleBlockStyle}>
                  <div style={puzzleCardTitleRowStyle}>
                    <Link
                      to={puzzle.to}
                      style={puzzleCardTitleLinkStyle}
                      className="instruction-lesson-card-link"
                      aria-label={`Open ${puzzle.title} puzzle`}>
                      <span
                        style={puzzleCardTitleStyle}
                        className="instruction-lesson-card-title">
                        {puzzle.title}
                      </span>
                    </Link>
                    <span
                      style={
                        puzzle.id === 'bombproof'
                          ? puzzleCardTitleStarOffsetBombproofStyle
                          : puzzleCardTitleStarOffsetStyle
                      }>
                      <PuzzleFavoriteStar puzzleId={puzzle.id} size="1.28rem" />
                    </span>
                  </div>
                  <span style={puzzleCardMetaRowStyle}>
                    <span>{`${puzzle.startingScoreWhite} - ${puzzle.startingScoreBlack}`}</span>
                    <span
                      style={puzzleCardPotionIconsStyle}
                      aria-label={`${puzzle.startingWhitePotions} white potion${puzzle.startingWhitePotions === 1 ? '' : 's'}`}>
                      {Array.from({length: puzzle.startingWhitePotions}).map((_, potionIndex) => (
                        <img
                          key={`${puzzle.id}-potion-${potionIndex}`}
                          src="/assets/mons/potion.png"
                          alt=""
                          aria-hidden="true"
                          style={puzzleCardPotionIconStyle}
                        />
                      ))}
                    </span>
                  </span>
                </div>
              </div>
            </article>
          ))}
          {visiblePuzzleCards.length === 0 ? (
            <p style={puzzlesEmptyStateStyle}>No starred puzzles yet.</p>
          ) : null}
        </section>
      </section>
    </BlankSectionPage>
  );
}
