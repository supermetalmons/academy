import type {CSSProperties, ReactNode} from 'react';
import {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import {
  MiniSiteMusicControls,
  useSiteMusicPlayer,
} from '@site/src/components/SiteMusicPlayer';
import {
  CLOUD_ENABLED_DEFAULT,
  CLOUD_ENABLED_EVENT_NAME,
  CLOUD_ENABLED_STORAGE_KEY,
  CLOUD_SPEED_DEFAULT,
  CLOUD_SPEED_EVENT_NAME,
  CLOUD_SPEED_STORAGE_KEY,
  clampCloudSpeed,
  parseCloudEnabled,
  parseCloudSpeed,
  readCloudEnabledFromStorage,
  readCloudSpeedFromStorage,
} from '@site/src/constants/cloudSpeed';
import {
  playSiteSoundEffect,
  preloadSiteSoundEffects,
} from '@site/src/utils/siteSoundEffects';
import {useSiteGrassBackground} from '@site/src/utils/siteGrassBackground';

type NewTopLayoutProps = {
  underCloudChildren?: ReactNode;
  children?: ReactNode;
};

type TitleIconKey = 'mons' | 'x' | 'discord' | 'telegram';
type MenuItem = {
  label: string;
  to: string;
  navigateTo?: string;
};
type CloudShadow = {
  top: number;
  width: number;
  height: number;
  opacity: number;
  duration: number;
  delay: number;
};

type MonsWindow = Window & {
  __monsNavResetAppliedForDocument?: boolean;
  __monsTopbarMarqueeStartedAtMs?: number;
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
  backgroundSize: '620px',
  backgroundAttachment: 'fixed',
  imageRendering: 'pixelated',
};

const watercolorPageStyle: CSSProperties = {
  ...pageStyle,
  backgroundImage: 'url("/assets/grass-watercolor.webp")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center center',
  backgroundSize: 'cover',
  imageRendering: 'auto',
};

const instructionLessonsPageStyle: CSSProperties = {
  ...pageStyle,
  backgroundColor: '#080808',
  backgroundImage: 'url("/img/legacy/images/library.jpg")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center center',
  backgroundSize: 'cover',
  imageRendering: 'auto',
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
  flex: '0 0 auto',
  gap: '0.56rem',
  color: '#000',
};

const titleSocialTickerRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.56rem',
  minWidth: 0,
  maxWidth: '100%',
};

const titleTickerViewportStyle: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  overflow: 'hidden',
  color: '#000',
  fontSize: '0.86rem',
  lineHeight: 1.05,
  whiteSpace: 'nowrap',
};

const titleTickerTrackStyle: CSSProperties = {
  display: 'inline-flex',
  minWidth: 'max-content',
  willChange: 'transform',
};

const titleTickerChunkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'calc(4.3rem - 15px)',
  paddingRight: 'calc(4.3rem - 15px)',
  whiteSpace: 'nowrap',
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
  flex: '0 0 auto',
  flexWrap: 'nowrap',
  justifyContent: 'flex-end',
};

const navBelowRowStyle: CSSProperties = {
  width: '100%',
  borderTop: '1px solid #000',
  padding: '0.48rem 1rem',
  boxSizing: 'border-box',
};

const navBelowNavStyle: CSSProperties = {
  ...navStyle,
  width: '100%',
  flexWrap: 'wrap',
  justifyContent: 'center',
};

const mobileLogoShellBaseStyle: CSSProperties = {
  ...logoLinkStyle,
  position: 'relative',
  backgroundColor: '#fff',
};

const mobileHamburgerButtonStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  border: 0,
  background: 'transparent',
  color: '#000',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: 0,
};

const mobileHamburgerIconStyle: CSSProperties = {
  width: '22px',
  height: '15px',
  display: 'inline-flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  pointerEvents: 'none',
};

const mobileHamburgerLineStyle: CSSProperties = {
  width: '100%',
  height: '2px',
  backgroundColor: 'currentColor',
  borderRadius: '2px',
  display: 'block',
};

const mobileSidebarBackdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.36)',
  zIndex: 10020,
};

const mobileSidebarPanelBaseStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  bottom: 0,
  width: 'min(84vw, 330px)',
  backgroundColor: '#fff',
  borderRight: '1px solid #000',
  zIndex: 10021,
  boxSizing: 'border-box',
  padding: '1rem 0.9rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.46rem',
  transition: 'transform 220ms ease',
};

const mobileSidebarHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.5rem',
};

const mobileSidebarTitleLinkStyle: CSSProperties = {
  textDecoration: 'none',
  color: 'inherit',
  minWidth: 0,
};

const mobileSidebarTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1.35rem',
  lineHeight: 1.1,
  color: '#000',
  fontWeight: 900,
};

const mobileSidebarHeaderDividerStyle: CSSProperties = {
  width: 'calc(100% + 1.8rem)',
  marginLeft: '-0.9rem',
  marginTop: '10px',
  marginBottom: '10px',
  borderTop: '1px solid #000',
};

const mobileSidebarCloseStyle: CSSProperties = {
  border: '1px solid #000',
  backgroundColor: '#fff',
  color: '#000',
  fontSize: '1rem',
  lineHeight: 1,
  width: '26px',
  height: '26px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: 0,
};

const mobileSidebarNavStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.38rem',
};

const mobileSidebarSocialRowStyle: CSSProperties = {
  ...titleIconRowStyle,
  marginTop: '0.04rem',
  gap: '0.55rem',
};

const mobileSidebarTickerViewportStyle: CSSProperties = {
  ...titleTickerViewportStyle,
  flex: '0 0 auto',
  width: '100%',
  marginTop: '0',
  marginBottom: '0.04rem',
};

const mobileSidebarIconLinkStyle: CSSProperties = {
  ...titleIconLinkStyle,
  width: '34px',
  height: '34px',
};

const mobileSidebarIconStyle: CSSProperties = {
  ...titleIconStyle,
  width: '29.6px',
  height: '29.6px',
};

const mobileSidebarDiscordIconStyle: CSSProperties = {
  ...titleDiscordIconStyle,
  width: '30.8px',
  height: '30.8px',
};

const mobileSidebarRockIconStyle: CSSProperties = {
  ...titleRockIconStyle,
  width: '33px',
  height: '33px',
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
  whiteSpace: 'nowrap',
  transition: 'transform 140ms ease, filter 140ms ease',
};

const mobileSidebarButtonStyle: CSSProperties = {
  ...buttonStyle,
  justifyContent: 'flex-start',
  width: '100%',
  fontSize: '1rem',
  minHeight: '2.2rem',
  paddingTop: '0.34rem',
  paddingBottom: '0.34rem',
};

const mobileSidebarSettingsWrapStyle: CSSProperties = {
  marginTop: 'auto',
  paddingTop: '0.2rem',
  display: 'flex',
  justifyContent: 'flex-start',
};

const mobileSidebarSettingsShortcutStyle: CSSProperties = {
  color: '#000',
  fontSize: '1.1rem',
  lineHeight: 1,
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
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

const settingsShortcutStyle: CSSProperties = {
  ...swirlStyle,
  right: 'auto',
  left: '0.9rem',
};

const foregroundLayerStyle: CSSProperties = {
  position: 'relative',
  zIndex: 2,
};

const underCloudLayerStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 0,
  pointerEvents: 'none',
};

const topGapFillStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: '56px',
  backgroundColor: '#fff',
  pointerEvents: 'none',
  zIndex: 9998,
};

const BASE_MENU_ITEMS: MenuItem[] = [
  {label: 'Instruction', to: '/instruction'},
  {label: 'Puzzles', to: '/puzzles'},
  {label: 'Resources', to: '/resources'},
  {label: 'FAQ', to: '/faq'},
];
const LOGO_SOURCES = [
  '/assets/logoimage-topbar.webp',
  '/assets/kingmon72-topbar.webp',
  '/assets/puzzleimage-topbar.webp',
  '/assets/faq-topbar.webp',
];
const LOGO_RESTORE_HYSTERESIS_PX = 72;
const NAV_BELOW_RESTORE_HYSTERESIS_PX = 72;
const SINGLE_WRAP_SPLIT_PX = 36;
const SINGLE_WRAP_MODE_RESTORE_HYSTERESIS_PX = 24;
const MOBILE_SIDEBAR_MAX_WIDTH_PX = 780;
const MOBILE_GALLERY_THIN_MAX_WIDTH_PX = MOBILE_SIDEBAR_MAX_WIDTH_PX;
const DEFAULT_DESKTOP_LOGO_SIZE_PX = 73;
const DEFAULT_MOBILE_LOGO_SIZE_PX = 55;
const CLOUD_INTRO_SESSION_KEY = 'mons_cloud_intro_seen_v1';
const TOPBAR_MARQUEE_DURATION_SECONDS = 18;
const LAST_INSTRUCTION_ROUTE_STORAGE_KEY = 'mons_last_instruction_route_v1';
const LAST_PUZZLES_ROUTE_STORAGE_KEY = 'mons_last_puzzles_route_v1';
const LAST_RESOURCES_ROUTE_STORAGE_KEY = 'mons_last_resources_route_v1';
const LAST_SETTINGS_RETURN_ROUTE_STORAGE_KEY = 'mons_last_settings_return_route_v1';
const DEFAULT_INSTRUCTION_ROUTE = '/instruction';
const DEFAULT_PUZZLES_ROUTE = '/puzzles';
const DEFAULT_RESOURCES_ROUTE = '/resources';
const DEFAULT_SETTINGS_RETURN_ROUTE = '/';
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
  const baseFlowDuration = shadow.duration * CLOUD_SPEED_SCALE * flowSpeedJitter;
  const pulseDuration = 38 + ((Math.cos(seed * 0.053) + 1) * 0.5) * 74;
  const pulsePhaseSeed = Number((phaseOffset * 0.73 + (index + 1) * 2.9).toFixed(2));
  const flowElapsed = positiveModulo(animationClockSeconds + phaseOffset, baseFlowDuration);
  const morphElapsed = positiveModulo(animationClockSeconds + phaseOffset, baseFlowDuration);
  const pulseElapsed = positiveModulo(animationClockSeconds * 0.91 + pulsePhaseSeed, pulseDuration);
  const cloudWidthPx = Math.round((shadow.width + widthVariance) * sizeScale);
  const cloudHeightPx = Math.round(
    (shadow.height + heightVariance) * (0.85 + sizeScale * 0.55),
  );
  const cloudOffscreenSpanPx = Math.round(cloudWidthPx + blurPx * 4 + 96);
  const viewportWidthPx =
    typeof window === 'undefined' ? 1280 : Math.max(240, window.innerWidth || 1280);
  const flowStartPx = -Math.max(viewportWidthPx * 1.5, cloudOffscreenSpanPx);
  const flowEndPx = Math.max(viewportWidthPx * 1.65, viewportWidthPx + cloudOffscreenSpanPx);
  const flowDistancePx = flowEndPx - flowStartPx;
  const flowX18Px = flowStartPx + flowDistancePx * (60 / 315);
  const flowX37Px = flowStartPx + flowDistancePx * (125 / 315);
  const flowX56Px = flowStartPx + flowDistancePx * (185 / 315);
  const flowX76Px = flowStartPx + flowDistancePx * (245 / 315);
  return {
    top: `${shadow.top}%`,
    width: `${cloudWidthPx}px`,
    height: `${cloudHeightPx}px`,
    opacity: baseOpacity,
    ['--cloud-blur' as any]: `${blurPx}px`,
    ['--cloud-flow-x0' as any]: `${Math.round(flowStartPx)}px`,
    ['--cloud-flow-x18' as any]: `${Math.round(flowX18Px)}px`,
    ['--cloud-flow-x37' as any]: `${Math.round(flowX37Px)}px`,
    ['--cloud-flow-x56' as any]: `${Math.round(flowX56Px)}px`,
    ['--cloud-flow-x76' as any]: `${Math.round(flowX76Px)}px`,
    ['--cloud-flow-x100' as any]: `${Math.round(flowEndPx)}px`,
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
    ['--cloud-flow-duration' as any]: `${baseFlowDuration.toFixed(2)}s`,
    ['--cloud-pulse-duration' as any]: `${pulseDuration.toFixed(2)}s`,
    ['--cloud-flow-delay' as any]: `-${flowElapsed.toFixed(2)}s`,
    ['--cloud-pulse-delay' as any]: `-${pulseElapsed.toFixed(2)}s`,
    ['--cloud-morph-duration' as any]: `${baseFlowDuration.toFixed(2)}s`,
    ['--cloud-morph-delay' as any]: `-${morphElapsed.toFixed(2)}s`,
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
      pathname === '/piece-details' ||
      pathname.startsWith('/piece-details/')
    );
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

function isInstructionRoute(pathname: string): boolean {
  return pathname === '/instruction' || pathname.startsWith('/instruction/');
}

function isInstructionLessonsRoute(pathname: string): boolean {
  return pathname === '/instruction/lessons' || pathname.startsWith('/instruction/lessons/');
}

function isResourcesRoute(pathname: string): boolean {
  return pathname === '/resources' || pathname.startsWith('/resources/');
}

function isPuzzlesRoute(pathname: string): boolean {
  return pathname === '/puzzles' || pathname.startsWith('/puzzles/');
}

function isSettingsRoute(pathname: string): boolean {
  return pathname === '/settings' || pathname.startsWith('/settings/');
}

function isInstructionContext(pathname: string): boolean {
  return (
    pathname === '/instruction' ||
    pathname.startsWith('/instruction/') ||
    pathname === '/piece-details' ||
    pathname.startsWith('/piece-details/')
  );
}

function isPuzzlesContext(pathname: string): boolean {
  return pathname === '/puzzles' || pathname.startsWith('/puzzles/');
}

function isFaqContext(pathname: string): boolean {
  return pathname === '/faq' || pathname.startsWith('/faq/');
}

function getLogoSrc(pathname: string): string {
  if (isPuzzlesContext(pathname)) {
    return '/assets/puzzleimage-topbar.webp';
  }
  if (isFaqContext(pathname)) {
    return '/assets/faq-topbar.webp';
  }
  if (isInstructionContext(pathname)) {
    return '/assets/kingmon72-topbar.webp';
  }
  return '/assets/logoimage-topbar.webp';
}

const loadedLogoSources = new Set<string>();
let cachedDesktopLogoSizePx = DEFAULT_DESKTOP_LOGO_SIZE_PX;
let cachedMobileLogoSizePx = DEFAULT_MOBILE_LOGO_SIZE_PX;
let lastMusicControlsRoutePathname: string | null = null;

function preloadLogoSource(source: string): Promise<void> {
  if (loadedLogoSources.has(source) || typeof Image === 'undefined') {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      loadedLogoSources.add(source);
      resolve();
    };
    image.onerror = () => {
      resolve();
    };
    image.src = source;
  });
}

function normalizeInstructionRoute(value: string | null): string {
  if (value !== null && isInstructionRoute(value)) {
    return value;
  }
  return DEFAULT_INSTRUCTION_ROUTE;
}

function normalizeResourcesRoute(value: string | null): string {
  if (value !== null && isResourcesRoute(value)) {
    return value;
  }
  return DEFAULT_RESOURCES_ROUTE;
}

function normalizePuzzlesRoute(value: string | null): string {
  if (value !== null && isPuzzlesRoute(value)) {
    return value;
  }
  return DEFAULT_PUZZLES_ROUTE;
}

function getCurrentReturnRoute(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS_RETURN_ROUTE;
  }
  const nextRoute = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  return isSettingsRoute(window.location.pathname)
    ? DEFAULT_SETTINGS_RETURN_ROUTE
    : nextRoute;
}

function normalizeSettingsReturnRoute(value: string | null): string {
  if (value === null || value.trim() === '') {
    return DEFAULT_SETTINGS_RETURN_ROUTE;
  }
  if (!value.startsWith('/') || value.startsWith('//')) {
    return DEFAULT_SETTINGS_RETURN_ROUTE;
  }
  const pathOnly = value.split(/[?#]/, 1)[0] || DEFAULT_SETTINGS_RETURN_ROUTE;
  if (isSettingsRoute(pathOnly)) {
    return DEFAULT_SETTINGS_RETURN_ROUTE;
  }
  return value;
}

function shouldResetOtherNavTargetsOnReload(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const appWindow = window as MonsWindow;
  if (appWindow.__monsNavResetAppliedForDocument) {
    return false;
  }
  let isReloadNavigation = false;
  try {
    const navigationEntries = window.performance.getEntriesByType('navigation');
    const firstNavigationEntry = navigationEntries[0] as PerformanceNavigationTiming | undefined;
    if (firstNavigationEntry?.type === 'reload') {
      isReloadNavigation = true;
    }
  } catch {
    // Ignore Performance API failures.
  }
  if (!isReloadNavigation) {
    const legacyPerformance = window.performance as Performance & {
      navigation?: {type?: number};
    };
    isReloadNavigation = legacyPerformance.navigation?.type === 1;
  }
  if (isReloadNavigation) {
    appWindow.__monsNavResetAppliedForDocument = true;
  }
  return isReloadNavigation;
}

function getTopbarMarqueeDelaySeconds(): number {
  if (typeof window === 'undefined') {
    return 0;
  }
  const appWindow = window as MonsWindow;
  if (appWindow.__monsTopbarMarqueeStartedAtMs === undefined) {
    appWindow.__monsTopbarMarqueeStartedAtMs = Date.now();
  }
  const elapsedSeconds = (Date.now() - appWindow.__monsTopbarMarqueeStartedAtMs) / 1000;
  return -positiveModulo(elapsedSeconds, TOPBAR_MARQUEE_DURATION_SECONDS);
}

export default function NewTopLayout({
  underCloudChildren,
  children,
}: NewTopLayoutProps): ReactNode {
  const pathname = typeof window === 'undefined' ? '' : window.location.pathname;
  const isHomepageRoute = pathname === '/';
  const isMusicRoute = pathname === '/resources/music';
  const {
    isPlaying: isSiteMusicPlaying,
    hideMiniControls,
  } = useSiteMusicPlayer();
  const shouldResetOtherTargetsThisLoad = useMemo(
    () => shouldResetOtherNavTargetsOnReload(),
    [],
  );
  const initialPathnameRef = useRef(pathname);
  const targetLogoSrc = getLogoSrc(pathname);
  const animationClockSecondsRef = useRef<number>(
    typeof window === 'undefined' ? 0 : Date.now() / 1000,
  );
  const animationClockSeconds = animationClockSecondsRef.current;
  const cloudShadowStyles = useMemo(
    () =>
      CLOUD_SHADOWS.map((shadow, index) =>
        getCloudShadowStyle(shadow, index, animationClockSeconds),
      ),
    [animationClockSeconds],
  );
  const cloudLobeStyles = useMemo(
    () =>
      CLOUD_SHADOWS.map((shadow, index) =>
        Array.from({length: CLOUD_LOBE_COUNT}, (_unused, lobeIndex) =>
          getCloudLobeStyle(shadow, index, lobeIndex),
        ),
      ),
    [],
  );
  useEffect(() => {
    preloadSiteSoundEffects(['pageButton']);
  }, []);
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
  const [topbarMarqueeDelaySeconds] = useState<number>(() =>
    getTopbarMarqueeDelaySeconds(),
  );
  const [pressedItem, setPressedItem] = useState<string | null>(null);
  const [isMobileSidebarMode, setIsMobileSidebarMode] = useState(() =>
    typeof window === 'undefined'
      ? false
      : window.matchMedia(`(max-width: ${MOBILE_SIDEBAR_MAX_WIDTH_PX}px)`).matches,
  );
  const [isMobileGalleryThinMode, setIsMobileGalleryThinMode] = useState(() =>
    typeof window === 'undefined'
      ? false
      : window.matchMedia(`(max-width: ${MOBILE_GALLERY_THIN_MAX_WIDTH_PX}px)`).matches,
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [hoveredTitleIcon, setHoveredTitleIcon] = useState<TitleIconKey | null>(null);
  const [cloudEnabled, setCloudEnabled] = useState<boolean>(CLOUD_ENABLED_DEFAULT);
  const [cloudSpeedMultiplier, setCloudSpeedMultiplier] = useState<number>(CLOUD_SPEED_DEFAULT);
  const grassBackground = useSiteGrassBackground();
  const useInstructionLessonsBackground = isInstructionLessonsRoute(pathname);
  const dynamicPageStyle = useInstructionLessonsBackground
    ? instructionLessonsPageStyle
    : grassBackground === 'watercolor'
      ? watercolorPageStyle
      : pageStyle;
  const shouldRenderClouds = cloudEnabled && !useInstructionLessonsBackground;
  const safeCloudSpeedMultiplier = clampCloudSpeed(cloudSpeedMultiplier);
  const cloudLayerStyle = useMemo<CSSProperties>(
    () => ({
      ['--cloud-speed-multiplier' as any]: safeCloudSpeedMultiplier.toFixed(2),
      ['--cloud-speed-blur-boost' as any]: `${Math.max(
        0,
        (safeCloudSpeedMultiplier - 1) * 0.3,
      ).toFixed(2)}px`,
      ['--cloud-speed-width-scale' as any]: (1 + Math.max(0, safeCloudSpeedMultiplier - 1) * 0.022).toFixed(3),
    }),
    [safeCloudSpeedMultiplier],
  );
  const [displayedLogoSrc, setDisplayedLogoSrc] = useState<string>(targetLogoSrc);
  const [instructionNavTarget, setInstructionNavTarget] = useState<string>(() => {
    if (isInstructionRoute(pathname)) {
      return normalizeInstructionRoute(pathname);
    }
    if (shouldResetOtherTargetsThisLoad) {
      return DEFAULT_INSTRUCTION_ROUTE;
    }
    if (typeof window === 'undefined') {
      return DEFAULT_INSTRUCTION_ROUTE;
    }
    try {
      return normalizeInstructionRoute(
        window.localStorage.getItem(LAST_INSTRUCTION_ROUTE_STORAGE_KEY),
      );
    } catch {
      return DEFAULT_INSTRUCTION_ROUTE;
    }
  });
  const [resourcesNavTarget, setResourcesNavTarget] = useState<string>(() => {
    if (isResourcesRoute(pathname)) {
      return normalizeResourcesRoute(pathname);
    }
    if (shouldResetOtherTargetsThisLoad) {
      return DEFAULT_RESOURCES_ROUTE;
    }
    if (typeof window === 'undefined') {
      return DEFAULT_RESOURCES_ROUTE;
    }
    try {
      return normalizeResourcesRoute(window.localStorage.getItem(LAST_RESOURCES_ROUTE_STORAGE_KEY));
    } catch {
      return DEFAULT_RESOURCES_ROUTE;
    }
  });
  const [puzzlesNavTarget, setPuzzlesNavTarget] = useState<string>(() => {
    if (isPuzzlesRoute(pathname)) {
      return normalizePuzzlesRoute(pathname);
    }
    if (shouldResetOtherTargetsThisLoad) {
      return DEFAULT_PUZZLES_ROUTE;
    }
    if (typeof window === 'undefined') {
      return DEFAULT_PUZZLES_ROUTE;
    }
    try {
      return normalizePuzzlesRoute(window.localStorage.getItem(LAST_PUZZLES_ROUTE_STORAGE_KEY));
    } catch {
      return DEFAULT_PUZZLES_ROUTE;
    }
  });
  const [settingsReturnTarget, setSettingsReturnTarget] = useState<string>(() => {
    if (!isSettingsRoute(pathname)) {
      return getCurrentReturnRoute();
    }
    if (typeof window === 'undefined') {
      return DEFAULT_SETTINGS_RETURN_ROUTE;
    }
    try {
      return normalizeSettingsReturnRoute(
        window.localStorage.getItem(LAST_SETTINGS_RETURN_ROUTE_STORAGE_KEY),
      );
    } catch {
      return DEFAULT_SETTINGS_RETURN_ROUTE;
    }
  });
  const headerRowRef = useRef<HTMLDivElement | null>(null);
  const headerInnerRef = useRef<HTMLDivElement | null>(null);
  const titleBlockRef = useRef<HTMLDivElement | null>(null);
  const titleHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const logoHideBreakpointWidthRef = useRef<number | null>(null);
  const logoHideBelowBreakpointWidthRef = useRef<number | null>(null);
  const navBelowBreakpointWidthRef = useRef<number | null>(null);
  const singleWrapBreakpointWidthRef = useRef<number | null>(null);
  const showNavBelowRowRef = useRef(false);
  const [logoSizePx, setLogoSizePx] = useState(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_DESKTOP_LOGO_SIZE_PX;
    }
    return window.matchMedia(`(max-width: ${MOBILE_SIDEBAR_MAX_WIDTH_PX}px)`).matches
      ? cachedMobileLogoSizePx
      : cachedDesktopLogoSizePx;
  });
  const [titleHeadingWidthPx, setTitleHeadingWidthPx] = useState<number | null>(null);
  const [hideLogoForSpace, setHideLogoForSpace] = useState(false);
  const [showNavBelowRow, setShowNavBelowRow] = useState(false);
  const [isCompactDesktopNav, setIsCompactDesktopNav] = useState(false);
  const [isTwoByTwoDesktopNav, setIsTwoByTwoDesktopNav] = useState(false);

  useEffect(() => {
    setPressedItem(null);
  }, [pathname]);

  useEffect(() => {
    const previousPathname = lastMusicControlsRoutePathname;
    if (previousPathname !== null && previousPathname !== pathname && !isSiteMusicPlaying) {
      hideMiniControls();
    }
    lastMusicControlsRoutePathname = pathname;
  }, [hideMiniControls, isSiteMusicPlaying, pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const mediaQuery = window.matchMedia(
      `(max-width: ${MOBILE_SIDEBAR_MAX_WIDTH_PX}px)`,
    );
    const updateMode = () => {
      setIsMobileSidebarMode(mediaQuery.matches);
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
    if (typeof window === 'undefined') {
      return;
    }
    const mediaQuery = window.matchMedia(
      `(max-width: ${MOBILE_GALLERY_THIN_MAX_WIDTH_PX}px)`,
    );
    const updateMode = () => {
      setIsMobileGalleryThinMode(mediaQuery.matches);
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
    if (typeof document === 'undefined') {
      return;
    }
    if (!isMobileSidebarMode) {
      document.body.style.overflow = '';
      return;
    }
    if (!isMobileSidebarOpen) {
      document.body.style.overflow = '';
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileSidebarMode, isMobileSidebarOpen]);

  useEffect(() => {
    if (!isMobileSidebarMode) {
      setIsMobileSidebarOpen(false);
    }
  }, [isMobileSidebarMode]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isMobileSidebarOpen]);

  useEffect(() => {
    if (typeof window === 'undefined' || !shouldResetOtherTargetsThisLoad) {
      return;
    }
    const initialPathname = initialPathnameRef.current;
    if (!isInstructionRoute(initialPathname)) {
      setInstructionNavTarget(DEFAULT_INSTRUCTION_ROUTE);
      try {
        window.localStorage.setItem(
          LAST_INSTRUCTION_ROUTE_STORAGE_KEY,
          DEFAULT_INSTRUCTION_ROUTE,
        );
      } catch {
        // Ignore storage failures.
      }
    }
    if (!isResourcesRoute(initialPathname)) {
      setResourcesNavTarget(DEFAULT_RESOURCES_ROUTE);
      try {
        window.localStorage.setItem(
          LAST_RESOURCES_ROUTE_STORAGE_KEY,
          DEFAULT_RESOURCES_ROUTE,
        );
      } catch {
        // Ignore storage failures.
      }
    }
    if (!isPuzzlesRoute(initialPathname)) {
      setPuzzlesNavTarget(DEFAULT_PUZZLES_ROUTE);
      try {
        window.localStorage.setItem(LAST_PUZZLES_ROUTE_STORAGE_KEY, DEFAULT_PUZZLES_ROUTE);
      } catch {
        // Ignore storage failures.
      }
    }
  }, [shouldResetOtherTargetsThisLoad]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (isInstructionRoute(pathname)) {
      setInstructionNavTarget((current) => {
        const next = normalizeInstructionRoute(pathname);
        if (current === next) {
          return current;
        }
        return next;
      });
      try {
        window.localStorage.setItem(LAST_INSTRUCTION_ROUTE_STORAGE_KEY, pathname);
      } catch {
        // Ignore storage failures.
      }
    }
    if (isResourcesRoute(pathname)) {
      setResourcesNavTarget((current) => {
        const next = normalizeResourcesRoute(pathname);
        if (current === next) {
          return current;
        }
        return next;
      });
      try {
        window.localStorage.setItem(LAST_RESOURCES_ROUTE_STORAGE_KEY, pathname);
      } catch {
        // Ignore storage failures.
      }
    }
    if (isPuzzlesRoute(pathname)) {
      setPuzzlesNavTarget((current) => {
        const next = normalizePuzzlesRoute(pathname);
        if (current === next) {
          return current;
        }
        return next;
      });
      try {
        window.localStorage.setItem(LAST_PUZZLES_ROUTE_STORAGE_KEY, pathname);
      } catch {
        // Ignore storage failures.
      }
    }
    if (isSettingsRoute(pathname)) {
      try {
        const next = normalizeSettingsReturnRoute(
          window.localStorage.getItem(LAST_SETTINGS_RETURN_ROUTE_STORAGE_KEY),
        );
        setSettingsReturnTarget((current) => (current === next ? current : next));
      } catch {
        setSettingsReturnTarget(DEFAULT_SETTINGS_RETURN_ROUTE);
      }
    } else {
      const next = getCurrentReturnRoute();
      setSettingsReturnTarget((current) => (current === next ? current : next));
      try {
        window.localStorage.setItem(LAST_SETTINGS_RETURN_ROUTE_STORAGE_KEY, next);
      } catch {
        // Ignore storage failures.
      }
    }
  }, [pathname]);

  useEffect(() => {
    showNavBelowRowRef.current = showNavBelowRow;
  }, [showNavBelowRow]);

  useEffect(() => {
    loadedLogoSources.add(displayedLogoSrc);
    if (typeof window === 'undefined') {
      return;
    }
    for (const source of LOGO_SOURCES) {
      void preloadLogoSource(source);
    }
  }, [displayedLogoSrc]);

  useEffect(() => {
    if (displayedLogoSrc === targetLogoSrc) {
      return;
    }
    if (loadedLogoSources.has(targetLogoSrc)) {
      setDisplayedLogoSrc(targetLogoSrc);
      return;
    }
    let isCancelled = false;
    void preloadLogoSource(targetLogoSrc).then(() => {
      if (!isCancelled) {
        setDisplayedLogoSrc(targetLogoSrc);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [displayedLogoSrc, targetLogoSrc]);

  useEffect(() => {
    setCloudEnabled(readCloudEnabledFromStorage());
    setCloudSpeedMultiplier(readCloudSpeedFromStorage());
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key === CLOUD_SPEED_STORAGE_KEY) {
        setCloudSpeedMultiplier(parseCloudSpeed(event.newValue));
      } else if (event.key === CLOUD_ENABLED_STORAGE_KEY) {
        setCloudEnabled(parseCloudEnabled(event.newValue));
      }
    };

    const handleSpeedUpdate = (event: Event) => {
      const speedEvent = event as CustomEvent<number>;
      setCloudSpeedMultiplier(clampCloudSpeed(speedEvent.detail));
    };
    const handleEnabledUpdate = (event: Event) => {
      const enabledEvent = event as CustomEvent<boolean>;
      setCloudEnabled(Boolean(enabledEvent.detail));
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener(CLOUD_SPEED_EVENT_NAME, handleSpeedUpdate as EventListener);
    window.addEventListener(CLOUD_ENABLED_EVENT_NAME, handleEnabledUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener(CLOUD_SPEED_EVENT_NAME, handleSpeedUpdate as EventListener);
      window.removeEventListener(CLOUD_ENABLED_EVENT_NAME, handleEnabledUpdate as EventListener);
    };
  }, [isMobileSidebarMode]);

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
    const titleBlockNode = titleBlockRef.current;
    if (innerNode === null) {
      return;
    }

    const updateLogoSize = () => {
      const computedStyle = window.getComputedStyle(innerNode);
      const paddingY =
        Number.parseFloat(computedStyle.paddingTop || '0') +
        Number.parseFloat(computedStyle.paddingBottom || '0');
      const measuredContentHeight =
        titleBlockNode?.getBoundingClientRect().height ?? innerNode.clientHeight;
      const nextSize = Math.max(32, Math.ceil(measuredContentHeight + paddingY));
      if (isMobileSidebarMode) {
        cachedMobileLogoSizePx = nextSize;
      } else {
        cachedDesktopLogoSizePx = nextSize;
      }
      setLogoSizePx((current) => (current === nextSize ? current : nextSize));
    };

    updateLogoSize();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        updateLogoSize();
      });
      observer.observe(innerNode);
      if (titleBlockNode !== null) {
        observer.observe(titleBlockNode);
      }
      return () => {
        observer.disconnect();
      };
    }

    window.addEventListener('resize', updateLogoSize);
    return () => {
      window.removeEventListener('resize', updateLogoSize);
    };
  }, [isMobileSidebarMode]);

  useLayoutEffect(() => {
    const headingNode = titleHeadingRef.current;
    if (headingNode === null) {
      return;
    }

    const updateTitleHeadingWidth = () => {
      const nextWidth = Math.max(1, Math.ceil(headingNode.getBoundingClientRect().width));
      setTitleHeadingWidthPx((current) => (current === nextWidth ? current : nextWidth));
    };

    updateTitleHeadingWidth();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        updateTitleHeadingWidth();
      });
      observer.observe(headingNode);
      return () => {
        observer.disconnect();
      };
    }

    window.addEventListener('resize', updateTitleHeadingWidth);
    return () => {
      window.removeEventListener('resize', updateTitleHeadingWidth);
    };
  }, []);

  useLayoutEffect(() => {
    if (isMobileSidebarMode) {
      if (showNavBelowRowRef.current) {
        showNavBelowRowRef.current = false;
      }
      if (showNavBelowRow) {
        setShowNavBelowRow(false);
      }
      if (hideLogoForSpace) {
        setHideLogoForSpace(false);
      }
      return;
    }
    const rowNode = headerRowRef.current;
    const navNode = navRef.current;
    if (rowNode === null || navNode === null) {
      return;
    }

    const updateLogoVisibility = () => {
      const navItems = Array.from(navNode.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement,
      );
      const navRowTops = Array.from(new Set(navItems.map((item) => item.offsetTop))).sort(
        (a, b) => a - b,
      );
      const navRowCount = navRowTops.length;
      const hasFourStackedRows = navRowCount >= 4;
      const secondRowTop = navRowTops[1];
      const secondRowCount =
        secondRowTop === undefined
          ? 0
          : navItems.filter((item) => item.offsetTop === secondRowTop).length;
      const hasSingleWrappedButton = navRowCount === 2 && secondRowCount === 1;

      const currentShowNavBelowRow = showNavBelowRowRef.current;
      let nextShowNavBelowRow = currentShowNavBelowRow;
      if (!currentShowNavBelowRow) {
        if (hasFourStackedRows) {
          navBelowBreakpointWidthRef.current = window.innerWidth;
          nextShowNavBelowRow = true;
        }
      } else {
        const hideWidth = navBelowBreakpointWidthRef.current ?? window.innerWidth;
        const restoreThreshold = hideWidth + NAV_BELOW_RESTORE_HYSTERESIS_PX;
        if (window.innerWidth >= restoreThreshold) {
          navBelowBreakpointWidthRef.current = null;
          nextShowNavBelowRow = false;
        }
      }
      if (nextShowNavBelowRow !== currentShowNavBelowRow) {
        showNavBelowRowRef.current = nextShowNavBelowRow;
        setShowNavBelowRow(nextShowNavBelowRow);
      }

      let nextCompactDesktopNav = false;
      let nextTwoByTwoDesktopNav = false;
      if (nextShowNavBelowRow) {
        singleWrapBreakpointWidthRef.current = null;
      } else if (hasSingleWrappedButton) {
        const existingSingleWrapBreakpoint = singleWrapBreakpointWidthRef.current;
        const nextSingleWrapBreakpoint =
          existingSingleWrapBreakpoint === null
            ? window.innerWidth
            : Math.max(existingSingleWrapBreakpoint, window.innerWidth);
        singleWrapBreakpointWidthRef.current = nextSingleWrapBreakpoint;
        const splitWidth = nextSingleWrapBreakpoint - SINGLE_WRAP_SPLIT_PX;
        const shouldUseTwoByTwo = window.innerWidth < splitWidth;
        if (shouldUseTwoByTwo) {
          nextTwoByTwoDesktopNav = true;
        } else {
          nextCompactDesktopNav = true;
        }
      } else if (singleWrapBreakpointWidthRef.current !== null) {
        const singleWrapBreakpoint = singleWrapBreakpointWidthRef.current;
        const restoreThreshold =
          singleWrapBreakpoint + SINGLE_WRAP_MODE_RESTORE_HYSTERESIS_PX;
        if (window.innerWidth >= restoreThreshold) {
          singleWrapBreakpointWidthRef.current = null;
        } else {
          nextTwoByTwoDesktopNav = isTwoByTwoDesktopNav;
          nextCompactDesktopNav = !isTwoByTwoDesktopNav;
          if (nextCompactDesktopNav && navRowCount >= 2 && secondRowCount >= 2) {
            nextCompactDesktopNav = false;
            nextTwoByTwoDesktopNav = true;
          }
        }
      }
      if (isCompactDesktopNav !== nextCompactDesktopNav) {
        setIsCompactDesktopNav(nextCompactDesktopNav);
      }
      if (isTwoByTwoDesktopNav !== nextTwoByTwoDesktopNav) {
        setIsTwoByTwoDesktopNav(nextTwoByTwoDesktopNav);
      }

      if (nextShowNavBelowRow) {
        if (!currentShowNavBelowRow) {
          if (isCompactDesktopNav) {
            setIsCompactDesktopNav(false);
          }
          if (isTwoByTwoDesktopNav) {
            setIsTwoByTwoDesktopNav(false);
          }
          setHideLogoForSpace(false);
          return;
        }
        const hasTwoByTwoBelowNav = secondRowCount >= 2;
        logoHideBreakpointWidthRef.current = null;
        setHideLogoForSpace((current) => {
          if (!current) {
            if (hasTwoByTwoBelowNav) {
              logoHideBelowBreakpointWidthRef.current = window.innerWidth;
              return true;
            }
            return false;
          }

          if (hasTwoByTwoBelowNav) {
            return true;
          }

          const hideWidth = logoHideBelowBreakpointWidthRef.current ?? window.innerWidth;
          const restoreThreshold = hideWidth + LOGO_RESTORE_HYSTERESIS_PX;
          if (window.innerWidth >= restoreThreshold) {
            logoHideBelowBreakpointWidthRef.current = null;
            return false;
          }
          return true;
        });
        return;
      }

      logoHideBelowBreakpointWidthRef.current = null;
      logoHideBreakpointWidthRef.current = null;
      setHideLogoForSpace(false);
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
  }, [
    hideLogoForSpace,
    isCompactDesktopNav,
    isMobileSidebarMode,
    isTwoByTwoDesktopNav,
    showNavBelowRow,
  ]);

  const dynamicLogoLinkStyle: CSSProperties = {
    ...logoLinkStyle,
    width: `${logoSizePx}px`,
    height: `${logoSizePx}px`,
  };
  const mobileLogoShellStyle: CSSProperties = {
    ...mobileLogoShellBaseStyle,
    width: `${logoSizePx}px`,
    height: `${logoSizePx}px`,
  };
  const dynamicLogoImageStyle: CSSProperties = {
    ...logoImageStyle,
    filter: logoSizePx <= 44 ? 'blur(0.18px) saturate(0.96)' : 'none',
    opacity: isMobileSidebarMode ? 0.15 : 1,
  };
  const mobileSidebarPanelStyle: CSSProperties = {
    ...mobileSidebarPanelBaseStyle,
    transform: isMobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
  };
  const titleText = hideLogoForSpace ? '❀ Mons Academy' : '❀ Mons Academy ⋆⋆⋆';
  const dynamicTitleSocialTickerRowStyle: CSSProperties = {
    ...titleSocialTickerRowStyle,
    width:
      titleHeadingWidthPx !== null
        ? `min(100%, ${titleHeadingWidthPx}px)`
        : '100%',
    display: isMobileSidebarMode ? 'none' : titleSocialTickerRowStyle.display,
  };
  const dynamicTitleTickerTrackStyle: CSSProperties = {
    ...titleTickerTrackStyle,
    animationDuration: `${TOPBAR_MARQUEE_DURATION_SECONDS}s`,
    animationDelay: `${topbarMarqueeDelaySeconds.toFixed(3)}s`,
  };
  const desktopPrimaryNavStyle: CSSProperties = isTwoByTwoDesktopNav
    ? {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, max-content)',
        justifyContent: 'flex-end',
        justifyItems: 'stretch',
        columnGap: '0.44rem',
        rowGap: '0.44rem',
      }
    : isCompactDesktopNav
      ? {...navStyle, gap: '0.36rem'}
      : navStyle;
  const isSettingsPage = isSettingsRoute(pathname);
  const settingsShortcutTarget = isSettingsPage ? settingsReturnTarget : '/settings';
  const settingsShortcutLabel = isSettingsPage
    ? 'Return to previous page'
    : 'Go to settings';
  const handleSettingsShortcutClick = (): void => {
    if (typeof window === 'undefined' || isSettingsPage) {
      return;
    }
    const next = getCurrentReturnRoute();
    setSettingsReturnTarget(next);
    try {
      window.localStorage.setItem(LAST_SETTINGS_RETURN_ROUTE_STORAGE_KEY, next);
    } catch {
      // Ignore storage failures.
    }
  };

  const menuItems: MenuItem[] = BASE_MENU_ITEMS.map((item) => {
    if (item.to === '/instruction') {
      return {...item, navigateTo: instructionNavTarget};
    }
    if (item.to === '/puzzles') {
      return {...item, navigateTo: puzzlesNavTarget};
    }
    if (item.to === '/resources') {
      return {...item, navigateTo: resourcesNavTarget};
    }
    return item;
  });

  const renderPrimaryNav = (
    style: CSSProperties,
    compactButtons = false,
  ): ReactNode => (
    <nav ref={navRef} style={style} aria-label="Primary navigation">
      {menuItems.map((item) => {
        const isActive = isMenuItemActive(pathname, item.to);
        const isPressed = pressedItem === item.to;
        const compactButtonStyleOverrides: CSSProperties = compactButtons
          ? {
              fontSize: '0.98rem',
              padding: '0.25rem 0.58rem',
            }
          : {};
        return (
          <Link
            key={item.label}
            to={item.navigateTo ?? item.to}
            className="mons-box-button"
            onMouseDown={() => setPressedItem(item.to)}
            onMouseUp={() => setPressedItem(null)}
            onMouseLeave={() => setPressedItem(null)}
            onTouchStart={() => setPressedItem(item.to)}
            onTouchEnd={() => setPressedItem(null)}
            onClick={() => {
              playSiteSoundEffect('pageButton');
            }}
            style={{
              ...(isActive ? activeButtonStyle : buttonStyle),
              ...compactButtonStyleOverrides,
              ...(isPressed ? pressedButtonStyle : undefined),
            }}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <main
      style={dynamicPageStyle}
      className={`mons-shell${showNavBelowRow ? ' mons-shell--nav-below' : ''}${isMobileSidebarMode ? ' mons-shell--mobile-sidebar' : ''}${isMobileSidebarMode && isMobileGalleryThinMode ? ' mons-shell--mobile-gallery-thin' : ''}`}>
      {shouldRenderClouds ? (
        <div
          className={`cloud-shadows${showCloudIntro ? ' cloud-shadows--intro' : ''}`}
          style={cloudLayerStyle}
          aria-hidden="true">
          {CLOUD_SHADOWS.map((shadow, index) => (
            <span
              key={`${shadow.top}-${index}`}
              className="cloud-shadows__blob"
              style={cloudShadowStyles[index]}>
              <span className="cloud-shadows__aspect">
                <span className="cloud-shadows__drift">
                  {cloudLobeStyles[index]?.map((lobeStyle, lobeIndex) => (
                    <span
                      key={`${shadow.top}-${index}-${lobeIndex}`}
                      className="cloud-shadows__lobe"
                      style={lobeStyle}
                    />
                  ))}
                </span>
              </span>
            </span>
          ))}
        </div>
      ) : null}
      {underCloudChildren ? (
        <div style={underCloudLayerStyle}>{underCloudChildren}</div>
      ) : null}
      <div style={foregroundLayerStyle}>
        <div aria-hidden="true" style={topGapFillStyle} />
        <header className="mons-topbar" style={headerBarStyle}>
          <div ref={headerRowRef} style={headerRowStyle}>
            {isMobileSidebarMode ? (
              <div style={mobileLogoShellStyle}>
                <img src={displayedLogoSrc} alt="" style={dynamicLogoImageStyle} />
                <button
                  type="button"
                  aria-label="Open site menu"
                  style={mobileHamburgerButtonStyle}
                  onClick={() => setIsMobileSidebarOpen(true)}>
                  <span style={mobileHamburgerIconStyle} aria-hidden="true">
                    <span style={mobileHamburgerLineStyle} />
                    <span style={mobileHamburgerLineStyle} />
                    <span style={mobileHamburgerLineStyle} />
                  </span>
                </button>
              </div>
            ) : !hideLogoForSpace ? (
              <Link to="/" aria-label="Go to home page" style={dynamicLogoLinkStyle}>
                <img src={displayedLogoSrc} alt="" style={dynamicLogoImageStyle} />
              </Link>
            ) : null}
            <div ref={headerInnerRef} style={headerInnerStyle}>
              <div ref={titleBlockRef} style={titleBlockStyle}>
                <Link to="/" style={homeLinkStyle}>
                  <h1
                    ref={titleHeadingRef}
                    style={titleStyle}
                    onClick={(event) => {
                      if (!isHomepageRoute || event.detail !== 3) {
                        return;
                      }
                      event.preventDefault();
                      window.location.assign('/drainer-grid');
                    }}>
                    {titleText}
                  </h1>
                </Link>
                <div style={dynamicTitleSocialTickerRowStyle}>
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
                  <div className="topbar-marquee" style={titleTickerViewportStyle} aria-hidden="true">
                    <span className="topbar-marquee__track" style={dynamicTitleTickerTrackStyle}>
                      <span style={titleTickerChunkStyle}>
                        <span>Swag is Eternal</span>
                        <span>~</span>
                      </span>
                      <span style={titleTickerChunkStyle}>
                        <span>Swag is Eternal</span>
                        <span>~</span>
                      </span>
                      <span style={titleTickerChunkStyle}>
                        <span>Swag is Eternal</span>
                        <span>~</span>
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              {!isMobileSidebarMode && !showNavBelowRow
                ? renderPrimaryNav(
                    desktopPrimaryNavStyle,
                    isCompactDesktopNav || isTwoByTwoDesktopNav,
                  )
                : null}
            </div>
          </div>
          {!isMobileSidebarMode && showNavBelowRow ? (
            <div style={navBelowRowStyle}>{renderPrimaryNav(navBelowNavStyle)}</div>
          ) : null}
          <MiniSiteMusicControls hidden={isMusicRoute} />
        </header>
        {isMobileSidebarMode ? (
          <>
            {isMobileSidebarOpen ? (
              <button
                type="button"
                aria-label="Close site menu"
                style={mobileSidebarBackdropStyle}
                onClick={() => setIsMobileSidebarOpen(false)}
              />
            ) : null}
            <aside aria-label="Site menu" style={mobileSidebarPanelStyle}>
              <div style={mobileSidebarHeaderStyle}>
                <Link
                  to="/"
                  style={mobileSidebarTitleLinkStyle}
                  onClick={() => setIsMobileSidebarOpen(false)}>
                  <h2 style={mobileSidebarTitleStyle}>❀ Mons Academy ⋆⋆⋆</h2>
                </Link>
                <button
                  type="button"
                  aria-label="Close site menu"
                  style={mobileSidebarCloseStyle}
                  onClick={() => setIsMobileSidebarOpen(false)}>
                  ×
                </button>
              </div>
              <div className="topbar-marquee" style={mobileSidebarTickerViewportStyle} aria-hidden="true">
                <span className="topbar-marquee__track" style={dynamicTitleTickerTrackStyle}>
                  <span style={titleTickerChunkStyle}>
                    <span>Swag is Eternal</span>
                    <span>~</span>
                  </span>
                  <span style={titleTickerChunkStyle}>
                    <span>Swag is Eternal</span>
                    <span>~</span>
                  </span>
                  <span style={titleTickerChunkStyle}>
                    <span>Swag is Eternal</span>
                    <span>~</span>
                  </span>
                </span>
              </div>
              <div aria-hidden="true" style={mobileSidebarHeaderDividerStyle} />
              <nav style={mobileSidebarNavStyle} aria-label="Mobile primary navigation">
                {menuItems.map((item) => {
                  const isActive = isMenuItemActive(pathname, item.to);
                  const isPressed = pressedItem === item.to;
                  return (
                    <Link
                      key={`mobile-${item.label}`}
                      to={item.navigateTo ?? item.to}
                      className="mons-box-button"
                      onMouseDown={() => setPressedItem(item.to)}
                      onMouseUp={() => setPressedItem(null)}
                      onMouseLeave={() => setPressedItem(null)}
                      onTouchStart={() => setPressedItem(item.to)}
                      onTouchEnd={() => setPressedItem(null)}
                      onClick={() => {
                        playSiteSoundEffect('pageButton');
                        setIsMobileSidebarOpen(false);
                      }}
                      style={{
                        ...(isActive
                          ? {...mobileSidebarButtonStyle, ...activeButtonStyle}
                          : mobileSidebarButtonStyle),
                        ...(isPressed ? pressedButtonStyle : undefined),
                      }}>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div style={mobileSidebarSocialRowStyle} aria-label="Platform icons">
                <a
                  href="https://mons.link/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Mons Link"
                  style={{...mobileSidebarIconLinkStyle, marginRight: '2px'}}
                  onClick={() => setIsMobileSidebarOpen(false)}>
                  <img
                    src="/assets/mons-rock-icon.svg"
                    alt=""
                    aria-hidden="true"
                    style={mobileSidebarRockIconStyle}
                  />
                </a>
                <a
                  href="https://x.com/supermetalmons"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Super Metal Mons on X"
                  style={mobileSidebarIconLinkStyle}
                  onClick={() => setIsMobileSidebarOpen(false)}>
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    style={mobileSidebarIconStyle}
                    fill="currentColor">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.28 4.28 0 0 0 1.88-2.36 8.56 8.56 0 0 1-2.72 1.04 4.27 4.27 0 0 0-7.27 3.89 12.13 12.13 0 0 1-8.81-4.47 4.27 4.27 0 0 0 1.32 5.7 4.23 4.23 0 0 1-1.93-.53v.05a4.28 4.28 0 0 0 3.43 4.19 4.32 4.32 0 0 1-1.92.07 4.28 4.28 0 0 0 3.99 2.97A8.58 8.58 0 0 1 2 18.58a12.1 12.1 0 0 0 6.56 1.92c7.87 0 12.18-6.52 12.18-12.18l-.01-.56A8.68 8.68 0 0 0 22.46 6z" />
                  </svg>
                </a>
                <a
                  href="https://discord.gg/skhtAHuFwu"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Super Metal Mons on Discord"
                  style={mobileSidebarIconLinkStyle}
                  onClick={() => setIsMobileSidebarOpen(false)}>
                  <svg
                    viewBox="0 0 640 512"
                    aria-hidden="true"
                    style={mobileSidebarDiscordIconStyle}
                    fill="currentColor">
                    <path d="M524.5 69.8a1.5 1.5 0 0 0-.8-.7A485.1 485.1 0 0 0 404.1 32a1.8 1.8 0 0 0-1.9.9 337.5 337.5 0 0 0-14.9 30.6 447.8 447.8 0 0 0-134.4 0 309.5 309.5 0 0 0-15.1-30.6 1.9 1.9 0 0 0-1.9-.9A483.5 483.5 0 0 0 116.3 69.1a1.7 1.7 0 0 0-.8.7C39.1 183.7 18.2 294.7 28.4 404.1a2 2 0 0 0 .8 1.4A487.7 487.7 0 0 0 176.2 480a1.9 1.9 0 0 0 2.1-.7 348.2 348.2 0 0 0 30-48.8 1.9 1.9 0 0 0-1-2.6 321.2 321.2 0 0 1-45.9-21.8 1.9 1.9 0 0 1-.2-3.1c3.1-2.3 6-4.7 8.9-7.2a1.9 1.9 0 0 1 1.9-.3c96.2 43.8 200.4 43.8 295.2 0a1.9 1.9 0 0 1 2 .3c2.9 2.5 5.9 4.9 8.9 7.2a1.9 1.9 0 0 1-.2 3.1 301.5 301.5 0 0 1-45.9 21.8 1.9 1.9 0 0 0-1 2.6 391.1 391.1 0 0 0 30 48.8 1.9 1.9 0 0 0 2 .7 486.1 486.1 0 0 0 147.2-74.5 1.9 1.9 0 0 0 .8-1.4c12.2-126-20.6-236.3-86.1-334.6zM222.8 337.2c-29 0-52.8-26.6-52.8-59.2s23.4-59.2 52.8-59.2c29.7 0 53.3 26.6 52.8 59.2 0 32.6-23.4 59.2-52.8 59.2zm196 0c-29 0-52.8-26.6-52.8-59.2s23.4-59.2 52.8-59.2c29.7 0 53.3 26.6 52.8 59.2 0 32.6-23.4 59.2-52.8 59.2z" />
                  </svg>
                </a>
                <a
                  href="https://t.me/supermetalmons"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Super Metal Mons on Telegram"
                  style={mobileSidebarIconLinkStyle}
                  onClick={() => setIsMobileSidebarOpen(false)}>
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    style={mobileSidebarIconStyle}
                    fill="currentColor">
                    <path d="M21.4 4.6 3.7 11.5c-.8.3-.8 1.4 0 1.7l4.5 1.6 1.7 5.2c.2.7 1.1.8 1.5.3l2.7-3.3 4.8 3.5c.6.4 1.4.1 1.6-.6l2.1-14.1c.1-.8-.7-1.5-1.4-1.2Zm-2.6 2.3-8.9 7.8-.4 2.8-1.1-3.3L5 13.1l13.8-6.2Z" />
                  </svg>
                </a>
              </div>
              <div style={mobileSidebarSettingsWrapStyle}>
                <Link
                  to={settingsShortcutTarget}
                  aria-label={settingsShortcutLabel}
                  style={mobileSidebarSettingsShortcutStyle}
                  onClick={() => {
                    handleSettingsShortcutClick();
                    setIsMobileSidebarOpen(false);
                  }}>
                  ⚙️
                </Link>
              </div>
            </aside>
          </>
        ) : null}
        {children}
        {!isMobileSidebarMode || isSettingsPage ? (
          <Link
            to={settingsShortcutTarget}
            aria-label={settingsShortcutLabel}
            style={settingsShortcutStyle}
            onClick={handleSettingsShortcutClick}>
            ⚙️
          </Link>
        ) : null}
      </div>
    </main>
  );
}
