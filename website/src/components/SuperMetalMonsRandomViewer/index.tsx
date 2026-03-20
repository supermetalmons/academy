import {useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode} from 'react';
import {superMetalMonsNfts, type SuperMetalMonsNft} from '@site/src/data/superMetalMonsNfts';

type GenKey = 'gen1' | 'gen2';
type TiltState = {
  rotateX: number;
  rotateY: number;
  active: boolean;
};
type UndoSnapshot = {
  index: number;
  enabledGens: Record<GenKey, boolean>;
  lockedType: string | null;
};
type FavoritesFolderPayload = {
  folder: 'favorites';
  mons: string[];
};

const TILT_MAX_DEG = 13;
const NAME_CYCLE_DURATION_MS = 240;
const NAME_CYCLE_STEP_MS = 62;
const NAME_CYCLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const FAVORITES_STORAGE_KEY = 'mons-academy-favorites-folder';
const FAVORITE_PULSE_DURATION_MS = 620;
const SHUFFLE_BUTTON_LABEL = 'Shuffle';
const SHUFFLE_HOVER_CYCLE_DURATION_MS = 230;
const SHUFFLE_HOVER_CYCLE_STEP_MS = 58;
const IMAGE_SLIDE_DURATION_MS = 290;
const THIN_LAYOUT_BREAKPOINT_PX = 860;
const EXTRA_THIN_LAYOUT_BREAKPOINT_PX = 520;
const VIEWER_BOTTOM_TRIM_PX = 23;
const MAIN_IMAGE_EDGE_INSET_PX = 10;

function getGenForCollection(collection: 'Super Metal Mons!' | 'Super Metal Mons!!'): GenKey {
  return collection === 'Super Metal Mons!' ? 'gen1' : 'gen2';
}

function getRandomIndexFromList(indices: number[], exclude: number | null): number {
  if (indices.length <= 1) {
    return indices[0] ?? 0;
  }
  const filtered = exclude === null ? indices : indices.filter((value) => value !== exclude);
  const pool = filtered.length > 0 ? filtered : indices;
  return pool[Math.floor(Math.random() * pool.length)] ?? indices[0] ?? 0;
}

function getTypeSpriteHref(type: string): string | null {
  switch (type.trim().toLowerCase()) {
    case 'angel':
      return '/assets/mons/angel.png';
    case 'demon':
      return '/assets/mons/demon.png';
    case 'drainer':
      return '/assets/mons/drainer.png';
    case 'spirit':
      return '/assets/mons/spirit.png';
    case 'mystic':
      return '/assets/mons/mystic.png';
    default:
      return null;
  }
}

function isIndexEnabledByGens(
  nftIndex: number,
  gens: Record<GenKey, boolean>,
): boolean {
  const nft = superMetalMonsNfts[nftIndex];
  if (nft === undefined) {
    return false;
  }
  return gens[getGenForCollection(nft.collection)];
}

function getScrambledName(targetName: string): string {
  return Array.from(targetName)
    .map((char) => {
      if (/\s/.test(char)) {
        return char;
      }
      return NAME_CYCLE_CHARS[Math.floor(Math.random() * NAME_CYCLE_CHARS.length)] ?? char;
    })
    .join('');
}

const wrapBaseStyle: CSSProperties = {
  border: '1px solid #000',
  borderRadius: 0,
  backgroundColor: '#fff',
  padding: `calc(0.85rem + 5px) calc(0.85rem + 10px) calc(0.85rem + ${44 - VIEWER_BOTTOM_TRIM_PX}px)`,
  margin: '0 auto',
  position: 'relative',
  transition: 'width 190ms ease',
};

const wrapCompactStyle: CSSProperties = {
  ...wrapBaseStyle,
  width: 'min(100%, 560px)',
};

const wrapExpandedStyle: CSSProperties = {
  ...wrapBaseStyle,
  width: '100%',
  maxWidth: 'none',
};

const viewerLayoutStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'stretch',
  flexDirection: 'row-reverse',
  gap: '0.95rem',
};

const viewerLayoutThinStyle: CSSProperties = {
  ...viewerLayoutStyle,
  flexDirection: 'column',
  gap: '0.8rem',
};

const viewerMainStyle: CSSProperties = {
  position: 'relative',
  flex: '1 1 auto',
  minWidth: 0,
};

const favoritesSidebarStyle: CSSProperties = {
  borderRight: '1px solid #000',
  paddingRight: '0.9rem',
  width: 'min(340px, 33vw)',
  minWidth: '220px',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const favoritesSidebarThinStyle: CSSProperties = {
  ...favoritesSidebarStyle,
  borderRight: 'none',
  borderTop: '1px solid #000',
  paddingRight: 0,
  paddingTop: '0.8rem',
  width: '100%',
  minWidth: 0,
};

const favoritesTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.96rem',
  lineHeight: 1.2,
  fontWeight: 700,
  color: '#000',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.28rem',
};

const favoritesTitleStarStyle: CSSProperties = {
  width: '0.94rem',
  height: '0.94rem',
  display: 'block',
  color: '#f2ca3f',
  transform: 'translateY(-1px)',
  filter: 'drop-shadow(0 0 3px rgba(242, 202, 63, 0.62))',
};

const favoritesGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
  gap: '0.5rem',
  alignContent: 'start',
  overflowY: 'auto',
  maxHeight: 'min(56vh, 560px)',
  paddingRight: 0,
};

const favoritesGridThinStyle: CSSProperties = {
  ...favoritesGridStyle,
  overflowY: 'auto',
};

const favoritesTileStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
  border: '1px solid #000',
  backgroundColor: '#fff',
  color: '#000',
  padding: '0.2rem',
  width: '100%',
  borderRadius: 0,
  textAlign: 'inherit',
  font: 'inherit',
  cursor: 'pointer',
};

const favoritesTileActiveStyle: CSSProperties = {
  ...favoritesTileStyle,
  backgroundColor: '#f3f3f3',
};

const favoritesImageStyle: CSSProperties = {
  width: '100%',
  aspectRatio: '1 / 1',
  objectFit: 'cover',
  display: 'block',
  border: '1px solid #000',
};

const favoritesLabelStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.66rem',
  lineHeight: 1.15,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.22rem',
  minWidth: 0,
};

const favoritesLabelTextStyle: CSSProperties = {
  minWidth: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  lineHeight: 1.15,
};

const favoritesTypeIconStyle: CSSProperties = {
  width: '0.82rem',
  height: '0.82rem',
  display: 'block',
  imageRendering: 'pixelated',
  imageRendering: 'auto',
  opacity: 0.95,
  flex: '0 0 auto',
};

const favoritesEmptyStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.78rem',
  lineHeight: 1.2,
  opacity: 0.72,
};

const folderToggleButtonStyle: CSSProperties = {
  position: 'absolute',
  left: '0.5rem',
  bottom: '0.5rem',
  width: '1.95rem',
  height: '1.95rem',
  border: '1px solid #000',
  borderRadius: 0,
  backgroundColor: '#fff',
  color: '#000',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  margin: 0,
  cursor: 'pointer',
  zIndex: 8,
  transition: 'background-color 160ms ease, transform 160ms ease',
};

const folderToggleButtonActiveStyle: CSSProperties = {
  ...folderToggleButtonStyle,
  backgroundColor: '#ececec',
};

const folderToggleButtonInlineThinStyle: CSSProperties = {
  ...folderToggleButtonStyle,
  position: 'relative',
  left: 0,
  bottom: 'auto',
  marginTop: '0.45rem',
  marginBottom: '0.05rem',
  zIndex: 'auto',
};

const folderToggleButtonInlineThinActiveStyle: CSSProperties = {
  ...folderToggleButtonInlineThinStyle,
  backgroundColor: '#ececec',
};

const folderIconStyle: CSSProperties = {
  width: '16px',
  height: '16px',
  display: 'block',
};

const imageFrameStyle: CSSProperties = {
  width: '100%',
  maxWidth: 'none',
  margin: 0,
  border: '1px solid #000',
  backgroundColor: '#fff',
  aspectRatio: '1 / 1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
};

const tiltRegionStyle: CSSProperties = {
  width: '100%',
  maxWidth: '442px',
  margin: '0 auto',
  position: 'relative',
};

const tiltHitAreaStyle: CSSProperties = {
  position: 'absolute',
  inset: '-20px',
  zIndex: 2,
};

const imageStyle: CSSProperties = {
  width: `calc(100% - ${MAIN_IMAGE_EDGE_INSET_PX * 2}px)`,
  height: `calc(100% - ${MAIN_IMAGE_EDGE_INSET_PX * 2}px)`,
  position: 'absolute',
  inset: `${MAIN_IMAGE_EDGE_INSET_PX}px`,
  objectFit: 'contain',
  imageRendering: 'auto',
  display: 'block',
  willChange: 'transform, opacity',
};

const imageStageStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
};

const detailsOffsetStyle: CSSProperties = {
  marginTop: '25px',
};

const nameStyle: CSSProperties = {
  margin: 0,
  fontSize: '1.32rem',
  lineHeight: 1.2,
  color: '#fff',
  textAlign: 'center',
  fontWeight: 800,
  backgroundColor: '#000',
  border: '1px solid #000',
  padding: '0.2rem 0.5rem',
  width: 'fit-content',
  maxWidth: '100%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const nameRowStyle: CSSProperties = {
  marginTop: '0.5rem',
  display: 'flex',
  justifyContent: 'center',
  position: 'relative',
  width: '100%',
  boxSizing: 'border-box',
};

const nameWrapStyle: CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  maxWidth: 'calc(100% - 2.45rem)',
  minWidth: 0,
};

const favoriteButtonStyle: CSSProperties = {
  position: 'absolute',
  left: 'calc(100% + 0.62rem)',
  top: '50%',
  transform: 'translate(0, -50%) scale(1)',
  transformOrigin: 'center center',
  width: '1.55rem',
  height: '1.55rem',
  border: 'none',
  background: 'transparent',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  margin: 0,
  cursor: 'pointer',
  color: '#8f8f8f',
  transition: 'transform 170ms cubic-bezier(0.22, 1, 0.36, 1), color 160ms ease, filter 160ms ease',
  overflow: 'visible',
};

const favoriteButtonActiveStyle: CSSProperties = {
  ...favoriteButtonStyle,
  color: '#f2ca3f',
  filter: 'drop-shadow(0 0 3px rgba(242, 202, 63, 0.62))',
};

const favoriteIconStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'block',
};

const favoritePulseWrapStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
};

const favoritePulseIconStyle: CSSProperties = {
  width: '190%',
  height: '190%',
  display: 'block',
  opacity: 0,
  transform: 'scale(0.6)',
  transformOrigin: 'center center',
  overflow: 'visible',
};

const collectionStyle: CSSProperties = {
  margin: '0.2rem 0 0',
  fontSize: '0.9rem',
  lineHeight: 1.2,
  color: '#000',
  opacity: 0.7,
  textAlign: 'center',
};

const collectionLinkStyle: CSSProperties = {
  color: 'inherit',
  textDecoration: 'none',
};

const collectionLinkWrapStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.18rem',
};

const collectionArrowStyle: CSSProperties = {
  width: '0.8em',
  height: '0.8em',
  opacity: 0,
  transition: 'opacity 140ms ease, transform 140ms ease',
  pointerEvents: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#000',
};

function getCollectionArrowStateStyle(visible: boolean, direction: 'left' | 'right'): CSSProperties {
  return {
    ...collectionArrowStyle,
    opacity: visible ? 0.8 : 0,
    transform: visible
      ? 'translateX(0)'
      : direction === 'left'
        ? 'translateX(2px)'
        : 'translateX(-2px)',
  };
}

const collectionArrowIconStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'block',
};

const typeStyle: CSSProperties = {
  margin: '0.24rem 0 0',
  fontSize: '0.98rem',
  lineHeight: 1,
  color: '#000',
  fontWeight: 600,
  minHeight: '22px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const typeRowStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.44rem',
  whiteSpace: 'nowrap',
};

const typeValueWrapStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.44rem',
};

const typeValueButtonStyle: CSSProperties = {
  ...typeValueWrapStyle,
  position: 'relative',
  border: 'none',
  background: 'transparent',
  margin: 0,
  padding: 0,
  font: 'inherit',
  color: 'inherit',
  lineHeight: 1,
  cursor: 'pointer',
};

const typeLockIconStyle: CSSProperties = {
  position: 'absolute',
  left: 'calc(100% + 0.34rem)',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '0.86em',
  height: '0.86em',
  display: 'block',
  color: '#555',
  opacity: 0.92,
  zIndex: 2,
  pointerEvents: 'auto',
  cursor: 'pointer',
};

const typeTildeStyle: CSSProperties = {
  opacity: 0.52,
  display: 'inline-block',
  width: '0.72em',
  textAlign: 'center',
  lineHeight: 1,
  pointerEvents: 'none',
};

const typeIconStyle: CSSProperties = {
  width: '1.25em',
  height: '1.25em',
  display: 'block',
  imageRendering: 'pixelated',
  imageRendering: 'auto',
  opacity: 0.9,
};

const typeTextStyle: CSSProperties = {
  lineHeight: 1,
  whiteSpace: 'nowrap',
};

const controlsStyle: CSSProperties = {
  marginTop: '0.62rem',
  display: 'flex',
  gap: '0.5rem',
  justifyContent: 'center',
  alignItems: 'center',
  flexWrap: 'wrap',
  width: '100%',
  boxSizing: 'border-box',
  paddingInline: 'clamp(2rem, 4.5vw, 2.55rem)',
};

const shuffleButtonWrapStyle: CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  boxSizing: 'border-box',
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
  fontSize: '1rem',
  lineHeight: 1.1,
  cursor: 'pointer',
  transition: 'transform 140ms ease, filter 140ms ease',
};

const shuffleButtonStyle: CSSProperties = {
  ...buttonStyle,
  fontFamily: 'inherit',
};

const linkStyle: CSSProperties = {
  ...buttonStyle,
};

const undoButtonStyle: CSSProperties = {
  position: 'absolute',
  left: 'calc(-1 * clamp(2.05rem, 4.2vw, 2.35rem))',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '2rem',
  height: '2rem',
  border: 'none',
  background: 'transparent',
  color: '#000',
  padding: 0,
  margin: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  overflow: 'visible',
};

const undoButtonDisabledStyle: CSSProperties = {
  ...undoButtonStyle,
  opacity: 0.42,
  cursor: 'default',
};

const undoIconStyle: CSSProperties = {
  width: '18px',
  height: '18px',
  display: 'block',
  overflow: 'visible',
};

const genToggleWrapStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.34rem',
  color: '#666',
  fontSize: '0.82rem',
  fontStyle: 'italic',
  lineHeight: 1,
  userSelect: 'none',
};

const genToggleColumnStyle: CSSProperties = {
  position: 'absolute',
  right: 'calc(0.5rem - 15px)',
  bottom: `calc(0.85rem - 7px - ${VIEWER_BOTTOM_TRIM_PX}px)`,
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '0.36rem',
};

const genToggleRowStyle: CSSProperties = {
  marginTop: '0.58rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.9rem',
  flexWrap: 'wrap',
};

const genSwitchButtonStyle: CSSProperties = {
  border: 'none',
  background: 'transparent',
  margin: 0,
  padding: 0,
  display: 'inline-flex',
  alignItems: 'center',
  cursor: 'pointer',
};

function getGenSwitchTrackStyle(enabled: boolean): CSSProperties {
  return {
    width: '29px',
    height: '16px',
    borderRadius: '999px',
    backgroundColor: enabled ? '#0A84FF' : '#b9bcc4',
    boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.14)',
    position: 'relative',
    transition: 'background-color 170ms ease',
  };
}

function getGenSwitchThumbStyle(enabled: boolean): CSSProperties {
  return {
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '12px',
    height: '12px',
    borderRadius: '999px',
    backgroundColor: '#fff',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.28)',
    transform: enabled ? 'translateX(13px)' : 'translateX(0)',
    transition: 'transform 170ms ease',
  };
}

function getFavoriteButtonStateStyle(isActive: boolean, isHovered: boolean): CSSProperties {
  const baseStyle = isActive ? favoriteButtonActiveStyle : favoriteButtonStyle;
  return {
    ...baseStyle,
    transform: isHovered ? 'translate(0, -50%) scale(1.16)' : 'translate(0, -50%) scale(1)',
  };
}

const shuffleLabelWrapStyle: CSSProperties = {
  position: 'relative',
  display: 'inline-block',
};

const shuffleLabelSizerStyle: CSSProperties = {
  display: 'inline-block',
  visibility: 'hidden',
  whiteSpace: 'nowrap',
};

const shuffleLabelOverlayStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
};

function parseFavoriteMons(raw: string | null): Set<string> {
  if (raw === null) {
    return new Set<string>();
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return new Set<string>(parsed.filter((value): value is string => typeof value === 'string'));
    }
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'mons' in parsed &&
      Array.isArray((parsed as FavoritesFolderPayload).mons)
    ) {
      return new Set<string>(
        (parsed as FavoritesFolderPayload).mons.filter(
          (value): value is string => typeof value === 'string',
        ),
      );
    }
  } catch {
    return new Set<string>();
  }
  return new Set<string>();
}

function persistFavoriteMons(favorites: Set<string>): void {
  if (typeof window === 'undefined') {
    return;
  }
  const payload: FavoritesFolderPayload = {
    folder: 'favorites',
    mons: Array.from(favorites),
  };
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(payload));
}

export default function SuperMetalMonsRandomViewer(): ReactNode {
  const [enabledGens, setEnabledGens] = useState<Record<GenKey, boolean>>({
    gen1: true,
    gen2: true,
  });
  const [lockedType, setLockedType] = useState<string | null>(null);
  const genCandidateIndices = useMemo(
    () =>
      superMetalMonsNfts
        .map((nft, nftIndex) => ({nft, nftIndex}))
        .filter(({nft}) => enabledGens[getGenForCollection(nft.collection)])
        .map(({nftIndex}) => nftIndex),
    [enabledGens],
  );
  const candidateIndices = useMemo(
    () =>
      lockedType === null
        ? genCandidateIndices
        : genCandidateIndices.filter(
            (nftIndex) => superMetalMonsNfts[nftIndex]?.type === lockedType,
          ),
    [genCandidateIndices, lockedType],
  );
  const [index, setIndex] = useState<number>(() =>
    getRandomIndexFromList(
      superMetalMonsNfts.map((_, nftIndex) => nftIndex),
      null,
    ),
  );
  const [undoSnapshots, setUndoSnapshots] = useState<UndoSnapshot[]>([]);
  const [displayedName, setDisplayedName] = useState<string>('');
  const [isNameCycling, setIsNameCycling] = useState(false);
  const [isFavoriteHovered, setIsFavoriteHovered] = useState(false);
  const [isCollectionLinkHovered, setIsCollectionLinkHovered] = useState(false);
  const [isFavoritesSidebarOpen, setIsFavoritesSidebarOpen] = useState(false);
  const [isThinLayout, setIsThinLayout] = useState(false);
  const [isExtraThinLayout, setIsExtraThinLayout] = useState(false);
  const [shuffleButtonLabel, setShuffleButtonLabel] = useState<string>(SHUFFLE_BUTTON_LABEL);
  const [mainImageSrc, setMainImageSrc] = useState<string>(
    () => superMetalMonsNfts[index]?.image ?? '',
  );
  const [ghostImageSrc, setGhostImageSrc] = useState<string | null>(null);
  const [favoriteMons, setFavoriteMons] = useState<Set<string>>(new Set());
  const nameCycleIntervalRef = useRef<number | null>(null);
  const nameCycleTimeoutRef = useRef<number | null>(null);
  const shuffleHoverIntervalRef = useRef<number | null>(null);
  const shuffleHoverTimeoutRef = useRef<number | null>(null);
  const imageSlideTimeoutRef = useRef<number | null>(null);
  const shuffleHoverHasPlayedRef = useRef(false);
  const imageLoadRequestRef = useRef(0);
  const undoIconRef = useRef<SVGSVGElement | null>(null);
  const favoriteIconRef = useRef<SVGSVGElement | null>(null);
  const favoritePulseRef = useRef<SVGSVGElement | null>(null);
  const mainImageRef = useRef<HTMLImageElement | null>(null);
  const ghostImageRef = useRef<HTMLImageElement | null>(null);
  const viewerSectionRef = useRef<HTMLElement | null>(null);
  const [tilt, setTilt] = useState<TiltState>({
    rotateX: 0,
    rotateY: 0,
    active: false,
  });

  const pushUndoHistory = (
    undoIndex: number,
    undoEnabledGens: Record<GenKey, boolean>,
    undoLockedType: string | null,
  ) => {
    setUndoSnapshots((current) => {
      const nextSnapshot: UndoSnapshot = {
        index: undoIndex,
        enabledGens: {
          gen1: undoEnabledGens.gen1,
          gen2: undoEnabledGens.gen2,
        },
        lockedType: undoLockedType,
      };
      const head = current[0];
      if (
        head !== undefined &&
        head.index === nextSnapshot.index &&
        head.enabledGens.gen1 === nextSnapshot.enabledGens.gen1 &&
        head.enabledGens.gen2 === nextSnapshot.enabledGens.gen2 &&
        head.lockedType === nextSnapshot.lockedType
      ) {
        return current;
      }
      return [nextSnapshot, ...current].slice(0, 5);
    });
  };

  useEffect(() => {
    if (candidateIndices.length === 0) {
      return;
    }
    if (!candidateIndices.includes(index)) {
      setIndex(getRandomIndexFromList(candidateIndices, null));
    }
  }, [candidateIndices, index]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    setFavoriteMons(parseFavoriteMons(window.localStorage.getItem(FAVORITES_STORAGE_KEY)));
  }, []);

  useEffect(() => {
    const sectionNode = viewerSectionRef.current;
    if (sectionNode === null) {
      return;
    }
    const parentNode = sectionNode.parentElement;
    const updateThinLayout = () => {
      const layoutWidth = parentNode?.getBoundingClientRect().width ?? sectionNode.getBoundingClientRect().width;
      const nextIsThin = layoutWidth <= THIN_LAYOUT_BREAKPOINT_PX;
      setIsThinLayout((current) => (current === nextIsThin ? current : nextIsThin));
    };
    updateThinLayout();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateThinLayout);
      return () => {
        window.removeEventListener('resize', updateThinLayout);
      };
    }
    const observer = new ResizeObserver(() => {
      updateThinLayout();
    });
    observer.observe(sectionNode);
    if (parentNode !== null) {
      observer.observe(parentNode);
    }
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const navNode = document.querySelector('nav[aria-label="Primary navigation"]');
    const resolveIsExtraThin = () => {
      if (navNode instanceof HTMLElement) {
        const navItems = Array.from(navNode.children).filter(
          (child): child is HTMLElement => child instanceof HTMLElement,
        );
        const navRowCount = new Set(navItems.map((item) => item.offsetTop)).size;
        return navRowCount >= 4;
      }
      return window.innerWidth <= EXTRA_THIN_LAYOUT_BREAKPOINT_PX;
    };
    const updateExtraThinLayout = () => {
      const nextIsExtraThin = resolveIsExtraThin();
      setIsExtraThinLayout((current) => (current === nextIsExtraThin ? current : nextIsExtraThin));
    };
    updateExtraThinLayout();
    window.addEventListener('resize', updateExtraThinLayout);
    if (navNode instanceof HTMLElement && typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        updateExtraThinLayout();
      });
      observer.observe(navNode);
      return () => {
        observer.disconnect();
        window.removeEventListener('resize', updateExtraThinLayout);
      };
    }
    return () => {
      window.removeEventListener('resize', updateExtraThinLayout);
    };
  }, []);

  const favoriteMonsByHref = useMemo(() => {
    const map = new Map<string, SuperMetalMonsNft>();
    superMetalMonsNfts.forEach((nft) => {
      map.set(nft.href, nft);
    });
    return map;
  }, []);

  const favoriteIndexByHref = useMemo(() => {
    const map = new Map<string, number>();
    superMetalMonsNfts.forEach((nft, nftIndex) => {
      map.set(nft.href, nftIndex);
    });
    return map;
  }, []);

  const favoritePreviewMons = useMemo(
    () =>
      Array.from(favoriteMons)
        .reverse()
        .map((href) => favoriteMonsByHref.get(href))
        .filter((nft): nft is SuperMetalMonsNft => nft !== undefined),
    [favoriteMons, favoriteMonsByHref],
  );

  const selected = superMetalMonsNfts[index] ?? null;

  if (selected === null) {
    return null;
  }
  const clearNameCycleTimers = () => {
    if (nameCycleIntervalRef.current !== null) {
      window.clearInterval(nameCycleIntervalRef.current);
      nameCycleIntervalRef.current = null;
    }
    if (nameCycleTimeoutRef.current !== null) {
      window.clearTimeout(nameCycleTimeoutRef.current);
      nameCycleTimeoutRef.current = null;
    }
  };
  const clearShuffleHoverTimers = () => {
    if (shuffleHoverIntervalRef.current !== null) {
      window.clearInterval(shuffleHoverIntervalRef.current);
      shuffleHoverIntervalRef.current = null;
    }
    if (shuffleHoverTimeoutRef.current !== null) {
      window.clearTimeout(shuffleHoverTimeoutRef.current);
      shuffleHoverTimeoutRef.current = null;
    }
  };
  const clearImageSlideTimer = () => {
    if (imageSlideTimeoutRef.current !== null) {
      window.clearTimeout(imageSlideTimeoutRef.current);
      imageSlideTimeoutRef.current = null;
    }
  };
  const runNameCycleAnimation = (targetName: string) => {
    clearNameCycleTimers();
    if (targetName.length === 0) {
      setDisplayedName(targetName);
      setIsNameCycling(false);
      return;
    }
    setIsNameCycling(true);
    setDisplayedName(getScrambledName(targetName));
    nameCycleIntervalRef.current = window.setInterval(() => {
      setDisplayedName(getScrambledName(targetName));
    }, NAME_CYCLE_STEP_MS);
    nameCycleTimeoutRef.current = window.setTimeout(() => {
      clearNameCycleTimers();
      setDisplayedName(targetName);
      setIsNameCycling(false);
    }, NAME_CYCLE_DURATION_MS);
  };
  const runShuffleHoverCycleAnimation = () => {
    clearShuffleHoverTimers();
    setShuffleButtonLabel(getScrambledName(SHUFFLE_BUTTON_LABEL));
    shuffleHoverIntervalRef.current = window.setInterval(() => {
      setShuffleButtonLabel(getScrambledName(SHUFFLE_BUTTON_LABEL));
    }, SHUFFLE_HOVER_CYCLE_STEP_MS);
    shuffleHoverTimeoutRef.current = window.setTimeout(() => {
      clearShuffleHoverTimers();
      setShuffleButtonLabel(SHUFFLE_BUTTON_LABEL);
    }, SHUFFLE_HOVER_CYCLE_DURATION_MS);
  };
  const handleFavoritePreviewSelect = (favoriteHref: string) => {
    const targetIndex = favoriteIndexByHref.get(favoriteHref);
    if (targetIndex === undefined || targetIndex === index) {
      return;
    }
    const targetNft = superMetalMonsNfts[targetIndex];
    if (targetNft === undefined) {
      return;
    }
    pushUndoHistory(index, enabledGens, lockedType);
    if (lockedType !== null && lockedType !== targetNft.type) {
      setLockedType(targetNft.type);
    }
    const targetGen = getGenForCollection(targetNft.collection);
    setEnabledGens((current) => ({
      ...current,
      [targetGen]: true,
    }));
    clearNameCycleTimers();
    setIsNameCycling(false);
    setDisplayedName(targetNft.name);
    setIndex(targetIndex);
  };
  const collectionHref =
    selected.collection === 'Super Metal Mons!'
      ? 'https://opensea.io/collection/supermetalmons'
      : 'https://opensea.io/collection/super-metal-mons-gen-2';
  const typeSpriteHref = getTypeSpriteHref(selected.type);
  const selectedMonFavoriteKey = selected.href;
  const isSelectedMonFavorite = favoriteMons.has(selectedMonFavoriteKey);
  const isTypeLocked = lockedType === selected.type;
  const tiltedImageFrameStyle: CSSProperties = {
    ...imageFrameStyle,
    transform: `perspective(920px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
    transformOrigin: 'center center',
    transition: tilt.active
      ? 'transform 70ms linear, box-shadow 160ms ease'
      : 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 260ms ease',
    boxShadow: tilt.active ? '0 8px 20px rgba(0, 0, 0, 0.14)' : 'none',
    willChange: 'transform',
  };
  const toggleGen = (key: GenKey) => {
    setEnabledGens((current) => {
      const other: GenKey = key === 'gen1' ? 'gen2' : 'gen1';
      let next: Record<GenKey, boolean>;
      if (current[key]) {
        if (!current[other]) {
          next = {
            ...current,
            [key]: false,
            [other]: true,
          };
        } else {
          next = {
            ...current,
            [key]: false,
          };
        }
      } else {
        next = {
          ...current,
          [key]: true,
        };
      }

      // Preserve undo path across gen filters that force the current mon out.
      if (!isIndexEnabledByGens(index, next)) {
        pushUndoHistory(index, current, lockedType);
      }
      return next;
    });
  };
  const handleTypeLockToggle = () => {
    pushUndoHistory(index, enabledGens, lockedType);
    setLockedType((current) => (current === selected.type ? null : selected.type));
  };
  const canUndo = undoSnapshots.length > 0;
  const runFavoritePulseAnimation = () => {
    if (favoriteIconRef.current !== null) {
      favoriteIconRef.current.getAnimations().forEach((animation) => {
        animation.cancel();
      });
      favoriteIconRef.current.animate(
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
    if (favoritePulseRef.current !== null) {
      favoritePulseRef.current.getAnimations().forEach((animation) => {
        animation.cancel();
      });
      favoritePulseRef.current.animate(
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
  };
  const toggleSelectedMonFavorite = () => {
    const willFavorite = !isSelectedMonFavorite;
    setFavoriteMons((current) => {
      const next = new Set(current);
      if (next.has(selectedMonFavoriteKey)) {
        next.delete(selectedMonFavoriteKey);
      } else {
        next.add(selectedMonFavoriteKey);
      }
      persistFavoriteMons(next);
      return next;
    });
    if (willFavorite) {
      runFavoritePulseAnimation();
    }
  };
  const handleUndo = () => {
    if (!canUndo) {
      return;
    }
    const restoreSnapshot = undoSnapshots[0];
    if (restoreSnapshot === undefined) {
      return;
    }
    const restoreIndex = restoreSnapshot.index;
    clearNameCycleTimers();
    setIsNameCycling(false);
    setDisplayedName(superMetalMonsNfts[restoreIndex]?.name ?? '');
    if (undoIconRef.current !== null) {
      undoIconRef.current.getAnimations().forEach((animation) => {
        animation.cancel();
      });
      undoIconRef.current.animate(
        [
          {transform: 'rotate(0deg)'},
          {transform: 'rotate(-360deg)'},
        ],
        {
          duration: 360,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'none',
        },
      );
    }
    setEnabledGens({
      gen1: restoreSnapshot.enabledGens.gen1,
      gen2: restoreSnapshot.enabledGens.gen2,
    });
    setLockedType(restoreSnapshot.lockedType);
    setIndex(restoreIndex);
    setUndoSnapshots((current) => current.slice(1));
  };

  useEffect(() => {
    if (selected.image.length === 0) {
      return;
    }
    if (mainImageSrc.length === 0) {
      setMainImageSrc(selected.image);
      return;
    }
    if (selected.image === mainImageSrc) {
      return;
    }
    const requestId = imageLoadRequestRef.current + 1;
    imageLoadRequestRef.current = requestId;
    const preloadImage = new Image();
    preloadImage.decoding = 'async';
    const commitSwap = () => {
      if (imageLoadRequestRef.current !== requestId) {
        return;
      }
      setGhostImageSrc(mainImageSrc);
      setMainImageSrc(selected.image);
    };
    preloadImage.src = selected.image;
    if (preloadImage.complete) {
      commitSwap();
      return;
    }
    preloadImage.onload = commitSwap;
    preloadImage.onerror = commitSwap;
    return () => {
      preloadImage.onload = null;
      preloadImage.onerror = null;
    };
  }, [selected.image, mainImageSrc]);

  useEffect(() => {
    if (ghostImageSrc === null) {
      return;
    }
    const enteringImage = mainImageRef.current;
    const exitingImage = ghostImageRef.current;
    if (enteringImage === null || exitingImage === null) {
      setGhostImageSrc(null);
      return;
    }
    enteringImage.getAnimations().forEach((animation) => {
      animation.cancel();
    });
    exitingImage.getAnimations().forEach((animation) => {
      animation.cancel();
    });
    enteringImage.animate(
      [
        {transform: 'translateX(22px)', opacity: 1},
        {transform: 'translateX(0px)', opacity: 1},
      ],
      {
        duration: IMAGE_SLIDE_DURATION_MS,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'both',
      },
    );
    exitingImage.animate(
      [
        {transform: 'translateX(0px)', opacity: 1},
        {transform: 'translateX(-22px)', opacity: 1},
      ],
      {
        duration: IMAGE_SLIDE_DURATION_MS,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'both',
      },
    );
    clearImageSlideTimer();
    const departingImage = ghostImageSrc;
    imageSlideTimeoutRef.current = window.setTimeout(() => {
      setGhostImageSrc((current) => (current === departingImage ? null : current));
      imageSlideTimeoutRef.current = null;
    }, IMAGE_SLIDE_DURATION_MS + 24);
  }, [ghostImageSrc, mainImageSrc]);

  useEffect(() => {
    if (!isNameCycling) {
      setDisplayedName(selected.name);
    }
  }, [isNameCycling, selected.name]);

  useEffect(() => {
    return () => {
      clearNameCycleTimers();
      clearShuffleHoverTimers();
      clearImageSlideTimer();
    };
  }, []);

  const isFolderInlineThin = isThinLayout && isFavoritesSidebarOpen;
  const folderToggleButtonNode = (
    <button
      type="button"
      aria-label={isFavoritesSidebarOpen ? 'Close favorites sidebar' : 'Open favorites sidebar'}
      aria-pressed={isFavoritesSidebarOpen}
      style={
        isFolderInlineThin
          ? isFavoritesSidebarOpen
            ? folderToggleButtonInlineThinActiveStyle
            : folderToggleButtonInlineThinStyle
          : isFavoritesSidebarOpen
            ? folderToggleButtonActiveStyle
            : folderToggleButtonStyle
      }
      onClick={() => {
        setIsFavoritesSidebarOpen((current) => !current);
      }}>
      <svg viewBox="0 0 24 24" aria-hidden="true" style={folderIconStyle}>
        <path
          d="M2.8 6.2H8.2L10 8.1H21.2V18.8H2.8V6.2Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M2.8 9.3H21.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
  const genTogglesNode = (
    <>
      <span style={genToggleWrapStyle}>
        <span>gen1</span>
        <button
          type="button"
          role="switch"
          aria-checked={enabledGens.gen1}
          aria-label="Toggle gen1 mons"
          style={genSwitchButtonStyle}
          onClick={() => {
            toggleGen('gen1');
          }}>
          <span style={getGenSwitchTrackStyle(enabledGens.gen1)}>
            <span style={getGenSwitchThumbStyle(enabledGens.gen1)} />
          </span>
        </button>
      </span>
      <span style={genToggleWrapStyle}>
        <span>gen2</span>
        <button
          type="button"
          role="switch"
          aria-checked={enabledGens.gen2}
          aria-label="Toggle gen2 mons"
          style={genSwitchButtonStyle}
          onClick={() => {
            toggleGen('gen2');
          }}>
          <span style={getGenSwitchTrackStyle(enabledGens.gen2)}>
            <span style={getGenSwitchThumbStyle(enabledGens.gen2)} />
          </span>
        </button>
      </span>
    </>
  );

  return (
    <section
      ref={viewerSectionRef}
      style={isFavoritesSidebarOpen ? wrapExpandedStyle : wrapCompactStyle}
      aria-label="Random Super Metal Mons viewer">
      <div style={isThinLayout ? viewerLayoutThinStyle : viewerLayoutStyle}>
        <div style={viewerMainStyle}>
          <div style={tiltRegionStyle}>
            <div
              style={tiltHitAreaStyle}
              onMouseMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width;
                const y = (event.clientY - rect.top) / rect.height;
                const rotateY = (x - 0.5) * 2 * TILT_MAX_DEG;
                const rotateX = (0.5 - y) * 2 * TILT_MAX_DEG;
                setTilt({rotateX, rotateY, active: true});
              }}
              onMouseLeave={() => {
                setTilt({rotateX: 0, rotateY: 0, active: false});
              }}
            />
            <div style={tiltedImageFrameStyle}>
              <div style={imageStageStyle}>
                {ghostImageSrc !== null ? (
                  <img
                    ref={ghostImageRef}
                    src={ghostImageSrc}
                    alt=""
                    aria-hidden="true"
                    style={{
                      ...imageStyle,
                      zIndex: 1,
                    }}
                  />
                ) : null}
                <img
                  ref={mainImageRef}
                  src={mainImageSrc}
                  alt={selected.name}
                  style={{
                    ...imageStyle,
                    zIndex: 2,
                  }}
                />
              </div>
            </div>
          </div>
          <div style={detailsOffsetStyle}>
            <div style={nameRowStyle}>
              <div style={nameWrapStyle}>
                <h3 style={nameStyle}>{displayedName}</h3>
                <button
                  type="button"
                  aria-label={
                    isSelectedMonFavorite ? 'Remove mon from favorites' : 'Save mon to favorites'
                  }
                  aria-pressed={isSelectedMonFavorite}
                  style={getFavoriteButtonStateStyle(isSelectedMonFavorite, isFavoriteHovered)}
                  onMouseEnter={() => {
                    setIsFavoriteHovered(true);
                  }}
                  onMouseLeave={() => {
                    setIsFavoriteHovered(false);
                  }}
                  onClick={toggleSelectedMonFavorite}>
                  <svg ref={favoriteIconRef} viewBox="0 0 24 24" aria-hidden="true" style={favoriteIconStyle}>
                    <path
                      d="M12 2.6L14.9 8.4L21.2 9.3L16.6 13.7L17.7 20L12 17L6.3 20L7.4 13.7L2.8 9.3L9.1 8.4L12 2.6Z"
                      fill={isSelectedMonFavorite ? 'currentColor' : 'transparent'}
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span style={favoritePulseWrapStyle} aria-hidden="true">
                    <svg ref={favoritePulseRef} viewBox="0 0 24 24" style={favoritePulseIconStyle}>
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
            </div>
            <p style={typeStyle}>
              <span style={typeRowStyle}>
                <span style={typeTildeStyle}>~</span>
                <button
                  type="button"
                  style={typeValueButtonStyle}
                  onClick={handleTypeLockToggle}
                  aria-pressed={isTypeLocked}
                  aria-label={isTypeLocked ? 'Unlock mon type filter' : 'Lock shuffle to this mon type'}>
                  {typeSpriteHref !== null ? (
                    <img src={typeSpriteHref} alt="" aria-hidden="true" style={typeIconStyle} />
                  ) : null}
                  <span style={typeTextStyle}>{selected.type}</span>
                  {isTypeLocked ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true" style={typeLockIconStyle}>
                      <path
                        d="M7.2 10.2V7.8C7.2 5.2 9.3 3 12 3C14.7 3 16.8 5.2 16.8 7.8V10.2H18.2C19.1 10.2 19.8 10.9 19.8 11.8V19.2C19.8 20.1 19.1 20.8 18.2 20.8H5.8C4.9 20.8 4.2 20.1 4.2 19.2V11.8C4.2 10.9 4.9 10.2 5.8 10.2H7.2ZM8.8 10.2H15.2V7.8C15.2 6.1 13.8 4.6 12 4.6C10.2 4.6 8.8 6.1 8.8 7.8V10.2Z"
                        fill="currentColor"
                      />
                    </svg>
                  ) : null}
                </button>
                <span style={typeTildeStyle}>~</span>
              </span>
            </p>
            <p style={collectionStyle}>
              <span style={collectionLinkWrapStyle}>
                <span
                  aria-hidden="true"
                  style={getCollectionArrowStateStyle(isCollectionLinkHovered, 'left')}>
                  <svg viewBox="0 0 12 12" style={collectionArrowIconStyle}>
                    <path
                      d="M4 2.5L8 6L4 9.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <a
                  href={collectionHref}
                  target="_blank"
                  rel="noreferrer"
                  style={collectionLinkStyle}
                  onMouseEnter={() => {
                    setIsCollectionLinkHovered(true);
                  }}
                  onMouseLeave={() => {
                    setIsCollectionLinkHovered(false);
                  }}
                  onFocus={() => {
                    setIsCollectionLinkHovered(true);
                  }}
                  onBlur={() => {
                    setIsCollectionLinkHovered(false);
                  }}>
                  {selected.collection}
                </a>
                <span
                  aria-hidden="true"
                  style={getCollectionArrowStateStyle(isCollectionLinkHovered, 'right')}>
                  <svg viewBox="0 0 12 12" style={collectionArrowIconStyle}>
                    <path
                      d="M8 2.5L4 6L8 9.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </span>
            </p>
            <div style={controlsStyle}>
              <div style={shuffleButtonWrapStyle}>
                <button
                  type="button"
                  aria-label="Undo shuffle"
                  disabled={!canUndo}
                  style={canUndo ? undoButtonStyle : undoButtonDisabledStyle}
                  onClick={handleUndo}>
                  <svg
                    ref={undoIconRef}
                    viewBox="0 0 512 512"
                    aria-hidden="true"
                    style={undoIconStyle}>
                    <path
                      d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  style={shuffleButtonStyle}
                  onMouseEnter={() => {
                    if (shuffleHoverHasPlayedRef.current) {
                      return;
                    }
                    shuffleHoverHasPlayedRef.current = true;
                    runShuffleHoverCycleAnimation();
                  }}
                  onMouseLeave={() => {
                    shuffleHoverHasPlayedRef.current = false;
                    clearShuffleHoverTimers();
                    setShuffleButtonLabel(SHUFFLE_BUTTON_LABEL);
                  }}
                  onClick={() => {
                    if (candidateIndices.length === 0) {
                      return;
                    }
                    const nextIndex = getRandomIndexFromList(candidateIndices, index);
                    pushUndoHistory(index, enabledGens, lockedType);
                    setIndex(nextIndex);
                    runNameCycleAnimation(superMetalMonsNfts[nextIndex]?.name ?? '');
                  }}>
                  <span style={shuffleLabelWrapStyle}>
                    <span style={shuffleLabelSizerStyle}>{SHUFFLE_BUTTON_LABEL}</span>
                    <span style={shuffleLabelOverlayStyle}>{shuffleButtonLabel}</span>
                  </span>
                </button>
              </div>
              <a href={selected.href} target="_blank" rel="noreferrer" style={linkStyle}>
                OpenSea
              </a>
            </div>
          </div>
          {isExtraThinLayout ? (
            <div style={genToggleRowStyle}>{genTogglesNode}</div>
          ) : (
            <div style={genToggleColumnStyle}>{genTogglesNode}</div>
          )}
        </div>
        {isFolderInlineThin ? folderToggleButtonNode : null}
        {isFavoritesSidebarOpen ? (
          <aside
            style={isThinLayout ? favoritesSidebarThinStyle : favoritesSidebarStyle}
            aria-label="Favorited mons sidebar">
            <h4 style={favoritesTitleStyle}>
              <svg viewBox="0 0 24 24" aria-hidden="true" style={favoritesTitleStarStyle}>
                <path
                  d="M12 2.6L14.9 8.4L21.2 9.3L16.6 13.7L17.7 20L12 17L6.3 20L7.4 13.7L2.8 9.3L9.1 8.4L12 2.6Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinejoin="round"
                />
              </svg>
              {favoritePreviewMons.length} Favorites:
            </h4>
            {favoritePreviewMons.length === 0 ? (
              <p style={favoritesEmptyStyle}>No favorited mons yet.</p>
            ) : (
              <div style={isThinLayout ? favoritesGridThinStyle : favoritesGridStyle}>
                {favoritePreviewMons.map((favoriteNft) => {
                  const favoriteTypeIconHref = getTypeSpriteHref(favoriteNft.type);
                  return (
                    <button
                      key={favoriteNft.href}
                      type="button"
                      aria-label={`Load ${favoriteNft.name}`}
                      style={favoriteNft.href === selected.href ? favoritesTileActiveStyle : favoritesTileStyle}
                      onClick={() => {
                        handleFavoritePreviewSelect(favoriteNft.href);
                      }}>
                      <img
                        src={favoriteNft.image}
                        alt={favoriteNft.name}
                        loading="lazy"
                        style={favoritesImageStyle}
                      />
                      <p style={favoritesLabelStyle}>
                        {favoriteTypeIconHref !== null ? (
                          <img
                            src={favoriteTypeIconHref}
                            alt=""
                            aria-hidden="true"
                            style={favoritesTypeIconStyle}
                          />
                        ) : null}
                        <span style={favoritesLabelTextStyle}>{favoriteNft.name}</span>
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>
        ) : null}
      </div>
      {!isFolderInlineThin ? folderToggleButtonNode : null}
    </section>
  );
}
