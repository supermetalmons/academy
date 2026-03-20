import Link from '@docusaurus/Link';
import PuzzleFavoriteStar from '@site/src/components/PuzzleFavoriteStar';
import {type PuzzleId} from '@site/src/constants/puzzleFavorites';
import {useEffect, useState, type CSSProperties, type ReactNode} from 'react';

type PuzzleTitleRowProps = {
  puzzleId: PuzzleId;
  title: string;
  backTo?: string;
  isSubmitEnabled?: boolean;
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

const titleCenterWrapStyle: CSSProperties = {
  display: 'inline-block',
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 50,
};

const titleActionRowStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: 'calc(100% + 7px)',
  transform: 'translateX(-50%)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '20px',
  zIndex: 80,
  pointerEvents: 'auto',
};

const titleActionStarWrapStyle: CSSProperties = {
  display: 'inline-flex',
  transform: 'translateY(-1px)',
  position: 'relative',
  zIndex: 81,
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

const backButtonGhostStyle: CSSProperties = {
  ...backButtonStyle,
  visibility: 'hidden',
  pointerEvents: 'none',
};

const submitSolutionButtonStyle: CSSProperties = {
  position: 'relative',
  zIndex: 81,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '1.36rem',
  border: '1px solid #000',
  backgroundColor: '#fff',
  color: '#000',
  fontSize: '0.74rem',
  lineHeight: 1,
  padding: '0 0.62rem',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
};

export default function PuzzleTitleRow({
  puzzleId,
  title,
  backTo = '/puzzles',
  isSubmitEnabled = true,
}: PuzzleTitleRowProps): ReactNode {
  const [isSubmitComingSoon, setIsSubmitComingSoon] = useState(false);
  useEffect(() => {
    if (!isSubmitEnabled) {
      setIsSubmitComingSoon(false);
    }
  }, [isSubmitEnabled]);
  return (
    <div style={titleRowStyle}>
      <div style={{justifySelf: 'start'}}>
        <Link
          to={backTo}
          className="puzzle-back-button"
          style={backButtonStyle}>
          ← back
        </Link>
      </div>
      <div style={titleCenterWrapStyle}>
        <h2 style={titleStyle}>"{title}"</h2>
        <div style={titleActionRowStyle}>
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
          <span style={titleActionStarWrapStyle}>
            <PuzzleFavoriteStar puzzleId={puzzleId} size="1.68rem" />
          </span>
        </div>
      </div>
      <span style={backButtonGhostStyle} aria-hidden="true">
        ← back
      </span>
    </div>
  );
}
