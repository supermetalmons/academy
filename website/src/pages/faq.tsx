import {useEffect, useRef, useState} from 'react';
import type {CSSProperties, ReactNode} from 'react';
import BlankSectionPage from '@site/src/components/BlankSectionPage';

type FaqEntry = {
  question: string;
  answer: ReactNode;
};

type PersonLinkProps = {
  href: string;
  imageSrc: string;
  name: string;
  imageStyle?: CSSProperties;
};

const externalLinkProps = {
  target: '_blank',
  rel: 'noreferrer',
} as const;

const faqWrapStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.8rem',
  padding: '15px 50px',
};

const faqItemStyle: CSSProperties = {
  margin: 0,
  color: '#000',
  fontSize: '1rem',
  lineHeight: 1.45,
};

const faqTopLogoStyle: CSSProperties = {
  display: 'block',
  width: 'auto',
  maxWidth: 'min(100%, 620px)',
  height: 'auto',
  margin: 'calc(-0.1rem - 55px) auto -0.95rem',
  imageRendering: 'auto',
  objectFit: 'contain',
};

const faqWindowImageStyle: CSSProperties = {
  display: 'block',
  width: 'auto',
  maxWidth: 'min(100%, 620px)',
  height: 'auto',
  margin: '0 auto',
  imageRendering: 'auto',
  objectFit: 'contain',
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden',
};

const faqWindowLinkWrapStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  marginTop: '0.4rem',
};

const faqWindowLinkStyle: CSSProperties = {
  position: 'relative',
  display: 'inline-block',
  lineHeight: 0,
  textDecoration: 'none',
  transform: 'translateY(0) scale(1)',
  transition: 'transform 180ms ease, filter 180ms ease',
};

const faqWindowLinkHoverStyle: CSSProperties = {
  transform: 'translateY(-3px) scale(1.022)',
  filter: 'brightness(1.02)',
};

const faqWindowLinkLabelOverlayStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  opacity: 0,
  pointerEvents: 'none',
  transition: 'opacity 190ms ease',
};

const faqWindowLinkBlurRegionStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  height: '44%',
  minHeight: '110px',
  maxHeight: '240px',
  maxWidth: '620px',
  background:
    'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.97) 0%, rgba(255, 255, 255, 0.92) 38%, rgba(255, 255, 255, 0.72) 58%, rgba(255, 255, 255, 0.46) 72%, rgba(255, 255, 255, 0) 100%)',
  borderRadius: '999px',
  filter: 'blur(14px)',
};

const faqWindowLinkLabelTextStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  zIndex: 1,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'calc(0.5rem + 3px)',
  color: '#0000ee',
  fontSize: 'clamp(2.45rem, 5.8vw, 3.4rem)',
  fontWeight: 700,
  fontFamily: 'Arial, Helvetica, sans-serif',
  lineHeight: 1,
  letterSpacing: '0.02em',
  whiteSpace: 'nowrap',
  textShadow: '0 1px 0 rgba(255, 255, 255, 0.72)',
  transformOrigin: 'center center',
  transition: 'transform 180ms ease',
};

const faqWindowRockIconStyle: CSSProperties = {
  width: '0.98em',
  height: '0.98em',
  objectFit: 'contain',
  borderRadius: '999px',
  imageRendering: 'auto',
  transform: 'translateY(0.02em)',
  filter: 'saturate(0.9) contrast(0.95)',
};

const faqWindowLinkLabelOverlayVisibleStyle: CSSProperties = {
  opacity: 1,
};

const questionRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  marginBottom: '0.42rem',
};

const questionChevronStyle: CSSProperties = {
  fontSize: '0.98rem',
  lineHeight: 1,
  transform: 'translateY(-0.01rem)',
};

const questionTextStyle: CSSProperties = {
  fontSize: '1.06rem',
  lineHeight: 1.2,
};

const personLinkWrapStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'baseline',
  gap: '0.38rem',
  margin: '0 0.08rem',
  whiteSpace: 'nowrap',
  verticalAlign: 'baseline',
};

const personAvatarStyle: CSSProperties = {
  width: '1.28rem',
  height: '1.28rem',
  borderRadius: '999px',
  objectFit: 'cover',
  objectPosition: 'center',
  display: 'inline-block',
  transform: 'translateY(3px) translateZ(0)',
  imageRendering: 'auto',
  filter: 'saturate(1.04) contrast(1.04)',
};

const meinongAvatarStyle: CSSProperties = {
  filter: 'brightness(1.2) saturate(1.06) contrast(1.03)',
};

const personLinkTextStyle: CSSProperties = {
  lineHeight: 'inherit',
  position: 'relative',
  top: '-1px',
};

const leadingPersonInsetStyle: CSSProperties = {
  marginLeft: '0.45rem',
};

function PersonLink({href, imageSrc, name, imageStyle}: PersonLinkProps): ReactNode {
  return (
    <span style={personLinkWrapStyle}>
      <img src={imageSrc} alt="" aria-hidden="true" style={{...personAvatarStyle, ...imageStyle}} />
      <a href={href} {...externalLinkProps} style={personLinkTextStyle}>
        {name}
      </a>
    </span>
  );
}

const faqEntries: FaqEntry[] = [
  {
    question: 'What is Super Metal Mons?',
    answer: (
      <>
        Super Metal Mons (SMM) is an abstract strategy game of perfect information (a bit like chess)
        featuring an assortment of collectable monsters, originally launched via two generations of NFT collections on
        Ethereum created by
        <span style={leadingPersonInsetStyle}>
          <PersonLink href="https://x.com/supermetalx" imageSrc="/assets/bosch.jpg" name="Supermetal Bosch" />
        </span>
        .
      </>
    ),
  },
  {
    question: 'Who made the Super Metal Mons game?',
    answer: (
      <>
        Bosch designed the board game together with his brother,{' '}
        <PersonLink href="https://x.com/turtletimezone" imageSrc="/assets/turtle.png" name="Turtle" />, and{' '}
        <PersonLink href="https://x.com/ivangrachyov" imageSrc="/assets/ivan.jpg" name="Ivan Grachyov" /> is the developer of mons.link.
      </>
    ),
  },
  {
    question: 'Where can I play?',
    answer: (
      <>
        <a href="https://mons.link/" {...externalLinkProps}>mons.link</a>!
      </>
    ),
  },
  {
    question: 'Do I need a crypto wallet to play?',
    answer: (
      <>
        No! The game is fully playable without connecting anything. You can play local or anon, but when
        you sign in with ETH, Solana, or your Apple or Twitter accounts you can build your profile to start
        climbing the elo leaderboard and mining daily rewards. If you do connect a wallet that holds certain
        nfts (
        <a href="https://www.tensor.trade/trade/swag_pack" {...externalLinkProps}>Swag Pack</a>,{' '}
        <a href="https://www.tensor.trade/trade/smm_4_year_anniversary_set" {...externalLinkProps}>SMM 4yr Anniversary Set!</a>) you can
        use it on the site to access some exclusive cosmetic content.
      </>
    ),
  },
  {
    question: "I'm sitting in the automatch queue, but nothing is happening- what gives?",
    answer: (
      <>
        We have a small but dedicated pool of players in our Telegram. The best way to organize games or
        get pinged whenever anyone else is looking for a match is to{' '}
        <a href="https://t.me/supermetalmons" {...externalLinkProps}>join us there!</a> It&apos;s also a great
        place to get some pointers on how to play if you&apos;re just getting started.
      </>
    ),
  },
  {
    question: 'Is the game still in development?',
    answer: (
      <>
        The foundations of SMM are complete, but the current mon types (Drainer, Angel, Spirit, Mystic,
        and Demon) and items (Bomb and Potion) comprise only &quot;Base Set 1&quot;. New pieces with unique
        abilities will be rolled out over time, giving players the option to customize their team loadout
        to their own personal playstyle. + there are many additional features planned for mons.link so stay
        tuned!
      </>
    ),
  },
  {
    question: 'Is there a physical version of the game?',
    answer: (
      <>
        Yes! Production is currently paused, but once resumed they will be available{' '}
        <a href="https://www.supermetalmons.com/collections/all/" {...externalLinkProps}>here</a>.
      </>
    ),
  },
  {
    question: 'What is Little Swag World?',
    answer: (
      <>
        <a href="https://littleswag.world/" {...externalLinkProps}>Little Swag World</a> is another NFT collection created by
        Bosch. They&apos;re kind of like the trainers of metal mons.
      </>
    ),
  },
  {
    question: 'Who made this site?',
    answer: (
      <>
        The Academy is headed by{' '}
        <PersonLink
          href="https://x.com/urmeinong"
          imageSrc="/assets/meinong.jpg"
          name="Meinong"
          imageStyle={meinongAvatarStyle}
        />
        . I assist with art and
        design and community stuff for SMM.
      </>
    ),
  },
  {
    question: 'What is Super Metal Mons, again?',
    answer: (
      <>
        You won&apos;t <i>really</i> know until you try! So... let&apos;s play!
      </>
    ),
  },
];

export default function FaqPage(): ReactNode {
  const [isWindowHovered, setIsWindowHovered] = useState(false);
  const [isNavBelowRowMode, setIsNavBelowRowMode] = useState(false);
  const [isNavBelowButtonsWrapped, setIsNavBelowButtonsWrapped] = useState(false);
  const [windowLabelScale, setWindowLabelScale] = useState(1);
  const windowLinkRef = useRef<HTMLAnchorElement | null>(null);
  const windowLabelRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const linkNode = windowLinkRef.current;
    const labelNode = windowLabelRef.current;
    if (!linkNode || !labelNode) {
      return;
    }

    const horizontalSafetyPadding = 26;
    let frameId = 0;

    const updateScale = (): void => {
      frameId = 0;
      const availableWidth = Math.max(80, linkNode.clientWidth - horizontalSafetyPadding);
      const naturalLabelWidth = Math.max(1, Math.ceil(labelNode.scrollWidth));
      const nextScale = Math.min(1, availableWidth / naturalLabelWidth);
      setWindowLabelScale((current) => {
        if (Math.abs(current - nextScale) < 0.01) {
          return current;
        }
        return nextScale;
      });
    };

    const scheduleScaleUpdate = (): void => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      frameId = window.requestAnimationFrame(updateScale);
    };

    scheduleScaleUpdate();
    window.addEventListener('resize', scheduleScaleUpdate);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        scheduleScaleUpdate();
      });
      resizeObserver.observe(linkNode);
    }

    return () => {
      window.removeEventListener('resize', scheduleScaleUpdate);
      resizeObserver?.disconnect();
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [isWindowHovered]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let frameId = 0;
    let observer: MutationObserver | null = null;

    const updateNavBelowRowMode = (): void => {
      const shellNode = window.document.querySelector('.mons-shell');
      const nextMode =
        shellNode instanceof HTMLElement &&
        shellNode.classList.contains('mons-shell--nav-below');
      setIsNavBelowRowMode((current) => (current === nextMode ? current : nextMode));

      let nextWrapped = false;
      if (nextMode && shellNode instanceof HTMLElement) {
        const navNode = shellNode.querySelector('nav[aria-label="Primary navigation"]');
        if (navNode instanceof HTMLElement) {
          const navItems = Array.from(navNode.children).filter(
            (child): child is HTMLElement => child instanceof HTMLElement,
          );
          const navRowCount = new Set(navItems.map((item) => item.offsetTop)).size;
          nextWrapped = navRowCount >= 2;
        }
      }
      setIsNavBelowButtonsWrapped((current) => (current === nextWrapped ? current : nextWrapped));
    };

    const scheduleUpdate = (): void => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateNavBelowRowMode();
      });
    };

    scheduleUpdate();
    window.addEventListener('resize', scheduleUpdate);

    const shellNode = window.document.querySelector('.mons-shell');
    if (shellNode instanceof HTMLElement && typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(() => {
        scheduleUpdate();
      });
      observer.observe(shellNode, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }

    return () => {
      window.removeEventListener('resize', scheduleUpdate);
      observer?.disconnect();
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  const faqWindowOverlayOffsetPx =
    isNavBelowRowMode && !isNavBelowButtonsWrapped ? 15 : 0;

  return (
    <BlankSectionPage title="FAQ">
      <div style={faqWrapStyle}>
        <img src="/assets/smmlogo.png" alt="Super Metal Mons logo" style={faqTopLogoStyle} />
        {faqEntries.map((entry) => (
          <p key={entry.question} style={faqItemStyle}>
            <span style={questionRowStyle}>
              <span style={questionChevronStyle} aria-hidden="true">
                ›
              </span>
              <b style={questionTextStyle}>{entry.question}</b>
            </span>
            {entry.answer}
          </p>
        ))}
        <div style={faqWindowLinkWrapStyle}>
          <a
            ref={windowLinkRef}
            href="https://mons.link/"
            {...externalLinkProps}
            style={{
              ...faqWindowLinkStyle,
              ...(isWindowHovered ? faqWindowLinkHoverStyle : undefined),
            }}
            onMouseEnter={() => setIsWindowHovered(true)}
            onMouseLeave={() => setIsWindowHovered(false)}
            onFocus={() => setIsWindowHovered(true)}
            onBlur={() => setIsWindowHovered(false)}
            aria-label="Visit mons.link">
            <img src="/assets/window.jpg" alt="Visit mons.link" style={faqWindowImageStyle} />
              <span
                style={{
                  ...faqWindowLinkLabelOverlayStyle,
                  ...(isWindowHovered ? faqWindowLinkLabelOverlayVisibleStyle : undefined),
                }}>
              <span
                style={{
                  ...faqWindowLinkBlurRegionStyle,
                  transform: `translate(calc(-50% - ${faqWindowOverlayOffsetPx}px), -50%)`,
                }}
              />
              <span
                ref={windowLabelRef}
                style={{
                  ...faqWindowLinkLabelTextStyle,
                  transform: `translate(calc(-50% - ${faqWindowOverlayOffsetPx}px), -50%) scale(${windowLabelScale})`,
                }}>
                <img src="/assets/mons-rock-icon.svg" alt="" aria-hidden="true" style={faqWindowRockIconStyle} />
                <span>mons.link</span>
              </span>
            </span>
          </a>
        </div>
      </div>
    </BlankSectionPage>
  );
}
