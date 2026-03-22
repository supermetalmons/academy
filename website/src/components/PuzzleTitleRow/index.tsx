import Link from '@docusaurus/Link';
import PuzzleFavoriteStar from '@site/src/components/PuzzleFavoriteStar';
import {type PuzzleId} from '@site/src/constants/puzzleFavorites';
import {useEffect, useState, type CSSProperties, type ReactNode} from 'react';

type PuzzleTitleRowProps = {
  puzzleId: PuzzleId;
  title: string;
  backTo?: string;
  isSubmitEnabled?: boolean;
  scale?: number;
  boardWidthPx?: number;
};

const titleRowStyle: CSSProperties = {
  margin: '0 0 12px',
  position: 'relative',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  minHeight: '2.15rem',
  zIndex: 40,
  isolation: 'isolate',
};

const titleStyle: CSSProperties = {
  margin: 0,
  textAlign: 'center',
  lineHeight: 1.2,
};

const titleWithStarRowStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '13px',
};

const titleCenterWrapStyle: CSSProperties = {
  display: 'inline-block',
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 50,
};

const titleActionStarWrapStyle: CSSProperties = {
  display: 'inline-flex',
  transform: 'translateY(0px)',
  position: 'relative',
  zIndex: 81,
};

const backButtonScaleWrapStyle: CSSProperties = {
  display: 'inline-flex',
  transformOrigin: 'left center',
};

const backButtonGhostScaleWrapStyle: CSSProperties = {
  ...backButtonScaleWrapStyle,
  transformOrigin: 'right center',
};

const backButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '1.72rem',
  border: '1px solid #000',
  backgroundColor: '#fff',
  color: '#000',
  textDecoration: 'none',
  lineHeight: 1,
  fontSize: '0.92rem',
  padding: '0 0.5rem',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
};

const submitSolutionButtonStyle: CSSProperties = {
  ...backButtonStyle,
  position: 'relative',
  zIndex: 81,
};
const MIN_PUZZLE_ACTION_BUTTON_SCALE = 0.56;
const MIN_PUZZLE_THIN_ACTION_BUTTON_SCALE = 0.64;
const MIN_PUZZLE_THIN_TITLE_SCALE = 0.56;
const PUZZLE_THIN_ACTION_LAYOUT_MAX_WIDTH_PX = 780;

export default function PuzzleTitleRow({
  puzzleId,
  title,
  backTo = '/puzzles',
  isSubmitEnabled = true,
  scale = 1,
  boardWidthPx,
}: PuzzleTitleRowProps): ReactNode {
  const [isThinActionLayout, setIsThinActionLayout] = useState(false);
  const clampedScale = Math.max(0.22, Math.min(1, scale));
  const actionButtonScale = Math.max(
    MIN_PUZZLE_ACTION_BUTTON_SCALE,
    clampedScale,
  );
  const thinActionButtonScale = Math.max(
    MIN_PUZZLE_THIN_ACTION_BUTTON_SCALE,
    actionButtonScale,
  );
  const thinTitleScale = Math.max(MIN_PUZZLE_THIN_TITLE_SCALE, clampedScale);
  const resolvedBoardWidthPx =
    boardWidthPx !== undefined
      ? Math.max(80, Math.round(boardWidthPx))
      : undefined;
  const computedTitleRowStyle: CSSProperties = {
    ...titleRowStyle,
    margin: `0 auto ${Math.max(4, Math.round(12 * clampedScale))}px`,
    minHeight: `${Math.max(20, 2.15 * 16 * clampedScale)}px`,
    width: resolvedBoardWidthPx !== undefined ? `${resolvedBoardWidthPx}px` : undefined,
    maxWidth: '100%',
  };
  const computedTitleCenterWrapStyle: CSSProperties = {
    ...titleCenterWrapStyle,
    transform: `translate(-50%, -50%) scale(${clampedScale})`,
    transformOrigin: 'center center',
  };
  const computedBackButtonScaleWrapStyle: CSSProperties = {
    ...backButtonScaleWrapStyle,
    transform: `scale(${actionButtonScale})`,
  };
  const computedBackButtonGhostScaleWrapStyle: CSSProperties = {
    ...backButtonGhostScaleWrapStyle,
    transform: `scale(${actionButtonScale})`,
  };
  const sideButtonInsetPx = Math.max(0, Math.round(6 * actionButtonScale));

  const [isSubmitComingSoon, setIsSubmitComingSoon] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const mediaQuery = window.matchMedia(
      `(max-width: ${PUZZLE_THIN_ACTION_LAYOUT_MAX_WIDTH_PX}px)`,
    );
    const updateMode = () => {
      setIsThinActionLayout(mediaQuery.matches);
    };
    updateMode();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateMode);
      return () => {
        mediaQuery.removeEventListener('change', updateMode);
      };
    }
    mediaQuery.addListener(updateMode);
    return () => {
      mediaQuery.removeListener(updateMode);
    };
  }, []);

  useEffect(() => {
    if (!isSubmitEnabled) {
      setIsSubmitComingSoon(false);
    }
  }, [isSubmitEnabled]);

  if (isThinActionLayout) {
    const thinSideButtonInsetPx = Math.max(
      sideButtonInsetPx,
      Math.round(8 * thinActionButtonScale),
    );
    const computedThinBackButtonScaleWrapStyle: CSSProperties = {
      ...backButtonScaleWrapStyle,
      transform: `scale(${thinActionButtonScale})`,
    };
    const computedThinSubmitScaleWrapStyle: CSSProperties = {
      ...backButtonGhostScaleWrapStyle,
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: `translate(-50%, -50%) scale(${thinActionButtonScale})`,
      transformOrigin: 'center center',
    };
    const thinTitleRowStyle: CSSProperties = {
      ...computedTitleRowStyle,
      minHeight: undefined,
      display: 'grid',
      gridTemplateColumns: '1fr',
      justifyItems: 'stretch',
      alignItems: 'stretch',
      rowGap: `${Math.max(3, Math.round(6 * clampedScale))}px`,
    };
    const thinTopRowStyle: CSSProperties = {
      width: '100%',
      minHeight: `${Math.max(
        24,
        Math.round(2.15 * 16 * Math.max(thinActionButtonScale, thinTitleScale)),
      )}px`,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingLeft: `${thinSideButtonInsetPx}px`,
      boxSizing: 'border-box',
    };
    const thinTitleCenterWrapStyle: CSSProperties = {
      ...titleCenterWrapStyle,
      top: '50%',
      transform: `translate(-50%, -50%) scale(${thinTitleScale})`,
      transformOrigin: 'center center',
      zIndex: 50,
    };
    const thinSubmitSlotStyle: CSSProperties = {
      width: '100%',
      minHeight: `${Math.max(
        24,
        Math.round(1.72 * 16 * thinActionButtonScale),
      )}px`,
      position: 'relative',
      boxSizing: 'border-box',
      zIndex: 81,
    };

    return (
      <div style={thinTitleRowStyle}>
        <div style={thinTopRowStyle}>
          <span style={computedThinBackButtonScaleWrapStyle}>
            <Link
              to={backTo}
              className="puzzle-back-button"
              style={backButtonStyle}>
              ←
            </Link>
          </span>

          <div style={thinTitleCenterWrapStyle}>
            <div style={titleWithStarRowStyle}>
              <h2 style={titleStyle}>"{title}"</h2>
              <span style={titleActionStarWrapStyle}>
                <PuzzleFavoriteStar puzzleId={puzzleId} size="1.68rem" />
              </span>
            </div>
          </div>
        </div>

        <div style={thinSubmitSlotStyle}>
          <span style={computedThinSubmitScaleWrapStyle}>
            <button
              type="button"
              className="puzzle-back-button"
              style={{
                ...submitSolutionButtonStyle,
                opacity: isSubmitEnabled ? 1 : 0.3,
                cursor: isSubmitEnabled ? 'pointer' : 'default',
                pointerEvents: isSubmitEnabled ? 'auto' : 'none',
              }}
              disabled={!isSubmitEnabled}
              onClick={() => {
                if (!isSubmitEnabled) {
                  return;
                }
                setIsSubmitComingSoon(true);
              }}>
              {isSubmitComingSoon ? 'coming soon...' : 'submit solution'}
            </button>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={computedTitleRowStyle}>
      <div style={{justifySelf: 'start', paddingLeft: `${sideButtonInsetPx}px`}}>
        <span style={computedBackButtonScaleWrapStyle}>
          <Link
            to={backTo}
            className="puzzle-back-button"
            style={backButtonStyle}>
            ← back
          </Link>
        </span>
      </div>
      <div style={computedTitleCenterWrapStyle}>
        <div style={titleWithStarRowStyle}>
          <h2 style={titleStyle}>"{title}"</h2>
          <span style={titleActionStarWrapStyle}>
            <PuzzleFavoriteStar puzzleId={puzzleId} size="1.68rem" />
          </span>
        </div>
      </div>
      <span
        style={{
          ...computedBackButtonGhostScaleWrapStyle,
          marginRight: `${sideButtonInsetPx}px`,
        }}>
        <button
          type="button"
          className="puzzle-back-button"
          style={{
            ...submitSolutionButtonStyle,
            opacity: isSubmitEnabled ? 1 : 0.3,
            cursor: isSubmitEnabled ? 'pointer' : 'default',
            pointerEvents: isSubmitEnabled ? 'auto' : 'none',
          }}
          disabled={!isSubmitEnabled}
          onClick={() => {
            if (!isSubmitEnabled) {
              return;
            }
            setIsSubmitComingSoon(true);
          }}>
          {isSubmitComingSoon ? 'coming soon...' : 'submit solution'}
        </button>
      </span>
    </div>
  );
}
