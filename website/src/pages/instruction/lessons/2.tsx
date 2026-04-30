import type {CSSProperties, ReactNode} from 'react';
import Link from '@docusaurus/Link';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import InstructionSubnav from '@site/src/components/InstructionSubnav';
import {
  LessonCompletionBadge,
  LessonCompletionButton,
} from '@site/src/components/LessonCompletion';
import LessonFavoriteStar from '@site/src/components/LessonFavoriteStar';
import {legacyContent} from '@site/src/data/legacyContent';

const LESSONS_INDEX_PATH = '/instruction/lessons';

const contentWrapStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.7rem',
  padding: '15px 50px 70px',
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
  position: 'relative',
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

const lessonTitleCompletionBadgeStyle: CSSProperties = {
  position: 'absolute',
  left: 'calc(100% + 19px)',
  top: 'calc(50% - 1px)',
  width: '1.76rem',
  height: '1.76rem',
  color: '#178B35',
  pointerEvents: 'none',
  zIndex: 2,
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
    )
    .replace(
      /<p>\s*&nbsp;?\s*<\/p>/i,
      '',
    )
    .replace(
      'This concludes our introduction to some techniques you may want to utilize and/or be on guard against...',
      'This concludes our introduction to some tech you may want to utilize and/or be on guard against...',
    )
    .replace(
      /(\.)(\s*Additionally,\s*this\s*(?:technique|thechnique))/i,
      '$1</p><p>$2',
    )
    .replace(
      /(\.)(\s*Depending\s+on\s+the\s+boardstate)/i,
      '$1</p><p>$2',
    )
    .replace(
      /a\s+mana\s*<i>\s*away\s*<\/i>\s*from/gi,
      '<span class="lesson-nowrap-phrase">a mana <i>away</i> from</span>',
    )
    .replace(
      /a\s+mana\s+away\s+from/gi,
      '<span class="lesson-nowrap-phrase">a mana away from</span>',
    );
  const withHeadingRemoved = withUpdatedBackLink.replace(
    /<p>\s*<b>\s*~\s*3 Strong Techniques to Look Out For\s*~\s*<\/b>\s*<\/p>/i,
    '',
  );
  const withSectionHeadingClass = withHeadingRemoved.replace(
    /<p>\s*<i>\s*(Spirit Dunking|Mana Shielding\s*&\s*Body Blocking|Midline Hold)\s*<\/i>\s*<p>/gi,
    '<p class="lesson-section-heading"><i>$1</i></p>',
  );
  const withConclusionClass = withSectionHeadingClass.replace(
    /<p>\s*<i>\s*This concludes our introduction to some tech you may want to utilize and\/or be on guard against\.\.\.\s*<\/i>\s*<\/p>/i,
    '<p class="lesson-conclusion-line"><i>This concludes our introduction to some tech you may want to utilize and/or be on guard against...</i></p>',
  );
  const withImageRows = withConclusionClass.replace(
    /(?:<img\b[^>]*>\s*){2,}/gi,
    (match, offset, source) => {
      const images = match.match(/<img\b[^>]*>/gi);
      if (!images || images.length < 2) {
        return match;
      }
      const imagesBefore = (source.slice(0, offset).match(/<img\b/gi) ?? []).length;
      const rowClass =
        imagesBefore > 0 ? 'lesson-image-row lesson-image-row-after-first' : 'lesson-image-row';
      return `<div class="${rowClass}">${images.join('')}</div>`;
    },
  );
  let imageIndex = 0;
  return withImageRows.replace(/<img\b[^>]*>/gi, (imageTag) => {
    const className = imageIndex === 0 ? 'lesson-image-first' : 'lesson-image-after-first';
    imageIndex += 1;
    return addClassToImageTag(imageTag, className);
  });
}

const techniquesHtml = formatLessonHtml(legacyContent.techniques);

export default function InstructionLessonTwoPage(): ReactNode {
  return (
    <BlankSectionPage title="Instruction">
      <InstructionSubnav active="lessons" />
      <section className="instruction-lesson-detail-content" style={contentWrapStyle}>
        <div style={lessonTitleRowStyle}>
          <h2 style={lessonTitleStyle}>~ 3 Strong Techniques to Look Out For ~</h2>
          <span style={lessonTitleStarOffsetWrapStyle}>
            <LessonFavoriteStar lessonId="strong-techniques" size="1.68rem" />
          </span>
          <LessonCompletionBadge
            lessonId="strong-techniques"
            style={lessonTitleCompletionBadgeStyle}
          />
        </div>
        <div
          className="lesson-legacy-content lesson-legacy-content--techniques"
          dangerouslySetInnerHTML={{__html: techniquesHtml}}
        />
        <LessonCompletionButton lessonId="strong-techniques" />
        <Link to={LESSONS_INDEX_PATH} style={bottomBackLinkStyle}>
          ☜ back
        </Link>
      </section>
    </BlankSectionPage>
  );
}
