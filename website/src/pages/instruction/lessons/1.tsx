import type {CSSProperties, ReactNode} from 'react';
import Link from '@docusaurus/Link';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import InstructionSubnav from '@site/src/components/InstructionSubnav';
import LessonFavoriteStar from '@site/src/components/LessonFavoriteStar';
import {legacyContent} from '@site/src/data/legacyContent';

const LESSONS_INDEX_PATH = '/instruction/lessons';

const contentWrapStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.7rem',
  padding: '15px 50px',
};

const bottomBackLinkStyle: CSSProperties = {
  color: '#0000EE',
  textDecoration: 'none',
  display: 'block',
  width: 'fit-content',
  margin: '0 auto',
  fontStyle: 'italic',
  lineHeight: 1.2,
};

const lessonTitleRowStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.45rem',
  margin: '0 auto',
};

const lessonTitleStyle: CSSProperties = {
  margin: 0,
  textAlign: 'center',
  fontSize: '1.52rem',
  lineHeight: 1.22,
};

const lessonTitleStarOffsetWrapStyle: CSSProperties = {
  display: 'inline-flex',
  transform: 'translate(10px, -1px)',
};

function formatLessonHtml(rawHtml: string): string {
  const addClassToImageTag = (tag: string, className: string): string => {
    if (/class\s*=/.test(tag)) {
      return tag.replace(
        /class\s*=\s*(["'])([^"']*)(["'])/i,
        (_match, openQuote: string, classes: string, closeQuote: string) =>
          `class=${openQuote}${classes} ${className}${closeQuote}`,
      );
    }
    return tag.replace('<img', `<img class="${className}"`);
  };

  const withUpdatedBackLink = rawHtml
    .replaceAll('/docs/intro/overview', LESSONS_INDEX_PATH)
    .replace(
      /<p>\s*<i>\s*<a\s+href="\/instruction\/lessons">☜\s*back<\/a>\s*<\/i>\s*<\/p>/i,
      '',
    );
  const withHeadingRemoved = withUpdatedBackLink.replace(
    /<p>\s*<b>\s*~\s*3 White Openings to Get Started\s*~\s*<\/b>\s*<\/p>/i,
    '',
  );
  const withQuickNoteClass = withHeadingRemoved.replace(
    '<p><i>¹ A quick note that may seem obvious but:',
    '<p class="lesson-quick-note"><i class="lesson-quick-note-text">¹ A quick note that may seem obvious but:',
  );
  const withConclusionClass = withQuickNoteClass.replace(
    /<p>\s*<i>\s*This concludes our introduction to openings for white\.\.\.\s*<\/i>\s*<\/p>/i,
    '<p class="lesson-conclusion-line"><i>This concludes our introduction to openings for white...</i></p>',
  );
  const withImageRows = withConclusionClass.replace(/(?:<img\b[^>]*>\s*){2,}/gi, (match) => {
    const images = match.match(/<img\b[^>]*>/gi);
    if (!images || images.length < 2) {
      return match;
    }
    return `<div class="lesson-image-row">${images.join('')}</div>`;
  });
  let imageIndex = 0;
  return withImageRows.replace(/<img\b[^>]*>/gi, (imageTag) => {
    const className = imageIndex === 0 ? 'lesson-image-first' : 'lesson-image-after-first';
    imageIndex += 1;
    return addClassToImageTag(imageTag, className);
  });
}

const openingsHtml = formatLessonHtml(legacyContent.openings);

export default function InstructionLessonOnePage(): ReactNode {
  return (
    <BlankSectionPage title="Instruction">
      <InstructionSubnav active="lessons" />
      <section className="instruction-lesson-detail-content" style={contentWrapStyle}>
        <div style={lessonTitleRowStyle}>
          <h2 style={lessonTitleStyle}>~ 3 White Openings to Get Started ~</h2>
          <span style={lessonTitleStarOffsetWrapStyle}>
          <LessonFavoriteStar lessonId="white-openings" size="1.68rem" />
        </span>
        </div>
        <div
          className="lesson-legacy-content"
          dangerouslySetInnerHTML={{__html: openingsHtml}}
        />
        <Link to={LESSONS_INDEX_PATH} style={bottomBackLinkStyle}>
          ☜ back
        </Link>
      </section>
    </BlankSectionPage>
  );
}
