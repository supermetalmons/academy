import {useEffect, useMemo, useState, type CSSProperties, type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import PuzzleFavoriteStar from '@site/src/components/PuzzleFavoriteStar';
import PuzzlePiecesThumbnail from '@site/src/components/PuzzlePiecesThumbnail';
import type {SuperMetalMonsBoardPreset} from '@site/src/components/SuperMetalMonsBoard';
import {
  PUZZLE_COMPLETIONS_EVENT_NAME,
  PUZZLE_FAVORITES_EVENT_NAME,
  readPuzzleCompletionsFromStorage,
  readPuzzleFavoritesFromStorage,
  type PuzzleId,
} from '@site/src/constants/puzzleFavorites';

type PuzzleSortMode = 'alphabetical' | 'created' | 'complexity';
type PuzzleCompletionFilterMode = 'mixed' | 'uncompleted' | 'completed';
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

const puzzleGalleryNoteStyle: CSSProperties = {
  margin: '-0.1rem 0 0',
  color: '#000',
  fontSize: '0.94rem',
  lineHeight: 1.32,
  fontStyle: 'italic',
};

const puzzleGalleryIntroStyle: CSSProperties = {
  margin: 0,
  color: '#000',
  fontSize: '1rem',
  lineHeight: 1.34,
};

const puzzleGalleryTelegramLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.18rem',
  verticalAlign: 'baseline',
  transform: 'translateY(1.5px)',
};

const puzzleGalleryTelegramIconStyle: CSSProperties = {
  width: '0.9em',
  height: '0.9em',
  display: 'inline-block',
  color: '#000',
  transform: 'translateY(calc(0.08em - 2px))',
  flex: '0 0 auto',
};

const puzzleCardStyle: CSSProperties = {
  border: '1px solid #000',
  backgroundColor: '#fff',
  minHeight: '156px',
  padding: 0,
  display: 'grid',
  gridTemplateColumns: 'clamp(110px, 24%, 165px) 50px minmax(0, 1fr) 56px',
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

const puzzleCardStarRailStyle: CSSProperties = {
  gridColumn: '4',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderLeft: '1px solid #000',
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
  position: 'relative',
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

const puzzleCardCompletionBadgeWrapStyle: CSSProperties = {
  position: 'absolute',
  left: 'calc(100% + 0.48rem + 2px)',
  top: 'calc(50% - 3px)',
  width: '1.56rem',
  height: '1.56rem',
  color: '#178B35',
  pointerEvents: 'none',
  zIndex: 2,
};

const puzzleCardCompletionBadgeSvgStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  overflow: 'visible',
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

function getNextCompletionFilterMode(
  current: PuzzleCompletionFilterMode,
): PuzzleCompletionFilterMode {
  if (current === 'mixed') {
    return 'uncompleted';
  }
  if (current === 'uncompleted') {
    return 'completed';
  }
  return 'mixed';
}

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

function PuzzleGalleryCompletionBadge(): ReactNode {
  const [isEntered, setIsEntered] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsEntered(true);
    });
    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <span
      aria-hidden="true"
      style={{
        ...puzzleCardCompletionBadgeWrapStyle,
        opacity: isEntered ? 1 : 0,
        transform: isEntered
          ? 'translateY(-50%) translateX(0) scale(1)'
          : 'translateY(-50%) translateX(-4px) scale(0.58)',
        transformOrigin: 'center center',
        transition:
          'opacity 180ms ease-out, transform 500ms cubic-bezier(0.16, 1.28, 0.32, 1)',
      }}>
      <svg viewBox="0 0 24 24" style={puzzleCardCompletionBadgeSvgStyle}>
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="#fff"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="57"
          strokeDashoffset={isEntered ? 0 : 57}
          style={{
            transition: 'stroke-dashoffset 500ms cubic-bezier(0.2, 0.9, 0.25, 1)',
          }}
        />
        <path
          d="M7.5 12.4L10.5 15.4L16.8 8.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="15"
          strokeDashoffset={isEntered ? 0 : 15}
          style={{
            transition:
              'stroke-dashoffset 340ms cubic-bezier(0.2, 0.9, 0.25, 1) 210ms',
          }}
        />
      </svg>
    </span>
  );
}

export default function PuzzlesPage(): ReactNode {
  const [shouldApplyPreviewPadding, setShouldApplyPreviewPadding] = useState<boolean>(() =>
    shouldApplyWidePuzzlePreviewPadding(),
  );
  const [sortMode, setSortMode] = useState<PuzzleSortMode>(DEFAULT_PUZZLE_SORT_MODE);
  const [isSortReversed, setIsSortReversed] = useState(false);
  const [isFavoritesFilterEnabled, setIsFavoritesFilterEnabled] = useState(false);
  const [completionFilterMode, setCompletionFilterMode] =
    useState<PuzzleCompletionFilterMode>('mixed');
  const [favoritePuzzleIds, setFavoritePuzzleIds] = useState<Set<PuzzleId>>(new Set<PuzzleId>());
  const [completedPuzzleIds, setCompletedPuzzleIds] = useState<Set<PuzzleId>>(
    new Set<PuzzleId>(),
  );

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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const syncCompletions = () => {
      setCompletedPuzzleIds(readPuzzleCompletionsFromStorage());
    };
    syncCompletions();
    window.addEventListener('storage', syncCompletions);
    window.addEventListener(PUZZLE_COMPLETIONS_EVENT_NAME, syncCompletions as EventListener);
    return () => {
      window.removeEventListener('storage', syncCompletions);
      window.removeEventListener(PUZZLE_COMPLETIONS_EVENT_NAME, syncCompletions as EventListener);
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
      sortedPuzzleCards.filter((puzzle) => {
        if (isFavoritesFilterEnabled && !favoritePuzzleIds.has(puzzle.id)) {
          return false;
        }
        if (completionFilterMode === 'completed') {
          return completedPuzzleIds.has(puzzle.id);
        }
        if (completionFilterMode === 'uncompleted') {
          return !completedPuzzleIds.has(puzzle.id);
        }
        return true;
      }),
    [
      completedPuzzleIds,
      completionFilterMode,
      favoritePuzzleIds,
      isFavoritesFilterEnabled,
      sortedPuzzleCards,
    ],
  );
  const isCompletionFilterActive = completionFilterMode !== 'mixed';
  const isUncompletedFilterActive = completionFilterMode === 'uncompleted';
  const completionFilterTitle =
    completionFilterMode === 'mixed'
      ? 'Show only uncompleted puzzles'
      : completionFilterMode === 'uncompleted'
        ? 'Show only completed puzzles'
        : 'Show all puzzles';
  const completionFilterAriaLabel =
    completionFilterMode === 'mixed'
      ? 'Completion filter: showing all puzzles. Click to show only uncompleted puzzles'
      : completionFilterMode === 'uncompleted'
        ? 'Completion filter: showing only uncompleted puzzles. Click to show only completed puzzles'
        : 'Completion filter: showing only completed puzzles. Click to show all puzzles';
  const emptyStateMessage =
    completionFilterMode === 'completed'
      ? 'No completed puzzles yet.'
      : completionFilterMode === 'uncompleted'
        ? 'No uncompleted puzzles.'
        : isFavoritesFilterEnabled
          ? 'No starred puzzles yet.'
          : 'No puzzles to show.';

  return (
    <BlankSectionPage title="Puzzles">
      <section style={puzzlesWrapStyle}>
        <p style={puzzleGalleryIntroStyle}>
          <strong>Mate-in-1:</strong> in all of the following challenges, white is
          up to play and you must find a position where no matter what black does
          next, you can win on the following turn by reaching a mana score of 5+
        </p>
        <p style={puzzleGalleryNoteStyle}>
          (<strong>Note:</strong> these puzzles have not yet been rigorously tested! If you believe you&apos;ve found an
          alternate solution or error, please post it in our{' '}
          <a
            href="https://t.me/supermetalmons"
            target="_blank"
            rel="noreferrer"
            style={puzzleGalleryTelegramLinkStyle}>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              style={puzzleGalleryTelegramIconStyle}
              fill="currentColor">
              <path d="M21.4 4.6 3.7 11.5c-.8.3-.8 1.4 0 1.7l4.5 1.6 1.7 5.2c.2.7 1.1.8 1.5.3l2.7-3.3 4.8 3.5c.6.4 1.4.1 1.6-.6l2.1-14.1c.1-.8-.7-1.5-1.4-1.2Zm-2.6 2.3-8.9 7.8-.4 2.8-1.1-3.3L5 13.1l13.8-6.2Z" />
            </svg>
            <span>Telegram</span>
          </a>)
        </p>
        <div style={toolbarStyle} className="gallery-toolbar" aria-label="Puzzles sort toolbar">
          <div style={toolbarGroupStyle} className="gallery-toolbar-group gallery-toolbar-group--filter">
            <span style={toolbarLabelStyle} className="gallery-toolbar-label">Filter by:</span>
            <div style={toolbarButtonsStyle} className="gallery-toolbar-buttons">
              <button
                type="button"
                className="gallery-toolbar-button"
                aria-label="Show only favorited puzzles"
                title={isFavoritesFilterEnabled ? 'Show all puzzles' : 'Show only starred puzzles'}
                aria-pressed={isFavoritesFilterEnabled}
                onClick={() => setIsFavoritesFilterEnabled((current) => !current)}
                style={isFavoritesFilterEnabled ? filterButtonActiveStyle : filterButtonStyle}>
                <svg viewBox="0 0 24 24" aria-hidden="true" style={filterIconStyle} className="gallery-toolbar-icon">
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
                className="gallery-toolbar-button"
                aria-label={completionFilterAriaLabel}
                title={completionFilterTitle}
                aria-pressed={isCompletionFilterActive}
                onClick={() =>
                  setCompletionFilterMode((current) =>
                    getNextCompletionFilterMode(current),
                  )
                }
                style={isCompletionFilterActive ? filterButtonActiveStyle : filterButtonStyle}>
                <svg viewBox="0 0 24 24" aria-hidden="true" style={filterIconStyle} className="gallery-toolbar-icon" fill="none">
                  <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="M8.2 12.4L10.9 15L15.8 9.9"
                    stroke="currentColor"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {isUncompletedFilterActive ? (
                    <path
                      d="M18.2 5.8L5.8 18.2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  ) : null}
                </svg>
              </button>
            </div>
          </div>
          <div style={toolbarSortGroupStyle} className="gallery-toolbar-group gallery-toolbar-group--sort">
            <span style={toolbarLabelStyle} className="gallery-toolbar-label">Sort by:</span>
            <div style={toolbarButtonsStyle} className="gallery-toolbar-buttons">
            <button
              type="button"
              className="gallery-toolbar-button"
              aria-label="Sort by time created"
              title="Time Created"
              onClick={() => setSortMode('created')}
              style={sortMode === 'created' ? sortButtonActiveStyle : sortButtonStyle}>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="gallery-toolbar-icon"
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
              className="gallery-toolbar-button"
              aria-label="Sort by complexity"
              title="Complexity order"
              onClick={() => setSortMode('complexity')}
              style={sortMode === 'complexity' ? sortButtonActiveStyle : sortButtonStyle}>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="gallery-toolbar-icon"
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
              className="gallery-toolbar-button"
              aria-label="Sort by alphabetical order"
              title="Alphabetical order"
              onClick={() => setSortMode('alphabetical')}
              style={sortMode === 'alphabetical' ? sortButtonActiveStyle : sortButtonStyle}>
              <svg viewBox="0 0 24 24" aria-hidden="true" style={sortIconStyle} className="gallery-toolbar-icon" fill="none">
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
              className="gallery-toolbar-button"
              aria-label="Reverse sort order"
              title="Reverse order"
              onClick={() => setIsSortReversed((current) => !current)}
              style={isSortReversed ? reverseSortButtonActiveStyle : reverseSortButtonStyle}>
              <svg viewBox="0 0 24 24" aria-hidden="true" style={sortIconStyle} className="gallery-toolbar-icon" fill="none">
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
            <article
              key={puzzle.id}
              style={puzzleCardStyle}
              className="gallery-card puzzle-gallery-card">
              <Link
                to={puzzle.to}
                style={{
                  ...puzzleCardImageLinkStyle,
                  ...(shouldApplyPreviewPadding ? puzzleCardImageLinkWidePaddingStyle : undefined),
                }}
                className="instruction-lesson-card-link gallery-card-image-link"
                aria-label={`Open ${puzzle.title} puzzle`}>
                <span style={puzzleCardPreviewImageStyle} className="gallery-card-preview-image">
                  <PuzzlePiecesThumbnail
                    boardPreset={puzzle.boardPreset}
                    label={puzzle.previewLabel}
                  />
                </span>
              </Link>
              <span style={puzzleCardDividerColumnStyle} className="gallery-card-divider" aria-hidden="true">
                <span style={puzzleCardDividerLineStyle} />
              </span>
              <div style={puzzleCardTextColumnStyle} className="gallery-card-text-column">
                <div style={puzzleCardTitleBlockStyle}>
                  <div style={puzzleCardTitleRowStyle} className="gallery-card-title-row">
                    <Link
                      to={puzzle.to}
                      style={puzzleCardTitleLinkStyle}
                      className="instruction-lesson-card-link"
                      aria-label={`Open ${puzzle.title} puzzle`}>
                      <span
                        style={puzzleCardTitleStyle}
                        className="instruction-lesson-card-title">
                        "{puzzle.title}"
                      </span>
                    </Link>
                    <span
                      style={
                        puzzle.id === 'bombproof'
                          ? puzzleCardTitleStarOffsetBombproofStyle
                          : puzzleCardTitleStarOffsetStyle
                      }
                      className="gallery-card-title-star">
                      <PuzzleFavoriteStar puzzleId={puzzle.id} size="1.28rem" />
                    </span>
                    {completedPuzzleIds.has(puzzle.id) ? (
                      <PuzzleGalleryCompletionBadge />
                    ) : null}
                  </div>
                  <span style={puzzleCardMetaRowStyle} className="puzzle-gallery-meta-row">
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
                  <span className="puzzle-gallery-meta-star">
                    <PuzzleFavoriteStar puzzleId={puzzle.id} size="1.28rem" />
                  </span>
                </div>
              </div>
              <div style={puzzleCardStarRailStyle} className="gallery-card-star-rail">
                <PuzzleFavoriteStar puzzleId={puzzle.id} size="1.28rem" />
              </div>
            </article>
          ))}
          {visiblePuzzleCards.length === 0 ? (
            <p style={puzzlesEmptyStateStyle}>{emptyStateMessage}</p>
          ) : null}
        </section>
      </section>
    </BlankSectionPage>
  );
}
