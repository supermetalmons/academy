import type {CSSProperties, ReactNode} from 'react';
import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import Link from '@docusaurus/Link';

type NewTopLayoutProps = {
  children?: ReactNode;
};

type TitleIconKey = 'mons' | 'x' | 'discord' | 'telegram';
type CloudShadow = {
  top: number;
  width: number;
  height: number;
  opacity: number;
  duration: number;
  delay: number;
};

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  margin: 0,
  position: 'relative',
  isolation: 'isolate',
  backgroundColor: '#fff',
  backgroundImage: 'url("/assets/grass.png")',
  backgroundRepeat: 'repeat',
  backgroundPosition: 'top left',
  backgroundAttachment: 'fixed',
  imageRendering: 'pixelated',
};

const headerBarStyle: CSSProperties = {
  width: '100%',
  backgroundColor: '#fff',
  borderBottom: '1px solid #000',
  position: 'sticky',
  top: 0,
  zIndex: 9999,
};

const headerRowStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'flex-start',
};

const logoLinkStyle: CSSProperties = {
  flex: '0 0 auto',
  alignSelf: 'flex-start',
  display: 'block',
  borderRight: '1px solid #000',
  overflow: 'hidden',
};

const logoImageStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
  imageRendering: 'auto',
  transform: 'translateZ(0)',
};

const headerInnerStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  margin: 0,
  padding: '0.55rem 1rem',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
};

const homeLinkStyle: CSSProperties = {
  textDecoration: 'none',
};

const titleBlockStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '0.2rem',
  minWidth: 0,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: '2.2rem',
  lineHeight: 1.05,
  color: '#000',
  fontWeight: 700,
};

const titleIconRowStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.56rem',
  color: '#000',
};

const titleIconLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  color: 'inherit',
  textDecoration: 'none',
  lineHeight: 0,
  transition: 'transform 180ms ease, filter 180ms ease',
  transformOrigin: 'center',
  willChange: 'transform',
};

const titleIconLinkHoverStyle: CSSProperties = {
  transform: 'translateY(-1px) scale(1.12)',
  filter: 'brightness(1.04)',
};

const titleIconStyle: CSSProperties = {
  width: '16.5px',
  height: '16.5px',
  display: 'block',
};

const titleDiscordIconStyle: CSSProperties = {
  ...titleIconStyle,
  width: '15.4px',
  transform: 'translateY(0.5px)',
};

const titleRockIconStyle: CSSProperties = {
  width: '16.5px',
  height: '16.5px',
  display: 'block',
  objectFit: 'contain',
  imageRendering: 'auto',
  borderRadius: '999px',
  filter: 'saturate(0.84) contrast(0.92) blur(0.14px)',
};

const navStyle: CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
};

const buttonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  border: '1px solid #000',
  borderRadius: 0,
  backgroundColor: '#fff',
  color: '#000',
  textDecoration: 'none',
  padding: '0.27rem 0.72rem',
  fontSize: '1.05rem',
  lineHeight: 1.1,
  transition: 'transform 140ms ease, filter 140ms ease',
};

const activeButtonStyle: CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#000',
  color: '#fff',
};

const pressedButtonStyle: CSSProperties = {
  transform: 'translateY(1px) scale(0.96)',
  filter: 'brightness(0.87)',
};

const swirlStyle: CSSProperties = {
  position: 'fixed',
  right: '0.9rem',
  bottom: '0.9rem',
  fontSize: '1.1rem',
  lineHeight: 1,
  textDecoration: 'none',
};

const foregroundLayerStyle: CSSProperties = {
  position: 'relative',
  zIndex: 2,
};

const menuItems = [
  {label: 'Instruction', to: '/instruction'},
  {label: 'Puzzles', to: '/puzzles'},
  {label: 'Resources', to: '/resources'},
  {label: 'FAQ', to: '/faq'},
];
const LOGO_RESTORE_HYSTERESIS_PX = 72;
const CLOUD_INTRO_SESSION_KEY = 'mons_cloud_intro_seen_v1';
const CLOUD_SPEED_SCALE = 3.25;
const CLOUD_WAVE_PX = 34;
const CLOUD_LOBE_COUNT = 6;
const CLOUD_SHADOWS: CloudShadow[] = [
  {top: 8, width: 320, height: 106, opacity: 0.08, duration: 24.6, delay: 2.1},
  {top: 17, width: 270, height: 92, opacity: 0.07, duration: 20.8, delay: 11.4},
  {top: 26, width: 420, height: 136, opacity: 0.09, duration: 27.9, delay: 18.8},
  {top: 32, width: 300, height: 120, opacity: 0.08, duration: 23.7, delay: 9.6},
  {top: 39, width: 300, height: 102, opacity: 0.07, duration: 22.5, delay: 6.2},
  {top: 52, width: 450, height: 148, opacity: 0.1, duration: 30.4, delay: 26.7},
  {top: 58, width: 360, height: 124, opacity: 0.08, duration: 24.3, delay: 28.9},
  {top: 64, width: 280, height: 96, opacity: 0.07, duration: 21.3, delay: 34.1},
  {top: 75, width: 390, height: 128, opacity: 0.09, duration: 26.8, delay: 15.3},
  {top: 86, width: 340, height: 114, opacity: 0.08, duration: 24.2, delay: 41.8},
  {top: 95, width: 250, height: 84, opacity: 0.06, duration: 19.6, delay: 30.5},
];

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function getCloudShadowStyle(
  shadow: CloudShadow,
  index: number,
  animationClockSeconds: number,
): CSSProperties {
  const seed = (shadow.top + 19) * (index + 5);
  const widthVariance = Math.round(((Math.sin(seed * 0.06) + 1) * 0.5) * 168);
  const heightVariance = Math.round(((Math.cos(seed * 0.08) + 1) * 0.5) * 132);
  const sizeScale = 1 + ((Math.sin(seed * 0.051) + 1) * 0.5) * 1.02;
  const blurPx = Math.round(10 + ((Math.cos(seed * 0.11) + 1) * 0.5) * 14);
  const startDelay = Number((shadow.delay + ((Math.sin(seed * 0.043) + 1) * 0.5) * 22).toFixed(2));
  const phaseOffset = Number((startDelay + index * 3.7).toFixed(2));
  const roundA = Math.round(28 + ((Math.sin(seed * 0.07) + 1) * 0.5) * 52);
  const roundB = Math.round(30 + ((Math.cos(seed * 0.09) + 1) * 0.5) * 48);
  const roundC = Math.round(24 + ((Math.sin(seed * 0.11 + 0.6) + 1) * 0.5) * 56);
  const roundD = Math.round(32 + ((Math.cos(seed * 0.05 + 1.3) + 1) * 0.5) * 44);
  const roundV1 = Math.round(34 + ((Math.cos(seed * 0.12) + 1) * 0.5) * 40);
  const roundV2 = Math.round(26 + ((Math.sin(seed * 0.1 + 0.4) + 1) * 0.5) * 52);
  const roundV3 = Math.round(30 + ((Math.cos(seed * 0.08 + 1.1) + 1) * 0.5) * 46);
  const roundV4 = Math.round(28 + ((Math.sin(seed * 0.06 + 2.1) + 1) * 0.5) * 48);
  const wave1 = Math.round(Math.sin(seed * 0.21) * CLOUD_WAVE_PX);
  const wave2 = Math.round(Math.cos(seed * 0.16) * CLOUD_WAVE_PX);
  const wave3 = Math.round(Math.sin(seed * 0.13 + 1.2) * CLOUD_WAVE_PX);
  const wave4 = Math.round(Math.cos(seed * 0.09 + 0.8) * CLOUD_WAVE_PX);
  const wave5 = Math.round(Math.sin(seed * 0.19 + 2.4) * CLOUD_WAVE_PX);
  const scaleMid = (0.94 + ((Math.sin(seed * 0.15) + 1) * 0.5) * 0.2).toFixed(3);
  const scaleEnd = (0.95 + ((Math.cos(seed * 0.13) + 1) * 0.5) * 0.16).toFixed(3);
  const rotation = `${(Math.sin(seed * 0.12) * 2.6).toFixed(2)}deg`;
  const baseOpacity = Math.min(0.36, shadow.opacity + 0.16);
  const pulseMidOpacity = Math.max(
    0.14,
    baseOpacity * (0.82 + ((Math.sin(seed * 0.18) + 1) * 0.5) * 0.14),
  );
  const pulseLowOpacity = Math.max(
    0.12,
    baseOpacity * (0.68 + ((Math.cos(seed * 0.22) + 1) * 0.5) * 0.16),
  );
  const flowSpeedJitter = 0.62 + ((Math.sin(seed * 0.047) + 1) * 0.5) * 1.12;
  const flowDuration = shadow.duration * CLOUD_SPEED_SCALE * flowSpeedJitter;
  const pulseDuration = 38 + ((Math.cos(seed * 0.053) + 1) * 0.5) * 74;
  const pulsePhaseSeed = Number((phaseOffset * 0.73 + (index + 1) * 2.9).toFixed(2));
  const flowElapsed = positiveModulo(animationClockSeconds + phaseOffset, flowDuration);
  const pulseElapsed = positiveModulo(animationClockSeconds * 0.91 + pulsePhaseSeed, pulseDuration);
  return {
    top: `${shadow.top}%`,
    width: `${Math.round((shadow.width + widthVariance) * sizeScale)}px`,
    height: `${Math.round((shadow.height + heightVariance) * (0.85 + sizeScale * 0.55))}px`,
    opacity: baseOpacity,
    animationDuration: `${flowDuration.toFixed(2)}s, ${pulseDuration.toFixed(2)}s`,
    animationDelay: `-${flowElapsed.toFixed(2)}s, -${pulseElapsed.toFixed(2)}s`,
    ['--cloud-blur' as any]: `${blurPx}px`,
    ['--cloud-blob-radius' as any]: `${roundA}% ${roundB}% ${roundC}% ${roundD}% / ${roundV1}% ${roundV2}% ${roundV3}% ${roundV4}%`,
    ['--cloud-opacity-high' as any]: baseOpacity.toFixed(3),
    ['--cloud-opacity-mid' as any]: pulseMidOpacity.toFixed(3),
    ['--cloud-opacity-low' as any]: pulseLowOpacity.toFixed(3),
    ['--cloud-y1' as any]: `${wave1}px`,
    ['--cloud-y2' as any]: `${wave2}px`,
    ['--cloud-y3' as any]: `${wave3}px`,
    ['--cloud-y4' as any]: `${wave4}px`,
    ['--cloud-y5' as any]: `${wave5}px`,
    ['--cloud-scale-mid' as any]: scaleMid,
    ['--cloud-scale-end' as any]: scaleEnd,
    ['--cloud-rot' as any]: rotation,
  };
}

function getCloudLobeStyle(shadow: CloudShadow, cloudIndex: number, lobeIndex: number): CSSProperties {
  const seed = (shadow.top + 23) * (cloudIndex + 11) * (lobeIndex + 3);
  const baseLeft = [12, 28, 44, 60, 76, 42][lobeIndex] ?? 50;
  const baseTop = [56, 42, 48, 40, 54, 28][lobeIndex] ?? 50;
  const leftJitter = Math.sin(seed * 0.17) * 7;
  const topJitter = Math.cos(seed * 0.13) * 12;
  const widthPct = 28 + ((Math.sin(seed * 0.09) + 1) * 0.5) * 40;
  const heightPct = 18 + ((Math.cos(seed * 0.11) + 1) * 0.5) * 68;
  const lobeOpacity = (0.34 + ((Math.sin(seed * 0.19) + 1) * 0.5) * 0.22).toFixed(2);
  const rotate = `${(Math.cos(seed * 0.15) * 14).toFixed(2)}deg`;
  const radA = Math.round(36 + ((Math.sin(seed * 0.07) + 1) * 0.5) * 48);
  const radB = Math.round(28 + ((Math.cos(seed * 0.1) + 1) * 0.5) * 52);
  const radC = Math.round(34 + ((Math.sin(seed * 0.08 + 0.8) + 1) * 0.5) * 44);
  const radD = Math.round(30 + ((Math.cos(seed * 0.12 + 0.6) + 1) * 0.5) * 50);
  return {
    left: `${baseLeft + leftJitter}%`,
    top: `${baseTop + topJitter}%`,
    width: `${widthPct}%`,
    height: `${heightPct}%`,
    opacity: Number(lobeOpacity),
    transform: `translate(-50%, -50%) rotate(${rotate})`,
    borderRadius: `${radA}% ${radB}% ${radC}% ${radD}% / ${radC}% ${radA}% ${radD}% ${radB}%`,
  };
}

function isMenuItemActive(pathname: string, to: string): boolean {
  if (to === '/instruction') {
    return (
      pathname === '/instruction' ||
      pathname.startsWith('/instruction/') ||
      pathname === '/piece-details'
    );
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

function isInstructionContext(pathname: string): boolean {
  return (
    pathname === '/instruction' || pathname.startsWith('/instruction/') || pathname === '/piece-details'
  );
}

export default function NewTopLayout({children}: NewTopLayoutProps): ReactNode {
  const pathname = typeof window === 'undefined' ? '' : window.location.pathname;
  const logoSrc = isInstructionContext(pathname) ? '/assets/kingmon72.jpg' : '/assets/logoimage.jpg';
  const animationClockSecondsRef = useRef<number>(
    typeof window === 'undefined' ? 0 : Date.now() / 1000,
  );
  const animationClockSeconds = animationClockSecondsRef.current;
  const [showCloudIntro] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return true;
    }
    try {
      return window.sessionStorage.getItem(CLOUD_INTRO_SESSION_KEY) !== '1';
    } catch {
      return true;
    }
  });
  const [pressedItem, setPressedItem] = useState<string | null>(null);
  const [hoveredTitleIcon, setHoveredTitleIcon] = useState<TitleIconKey | null>(null);
  const headerRowRef = useRef<HTMLDivElement | null>(null);
  const headerInnerRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const logoHideBreakpointWidthRef = useRef<number | null>(null);
  const [logoSizePx, setLogoSizePx] = useState(54);
  const [hideLogoForSpace, setHideLogoForSpace] = useState(false);

  useEffect(() => {
    setPressedItem(null);
  }, [pathname]);

  useEffect(() => {
    if (!showCloudIntro || typeof window === 'undefined') {
      return;
    }
    try {
      window.sessionStorage.setItem(CLOUD_INTRO_SESSION_KEY, '1');
    } catch {
      // Ignore storage failures; intro will replay.
    }
  }, [showCloudIntro]);

  useLayoutEffect(() => {
    const innerNode = headerInnerRef.current;
    if (innerNode === null) {
      return;
    }

    const updateLogoSize = () => {
      const nextSize = Math.max(32, Math.ceil(innerNode.clientHeight));
      setLogoSizePx((current) => (current === nextSize ? current : nextSize));
    };

    updateLogoSize();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        updateLogoSize();
      });
      observer.observe(innerNode);
      return () => {
        observer.disconnect();
      };
    }

    window.addEventListener('resize', updateLogoSize);
    return () => {
      window.removeEventListener('resize', updateLogoSize);
    };
  }, []);

  useLayoutEffect(() => {
    const rowNode = headerRowRef.current;
    const navNode = navRef.current;
    if (rowNode === null || navNode === null) {
      return;
    }

    const updateLogoVisibility = () => {
      const navItems = Array.from(navNode.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement,
      );
      const navRowCount = new Set(navItems.map((item) => item.offsetTop)).size;
      const hasFourStackedRows = navRowCount >= 4;

      const rowRect = rowNode.getBoundingClientRect();
      const navRect = navNode.getBoundingClientRect();
      const overflowRight = navRect.right > rowRect.right + 1;
      const rowOverflow = rowNode.scrollWidth > rowNode.clientWidth + 1;
      const shouldHideNow = hasFourStackedRows && (overflowRight || rowOverflow);

      setHideLogoForSpace((current) => {
        if (!current) {
          if (shouldHideNow) {
            logoHideBreakpointWidthRef.current = window.innerWidth;
            return true;
          }
          return false;
        }

        if (shouldHideNow) {
          return true;
        }

        const hideWidth = logoHideBreakpointWidthRef.current ?? window.innerWidth;
        const restoreThreshold = hideWidth + LOGO_RESTORE_HYSTERESIS_PX;
        if (window.innerWidth >= restoreThreshold) {
          logoHideBreakpointWidthRef.current = null;
          return false;
        }
        return true;
      });
    };

    updateLogoVisibility();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        updateLogoVisibility();
      });
      observer.observe(rowNode);
      observer.observe(navNode);
      return () => {
        observer.disconnect();
      };
    }

    window.addEventListener('resize', updateLogoVisibility);
    return () => {
      window.removeEventListener('resize', updateLogoVisibility);
    };
  }, []);

  const dynamicLogoLinkStyle: CSSProperties = {
    ...logoLinkStyle,
    width: `${logoSizePx}px`,
    height: `${logoSizePx}px`,
  };
  const dynamicLogoImageStyle: CSSProperties = {
    ...logoImageStyle,
    filter: logoSizePx <= 44 ? 'blur(0.18px) saturate(0.96)' : 'none',
  };

  return (
    <main style={pageStyle} className="mons-shell">
      <div className={`cloud-shadows${showCloudIntro ? ' cloud-shadows--intro' : ''}`} aria-hidden="true">
        {CLOUD_SHADOWS.map((shadow, index) => (
          <span
            key={`${shadow.top}-${index}`}
            className="cloud-shadows__blob"
            style={getCloudShadowStyle(shadow, index, animationClockSeconds)}>
            {Array.from({length: CLOUD_LOBE_COUNT}).map((_, lobeIndex) => (
              <span
                key={`${shadow.top}-${index}-${lobeIndex}`}
                className="cloud-shadows__lobe"
                style={getCloudLobeStyle(shadow, index, lobeIndex)}
              />
            ))}
          </span>
        ))}
      </div>
      <div style={foregroundLayerStyle}>
        <header style={headerBarStyle}>
          <div ref={headerRowRef} style={headerRowStyle}>
            {!hideLogoForSpace ? (
              <Link to="/" aria-label="Go to home page" style={dynamicLogoLinkStyle}>
                <img src={logoSrc} alt="" style={dynamicLogoImageStyle} />
              </Link>
            ) : null}
            <div ref={headerInnerRef} style={headerInnerStyle}>
              <div style={titleBlockStyle}>
                <Link to="/" style={homeLinkStyle}>
                  <h1 style={titleStyle}>❀ Mons Academy ⋆⋆⋆</h1>
                </Link>
                <div style={titleIconRowStyle} aria-label="Platform icons">
                  <a
                    href="https://mons.link/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Mons Link"
                    style={{
                      ...titleIconLinkStyle,
                      marginRight: '2px',
                      ...(hoveredTitleIcon === 'mons' ? titleIconLinkHoverStyle : undefined),
                    }}
                    onMouseEnter={() => setHoveredTitleIcon('mons')}
                    onMouseLeave={() => setHoveredTitleIcon(null)}
                    onFocus={() => setHoveredTitleIcon('mons')}
                    onBlur={() => setHoveredTitleIcon(null)}>
                    <img src="/assets/mons-rock-icon.svg" alt="" aria-hidden="true" style={titleRockIconStyle} />
                  </a>
                  <a
                    href="https://x.com/supermetalmons"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Super Metal Mons on X"
                    style={{
                      ...titleIconLinkStyle,
                      ...(hoveredTitleIcon === 'x' ? titleIconLinkHoverStyle : undefined),
                    }}
                    onMouseEnter={() => setHoveredTitleIcon('x')}
                    onMouseLeave={() => setHoveredTitleIcon(null)}
                    onFocus={() => setHoveredTitleIcon('x')}
                    onBlur={() => setHoveredTitleIcon(null)}>
                    <svg viewBox="0 0 24 24" aria-hidden="true" style={titleIconStyle} fill="currentColor">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.28 4.28 0 0 0 1.88-2.36 8.56 8.56 0 0 1-2.72 1.04 4.27 4.27 0 0 0-7.27 3.89 12.13 12.13 0 0 1-8.81-4.47 4.27 4.27 0 0 0 1.32 5.7 4.23 4.23 0 0 1-1.93-.53v.05a4.28 4.28 0 0 0 3.43 4.19 4.32 4.32 0 0 1-1.92.07 4.28 4.28 0 0 0 3.99 2.97A8.58 8.58 0 0 1 2 18.58a12.1 12.1 0 0 0 6.56 1.92c7.87 0 12.18-6.52 12.18-12.18l-.01-.56A8.68 8.68 0 0 0 22.46 6z" />
                    </svg>
                  </a>
                  <a
                    href="https://discord.gg/skhtAHuFwu"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Super Metal Mons on Discord"
                    style={{
                      ...titleIconLinkStyle,
                      ...(hoveredTitleIcon === 'discord' ? titleIconLinkHoverStyle : undefined),
                    }}
                    onMouseEnter={() => setHoveredTitleIcon('discord')}
                    onMouseLeave={() => setHoveredTitleIcon(null)}
                    onFocus={() => setHoveredTitleIcon('discord')}
                    onBlur={() => setHoveredTitleIcon(null)}>
                    <svg viewBox="0 0 640 512" aria-hidden="true" style={titleDiscordIconStyle} fill="currentColor">
                      <path d="M524.5 69.8a1.5 1.5 0 0 0-.8-.7A485.1 485.1 0 0 0 404.1 32a1.8 1.8 0 0 0-1.9.9 337.5 337.5 0 0 0-14.9 30.6 447.8 447.8 0 0 0-134.4 0 309.5 309.5 0 0 0-15.1-30.6 1.9 1.9 0 0 0-1.9-.9A483.5 483.5 0 0 0 116.3 69.1a1.7 1.7 0 0 0-.8.7C39.1 183.7 18.2 294.7 28.4 404.1a2 2 0 0 0 .8 1.4A487.7 487.7 0 0 0 176.2 480a1.9 1.9 0 0 0 2.1-.7 348.2 348.2 0 0 0 30-48.8 1.9 1.9 0 0 0-1-2.6 321.2 321.2 0 0 1-45.9-21.8 1.9 1.9 0 0 1-.2-3.1c3.1-2.3 6-4.7 8.9-7.2a1.9 1.9 0 0 1 1.9-.3c96.2 43.8 200.4 43.8 295.2 0a1.9 1.9 0 0 1 2 .3c2.9 2.5 5.9 4.9 8.9 7.2a1.9 1.9 0 0 1-.2 3.1 301.5 301.5 0 0 1-45.9 21.8 1.9 1.9 0 0 0-1 2.6 391.1 391.1 0 0 0 30 48.8 1.9 1.9 0 0 0 2 .7 486.1 486.1 0 0 0 147.2-74.5 1.9 1.9 0 0 0 .8-1.4c12.2-126-20.6-236.3-86.1-334.6zM222.8 337.2c-29 0-52.8-26.6-52.8-59.2s23.4-59.2 52.8-59.2c29.7 0 53.3 26.6 52.8 59.2 0 32.6-23.4 59.2-52.8 59.2zm196 0c-29 0-52.8-26.6-52.8-59.2s23.4-59.2 52.8-59.2c29.7 0 53.3 26.6 52.8 59.2 0 32.6-23.4 59.2-52.8 59.2z" />
                    </svg>
                  </a>
                  <a
                    href="https://t.me/supermetalmons"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Super Metal Mons on Telegram"
                    style={{
                      ...titleIconLinkStyle,
                      ...(hoveredTitleIcon === 'telegram' ? titleIconLinkHoverStyle : undefined),
                    }}
                    onMouseEnter={() => setHoveredTitleIcon('telegram')}
                    onMouseLeave={() => setHoveredTitleIcon(null)}
                    onFocus={() => setHoveredTitleIcon('telegram')}
                    onBlur={() => setHoveredTitleIcon(null)}>
                    <svg viewBox="0 0 24 24" aria-hidden="true" style={titleIconStyle} fill="currentColor">
                      <path d="M21.4 4.6 3.7 11.5c-.8.3-.8 1.4 0 1.7l4.5 1.6 1.7 5.2c.2.7 1.1.8 1.5.3l2.7-3.3 4.8 3.5c.6.4 1.4.1 1.6-.6l2.1-14.1c.1-.8-.7-1.5-1.4-1.2Zm-2.6 2.3-8.9 7.8-.4 2.8-1.1-3.3L5 13.1l13.8-6.2Z" />
                    </svg>
                  </a>
                </div>
              </div>
              <nav ref={navRef} style={navStyle} aria-label="Primary navigation">
                {menuItems.map((item) => {
                  const isActive = isMenuItemActive(pathname, item.to);
                  const isPressed = pressedItem === item.to;
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      onMouseDown={() => setPressedItem(item.to)}
                      onMouseUp={() => setPressedItem(null)}
                      onMouseLeave={() => setPressedItem(null)}
                      onTouchStart={() => setPressedItem(item.to)}
                      onTouchEnd={() => setPressedItem(null)}
                      style={{
                        ...(isActive ? activeButtonStyle : buttonStyle),
                        ...(isPressed ? pressedButtonStyle : undefined),
                      }}>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </header>
        {children}
        <Link to="/main" aria-label="Go to old homepage" style={swirlStyle}>
          🌀
        </Link>
      </div>
    </main>
  );
}
