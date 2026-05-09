import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

const TOP_BAR_HEIGHT_PX = 30;

type ShopDropTrack = {
  id: number;
  title: string;
  audioSrc: string;
};

type ShopDropCase = {
  id: number;
  coverSrc: string;
  tracks: [ShopDropTrack, ShopDropTrack];
};

type ShopTrackPlaybackMode = 'sample' | 'single' | 'loop-all' | 'loop-one' | 'shuffle';
type ShopTrackCarouselDirection = 'next' | 'previous';

const SHOP_DROP_COVER_VERSION = '2026-05-09-cover-refresh-2';
const getShopDropCoverSrc = (filename: string): string =>
  `/assets/supermons-tracks/shop-drop/${filename}?v=${SHOP_DROP_COVER_VERSION}`;

const SHOP_DROP_CASES: ShopDropCase[] = [
  {
    id: 1,
    coverSrc: getShopDropCoverSrc('cover1.png'),
    tracks: [
      {
        id: 1,
        title: 'triumphal',
        audioSrc: '/assets/supermons-tracks/shop-drop/1-triumphal.mp3',
      },
      {
        id: 2,
        title: 'clear view',
        audioSrc: '/assets/supermons-tracks/shop-drop/2-clear-view.mp3',
      },
    ],
  },
  {
    id: 3,
    coverSrc: getShopDropCoverSrc('cover2.png'),
    tracks: [
      {
        id: 4,
        title: 'flightless pond',
        audioSrc: '/assets/supermons-tracks/shop-drop/4-flightless-pond.mp3',
      },
      {
        id: 3,
        title: 'sanpling',
        audioSrc: '/assets/supermons-tracks/shop-drop/3-sanpling.mp3',
      },
    ],
  },
  {
    id: 5,
    coverSrc: getShopDropCoverSrc('cover3.png'),
    tracks: [
      {
        id: 5,
        title: 'solace',
        audioSrc: '/assets/supermons-tracks/shop-drop/5-solace.mp3',
      },
      {
        id: 6,
        title: 'realm reciever',
        audioSrc: '/assets/supermons-tracks/shop-drop/6-receiver.m4a',
      },
    ],
  },
  {
    id: 7,
    coverSrc: getShopDropCoverSrc('cover4.png'),
    tracks: [
      {
        id: 7,
        title: 'beetlehunt',
        audioSrc: '/assets/supermons-tracks/shop-drop/7-beetlehunt.mp3',
      },
      {
        id: 8,
        title: 'mytho suburban sky',
        audioSrc: '/assets/supermons-tracks/shop-drop/8-mytho-suburban-sky.m4a',
      },
    ],
  },
  {
    id: 9,
    coverSrc: getShopDropCoverSrc('cover5.png'),
    tracks: [
      {
        id: 9,
        title: 'dark bends',
        audioSrc: '/assets/supermons-tracks/shop-drop/9-dark-bends.mp3',
      },
      {
        id: 10,
        title: 'bit ambitious',
        audioSrc: '/assets/supermons-tracks/shop-drop/10-bit-ambitious.mp3',
      },
    ],
  },
];

const NATURAL_VISUALIZER_TRACK_IDS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
const LOW_END_VISUALIZER_BOOST_TRACK_IDS = new Set([2, 3, 4, 5, 7, 8, 9, 10]);
const SHOP_DROP_DOWNLOAD_SRC = '/assets/supermons-tracks/shop-drop/mons-shop-drop-tracks.zip';
const SHOP_TRACK_SAMPLE_SECONDS = 30;
const SHOP_TRACK_PLAYBACK_MODES: ShopTrackPlaybackMode[] = [
  'sample',
  'single',
  'loop-all',
  'loop-one',
  'shuffle',
];
const SHOP_DROP_TRACK_ORDER = SHOP_DROP_CASES.flatMap((item) => item.tracks.map((track) => track.id));
const SHOP_TRACKS_THIN_VIEW_QUERY = '(max-width: 860px)';
const SHOP_TRACKS_WIDE_GALLERY_MAX_WIDTH_PX = 1400;

const SHOP_TRACK_PLAYBACK_MODE_LABELS: Record<ShopTrackPlaybackMode, string> = {
  sample: 'Play 30 second samples',
  single: 'Play one track',
  'loop-all': 'Loop all tracks',
  'loop-one': 'Loop current track',
  shuffle: 'Shuffle remaining tracks',
};

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function interpolateNumber(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

function getShopDropCoverForTrack(trackId: number | null): string | null {
  if (trackId === null) {
    return null;
  }
  return SHOP_DROP_CASES.find((item) => item.tracks.some((track) => track.id === trackId))?.coverSrc ?? null;
}

function getShopDropSampleNextTrackId(trackId: number): number | null {
  return SHOP_DROP_CASES.find((item) => item.tracks[0].id === trackId)?.tracks[1].id ?? null;
}

function useShopTracksViewportHeight(): number | null {
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const updateViewportHeight = (): void => {
      setViewportHeight(window.innerHeight);
    };

    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight);
    return () => {
      window.removeEventListener('resize', updateViewportHeight);
    };
  }, []);

  return viewportHeight;
}

function useShopTracksThinView(): boolean | null {
  const [isThinView, setIsThinView] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia(SHOP_TRACKS_THIN_VIEW_QUERY);
    const updateThinView = (): void => {
      setIsThinView(mediaQuery.matches);
    };

    updateThinView();
    mediaQuery.addEventListener('change', updateThinView);
    return () => {
      mediaQuery.removeEventListener('change', updateThinView);
    };
  }, []);

  return isThinView;
}

const pageStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  margin: 0,
  backgroundColor: '#fff',
  overflow: 'hidden',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  color: '#111',
};

const settledContentLayerStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  transition: 'opacity 220ms ease',
};

const topBarStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  minHeight: TOP_BAR_HEIGHT_PX,
  padding: '4px 10px',
  boxSizing: 'border-box',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  alignContent: 'center',
  gap: 8,
  backgroundColor: '#fff',
  borderBottom: '1px solid #e5e5e5',
  zIndex: 20,
};

const topBarTitleStyle: CSSProperties = {
  flex: '1 1 140px',
  minWidth: 0,
  fontSize: 12,
  lineHeight: 1,
  color: '#111',
  letterSpacing: 0.1,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'clip',
};

const topBarButtonsStyle: CSSProperties = {
  display: 'flex',
  flex: '0 1 auto',
  minWidth: 0,
  maxWidth: '100%',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 6,
};

const topBarButtonStyle: CSSProperties = {
  height: 22,
  border: '1px solid #111',
  backgroundColor: '#fff',
  color: '#111',
  fontSize: 12,
  lineHeight: '20px',
  padding: '0 9px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const topBarButtonActiveStyle: CSSProperties = {
  ...topBarButtonStyle,
  backgroundColor: '#111',
  color: '#fff',
};

const galleryStyle: CSSProperties = {
  position: 'absolute',
  top: TOP_BAR_HEIGHT_PX,
  left: '50%',
  right: 'auto',
  bottom: 76,
  width: `min(100%, ${SHOP_TRACKS_WIDE_GALLERY_MAX_WIDTH_PX}px)`,
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  gridTemplateRows: 'minmax(0, 1fr)',
  gap: '4px 14px',
  padding: '10px 20px 0',
  boxSizing: 'border-box',
  alignItems: 'center',
  transform: 'translateX(-50%)',
};

const thinGalleryStyle: CSSProperties = {
  ...galleryStyle,
  left: 0,
  right: 0,
  width: 'auto',
  display: 'block',
  padding: '0 44px 0',
  overflow: 'hidden',
  transform: 'none',
};

const caseCardStyle: CSSProperties = {
  position: 'relative',
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateRows: 'auto auto',
  alignContent: 'center',
  alignItems: 'center',
  justifyItems: 'center',
  gap: 2,
  transform: 'translateY(90px)',
};

const thinCaseCardStyle: CSSProperties = {
  ...caseCardStyle,
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: 'min(350px, calc(100vw - 92px))',
  transform: 'translate(-50%, calc(-50% + 92px))',
};

const canvasShellStyle: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  width: '100%',
  height: 'clamp(210px, 38vh, 270px)',
  minHeight: 210,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  borderRadius: 6,
  backgroundColor: '#fff',
  boxShadow: 'none',
  overflow: 'hidden',
};

const thinCanvasShellStyle: CSSProperties = {
  ...canvasShellStyle,
  height: 'clamp(190px, 32vh, 285px)',
  minHeight: 190,
};

const caseCanvasAnimationWrapStyle: CSSProperties = {
  width: '100%',
};

const canvasShellScaleStyle: CSSProperties = {
  transform: 'scale(1.065)',
  transformOrigin: '50% 76%',
  transition: 'transform 150ms ease',
  willChange: 'transform',
};

const canvasStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  maxWidth: 270,
  maxHeight: 256,
  minHeight: 145,
  cursor: 'grab',
  touchAction: 'none',
};

const expandedCaseOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.18)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  transition: 'opacity 230ms ease',
};

const expandedCaseStageStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100vw',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform 260ms cubic-bezier(0.2, 0.95, 0.25, 1), opacity 220ms ease',
  transformOrigin: '50% 58%',
};

const expandedCanvasStyle: CSSProperties = {
  ...canvasStyle,
  maxWidth: 'none',
  maxHeight: 'none',
  minHeight: 0,
};

const controlsStyle: CSSProperties = {
  width: 'min(100%, 230px)',
  display: 'grid',
  gridTemplateColumns: '32px minmax(0, 1fr)',
  gridTemplateRows: 'auto auto',
  columnGap: 8,
  rowGap: 1,
  alignItems: 'center',
  color: '#111',
};

const caseControlsStackStyle: CSSProperties = {
  position: 'relative',
  zIndex: 2,
  width: 'min(100%, 230px)',
  display: 'grid',
  gap: 6,
};

const trackTitleStyle: CSSProperties = {
  minWidth: 0,
  margin: 0,
  fontSize: 10,
  lineHeight: 1.05,
  textAlign: 'left',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const trackTitlePrefixStyle: CSSProperties = {
  color: '#9a9a9a',
};

const trackStackStyle: CSSProperties = {
  display: 'grid',
  gap: 1,
  alignItems: 'center',
};

const playButtonStyle: CSSProperties = {
  width: 30,
  height: 30,
  minWidth: 30,
  minHeight: 30,
  maxWidth: 30,
  maxHeight: 30,
  aspectRatio: '1 / 1',
  boxSizing: 'border-box',
  border: '1px solid #111',
  borderRadius: '50%',
  backgroundColor: '#fff',
  color: '#111',
  padding: 0,
  display: 'inline-flex',
  flex: '0 0 30px',
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'center',
  justifySelf: 'center',
  cursor: 'pointer',
  lineHeight: 0,
};

const sliderWrapStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 34px',
  gap: 4,
  alignItems: 'center',
};

const trackSliderInputWrapStyle: CSSProperties = {
  position: 'relative',
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
};

const trackSliderStyle: CSSProperties = {
  width: '100%',
  cursor: 'pointer',
};

const sampleMarkerStyle: CSSProperties = {
  position: 'absolute',
  top: '50%',
  width: 2,
  height: 12,
  borderRadius: 1,
  backgroundColor: '#111',
  opacity: 0.45,
  transform: 'translate(-1px, -50%)',
  pointerEvents: 'none',
};

const timeLabelStyle: CSSProperties = {
  fontSize: 10,
  lineHeight: 1,
  textAlign: 'left',
  fontVariantNumeric: 'tabular-nums',
  opacity: 0.72,
};

const visualizerLayerStyle: CSSProperties = {
  position: 'absolute',
  top: 66,
  left: '50%',
  width: 'min(920px, calc(100vw - 24px))',
  height: 360,
  transform: 'translateX(-50%)',
  pointerEvents: 'none',
  transition: 'opacity 1s ease',
  zIndex: 4,
};

const visualizerCanvasStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
};

const visualizerContentLayerStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  transition: 'opacity 1s ease',
};

const visualizerPlaceholderTextStyle: CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  margin: 0,
  transform: 'translate(-50%, -50%)',
  color: '#9a9a9a',
  fontSize: 11,
  fontStyle: 'italic',
  lineHeight: 1,
  letterSpacing: 0,
  whiteSpace: 'nowrap',
  transition: 'opacity 1.8s ease',
};

const visualizerCoverStyle: CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: 58,
  height: 58,
  borderRadius: '9999px',
  border: 0,
  padding: 0,
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  pointerEvents: 'auto',
  cursor: 'pointer',
  boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.18)',
};

const visualizerProgressHitAreaStyle: CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: 132,
  height: 132,
  padding: 0,
  border: 0,
  borderRadius: '9999px',
  backgroundColor: 'transparent',
  transform: 'translate(-50%, -50%)',
  pointerEvents: 'auto',
  cursor: 'pointer',
};

const bottomControlsStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  bottom: 14,
  width: 'min(360px, calc(100vw - 48px))',
  transform: 'translateX(-50%)',
  display: 'grid',
  justifyItems: 'center',
  gap: 8,
  zIndex: 8,
};

const downloadButtonStyle: CSSProperties = {
  minWidth: 112,
  height: 28,
  border: '1px solid #111',
  backgroundColor: '#fff',
  color: '#111',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: '0 12px',
  fontSize: 12,
  lineHeight: 1,
  textDecoration: 'none',
  cursor: 'pointer',
};

const volumeControlStyle: CSSProperties = {
  width: '100%',
  display: 'grid',
  gridTemplateColumns: '32px minmax(0, 1fr) 28px',
  alignItems: 'center',
  gap: 8,
};

const volumeLabelStyle: CSSProperties = {
  color: '#111',
  display: 'inline-flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  height: 20,
};

const playbackModeButtonStyle: CSSProperties = {
  width: 30,
  height: 24,
  border: 0,
  borderRadius: 0,
  backgroundColor: 'transparent',
  color: '#111',
  padding: 0,
  marginLeft: 6,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  lineHeight: 0,
};

const playbackModeButtonIconWrapStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transformOrigin: '50% 50%',
};

const playbackModeButtonWrapStyle: CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transform: 'translateX(3px)',
};

const playbackModeCalloutStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  bottom: 'calc(100% + 14px)',
  width: 178,
  minHeight: 40,
  boxSizing: 'border-box',
  border: '1px solid #111',
  borderRadius: 0,
  backgroundColor: '#fff',
  color: '#111',
  padding: '8px 20px 8px 14px',
  fontSize: 12,
  lineHeight: 1.15,
  textAlign: 'center',
  transform: 'translateX(calc(-50% + 4px))',
  pointerEvents: 'auto',
  zIndex: 16,
};

const playbackModeCalloutCloseButtonStyle: CSSProperties = {
  position: 'absolute',
  top: 1,
  right: 2,
  width: 15,
  height: 15,
  border: 0,
  backgroundColor: 'transparent',
  color: '#111',
  padding: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  lineHeight: 1,
  cursor: 'pointer',
};

const playbackModeCalloutBreakStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  bottom: -1,
  width: 17,
  height: 2,
  backgroundColor: '#fff',
  transform: 'translateX(-50%)',
};

const playbackModeCalloutPointerStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  bottom: -8,
  width: 12,
  height: 12,
  borderRight: '1px solid #111',
  borderBottom: '1px solid #111',
  backgroundColor: '#fff',
  transform: 'translateX(-50%) rotate(45deg)',
};

const carouselArrowButtonBaseStyle: CSSProperties = {
  position: 'absolute',
  top: 'calc(50% + 58px)',
  width: 42,
  height: 64,
  border: 0,
  backgroundColor: 'transparent',
  color: '#111',
  padding: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transform: 'translateY(-50%)',
  zIndex: 10,
};

const carouselArrowLeftStyle: CSSProperties = {
  ...carouselArrowButtonBaseStyle,
  left: 10,
};

const carouselArrowRightStyle: CSSProperties = {
  ...carouselArrowButtonBaseStyle,
  right: 10,
};

const newMusicSliderStyles = `
.new-music-track-slider {
  appearance: none;
  -webkit-appearance: none;
  height: 16px;
  background: transparent;
}
.new-music-track-slider::-webkit-slider-runnable-track {
  height: 3px;
  background: #cfd3d8;
  border: 0;
}
.new-music-track-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 7px;
  height: 15px;
  margin-top: -6px;
  border: 0;
  border-radius: 1px;
  background: #000;
}
.new-music-track-slider::-moz-range-track {
  height: 3px;
  background: #cfd3d8;
  border: 0;
}
.new-music-track-slider::-moz-range-thumb {
  width: 7px;
  height: 15px;
  border: 0;
  border-radius: 1px;
  background: #000;
}
@keyframes new-music-cover-spin {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
.new-music-visualizer-cover {
  animation: new-music-cover-spin 5.5s linear infinite;
}
@keyframes shop-tracks-case-enter-next {
  from {
    opacity: 0;
    transform: translateX(42px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes shop-tracks-case-exit-next {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-42px);
  }
}
@keyframes shop-tracks-case-enter-previous {
  from {
    opacity: 0;
    transform: translateX(-42px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes shop-tracks-case-exit-previous {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(42px);
  }
}
@keyframes shop-tracks-mode-hint-bob {
  0% {
    transform: translateX(var(--shop-tracks-mode-hint-x, calc(-50% + 4px))) translateY(0);
  }
  23% {
    transform: translateX(var(--shop-tracks-mode-hint-x, calc(-50% + 4px))) translateY(-5px);
  }
  50% {
    transform: translateX(var(--shop-tracks-mode-hint-x, calc(-50% + 4px))) translateY(0);
  }
  73% {
    transform: translateX(var(--shop-tracks-mode-hint-x, calc(-50% + 4px))) translateY(-4px);
  }
  100% {
    transform: translateX(var(--shop-tracks-mode-hint-x, calc(-50% + 4px))) translateY(0);
  }
}
@keyframes shop-tracks-mode-hint-bob-thin {
  0% {
    transform: translateX(var(--shop-tracks-mode-hint-x, calc(-50% - 21px))) translateY(0);
  }
  23% {
    transform: translateX(var(--shop-tracks-mode-hint-x, calc(-50% - 21px))) translateY(-5px);
  }
  50% {
    transform: translateX(var(--shop-tracks-mode-hint-x, calc(-50% - 21px))) translateY(0);
  }
  73% {
    transform: translateX(var(--shop-tracks-mode-hint-x, calc(-50% - 21px))) translateY(-4px);
  }
  100% {
    transform: translateX(var(--shop-tracks-mode-hint-x, calc(-50% - 21px))) translateY(0);
  }
}
`;

function formatTrackTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '0:00';
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function VolumeWaveIcon({volume}: {volume: number}): ReactNode {
  const waveStyle = (isVisible: boolean): CSSProperties => ({
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 120ms ease',
  });

  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d="M4.5 9.2H8L12.2 5.7V18.3L8 14.8H4.5V9.2Z"
        fill="currentColor"
      />
      <path
        d="M14.6 9.4C15.25 10.08 15.58 10.94 15.58 12C15.58 13.06 15.25 13.92 14.6 14.6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
        style={waveStyle(volume > 0)}
      />
      <path
        d="M16.8 7.5C17.95 8.72 18.52 10.22 18.52 12C18.52 13.78 17.95 15.28 16.8 16.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
        style={waveStyle(volume >= 0.34)}
      />
      <path
        d="M19 5.55C20.63 7.28 21.45 9.43 21.45 12C21.45 14.57 20.63 16.72 19 18.45"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
        style={waveStyle(volume >= 0.67)}
      />
    </svg>
  );
}

function PlaybackModeIcon({mode}: {mode: ShopTrackPlaybackMode}): ReactNode {
  if (mode === 'sample') {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <text
          x="13"
          y="19.5"
          fill="currentColor"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="20.5"
          fontWeight="900"
          textAnchor="middle">
          $
        </text>
      </svg>
    );
  }

  if (mode === 'loop-all' || mode === 'loop-one') {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          d="M7 7H16.5L14.5 5M16.5 7L14.5 9M17 17H7.5L9.5 15M7.5 17L9.5 19"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path
          d="M17 7C19 8.2 20 9.9 20 12C20 14.1 19 15.8 17 17M7 17C5 15.8 4 14.1 4 12C4 9.9 5 8.2 7 7"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
        {mode === 'loop-one' ? (
          <>
            <circle cx="17.2" cy="17.2" r="4.5" fill="currentColor" />
            <text x="17.2" y="19.35" textAnchor="middle" fontSize="6.8" fontWeight="900" fill="#fff">
              1
            </text>
          </>
        ) : null}
      </svg>
    );
  }

  if (mode === 'shuffle') {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <g transform="translate(1.5 0)">
          <path
            d="M4 7H6.5C9.5 7 10.9 17 14 17H17M15 15L18 17L15 19M4 17H6.5C8 17 9 14.6 10 12M14 7H17M15 5L18 7L15 9"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <g transform="translate(-2 0)">
        <path d="M7.5 5V19L17.5 12L7.5 5Z" fill="currentColor" />
        <path
          d="M19.5 5V19"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </g>
    </svg>
  );
}

type BrowserWindowWithAudioContext = Window & {
  webkitAudioContext?: typeof AudioContext;
};

let shopDropAudioContext: AudioContext | null = null;
const shopDropAudioSourceByElement = new WeakMap<
  HTMLAudioElement,
  MediaElementAudioSourceNode
>();

function getShopDropAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const AudioContextConstructor =
    window.AudioContext ??
    (window as BrowserWindowWithAudioContext).webkitAudioContext;
  if (!AudioContextConstructor) {
    return null;
  }
  if (shopDropAudioContext === null) {
    shopDropAudioContext = new AudioContextConstructor();
  }
  return shopDropAudioContext;
}

function disposeMaterial(material: THREE.Material | THREE.Material[]): void {
  if (Array.isArray(material)) {
    material.forEach((entry) => entry.dispose());
    return;
  }
  material.dispose();
}

function createRoundedBoxMesh(
  width: number,
  height: number,
  depth: number,
  radius: number,
  material: THREE.Material,
): THREE.Mesh {
  return new THREE.Mesh(new RoundedBoxGeometry(width, height, depth, 5, radius), material);
}

function addRoundedBox(
  group: THREE.Group,
  material: THREE.Material,
  width: number,
  height: number,
  depth: number,
  position: THREE.Vector3Tuple,
  radius = 0.012,
): THREE.Mesh {
  const mesh = createRoundedBoxMesh(width, height, depth, radius, material);
  mesh.position.set(...position);
  group.add(mesh);
  return mesh;
}

const lidSheenVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const lidSheenFragmentShader = `
precision highp float;

varying vec2 vUv;
uniform float uAngle;
uniform float uShift;
uniform float uIntensity;
uniform float uSpread;

float band(float value, float center, float width) {
  return 1.0 - smoothstep(0.0, width, abs(value - center));
}

void main() {
  vec2 uv = vUv - 0.5;
  float c = cos(uAngle);
  float s = sin(uAngle);
  vec2 rotated = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c);
  float mainBand = band(rotated.x, uShift, 0.075 + uSpread * 0.035);
  float softBand = band(rotated.x, uShift - 0.22, 0.19 + uSpread * 0.08);
  float rimBand = band(rotated.y, 0.44, 0.05);
  float edgeFade =
    smoothstep(-0.49, -0.37, uv.x) *
    (1.0 - smoothstep(0.38, 0.5, uv.x)) *
    smoothstep(-0.49, -0.38, uv.y) *
    (1.0 - smoothstep(0.39, 0.5, uv.y));
  float alpha = (mainBand * 0.12 + softBand * 0.035 + rimBand * 0.026) * uIntensity * edgeFade;
  vec3 color = mix(vec3(0.82, 0.94, 1.0), vec3(1.0), mainBand * 0.75);
  gl_FragColor = vec4(color, alpha);
}
`;

const cdHologramVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const cdHologramFragmentShader = `
precision highp float;

varying vec2 vUv;
uniform float uHueShift;
uniform float uIntensity;

vec3 spectral(float value) {
  return 0.5 + 0.5 * cos(6.2831853 * (vec3(0.0, 0.33, 0.67) + value));
}

void main() {
  vec2 uv = vUv - 0.5;
  float radius = length(uv);
  float angle = atan(uv.y, uv.x);
  float discMask = smoothstep(0.5, 0.47, radius) * (1.0 - smoothstep(0.105, 0.13, radius));
  float grooves = 0.5 + 0.5 * sin(radius * 220.0 + angle * 3.0 + uHueShift * 6.0);
  float fineGrooves = 0.5 + 0.5 * sin(radius * 720.0 + uHueShift * 2.0);
  float radialSweep = 0.5 + 0.5 * sin(angle * 5.0 + uHueShift * 7.0);
  float sector = 0.5 + 0.5 * sin(angle * 11.0 - radius * 9.0 + uHueShift * 5.0);
  vec3 holo = spectral(radius * 2.1 + radialSweep * 0.28 + sector * 0.12 + uHueShift);
  vec3 silver = vec3(0.72, 0.78, 0.82) + vec3(fineGrooves * 0.08);
  vec3 base = mix(silver, holo, 0.48 + grooves * 0.34);
  float alpha = discMask * (0.74 + grooves * 0.16) * uIntensity;
  gl_FragColor = vec4(base, alpha);
}
`;

function CdCaseCanvas({
  canvasStyleOverride,
  coverSrc,
  initialRotationX,
  initialRotationY,
  initialRotationZ,
  isAutoRotating,
  maxPixelRatio = 2,
  modelScale = 0.92,
  onCaseClick,
  onCaseDoubleClick,
  onDragEnd,
  onSceneMissClick,
  onDragStart,
  preferSharpCover = false,
  resetToken,
}: {
  canvasStyleOverride?: CSSProperties;
  coverSrc: string;
  initialRotationX: number;
  initialRotationY: number;
  initialRotationZ: number;
  isAutoRotating: boolean;
  maxPixelRatio?: number;
  modelScale?: number;
  onCaseClick?: () => void;
  onCaseDoubleClick?: () => void;
  onDragEnd: () => void;
  onSceneMissClick?: () => void;
  onDragStart: () => void;
  preferSharpCover?: boolean;
  resetToken: string;
}): ReactNode {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const isDraggingRef = useRef(false);
  const onCaseClickRef = useRef(onCaseClick);
  const onCaseDoubleClickRef = useRef(onCaseDoubleClick);
  const onDragEndRef = useRef(onDragEnd);
  const onSceneMissClickRef = useRef(onSceneMissClick);
  const onDragStartRef = useRef(onDragStart);
  const renderRef = useRef<(() => void) | null>(null);
  const rotationRef = useRef({x: initialRotationX, y: initialRotationY, z: initialRotationZ});

  useEffect(() => {
    onCaseClickRef.current = onCaseClick;
    onCaseDoubleClickRef.current = onCaseDoubleClick;
    onDragEndRef.current = onDragEnd;
    onSceneMissClickRef.current = onSceneMissClick;
    onDragStartRef.current = onDragStart;
  }, [onCaseClick, onCaseDoubleClick, onDragEnd, onSceneMissClick, onDragStart]);

  useEffect(() => {
    rotationRef.current = {x: initialRotationX, y: initialRotationY, z: initialRotationZ};
    const group = groupRef.current;
    if (group !== null) {
      group.rotation.x = initialRotationX;
      group.rotation.y = initialRotationY;
      group.rotation.z = initialRotationZ;
      renderRef.current?.();
    }
  }, [initialRotationX, initialRotationY, initialRotationZ, resetToken]);

  useEffect(() => {
    if (!isAutoRotating) {
      return undefined;
    }

    let frameId: number | null = null;
    let lastFrameTime = performance.now();

    const tick = (frameTime: number): void => {
      const group = groupRef.current;
      const render = renderRef.current;
      const deltaSeconds = Math.min(0.05, Math.max(0, (frameTime - lastFrameTime) / 1000));
      lastFrameTime = frameTime;

      if (group !== null && render !== null && !isDraggingRef.current) {
        rotationRef.current = {
          ...rotationRef.current,
          y: rotationRef.current.y + deltaSeconds * 0.14,
        };
        group.rotation.y = rotationRef.current.y;
        render();
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [isAutoRotating]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) {
      return undefined;
    }

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(maxPixelRatio, window.devicePixelRatio || 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;

    const scene = new THREE.Scene();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const environmentTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environmentTexture;

    const camera = new THREE.PerspectiveCamera(27, 1, 0.1, 40);
    camera.position.set(0, 0, 8.75);

    const group = new THREE.Group();
    groupRef.current = group;
    group.rotation.x = rotationRef.current.x;
    group.rotation.y = rotationRef.current.y;
    group.rotation.z = rotationRef.current.z;
    group.scale.setScalar(modelScale);
    scene.add(group);

    const lidMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf4fbff,
      transparent: true,
      opacity: 0.055,
      roughness: 0.025,
      metalness: 0,
      transmission: 0.82,
      thickness: 0.34,
      ior: 1.48,
      reflectivity: 0.88,
      clearcoat: 1,
      clearcoatRoughness: 0.018,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const trayMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf7fbff,
      transparent: true,
      opacity: 0.28,
      roughness: 0.055,
      metalness: 0,
      transmission: 0.36,
      thickness: 0.26,
      ior: 1.48,
      reflectivity: 0.72,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const moldedMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xeef7ff,
      transparent: true,
      opacity: 0.38,
      roughness: 0.04,
      metalness: 0,
      transmission: 0.24,
      thickness: 0.18,
      clearcoat: 1,
      clearcoatRoughness: 0.025,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.88,
    });
    const darkEdgeMaterial = new THREE.LineBasicMaterial({
      color: 0x9aa3ad,
      transparent: true,
      opacity: 0.24,
    });
    const paperMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const glareMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const hingeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe8f4ff,
      transparent: true,
      opacity: 0.42,
      roughness: 0.035,
      metalness: 0,
      transmission: 0.3,
      thickness: 0.24,
      clearcoat: 1,
      clearcoatRoughness: 0.018,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const caseWidth = 3.18;
    const caseHeight = 3.02;
    const caseDepth = 0.26;

    const backShell = addRoundedBox(
      group,
      trayMaterial,
      caseWidth,
      caseHeight,
      caseDepth,
      [0, 0, -0.055],
      0.045,
    );
    const frontLid = addRoundedBox(
      group,
      lidMaterial,
      caseWidth,
      caseHeight,
      0.088,
      [0, 0, 0.155],
      0.055,
    );

    const backEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(backShell.geometry),
      edgeMaterial,
    );
    backEdges.position.copy(backShell.position);
    group.add(backEdges);
    const lidEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(frontLid.geometry),
      edgeMaterial,
    );
    lidEdges.position.copy(frontLid.position);
    group.add(lidEdges);

    addRoundedBox(group, moldedMaterial, 2.82, 0.035, 0.06, [0.08, 1.35, 0.225]);
    addRoundedBox(group, moldedMaterial, 2.82, 0.035, 0.06, [0.08, -1.35, 0.225]);
    addRoundedBox(group, moldedMaterial, 0.035, 2.68, 0.06, [1.39, 0, 0.225]);
    addRoundedBox(group, moldedMaterial, 0.035, 2.68, 0.055, [-1.08, 0, 0.225]);
    addRoundedBox(group, moldedMaterial, 2.48, 0.018, 0.035, [0.23, 1.205, 0.245], 0.006);
    addRoundedBox(group, moldedMaterial, 2.48, 0.018, 0.035, [0.23, -1.205, 0.245], 0.006);

    const hingeMesh = addRoundedBox(
      group,
      hingeMaterial,
      0.32,
      2.9,
      0.33,
      [-1.43, 0, 0.02],
      0.04,
    );
    const hingeEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(hingeMesh.geometry),
      darkEdgeMaterial,
    );
    hingeEdges.position.copy(hingeMesh.position);
    group.add(hingeEdges);

    [-1.08, 1.08].forEach((yPosition) => {
      addRoundedBox(group, hingeMaterial, 0.2, 0.085, 0.065, [1.36, yPosition, 0.245], 0.012);
    });
    [-1.08, 1.08].forEach((yPosition) => {
      addRoundedBox(group, hingeMaterial, 0.07, 0.3, 0.04, [-1.02, yPosition, 0.205], 0.012);
    });
    [-1.18, -0.86, 0.86, 1.18].forEach((yPosition) => {
      addRoundedBox(group, moldedMaterial, 0.13, 0.014, 0.035, [-1.4, yPosition, 0.19], 0.004);
    });

    const trayRingMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf6fbff,
      transparent: true,
      opacity: 0.18,
      roughness: 0.035,
      metalness: 0,
      transmission: 0.36,
      thickness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const cdCenterX = 0.18;
    const cdCenterY = -0.04;
    const cdInnerRadius = 0.21;
    const cdOuterRadius = 1.24;
    const trayRing = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.014, 18, 160), trayRingMaterial);
    trayRing.position.set(cdCenterX, cdCenterY, 0.052);
    group.add(trayRing);
    const hubOuter = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.018, 16, 80), trayRingMaterial.clone());
    hubOuter.position.set(cdCenterX, cdCenterY, 0.057);
    group.add(hubOuter);
    for (let index = 0; index < 12; index += 1) {
      const tooth = addRoundedBox(group, trayRingMaterial, 0.035, 0.12, 0.035, [cdCenterX, cdCenterY, 0.071], 0.006);
      tooth.rotation.z = (Math.PI * 2 * index) / 12;
      tooth.position.x += Math.cos(tooth.rotation.z) * 0.18;
      tooth.position.y += Math.sin(tooth.rotation.z) * 0.18;
    }

    const cdSilverMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd8e0e8,
      transparent: true,
      opacity: 0.78,
      roughness: 0.12,
      metalness: 0.58,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const cdSolidSurface = new THREE.Mesh(new THREE.RingGeometry(cdInnerRadius, cdOuterRadius, 192), cdSilverMaterial);
    cdSolidSurface.position.set(cdCenterX, cdCenterY, 0.066);
    group.add(cdSolidSurface);

    const cdWhiteMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.46,
      roughness: 0.18,
      metalness: 0.08,
      clearcoat: 0.7,
      clearcoatRoughness: 0.08,
      side: THREE.FrontSide,
      depthWrite: false,
    });
    const cdWhiteFace = new THREE.Mesh(new THREE.RingGeometry(cdInnerRadius, cdOuterRadius, 192), cdWhiteMaterial);
    cdWhiteFace.position.set(cdCenterX, cdCenterY, 0.086);
    group.add(cdWhiteFace);

    const cdHologramMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uHueShift: {value: 0.1},
        uIntensity: {value: 0.72},
      },
      vertexShader: cdHologramVertexShader,
      fragmentShader: cdHologramFragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const cdHologramBack = new THREE.Mesh(new THREE.RingGeometry(cdInnerRadius, cdOuterRadius, 192), cdHologramMaterial);
    cdHologramBack.position.set(cdCenterX, cdCenterY, 0.058);
    group.add(cdHologramBack);

    const cdEdgeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xdde4ea,
      transparent: true,
      opacity: 0.62,
      roughness: 0.1,
      metalness: 0.58,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const cdOuterEdge = new THREE.Mesh(new THREE.TorusGeometry(cdOuterRadius, 0.014, 14, 192), cdEdgeMaterial);
    cdOuterEdge.position.set(cdCenterX, cdCenterY, 0.072);
    group.add(cdOuterEdge);
    const cdInnerEdge = new THREE.Mesh(new THREE.TorusGeometry(cdInnerRadius, 0.012, 14, 96), cdEdgeMaterial.clone());
    cdInnerEdge.position.set(cdCenterX, cdCenterY, 0.073);
    group.add(cdInnerEdge);

    const coverBacker = new THREE.Mesh(
      new THREE.PlaneGeometry(2.78, 2.88),
      new THREE.MeshBasicMaterial({
        color: 0xf7f7f2,
        side: THREE.DoubleSide,
      }),
    );
    coverBacker.position.set(0.16, 0, 0.198);
    group.add(coverBacker);

    const coverGeometry = new THREE.PlaneGeometry(2.8, 2.86);
    const coverMesh = new THREE.Mesh(coverGeometry, paperMaterial);
    coverMesh.position.set(0.11, 0, 0.221);
    group.add(coverMesh);
    addRoundedBox(group, moldedMaterial, 2.84, 0.018, 0.035, [0.12, 1.425, 0.218], 0.006);
    addRoundedBox(group, moldedMaterial, 2.84, 0.018, 0.035, [0.12, -1.425, 0.218], 0.006);
    addRoundedBox(group, moldedMaterial, 0.018, 2.72, 0.035, [1.47, 0, 0.218], 0.006);

    const frontPlate = new THREE.Mesh(
      new THREE.PlaneGeometry(2.94, 2.82),
      new THREE.MeshPhysicalMaterial({
        color: 0xf2f8ff,
        transparent: true,
        opacity: 0.035,
        roughness: 0.018,
        metalness: 0,
        transmission: 0.82,
        thickness: 0.18,
        ior: 1.48,
        clearcoat: 1,
        clearcoatRoughness: 0.01,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    frontPlate.position.set(0.02, 0, 0.282);
    group.add(frontPlate);

    const lidSheenMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uAngle: {value: -0.72},
        uShift: {value: 0},
        uIntensity: {value: 0.28},
        uSpread: {value: 0.3},
      },
      vertexShader: lidSheenVertexShader,
      fragmentShader: lidSheenFragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const lidSheen = new THREE.Mesh(new THREE.PlaneGeometry(2.98, 2.86), lidSheenMaterial);
    lidSheen.position.set(0.02, 0, 0.318);
    group.add(lidSheen);

    const hingeGlare = new THREE.Mesh(new THREE.PlaneGeometry(0.055, 2.55), glareMaterial.clone());
    hingeGlare.position.set(-1.39, 0, 0.315);
    (hingeGlare.material as THREE.MeshBasicMaterial).opacity = 0.2;
    group.add(hingeGlare);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.28);
    scene.add(ambientLight);
    const keyLight = new THREE.RectAreaLight(0xffffff, 5.4, 5.8, 3.2);
    keyLight.position.set(-2.6, 3.2, 4.6);
    keyLight.lookAt(0, 0, 0);
    scene.add(keyLight);
    const rimLight = new THREE.RectAreaLight(0xd7ecff, 3.2, 3.6, 2.4);
    rimLight.position.set(3.4, 0.8, 3.2);
    rimLight.lookAt(0, 0, 0);
    scene.add(rimLight);

    let coverTexture: THREE.Texture | null = null;
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(coverSrc, (texture) => {
      coverTexture = texture;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = preferSharpCover
        ? renderer.capabilities.getMaxAnisotropy()
        : Math.min(8, renderer.capabilities.getMaxAnisotropy());
      if (preferSharpCover) {
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
      }
      texture.needsUpdate = true;
      paperMaterial.map = texture;
      paperMaterial.needsUpdate = true;
      render();
    });

    const updateDynamicHighlights = (): void => {
      const {x, y} = rotationRef.current;
      const normal = new THREE.Vector3(0, 0, 1).applyEuler(group.rotation).normalize();
      const lightDirection = new THREE.Vector3(-0.38, 0.62, 0.69).normalize();
      const viewDirection = new THREE.Vector3(0, 0, 1);
      const specularAim = Math.max(0, normal.dot(lightDirection) * 0.58 + normal.dot(viewDirection) * 0.42);
      const specular = Math.pow(specularAim, 2.4);
      const sideLight = Math.min(1, Math.max(0, normal.x * 0.7 + 0.5));
      const tiltLight = Math.min(1, Math.max(0, normal.y * -0.55 + 0.62));
      const diagonalGlint = Math.min(1, Math.max(0, specular * 1.15 + tiltLight * 0.2));
      const opposingGlint = Math.min(1, Math.max(0, (1 - sideLight) * specular));

      lidSheenMaterial.uniforms.uShift.value = -0.36 + sideLight * 0.72 + Math.sin(y * 0.8 - x * 0.35) * 0.04;
      lidSheenMaterial.uniforms.uAngle.value = -0.86 + y * 0.18 - x * 0.12;
      lidSheenMaterial.uniforms.uIntensity.value = 0.09 + diagonalGlint * 0.34;
      lidSheenMaterial.uniforms.uSpread.value = 0.1 + Math.abs(normal.x) * 0.9;
      cdHologramMaterial.uniforms.uHueShift.value = y * 0.22 - x * 0.1 + normal.x * 0.42;
      cdHologramMaterial.uniforms.uIntensity.value = 0.58 + (1 - Math.abs(normal.z)) * 0.34 + diagonalGlint * 0.2;
      keyLight.intensity = 4.7 + diagonalGlint * 1.1;
      rimLight.intensity = 2.65 + opposingGlint * 0.9;
    };

    const render = (): void => {
      updateDynamicHighlights();
      renderer.render(scene, camera);
    };
    renderRef.current = render;

    const resizeRenderer = (): void => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      render();
    };

    let isDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let pointerDownX = 0;
    let pointerDownY = 0;
    let didPointerMoveBeyondClick = false;
    let pendingCaseClickTimeout: number | null = null;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const caseHitObjects = group.children.filter((child): child is THREE.Mesh => child instanceof THREE.Mesh);

    const clearPendingCaseClick = (): void => {
      if (pendingCaseClickTimeout !== null) {
        window.clearTimeout(pendingCaseClickTimeout);
        pendingCaseClickTimeout = null;
      }
    };

    const doesPointerHitCase = (event: PointerEvent | MouseEvent): boolean => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        return false;
      }
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(caseHitObjects, true).length > 0;
    };

    const handlePointerDown = (event: PointerEvent): void => {
      if (event.button !== 0) {
        return;
      }
      const isCaseHit = doesPointerHitCase(event);
      if (onSceneMissClickRef.current !== undefined && !isCaseHit) {
        onSceneMissClickRef.current();
        return;
      }
      if (
        (onCaseClickRef.current !== undefined || onCaseDoubleClickRef.current !== undefined) &&
        !isCaseHit
      ) {
        return;
      }
      clearPendingCaseClick();
      isDragging = true;
      isDraggingRef.current = true;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      pointerDownX = event.clientX;
      pointerDownY = event.clientY;
      didPointerMoveBeyondClick = false;
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = 'grabbing';
      onDragStartRef.current();
    };

    const handlePointerMove = (event: PointerEvent): void => {
      if (!isDragging) {
        return;
      }
      const deltaX = event.clientX - lastPointerX;
      const deltaY = event.clientY - lastPointerY;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      if (
        !didPointerMoveBeyondClick &&
        Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY) > 5
      ) {
        didPointerMoveBeyondClick = true;
      }
      rotationRef.current = {
        x: Math.max(-0.72, Math.min(0.42, rotationRef.current.x + deltaY * 0.008)),
        y: rotationRef.current.y + deltaX * 0.011,
        z: rotationRef.current.z,
      };
      group.rotation.x = rotationRef.current.x;
      group.rotation.y = rotationRef.current.y;
      render();
    };

    const handlePointerUp = (event: PointerEvent): void => {
      if (!isDragging) {
        return;
      }
      isDragging = false;
      isDraggingRef.current = false;
      canvas.releasePointerCapture(event.pointerId);
      canvas.style.cursor = 'grab';
      onDragEndRef.current();
      if (!didPointerMoveBeyondClick && onCaseClickRef.current !== undefined) {
        pendingCaseClickTimeout = window.setTimeout(() => {
          pendingCaseClickTimeout = null;
          onCaseClickRef.current?.();
        }, 240);
      }
    };

    const handlePointerCancel = (event: PointerEvent): void => {
      if (!isDragging) {
        return;
      }
      isDragging = false;
      isDraggingRef.current = false;
      canvas.releasePointerCapture(event.pointerId);
      canvas.style.cursor = 'grab';
      onDragEndRef.current();
    };

    const handleDoubleClick = (event: MouseEvent): void => {
      if (onCaseDoubleClickRef.current === undefined || !doesPointerHitCase(event)) {
        return;
      }
      clearPendingCaseClick();
      event.preventDefault();
      onCaseDoubleClickRef.current();
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerCancel);
    canvas.addEventListener('dblclick', handleDoubleClick);

    const resizeObserver = new ResizeObserver(resizeRenderer);
    resizeObserver.observe(canvas);
    resizeRenderer();

    return () => {
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerCancel);
      canvas.removeEventListener('dblclick', handleDoubleClick);
      clearPendingCaseClick();
      coverTexture?.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
          object.geometry.dispose();
          disposeMaterial(object.material);
        }
      });
      renderer.dispose();
      if (groupRef.current === group) {
        groupRef.current = null;
      }
      if (renderRef.current === render) {
        renderRef.current = null;
      }
      if (isDragging) {
        isDraggingRef.current = false;
        onDragEndRef.current();
      }
    };
  }, [coverSrc, maxPixelRatio, modelScale, preferSharpCover]);

  return (
    <canvas
      ref={canvasRef}
      style={{...canvasStyle, ...canvasStyleOverride}}
      aria-label="Rotatable jewel case"
    />
  );
}

function AudioRadialVisualizer({
  activeCoverSrc,
  activeTrackId,
  audioElement,
  isPlaybackPaused,
  isVisualizerHidden,
  layerStyle,
  playbackMode,
  setIsPlaybackPaused,
  setIsVisualizerHidden,
}: {
  activeCoverSrc: string | null;
  activeTrackId: number | null;
  audioElement: HTMLAudioElement | null;
  isPlaybackPaused: boolean;
  isVisualizerHidden: boolean;
  layerStyle?: CSSProperties;
  playbackMode: ShopTrackPlaybackMode;
  setIsPlaybackPaused: Dispatch<SetStateAction<boolean>>;
  setIsVisualizerHidden: Dispatch<SetStateAction<boolean>>;
}): ReactNode {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPlaybackPausedRef = useRef(isPlaybackPaused);
  const isVisualizerVisible = audioElement !== null && !isVisualizerHidden;

  useEffect(() => {
    isPlaybackPausedRef.current = isPlaybackPaused;
  }, [isPlaybackPaused]);

  const seekAudioFromProgressPointer = (event: {
    clientX: number;
    clientY: number;
    currentTarget: HTMLElement;
  }): void => {
    if (audioElement === null) {
      return;
    }
    const trackDuration = audioElement.duration || 0;
    const seekDuration =
      playbackMode === 'sample'
        ? Math.min(trackDuration || SHOP_TRACK_SAMPLE_SECONDS, SHOP_TRACK_SAMPLE_SECONDS)
        : trackDuration;
    if (!Number.isFinite(seekDuration) || seekDuration <= 0) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;
    const angle = Math.atan2(offsetY, offsetX);
    const progress = ((angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2);
    audioElement.currentTime = progress * seekDuration;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (audioElement === null || canvas === null || typeof window === 'undefined') {
      return undefined;
    }

    const audioContext = getShopDropAudioContext();
    if (audioContext === null) {
      return undefined;
    }

    let source = shopDropAudioSourceByElement.get(audioElement);
    if (source === undefined) {
      source = audioContext.createMediaElementSource(audioElement);
      shopDropAudioSourceByElement.set(audioElement, source);
    } else {
      try {
        source.disconnect();
      } catch {
        // The source may already be disconnected after a previous pause.
      }
    }

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.78;
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    if (audioContext.state === 'suspended') {
      void audioContext.resume();
    }

    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    const visualFrequencyData = new Float32Array(analyser.frequencyBinCount);
    const particleCanvas = document.createElement('canvas');
    const particleContext = particleCanvas.getContext('2d');
    let frameId: number | null = null;
    let lastFrameTime = performance.now();
    let nextParticleSpawnTime = lastFrameTime + 120;
    const particles: Array<{
      age: number;
      life: number;
      renderAlpha: number;
      size: number;
      vx: number;
      vy: number;
      x: number;
      y: number;
    }> = [];

    const resizeCanvas = (): void => {
      const pixelRatio = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * pixelRatio));
      canvas.height = Math.max(1, Math.round(rect.height * pixelRatio));
    };

    const draw = (): void => {
      const frameTime = performance.now();
      const deltaSeconds = Math.min(0.05, Math.max(0.001, (frameTime - lastFrameTime) / 1000));
      lastFrameTime = frameTime;
      analyser.getByteFrequencyData(frequencyData);
      const isPausedFrame = isPlaybackPausedRef.current;
      const frequencyEase = Math.min(1, deltaSeconds * (isPausedFrame ? 2.1 : 12));
      for (let index = 0; index < frequencyData.length; index += 1) {
        const target = isPausedFrame ? 0 : (frequencyData[index] ?? 0);
        visualFrequencyData[index] += (target - visualFrequencyData[index]) * frequencyEase;
      }
      const context = canvas.getContext('2d');
      if (context === null) {
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const size = Math.min(width, height);
      const particlePixelSize = Math.max(5, Math.round(size * 0.017));
      const particleScale = 1 / particlePixelSize;
      const baseRadius = size * 0.19;
      const barCount = 152;
      const shouldEvenlyDistribute =
        activeTrackId !== null && !NATURAL_VISUALIZER_TRACK_IDS.has(activeTrackId);
      const shouldLiftLowEnd =
        activeTrackId !== null && LOW_END_VISUALIZER_BOOST_TRACK_IDS.has(activeTrackId);
      const currentTime = audioElement.currentTime || 0;
      const duration = audioElement.duration || 0;
      const progressDuration =
        playbackMode === 'sample'
          ? Math.min(duration || SHOP_TRACK_SAMPLE_SECONDS, SHOP_TRACK_SAMPLE_SECONDS)
          : duration;
      const trackProgress =
        Number.isFinite(progressDuration) && progressDuration > 0
          ? Math.min(1, Math.max(0, currentTime / progressDuration))
          : 0;
      const quietArcCenter = -Math.PI * 0.38 + Math.sin(currentTime * 0.18) * 0.13;
      const quietArcWidth = 0.52;

      context.clearRect(0, 0, width, height);

      let bass = 0;
      let mid = 0;
      let treble = 0;
      for (let index = 1; index < 22; index += 1) {
        bass += visualFrequencyData[index] ?? 0;
      }
      for (let index = 22; index < 138; index += 1) {
        mid += visualFrequencyData[index] ?? 0;
      }
      for (let index = 138; index < 420; index += 1) {
        treble += visualFrequencyData[index] ?? 0;
      }
      bass /= 21 * 255;
      mid /= 116 * 255;
      treble /= 282 * 255;

      if (!isPausedFrame && frameTime >= nextParticleSpawnTime) {
        const spawnCount = Math.random() > 0.78 ? 2 : 1;
        for (let index = 0; index < spawnCount; index += 1) {
          const angle = Math.random() * Math.PI * 2;
          const speed = size * (0.065 + Math.random() * 0.075);
          const startDistance = size * (0.085 + Math.random() * 0.08);
          particles.push({
            age: 0,
            life: 4.7 + Math.random() * 3.4,
            renderAlpha: 0,
            size: size * (0.016 + Math.random() * 0.036),
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - size * (0.006 + Math.random() * 0.011),
            x: centerX + Math.cos(angle) * startDistance,
            y: centerY + Math.sin(angle) * startDistance,
          });
        }
        nextParticleSpawnTime = frameTime + 95 + Math.random() * 230;
      }

      if (particleContext !== null) {
        const particleWidth = Math.max(1, Math.ceil(width * particleScale));
        const particleHeight = Math.max(1, Math.ceil(height * particleScale));
        if (particleCanvas.width !== particleWidth || particleCanvas.height !== particleHeight) {
          particleCanvas.width = particleWidth;
          particleCanvas.height = particleHeight;
        }
        particleContext.clearRect(0, 0, particleWidth, particleHeight);
      }

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.age += deltaSeconds * (isPausedFrame ? 2.4 : 1);
        if (particle.age >= particle.life) {
          particles.splice(index, 1);
          continue;
        }

        particle.x += particle.vx * deltaSeconds;
        particle.y += particle.vy * deltaSeconds;
        particle.vx *= 0.998;
        particle.vy *= 0.998;

        const lifeProgress = particle.age / particle.life;
        const fade = Math.sin(lifeProgress * Math.PI);
        const edgeFadeX = Math.min(1, particle.x / (width * 0.2), (width - particle.x) / (width * 0.2));
        const edgeFadeY = Math.min(1, particle.y / (height * 0.22), (height - particle.y) / (height * 0.2));
        const alpha = Math.max(0, fade * edgeFadeX * edgeFadeY) * (0.82 + mid * 0.08 + treble * 0.08);
        particle.renderAlpha = alpha;
        if (alpha <= 0.001) {
          continue;
        }

        if (particleContext !== null) {
          const mosaicX = particle.x * particleScale;
          const mosaicY = particle.y * particleScale;
          const mosaicSize = Math.max(1.4, particle.size * particleScale);
          particleContext.save();
          particleContext.globalAlpha = Math.min(1, alpha);
          particleContext.fillStyle = '#79bdff';
          particleContext.beginPath();
          particleContext.arc(mosaicX, mosaicY, mosaicSize * 0.62, 0, Math.PI * 2);
          particleContext.fill();
          particleContext.restore();
        }
      }

      if (particleContext !== null) {
        context.save();
        context.imageSmoothingEnabled = false;
        context.drawImage(particleCanvas, 0, 0, width, height);
        context.restore();
      }

      context.beginPath();
      context.arc(centerX, centerY, baseRadius * 1.02, 0, Math.PI * 2);
      context.fillStyle = '#fff';
      context.fill();

      const pulseRadius = baseRadius + bass * size * 0.065;
      context.beginPath();
      context.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      context.strokeStyle = `rgba(0, 0, 0, ${0.08 + bass * 0.18})`;
      context.lineWidth = Math.max(1, size * 0.012);
      context.stroke();

      const readBin = (binIndex: number): number =>
        (visualFrequencyData[Math.min(visualFrequencyData.length - 1, Math.max(1, binIndex))] ?? 0) / 255;
      const getAngularDistance = (angleA: number, angleB: number): number =>
        Math.abs(Math.atan2(Math.sin(angleA - angleB), Math.cos(angleA - angleB)));

      for (let index = 0; index < barCount; index += 1) {
        const angle = (index / barCount) * Math.PI * 2 - Math.PI / 2;
        const normalizedIndex = index / (barCount - 1);
        let lineEnergy = treble;
        let harmonic = 0;

        if (shouldEvenlyDistribute) {
          const timeOffset = Math.floor(currentTime * 13);
          const lowSample = readBin(3 + ((index * 7 + timeOffset) % 46));
          const lowMirror = readBin(10 + (((barCount - index) * 5 + timeOffset) % 72));
          const midSample = readBin(46 + ((index * 19 + timeOffset * 2) % 230));
          const highSample = readBin(170 + ((index * 29 + timeOffset * 3) % 540));
          const alternatingBand = index % 3 === 0 ? lowMirror : index % 3 === 1 ? midSample : highSample;
          const circularMotion =
            0.78 +
            ((Math.sin(angle * 5 + currentTime * 1.8) + 1) / 2) * 0.2 +
            ((Math.sin(angle * 9 - currentTime * 2.3) + 1) / 2) * 0.1;

          harmonic =
            (lowSample * 0.16 +
              lowMirror * 0.12 +
              midSample * 0.31 +
              highSample * 0.24 +
              alternatingBand * 0.2 +
              bass * 0.08 +
              mid * 0.1 +
              treble * 0.07) *
            circularMotion;
          const quietPocket = Math.max(0, 1 - getAngularDistance(angle, quietArcCenter) / quietArcWidth);
          const quietEase = quietPocket * quietPocket * (3 - quietPocket * 2);
          harmonic *= 1 - quietEase * 0.26;
          lineEnergy = Math.max(midSample, highSample, treble * 0.9);
        } else {
          const binIndex = Math.min(
            visualFrequencyData.length - 1,
            Math.max(1, Math.round(Math.pow(normalizedIndex, 1.55) * 520)),
          );
          const magnitude = (visualFrequencyData[binIndex] ?? 0) / 255;
          harmonic =
            magnitude * 0.72 +
            bass * (1 - normalizedIndex) * 0.18 +
            mid * Math.sin(normalizedIndex * Math.PI) * 0.16 +
            treble * normalizedIndex * 0.18;

          if (shouldLiftLowEnd) {
            const leftArc = Math.max(0, 1 - getAngularDistance(angle, Math.PI) / 1.35);
            const leftEase = leftArc * leftArc * (3 - leftArc * 2);
            const lowEndStrength = Math.max(
              bass,
              readBin(5) * 0.46 + readBin(15) * 0.34 + readBin(34) * 0.2,
            );
            harmonic += leftEase * (0.045 + lowEndStrength * 0.2 + mid * 0.055);
          }
        }

        const cappedHarmonic = Math.min(1, Math.max(0, harmonic));
        const barLength = size * (0.028 + Math.pow(cappedHarmonic, 1.2) * 0.25);
        const innerRadius = baseRadius + size * 0.018;
        const outerRadius = innerRadius + barLength;
        const x1 = centerX + Math.cos(angle) * innerRadius;
        const y1 = centerY + Math.sin(angle) * innerRadius;
        const x2 = centerX + Math.cos(angle) * outerRadius;
        const y2 = centerY + Math.sin(angle) * outerRadius;
        const alpha = 0.12 + Math.min(0.68, cappedHarmonic * 0.78);

        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
        context.lineWidth = Math.max(1, size * (0.004 + lineEnergy * 0.004));
        context.lineCap = 'round';
        context.stroke();

        const segmentDeltaX = x2 - x1;
        const segmentDeltaY = y2 - y1;
        const segmentLengthSquared = segmentDeltaX * segmentDeltaX + segmentDeltaY * segmentDeltaY;
        const segmentLength = Math.sqrt(segmentLengthSquared);
        if (segmentLength > 0) {
          for (const particle of particles) {
            if (particle.renderAlpha <= 0.03) {
              continue;
            }

            const projection = clampNumber(
              ((particle.x - x1) * segmentDeltaX + (particle.y - y1) * segmentDeltaY) /
                segmentLengthSquared,
              0,
              1,
            );
            const closestX = x1 + segmentDeltaX * projection;
            const closestY = y1 + segmentDeltaY * projection;
            const distanceX = particle.x - closestX;
            const distanceY = particle.y - closestY;
            const invertRadius = particle.size * 0.78 + particlePixelSize * 1.15;
            const distanceSquared = distanceX * distanceX + distanceY * distanceY;
            if (distanceSquared > invertRadius * invertRadius) {
              continue;
            }

            const halfSegmentT = Math.sqrt(invertRadius * invertRadius - distanceSquared) / segmentLength;
            const startT = clampNumber(projection - halfSegmentT, 0, 1);
            const endT = clampNumber(projection + halfSegmentT, 0, 1);
            context.beginPath();
            context.moveTo(x1 + segmentDeltaX * startT, y1 + segmentDeltaY * startT);
            context.lineTo(x1 + segmentDeltaX * endT, y1 + segmentDeltaY * endT);
            context.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, particle.renderAlpha * 1.1)})`;
            context.lineWidth = Math.max(1.2, size * (0.004 + lineEnergy * 0.004));
            context.lineCap = 'round';
            context.stroke();
          }
        }
      }

      context.beginPath();
      context.arc(centerX, centerY, baseRadius * 0.45 + mid * size * 0.035, 0, Math.PI * 2);
      context.fillStyle = `rgba(0, 0, 0, ${0.04 + mid * 0.1})`;
      context.fill();

      if (trackProgress > 0) {
        const progressRingRadius = baseRadius * 0.72;
        const progressRingStart = -Math.PI / 2;
        const progressRingEnd =
          trackProgress >= 0.999
            ? progressRingStart + Math.PI * 2
            : progressRingStart + Math.PI * 2 * trackProgress;
        context.beginPath();
        context.arc(centerX, centerY, progressRingRadius, progressRingStart, progressRingEnd);
        context.strokeStyle = 'rgba(0, 0, 0, 0.62)';
        context.lineWidth = Math.max(2, size * 0.011);
        context.lineCap = trackProgress >= 0.999 ? 'butt' : 'round';
        context.stroke();
      }

      frameId = window.requestAnimationFrame(draw);
    };

    resizeCanvas();
    draw();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      try {
        source.disconnect();
      } catch {
        // Ignore disconnect races during page changes.
      }
      analyser.disconnect();
    };
  }, [activeTrackId, audioElement, playbackMode]);

  return (
    <div
      aria-hidden="true"
      style={{
        ...visualizerLayerStyle,
        ...layerStyle,
      }}>
      <div
        style={{
          ...visualizerContentLayerStyle,
          opacity: isVisualizerVisible ? 1 : 0,
        }}>
        <canvas ref={canvasRef} style={visualizerCanvasStyle} />
        {isVisualizerVisible ? (
          <button
            type="button"
            aria-label="Seek current shop track"
            style={visualizerProgressHitAreaStyle}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              seekAudioFromProgressPointer(event);
            }}
            onPointerMove={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                seekAudioFromProgressPointer(event);
              }
            }}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
            }}
            onPointerCancel={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
            }}
          />
        ) : null}
        {activeCoverSrc !== null && audioElement !== null && isVisualizerVisible ? (
          <button
            type="button"
            aria-label={isPlaybackPaused ? 'Play current shop track' : 'Pause current shop track'}
            className="new-music-visualizer-cover"
            style={{
              ...visualizerCoverStyle,
              animationPlayState: isPlaybackPaused ? 'paused' : 'running',
              backgroundImage: `url("${activeCoverSrc}")`,
            }}
            onClick={() => {
              if (isPlaybackPaused || audioElement.paused) {
                setIsVisualizerHidden(false);
                setIsPlaybackPaused(false);
                void audioElement.play().catch(() => {
                  setIsPlaybackPaused(true);
                });
                return;
              }
              audioElement.pause();
              setIsVisualizerHidden(false);
              setIsPlaybackPaused(true);
            }}
          />
        ) : null}
      </div>
      <p
        style={{
          ...visualizerPlaceholderTextStyle,
          opacity: isVisualizerVisible ? 0 : 1,
          transition: isVisualizerVisible ? 'opacity 140ms ease' : 'opacity 2.4s ease 520ms',
        }}>
        ( ambient battle + meditation music )
      </p>
    </div>
  );
}

type TrackControlProps = {
  activeTrackId: number | null;
  activeTrackRestartToken: number;
  isPlaybackPaused: boolean;
  label: 'A' | 'B';
  onDemoSeekBlocked: () => void;
  onSampleLimitReached: () => void;
  playbackMode: ShopTrackPlaybackMode;
  setActiveAudioElement: Dispatch<SetStateAction<HTMLAudioElement | null>>;
  setActiveTrackId: Dispatch<SetStateAction<number | null>>;
  setIsPlaybackPaused: Dispatch<SetStateAction<boolean>>;
  setIsVisualizerHidden: Dispatch<SetStateAction<boolean>>;
  setShufflePlayedTrackIds: Dispatch<SetStateAction<number[]>>;
  shufflePlayedTrackIds: number[];
  track: ShopDropTrack;
  volume: number;
};

function ShopDropTrackControl({
  activeTrackId,
  activeTrackRestartToken,
  isPlaybackPaused,
  label,
  onDemoSeekBlocked,
  onSampleLimitReached,
  playbackMode,
  setActiveAudioElement,
  setActiveTrackId,
  setIsPlaybackPaused,
  setIsVisualizerHidden,
  setShufflePlayedTrackIds,
  shufflePlayedTrackIds,
  track,
  volume,
}: TrackControlProps): ReactNode {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastRestartTokenRef = useRef(activeTrackRestartToken);
  const wasActiveTrackRef = useRef(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const isActiveTrack = activeTrackId === track.id;
  const isPlaying = isActiveTrack && !isPlaybackPaused;
  const isSampleMode = playbackMode === 'sample';
  const sampleMarkerLeft =
    duration > SHOP_TRACK_SAMPLE_SECONDS
      ? `${(SHOP_TRACK_SAMPLE_SECONDS / duration) * 100}%`
      : '100%';

  const stopCurrentTrack = (trackId: number): void => {
    setIsVisualizerHidden(true);
    setIsPlaybackPaused(true);
    window.setTimeout(() => {
      setActiveTrackId((current) => {
        if (current !== trackId) {
          return current;
        }
        setIsPlaybackPaused(false);
        setIsVisualizerHidden(false);
        return null;
      });
    }, 1000);
  };

  const finishCurrentTrack = (audio: HTMLAudioElement, didReachSampleLimit = false): void => {
    audio.pause();
    audio.currentTime = 0;
    setCurrentTime(0);

    if (isSampleMode) {
      if (didReachSampleLimit) {
        onSampleLimitReached();
      }
      const nextSampleTrackId = getShopDropSampleNextTrackId(track.id);
      if (nextSampleTrackId !== null) {
        setIsVisualizerHidden(false);
        setIsPlaybackPaused(false);
        setShufflePlayedTrackIds([]);
        setActiveTrackId(nextSampleTrackId);
        return;
      }
      stopCurrentTrack(track.id);
      return;
    }

    if (playbackMode === 'loop-one') {
      audio.currentTime = 0;
      setIsVisualizerHidden(false);
      setIsPlaybackPaused(false);
      void audio.play().catch(() => {
        setIsPlaybackPaused(true);
      });
      return;
    }

    if (playbackMode === 'loop-all') {
      const currentIndex = SHOP_DROP_TRACK_ORDER.indexOf(track.id);
      const nextTrackId =
        SHOP_DROP_TRACK_ORDER[(currentIndex + 1) % SHOP_DROP_TRACK_ORDER.length] ?? SHOP_DROP_TRACK_ORDER[0];
      if (nextTrackId === undefined) {
        return;
      }
      setIsVisualizerHidden(false);
      setIsPlaybackPaused(false);
      setShufflePlayedTrackIds([]);
      setActiveTrackId(nextTrackId);
      return;
    }

    if (playbackMode === 'shuffle') {
      const playedTrackIds = new Set(shufflePlayedTrackIds.length > 0 ? shufflePlayedTrackIds : [track.id]);
      playedTrackIds.add(track.id);
      if (playedTrackIds.size < SHOP_DROP_TRACK_ORDER.length) {
        const unplayedTrackIds = SHOP_DROP_TRACK_ORDER.filter((trackId) => !playedTrackIds.has(trackId));
        const nextTrackId =
          unplayedTrackIds[Math.floor(Math.random() * unplayedTrackIds.length)] ?? unplayedTrackIds[0];
        if (nextTrackId === undefined) {
          return;
        }
        setIsVisualizerHidden(false);
        setIsPlaybackPaused(false);
        setShufflePlayedTrackIds([...playedTrackIds, nextTrackId]);
        setActiveTrackId(nextTrackId);
        return;
      }
      setShufflePlayedTrackIds([]);
    }

    stopCurrentTrack(track.id);
  };

  useEffect(() => {
    if (audioRef.current !== null) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio === null) {
      return;
    }
    const shouldRestartActiveTrack = isActiveTrack && activeTrackRestartToken !== lastRestartTokenRef.current;
    lastRestartTokenRef.current = activeTrackRestartToken;
    const becameActiveTrack = isActiveTrack && !wasActiveTrackRef.current;
    wasActiveTrackRef.current = isActiveTrack;
    audio.volume = volume;
    if (!isActiveTrack) {
      audio.pause();
      setActiveAudioElement((current) => (current === audio ? null : current));
      return;
    }
    setActiveAudioElement(audio);
    if (isPlaybackPaused) {
      audio.pause();
      return;
    }
    if (
      shouldRestartActiveTrack ||
      (isSampleMode && (becameActiveTrack || audio.currentTime >= SHOP_TRACK_SAMPLE_SECONDS))
    ) {
      audio.currentTime = 0;
      setCurrentTime(0);
    }
    void audio.play().catch(() => {
      setActiveTrackId(null);
      setIsPlaybackPaused(false);
      setIsVisualizerHidden(false);
    });
  }, [
    isActiveTrack,
    activeTrackRestartToken,
    isPlaybackPaused,
    setActiveAudioElement,
    setActiveTrackId,
    setIsPlaybackPaused,
    setIsVisualizerHidden,
    isSampleMode,
    volume,
  ]);

  return (
    <div style={controlsStyle}>
      <button
        type="button"
        aria-label={isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
        className="new-music-play-button"
        style={playButtonStyle}
        onClick={() => {
          setActiveTrackId((current) => {
            if (current !== track.id) {
              setIsVisualizerHidden(false);
              setIsPlaybackPaused(false);
              setShufflePlayedTrackIds([track.id]);
              return track.id;
            }
            setIsPlaybackPaused((currentPaused) => {
              const nextPaused = !currentPaused;
              setIsVisualizerHidden(nextPaused);
              return nextPaused;
            });
            return current;
          });
        }}>
        {isPlaying ? (
          <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" fill="currentColor">
            <path d="M7 5H10V19H7V5ZM14 5H17V19H14V5Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="currentColor">
            <path d="M8 5V19L19 12L8 5Z" />
          </svg>
        )}
      </button>
      <span style={trackStackStyle}>
        <span style={sliderWrapStyle}>
          <span style={trackSliderInputWrapStyle}>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.01}
              value={Math.min(currentTime, duration || currentTime)}
              aria-label={`Seek ${track.title}`}
              style={trackSliderStyle}
              className="new-music-track-slider"
              onChange={(event) => {
                const requestedTime = Number(event.currentTarget.value);
                const isBlockedDemoSeek = isSampleMode && requestedTime > SHOP_TRACK_SAMPLE_SECONDS;
                if (isBlockedDemoSeek) {
                  onDemoSeekBlocked();
                  if (!isPlaying) {
                    setCurrentTime(0);
                    if (audioRef.current !== null) {
                      audioRef.current.currentTime = 0;
                    }
                    setIsVisualizerHidden(false);
                    setIsPlaybackPaused(false);
                    setShufflePlayedTrackIds([track.id]);
                    setActiveTrackId(track.id);
                  }
                  return;
                }
                const nextTime = isSampleMode
                  ? Math.min(requestedTime, SHOP_TRACK_SAMPLE_SECONDS)
                  : requestedTime;
                setCurrentTime(nextTime);
                if (audioRef.current !== null) {
                  audioRef.current.currentTime = nextTime;
                  if (isSampleMode && nextTime >= SHOP_TRACK_SAMPLE_SECONDS && isPlaying) {
                    finishCurrentTrack(audioRef.current, true);
                  }
                }
              }}
            />
            {isSampleMode ? (
              <span
                style={{
                  ...sampleMarkerStyle,
                  left: sampleMarkerLeft,
                }}
              />
            ) : null}
          </span>
          <span style={timeLabelStyle}>
            {formatTrackTime(isActiveTrack ? currentTime : duration)}
          </span>
        </span>
        <p style={trackTitleStyle}>
          <span style={trackTitlePrefixStyle}>{label} - </span>
          <span style={{fontWeight: isPlaying ? 900 : 400, letterSpacing: isPlaying ? 0.45 : 0}}>
            {track.title}
          </span>
        </p>
      </span>
      <audio
        ref={audioRef}
        src={track.audioSrc}
        preload="metadata"
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration || 0);
        }}
        onTimeUpdate={(event) => {
          const audio = event.currentTarget;
          if (isSampleMode && audio.currentTime >= SHOP_TRACK_SAMPLE_SECONDS) {
            finishCurrentTrack(audio, true);
            return;
          }
          setCurrentTime(audio.currentTime);
        }}
        onEnded={(event) => {
          finishCurrentTrack(event.currentTarget);
        }}
      />
    </div>
  );
}

type CaseCardProps = {
  activeTrackId: number | null;
  activeTrackRestartToken: number;
  carouselAnimation?: string;
  caseIndex: number;
  draggingCaseId: number | null;
  hoveredCaseId: number | null;
  isCarouselVisible?: boolean;
  isPlaybackPaused: boolean;
  isThinView?: boolean;
  item: ShopDropCase;
  onExpandCase: (item: ShopDropCase) => void;
  onDemoSeekBlocked: () => void;
  onSampleLimitReached: () => void;
  playbackMode: ShopTrackPlaybackMode;
  resetToken: string;
  shortLayoutAmount: number;
  showTrackControls?: boolean;
  setDraggingCaseId: Dispatch<SetStateAction<number | null>>;
  setActiveAudioElement: Dispatch<SetStateAction<HTMLAudioElement | null>>;
  setActiveTrackId: Dispatch<SetStateAction<number | null>>;
  setActiveTrackRestartToken: Dispatch<SetStateAction<number>>;
  setHoveredCaseId: Dispatch<SetStateAction<number | null>>;
  setIsPlaybackPaused: Dispatch<SetStateAction<boolean>>;
  setIsVisualizerHidden: Dispatch<SetStateAction<boolean>>;
  setShufflePlayedTrackIds: Dispatch<SetStateAction<number[]>>;
  shufflePlayedTrackIds: number[];
  volume: number;
};

function ShopDropCaseCard({
  activeTrackId,
  activeTrackRestartToken,
  carouselAnimation,
  caseIndex,
  draggingCaseId,
  hoveredCaseId,
  isCarouselVisible = true,
  isPlaybackPaused,
  isThinView = false,
  item,
  onExpandCase,
  onDemoSeekBlocked,
  onSampleLimitReached,
  playbackMode,
  resetToken,
  shortLayoutAmount,
  showTrackControls = true,
  setDraggingCaseId,
  setActiveAudioElement,
  setActiveTrackId,
  setActiveTrackRestartToken,
  setHoveredCaseId,
  setIsPlaybackPaused,
  setIsVisualizerHidden,
  setShufflePlayedTrackIds,
  shufflePlayedTrackIds,
  volume,
}: CaseCardProps): ReactNode {
  const initialRotationYByIndex = [0.48, 0.24, 0, -0.24, -0.39];
  const initialRotationX = isThinView ? 0 : -0.2;
  const initialRotationY = isThinView ? 0 : (initialRotationYByIndex[caseIndex] ?? 0);
  const initialRotationZ = isThinView ? 0 : -0.045;
  const isPointerOverCaseRef = useRef(false);
  const isPlayingCase = !isPlaybackPaused && item.tracks.some((track) => track.id === activeTrackId);
  const isCaseScaled =
    isPlayingCase || draggingCaseId === item.id || (draggingCaseId === null && hoveredCaseId === item.id);
  const wideArcOffsetYByIndex = [0, 12, 22, 12, 0];
  const wideArcOffsetY = wideArcOffsetYByIndex[caseIndex] ?? 0;
  const wideCaseShiftY = Math.round(interpolateNumber(90, 24, shortLayoutAmount));
  const thinCaseShiftY = Math.round(interpolateNumber(92, 34, shortLayoutAmount));
  const articleStyle = isThinView
    ? {
        ...thinCaseCardStyle,
        transform: `translate(-50%, calc(-50% + ${thinCaseShiftY}px))`,
      }
    : {
        ...caseCardStyle,
        transform: `translateY(${wideCaseShiftY + wideArcOffsetY}px)`,
      };
  const canvasMinHeight = Math.round(interpolateNumber(isThinView ? 190 : 210, isThinView ? 140 : 155, shortLayoutAmount));
  const canvasMaxHeight = Math.round(interpolateNumber(isThinView ? 285 : 270, isThinView ? 205 : 205, shortLayoutAmount));
  const canvasViewportHeight = interpolateNumber(isThinView ? 32 : 38, isThinView ? 25 : 28, shortLayoutAmount).toFixed(2);
  const canvasShellBaseStyle = {
    ...(isThinView ? thinCanvasShellStyle : canvasShellStyle),
    height: `clamp(${canvasMinHeight}px, ${canvasViewportHeight}vh, ${canvasMaxHeight}px)`,
    minHeight: canvasMinHeight,
  };
  const playASideFromBeginning = (): void => {
    const aSideTrackId = item.tracks[0].id;
    setIsVisualizerHidden(false);
    setIsPlaybackPaused(false);
    setShufflePlayedTrackIds([aSideTrackId]);
    setActiveTrackRestartToken((current) => current + 1);
    setActiveTrackId(aSideTrackId);
  };

  return (
    <article
      style={{
        ...articleStyle,
        opacity: isCarouselVisible ? 1 : 0,
        pointerEvents: isCarouselVisible ? 'auto' : 'none',
        zIndex: isCarouselVisible ? (isCaseScaled ? 3 : 1) : 0,
      }}>
      <div
        style={{
          ...caseCanvasAnimationWrapStyle,
          animation: carouselAnimation,
        }}>
        <div
          style={{
            ...canvasShellBaseStyle,
            transform: isCaseScaled ? canvasShellScaleStyle.transform : 'scale(1)',
            transformOrigin: canvasShellScaleStyle.transformOrigin,
            transition: canvasShellScaleStyle.transition,
            willChange: canvasShellScaleStyle.willChange,
          }}
          onPointerEnter={() => {
            isPointerOverCaseRef.current = true;
            if (draggingCaseId === null) {
              setHoveredCaseId(item.id);
            }
          }}
          onPointerLeave={() => {
            isPointerOverCaseRef.current = false;
            setHoveredCaseId((current) => (current === item.id ? null : current));
          }}>
          <CdCaseCanvas
            coverSrc={item.coverSrc}
            initialRotationX={initialRotationX}
            initialRotationY={initialRotationY}
            initialRotationZ={initialRotationZ}
            isAutoRotating={isPlayingCase}
            onCaseClick={playASideFromBeginning}
            onCaseDoubleClick={() => {
              onExpandCase(item);
            }}
            onDragEnd={() => {
              setDraggingCaseId(null);
              setHoveredCaseId(isPointerOverCaseRef.current ? item.id : null);
            }}
            onDragStart={() => {
              setDraggingCaseId(item.id);
              setHoveredCaseId(item.id);
            }}
            resetToken={resetToken}
          />
        </div>
      </div>
      <div
        style={{
          ...caseControlsStackStyle,
          opacity: showTrackControls ? 1 : 0,
          pointerEvents: showTrackControls ? 'auto' : 'none',
        }}>
        {item.tracks.map((track, index) => (
          <ShopDropTrackControl
            key={track.id}
            activeTrackId={activeTrackId}
            activeTrackRestartToken={activeTrackRestartToken}
            isPlaybackPaused={isPlaybackPaused}
            label={index === 0 ? 'A' : 'B'}
            onDemoSeekBlocked={onDemoSeekBlocked}
            onSampleLimitReached={onSampleLimitReached}
            playbackMode={playbackMode}
            setActiveAudioElement={setActiveAudioElement}
            setActiveTrackId={setActiveTrackId}
            setIsPlaybackPaused={setIsPlaybackPaused}
            setIsVisualizerHidden={setIsVisualizerHidden}
            setShufflePlayedTrackIds={setShufflePlayedTrackIds}
            shufflePlayedTrackIds={shufflePlayedTrackIds}
            track={track}
            volume={volume}
          />
        ))}
      </div>
    </article>
  );
}

export default function ShopTracksPage(): ReactNode {
  const [activeTrackId, setActiveTrackId] = useState<number | null>(null);
  const [activeTrackRestartToken, setActiveTrackRestartToken] = useState(0);
  const [activeAudioElement, setActiveAudioElement] = useState<HTMLAudioElement | null>(null);
  const [draggingCaseId, setDraggingCaseId] = useState<number | null>(null);
  const [hoveredCaseId, setHoveredCaseId] = useState<number | null>(null);
  const [isPlaybackPaused, setIsPlaybackPaused] = useState(false);
  const [isVisualizerHidden, setIsVisualizerHidden] = useState(false);
  const [hasUsedPlaybackModeSwitch, setHasUsedPlaybackModeSwitch] = useState(false);
  const [hasClosedPlaybackModeHint, setHasClosedPlaybackModeHint] = useState(false);
  const [expandedCase, setExpandedCase] = useState<ShopDropCase | null>(null);
  const [isExpandedCaseVisible, setIsExpandedCaseVisible] = useState(false);
  const [isPlaybackModeHintRendered, setIsPlaybackModeHintRendered] = useState(false);
  const [playbackModeHintAnimationKey, setPlaybackModeHintAnimationKey] = useState(0);
  const [isPlaybackModeHintVisible, setIsPlaybackModeHintVisible] = useState(false);
  const [isPlaybackModeButtonAnimating, setIsPlaybackModeButtonAnimating] = useState(false);
  const [isLayoutVisible, setIsLayoutVisible] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<ShopTrackPlaybackMode>('sample');
  const [shufflePlayedTrackIds, setShufflePlayedTrackIds] = useState<number[]>([]);
  const [visibleCaseIndex, setVisibleCaseIndex] = useState(0);
  const [previousVisibleCaseIndex, setPreviousVisibleCaseIndex] = useState<number | null>(null);
  const [carouselDirection, setCarouselDirection] = useState<ShopTrackCarouselDirection>('next');
  const [topBarHeight, setTopBarHeight] = useState(TOP_BAR_HEIGHT_PX);
  const [volume, setVolume] = useState(1);
  const carouselAnimationTimeoutRef = useRef<number | null>(null);
  const expandedCaseAnimationTimeoutRef = useRef<number | null>(null);
  const playbackModeAnimationTimeoutRef = useRef<number | null>(null);
  const playbackModeHintTimeoutRef = useRef<number | null>(null);
  const topBarRef = useRef<HTMLDivElement | null>(null);
  const isThinView = useShopTracksThinView();
  const viewportHeight = useShopTracksViewportHeight();
  const isLayoutReady = isThinView !== null && viewportHeight !== null;
  const resolvedIsThinView = isThinView ?? false;
  const resolvedViewportHeight = viewportHeight ?? 780;
  const activeCoverSrc = getShopDropCoverForTrack(activeTrackId);
  const cdTiltResetToken = `${resolvedIsThinView ? 'thin' : 'wide'}-${visibleCaseIndex}`;
  const shortLayoutAmount =
    clampNumber((780 - resolvedViewportHeight) / 220, 0, 1);
  const visualizerCompactAmount = Math.pow(shortLayoutAmount, 0.72);
  const topBarExtraHeight = Math.max(0, topBarHeight - TOP_BAR_HEIGHT_PX);
  const shouldHideDownloadForHeight = resolvedViewportHeight < 610;
  const shouldHideVisualizerForHeight = resolvedViewportHeight < 520;
  const visualizerCompactScale = interpolateNumber(1, 0.32, visualizerCompactAmount);
  const responsiveGalleryStyle = {
    ...(resolvedIsThinView ? thinGalleryStyle : galleryStyle),
    top: topBarHeight,
    bottom: Math.round(interpolateNumber(76, 126, shortLayoutAmount)),
  };
  const responsiveVisualizerLayerStyle: CSSProperties = {
    top: Math.round(interpolateNumber(66, 26, visualizerCompactAmount)) + topBarExtraHeight,
    width: 'min(920px, calc(100vw - 24px))',
    height: 360,
    transform: `translateX(-50%) scale(${visualizerCompactScale.toFixed(3)})`,
    transformOrigin: '50% 0',
  };
  const carouselArrowTop = `calc(50% + ${Math.round(interpolateNumber(58, 18, shortLayoutAmount))}px)`;
  const responsiveBottomControlsStyle: CSSProperties = {
    ...bottomControlsStyle,
    gap: shouldHideDownloadForHeight ? 3 : bottomControlsStyle.gap,
  };
  const responsiveDownloadButtonStyle: CSSProperties = {
    ...downloadButtonStyle,
    backgroundColor: resolvedIsThinView ? 'transparent' : downloadButtonStyle.backgroundColor,
    display: shouldHideDownloadForHeight ? 'none' : downloadButtonStyle.display,
  };
  const responsivePlaybackModeCalloutStyle = {
    ...playbackModeCalloutStyle,
    '--shop-tracks-mode-hint-x': resolvedIsThinView
      ? 'calc(-50% - 21px)'
      : 'calc(-50% + 4px)',
    ...(resolvedIsThinView
      ? {
          width: 116,
          padding: '8px 14px 8px 10px',
          transform: 'translateX(calc(-50% - 21px))',
        }
      : {}),
  } as CSSProperties;
  const responsivePlaybackModeCalloutBreakStyle: CSSProperties = {
    ...playbackModeCalloutBreakStyle,
    ...(resolvedIsThinView ? {left: 'calc(50% + 24.5px)'} : {}),
  };
  const responsivePlaybackModeCalloutPointerStyle: CSSProperties = {
    ...playbackModeCalloutPointerStyle,
    ...(resolvedIsThinView ? {left: 'calc(50% + 24.5px)'} : {}),
  };

  useEffect(() => {
    const topBar = topBarRef.current;
    if (topBar === null) {
      return undefined;
    }

    const updateTopBarHeight = (): void => {
      setTopBarHeight(Math.ceil(topBar.getBoundingClientRect().height));
    };

    updateTopBarHeight();
    const resizeObserver = new ResizeObserver(updateTopBarHeight);
    resizeObserver.observe(topBar);
    window.addEventListener('resize', updateTopBarHeight);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateTopBarHeight);
    };
  }, []);

  useEffect(() => {
    if (!isLayoutReady) {
      setIsLayoutVisible(false);
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      setIsLayoutVisible(true);
    });
    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isLayoutReady]);

  useEffect(() => {
    return () => {
      if (carouselAnimationTimeoutRef.current !== null) {
        window.clearTimeout(carouselAnimationTimeoutRef.current);
      }
      if (playbackModeAnimationTimeoutRef.current !== null) {
        window.clearTimeout(playbackModeAnimationTimeoutRef.current);
      }
      if (expandedCaseAnimationTimeoutRef.current !== null) {
        window.clearTimeout(expandedCaseAnimationTimeoutRef.current);
      }
      if (playbackModeHintTimeoutRef.current !== null) {
        window.clearTimeout(playbackModeHintTimeoutRef.current);
      }
    };
  }, []);

  const showCarouselCase = (direction: ShopTrackCarouselDirection): void => {
    if (carouselAnimationTimeoutRef.current !== null) {
      window.clearTimeout(carouselAnimationTimeoutRef.current);
    }
    setPreviousVisibleCaseIndex(visibleCaseIndex);
    setCarouselDirection(direction);
    setVisibleCaseIndex((currentIndex) => {
      const offset = direction === 'next' ? 1 : -1;
      return (currentIndex + offset + SHOP_DROP_CASES.length) % SHOP_DROP_CASES.length;
    });
    carouselAnimationTimeoutRef.current = window.setTimeout(() => {
      setPreviousVisibleCaseIndex(null);
      carouselAnimationTimeoutRef.current = null;
    }, 280);
  };

  const showPlaybackModeHint = (): void => {
    if (!hasUsedPlaybackModeSwitch && !hasClosedPlaybackModeHint) {
      if (playbackModeHintTimeoutRef.current !== null) {
        window.clearTimeout(playbackModeHintTimeoutRef.current);
      }
      setIsPlaybackModeHintRendered(true);
      setPlaybackModeHintAnimationKey((current) => current + 1);
      setIsPlaybackModeHintVisible(false);
      playbackModeHintTimeoutRef.current = window.setTimeout(() => {
        setIsPlaybackModeHintVisible(true);
        playbackModeHintTimeoutRef.current = null;
      }, 20);
    }
  };

  const forceShowPlaybackModeHint = (): void => {
    if (playbackModeHintTimeoutRef.current !== null) {
      window.clearTimeout(playbackModeHintTimeoutRef.current);
    }
    setIsPlaybackModeHintRendered(true);
    setPlaybackModeHintAnimationKey((current) => current + 1);
    setIsPlaybackModeHintVisible(false);
    playbackModeHintTimeoutRef.current = window.setTimeout(() => {
      setIsPlaybackModeHintVisible(true);
      playbackModeHintTimeoutRef.current = null;
    }, 20);
  };

  const hidePlaybackModeHint = (): void => {
    if (playbackModeHintTimeoutRef.current !== null) {
      window.clearTimeout(playbackModeHintTimeoutRef.current);
    }
    setIsPlaybackModeHintVisible(false);
    playbackModeHintTimeoutRef.current = window.setTimeout(() => {
      setIsPlaybackModeHintRendered(false);
      playbackModeHintTimeoutRef.current = null;
    }, 220);
  };

  const closePlaybackModeHint = (): void => {
    if (playbackModeHintTimeoutRef.current !== null) {
      window.clearTimeout(playbackModeHintTimeoutRef.current);
      playbackModeHintTimeoutRef.current = null;
    }
    setHasClosedPlaybackModeHint(true);
    setIsPlaybackModeHintVisible(false);
    setIsPlaybackModeHintRendered(false);
  };

  const markPlaybackModeSwitchUsed = (): void => {
    setHasUsedPlaybackModeSwitch(true);
    hidePlaybackModeHint();
  };

  const animatePlaybackModeButton = (): void => {
    if (playbackModeAnimationTimeoutRef.current !== null) {
      window.clearTimeout(playbackModeAnimationTimeoutRef.current);
    }
    setIsPlaybackModeButtonAnimating(true);
    playbackModeAnimationTimeoutRef.current = window.setTimeout(() => {
      setIsPlaybackModeButtonAnimating(false);
      playbackModeAnimationTimeoutRef.current = null;
    }, 180);
  };

  const openExpandedCase = (item: ShopDropCase): void => {
    if (expandedCaseAnimationTimeoutRef.current !== null) {
      window.clearTimeout(expandedCaseAnimationTimeoutRef.current);
      expandedCaseAnimationTimeoutRef.current = null;
    }
    setExpandedCase(item);
    setIsExpandedCaseVisible(false);
    expandedCaseAnimationTimeoutRef.current = window.setTimeout(() => {
      setIsExpandedCaseVisible(true);
      expandedCaseAnimationTimeoutRef.current = null;
    }, 20);
  };

  const closeExpandedCase = (): void => {
    if (expandedCaseAnimationTimeoutRef.current !== null) {
      window.clearTimeout(expandedCaseAnimationTimeoutRef.current);
    }
    setIsExpandedCaseVisible(false);
    expandedCaseAnimationTimeoutRef.current = window.setTimeout(() => {
      setExpandedCase(null);
      expandedCaseAnimationTimeoutRef.current = null;
    }, 260);
  };

  return (
    <main aria-label="shop tracks research dept." style={pageStyle}>
      <style>{newMusicSliderStyles}</style>
      <div ref={topBarRef} aria-label="shop tracks top bar" style={topBarStyle}>
        <span style={topBarTitleStyle}>mons future aesthetical research dept.</span>
        <div style={topBarButtonsStyle}>
          <button
            type="button"
            style={topBarButtonStyle}
            onClick={() => {
              window.location.assign('/drainer-grid');
            }}>
            icon ocean
          </button>
          <button
            type="button"
            style={topBarButtonStyle}
            onClick={() => {
              window.location.assign('/3d-board');
            }}>
            3d board
          </button>
          <button
            type="button"
            aria-current="page"
            style={topBarButtonActiveStyle}
            onClick={() => {
              window.location.assign('/shop-tracks');
            }}>
            shop tracks
          </button>
        </div>
      </div>
      {isLayoutReady ? (
        <div
          style={{
            ...settledContentLayerStyle,
            opacity: isLayoutVisible ? 1 : 0,
          }}>
      <AudioRadialVisualizer
        activeCoverSrc={activeCoverSrc}
        activeTrackId={activeTrackId}
        audioElement={activeAudioElement}
        isPlaybackPaused={isPlaybackPaused}
        isVisualizerHidden={isVisualizerHidden || shouldHideVisualizerForHeight}
        layerStyle={responsiveVisualizerLayerStyle}
        playbackMode={playbackMode}
        setIsPlaybackPaused={setIsPlaybackPaused}
        setIsVisualizerHidden={setIsVisualizerHidden}
      />
      <section aria-label="Shop drop tracks" style={responsiveGalleryStyle}>
        {resolvedIsThinView ? (
          <button
            type="button"
            aria-label="Previous album"
            style={{...carouselArrowLeftStyle, top: carouselArrowTop}}
            onClick={() => {
              showCarouselCase('previous');
            }}>
            <svg viewBox="0 0 24 48" width="24" height="48" aria-hidden="true">
              <path
                d="M15 14L7 24L15 34"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.4"
              />
            </svg>
          </button>
        ) : null}
        {SHOP_DROP_CASES.map((item, index) => {
          const isCurrentCarouselCase = !resolvedIsThinView || index === visibleCaseIndex;
          const isLeavingCarouselCase = resolvedIsThinView && index === previousVisibleCaseIndex;
          const isVisibleCarouselCase = isCurrentCarouselCase || isLeavingCarouselCase;
          const carouselAnimation =
            !resolvedIsThinView || previousVisibleCaseIndex === null
              ? undefined
              : isCurrentCarouselCase
                ? `shop-tracks-case-enter-${carouselDirection} 260ms ease both`
                : isLeavingCarouselCase
                  ? `shop-tracks-case-exit-${carouselDirection} 260ms ease both`
                  : undefined;

          return (
          <ShopDropCaseCard
            key={item.id}
            activeTrackId={activeTrackId}
            activeTrackRestartToken={activeTrackRestartToken}
            carouselAnimation={carouselAnimation}
            caseIndex={index}
            draggingCaseId={draggingCaseId}
            hoveredCaseId={hoveredCaseId}
            isCarouselVisible={isVisibleCarouselCase}
            isPlaybackPaused={isPlaybackPaused}
            isThinView={resolvedIsThinView}
            item={item}
            onExpandCase={openExpandedCase}
            onDemoSeekBlocked={forceShowPlaybackModeHint}
            onSampleLimitReached={showPlaybackModeHint}
            playbackMode={playbackMode}
            resetToken={cdTiltResetToken}
            shortLayoutAmount={shortLayoutAmount}
            showTrackControls={isCurrentCarouselCase}
            setDraggingCaseId={setDraggingCaseId}
            setActiveAudioElement={setActiveAudioElement}
            setActiveTrackId={setActiveTrackId}
            setActiveTrackRestartToken={setActiveTrackRestartToken}
            setHoveredCaseId={setHoveredCaseId}
            setIsPlaybackPaused={setIsPlaybackPaused}
            setIsVisualizerHidden={setIsVisualizerHidden}
            setShufflePlayedTrackIds={setShufflePlayedTrackIds}
            shufflePlayedTrackIds={shufflePlayedTrackIds}
            volume={volume}
          />
          );
        })}
        {resolvedIsThinView ? (
          <button
            type="button"
            aria-label="Next album"
            style={{...carouselArrowRightStyle, top: carouselArrowTop}}
            onClick={() => {
              showCarouselCase('next');
            }}>
            <svg viewBox="0 0 24 48" width="24" height="48" aria-hidden="true">
              <path
                d="M9 14L17 24L9 34"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.4"
              />
            </svg>
          </button>
        ) : null}
      </section>
      {expandedCase !== null ? (
        <div
          role="presentation"
          style={{
            ...expandedCaseOverlayStyle,
            opacity: isExpandedCaseVisible ? 1 : 0,
          }}
          onClick={closeExpandedCase}>
          <div
            style={{
              ...expandedCaseStageStyle,
              opacity: isExpandedCaseVisible ? 1 : 0,
              transform: isExpandedCaseVisible
                ? 'translateY(-14px) scale(1)'
                : 'translateY(78px) scale(0.52)',
            }}
            onClick={(event) => {
              event.stopPropagation();
            }}>
            <CdCaseCanvas
              canvasStyleOverride={expandedCanvasStyle}
              coverSrc={expandedCase.coverSrc}
              initialRotationX={0}
              initialRotationY={0}
              initialRotationZ={0}
              isAutoRotating={false}
              maxPixelRatio={4}
              modelScale={1.14}
              onDragEnd={() => undefined}
              onSceneMissClick={closeExpandedCase}
              onDragStart={() => undefined}
              preferSharpCover
              resetToken={`expanded-${expandedCase.id}`}
            />
          </div>
        </div>
      ) : null}
      <div style={responsiveBottomControlsStyle}>
        <a
          href={SHOP_DROP_DOWNLOAD_SRC}
          download="mons-shop-drop-tracks.zip"
          style={responsiveDownloadButtonStyle}>
          <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
            <path
              d="M12 3V15M7.5 10.5L12 15L16.5 10.5M5 20H19"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          download all
        </a>
        <label style={volumeControlStyle}>
          <span style={volumeLabelStyle}>
            <VolumeWaveIcon volume={volume} />
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            aria-label="Shop drop track volume"
            className="new-music-track-slider"
            style={trackSliderStyle}
            onChange={(event) => {
              setVolume(Number(event.currentTarget.value));
            }}
          />
          <span style={playbackModeButtonWrapStyle}>
            {isPlaybackModeHintRendered ? (
              <span
                key={playbackModeHintAnimationKey}
                style={{
                  ...responsivePlaybackModeCalloutStyle,
                  animation: isPlaybackModeHintVisible
                    ? `${resolvedIsThinView ? 'shop-tracks-mode-hint-bob-thin' : 'shop-tracks-mode-hint-bob'} 760ms cubic-bezier(0.2, 1.05, 0.3, 1) 70ms both`
                    : undefined,
                  opacity: isPlaybackModeHintVisible ? 1 : 0,
                  transition: 'opacity 180ms ease',
                }}>
                click here to switch out of preview/demo mode
                <button
                  type="button"
                  aria-label="Close preview mode hint"
                  style={playbackModeCalloutCloseButtonStyle}
                  onClick={closePlaybackModeHint}>
                  x
                </button>
                <span style={responsivePlaybackModeCalloutBreakStyle} />
                <span style={responsivePlaybackModeCalloutPointerStyle} />
              </span>
            ) : null}
            <button
              type="button"
              aria-label={`Playback mode: ${SHOP_TRACK_PLAYBACK_MODE_LABELS[playbackMode]}`}
              title={SHOP_TRACK_PLAYBACK_MODE_LABELS[playbackMode]}
              style={playbackModeButtonStyle}
              onClick={() => {
                animatePlaybackModeButton();
                markPlaybackModeSwitchUsed();
                setPlaybackMode((currentMode) => {
                  const currentIndex = SHOP_TRACK_PLAYBACK_MODES.indexOf(currentMode);
                  const nextMode =
                    SHOP_TRACK_PLAYBACK_MODES[(currentIndex + 1) % SHOP_TRACK_PLAYBACK_MODES.length] ?? 'sample';
                  setShufflePlayedTrackIds(nextMode === 'shuffle' && activeTrackId !== null ? [activeTrackId] : []);
                  return nextMode;
                });
              }}>
              <span
                style={{
                  ...playbackModeButtonIconWrapStyle,
                  transform: isPlaybackModeButtonAnimating
                    ? 'scale(1.32)'
                    : 'scale(1)',
                  transition: isPlaybackModeButtonAnimating
                    ? 'transform 95ms cubic-bezier(0.2, 1.6, 0.35, 1)'
                    : 'transform 150ms ease-out',
                }}>
                <PlaybackModeIcon mode={playbackMode} />
              </span>
            </button>
          </span>
        </label>
      </div>
        </div>
      ) : null}
    </main>
  );
}
