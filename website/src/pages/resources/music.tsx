import {useEffect, useRef, useState, type CSSProperties, type ReactNode} from 'react';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import ResourcesSubnav from '@site/src/components/ResourcesSubnav';
import {useSiteMusicPlayer} from '@site/src/components/SiteMusicPlayer';
import SiteMusicVisualizer from '@site/src/components/SiteMusicVisualizer';
import {
  playFavoriteChangeSound,
  preloadSiteSoundEffects,
} from '@site/src/utils/siteSoundEffects';

const DOWNLOAD_ALL_LOADING_MS = 8500;
const DOWNLOAD_ALL_FILE_NAME = 'supermons-tracks.zip';
const DOWNLOAD_ALL_FOLDER_NAME = 'supermons-tracks';
const ZIP_UTF8_FLAG = 0x0800;
const FAVORITE_PULSE_DURATION_MS = 620;

const playerWrapStyle: CSSProperties = {
  width: '100%',
  padding: '13px clamp(14px, 4vw, 42px) 42px',
  boxSizing: 'border-box',
};

const playerShellStyle: CSSProperties = {
  width: 'min(100%, 820px)',
  margin: '0 auto',
  backgroundColor: '#fff',
  color: '#000',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
};

const visualizerStageStyle: CSSProperties = {
  width: 'min(100%, 920px)',
  margin: '0 auto',
};

const nowPlayingStyle: CSSProperties = {
  padding: '1rem 1.1rem 0.9rem',
  display: 'grid',
  gap: '0.32rem',
  transform: 'translateY(-8px)',
};

const eyebrowStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.78rem',
  lineHeight: 1.1,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  opacity: 0.62,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 'clamp(1.25rem, 3vw, 2rem)',
  lineHeight: 1.05,
  fontWeight: 800,
  minWidth: 0,
  display: 'inline',
  overflowWrap: 'anywhere',
};

const titleTextWrapStyle: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  display: 'block',
};

const currentTrackFavoriteButtonStyle: CSSProperties = {
  position: 'relative',
  flex: '0 0 auto',
  width: '31px',
  height: '31px',
  border: 'none',
  background: 'transparent',
  color: '#8f8f8f',
  display: 'inline-flex',
  verticalAlign: 'text-bottom',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  marginLeft: '0.35rem',
  cursor: 'pointer',
  opacity: 0.82,
  transform: 'translateY(1px)',
  transition: 'transform 170ms cubic-bezier(0.22, 1, 0.36, 1), color 160ms ease, filter 160ms ease, opacity 140ms ease',
  overflow: 'visible',
};

const currentTrackFavoriteButtonActiveStyle: CSSProperties = {
  ...currentTrackFavoriteButtonStyle,
  color: '#f2ca3f',
  filter: 'drop-shadow(0 0 3px rgba(242, 202, 63, 0.62))',
  opacity: 1,
};

const titleRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.85rem',
};

const titleVolumeControlStyle: CSSProperties = {
  flex: '0 1 190px',
  minWidth: '118px',
  display: 'grid',
  gridTemplateColumns: '18px minmax(0, 1fr) 34px',
  alignItems: 'center',
  gap: '0.38rem',
};

const downloadAllRowStyle: CSSProperties = {
  width: 'min(100%, 820px)',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'flex-end',
  padding: '0.85rem 0 0',
  boxSizing: 'border-box',
};

const downloadAllButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.45rem',
  border: '1px solid #000',
  borderRadius: 0,
  backgroundColor: '#fff',
  color: '#000',
  padding: '0.42rem 0.72rem',
  fontFamily: 'inherit',
  fontSize: '0.92rem',
  lineHeight: 1.1,
  textDecoration: 'none',
};

const downloadAllButtonLoadingStyle: CSSProperties = {
  ...downloadAllButtonStyle,
  filter: 'brightness(0.96)',
};

const controlsStyle: CSSProperties = {
  padding: '0.9rem 1.1rem 1rem',
  display: 'grid',
  gap: '0.8rem',
  border: '1px solid #000',
};

const controlsBoxStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
};

const controlRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '38px minmax(0, 1fr) 38px',
  alignItems: 'center',
  gap: '0.55rem',
};

const controlClusterStyle: CSSProperties = {
  gridColumn: '2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: '0.55rem',
};

const controlFilterButtonWrapStyle: CSSProperties = {
  gridColumn: '3',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
};

const iconButtonBaseStyle: CSSProperties = {
  width: '38px',
  height: '32px',
  border: '1px solid #000',
  borderRadius: 0,
  backgroundColor: '#fff',
  color: '#000',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  cursor: 'pointer',
  transition: 'transform 140ms ease, filter 140ms ease, background-color 140ms ease, color 140ms ease',
};

const currentTrackDownloadStyle: CSSProperties = {
  ...iconButtonBaseStyle,
  flex: '0 0 auto',
  border: 'none',
  backgroundColor: 'transparent',
  color: '#000',
  textDecoration: 'none',
};

const iconButtonActiveStyle: CSSProperties = {
  ...iconButtonBaseStyle,
  backgroundColor: '#000',
  color: '#fff',
};

const playButtonStyle: CSSProperties = {
  ...iconButtonBaseStyle,
  width: '42px',
  height: '42px',
  borderRadius: '999px',
};

const loopOneBadgeStyle: CSSProperties = {
  position: 'absolute',
  right: '4px',
  bottom: '2px',
  fontSize: '0.58rem',
  lineHeight: 1,
  fontWeight: 900,
};

const timeRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '42px minmax(0, 1fr) 42px',
  alignItems: 'center',
  gap: '0.6rem',
};

const timeTextStyle: CSSProperties = {
  fontSize: '0.8rem',
  lineHeight: 1,
  opacity: 0.72,
  fontVariantNumeric: 'tabular-nums',
  textAlign: 'center',
};

const progressStyle: CSSProperties = {
  width: '100%',
  accentColor: '#000',
  cursor: 'pointer',
  outline: 'none',
};

const trackListStyle: CSSProperties = {
  margin: 0,
  padding: 0,
  listStyle: 'none',
  maxHeight: 'min(44vh, 360px)',
  overflowY: 'auto',
  scrollbarWidth: 'thin',
  scrollbarColor: '#000 rgba(0, 0, 0, 0.12)',
  scrollbarGutter: 'stable',
};

const trackButtonBaseStyle: CSSProperties = {
  width: '100%',
  border: 'none',
  borderBottom: '1px solid rgba(0, 0, 0, 0.22)',
  borderRadius: 0,
  backgroundColor: '#fff',
  color: '#000',
  display: 'grid',
  gridTemplateColumns: '3.2rem minmax(0, 1fr)',
  alignItems: 'center',
  gap: '0.7rem',
  padding: '0.62rem 1.1rem',
  fontFamily: 'inherit',
  fontSize: '0.98rem',
  lineHeight: 1.15,
  textAlign: 'left',
  cursor: 'pointer',
};

const trackRowBaseStyle: CSSProperties = {
  ...trackButtonBaseStyle,
  gridTemplateColumns: 'minmax(0, 1fr) 2rem',
  cursor: 'default',
};

const trackRowActiveStyle: CSSProperties = {
  ...trackRowBaseStyle,
  backgroundColor: '#000',
  color: '#fff',
};

const trackSelectButtonStyle: CSSProperties = {
  minWidth: 0,
  border: 'none',
  background: 'transparent',
  color: 'inherit',
  display: 'grid',
  gridTemplateColumns: '3.2rem minmax(0, 1fr)',
  alignItems: 'center',
  gap: '0.7rem',
  padding: 0,
  fontFamily: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
};

const trackFavoriteButtonStyle: CSSProperties = {
  position: 'relative',
  width: '28px',
  height: '28px',
  border: 'none',
  background: 'transparent',
  color: '#8f8f8f',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  cursor: 'pointer',
  opacity: 0.82,
  justifySelf: 'end',
  transition: 'transform 170ms cubic-bezier(0.22, 1, 0.36, 1), color 160ms ease, filter 160ms ease, opacity 140ms ease',
  overflow: 'visible',
};

const trackFavoriteButtonActiveStyle: CSSProperties = {
  ...trackFavoriteButtonStyle,
  color: '#f2ca3f',
  filter: 'drop-shadow(0 0 3px rgba(242, 202, 63, 0.62))',
  opacity: 1,
};

const trackFavoritePulseWrapStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
};

const trackFavoritePulseIconStyle: CSSProperties = {
  width: '190%',
  height: '190%',
  display: 'block',
  opacity: 0,
  transform: 'scale(0.6)',
  transformOrigin: 'center center',
  overflow: 'visible',
};

const trackNumberStyle: CSSProperties = {
  fontSize: '0.78rem',
  opacity: 0.68,
  fontVariantNumeric: 'tabular-nums',
};

const trackTitleStyle: CSSProperties = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const controlIconStyle: CSSProperties = {
  width: '18px',
  height: '18px',
  display: 'block',
};

const playIconStyle: CSSProperties = {
  ...controlIconStyle,
  width: '20px',
  height: '20px',
};

const volumeIconSlotStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0.72,
};

const volumeIconStyle: CSSProperties = {
  ...controlIconStyle,
  width: '16px',
  height: '16px',
};

const starIconStyle: CSSProperties = {
  ...controlIconStyle,
  width: '17px',
  height: '17px',
};

function getTrackDownloadHref(fileName: string): string {
  return `/assets/supermons-tracks/${encodeURIComponent(fileName)}`;
}

let crc32Table: Uint32Array | null = null;

function getCrc32Table(): Uint32Array {
  if (crc32Table !== null) {
    return crc32Table;
  }
  const table = new Uint32Array(256);
  for (let index = 0; index < table.length; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  crc32Table = table;
  return table;
}

function calculateCrc32(data: Uint8Array): number {
  const table = getCrc32Table();
  let crc = 0xffffffff;
  for (let index = 0; index < data.length; index += 1) {
    crc = table[(crc ^ data[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function getZipTimestamp(date = new Date()): {dosDate: number; dosTime: number} {
  const year = Math.max(1980, date.getFullYear());
  return {
    dosDate: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
    dosTime: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
  };
}

function writeLocalFileHeader(
  fileNameBytes: Uint8Array,
  entryData: Uint8Array,
  crc32: number,
  dosDate: number,
  dosTime: number,
): Uint8Array {
  const header = new Uint8Array(30 + fileNameBytes.length);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, ZIP_UTF8_FLAG, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, dosTime, true);
  view.setUint16(12, dosDate, true);
  view.setUint32(14, crc32, true);
  view.setUint32(18, entryData.byteLength, true);
  view.setUint32(22, entryData.byteLength, true);
  view.setUint16(26, fileNameBytes.length, true);
  view.setUint16(28, 0, true);
  header.set(fileNameBytes, 30);
  return header;
}

function writeCentralDirectoryHeader(
  fileNameBytes: Uint8Array,
  entryData: Uint8Array,
  crc32: number,
  localHeaderOffset: number,
  dosDate: number,
  dosTime: number,
): Uint8Array {
  const header = new Uint8Array(46 + fileNameBytes.length);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, ZIP_UTF8_FLAG, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, dosTime, true);
  view.setUint16(14, dosDate, true);
  view.setUint32(16, crc32, true);
  view.setUint32(20, entryData.byteLength, true);
  view.setUint32(24, entryData.byteLength, true);
  view.setUint16(28, fileNameBytes.length, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, localHeaderOffset, true);
  header.set(fileNameBytes, 46);
  return header;
}

function writeEndOfCentralDirectory(
  entryCount: number,
  centralDirectorySize: number,
  centralDirectoryOffset: number,
): Uint8Array {
  const header = new Uint8Array(22);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, entryCount, true);
  view.setUint16(10, entryCount, true);
  view.setUint32(12, centralDirectorySize, true);
  view.setUint32(16, centralDirectoryOffset, true);
  view.setUint16(20, 0, true);
  return header;
}

async function buildTracksZip(
  tracks: Array<{fileName: string}>,
  getHref: (fileName: string) => string,
): Promise<Blob> {
  const textEncoder = new TextEncoder();
  const {dosDate, dosTime} = getZipTimestamp();
  const localParts: BlobPart[] = [];
  const centralDirectoryParts: Uint8Array[] = [];
  let offset = 0;
  let centralDirectorySize = 0;

  for (const track of tracks) {
    const response = await fetch(getHref(track.fileName));
    if (!response.ok) {
      throw new Error(`Failed to download ${track.fileName}`);
    }
    const data = new Uint8Array(await response.arrayBuffer());
    const fileNameBytes = textEncoder.encode(`${DOWNLOAD_ALL_FOLDER_NAME}/${track.fileName}`);
    const crc32 = calculateCrc32(data);
    const localHeader = writeLocalFileHeader(fileNameBytes, data, crc32, dosDate, dosTime);
    const centralDirectoryHeader = writeCentralDirectoryHeader(
      fileNameBytes,
      data,
      crc32,
      offset,
      dosDate,
      dosTime,
    );
    localParts.push(localHeader, data);
    centralDirectoryParts.push(centralDirectoryHeader);
    offset += localHeader.byteLength + data.byteLength;
    centralDirectorySize += centralDirectoryHeader.byteLength;
  }

  return new Blob(
    [
      ...localParts,
      ...centralDirectoryParts,
      writeEndOfCentralDirectory(tracks.length, centralDirectorySize, offset),
    ],
    {type: 'application/zip'},
  );
}

function downloadBlob(blob: Blob, fileName: string): void {
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}

function formatTime(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return '0:00';
  }
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function renderDownloadIcon(): ReactNode {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={controlIconStyle}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M12 3v11" />
      <path d="m7.5 9.8 4.5 4.5 4.5-4.5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function renderLoadingIcon(): ReactNode {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={controlIconStyle}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round">
      <path d="M12 3a9 9 0 1 1-8.5 6" opacity={0.34} />
      <path d="M12 3a9 9 0 0 1 8.5 6">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="850ms"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

function renderVolumeIcon(): ReactNode {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={volumeIconStyle}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7" />
      <path d="M19 6a8.5 8.5 0 0 1 0 12" />
    </svg>
  );
}

function renderStarIcon(
  isFilled: boolean,
  ref?: (node: SVGSVGElement | null) => void,
): ReactNode {
  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={starIconStyle}
      fill={isFilled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M12 2.6L14.9 8.4L21.2 9.3L16.6 13.7L17.7 20L12 17L6.3 20L7.4 13.7L2.8 9.3L9.1 8.4L12 2.6Z" />
    </svg>
  );
}

function renderIcon(kind: 'previous' | 'play' | 'pause' | 'next' | 'shuffle' | 'loop'): ReactNode {
  if (kind === 'play') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" style={playIconStyle} fill="currentColor">
        <path d="M8 5.2v13.6L18.8 12 8 5.2Z" />
      </svg>
    );
  }
  if (kind === 'pause') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" style={playIconStyle} fill="currentColor">
        <path d="M7 5h3.6v14H7V5Zm6.4 0H17v14h-3.6V5Z" />
      </svg>
    );
  }
  if (kind === 'previous') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" style={controlIconStyle} fill="currentColor">
        <path d="M6 5h2.2v14H6V5Zm3.7 7 8.3-6.3v12.6L9.7 12Z" />
      </svg>
    );
  }
  if (kind === 'next') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" style={controlIconStyle} fill="currentColor">
        <path d="M15.8 5H18v14h-2.2V5ZM6 5.7 14.3 12 6 18.3V5.7Z" />
      </svg>
    );
  }
  if (kind === 'shuffle') {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        style={controlIconStyle}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M4 7h3.2c2.9 0 4 10 6.8 10H20" />
        <path d="M16.5 13.5 20 17l-3.5 3.5" />
        <path d="M4 17h3.2c1.1 0 1.9-1.3 2.6-3" />
        <path d="M13.4 8.8c.2-1.1 1-1.8 2.3-1.8H20" />
        <path d="M16.5 3.5 20 7l-3.5 3.5" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={controlIconStyle}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M17.5 4.7 21 8.2l-3.5 3.5" />
      <path d="M3 11V9.7a5 5 0 0 1 5-5h13" />
      <path d="M6.5 19.3 3 15.8l3.5-3.5" />
      <path d="M21 13v1.3a5 5 0 0 1-5 5H3" />
    </svg>
  );
}

export default function ResourcesMusicPage(): ReactNode {
  const trackListRef = useRef<HTMLOListElement | null>(null);
  const trackItemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const trackFavoriteIconRefs = useRef<Record<string, SVGSVGElement | null>>({});
  const trackFavoritePulseRefs = useRef<Record<string, SVGSVGElement | null>>({});
  const currentTrackFavoriteIconRef = useRef<SVGSVGElement | null>(null);
  const currentTrackFavoritePulseRef = useRef<SVGSVGElement | null>(null);
  const [isDownloadAllLoading, setIsDownloadAllLoading] = useState(false);
  const {
    audioElement,
    tracks,
    currentTrack,
    currentTrackIndex,
    isPlaying,
    isShuffleEnabled,
    isFavoritesOnlyEnabled,
    favoriteTrackFileNames,
    loopMode,
    currentTime,
    duration,
    musicVolume,
    play,
    pause,
    togglePlay,
    skipTrack,
    selectTrack,
    setShuffleEnabled,
    setFavoritesOnlyEnabled,
    toggleFavoriteTrack,
    setLoopMode,
    setMusicVolume,
    seek,
  } = useSiteMusicPlayer();
  const loopButtonLabel =
    loopMode === 'off'
      ? 'Loop off'
      : loopMode === 'all'
        ? 'Loop playlist'
        : 'Loop current track';
  const currentTrackDownloadHref = getTrackDownloadHref(currentTrack.fileName);
  const favoriteTrackFileNameSet = new Set(favoriteTrackFileNames);
  const isCurrentTrackFavorite = favoriteTrackFileNameSet.has(currentTrack.fileName);
  const visibleTrackIndexes = isFavoritesOnlyEnabled
    ? tracks.flatMap((track, index) =>
        favoriteTrackFileNameSet.has(track.fileName) ? [index] : [],
      )
    : tracks.map((_, index) => index);

  useEffect(() => {
    preloadSiteSoundEffects(['favoriteOn', 'favoriteOff']);
  }, []);

  useEffect(() => {
    const trackList = trackListRef.current;
    const activeTrackItem = trackItemRefs.current[currentTrackIndex];
    if (trackList === null || activeTrackItem === undefined || activeTrackItem === null) {
      return;
    }
    const listRect = trackList.getBoundingClientRect();
    const itemRect = activeTrackItem.getBoundingClientRect();
    if (itemRect.top < listRect.top || itemRect.bottom > listRect.bottom) {
      activeTrackItem.scrollIntoView({block: 'nearest'});
    }
  }, [currentTrackIndex]);

  useEffect(() => {
    setIsDownloadAllLoading(false);
  }, [tracks.length]);

  async function handleDownloadAll(): Promise<void> {
    if (isDownloadAllLoading) {
      return;
    }
    setIsDownloadAllLoading(true);
    try {
      const zipBlob = await buildTracksZip(tracks, getTrackDownloadHref);
      downloadBlob(zipBlob, DOWNLOAD_ALL_FILE_NAME);
    } finally {
      window.setTimeout(() => {
        setIsDownloadAllLoading(false);
      }, DOWNLOAD_ALL_LOADING_MS);
    }
  }

  function runTrackFavoritePulseAnimation(fileName: string): void {
    const favoriteIcon = trackFavoriteIconRefs.current[fileName];
    if (favoriteIcon !== undefined && favoriteIcon !== null) {
      favoriteIcon.getAnimations().forEach((animation) => {
        animation.cancel();
      });
      favoriteIcon.animate(
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
    const favoritePulse = trackFavoritePulseRefs.current[fileName];
    if (favoritePulse !== undefined && favoritePulse !== null) {
      favoritePulse.getAnimations().forEach((animation) => {
        animation.cancel();
      });
      favoritePulse.animate(
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
  }

  function runCurrentTrackFavoritePulseAnimation(): void {
    const favoriteIcon = currentTrackFavoriteIconRef.current;
    if (favoriteIcon !== null) {
      favoriteIcon.getAnimations().forEach((animation) => {
        animation.cancel();
      });
      favoriteIcon.animate(
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
    const favoritePulse = currentTrackFavoritePulseRef.current;
    if (favoritePulse !== null) {
      favoritePulse.getAnimations().forEach((animation) => {
        animation.cancel();
      });
      favoritePulse.animate(
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
  }

  return (
    <BlankSectionPage title="Resources">
      <ResourcesSubnav active="music" />
      <section style={playerWrapStyle}>
        <div style={visualizerStageStyle}>
          <SiteMusicVisualizer
            audioElement={audioElement}
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            onSeek={seek}
            onTogglePlay={togglePlay}
          />
        </div>
        <div style={playerShellStyle}>
          <div style={nowPlayingStyle}>
            <p style={eyebrowStyle}>Now Playing</p>
            <div style={titleRowStyle}>
              <div style={titleTextWrapStyle}>
                <h2 style={titleStyle}>{currentTrack.title}</h2>
                <button
                  type="button"
                  aria-label={
                    isCurrentTrackFavorite
                      ? `Remove ${currentTrack.title} from favorites`
                      : `Add ${currentTrack.title} to favorites`
                  }
                  title={isCurrentTrackFavorite ? 'Remove favorite' : 'Add favorite'}
                  style={
                    isCurrentTrackFavorite
                      ? currentTrackFavoriteButtonActiveStyle
                      : currentTrackFavoriteButtonStyle
                  }
                  onClick={() => {
                    playFavoriteChangeSound(!isCurrentTrackFavorite);
                    if (!isCurrentTrackFavorite) {
                      runCurrentTrackFavoritePulseAnimation();
                    }
                    toggleFavoriteTrack(currentTrack.fileName);
                  }}>
                  {renderStarIcon(isCurrentTrackFavorite, (node) => {
                    currentTrackFavoriteIconRef.current = node;
                  })}
                  <span style={trackFavoritePulseWrapStyle} aria-hidden="true">
                    <svg
                      ref={currentTrackFavoritePulseRef}
                      viewBox="0 0 24 24"
                      style={trackFavoritePulseIconStyle}>
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
              </div>
              <div style={titleVolumeControlStyle}>
                <span style={volumeIconSlotStyle}>{renderVolumeIcon()}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(musicVolume * 100)}
                  aria-label="Music volume"
                  style={progressStyle}
                  onChange={(event) =>
                    setMusicVolume(Number.parseInt(event.currentTarget.value, 10) / 100)
                  }
                />
                <span style={timeTextStyle}>{Math.round(musicVolume * 100)}%</span>
              </div>
              <a
                href={currentTrackDownloadHref}
                download={currentTrack.fileName}
                aria-label={`Download ${currentTrack.title}`}
                title={`Download ${currentTrack.title}`}
                style={currentTrackDownloadStyle}>
                {renderDownloadIcon()}
              </a>
            </div>
          </div>
          <div style={controlsBoxStyle}>
            <div style={controlsStyle}>
              <div style={controlRowStyle}>
                <div style={controlClusterStyle}>
                  <button
                    type="button"
                    aria-label="Shuffle"
                    title="Shuffle"
                    style={isShuffleEnabled ? iconButtonActiveStyle : iconButtonBaseStyle}
                    onClick={() => setShuffleEnabled(!isShuffleEnabled)}>
                    {renderIcon('shuffle')}
                  </button>
                  <button
                    type="button"
                    aria-label="Previous track"
                    title="Previous"
                    style={iconButtonBaseStyle}
                    onClick={() => skipTrack(-1)}>
                    {renderIcon('previous')}
                  </button>
                  <button
                    type="button"
                    aria-label={isPlaying ? 'Pause track' : 'Play track'}
                    title={isPlaying ? 'Pause' : 'Play'}
                    style={playButtonStyle}
                    onClick={() => {
                      if (isPlaying) {
                        pause();
                        return;
                      }
                      play();
                    }}>
                    {renderIcon(isPlaying ? 'pause' : 'play')}
                  </button>
                  <button
                    type="button"
                    aria-label="Next track"
                    title="Next"
                    style={iconButtonBaseStyle}
                    onClick={() => skipTrack(1)}>
                    {renderIcon('next')}
                  </button>
                  <button
                    type="button"
                    aria-label={loopButtonLabel}
                    title={loopButtonLabel}
                    style={{
                      ...(loopMode !== 'off' ? iconButtonActiveStyle : iconButtonBaseStyle),
                      position: 'relative',
                    }}
                    onClick={() =>
                      setLoopMode(loopMode === 'off' ? 'all' : loopMode === 'all' ? 'one' : 'off')
                    }>
                    {renderIcon('loop')}
                    {loopMode === 'one' ? (
                      <span aria-hidden="true" style={loopOneBadgeStyle}>
                        1
                      </span>
                    ) : null}
                  </button>
                </div>
                <div style={controlFilterButtonWrapStyle}>
                  <button
                    type="button"
                    aria-label={
                      isFavoritesOnlyEnabled ? 'Show all tracks' : 'Show favorite tracks'
                    }
                    title={isFavoritesOnlyEnabled ? 'Show all tracks' : 'Show favorite tracks'}
                    style={isFavoritesOnlyEnabled ? iconButtonActiveStyle : iconButtonBaseStyle}
                    onClick={() => setFavoritesOnlyEnabled(!isFavoritesOnlyEnabled)}>
                    {renderStarIcon(isFavoritesOnlyEnabled)}
                  </button>
                </div>
              </div>
              <div style={timeRowStyle}>
                <span style={timeTextStyle}>{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={Math.min(currentTime, duration || 0)}
                  aria-label="Track progress"
                  style={progressStyle}
                  onChange={(event) => seek(Number(event.currentTarget.value))}
                />
                <span style={timeTextStyle}>{formatTime(duration)}</span>
              </div>
            </div>
            <ol ref={trackListRef} className="music-track-list-scrollbar" style={trackListStyle}>
              {visibleTrackIndexes.map((index) => {
                const track = tracks[index];
                const isActive = index === currentTrackIndex;
                const isFavorite = favoriteTrackFileNameSet.has(track.fileName);
                return (
                  <li
                    key={track.fileName}
                    ref={(node) => {
                      trackItemRefs.current[index] = node;
                    }}>
                    <div
                      style={isActive ? trackRowActiveStyle : trackRowBaseStyle}>
                      <button
                        type="button"
                        style={trackSelectButtonStyle}
                        onClick={() => selectTrack(index)}>
                        <span style={trackNumberStyle}>{String(index + 1).padStart(2, '0')}</span>
                        <span style={trackTitleStyle}>{track.title}</span>
                      </button>
                      <button
                        type="button"
                        aria-label={
                          isFavorite
                            ? `Remove ${track.title} from favorites`
                            : `Add ${track.title} to favorites`
                        }
                        title={isFavorite ? 'Remove favorite' : 'Add favorite'}
                        style={
                          isFavorite
                            ? trackFavoriteButtonActiveStyle
                            : trackFavoriteButtonStyle
                        }
                        onClick={() => {
                          playFavoriteChangeSound(!isFavorite);
                          if (!isFavorite) {
                            runTrackFavoritePulseAnimation(track.fileName);
                          }
                          toggleFavoriteTrack(track.fileName);
                        }}>
                        {renderStarIcon(isFavorite, (node) => {
                          trackFavoriteIconRefs.current[track.fileName] = node;
                        })}
                        <span style={trackFavoritePulseWrapStyle} aria-hidden="true">
                          <svg
                            ref={(node) => {
                              trackFavoritePulseRefs.current[track.fileName] = node;
                            }}
                            viewBox="0 0 24 24"
                            style={trackFavoritePulseIconStyle}>
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
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
        <div style={downloadAllRowStyle}>
          <button
            type="button"
            aria-busy={isDownloadAllLoading}
            disabled={isDownloadAllLoading}
            style={
              isDownloadAllLoading
                ? downloadAllButtonLoadingStyle
                : downloadAllButtonStyle
            }
            onClick={() => {
              void handleDownloadAll();
            }}>
            {isDownloadAllLoading ? renderLoadingIcon() : renderDownloadIcon()}
            <span>Download all</span>
          </button>
        </div>
      </section>
    </BlankSectionPage>
  );
}
