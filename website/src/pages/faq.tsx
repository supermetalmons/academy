import {Fragment, useEffect, useRef, useState} from 'react';
import type {CSSProperties, MouseEvent, ReactNode} from 'react';
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

type FaqPreviewImage = {
  src: string;
  alt: string;
};

const externalLinkProps = {
  target: '_blank',
  rel: 'noreferrer',
} as const;

const faqWrapStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.8rem',
  padding: '15px clamp(16px, 4.5vw, 50px)',
};

const faqItemStyle: CSSProperties = {
  margin: 0,
  color: '#000',
  fontSize: '1rem',
  lineHeight: 1.45,
};

const faqAnswerContinuationStyle: CSSProperties = {
  display: 'block',
  marginTop: '0.68rem',
  textIndent: 0,
};

const faqLearnParagraphStyle: CSSProperties = {
  ...faqAnswerContinuationStyle,
  display: 'flex',
  alignItems: 'flex-start',
  gap: 'calc(0.85rem + 50px)',
};

const faqLearnParagraphTextStyle: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
};

const faqLearnImageStyle: CSSProperties = {
  display: 'block',
  flex: '0 0 auto',
  width: 'clamp(88px, 16vw, 132px)',
  maxWidth: '34%',
  height: 'auto',
  objectFit: 'contain',
  imageRendering: 'auto',
  transform: 'translate(-0.32rem, -0.48rem)',
  cursor: 'zoom-in',
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
  cursor: 'pointer',
};

const faqGalleryImageStyle: CSSProperties = {
  display: 'block',
  width: 'auto',
  maxWidth: 'min(50%, 310px)',
  height: 'auto',
  margin: '0 auto',
  imageRendering: 'auto',
  objectFit: 'contain',
  cursor: 'zoom-in',
};

const faqPreviewOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  backdropFilter: 'blur(7px)',
  WebkitBackdropFilter: 'blur(7px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2.2rem 1.4rem',
  zIndex: 12050,
  cursor: 'zoom-out',
};

const faqPreviewPanelShellStyle: CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transformStyle: 'preserve-3d',
  transition: 'transform 130ms ease-out',
  willChange: 'transform',
};

const faqPreviewTiltRegionStyle: CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '15px',
};

const faqPreviewPanelStyle: CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'fit-content',
  height: 'fit-content',
  maxWidth: '92vw',
  maxHeight: '90vh',
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  border: '1px solid rgba(0, 0, 0, 0.18)',
  borderRadius: '14px',
  padding: '0.92rem',
  boxSizing: 'border-box',
  boxShadow: 'none',
  overflow: 'hidden',
  cursor: 'default',
};

const faqPreviewImageStyle: CSSProperties = {
  maxWidth: 'min(84vw, 1180px)',
  maxHeight: 'min(78vh, 780px)',
  width: 'auto',
  height: 'auto',
  objectFit: 'contain',
  objectPosition: 'center',
  imageRendering: 'auto',
  backgroundColor: 'transparent',
  borderRadius: '9px',
};

const faqPreviewLswImageStyle: CSSProperties = {
  ...faqPreviewImageStyle,
  width: 'min(78vw, 680px)',
  maxWidth: 'min(78vw, 680px)',
  maxHeight: 'min(78vh, 680px)',
};

const faqPreviewLswOmomImageStyle: CSSProperties = {
  ...faqPreviewImageStyle,
  maxWidth: 'min(70vw, 610px)',
  maxHeight: 'min(70vh, 610px)',
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

const FAQ_THIN_LAYOUT_BREAKPOINT_PX = 860;

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

const lswWideQuestionRowStyle: CSSProperties = {
  ...questionRowStyle,
  marginLeft:
    'calc(min(99px, 22.5vw) + min(75px, 18vw) + 0.55rem + 0.95rem)',
};

const wherePlayWideLayoutStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '0.95rem',
};

const wherePlayTextColumnStyle: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
};

const wherePlayImageBaseStyle: CSSProperties = {
  width: '120px',
  maxWidth: '21vw',
  height: 'auto',
  display: 'block',
  objectFit: 'contain',
  imageRendering: 'auto',
  flex: '0 0 auto',
  cursor: 'zoom-in',
};

const wherePlayImageStyle: CSSProperties = {
  ...wherePlayImageBaseStyle,
  transform: 'translate(-42px, -49px) scale(1.083333)',
  transformOrigin: 'top left',
};

const wherePlayTiltImageStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  maxWidth: '100%',
  height: 'auto',
  objectFit: 'contain',
  imageRendering: 'auto',
  transformOrigin: 'center center',
  transformStyle: 'preserve-3d',
  willChange: 'transform',
  cursor: 'zoom-in',
};

const wherePlayItemStyle: CSSProperties = {
  ...faqItemStyle,
  marginBottom: '-50px',
};

const wherePlayThinImageWrapStyle: CSSProperties = {
  display: 'flex',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '0.42rem',
};

const wherePlayThinImageStyle: CSSProperties = {
  ...wherePlayImageBaseStyle,
  maxWidth: 'min(56vw, 220px)',
  margin: '0 auto',
  transform: 'translateY(-3px)',
};

const lswWideLayoutStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '0.95rem',
};

const lswTextColumnStyle: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
};

const lswImageRowStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'flex-start',
  gap: '0.55rem',
  flex: '0 0 auto',
  marginLeft: 'auto',
};

const lswImageRowWideStyle: CSSProperties = {
  ...lswImageRowStyle,
  marginLeft: 0,
  transform: 'translateY(-15px)',
  marginBottom: 0,
};

const lswImageRowThinStyle: CSSProperties = {
  ...lswImageRowStyle,
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  transform: 'none',
  marginLeft: 0,
  marginBottom: '0.42rem',
};

const lswMainImageStyle: CSSProperties = {
  width: '99px',
  maxWidth: '22.5vw',
  height: 'auto',
  display: 'block',
  objectFit: 'contain',
  imageRendering: 'auto',
  transform: 'translateY(-20px)',
  cursor: 'zoom-in',
};

const lswMainImageWideStyle: CSSProperties = {
  ...lswMainImageStyle,
  transform: 'translateY(-20px)',
};

const lswOmomImageStyle: CSSProperties = {
  width: '75px',
  maxWidth: '18vw',
  height: 'auto',
  display: 'block',
  objectFit: 'contain',
  imageRendering: 'auto',
  cursor: 'zoom-in',
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
  cursor: 'zoom-in',
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
      <img
        src={imageSrc}
        alt=""
        aria-hidden="true"
        data-preview-alt={name}
        style={{...personAvatarStyle, ...imageStyle}}
      />
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
    question: "How do I play- you said it's like chess?",
    answer: (
      <>
        We say it&apos;s a chesslike and it takes a similar mindset, but it doesn&apos;t quite share any
        specific rules with chess. The game was more directly inspired by the ancient norse game
        Hnefatafl as well as Yu-Gi-Oh! Dungeon Dice Monsters, tho it&apos;s mostly its own thing!
        <span style={faqLearnParagraphStyle}>
          <span style={faqLearnParagraphTextStyle}>
            You can get started learning the Basic Rules over in our <a href="/instruction">Instruction Room</a>, or you
            could head straight to our <a href="/instruction/video-tutorial">Video Tutorials</a> to get a run down
            that way. Then head over to <a href="https://mons.link/" {...externalLinkProps}>mons.link</a> and there
            you can either go up against the bot for some initial real game practice or go through the tutorial
            puzzles there in the home menu.
          </span>
          <img src="/assets/learn.png" alt="Learn Super Metal Mons" style={faqLearnImageStyle} />
        </span>
      </>
    ),
  },
  {
    question: 'Do I need a crypto wallet to play?',
    answer: (
      <>
        No! The game is fully playable without signing in at all. You can play local or anon, and when
        you do want to sign in you can do so with Ethereum, Solana, or your Apple or Twitter (X)
        profile. An account allows you to build your profile to start climbing the elo leaderboard and
        mining daily rewards. If you do connect a wallet that holds certain nfts (
        <a href="https://www.tensor.trade/trade/swag_pack" {...externalLinkProps}>Swag Pack</a>,{' '}
        <a href="https://www.tensor.trade/trade/smm_4_year_anniversary_set" {...externalLinkProps}>SMM 4yr Anniversary Set!</a>) you can
        use it on the site to access some exclusive cosmetic content.
      </>
    ),
  },
  {
    question: "I've beaten the bot! How do I find a real game?",
    answer: (
      <>
        We have a small but dedicated pool of players in our Telegram. The best way to organize games or
        get pinged whenever anyone else is looking for a match is to{' '}
        <a href="https://t.me/supermetalmons" {...externalLinkProps}>join us there!</a> It&apos;s also a great
        place to get some pointers on how to play if you&apos;re just getting started. We periodically run
        Sunday play sessions and competitive events you can stay up to date on there or by following{' '}
        <a href="https://x.com/supermetalmons" {...externalLinkProps}>@supermetalmons</a>.
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
        Yes! Production is currently paused as our limited{' '}
        <a href="https://www.supermetalmons.com/" {...externalLinkProps}>Base Set Kits</a> have sold out,
        but once resumed they will be available at <a href="https://mons.shop/" {...externalLinkProps}>mons.shop</a>,
        which also hosts various related drops+products.
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
  const [wherePlayTilt, setWherePlayTilt] = useState({
    isActive: false,
    rotateX: 0,
    rotateY: 0,
  });
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window === 'undefined' ? Number.POSITIVE_INFINITY : window.innerWidth,
  );
  const [windowLabelScale, setWindowLabelScale] = useState(1);
  const [previewImage, setPreviewImage] = useState<FaqPreviewImage | null>(null);
  const [previewTilt, setPreviewTilt] = useState({rotateX: 0, rotateY: 0});
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

  useEffect(() => {
    if (!previewImage) {
      setPreviewTilt({rotateX: 0, rotateY: 0});
      return undefined;
    }
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setPreviewImage(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [previewImage]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const updateViewportWidth = (): void => {
      const next = window.innerWidth;
      setViewportWidth((current) => (current === next ? current : next));
    };
    updateViewportWidth();
    window.addEventListener('resize', updateViewportWidth);
    return () => {
      window.removeEventListener('resize', updateViewportWidth);
    };
  }, []);

  const faqWindowOverlayOffsetPx =
    isNavBelowRowMode && !isNavBelowButtonsWrapped ? 15 : 0;
  const isThinFaqLayout = isNavBelowRowMode || viewportWidth <= FAQ_THIN_LAYOUT_BREAKPOINT_PX;
  const whoMadeSiteEntryIndex = faqEntries.findIndex(
    (entry) => entry.question === 'Who made this site?',
  );
  const handleWherePlayTiltMove = (event: MouseEvent<HTMLImageElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    const xPercent = (event.clientX - rect.left) / rect.width;
    const yPercent = (event.clientY - rect.top) / rect.height;
    const maxTiltDegrees = 20;
    setWherePlayTilt({
      isActive: true,
      rotateX: (0.5 - yPercent) * maxTiltDegrees,
      rotateY: (xPercent - 0.5) * maxTiltDegrees,
    });
  };
  const resetWherePlayTilt = (): void => {
    setWherePlayTilt({
      isActive: false,
      rotateX: 0,
      rotateY: 0,
    });
  };
  const handleFaqImageClick = (event: MouseEvent<HTMLDivElement>): void => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) {
      return;
    }
    if (target.dataset.faqPreviewDisabled === 'true') {
      return;
    }
    if (target.closest('a')) {
      return;
    }
    const imageSrc = target.currentSrc || target.getAttribute('src');
    if (!imageSrc) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setPreviewImage({
      src: imageSrc,
      alt: target.alt || target.getAttribute('data-preview-alt') || 'FAQ image preview',
    });
  };
  const handlePreviewTiltMove = (event: MouseEvent<HTMLDivElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setPreviewTilt({
      rotateX: Number((-y * 8.6).toFixed(2)),
      rotateY: Number((x * 10.5).toFixed(2)),
    });
  };
  const getPreviewImageStyle = (src: string): CSSProperties => {
    if (src.includes('/assets/lsw.png')) {
      return faqPreviewLswImageStyle;
    }
    if (src.includes('/assets/ceramic/drainer-omom.png')) {
      return faqPreviewLswOmomImageStyle;
    }
    return faqPreviewImageStyle;
  };
  const wherePlayTiltedImageStyle: CSSProperties = {
    ...wherePlayTiltImageStyle,
    filter: wherePlayTilt.isActive
      ? 'drop-shadow(0 10px 12px rgba(0, 0, 0, 0.16)) brightness(1.025)'
      : 'drop-shadow(0 4px 5px rgba(0, 0, 0, 0.08))',
    transform: `rotateX(${wherePlayTilt.rotateX.toFixed(2)}deg) rotateY(${wherePlayTilt.rotateY.toFixed(2)}deg) translateZ(${wherePlayTilt.isActive ? 18 : 0}px)`,
    transition: wherePlayTilt.isActive
      ? 'transform 80ms ease-out, filter 160ms ease-out'
      : 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1), filter 220ms ease-out',
  };

  return (
    <BlankSectionPage title="FAQ">
      <div style={faqWrapStyle} onClick={handleFaqImageClick}>
        <img
          src="/assets/smmlogo.png"
          alt="Super Metal Mons logo"
          data-faq-preview-disabled="true"
          style={faqTopLogoStyle}
        />
        {faqEntries.map((entry, entryIndex) => {
          const shouldLiftWideEntry =
            !isThinFaqLayout && whoMadeSiteEntryIndex !== -1 && entryIndex >= whoMadeSiteEntryIndex;
          if (entry.question === 'What is Little Swag World?') {
            const lswImageRowNode = (
              <div
                style={isThinFaqLayout ? lswImageRowThinStyle : lswImageRowWideStyle}
                aria-hidden="true">
                <img
                  src="/assets/lsw.png"
                  alt=""
                  style={isThinFaqLayout ? lswMainImageStyle : lswMainImageWideStyle}
                />
                <img src="/assets/ceramic/drainer-omom.png" alt="" style={lswOmomImageStyle} />
              </div>
            );

            return (
              <div
                key={entry.question}
                style={
                  shouldLiftWideEntry
                    ? {...faqItemStyle, transform: 'translateY(-23px)'}
                    : faqItemStyle
                }>
                {isThinFaqLayout ? lswImageRowNode : null}
                <span style={isThinFaqLayout ? questionRowStyle : lswWideQuestionRowStyle}>
                  <span style={questionChevronStyle} aria-hidden="true">
                    ›
                  </span>
                  <b style={questionTextStyle}>{entry.question}</b>
                </span>
                {isThinFaqLayout ? (
                  entry.answer
                ) : (
                  <div style={lswWideLayoutStyle}>
                    {lswImageRowNode}
                    <span style={lswTextColumnStyle}>{entry.answer}</span>
                  </div>
                )}
              </div>
            );
          }

          if (entry.question === 'Where can I play?') {
            return (
              <div
                key={entry.question}
                style={
                  shouldLiftWideEntry
                    ? {...wherePlayItemStyle, transform: 'translateY(-23px)'}
                    : isThinFaqLayout
                      ? faqItemStyle
                      : wherePlayItemStyle
                }>
                <span style={questionRowStyle}>
                  <span style={questionChevronStyle} aria-hidden="true">
                    ›
                  </span>
                  <b style={questionTextStyle}>{entry.question}</b>
                </span>
                {isThinFaqLayout ? (
                  <>
                    {entry.answer}
                    <div style={wherePlayThinImageWrapStyle}>
                      <img src="/assets/id.png" alt="" aria-hidden="true" style={wherePlayThinImageStyle} />
                    </div>
                  </>
                ) : (
                  <div style={wherePlayWideLayoutStyle}>
                    <span style={wherePlayTextColumnStyle}>{entry.answer}</span>
                    <span style={{...wherePlayImageStyle, perspective: '620px'}} aria-hidden="true">
                      <img
                        src="/assets/id.png"
                        alt=""
                        draggable={false}
                        style={wherePlayTiltedImageStyle}
                        onMouseMove={handleWherePlayTiltMove}
                        onMouseEnter={handleWherePlayTiltMove}
                        onMouseLeave={resetWherePlayTilt}
                        onBlur={resetWherePlayTilt}
                      />
                    </span>
                  </div>
                )}
              </div>
            );
          }

          const defaultEntryNode = (
            <p
              key={entry.question}
              style={
                shouldLiftWideEntry
                  ? {...faqItemStyle, transform: 'translateY(-23px)'}
                  : faqItemStyle
              }>
              <span style={questionRowStyle}>
                <span style={questionChevronStyle} aria-hidden="true">
                  ›
                </span>
                <b style={questionTextStyle}>{entry.question}</b>
              </span>
              {entry.answer}
            </p>
          );

          if (entry.question === 'Is the game still in development?') {
            return (
              <Fragment key={`${entry.question}-with-gallery`}>
                {defaultEntryNode}
                <img
                  src="/assets/gallery/other-pics/001.jpg"
                  alt="Super Metal Mons gallery"
                  style={faqGalleryImageStyle}
                />
              </Fragment>
            );
          }

          return defaultEntryNode;
        })}
        <div
          style={
            isThinFaqLayout
              ? faqWindowLinkWrapStyle
              : {...faqWindowLinkWrapStyle, transform: 'translateY(-23px)'}
          }>
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
      {previewImage ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="FAQ image preview"
          style={faqPreviewOverlayStyle}
          onClick={() => setPreviewImage(null)}>
          <div
            style={faqPreviewTiltRegionStyle}
            onClick={(event) => event.stopPropagation()}
            onMouseMove={handlePreviewTiltMove}
            onMouseLeave={() => setPreviewTilt({rotateX: 0, rotateY: 0})}>
            <div
              style={{
                ...faqPreviewPanelShellStyle,
                transform: `perspective(1500px) rotateX(${previewTilt.rotateX}deg) rotateY(${previewTilt.rotateY}deg)`,
              }}>
              <div style={faqPreviewPanelStyle}>
                <img
                  src={previewImage.src}
                  alt={previewImage.alt}
                  style={getPreviewImageStyle(previewImage.src)}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </BlankSectionPage>
  );
}
