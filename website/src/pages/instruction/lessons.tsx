import {useEffect, useMemo, useState, type CSSProperties, type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import InstructionSubnav from '@site/src/components/InstructionSubnav';
import LessonFavoriteStar from '@site/src/components/LessonFavoriteStar';
import {
  LESSON_FAVORITES_EVENT_NAME,
  readLessonFavoritesFromStorage,
  type LessonId,
} from '@site/src/constants/lessonFavorites';

type LessonSortMode = 'alphabetical' | 'created' | 'complexity';
type LessonCard = {
  id: LessonId;
  title: string;
  to: string;
  createdOrder: number;
  complexity: number;
  previewImageSrc: string;
  previewImageAlt: string;
};

const lessonsWrapStyle: CSSProperties = {
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

const lessonsGalleryStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '1rem',
};

const lessonCardStyle: CSSProperties = {
  border: '1px solid #000',
  backgroundColor: '#fff',
  minHeight: '156px',
  padding: 0,
  display: 'grid',
  gridTemplateColumns: 'clamp(110px, 24%, 165px) minmax(0, 1fr) 56px',
  alignItems: 'stretch',
  color: '#000',
  overflow: 'hidden',
};

const lessonCardLinkStyle: CSSProperties = {
  color: 'inherit',
  textDecoration: 'none',
  display: 'block',
};

const lessonCardImageLinkStyle: CSSProperties = {
  ...lessonCardLinkStyle,
  height: '100%',
};

const lessonCardTitleLinkStyle: CSSProperties = {
  ...lessonCardLinkStyle,
  display: 'inline-flex',
  alignItems: 'center',
};

const lessonCardPreviewImageStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
  imageRendering: 'auto',
};

const lessonCardTitleStyle: CSSProperties = {
  textAlign: 'center',
  lineHeight: 1.2,
  fontSize: '1.34rem',
  fontWeight: 700,
};

const lessonCardTextColumnStyle: CSSProperties = {
  gridColumn: '2',
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.95rem 1rem',
};

const lessonCardStarRailStyle: CSSProperties = {
  gridColumn: '3',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderLeft: '1px solid #000',
};

const lessonCardTitleRowStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.45rem',
  maxWidth: '100%',
};

const lessonCardTitleStarOffsetStyle: CSSProperties = {
  display: 'inline-flex',
  transform: 'translate(10px, -2px)',
};

const lessonsEmptyStateStyle: CSSProperties = {
  margin: '0.35rem 0 0',
  textAlign: 'center',
  fontStyle: 'italic',
  opacity: 0.72,
};

const starterLessonCards: LessonCard[] = [
  {
    id: 'white-openings',
    title: '3 White Openings to Get Started',
    to: '/instruction/lessons/1',
    createdOrder: 1,
    complexity: 1,
    previewImageSrc: '/img/legacy/images/opening1.png',
    previewImageAlt: '3 White Openings to Get Started preview',
  },
  {
    id: 'strong-techniques',
    title: '3 Strong Techniques to Look Out For',
    to: '/instruction/lessons/2',
    createdOrder: 2,
    complexity: 2,
    previewImageSrc: '/img/legacy/images/spiritdunk.png',
    previewImageAlt: '3 Strong Techniques to Look Out For preview',
  },
];

const DEFAULT_LESSON_SORT_MODE: LessonSortMode = 'created';

export default function InstructionLessonsPage(): ReactNode {
  const [sortMode, setSortMode] = useState<LessonSortMode>(DEFAULT_LESSON_SORT_MODE);
  const [isSortReversed, setIsSortReversed] = useState(false);
  const [isFavoritesFilterEnabled, setIsFavoritesFilterEnabled] = useState(false);
  const [favoriteLessonIds, setFavoriteLessonIds] = useState<Set<LessonId>>(new Set<LessonId>());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const syncFavorites = () => {
      setFavoriteLessonIds(readLessonFavoritesFromStorage());
    };
    syncFavorites();
    window.addEventListener('storage', syncFavorites);
    window.addEventListener(LESSON_FAVORITES_EVENT_NAME, syncFavorites as EventListener);
    return () => {
      window.removeEventListener('storage', syncFavorites);
      window.removeEventListener(LESSON_FAVORITES_EVENT_NAME, syncFavorites as EventListener);
    };
  }, []);

  const sortedLessonCards = useMemo(() => {
    const next = [...starterLessonCards];
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

  const visibleLessonCards = useMemo(
    () =>
      sortedLessonCards.filter((lesson) =>
        isFavoritesFilterEnabled ? favoriteLessonIds.has(lesson.id) : true,
      ),
    [favoriteLessonIds, isFavoritesFilterEnabled, sortedLessonCards],
  );

  return (
    <BlankSectionPage title="Instruction">
      <InstructionSubnav active="lessons" />
      <section style={lessonsWrapStyle}>
        <div style={toolbarStyle} className="gallery-toolbar" aria-label="Lessons sort toolbar">
          <div style={toolbarGroupStyle} className="gallery-toolbar-group gallery-toolbar-group--filter">
            <span style={toolbarLabelStyle} className="gallery-toolbar-label">Filter by:</span>
            <div style={toolbarButtonsStyle} className="gallery-toolbar-buttons">
              <button
                type="button"
                className="gallery-toolbar-button"
                aria-label="Show only favorited lessons"
                title={isFavoritesFilterEnabled ? 'Show all lessons' : 'Show only starred lessons'}
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
                aria-label="Show only completed lessons (coming soon)"
                title="Completed filter coming soon"
                style={filterButtonDisabledStyle}
                disabled>
                <svg viewBox="0 0 24 24" aria-hidden="true" style={filterIconStyle} className="gallery-toolbar-icon" fill="none">
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
        <section style={lessonsGalleryStyle} aria-label="Lessons gallery">
          {visibleLessonCards.map((lesson) => (
            <article key={lesson.id} style={lessonCardStyle} className="gallery-card lesson-gallery-card">
              <Link
                to={lesson.to}
                style={lessonCardImageLinkStyle}
                className="instruction-lesson-card-link gallery-card-image-link"
                aria-label={`Open ${lesson.title} lesson`}>
                <img
                  src={lesson.previewImageSrc}
                  alt={lesson.previewImageAlt}
                  style={lessonCardPreviewImageStyle}
                  className="gallery-card-preview-image"
                />
              </Link>
              <div style={lessonCardTextColumnStyle} className="gallery-card-text-column">
                <div style={lessonCardTitleRowStyle} className="gallery-card-title-row">
                  <Link
                    to={lesson.to}
                    style={lessonCardTitleLinkStyle}
                    className="instruction-lesson-card-link"
                    aria-label={`Open ${lesson.title} lesson`}>
                    <span
                      style={lessonCardTitleStyle}
                      className="instruction-lesson-card-title">
                      {lesson.title}
                    </span>
                  </Link>
                  <span style={lessonCardTitleStarOffsetStyle} className="gallery-card-title-star">
                    <LessonFavoriteStar lessonId={lesson.id} size="1.28rem" />
                  </span>
                </div>
              </div>
              <div style={lessonCardStarRailStyle} className="gallery-card-star-rail">
                <LessonFavoriteStar lessonId={lesson.id} size="1.28rem" />
              </div>
            </article>
          ))}
          {visibleLessonCards.length === 0 ? (
            <p style={lessonsEmptyStateStyle}>No starred lessons yet.</p>
          ) : null}
        </section>
      </section>
    </BlankSectionPage>
  );
}
