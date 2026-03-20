import {
  LESSON_FAVORITES_EVENT_NAME,
  type LessonId,
  readLessonFavoritesFromStorage,
  writeLessonFavoritesToStorage,
} from '@site/src/constants/lessonFavorites';
import {useEffect, useRef, useState, type CSSProperties, type ReactNode} from 'react';

type LessonFavoriteStarProps = {
  lessonId: LessonId;
  size?: string;
};

const favoriteIconStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'block',
};

const favoritePulseWrapStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
};

const favoritePulseIconStyle: CSSProperties = {
  width: '190%',
  height: '190%',
  display: 'block',
  opacity: 0,
  transform: 'scale(0.6)',
  transformOrigin: 'center center',
  overflow: 'visible',
};

const FAVORITE_PULSE_DURATION_MS = 560;

function getFavoriteButtonStyle(size: string, isActive: boolean, isHovered: boolean): CSSProperties {
  const baseStyle: CSSProperties = {
    width: size,
    height: size,
    border: 'none',
    background: 'transparent',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    color: '#8f8f8f',
    transition: 'transform 170ms cubic-bezier(0.22, 1, 0.36, 1), color 160ms ease, filter 160ms ease',
    overflow: 'visible',
    position: 'relative',
    transformOrigin: 'center center',
  };
  if (isActive) {
    baseStyle.color = '#f2ca3f';
    baseStyle.filter = 'drop-shadow(0 0 3px rgba(242, 202, 63, 0.62))';
  }
  baseStyle.transform = isHovered ? 'scale(1.16)' : 'scale(1)';
  return baseStyle;
}

export default function LessonFavoriteStar({
  lessonId,
  size = '1.72rem',
}: LessonFavoriteStarProps): ReactNode {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const favoriteIconRef = useRef<SVGSVGElement | null>(null);
  const favoritePulseRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const syncFavoriteState = () => {
      setIsFavorite(readLessonFavoritesFromStorage().has(lessonId));
    };
    syncFavoriteState();
    window.addEventListener('storage', syncFavoriteState);
    window.addEventListener(LESSON_FAVORITES_EVENT_NAME, syncFavoriteState as EventListener);
    return () => {
      window.removeEventListener('storage', syncFavoriteState);
      window.removeEventListener(LESSON_FAVORITES_EVENT_NAME, syncFavoriteState as EventListener);
    };
  }, [lessonId]);

  const runFavoritePulseAnimation = () => {
    if (favoriteIconRef.current !== null) {
      favoriteIconRef.current.getAnimations().forEach((animation) => {
        animation.cancel();
      });
      favoriteIconRef.current.animate(
        [
          {
            transform: 'scale(1)',
            filter: 'drop-shadow(0 0 0 rgba(242, 202, 63, 0))',
          },
          {
            transform: 'scale(1.25)',
            filter: 'drop-shadow(0 0 7px rgba(242, 202, 63, 0.85))',
          },
          {
            transform: 'scale(1)',
            filter: 'drop-shadow(0 0 0 rgba(242, 202, 63, 0))',
          },
        ],
        {
          duration: 420,
          easing: 'cubic-bezier(0.2, 0.9, 0.25, 1)',
          fill: 'none',
        },
      );
    }
    if (favoritePulseRef.current !== null) {
      favoritePulseRef.current.getAnimations().forEach((animation) => {
        animation.cancel();
      });
      favoritePulseRef.current.animate(
        [
          {
            opacity: 0,
            transform: 'scale(0.58)',
            filter: 'drop-shadow(0 0 0 rgba(255, 226, 106, 0))',
          },
          {
            opacity: 0.92,
            transform: 'scale(0.95)',
            filter: 'drop-shadow(0 0 8px rgba(255, 226, 106, 0.78))',
          },
          {
            opacity: 0,
            transform: 'scale(1.86)',
            filter: 'drop-shadow(0 0 16px rgba(255, 226, 106, 0))',
          },
        ],
        {
          duration: FAVORITE_PULSE_DURATION_MS,
          easing: 'cubic-bezier(0.2, 0.9, 0.25, 1)',
          fill: 'none',
        },
      );
    }
  };

  const toggleFavorite = () => {
    const nextFavorites = readLessonFavoritesFromStorage();
    if (nextFavorites.has(lessonId)) {
      nextFavorites.delete(lessonId);
      writeLessonFavoritesToStorage(nextFavorites);
      setIsFavorite(false);
      return;
    }
    nextFavorites.add(lessonId);
    writeLessonFavoritesToStorage(nextFavorites);
    setIsFavorite(true);
    runFavoritePulseAnimation();
  };

  return (
    <button
      type="button"
      aria-label={isFavorite ? 'Remove lesson from favorites' : 'Save lesson to favorites'}
      aria-pressed={isFavorite}
      style={getFavoriteButtonStyle(size, isFavorite, isHovered)}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite();
      }}>
      <svg ref={favoriteIconRef} viewBox="0 0 24 24" aria-hidden="true" style={favoriteIconStyle}>
        <path
          d="M12 2.6L14.9 8.4L21.2 9.3L16.6 13.7L17.7 20L12 17L6.3 20L7.4 13.7L2.8 9.3L9.1 8.4L12 2.6Z"
          fill={isFavorite ? 'currentColor' : 'transparent'}
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinejoin="round"
        />
      </svg>
      <span style={favoritePulseWrapStyle} aria-hidden="true">
        <svg ref={favoritePulseRef} viewBox="0 0 24 24" style={favoritePulseIconStyle}>
          <path
            d="M12 2.6L14.9 8.4L21.2 9.3L16.6 13.7L17.7 20L12 17L6.3 20L7.4 13.7L2.8 9.3L9.1 8.4L12 2.6Z"
            fill="none"
            stroke="#ffe26a"
            strokeWidth="2.1"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}
