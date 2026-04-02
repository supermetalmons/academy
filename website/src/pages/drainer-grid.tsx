import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

const DRAINER_ICON_ID = 'drainer';
const ICON_SOURCES: Array<{ id: string; src: string }> = [
  { id: DRAINER_ICON_ID, src: '/assets/mons/drainer.png' },
  { id: 'angel-white', src: '/assets/mons/angel.png' },
  { id: 'angel-black', src: '/assets/mons/angelB.png' },
  { id: 'spirit-white', src: '/assets/mons/spirit.png' },
  { id: 'spirit-black', src: '/assets/mons/spiritB.png' },
  { id: 'mystic-white', src: '/assets/mons/mystic.png' },
  { id: 'mystic-black', src: '/assets/mons/mysticB.png' },
  { id: 'demon-white', src: '/assets/mons/demon.png' },
  { id: 'demon-black', src: '/assets/mons/demonB.png' },
  { id: 'mana-white', src: '/assets/mons/mana.png' },
  { id: 'mana-black', src: '/assets/mons/manaB.png' },
  { id: 'super-white', src: '/assets/mons/supermana.png' },
  { id: 'super-black', src: '/assets/mons/supermanaSimple.png' },
  { id: 'potion', src: '/assets/mons/potion.png' },
  { id: 'bomb', src: '/assets/mons/bomb.png' },
];
const SHUFFLE_ICON_IDS = ICON_SOURCES.filter(
  (icon) => icon.id !== DRAINER_ICON_ID,
).map((icon) => icon.id);
const GRID_ICON_SIZE_BASE_PX = 28;
const GRID_GAP_BASE_PX = 15;
const GRID_OFFSET_BASE_PX = 4;
const BASE_OPACITY = 0.3;
const HIGHLIGHT_RADIUS_ICONS = 10;
const SHUFFLE_RADIUS_SCALE = 0.72;
const MAX_SCALE_BOOST = 0.5;
const SHUFFLE_INFLUENCE_THRESHOLD = 0.002;
const SHUFFLE_INTERVAL_FAST_MS = 46;
const SHUFFLE_INTERVAL_SLOW_MS = 460;
const SPIN_TRIGGER_INFLUENCE_THRESHOLD = 0.09;
const SPIN_TRIGGER_CHANCE_AT_MAX = 0.05;
const SPIN_DURATION_MIN_MS = 820;
const SPIN_DURATION_MAX_MS = 1320;
const SPIN_COOLDOWN_MIN_MS = 180;
const SPIN_COOLDOWN_MAX_MS = 420;
const SPIN_SQUASH_Y_MAX = 0.15;
const SPIN_SKEW_X_MAX = 0.14;
const AUTO_SHUFFLE_INTERVAL_MIN_MS = 150;
const AUTO_SHUFFLE_INTERVAL_MAX_MS = 620;
const AUTO_PULSE_INTERVAL_MIN_MS = 300;
const AUTO_PULSE_INTERVAL_MAX_MS = 1180;
const AUTO_PULSE_DURATION_MIN_MS = 520;
const AUTO_PULSE_DURATION_MAX_MS = 1360;
const AUTO_PULSE_SCALE_BOOST_MIN = 0.04;
const AUTO_PULSE_SCALE_BOOST_MAX = 0.19;
const AUTO_PULSE_OPACITY_BOOST_MIN = 0.05;
const AUTO_PULSE_OPACITY_BOOST_MAX = 0.26;
const AUTO_PULSE_ROTATION_DEG_MIN = 5;
const AUTO_PULSE_ROTATION_DEG_MAX = 18;
const AUTO_PULSE_ROTATION_ENABLE_CHANCE = 0.22;
const AUTO_SPIN_INTERVAL_MIN_MS = 1500;
const AUTO_SPIN_INTERVAL_MAX_MS = 6400;
const AUTO_SPIN_DURATION_MIN_MS = 980;
const AUTO_SPIN_DURATION_MAX_MS = 1720;
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 1.5;
const ZOOM_DEFAULT = 1;
const ZOOM_STEP = 0.05;
const WHEEL_ZOOM_SENSITIVITY = 0.0017;
const WHEEL_ZOOM_MAX_STEP = 0.09;
const PAN_LIMIT_BASE_PX = 56;
const PAN_LIMIT_PER_ZOOM_PX = 34;
const PAN_LIMIT_MIN_PX = 34;
const PAN_LIMIT_MAX_PX = 98;
const TRAIL_LIFETIME_MS = 2600;
const TRAIL_MAX_POINTS = 140;
const TRAIL_ADD_INTERVAL_MS = 24;
const TOP_BAR_HEIGHT_PX = 30;
const INTERACTIVE_CONTROLS_SELECTOR =
  '[data-grid-zoom-controls="true"], [data-grid-topbar="true"]';

type TrailPoint = {
  x: number;
  y: number;
  createdAtMs: number;
};

type TileState = {
  iconId: string;
  hasBeenHovered: boolean;
  nextShuffleAtMs: number;
  autoNextShuffleAtMs: number;
  autoNextSpinAtMs: number;
  isSpinning: boolean;
  spinStartedAtMs: number;
  spinDurationMs: number;
  spinDirection: -1 | 1;
  spinCooldownUntilMs: number;
  autoPulseStartedAtMs: number;
  autoPulseDurationMs: number;
  autoPulseScaleBoost: number;
  autoPulseOpacityBoost: number;
  autoPulseRotationDeg: number;
  autoNextPulseAtMs: number;
};

type PanOffset = {
  x: number;
  y: number;
};

function getNowMs(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

function clampZoom(scale: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, scale));
}

function getPanLimitPx(zoomScale: number): number {
  const zoomAdjustedLimit =
    PAN_LIMIT_BASE_PX + (zoomScale - ZOOM_DEFAULT) * PAN_LIMIT_PER_ZOOM_PX;
  return Math.min(PAN_LIMIT_MAX_PX, Math.max(PAN_LIMIT_MIN_PX, zoomAdjustedLimit));
}

function clampPanOffset(offset: PanOffset, zoomScale: number): PanOffset {
  const limitPx = getPanLimitPx(zoomScale);
  return {
    x: Math.max(-limitPx, Math.min(limitPx, offset.x)),
    y: Math.max(-limitPx, Math.min(limitPx, offset.y)),
  };
}

function easeOutCubic(progress: number): number {
  const clamped = Math.min(1, Math.max(0, progress));
  return 1 - Math.pow(1 - clamped, 3);
}

function normalizeWheelDeltaPx(deltaY: number, deltaMode: number): number {
  if (deltaMode === 1) {
    return deltaY * 16;
  }
  if (deltaMode === 2) {
    return deltaY * window.innerHeight;
  }
  return deltaY;
}

function getShuffleIntervalMs(influence: number): number {
  const normalized = Math.min(1, Math.max(0, influence));
  const eased = Math.pow(normalized, 0.72);
  return (
    SHUFFLE_INTERVAL_SLOW_MS -
    (SHUFFLE_INTERVAL_SLOW_MS - SHUFFLE_INTERVAL_FAST_MS) * eased
  );
}

function pickRandomShuffleIconId(currentIconId: string): string {
  if (SHUFFLE_ICON_IDS.length === 0) {
    return currentIconId;
  }
  if (SHUFFLE_ICON_IDS.length === 1) {
    return SHUFFLE_ICON_IDS[0];
  }
  let nextIconId = SHUFFLE_ICON_IDS[Math.floor(Math.random() * SHUFFLE_ICON_IDS.length)];
  if (nextIconId !== currentIconId) {
    return nextIconId;
  }
  nextIconId = SHUFFLE_ICON_IDS[Math.floor(Math.random() * SHUFFLE_ICON_IDS.length)];
  if (nextIconId !== currentIconId) {
    return nextIconId;
  }
  for (let index = 0; index < SHUFFLE_ICON_IDS.length; index += 1) {
    if (SHUFFLE_ICON_IDS[index] !== currentIconId) {
      return SHUFFLE_ICON_IDS[index];
    }
  }
  return currentIconId;
}

function isInteractiveControlsTarget(targetElement: HTMLElement | null): boolean {
  return Boolean(targetElement?.closest(INTERACTIVE_CONTROLS_SELECTOR));
}

const pageStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  margin: 0,
  backgroundColor: '#fff',
  overflow: 'hidden',
  cursor: 'default',
  touchAction: 'none',
};

const overlayCanvasStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  userSelect: 'none',
};

const zoomControlsStyle: CSSProperties = {
  position: 'absolute',
  right: 14,
  bottom: 14,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 8px',
  border: '1px solid #111',
  backgroundColor: 'rgba(255,255,255,0.92)',
  zIndex: 2,
};

const zoomButtonStyle: CSSProperties = {
  width: 24,
  height: 24,
  border: '1px solid #111',
  backgroundColor: '#fff',
  color: '#111',
  fontSize: 16,
  lineHeight: '20px',
  padding: 0,
  cursor: 'pointer',
};

const zoomLabelStyle: CSSProperties = {
  minWidth: 44,
  textAlign: 'right',
  fontSize: 12,
  color: '#111',
};

const autoToggleButtonStyle: CSSProperties = {
  ...zoomButtonStyle,
  width: 42,
  fontSize: 12,
  lineHeight: '22px',
};

const zoomSliderStyle: CSSProperties = {
  width: 120,
  cursor: 'pointer',
};

const topBarStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: TOP_BAR_HEIGHT_PX,
  padding: '0 10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#fff',
  borderBottom: '1px solid #e5e5e5',
  zIndex: 4,
};

const topBarTitleStyle: CSSProperties = {
  fontSize: 12,
  lineHeight: 1,
  color: '#111',
  letterSpacing: 0.1,
  whiteSpace: 'nowrap',
};

const topBarButtonsStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
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

export default function DrainerGridPage(): ReactNode {
  const [trailPoints, setTrailPoints] = useState<TrailPoint[]>([]);
  const [clockMs, setClockMs] = useState<number>(() => getNowMs());
  const [isAutoModeEnabled, setIsAutoModeEnabled] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(ZOOM_DEFAULT);
  const [panOffset, setPanOffset] = useState<PanOffset>({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [iconsReady, setIconsReady] = useState(false);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const iconImagesRef = useRef<Record<string, HTMLImageElement>>({});
  const tileStatesRef = useRef<Map<string, TileState>>(new Map());
  const lastTrailPushAtMsRef = useRef(0);
  const dragPointerIdRef = useRef<number | null>(null);
  const dragButtonRef = useRef<number | null>(null);
  const dragStartClientRef = useRef<{ x: number; y: number } | null>(null);
  const dragStartPanRef = useRef<PanOffset>({ x: 0, y: 0 });

  useEffect(() => {
    let isCancelled = false;
    Promise.all(
      ICON_SOURCES.map(
        (icon) =>
          new Promise<{ id: string; image: HTMLImageElement }>((resolve) => {
            const image = new Image();
            image.decoding = 'async';
            image.onload = () => {
              resolve({ id: icon.id, image });
            };
            image.onerror = () => {
              resolve({ id: icon.id, image });
            };
            image.src = icon.src;
          }),
      ),
    ).then((loadedImages) => {
      if (isCancelled) {
        return;
      }
      const imagesById: Record<string, HTMLImageElement> = {};
      loadedImages.forEach(({ id, image }) => {
        imagesById[id] = image;
      });
      iconImagesRef.current = imagesById;
      setIconsReady(true);
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const syncViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    syncViewportSize();
    window.addEventListener('resize', syncViewportSize);
    return () => {
      window.removeEventListener('resize', syncViewportSize);
    };
  }, []);

  useEffect(() => {
    if (trailPoints.length === 0 && !isAutoModeEnabled) {
      return;
    }
    const intervalId = window.setInterval(() => {
      setClockMs(getNowMs());
    }, 34);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [isAutoModeEnabled, trailPoints.length]);

  useEffect(() => {
    setTrailPoints((current) => {
      const next = current.filter(
        (point) => clockMs - point.createdAtMs <= TRAIL_LIFETIME_MS,
      );
      return next.length === current.length ? current : next;
    });
  }, [clockMs]);

  useEffect(() => {
    setPanOffset((current) => {
      const clamped = clampPanOffset(current, zoomScale);
      if (clamped.x === current.x && clamped.y === current.y) {
        return current;
      }
      return clamped;
    });
  }, [zoomScale]);

  useEffect(() => {
    if (!iconsReady || viewportSize.width <= 0 || viewportSize.height <= 0) {
      return;
    }
    const canvas = overlayCanvasRef.current;
    const iconImages = iconImagesRef.current;
    const drainerImage = iconImages[DRAINER_ICON_ID];
    if (!canvas || !drainerImage) {
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    const pixelWidth = Math.max(1, Math.floor(viewportSize.width * dpr));
    const pixelHeight = Math.max(1, Math.floor(viewportSize.height * dpr));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, viewportSize.width, viewportSize.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    const iconSizePx = GRID_ICON_SIZE_BASE_PX * zoomScale;
    const gapPx = GRID_GAP_BASE_PX * zoomScale;
    const stepPx = iconSizePx + gapPx;
    const offsetPx = GRID_OFFSET_BASE_PX * zoomScale;
    const iconOffsetPx = (stepPx - iconSizePx) / 2;
    const highlightRadiusPx = stepPx * HIGHLIGHT_RADIUS_ICONS;
    const shuffleRadiusPx = highlightRadiusPx * SHUFFLE_RADIUS_SCALE;

    const baseIconCenter = offsetPx + iconOffsetPx + iconSizePx / 2;
    const leftBound = -iconSizePx;
    const rightBound = viewportSize.width + iconSizePx;
    const topBound = -iconSizePx;
    const bottomBound = viewportSize.height + iconSizePx;
    const minWorldColumn = Math.floor((leftBound - (baseIconCenter + panOffset.x)) / stepPx);
    const maxWorldColumn = Math.ceil((rightBound - (baseIconCenter + panOffset.x)) / stepPx);
    const minWorldRow = Math.floor((topBound - (baseIconCenter + panOffset.y)) / stepPx);
    const maxWorldRow = Math.ceil((bottomBound - (baseIconCenter + panOffset.y)) / stepPx);

    for (let worldRow = minWorldRow; worldRow <= maxWorldRow; worldRow += 1) {
      const iconCenterY = baseIconCenter + panOffset.y + worldRow * stepPx;
      for (
        let worldColumn = minWorldColumn;
        worldColumn <= maxWorldColumn;
        worldColumn += 1
      ) {
        const iconCenterX = baseIconCenter + panOffset.x + worldColumn * stepPx;
        let influence = 0;
        let shuffleInfluence = 0;

        for (let pointIndex = 0; pointIndex < trailPoints.length; pointIndex += 1) {
          const point = trailPoints[pointIndex];
          const deltaX = iconCenterX - point.x;
          const deltaY = iconCenterY - point.y;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          const ageProgress = Math.min(
            1,
            Math.max(0, (clockMs - point.createdAtMs) / TRAIL_LIFETIME_MS),
          );
          const timeStrength = 1 - ageProgress;

          if (distance <= highlightRadiusPx) {
            const distanceStrength = 1 - distance / highlightRadiusPx;
            const pointInfluence =
              Math.pow(distanceStrength, 2.35) * Math.pow(timeStrength, 1.15);
            if (pointInfluence > influence) {
              influence = pointInfluence;
            }
          }

          if (distance <= shuffleRadiusPx) {
            const shuffleDistanceStrength = 1 - distance / shuffleRadiusPx;
            const pointShuffleInfluence =
              Math.pow(shuffleDistanceStrength, 2.35) * Math.pow(timeStrength, 1.15);
            if (pointShuffleInfluence > shuffleInfluence) {
              shuffleInfluence = pointShuffleInfluence;
            }
          }
        }

        const normalizedInfluence = Math.min(1, Math.max(0, influence));
        const normalizedShuffleInfluence = Math.min(
          1,
          Math.max(0, shuffleInfluence),
        );
        const tileKey = `${worldRow}:${worldColumn}`;
        let tileState = tileStatesRef.current.get(tileKey);
        if (!tileState) {
          tileState = {
            iconId: DRAINER_ICON_ID,
            hasBeenHovered: false,
            nextShuffleAtMs: 0,
            autoNextShuffleAtMs: 0,
            autoNextSpinAtMs: 0,
            isSpinning: false,
            spinStartedAtMs: 0,
            spinDurationMs: 0,
            spinDirection: 1,
            spinCooldownUntilMs: 0,
            autoPulseStartedAtMs: 0,
            autoPulseDurationMs: 0,
            autoPulseScaleBoost: 0,
            autoPulseOpacityBoost: 0,
            autoPulseRotationDeg: 0,
            autoNextPulseAtMs: 0,
          };
          tileStatesRef.current.set(tileKey, tileState);
        }

        const shouldShuffle =
          normalizedShuffleInfluence > SHUFFLE_INFLUENCE_THRESHOLD;
        if (shouldShuffle) {
          tileState.hasBeenHovered = true;
          const intervalMs = getShuffleIntervalMs(normalizedShuffleInfluence);
          const jitter = 0.84 + Math.random() * 0.32;
          if (clockMs >= tileState.nextShuffleAtMs) {
            tileState.iconId = pickRandomShuffleIconId(tileState.iconId);
            tileState.nextShuffleAtMs = clockMs + intervalMs * jitter;
          } else {
            const acceleratedNextChangeMs = clockMs + intervalMs;
            if (tileState.nextShuffleAtMs > acceleratedNextChangeMs) {
              tileState.nextShuffleAtMs = acceleratedNextChangeMs;
            }
          }
        } else if (!tileState.hasBeenHovered) {
          tileState.iconId = DRAINER_ICON_ID;
          tileState.nextShuffleAtMs = 0;
        }

        if (isAutoModeEnabled) {
          tileState.hasBeenHovered = true;
          if (tileState.autoNextShuffleAtMs <= 0) {
            tileState.autoNextShuffleAtMs =
              clockMs +
              AUTO_SHUFFLE_INTERVAL_MIN_MS +
              Math.random() *
                (AUTO_SHUFFLE_INTERVAL_MAX_MS - AUTO_SHUFFLE_INTERVAL_MIN_MS);
          }
          if (clockMs >= tileState.autoNextShuffleAtMs) {
            tileState.iconId = pickRandomShuffleIconId(tileState.iconId);
            tileState.autoNextShuffleAtMs =
              clockMs +
              AUTO_SHUFFLE_INTERVAL_MIN_MS +
              Math.random() *
                (AUTO_SHUFFLE_INTERVAL_MAX_MS - AUTO_SHUFFLE_INTERVAL_MIN_MS);
          }
          if (tileState.autoNextPulseAtMs <= 0) {
            tileState.autoNextPulseAtMs =
              clockMs +
              AUTO_PULSE_INTERVAL_MIN_MS +
              Math.random() *
                (AUTO_PULSE_INTERVAL_MAX_MS - AUTO_PULSE_INTERVAL_MIN_MS);
          }
          if (clockMs >= tileState.autoNextPulseAtMs) {
            tileState.autoPulseStartedAtMs = clockMs;
            tileState.autoPulseDurationMs =
              AUTO_PULSE_DURATION_MIN_MS +
              Math.random() *
                (AUTO_PULSE_DURATION_MAX_MS - AUTO_PULSE_DURATION_MIN_MS);
            tileState.autoPulseScaleBoost =
              AUTO_PULSE_SCALE_BOOST_MIN +
              Math.random() *
                (AUTO_PULSE_SCALE_BOOST_MAX - AUTO_PULSE_SCALE_BOOST_MIN);
            tileState.autoPulseOpacityBoost =
              AUTO_PULSE_OPACITY_BOOST_MIN +
              Math.random() *
                (AUTO_PULSE_OPACITY_BOOST_MAX - AUTO_PULSE_OPACITY_BOOST_MIN);
            const rotationMagnitude =
              AUTO_PULSE_ROTATION_DEG_MIN +
              Math.random() *
                (AUTO_PULSE_ROTATION_DEG_MAX - AUTO_PULSE_ROTATION_DEG_MIN);
            tileState.autoPulseRotationDeg =
              Math.random() < AUTO_PULSE_ROTATION_ENABLE_CHANCE
                ? (Math.random() < 0.5 ? -1 : 1) * rotationMagnitude
                : 0;
            tileState.autoNextPulseAtMs =
              clockMs +
              AUTO_PULSE_INTERVAL_MIN_MS +
              Math.random() *
                (AUTO_PULSE_INTERVAL_MAX_MS - AUTO_PULSE_INTERVAL_MIN_MS);
          }
          if (tileState.autoNextSpinAtMs <= 0) {
            tileState.autoNextSpinAtMs =
              clockMs +
              AUTO_SPIN_INTERVAL_MIN_MS +
              Math.random() *
                (AUTO_SPIN_INTERVAL_MAX_MS - AUTO_SPIN_INTERVAL_MIN_MS);
          }
          if (!tileState.isSpinning && clockMs >= tileState.autoNextSpinAtMs) {
            tileState.isSpinning = true;
            tileState.spinStartedAtMs = clockMs;
            tileState.spinDurationMs =
              AUTO_SPIN_DURATION_MIN_MS +
              Math.random() *
                (AUTO_SPIN_DURATION_MAX_MS - AUTO_SPIN_DURATION_MIN_MS);
            tileState.spinDirection = Math.random() < 0.5 ? -1 : 1;
            tileState.autoNextSpinAtMs =
              clockMs +
              AUTO_SPIN_INTERVAL_MIN_MS +
              Math.random() *
                (AUTO_SPIN_INTERVAL_MAX_MS - AUTO_SPIN_INTERVAL_MIN_MS);
          }
        } else {
          tileState.autoNextShuffleAtMs = 0;
          tileState.autoNextSpinAtMs = 0;
          tileState.autoNextPulseAtMs = 0;
          tileState.autoPulseStartedAtMs = 0;
          tileState.autoPulseDurationMs = 0;
          tileState.autoPulseScaleBoost = 0;
          tileState.autoPulseOpacityBoost = 0;
          tileState.autoPulseRotationDeg = 0;
        }

        const shouldTrySpin =
          normalizedInfluence > SPIN_TRIGGER_INFLUENCE_THRESHOLD &&
          !tileState.isSpinning &&
          clockMs >= tileState.spinCooldownUntilMs;
        if (shouldTrySpin) {
          const spinChance =
            Math.pow(normalizedInfluence, 1.7) * SPIN_TRIGGER_CHANCE_AT_MAX;
          if (Math.random() < spinChance) {
            tileState.isSpinning = true;
            tileState.spinStartedAtMs = clockMs;
            tileState.spinDurationMs =
              SPIN_DURATION_MIN_MS +
              Math.random() * (SPIN_DURATION_MAX_MS - SPIN_DURATION_MIN_MS);
            tileState.spinDirection = Math.random() < 0.5 ? -1 : 1;
          }
        }

        let autoPulseEnvelope = 0;
        if (
          isAutoModeEnabled &&
          tileState.autoPulseDurationMs > 0 &&
          tileState.autoPulseStartedAtMs > 0
        ) {
          const autoPulseProgress =
            (clockMs - tileState.autoPulseStartedAtMs) / tileState.autoPulseDurationMs;
          if (autoPulseProgress >= 0 && autoPulseProgress <= 1) {
            autoPulseEnvelope = Math.pow(Math.sin(Math.PI * autoPulseProgress), 0.9);
          }
        }
        const drawImageIcon = iconImages[tileState.iconId] || drainerImage;
        const iconScale =
          1 +
          MAX_SCALE_BOOST * normalizedInfluence +
          tileState.autoPulseScaleBoost * autoPulseEnvelope;
        const iconOpacity = Math.min(
          1,
          BASE_OPACITY +
            (1 - BASE_OPACITY) * normalizedInfluence +
            tileState.autoPulseOpacityBoost * autoPulseEnvelope,
        );
        const autoPulseRotationRad =
          (tileState.autoPulseRotationDeg * autoPulseEnvelope * Math.PI) / 180;
        let spinScaleX = 1;
        let spinScaleY = 1;
        let spinSkewX = 0;
        if (tileState.isSpinning) {
          const rawProgress =
            tileState.spinDurationMs <= 0
              ? 1
              : (clockMs - tileState.spinStartedAtMs) / tileState.spinDurationMs;
          if (rawProgress >= 1) {
            tileState.isSpinning = false;
            tileState.spinCooldownUntilMs =
              clockMs +
              SPIN_COOLDOWN_MIN_MS +
              Math.random() * (SPIN_COOLDOWN_MAX_MS - SPIN_COOLDOWN_MIN_MS);
          } else {
            const easedProgress = easeOutCubic(rawProgress);
            const spinAngle = tileState.spinDirection * Math.PI * 2 * easedProgress;
            const edgeOnFactor = Math.abs(Math.sin(spinAngle));
            spinScaleX = Math.cos(spinAngle);
            spinScaleY = 1 - edgeOnFactor * SPIN_SQUASH_Y_MAX;
            spinSkewX = Math.sin(spinAngle) * SPIN_SKEW_X_MAX * (1 - rawProgress * 0.35);
          }
        }
        context.globalAlpha = iconOpacity;
        context.save();
        context.translate(iconCenterX, iconCenterY);
        if (spinSkewX !== 0) {
          context.transform(1, 0, spinSkewX, 1, 0, 0);
        }
        if (autoPulseRotationRad !== 0) {
          context.rotate(autoPulseRotationRad);
        }
        context.scale(iconScale * spinScaleX, iconScale * spinScaleY);
        context.drawImage(
          drawImageIcon,
          -iconSizePx / 2,
          -iconSizePx / 2,
          iconSizePx,
          iconSizePx,
        );
        context.restore();
      }
    }
    context.globalAlpha = 1;
  }, [
    clockMs,
    iconsReady,
    isAutoModeEnabled,
    panOffset.x,
    panOffset.y,
    trailPoints,
    viewportSize.height,
    viewportSize.width,
    zoomScale,
  ]);

  return (
    <main
      style={pageStyle}
      onPointerDown={(event) => {
        const targetElement = event.target as HTMLElement | null;
        if (isInteractiveControlsTarget(targetElement)) {
          return;
        }
        const isMiddlePress = event.button === 1 || (event.buttons & 4) === 4;
        const canStartDrag = event.button === 0 || isMiddlePress;
        if (!canStartDrag) {
          return;
        }
        if (isMiddlePress) {
          event.preventDefault();
        }
        dragPointerIdRef.current = event.pointerId;
        dragButtonRef.current = isMiddlePress ? 1 : event.button;
        dragStartClientRef.current = { x: event.clientX, y: event.clientY };
        dragStartPanRef.current = { ...panOffset };
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // No-op fallback for browsers that reject capture on non-primary mouse buttons.
        }
      }}
      onPointerMove={(event) => {
        const targetElement = event.target as HTMLElement | null;
        if (isInteractiveControlsTarget(targetElement)) {
          return;
        }
        const isActiveDragPointer =
          dragPointerIdRef.current !== null &&
          dragPointerIdRef.current === event.pointerId &&
          dragStartClientRef.current !== null;
        if (isActiveDragPointer) {
          const isMiddleDrag = dragButtonRef.current === 1;
          if (isMiddleDrag && (event.buttons & 4) !== 4) {
            dragPointerIdRef.current = null;
            dragButtonRef.current = null;
            dragStartClientRef.current = null;
            return;
          }
          event.preventDefault();
          const dragStartClient = dragStartClientRef.current;
          const nextPanX =
            dragStartPanRef.current.x + (event.clientX - dragStartClient.x);
          const nextPanY =
            dragStartPanRef.current.y + (event.clientY - dragStartClient.y);
          setPanOffset(clampPanOffset({ x: nextPanX, y: nextPanY }, zoomScale));
          return;
        }
        const nowMs = getNowMs();
        setClockMs(nowMs);
        setTrailPoints((current) => {
          const point: TrailPoint = {
            x: event.clientX,
            y: event.clientY,
            createdAtMs: nowMs,
          };
          if (current.length === 0) {
            lastTrailPushAtMsRef.current = nowMs;
            return [point];
          }
          if (nowMs - lastTrailPushAtMsRef.current < TRAIL_ADD_INTERVAL_MS) {
            const next = [...current];
            next[next.length - 1] = point;
            return next;
          }
          lastTrailPushAtMsRef.current = nowMs;
          const next = [...current, point];
          if (next.length > TRAIL_MAX_POINTS) {
            next.splice(0, next.length - TRAIL_MAX_POINTS);
          }
          return next;
        });
      }}
      onPointerUp={(event) => {
        if (dragPointerIdRef.current !== event.pointerId) {
          return;
        }
        dragPointerIdRef.current = null;
        dragButtonRef.current = null;
        dragStartClientRef.current = null;
        try {
          event.currentTarget.releasePointerCapture(event.pointerId);
        } catch {
          // Ignore if capture was never established.
        }
      }}
      onPointerCancel={(event) => {
        if (dragPointerIdRef.current !== event.pointerId) {
          return;
        }
        dragPointerIdRef.current = null;
        dragButtonRef.current = null;
        dragStartClientRef.current = null;
        try {
          event.currentTarget.releasePointerCapture(event.pointerId);
        } catch {
          // Ignore if capture was never established.
        }
      }}
      onMouseDown={(event) => {
        if (event.button === 1) {
          event.preventDefault();
        }
      }}
      onAuxClick={(event) => {
        if (event.button === 1) {
          event.preventDefault();
        }
      }}
      onWheel={(event) => {
        const targetElement = event.target as HTMLElement | null;
        if (isInteractiveControlsTarget(targetElement)) {
          return;
        }
        event.preventDefault();
        const deltaPx = normalizeWheelDeltaPx(event.deltaY, event.deltaMode);
        if (!Number.isFinite(deltaPx) || deltaPx === 0) {
          return;
        }
        const rawZoomDelta = -deltaPx * WHEEL_ZOOM_SENSITIVITY;
        const zoomDelta = Math.min(
          WHEEL_ZOOM_MAX_STEP,
          Math.max(-WHEEL_ZOOM_MAX_STEP, rawZoomDelta),
        );
        if (zoomDelta === 0) {
          return;
        }
        setZoomScale((current) => clampZoom(current + zoomDelta));
      }}
      aria-label="White drainer grid">
      <canvas ref={overlayCanvasRef} aria-hidden="true" style={overlayCanvasStyle} />
      <div data-grid-topbar="true" aria-label="Icon ocean top bar" style={topBarStyle}>
        <span style={topBarTitleStyle}>mons future aesthetical research</span>
        <div style={topBarButtonsStyle}>
          <button
            type="button"
            aria-current="page"
            style={topBarButtonActiveStyle}
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
        </div>
      </div>
      <div data-grid-zoom-controls="true" aria-label="Zoom controls" style={zoomControlsStyle}>
        <button
          type="button"
          aria-label="Zoom out"
          style={zoomButtonStyle}
          onClick={() => {
            setZoomScale((current) => clampZoom(current - ZOOM_STEP));
          }}>
          -
        </button>
        <input
          type="range"
          min={Math.round(ZOOM_MIN * 100)}
          max={Math.round(ZOOM_MAX * 100)}
          step={1}
          value={Math.round(zoomScale * 100)}
          onChange={(event) => {
            const nextZoomPercent = Number(event.target.value);
            const nextZoom = clampZoom(nextZoomPercent / 100);
            setZoomScale(nextZoom);
          }}
          aria-label="Grid zoom"
          style={zoomSliderStyle}
        />
        <button
          type="button"
          aria-label="Zoom in"
          style={zoomButtonStyle}
          onClick={() => {
            setZoomScale((current) => clampZoom(current + ZOOM_STEP));
          }}>
          +
        </button>
        <span style={zoomLabelStyle}>{Math.round(zoomScale * 100)}%</span>
        <button
          type="button"
          aria-label="Toggle auto icon animation"
          aria-pressed={isAutoModeEnabled}
          style={
            isAutoModeEnabled
              ? {
                  ...autoToggleButtonStyle,
                  backgroundColor: '#111',
                  color: '#fff',
                }
              : autoToggleButtonStyle
          }
          onClick={() => {
            setIsAutoModeEnabled((current) => !current);
          }}>
          auto
        </button>
      </div>
    </main>
  );
}
