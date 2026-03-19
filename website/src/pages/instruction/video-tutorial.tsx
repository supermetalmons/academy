import type {CSSProperties, ReactNode} from 'react';
import {useState} from 'react';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import InstructionSubnav from '@site/src/components/InstructionSubnav';

type TutorialPart = 'part-1' | 'part-2' | 'part-3';

const videosWrapStyle: CSSProperties = {
  display: 'grid',
  gap: '1rem',
  paddingBottom: '1.5rem',
};

const videoCardStyle: CSSProperties = {
  border: '1px solid #000',
  backgroundColor: '#fff',
  padding: '0.65rem',
};

const videoTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: 700,
  color: '#000',
};

const videoTitleRowStyle: CSSProperties = {
  marginBottom: '0.5rem',
  paddingTop: '0.45rem',
  paddingBottom: '0.55rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  flexWrap: 'wrap',
};

const videoPartsWrapStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1.2rem',
  marginLeft: '0.75rem',
};

const partButtonStyle: CSSProperties = {
  border: 0,
  background: 'none',
  padding: 0,
  margin: 0,
  color: 'var(--ifm-link-color)',
  cursor: 'pointer',
  fontSize: '1rem',
  fontFamily: 'inherit',
  lineHeight: 1.1,
  textDecoration: 'underline',
};

const activePartButtonStyle: CSSProperties = {
  ...partButtonStyle,
  color: '#000',
  textDecoration: 'none',
  fontWeight: 900,
  textTransform: 'uppercase',
  cursor: 'default',
};

const partDotStyle: CSSProperties = {
  fontSize: '0.72rem',
  lineHeight: 1,
  color: '#000',
  opacity: 0.85,
  userSelect: 'none',
};

const videoDescriptionStyle: CSSProperties = {
  margin: '0 0 0.75rem 0',
  fontSize: '0.95rem',
  lineHeight: 1.3,
  color: 'rgba(0, 0, 0, 0.62)',
  fontStyle: 'italic',
};

const inlineSpriteStyle: CSSProperties = {
  width: '1.05em',
  height: '1.05em',
  marginRight: '0.2em',
  verticalAlign: '-0.12em',
  imageRendering: 'auto',
  opacity: 0.9,
};

const videoFrameWrapStyle: CSSProperties = {
  width: '100%',
  aspectRatio: '16 / 9',
  border: '1px solid #000',
  backgroundColor: '#000',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const videoFrameStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  border: 0,
  display: 'block',
};

const comingSoonStyle: CSSProperties = {
  margin: 0,
  color: '#fff',
  fontSize: '1.35rem',
  lineHeight: 1.2,
  fontStyle: 'italic',
};

type InlineSpriteProps = {
  src: string;
  style?: CSSProperties;
};

function InlineSprite({src, style}: InlineSpriteProps): ReactNode {
  return <img src={src} alt="" aria-hidden="true" style={{...inlineSpriteStyle, ...style}} />;
}

export default function InstructionVideoTutorialPage(): ReactNode {
  const [selectedPart, setSelectedPart] = useState<TutorialPart>('part-1');
  const selectedPartDescription: ReactNode =
    selectedPart === 'part-1'
      ? (
          <>
            learn the basic rules of mons and how the{' '}
            <InlineSprite src="/assets/mons/drainer.png" style={{marginLeft: '0.35em'}} />
            Drainer, <InlineSprite src="/assets/mons/spirit.png" />
            Spirit, and <InlineSprite src="/assets/mons/mana.png" />
            Mana Moves work
          </>
        )
      : selectedPart === 'part-2'
        ? (
            <>
              learn the basics of combat with the <InlineSprite src="/assets/mons/mystic.png" />
              Mystic, <InlineSprite src="/assets/mons/demon.png" />
              Demon, and <InlineSprite src="/assets/mons/angel.png" />
              Angel abilities as well as how the <InlineSprite src="/assets/mons/bombOrPotion.png" />
              items work
            </>
          )
        : '~';

  return (
    <BlankSectionPage title="Instruction">
      <InstructionSubnav active="video-tutorial" />
      <div style={videosWrapStyle}>
        <section style={videoCardStyle}>
          <div style={videoTitleRowStyle}>
            <h3 style={videoTitleStyle}>Intro to Super Metal Mons</h3>
            <div style={videoPartsWrapStyle}>
              <button
                type="button"
                style={selectedPart === 'part-1' ? activePartButtonStyle : partButtonStyle}
                onClick={() => setSelectedPart('part-1')}
                disabled={selectedPart === 'part-1'}>
                Part 1
              </button>
              <span aria-hidden="true" style={partDotStyle}>
                •
              </span>
              <button
                type="button"
                style={selectedPart === 'part-2' ? activePartButtonStyle : partButtonStyle}
                onClick={() => setSelectedPart('part-2')}
                disabled={selectedPart === 'part-2'}>
                Part 2
              </button>
              <span aria-hidden="true" style={partDotStyle}>
                •
              </span>
              <button
                type="button"
                style={selectedPart === 'part-3' ? activePartButtonStyle : partButtonStyle}
                onClick={() => setSelectedPart('part-3')}
                disabled={selectedPart === 'part-3'}>
                Part 3
              </button>
            </div>
          </div>
          <p style={videoDescriptionStyle}>{selectedPartDescription}</p>
          <div style={videoFrameWrapStyle}>
            {selectedPart === 'part-1' ? (
              <iframe
                style={videoFrameStyle}
                src="https://www.youtube.com/embed/8L0sGd0iskc?start=6"
                title="Super Metal Mons Intro Tutorial Video Part 1"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : null}
            {selectedPart === 'part-2' ? (
              <iframe
                style={videoFrameStyle}
                src="https://www.youtube.com/embed/TAbulpWy6gM?start=42"
                title="Super Metal Mons Intro Tutorial Video Part 2"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : null}
            {selectedPart === 'part-3' ? <p style={comingSoonStyle}>( coming soon )</p> : null}
          </div>
        </section>
      </div>
    </BlankSectionPage>
  );
}
