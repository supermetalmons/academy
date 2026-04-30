import {useEffect, useRef, useState, type CSSProperties, type ReactNode} from 'react';
import {
  LESSON_COMPLETIONS_EVENT_NAME,
  type LessonId,
  readLessonCompletionsFromStorage,
  writeLessonCompletionsToStorage,
} from '@site/src/constants/lessonFavorites';

type LessonCompletionBadgeProps = {
  lessonId: LessonId;
  style?: CSSProperties;
};

type AnimatedCompletionBadgeProps = {
  style: CSSProperties;
};

type LessonCompletionButtonProps = {
  lessonId: LessonId;
};

const completionBadgeSvgStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  overflow: 'visible',
};

const lessonCompleteButtonWrapStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  margin: '-0.7rem auto 0.85rem',
};

const lessonCompleteButtonStyle: CSSProperties = {
  position: 'relative',
  border: 0,
  background: 'transparent',
  color: '#0000EE',
  cursor: 'pointer',
  font: 'inherit',
  fontStyle: 'italic',
  lineHeight: 1.2,
  padding: '0.18rem 0.25rem',
  userSelect: 'none',
};

const lessonCompleteButtonBadgeStyle: CSSProperties = {
  position: 'absolute',
  left: 'calc(100% + 10px)',
  top: '50%',
  width: '1.45rem',
  height: '1.45rem',
  color: '#178B35',
  pointerEvents: 'none',
  zIndex: 2,
};

function AnimatedCompletionBadge({style}: AnimatedCompletionBadgeProps): ReactNode {
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
        ...style,
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

export function LessonCompletionBadge({
  lessonId,
  style,
}: LessonCompletionBadgeProps): ReactNode {
  const [isLessonCompleted, setIsLessonCompleted] = useState(() =>
    readLessonCompletionsFromStorage().has(lessonId),
  );
  const isLessonCompletedRef = useRef(isLessonCompleted);
  const [replayNonce, setReplayNonce] = useState(0);

  useEffect(() => {
    isLessonCompletedRef.current = isLessonCompleted;
  }, [isLessonCompleted]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const syncCompletionState = () => {
      const nextIsCompleted = readLessonCompletionsFromStorage().has(lessonId);
      if (nextIsCompleted && isLessonCompletedRef.current) {
        setReplayNonce((nonce) => nonce + 1);
      }
      isLessonCompletedRef.current = nextIsCompleted;
      setIsLessonCompleted(nextIsCompleted);
    };
    syncCompletionState();
    window.addEventListener('storage', syncCompletionState);
    window.addEventListener(LESSON_COMPLETIONS_EVENT_NAME, syncCompletionState as EventListener);
    return () => {
      window.removeEventListener('storage', syncCompletionState);
      window.removeEventListener(LESSON_COMPLETIONS_EVENT_NAME, syncCompletionState as EventListener);
    };
  }, [lessonId]);

  if (!isLessonCompleted || style === undefined) {
    return null;
  }

  return <AnimatedCompletionBadge key={replayNonce} style={style} />;
}

export function LessonCompletionButton({
  lessonId,
}: LessonCompletionButtonProps): ReactNode {
  const [isLessonCompleted, setIsLessonCompleted] = useState(() =>
    readLessonCompletionsFromStorage().has(lessonId),
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const syncCompletionState = () => {
      setIsLessonCompleted(readLessonCompletionsFromStorage().has(lessonId));
    };
    syncCompletionState();
    window.addEventListener('storage', syncCompletionState);
    window.addEventListener(LESSON_COMPLETIONS_EVENT_NAME, syncCompletionState as EventListener);
    return () => {
      window.removeEventListener('storage', syncCompletionState);
      window.removeEventListener(LESSON_COMPLETIONS_EVENT_NAME, syncCompletionState as EventListener);
    };
  }, [lessonId]);

  const toggleLessonCompletion = () => {
    const nextCompletions = readLessonCompletionsFromStorage();
    if (nextCompletions.has(lessonId)) {
      nextCompletions.delete(lessonId);
    } else {
      nextCompletions.add(lessonId);
    }
    const safeCompletions = writeLessonCompletionsToStorage(nextCompletions);
    setIsLessonCompleted(safeCompletions.has(lessonId));
  };

  return (
    <div style={lessonCompleteButtonWrapStyle}>
      <button
        type="button"
        style={lessonCompleteButtonStyle}
        aria-pressed={isLessonCompleted}
        onClick={toggleLessonCompletion}>
        {isLessonCompleted
          ? 'Mark this Lesson as Incomplete'
          : 'Mark this Lesson as Complete'}
        <LessonCompletionBadge lessonId={lessonId} style={lessonCompleteButtonBadgeStyle} />
      </button>
    </div>
  );
}
