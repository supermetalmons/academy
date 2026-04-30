import Link from '@docusaurus/Link';
import PuzzleFavoriteStar from '@site/src/components/PuzzleFavoriteStar';
import {
  PUZZLE_COMPLETIONS_EVENT_NAME,
  type PuzzleId,
  readPuzzleCompletionsFromStorage,
  writePuzzleCompletionsToStorage,
} from '@site/src/constants/puzzleFavorites';
import {useEffect, useState, type CSSProperties, type ReactNode} from 'react';

type PuzzleTitleRowProps = {
  puzzleId: PuzzleId;
  title: string;
  backTo?: string;
  isSubmitEnabled?: boolean;
  isSubmittedWinningSolutionCurrent?: boolean;
  checkSolution?: () => boolean;
  onCorrectSubmit?: () => void;
  incorrectSubmitLabel?: string;
  submitResetKey?: number;
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

const completionBadgeWrapStyle: CSSProperties = {
  position: 'absolute',
  left: 'calc(100% + 12px)',
  top: '50%',
  width: '1.76rem',
  height: '1.76rem',
  color: '#178B35',
  pointerEvents: 'none',
  zIndex: 82,
};

const completionBadgeSvgStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  overflow: 'visible',
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
const PUZZLE_WIN_CONFETTI_COLORS = [
  '#FFC700',
  '#FF0000',
  '#2E3192',
  '#41BBC7',
  '#FF66CC',
  '#33CC33',
];

type PuzzleWinConfettiParticle = {
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  velocityX: number;
  velocityY: number;
  angularVelocity: number;
  gravity: number;
  sway: number;
  swayVelocity: number;
};

function PuzzleCompletionBadge(): ReactNode {
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
        ...completionBadgeWrapStyle,
        opacity: isEntered ? 1 : 0,
        transform: isEntered
          ? 'translateY(-50%) translateX(0) scale(1)'
          : 'translateY(-50%) translateX(-5px) scale(0.58)',
        transformOrigin: 'center center',
        transition:
          'opacity 180ms ease-out, transform 520ms cubic-bezier(0.16, 1.28, 0.32, 1)',
      }}>
      <svg viewBox="0 0 24 24" style={completionBadgeSvgStyle}>
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
            transition: 'stroke-dashoffset 520ms cubic-bezier(0.2, 0.9, 0.25, 1)',
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
              'stroke-dashoffset 360ms cubic-bezier(0.2, 0.9, 0.25, 1) 220ms',
          }}
        />
      </svg>
    </span>
  );
}

let activePuzzleWinConfettiCanvas: HTMLCanvasElement | null = null;
let activePuzzleWinConfettiResizeHandler: (() => void) | null = null;
let activePuzzleWinConfettiAnimationFrame: number | null = null;

function stopPuzzleWinConfetti(): void {
  if (typeof window !== 'undefined' && activePuzzleWinConfettiAnimationFrame !== null) {
    window.cancelAnimationFrame(activePuzzleWinConfettiAnimationFrame);
    activePuzzleWinConfettiAnimationFrame = null;
  }
  if (
    typeof window !== 'undefined' &&
    activePuzzleWinConfettiResizeHandler !== null
  ) {
    window.removeEventListener('resize', activePuzzleWinConfettiResizeHandler);
    activePuzzleWinConfettiResizeHandler = null;
  }
  if (
    activePuzzleWinConfettiCanvas !== null &&
    activePuzzleWinConfettiCanvas.parentNode !== null
  ) {
    activePuzzleWinConfettiCanvas.parentNode.removeChild(activePuzzleWinConfettiCanvas);
  }
  activePuzzleWinConfettiCanvas = null;
}

function launchPuzzleWinConfetti(count = 95, durationMs = 2800): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return;
  }
  stopPuzzleWinConfetti();

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (context === null) {
    return;
  }

  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '2147483647';
  document.body.appendChild(canvas);
  activePuzzleWinConfettiCanvas = canvas;

  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;
  const resizeCanvas = () => {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    const pixelRatio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.ceil(viewportWidth * pixelRatio);
    canvas.height = Math.ceil(viewportHeight * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };
  resizeCanvas();
  activePuzzleWinConfettiResizeHandler = resizeCanvas;
  window.addEventListener('resize', resizeCanvas);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const particleCount = reducedMotion ? Math.round(count * 0.35) : count;
  const runDurationMs = reducedMotion ? Math.round(durationMs * 0.6) : durationMs;
  const particles: PuzzleWinConfettiParticle[] = Array.from(
    {length: particleCount},
    () => ({
      x: Math.random() * viewportWidth,
      y: -Math.random() * viewportHeight - Math.random() * 120,
      size: Math.random() * 7 + 4,
      color:
        PUZZLE_WIN_CONFETTI_COLORS[
          Math.floor(Math.random() * PUZZLE_WIN_CONFETTI_COLORS.length)
        ],
      rotation: Math.random() * 360,
      velocityX: Math.random() * 2.6 - 1.3,
      velocityY: Math.random() * 4.4 + 2.8,
      angularVelocity: Math.random() * 8 - 4,
      gravity: Math.random() * 0.045 + 0.025,
      sway: Math.random() * Math.PI * 2,
      swayVelocity: Math.random() * 0.045 + 0.02,
    }),
  );

  let lastTime = window.performance.now();
  let elapsedTime = 0;
  const animate = (now: number) => {
    const deltaMs = now - lastTime;
    lastTime = now;
    elapsedTime += deltaMs;
    const frameScale = Math.min(3, Math.max(0.25, deltaMs / 16.67));
    context.clearRect(0, 0, viewportWidth, viewportHeight);

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      particle.sway += particle.swayVelocity * frameScale;
      particle.x +=
        (particle.velocityX + Math.sin(particle.sway) * 0.85) * frameScale;
      particle.y += particle.velocityY * frameScale;
      particle.velocityY += particle.gravity * frameScale;
      particle.rotation += particle.angularVelocity * frameScale;

      context.save();
      context.translate(particle.x, particle.y);
      context.rotate((particle.rotation * Math.PI) / 180);
      context.fillStyle = particle.color;
      context.fillRect(
        -particle.size / 2,
        -particle.size / 2,
        particle.size,
        particle.size,
      );
      context.restore();

      if (
        particle.y > viewportHeight + particle.size ||
        particle.x < -particle.size ||
        particle.x > viewportWidth + particle.size
      ) {
        particles.splice(i, 1);
      }
    }

    if (particles.length > 0 && elapsedTime < runDurationMs + 3600) {
      activePuzzleWinConfettiAnimationFrame = window.requestAnimationFrame(animate);
      return;
    }
    stopPuzzleWinConfetti();
  };

  activePuzzleWinConfettiAnimationFrame = window.requestAnimationFrame(animate);
}

export default function PuzzleTitleRow({
  puzzleId,
  title,
  backTo = '/puzzles',
  isSubmitEnabled = true,
  isSubmittedWinningSolutionCurrent = false,
  checkSolution,
  onCorrectSubmit,
  incorrectSubmitLabel = 'try again...',
  submitResetKey = 0,
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

  const [submitResult, setSubmitResult] = useState<'idle' | 'incorrect' | 'correct'>('idle');
  const [isPuzzleCompleted, setIsPuzzleCompleted] = useState(() =>
    readPuzzleCompletionsFromStorage().has(puzzleId),
  );
  const [completionBadgeReplayNonce, setCompletionBadgeReplayNonce] = useState(0);
  const shouldShowWinningSubmitState = isSubmittedWinningSolutionCurrent;
  const displayedSubmitResult = shouldShowWinningSubmitState ? 'correct' : submitResult;
  const submitButtonLabel =
    displayedSubmitResult === 'correct'
      ? 'WIN!!!'
      : displayedSubmitResult === 'incorrect'
        ? incorrectSubmitLabel
        : 'submit solution';
  const completionBadge =
    isPuzzleCompleted ? <PuzzleCompletionBadge key={completionBadgeReplayNonce} /> : null;
  const markPuzzleCompleted = () => {
    const nextCompletions = readPuzzleCompletionsFromStorage();
    if (!nextCompletions.has(puzzleId)) {
      nextCompletions.add(puzzleId);
      writePuzzleCompletionsToStorage(nextCompletions);
    }
    setIsPuzzleCompleted(true);
  };
  const handleSubmitClick = () => {
    if (!isSubmitEnabled) {
      return;
    }
    const isCorrectSolution = checkSolution?.() === true;
    setSubmitResult(isCorrectSolution ? 'correct' : 'incorrect');
    if (isCorrectSolution) {
      markPuzzleCompleted();
      setCompletionBadgeReplayNonce((current) => current + 1);
      launchPuzzleWinConfetti();
      onCorrectSubmit?.();
    }
  };

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
    if (!isSubmitEnabled && !shouldShowWinningSubmitState) {
      setSubmitResult('idle');
    }
  }, [isSubmitEnabled, shouldShowWinningSubmitState]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const syncCompletionState = () => {
      setIsPuzzleCompleted(readPuzzleCompletionsFromStorage().has(puzzleId));
    };
    syncCompletionState();
    window.addEventListener('storage', syncCompletionState);
    window.addEventListener(PUZZLE_COMPLETIONS_EVENT_NAME, syncCompletionState as EventListener);
    return () => {
      window.removeEventListener('storage', syncCompletionState);
      window.removeEventListener(PUZZLE_COMPLETIONS_EVENT_NAME, syncCompletionState as EventListener);
    };
  }, [puzzleId]);

  useEffect(() => {
    setSubmitResult(shouldShowWinningSubmitState ? 'correct' : 'idle');
  }, [shouldShowWinningSubmitState, submitResetKey]);

  useEffect(() => {
    stopPuzzleWinConfetti();
  }, [submitResetKey]);

  useEffect(() => {
    if (shouldShowWinningSubmitState) {
      setSubmitResult('correct');
      return;
    }
    setSubmitResult((current) => (current === 'correct' ? 'idle' : current));
  }, [shouldShowWinningSubmitState]);

  useEffect(() => stopPuzzleWinConfetti, []);

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
            {completionBadge}
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
              onClick={handleSubmitClick}>
              {submitButtonLabel}
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
        {completionBadge}
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
          onClick={handleSubmitClick}>
          {submitButtonLabel}
        </button>
      </span>
    </div>
  );
}
