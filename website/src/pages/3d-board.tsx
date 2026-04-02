import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  type WheelEvent,
} from 'react';
import SuperMetalMonsBoard from '@site/src/components/SuperMetalMonsBoard';
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

const pageStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  margin: 0,
  backgroundColor: '#fff',
  overflow: 'hidden',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  WebkitTapHighlightColor: 'transparent',
};

const TOP_BAR_HEIGHT_PX = 30;
const PRISM_WIDTH_PX = 460;
const PRISM_HEIGHT_PX = 28;
const PRISM_DEPTH_PX = 460;
const BOARD_SURFACE_SCALE = 0.82;
const BOARD_SURFACE_Z_OFFSET_PX = 0.24;
const ROTATION_SENSITIVITY = 0.34;
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 4;
const WHEEL_ZOOM_SENSITIVITY = 0.0017;
const WHEEL_ZOOM_MAX_STEP = 0.09;
const BILLBOARD_WIDTH_SCALE = 1.12;
const BILLBOARD_HEIGHT_SCALE = 1.2;
const BILLBOARD_GROUND_OFFSET_PX = 4;
const BILLBOARD_ALL_PIECES_LOW_ANGLE_DROP_PX = 1.1;
const BILLBOARD_MIN_OPACITY = 0.45;
const BILLBOARD_SMOOTH_RENDER_MAX_ZOOM = 1.8;
const BILLBOARD_MANA_ITEM_LOW_ANGLE_DROP_PX = 3.5;
const BILLBOARD_HOVER_SCALE = 1.08;
const BILLBOARD_FAINTED_BLUR_PX = 0.55;
const BILLBOARD_REFLECTION_OPACITY = 0.28;
const BILLBOARD_REFLECTION_BLUR_PX = 0.55;
const BILLBOARD_REFLECTION_HEIGHT_SCALE = 0.86;
const BILLBOARD_REFLECTION_VERTICAL_OFFSET_PX = -2;
const LOW_ANGLE_STABILITY_START_DEG = 18;
const LOW_ANGLE_STABILITY_MAX_BLUR_PX = 0.46;
const FAR_ZOOM_STABILITY_START = 1;
const FAR_ZOOM_STABILITY_MAX_BOOST = 1.35;
const GRASS_PLANE_TILE_SIZE_PX = 620;
const GRASS_PLANE_BELOW_BOARD_PX = 6.4;
const GRASS_TILE_LAYER_Z_PX = 0.02;
const GRASS_CLOUD_LAYER_Z_PX = 0.14;
const GRASS_ANTI_SHIMMER_MAX_TILE_SCALE = 1.55;
const GRASS_ANTI_SHIMMER_MAX_BLUR_PX = 0.58;
const GRASS_STABLE_BLUR_PX = 0.24;
const GRASS_LOW_ANGLE_PATTERN_FADE_MAX = 0.9;
const GRASS_LOW_ANGLE_BASE_FILL_MAX = 0.92;
const BOARD_LOW_ANGLE_STABILITY_BLUR_MAX_PX = 0.72;
const BOARD_PERIMETER_PX = PRISM_WIDTH_PX * 2 + PRISM_DEPTH_PX * 2;
const GRASS_MASK_CIRCUMFERENCE_MULTIPLIER = 6;
const GRASS_MASK_CIRCUMFERENCE_PX =
  BOARD_PERIMETER_PX * GRASS_MASK_CIRCUMFERENCE_MULTIPLIER;
const GRASS_MASK_RADIUS_PX = GRASS_MASK_CIRCUMFERENCE_PX / (2 * Math.PI);
const GRASS_MASK_INNER_RADIUS_PX = GRASS_MASK_RADIUS_PX * 0.74;
const GRASS_MASK_MID_RADIUS_PX = GRASS_MASK_RADIUS_PX * 0.9;
const GRASS_CLIP_RADIUS_PX = GRASS_MASK_RADIUS_PX;
const GRASS_PLANE_EDGE_PADDING_PX = 120;
const GRASS_PLANE_WIDTH_PX = GRASS_CLIP_RADIUS_PX * 2 + GRASS_PLANE_EDGE_PADDING_PX * 2;
const GRASS_PLANE_HEIGHT_PX = GRASS_CLIP_RADIUS_PX * 2 + GRASS_PLANE_EDGE_PADDING_PX * 2;
const MONS_ASSET_PATH_FRAGMENT = '/assets/mons/';
const TOP_DOWN_RECENTER_START_DEG = 52;
const TOP_DOWN_RECENTER_END_DEG = 84;
const ITEM_STANDEE_SPARKLE_LIGHT_COLOR = '#FEFEFE';
const ITEM_STANDEE_SPARKLE_DARK_COLOR = '#000000';
const ITEM_STANDEE_SPARKLES_PER_ICON = 7;
const HUD_AVATAR_OPPONENT = 'https://assets.mons.link/emojipack/1.webp';
const HUD_AVATAR_PLAYER = 'https://assets.mons.link/emojipack/2.webp';
const HUD_POTION_ICON_SRC = '/assets/mons/potion.png';
const CLOUD_SPEED_SCALE = 5.6;
const CLOUD_WAVE_PX = 34;
const CLOUD_LOBE_COUNT = 6;
const GRASS_CLOUD_SIZE_BOOST = 1.28;
const GRASS_CLOUD_HEIGHT_BOOST = 1.2;
const GRASS_CLOUD_LOBE_SIZE_BOOST = 1.22;
const GRASS_CLOUD_LOBE_JITTER_BOOST = 1.35;
const GRASS_CLOUD_SHADOWS: CloudShadow[] = [
  {top: 3, width: 520, height: 186, opacity: 0.095, duration: 40.6, delay: 2.1},
  {top: 8, width: 680, height: 238, opacity: 0.1, duration: 46.8, delay: 7.3},
  {top: 12, width: 560, height: 202, opacity: 0.092, duration: 43.9, delay: 10.4},
  {top: 17, width: 740, height: 254, opacity: 0.102, duration: 49.7, delay: 14.2},
  {top: 22, width: 600, height: 214, opacity: 0.094, duration: 44.5, delay: 18.3},
  {top: 27, width: 760, height: 268, opacity: 0.105, duration: 52.2, delay: 22.1},
  {top: 33, width: 640, height: 224, opacity: 0.096, duration: 47.4, delay: 27.8},
  {top: 38, width: 820, height: 286, opacity: 0.108, duration: 55.6, delay: 31.7},
  {top: 44, width: 620, height: 216, opacity: 0.093, duration: 45.8, delay: 36.5},
  {top: 50, width: 780, height: 274, opacity: 0.104, duration: 54.1, delay: 42.8},
  {top: 56, width: 660, height: 232, opacity: 0.097, duration: 48.7, delay: 47.2},
  {top: 62, width: 860, height: 304, opacity: 0.11, duration: 58.8, delay: 51.9},
  {top: 69, width: 700, height: 242, opacity: 0.099, duration: 50.4, delay: 56.7},
  {top: 75, width: 900, height: 322, opacity: 0.112, duration: 61.5, delay: 60.4},
  {top: 82, width: 720, height: 252, opacity: 0.1, duration: 52.9, delay: 66.1},
  {top: 88, width: 940, height: 336, opacity: 0.114, duration: 63.9, delay: 71.3},
  {top: 94, width: 760, height: 266, opacity: 0.101, duration: 55.2, delay: 76.8},
];

type Rotation = {
  x: number;
  y: number;
};

type BillboardSprite = {
  key: string;
  href: string;
  leftPx: number;
  topPx: number;
  widthPx: number;
  heightPx: number;
  zIndex: number;
  tileCol: number;
  tileRow: number;
  opacity: number;
  isRotatedQuarterTurn: boolean;
};

type Tile = {
  row: number;
  col: number;
};

type ItemStandeeSparkleParticle = {
  id: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  driftY: number;
  durationMs: number;
  delayMs: number;
};

type CloudShadow = {
  top: number;
  width: number;
  height: number;
  opacity: number;
  duration: number;
  delay: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
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

function getCloudShadowStyle(
  shadow: CloudShadow,
  index: number,
  animationClockSeconds: number,
  flowViewportWidthPx: number,
): CSSProperties {
  const seed = (shadow.top + 19) * (index + 5);
  const widthVariance = Math.round(((Math.sin(seed * 0.06) + 1) * 0.5) * 238);
  const heightVariance = Math.round(((Math.cos(seed * 0.08) + 1) * 0.5) * 186);
  const sizeScale = 1 + ((Math.sin(seed * 0.051) + 1) * 0.5) * 1.02;
  const blurPx = Math.round(12 + ((Math.cos(seed * 0.11) + 1) * 0.5) * 17);
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
  const cloudWidthPx = Math.round(
    (shadow.width + widthVariance) * sizeScale * GRASS_CLOUD_SIZE_BOOST,
  );
  const cloudHeightPx = Math.round(
    (shadow.height + heightVariance) *
      (0.9 + sizeScale * 0.62) *
      GRASS_CLOUD_HEIGHT_BOOST,
  );
  const cloudOffscreenSpanPx = Math.round(cloudWidthPx + blurPx * 4 + 96);
  const viewportWidthPx = Math.max(240, flowViewportWidthPx);
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
  const leftJitter = Math.sin(seed * 0.17) * 7 * GRASS_CLOUD_LOBE_JITTER_BOOST;
  const topJitter = Math.cos(seed * 0.13) * 12 * GRASS_CLOUD_LOBE_JITTER_BOOST;
  const widthPct = Math.min(
    98,
    (30 + ((Math.sin(seed * 0.09) + 1) * 0.5) * 46) * GRASS_CLOUD_LOBE_SIZE_BOOST,
  );
  const heightPct = Math.min(
    106,
    (20 + ((Math.cos(seed * 0.11) + 1) * 0.5) * 74) * GRASS_CLOUD_LOBE_SIZE_BOOST,
  );
  const lobeOpacity = (0.4 + ((Math.sin(seed * 0.19) + 1) * 0.5) * 0.26).toFixed(2);
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

function parseSvgUnit(value: string | null): number | null {
  if (value === null) {
    return null;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isManaOrItemBillboardHref(href: string): boolean {
  const normalizedHref = href.toLowerCase();
  return /\/(mana|manab|supermana|supermanasimple|bomborpotion)\.png$/.test(
    normalizedHref,
  );
}

function isItemStandeePotionHref(href: string): boolean {
  return /\/bomborpotion\.png$/.test(href.toLowerCase());
}

function isNormalManaBillboardHref(href: string): boolean {
  const normalizedHref = href.toLowerCase();
  return /\/(mana|manab)\.png$/.test(normalizedHref);
}

function isSuperManaBillboardHref(href: string): boolean {
  const normalizedHref = href.toLowerCase();
  return /\/(supermana|supermanasimple)\.png$/.test(normalizedHref);
}

function isItemBillboardHref(href: string): boolean {
  const normalizedHref = href.toLowerCase();
  return /\/(bomborpotion|bomb|potion)\.png$/.test(normalizedHref);
}

function mulberry32(seed: number): () => number {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStringToSeed(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createItemStandeeSparkleParticles(seed: number): ItemStandeeSparkleParticle[] {
  const random = mulberry32(seed);
  const particles: ItemStandeeSparkleParticle[] = [];
  for (let i = 0; i < ITEM_STANDEE_SPARKLES_PER_ICON; i += 1) {
    const y = 0.2 + random() * 0.75;
    particles.push({
      id: `item-standee-sparkle-${i}`,
      x: random() * 0.88,
      y,
      size: 0.09 + random() * 0.05,
      opacity: 0.42 + random() * 0.4,
      driftY: Math.min(0.22, y + 0.06),
      durationMs: 2500 + random() * 1000,
      delayMs: random() * 1200,
    });
  }
  return particles;
}

function extractBillboardSprites(
  boardHost: HTMLElement,
  zoomScale: number,
  rotation: Rotation,
): BillboardSprite[] {
  const svg = boardHost.querySelector<SVGSVGElement>('.super-mons-board svg');
  if (svg === null) {
    return [];
  }
  const svgCtm = svg.getScreenCTM();
  if (svgCtm === null) {
    return [];
  }
  const viewBox = svg.viewBox.baseVal;
  if (viewBox.width <= 0 || viewBox.height <= 0) {
    return [];
  }
  const styleWidthPx = Number.parseFloat(svg.style.width || '');
  const unscaledUnitPx =
    Number.isFinite(styleWidthPx) && styleWidthPx > 0
      ? styleWidthPx / viewBox.width
      : null;

  const depthSprites: Array<BillboardSprite & {depthSort: number}> = [];
  const radX = (rotation.x * Math.PI) / 180;
  const radY = (rotation.y * Math.PI) / 180;
  const cosX = Math.cos(radX);
  const cosY = Math.cos(radY);
  const sinY = Math.sin(radY);
  const svgImages = Array.from(svg.querySelectorAll<SVGImageElement>('image'));
  svgImages.forEach((image, index) => {
    const href = image.getAttribute('href') ?? image.href.baseVal ?? '';
    if (!href.includes(MONS_ASSET_PATH_FRAGMENT)) {
      return;
    }
    const inlineOpacity = Number.parseFloat(
      image.style.opacity || image.getAttribute('opacity') || '1',
    );
    if (Number.isFinite(inlineOpacity) && inlineOpacity <= BILLBOARD_MIN_OPACITY) {
      return;
    }
    const opacity = Number.isFinite(inlineOpacity) ? clamp(inlineOpacity, 0, 1) : 1;
    const transformAttr = image.getAttribute('transform') ?? '';
    const isRotatedQuarterTurn = /rotate\(\s*90(?:[,\s)]|$)/i.test(transformAttr);
    const xUnits = parseSvgUnit(image.getAttribute('x'));
    const yUnits = parseSvgUnit(image.getAttribute('y'));
    const widthUnits = parseSvgUnit(image.getAttribute('width'));
    const heightUnits = parseSvgUnit(image.getAttribute('height'));
    if (
      xUnits === null ||
      yUnits === null ||
      widthUnits === null ||
      heightUnits === null ||
      widthUnits <= 0 ||
      heightUnits <= 0
    ) {
      return;
    }
    const centerUnitsX = xUnits + widthUnits / 2;
    const centerUnitsY = yUnits + heightUnits / 2;
    if (
      centerUnitsX < 0 ||
      centerUnitsX > 11 ||
      centerUnitsY < 0 ||
      centerUnitsY > 11
    ) {
      return;
    }
    const centerPoint = new DOMPoint(centerUnitsX, centerUnitsY).matrixTransform(svgCtm);
    const leftPx = centerPoint.x;
    const topPx = centerPoint.y;
    const tileCol = Math.max(0, Math.min(10, Math.floor(centerUnitsX)));
    const tileRow = Math.max(0, Math.min(10, Math.floor(centerUnitsY)));
    const widthPx =
      unscaledUnitPx === null
        ? widthUnits
        : widthUnits * unscaledUnitPx * BOARD_SURFACE_SCALE * zoomScale;
    const heightPx =
      unscaledUnitPx === null
        ? heightUnits
        : heightUnits * unscaledUnitPx * BOARD_SURFACE_SCALE * zoomScale;
    const localX = centerUnitsX - 5.5;
    const localZ = centerUnitsY - 5.5;
    const rotatedZ = -localX * sinY + localZ * cosY;
    const depthSort = rotatedZ * cosX;
    depthSprites.push({
      key: `${href}-${index}-${xUnits.toFixed(3)}-${yUnits.toFixed(3)}-${widthUnits.toFixed(
        3,
      )}-${heightUnits.toFixed(3)}`,
      href,
      leftPx,
      topPx,
      widthPx,
      heightPx,
      zIndex: 0,
      tileCol,
      tileRow,
      opacity,
      isRotatedQuarterTurn,
      depthSort,
    });
  });
  depthSprites.sort((a, b) => {
    if (a.depthSort !== b.depthSort) {
      return a.depthSort - b.depthSort;
    }
    if (a.topPx !== b.topPx) {
      return a.topPx - b.topPx;
    }
    return a.key.localeCompare(b.key);
  });
  return depthSprites.map((sprite, index) => ({
    key: sprite.key,
    href: sprite.href,
    leftPx: sprite.leftPx,
    topPx: sprite.topPx,
    widthPx: sprite.widthPx,
    heightPx: sprite.heightPx,
    zIndex: 1000 + index,
    tileCol: sprite.tileCol,
    tileRow: sprite.tileRow,
    opacity: sprite.opacity,
    isRotatedQuarterTurn: sprite.isRotatedQuarterTurn,
  }));
}

function extractBoardSurfaceClipPath(boardHost: HTMLElement): string | null {
  const svg = boardHost.querySelector<SVGSVGElement>('.super-mons-board svg');
  if (svg === null) {
    return null;
  }
  const svgCtm = svg.getScreenCTM();
  if (svgCtm === null) {
    return null;
  }
  const corners = [
    new DOMPoint(0, 0),
    new DOMPoint(11, 0),
    new DOMPoint(11, 11),
    new DOMPoint(0, 11),
  ].map((point) => point.matrixTransform(svgCtm));
  if (corners.some((point) => !Number.isFinite(point.x) || !Number.isFinite(point.y))) {
    return null;
  }
  return `polygon(${corners
    .map((point) => `${point.x.toFixed(2)}px ${point.y.toFixed(2)}px`)
    .join(', ')})`;
}

const topBarStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 30,
  padding: '0 10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#fff',
  borderBottom: '1px solid #e5e5e5',
  zIndex: 20,
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

const sceneViewportStyle: CSSProperties = {
  position: 'absolute',
  top: TOP_BAR_HEIGHT_PX,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  perspective: 'none',
  userSelect: 'none',
  touchAction: 'none',
};

const sceneFrameStyle: CSSProperties = {
  position: 'relative',
  width: PRISM_WIDTH_PX + 260,
  height: PRISM_DEPTH_PX + 220,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const zoomLayerBaseStyle: CSSProperties = {
  position: 'relative',
  transformOrigin: '50% 50%',
  willChange: 'transform',
};

const floatLayerStyle: CSSProperties = {
  position: 'relative',
  transformStyle: 'preserve-3d',
};

const prismCoreBaseStyle: CSSProperties = {
  position: 'relative',
  width: PRISM_WIDTH_PX,
  height: PRISM_HEIGHT_PX,
  transformStyle: 'preserve-3d',
  willChange: 'transform',
};

const baseShadowStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  width: PRISM_WIDTH_PX * 0.78,
  height: 24,
  transform: 'translate(-50%, 148px)',
  background:
    'radial-gradient(ellipse at center, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.11) 55%, rgba(0,0,0,0) 100%)',
  filter: 'blur(12px)',
  pointerEvents: 'none',
};

const faceBaseStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  boxSizing: 'border-box',
  border: '1px solid rgba(0,0,0,0.32)',
  backfaceVisibility: 'hidden',
};

const frontFaceStyle: CSSProperties = {
  ...faceBaseStyle,
  width: PRISM_WIDTH_PX,
  height: PRISM_HEIGHT_PX,
  background:
    'linear-gradient(150deg, rgba(245,245,245,0.98) 0%, rgba(227,227,227,0.98) 48%, rgba(214,214,214,0.98) 100%)',
  transform: `translate(-50%, -50%) translateZ(${PRISM_DEPTH_PX / 2}px)`,
};

const backFaceStyle: CSSProperties = {
  ...faceBaseStyle,
  width: PRISM_WIDTH_PX,
  height: PRISM_HEIGHT_PX,
  background:
    'linear-gradient(150deg, rgba(228,228,228,0.98) 0%, rgba(209,209,209,0.98) 55%, rgba(196,196,196,0.98) 100%)',
  transform: `translate(-50%, -50%) rotateY(180deg) translateZ(${PRISM_DEPTH_PX / 2}px)`,
};

const rightFaceStyle: CSSProperties = {
  ...faceBaseStyle,
  width: PRISM_DEPTH_PX,
  height: PRISM_HEIGHT_PX,
  background:
    'linear-gradient(180deg, rgba(232,232,232,0.98) 0%, rgba(207,207,207,0.98) 100%)',
  transform: `translate(-50%, -50%) rotateY(90deg) translateZ(${PRISM_WIDTH_PX / 2}px)`,
};

const leftFaceStyle: CSSProperties = {
  ...faceBaseStyle,
  width: PRISM_DEPTH_PX,
  height: PRISM_HEIGHT_PX,
  background:
    'linear-gradient(180deg, rgba(220,220,220,0.98) 0%, rgba(194,194,194,0.98) 100%)',
  transform: `translate(-50%, -50%) rotateY(-90deg) translateZ(${PRISM_WIDTH_PX / 2}px)`,
};

const topFaceStyle: CSSProperties = {
  ...faceBaseStyle,
  width: PRISM_WIDTH_PX,
  height: PRISM_DEPTH_PX,
  border: 'none',
  backgroundColor: '#fff',
  overflow: 'hidden',
  transform: `translate(-50%, -50%) rotateX(90deg) translateZ(${PRISM_HEIGHT_PX / 2}px)`,
};

const topFaceBoardHostStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'auto',
};

const topFaceBoardScaleWrapStyle: CSSProperties = {
  transform: `translateZ(${BOARD_SURFACE_Z_OFFSET_PX}px) scale(${BOARD_SURFACE_SCALE})`,
  transformOrigin: 'center center',
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backfaceVisibility: 'hidden',
};

const topFaceBoardInnerWrapStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
};

const topFaceOutlineStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  boxSizing: 'border-box',
  border: '1px solid rgba(0, 0, 0, 0.62)',
  pointerEvents: 'none',
  zIndex: 3,
};

const boardRotationHintStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  bottom: '4.4%',
  transform: 'translateX(-50%)',
  fontSize: 12,
  lineHeight: 1.15,
  letterSpacing: 0.08,
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  transition: 'opacity 1050ms ease',
  zIndex: 4,
};

const billboardLayerStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  overflow: 'visible',
  pointerEvents: 'none',
  zIndex: 14,
};

const billboardReflectionLayerStyle: CSSProperties = {
  ...billboardLayerStyle,
  zIndex: 13,
};

const billboardSpritePlaneBaseStyle: CSSProperties = {
  position: 'absolute',
  transformStyle: 'flat',
  transformOrigin: 'center bottom',
  pointerEvents: 'auto',
  willChange: 'transform',
  cursor: 'pointer',
};

const billboardSpriteScaleWrapBaseStyle: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  transformOrigin: 'center bottom',
  willChange: 'transform',
};

const billboardSpriteImageStyle: CSSProperties = {
  position: 'relative',
  zIndex: 2,
  width: '100%',
  height: '100%',
  display: 'block',
  objectFit: 'contain',
  imageRendering: 'pixelated',
  pointerEvents: 'none',
  filter:
    'drop-shadow(0 0.08px 0 rgba(0, 0, 0, 0.46)) drop-shadow(0 0.17px 0 rgba(0, 0, 0, 0.2))',
};

const billboardSpriteImageHoverGlowFilter =
  'drop-shadow(0 0.08px 0 rgba(0, 0, 0, 0.46)) drop-shadow(0 0.17px 0 rgba(0, 0, 0, 0.2)) drop-shadow(0 0 3.8px rgba(255, 255, 255, 0.68)) drop-shadow(0 0 7.8px rgba(255, 255, 255, 0.34))';

const billboardSpriteReflectionWrapStyle: CSSProperties = {
  position: 'absolute',
  left: 0,
  top: '100%',
  width: '100%',
  height: '100%',
  transform: `translateY(${BILLBOARD_REFLECTION_VERTICAL_OFFSET_PX}px) scaleY(${BILLBOARD_REFLECTION_HEIGHT_SCALE})`,
  transformOrigin: 'top center',
  overflow: 'hidden',
  pointerEvents: 'none',
  WebkitMaskImage:
    'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.28) 42%, rgba(0,0,0,0.08) 70%, rgba(0,0,0,0) 100%)',
  maskImage:
    'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.28) 42%, rgba(0,0,0,0.08) 70%, rgba(0,0,0,0) 100%)',
};

const billboardSpriteReflectionImageStyle: CSSProperties = {
  ...billboardSpriteImageStyle,
  position: 'absolute',
  inset: 0,
  transformOrigin: 'center center',
  pointerEvents: 'none',
};

const normalManaHitTargetStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: '57%',
  width: '33%',
  height: '47%',
  transform: 'translate(-50%, -50%)',
  borderRadius: '52% 52% 54% 54% / 62% 62% 42% 42%',
  background: 'transparent',
  pointerEvents: 'auto',
  cursor: 'pointer',
  zIndex: 4,
};

const superManaHitTargetStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: '56%',
  width: '42%',
  height: '58%',
  transform: 'translate(-50%, -50%)',
  borderRadius: '50%',
  background: 'transparent',
  pointerEvents: 'auto',
  cursor: 'pointer',
  zIndex: 4,
};

const itemHitTargetStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: '56%',
  width: '58%',
  height: '66%',
  transform: 'translate(-50%, -50%)',
  borderRadius: '30%',
  background: 'transparent',
  pointerEvents: 'auto',
  cursor: 'pointer',
  zIndex: 4,
};

const monHitTargetStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: '54%',
  width: '72%',
  height: '82%',
  transform: 'translate(-50%, -50%)',
  borderRadius: '22%',
  background: 'transparent',
  pointerEvents: 'auto',
  cursor: 'pointer',
  zIndex: 4,
};

function getSpriteHitTargetStyle(href: string): CSSProperties {
  if (isNormalManaBillboardHref(href)) {
    return normalManaHitTargetStyle;
  }
  if (isSuperManaBillboardHref(href)) {
    return superManaHitTargetStyle;
  }
  if (isItemBillboardHref(href)) {
    return itemHitTargetStyle;
  }
  return monHitTargetStyle;
}

const billboardItemStandeeSparkleLayerStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 1,
};

const billboardItemStandeeSparkleSvgStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'block',
  overflow: 'visible',
  imageRendering: 'pixelated',
};

const bobToggleButtonStyle: CSSProperties = {
  height: 24,
  border: '1px solid #111',
  borderRadius: 0,
  backgroundColor: '#fff',
  color: '#111',
  fontSize: 12,
  lineHeight: '22px',
  padding: '0 10px',
  margin: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
};

const undoHudButtonStyle: CSSProperties = {
  ...bobToggleButtonStyle,
  width: 44,
  padding: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const reflectionsToggleButtonStyle: CSSProperties = {
  ...bobToggleButtonStyle,
};

const shadowToggleButtonStyle: CSSProperties = {
  ...bobToggleButtonStyle,
};

const grassToggleButtonStyle: CSSProperties = {
  ...bobToggleButtonStyle,
};

const darkModeToggleButtonStyle: CSSProperties = {
  ...bobToggleButtonStyle,
};

const bottomControlsDockStyle: CSSProperties = {
  position: 'fixed',
  right: 14,
  bottom: 14,
  display: 'inline-flex',
  alignItems: 'center',
  zIndex: 24,
};

const bottomControlsMainRowStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0,
};

const bottomControlsJoinedButtonStyle: CSSProperties = {
  borderLeft: 0,
};

const undoToBobGapStyle: CSSProperties = {
  width: 10,
  minWidth: 10,
  height: 1,
  pointerEvents: 'none',
};

const playerHudStripBaseStyle: CSSProperties = {
  position: 'fixed',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'fixed',
  minHeight: 30,
  zIndex: 24,
  pointerEvents: 'none',
  color: '#6f6f6f',
  opacity: 0.9,
  lineHeight: 1,
};

const opponentHudStripStyle: CSSProperties = {
  ...playerHudStripBaseStyle,
  top: TOP_BAR_HEIGHT_PX + 8,
};

const playerHudStripStyle: CSSProperties = {
  ...playerHudStripBaseStyle,
  bottom: 14,
};

const playerHudAvatarStyle: CSSProperties = {
  width: 30,
  height: 30,
  display: 'block',
  objectFit: 'cover',
  imageRendering: 'auto',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  WebkitUserDrag: 'none',
};

const playerHudScoreStyle: CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 24,
  fontWeight: 600,
  color: '#666',
  minWidth: 20,
  textAlign: 'center',
  userSelect: 'none',
  WebkitUserSelect: 'none',
};

const playerHudCoreRowStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  position: 'relative',
  zIndex: 1,
};

const playerHudPotionRowStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  marginLeft: 8,
  pointerEvents: 'none',
};

const playerHudPotionIconStyle: CSSProperties = {
  width: 20,
  height: 20,
  display: 'block',
  imageRendering: 'auto',
  filter: 'drop-shadow(0 0.5px 0 rgba(0,0,0,0.35))',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  WebkitUserDrag: 'none',
};

const bottomFaceStyle: CSSProperties = {
  ...faceBaseStyle,
  width: PRISM_WIDTH_PX,
  height: PRISM_DEPTH_PX,
  background:
    'linear-gradient(150deg, rgba(206,206,206,0.98) 0%, rgba(184,184,184,0.98) 100%)',
  transform: `translate(-50%, -50%) rotateX(-90deg) translateZ(${PRISM_HEIGHT_PX / 2}px)`,
};

const grassPlaneStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  width: GRASS_PLANE_WIDTH_PX,
  height: GRASS_PLANE_HEIGHT_PX,
  transform: `translate(-50%, -50%) rotateX(90deg) translateZ(${-(PRISM_HEIGHT_PX / 2 + GRASS_PLANE_BELOW_BOARD_PX)}px)`,
  transformOrigin: 'center center',
  overflow: 'hidden',
  borderRadius: '50%',
  imageRendering: 'pixelated',
  transformStyle: 'preserve-3d',
  contain: 'layout paint style',
  isolation: 'isolate',
  willChange: 'transform, opacity',
  pointerEvents: 'none',
  backfaceVisibility: 'visible',
};

const grassPlaneTextureStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundImage:
    "image-set(url('/assets/grass.webp') type('image/webp') 1x, url('/assets/grass.png') type('image/png') 1x)",
  backgroundRepeat: 'repeat',
  backgroundPosition: '50% 50%',
  backgroundSize: `${GRASS_PLANE_TILE_SIZE_PX}px ${GRASS_PLANE_TILE_SIZE_PX}px`,
  transform: `translateZ(${GRASS_TILE_LAYER_Z_PX}px)`,
  willChange: 'transform, filter, background-size',
  imageRendering: 'pixelated',
  pointerEvents: 'none',
  backfaceVisibility: 'visible',
};

const grassPlaneBaseFillStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  transform: `translateZ(${(GRASS_TILE_LAYER_Z_PX - 0.01).toFixed(2)}px)`,
  pointerEvents: 'none',
  backfaceVisibility: 'visible',
};

const grassPlaneFadeOverlayStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  transform: `translateZ(${(GRASS_CLOUD_LAYER_Z_PX + 0.08).toFixed(2)}px)`,
  pointerEvents: 'none',
  backfaceVisibility: 'visible',
};

const projectedCloudSurfaceStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  transform: `translateZ(${GRASS_CLOUD_LAYER_Z_PX}px)`,
  overflow: 'hidden',
  transformStyle: 'flat',
  willChange: 'transform, opacity',
  pointerEvents: 'none',
  backfaceVisibility: 'visible',
};

const projectedGrassCloudLayerStyle: CSSProperties = {
  ...projectedCloudSurfaceStyle,
  opacity: 0.84,
};

export default function ThreeDBoardPage(): ReactNode {
  const [rotation, setRotation] = useState<Rotation>({x: -89, y: 0});
  const [zoomScale, setZoomScale] = useState(1.42);
  const [isBoardBobbing, setIsBoardBobbing] = useState(false);
  const [hoveredBoardTile, setHoveredBoardTile] = useState<Tile | null>(null);
  const [hoveredSpriteTile, setHoveredSpriteTile] = useState<Tile | null>(null);
  const [selectedSpriteTile, setSelectedSpriteTile] = useState<Tile | null>(null);
  const [hoveredSpriteKey, setHoveredSpriteKey] = useState<string | null>(null);
  const [isItemPickupChoiceOpen, setIsItemPickupChoiceOpen] = useState(false);
  const [externalResetTrigger, setExternalResetTrigger] = useState(0);
  const [areReflectionsEnabled, setAreReflectionsEnabled] = useState(true);
  const [isBoardShadowEnabled, setIsBoardShadowEnabled] = useState(true);
  const [isGrassModeEnabled, setIsGrassModeEnabled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showRotationHint, setShowRotationHint] = useState(false);
  const [cloudEnabled, setCloudEnabled] = useState<boolean>(CLOUD_ENABLED_DEFAULT);
  const [cloudSpeedMultiplier, setCloudSpeedMultiplier] = useState<number>(CLOUD_SPEED_DEFAULT);
  const [hudSnapshot, setHudSnapshot] = useState<{
    playerScore: number;
    opponentScore: number;
    playerPotionCount: number;
    opponentPotionCount: number;
    canReset: boolean;
    isResetAnimating: boolean;
  }>({
    playerScore: 0,
    opponentScore: 0,
    playerPotionCount: 0,
    opponentPotionCount: 0,
    canReset: false,
    isResetAnimating: false,
  });
  const [dragState, setDragState] = useState<{
    pointerId: number;
    lastX: number;
    lastY: number;
  } | null>(null);
  const [billboardSprites, setBillboardSprites] = useState<BillboardSprite[]>([]);
  const [boardSurfaceClipPath, setBoardSurfaceClipPath] = useState<string | null>(null);
  const boardHostRef = useRef<HTMLDivElement | null>(null);
  const zoomScaleRef = useRef(zoomScale);
  const rotationRef = useRef(rotation);
  const hasDismissedRotationHintRef = useRef(false);
  const itemStandeeSparklesByKeyRef = useRef<Record<string, ItemStandeeSparkleParticle[]>>({});
  const animationClockSecondsRef = useRef<number>(
    typeof window === 'undefined' ? 0 : Date.now() / 1000,
  );
  const animationClockSeconds = animationClockSecondsRef.current;
  const grassCloudShadowStyles = useMemo(
    () =>
      GRASS_CLOUD_SHADOWS.map((shadow, index) =>
        getCloudShadowStyle(
          shadow,
          index,
          animationClockSeconds,
          GRASS_PLANE_WIDTH_PX,
        ),
      ),
    [animationClockSeconds],
  );
  const cloudLobeStyles = useMemo(
    () =>
      GRASS_CLOUD_SHADOWS.map((shadow, index) =>
        Array.from({length: CLOUD_LOBE_COUNT}, (_unused, lobeIndex) =>
          getCloudLobeStyle(shadow, index, lobeIndex),
        ),
      ),
    [],
  );
  const safeCloudSpeedMultiplier = clampCloudSpeed(cloudSpeedMultiplier);
  const cloudVariablesStyle = useMemo<CSSProperties>(
    () => ({
      ['--cloud-speed-multiplier' as any]: safeCloudSpeedMultiplier.toFixed(2),
      ['--cloud-speed-blur-boost' as any]: `${Math.max(
        0,
        (safeCloudSpeedMultiplier - 1) * 0.3,
      ).toFixed(2)}px`,
      ['--cloud-speed-width-scale' as any]: (
        1 + Math.max(0, safeCloudSpeedMultiplier - 1) * 0.022
      ).toFixed(3),
    }),
    [safeCloudSpeedMultiplier],
  );

  useEffect(() => {
    zoomScaleRef.current = zoomScale;
  }, [zoomScale]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const revealTimeoutId = window.setTimeout(() => {
      if (!hasDismissedRotationHintRef.current) {
        setShowRotationHint(true);
      }
    }, 36);
    return () => {
      window.clearTimeout(revealTimeoutId);
    };
  }, []);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);
  useEffect(() => {
    if (!isItemPickupChoiceOpen) {
      return;
    }
    setHoveredSpriteKey(null);
    setHoveredSpriteTile(null);
  }, [isItemPickupChoiceOpen]);

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
  }, []);

  useEffect(() => {
    const boardHost = boardHostRef.current;
    if (boardHost === null || typeof window === 'undefined') {
      return;
    }
    let rafId = 0;
    let isRunning = true;
    const tick = () => {
      if (!isRunning) {
        return;
      }
      setBillboardSprites(
        extractBillboardSprites(
          boardHost,
          zoomScaleRef.current,
          rotationRef.current,
        ),
      );
      setBoardSurfaceClipPath(extractBoardSurfaceClipPath(boardHost));
      rafId = window.requestAnimationFrame(tick);
    };
    tick();

    return () => {
      isRunning = false;
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  const prismCoreStyle: CSSProperties = {
    ...prismCoreBaseStyle,
    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
    transition: 'none',
  };

  const zoomLayerStyle: CSSProperties = {
    ...zoomLayerBaseStyle,
    transform: `scale(${zoomScale})`,
    transition: 'none',
  };
  const floatLayerDynamicStyle: CSSProperties = {
    ...floatLayerStyle,
    animation: isBoardBobbing ? 'boardFloat 4.8s ease-in-out infinite' : 'none',
  };
  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('[aria-label="3d board top bar"]')) {
      return;
    }
    if (event.button !== 2) {
      return;
    }
    setDragState({
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastY: event.clientY,
    });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!dragState || event.pointerId !== dragState.pointerId) {
      return;
    }
    const deltaX = event.clientX - dragState.lastX;
    const deltaY = event.clientY - dragState.lastY;
    if (deltaX === 0 && deltaY === 0) {
      return;
    }
    if (!hasDismissedRotationHintRef.current) {
      hasDismissedRotationHintRef.current = true;
      setShowRotationHint(false);
    }
    setRotation((current) => ({
      x: clamp(current.x - deltaY * ROTATION_SENSITIVITY, -89, 0),
      y: current.y + deltaX * ROTATION_SENSITIVITY,
    }));
    setDragState((current) =>
      current
        ? {
            ...current,
            lastX: event.clientX,
            lastY: event.clientY,
          }
        : current,
    );
  };

  const clearDragState = (event: PointerEvent<HTMLElement>) => {
    if (!dragState || event.pointerId !== dragState.pointerId) {
      return;
    }
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragState(null);
  };

  const applyWheelZoomDelta = (deltaY: number, deltaMode: number) => {
    const deltaPx = normalizeWheelDeltaPx(deltaY, deltaMode);
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
    setZoomScale((current) => clamp(current + zoomDelta, ZOOM_MIN, ZOOM_MAX));
  };

  const handleSceneWheel = (event: WheelEvent<HTMLElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('[aria-label="3d board top bar"]')) {
      return;
    }
    applyWheelZoomDelta(event.deltaY, event.deltaMode);
  };

  const triggerTileClickFromSprite = (tileCol: number, tileRow: number) => {
    const boardHost = boardHostRef.current;
    if (boardHost === null) {
      return;
    }
    const svg = boardHost.querySelector<SVGSVGElement>('.super-mons-board svg');
    if (svg === null) {
      return;
    }
    const hoverRects = Array.from(
      svg.querySelectorAll<SVGRectElement>('rect[fill="transparent"]'),
    );
    const targetRect = hoverRects.find((rect) => {
      const x = parseSvgUnit(rect.getAttribute('x'));
      const y = parseSvgUnit(rect.getAttribute('y'));
      return x === tileCol && y === tileRow;
    });
    if (targetRect === undefined) {
      return;
    }
    targetRect.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
      }),
    );
  };

  const getItemStandeeSparkles = (spriteKey: string): ItemStandeeSparkleParticle[] => {
    const cached = itemStandeeSparklesByKeyRef.current[spriteKey];
    if (cached !== undefined) {
      return cached;
    }
    const seed = hashStringToSeed(spriteKey);
    const particles = createItemStandeeSparkleParticles(seed);
    itemStandeeSparklesByKeyRef.current[spriteKey] = particles;
    return particles;
  };

  const topDownRecenterBlend = clamp(
    (Math.abs(rotation.x) - TOP_DOWN_RECENTER_START_DEG) /
      (TOP_DOWN_RECENTER_END_DEG - TOP_DOWN_RECENTER_START_DEG),
    0,
    1,
  );
  const reflectionVisibility = Math.pow(1 - topDownRecenterBlend, 1.65);
  const farZoomStabilityBlend = clamp(
    (FAR_ZOOM_STABILITY_START - zoomScale) /
      (FAR_ZOOM_STABILITY_START - ZOOM_MIN),
    0,
    1,
  );
  const boardGlossAngleDeg = clamp(18 + rotation.y * 0.32, -46, 46);
  const boardGlossCenterXPercent = clamp(50 + rotation.y * 0.58, 8, 92);
  const boardGlossCenterYPercent = clamp(47 - rotation.x * 0.74, 6, 94);
  const boardGlossSpotOpacity = isDarkMode
    ? 0.11 + (1 - topDownRecenterBlend) * 0.06
    : 0.15 + (1 - topDownRecenterBlend) * 0.08;
  const boardGlossSweepOpacity = isDarkMode
    ? 0.06 + (1 - topDownRecenterBlend) * 0.04
    : 0.08 + (1 - topDownRecenterBlend) * 0.05;
  const lowAngleStabilityBlend = clamp(
    (LOW_ANGLE_STABILITY_START_DEG - Math.abs(rotation.x)) /
      LOW_ANGLE_STABILITY_START_DEG,
    0,
    1,
  );
  const antiFlickerBlend = clamp(
    lowAngleStabilityBlend * farZoomStabilityBlend,
    0,
    1,
  );
  const lowAngleAntiShimmerBlend = clamp(lowAngleStabilityBlend, 0, 1);
  const boardBaseContrast = isDarkMode ? 1.1 : 1.085;
  const boardBaseSaturate = isDarkMode ? 0.98 : 1.02;
  const antiFlickerSmoothBlend = Math.pow(antiFlickerBlend, 0.92);
  const boardStabilizedContrast = Math.max(
    0.8,
    boardBaseContrast - antiFlickerSmoothBlend * 0.22,
  );
  const boardStabilizedSaturate = Math.max(
    0.78,
    boardBaseSaturate - antiFlickerSmoothBlend * 0.15,
  );
  const boardLowAngleBlurPx =
    BOARD_LOW_ANGLE_STABILITY_BLUR_MAX_PX * Math.pow(lowAngleAntiShimmerBlend, 1.08);
  const boardSvgCompositeFilter = 'none';
  const boardSvgShapeRendering = 'geometricPrecision';
  const boardSvgImageRendering = 'auto';
  const boardGlossOpacity = clamp(1 - antiFlickerSmoothBlend * 0.72, 0.16, 1);
  const shouldUseSmoothGrassRendering = true;
  const grassTextureTileSizePx = GRASS_PLANE_TILE_SIZE_PX;
  const grassTextureBlurPx = GRASS_STABLE_BLUR_PX;
  const grassPatternOpacity = 1;
  const grassBaseFillOpacity = 0;
  const grassCloudOpacityMultiplier = 1;
  const grassEdgeFadeColor = isDarkMode ? '7,9,14' : '255,255,255';
  const currentPageStyle: CSSProperties = isDarkMode
    ? {
        ...pageStyle,
        backgroundColor: '#07090e',
      }
    : pageStyle;
  const currentTopBarStyle: CSSProperties = isDarkMode
    ? {
        ...topBarStyle,
        backgroundColor: '#0d1017',
        borderBottom: '1px solid rgba(255,255,255,0.22)',
      }
    : topBarStyle;
  const currentTopBarButtonStyle: CSSProperties = isDarkMode
    ? {
        ...topBarButtonStyle,
        border: '1px solid rgba(255,255,255,0.52)',
        backgroundColor: '#121620',
        color: '#eef2ff',
      }
    : topBarButtonStyle;
  const currentTopBarButtonActiveStyle: CSSProperties = isDarkMode
    ? {
        ...topBarButtonActiveStyle,
        border: '1px solid rgba(255,255,255,0.7)',
        backgroundColor: '#f1f4ff',
        color: '#0d1017',
      }
    : topBarButtonActiveStyle;
  const currentTopBarTitleStyle: CSSProperties = isDarkMode
    ? {
        ...topBarTitleStyle,
        color: '#eef2ff',
      }
    : topBarTitleStyle;
  const currentBaseShadowStyle: CSSProperties = isDarkMode
    ? {
        ...baseShadowStyle,
        background:
          'radial-gradient(ellipse at center, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.28) 58%, rgba(0,0,0,0) 100%)',
      }
    : baseShadowStyle;
  const currentFrontFaceStyle: CSSProperties = isDarkMode
    ? {
        ...frontFaceStyle,
        border: '1px solid rgba(255,255,255,0.18)',
        background:
          'linear-gradient(150deg, rgba(44,49,58,0.98) 0%, rgba(34,38,47,0.98) 48%, rgba(26,30,38,0.98) 100%)',
      }
    : frontFaceStyle;
  const currentBackFaceStyle: CSSProperties = isDarkMode
    ? {
        ...backFaceStyle,
        border: '1px solid rgba(255,255,255,0.15)',
        background:
          'linear-gradient(150deg, rgba(34,38,47,0.98) 0%, rgba(26,30,38,0.98) 55%, rgba(19,23,30,0.98) 100%)',
      }
    : backFaceStyle;
  const currentRightFaceStyle: CSSProperties = isDarkMode
    ? {
        ...rightFaceStyle,
        border: '1px solid rgba(255,255,255,0.14)',
        background:
          'linear-gradient(180deg, rgba(37,42,50,0.98) 0%, rgba(24,28,35,0.98) 100%)',
      }
    : rightFaceStyle;
  const currentLeftFaceStyle: CSSProperties = isDarkMode
    ? {
        ...leftFaceStyle,
        border: '1px solid rgba(255,255,255,0.14)',
        background:
          'linear-gradient(180deg, rgba(32,36,44,0.98) 0%, rgba(22,26,33,0.98) 100%)',
      }
    : leftFaceStyle;
  const currentTopFaceStyle: CSSProperties = isDarkMode
    ? {
        ...topFaceStyle,
        backgroundColor: '#0f131b',
      }
    : topFaceStyle;
  const currentBottomFaceStyle: CSSProperties = isDarkMode
    ? {
        ...bottomFaceStyle,
        border: '1px solid rgba(255,255,255,0.14)',
        background:
          'linear-gradient(150deg, rgba(26,30,37,0.98) 0%, rgba(17,21,27,0.98) 100%)',
      }
    : bottomFaceStyle;
  const currentGrassPlaneStyle: CSSProperties = isDarkMode
    ? {
        ...grassPlaneStyle,
        filter: 'brightness(0.38) saturate(0.78)',
      }
    : {
        ...grassPlaneStyle,
      };
  const currentGrassFadeOverlayStyle: CSSProperties = {
    ...grassPlaneFadeOverlayStyle,
    background: `radial-gradient(circle ${GRASS_MASK_RADIUS_PX.toFixed(
      2,
    )}px at 50% 50%, rgba(${grassEdgeFadeColor},0) 0px, rgba(${grassEdgeFadeColor},0) ${GRASS_MASK_INNER_RADIUS_PX.toFixed(
      2,
    )}px, rgba(${grassEdgeFadeColor},0.66) ${GRASS_MASK_MID_RADIUS_PX.toFixed(
      2,
    )}px, rgba(${grassEdgeFadeColor},1) ${GRASS_MASK_RADIUS_PX.toFixed(
      2,
    )}px, rgba(${grassEdgeFadeColor},1) 100%)`,
  };
  const currentGrassBaseFillStyle: CSSProperties = {
    ...grassPlaneBaseFillStyle,
    backgroundColor: isDarkMode ? '#131a14' : '#cedac1',
    opacity: grassBaseFillOpacity,
  };
  const currentTopFaceOutlineStyle: CSSProperties = isDarkMode
    ? {
        ...topFaceOutlineStyle,
        border: '1px solid rgba(255,255,255,0.52)',
      }
    : topFaceOutlineStyle;
  const currentBoardRotationHintStyle: CSSProperties = {
    ...boardRotationHintStyle,
    opacity: showRotationHint ? 1 : 0,
    color: isDarkMode ? 'rgba(232,237,246,0.82)' : 'rgba(22,22,22,0.54)',
    textShadow: isDarkMode
      ? '0 1px 0 rgba(0,0,0,0.56)'
      : '0 1px 0 rgba(255,255,255,0.84)',
  };
  const currentHudScoreStyle: CSSProperties = isDarkMode
    ? {
        ...playerHudScoreStyle,
        color: '#c4c8d6',
      }
    : playerHudScoreStyle;
  const themedHudButtonStyle: CSSProperties = isDarkMode
    ? {
        backgroundColor: '#121620',
        border: '1px solid rgba(255,255,255,0.5)',
        color: '#eef2ff',
      }
    : {};
  const boardGlossOverlayStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 2,
    mixBlendMode: 'screen',
    opacity: boardGlossOpacity,
    background: `
      radial-gradient(88% 66% at ${boardGlossCenterXPercent}% ${boardGlossCenterYPercent}%,
        rgba(255,255,255,${boardGlossSpotOpacity.toFixed(3)}) 0%,
        rgba(255,255,255,${(boardGlossSpotOpacity * 0.54).toFixed(3)}) 24%,
        rgba(255,255,255,0) 62%
      ),
      linear-gradient(${boardGlossAngleDeg.toFixed(2)}deg,
        rgba(255,255,255,${boardGlossSweepOpacity.toFixed(3)}) 0%,
        rgba(255,255,255,0) 36%,
        rgba(255,255,255,0) 64%,
        rgba(0,0,0,0.04) 100%
      )
    `,
    transition: 'background 120ms linear',
  };
  const billboardTranslateYPercent = -100 + 50 * topDownRecenterBlend;
  const billboardGroundOffsetPx = BILLBOARD_GROUND_OFFSET_PX * (1 - topDownRecenterBlend);
  const shouldUseSmoothBillboardRendering = zoomScale <= BILLBOARD_SMOOTH_RENDER_MAX_ZOOM;

  return (
    <main
      style={currentPageStyle}
      aria-label="3d board page"
      onContextMenuCapture={(event) => {
        const target = event.target as HTMLElement | null;
        if (target?.closest('[aria-label="3d board top bar"]')) {
          return;
        }
        event.preventDefault();
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={clearDragState}
      onPointerCancel={clearDragState}
      onWheelCapture={handleSceneWheel}>
      <style>{`
        @keyframes boardFloat {
          0% { transform: translateY(-6px); }
          50% { transform: translateY(6px); }
          100% { transform: translateY(-6px); }
        }
        [aria-label="3d board page"],
        [aria-label="3d board page"] * {
          user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        [aria-label="3d board page"] *::selection {
          background: transparent;
          color: inherit;
        }
        .three-d-board-grass-clouds {
          transform-style: preserve-3d;
          backface-visibility: visible;
        }
        .three-d-board-grass-clouds .cloud-shadows__blob {
          mix-blend-mode: normal;
        }
        .three-d-board-surface .super-mons-board svg {
          overflow: visible;
          shape-rendering: ${boardSvgShapeRendering};
          image-rendering: ${boardSvgImageRendering};
          filter: ${boardSvgCompositeFilter};
          transform: translateZ(0.01px);
          will-change: transform;
          contain: paint;
          backface-visibility: hidden;
        }
        .three-d-board-surface .super-mons-board svg rect,
        .three-d-board-surface .super-mons-board svg path,
        .three-d-board-surface .super-mons-board svg line,
        .three-d-board-surface .super-mons-board svg polygon {
          shape-rendering: ${boardSvgShapeRendering};
        }
        .three-d-board-surface .super-mons-board svg image:not(.spawn-ghost-image) {
          opacity: 0 !important;
        }
        .three-d-board-surface .super-mons-board svg image.spawn-ghost-image[href*="B.png"] {
          transform-box: fill-box;
          transform-origin: center;
          transform: rotate(180deg);
        }
        .three-d-board-surface .super-mons-board button[aria-label="Open fullscreen board"],
        .three-d-board-surface .super-mons-board button[aria-label="Close fullscreen board"] {
          display: none !important;
        }
        .three-d-board-surface .super-mons-board [aria-label="Opponent turn resources"],
        .three-d-board-surface .super-mons-board [aria-label="Player turn resources"] {
          display: none !important;
        }
        .three-d-board-surface .super-mons-board [aria-label="Opponent HUD"],
        .three-d-board-surface .super-mons-board [aria-label="Player HUD"] {
          display: none !important;
        }
      `}</style>
      <div aria-label="3d board top bar" style={currentTopBarStyle}>
        <span style={currentTopBarTitleStyle}>mons future aesthetic research</span>
        <div style={topBarButtonsStyle}>
          <button
            type="button"
            style={currentTopBarButtonStyle}
            onClick={() => {
              window.location.assign('/drainer-grid');
            }}>
            icon ocean
          </button>
          <button
            type="button"
            aria-current="page"
            style={currentTopBarButtonActiveStyle}
            onClick={() => {
              window.location.assign('/3d-board');
            }}>
            3d board
          </button>
        </div>
      </div>
      <div
        aria-label="3d prism viewport"
        style={sceneViewportStyle}
        >
        <div style={sceneFrameStyle}>
          <div style={zoomLayerStyle}>
            {isBoardShadowEnabled ? <div style={currentBaseShadowStyle} /> : null}
            <div style={floatLayerDynamicStyle}>
              <div style={prismCoreStyle}>
                {isGrassModeEnabled ? (
                  <div aria-hidden="true" style={currentGrassPlaneStyle}>
                    <div aria-hidden="true" style={currentGrassBaseFillStyle} />
                    <div
                      style={{
                        ...grassPlaneTextureStyle,
                        backgroundSize: `${grassTextureTileSizePx}px ${grassTextureTileSizePx}px`,
                        imageRendering: shouldUseSmoothGrassRendering
                          ? 'auto'
                          : grassPlaneTextureStyle.imageRendering,
                        opacity: grassPatternOpacity,
                        filter:
                          grassTextureBlurPx > 0.01
                            ? `blur(${grassTextureBlurPx.toFixed(3)}px)`
                            : undefined,
                      }}
                    />
                    {cloudEnabled && grassCloudOpacityMultiplier > 0.01 ? (
                      <div
                        className="cloud-shadows three-d-board-grass-clouds"
                        style={{
                          ...projectedGrassCloudLayerStyle,
                          ...cloudVariablesStyle,
                          opacity:
                            (isDarkMode ? 0.46 : projectedGrassCloudLayerStyle.opacity) *
                            grassCloudOpacityMultiplier,
                        }}>
                        {GRASS_CLOUD_SHADOWS.map((shadow, index) => (
                          <span
                            key={`grass-cloud-${shadow.top}-${index}`}
                            className="cloud-shadows__blob"
                            style={grassCloudShadowStyles[index]}>
                            <span className="cloud-shadows__aspect">
                              <span className="cloud-shadows__drift">
                                {cloudLobeStyles[index]?.map((lobeStyle, lobeIndex) => (
                                  <span
                                    key={`grass-cloud-${shadow.top}-${index}-${lobeIndex}`}
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
                    <div aria-hidden="true" style={currentGrassFadeOverlayStyle} />
                  </div>
                ) : null}
                <div style={currentFrontFaceStyle} />
                <div style={currentBackFaceStyle} />
                <div style={currentRightFaceStyle} />
                <div style={currentLeftFaceStyle} />
                <div style={currentTopFaceStyle}>
                  <div
                    ref={boardHostRef}
                    style={topFaceBoardHostStyle}
                    className="three-d-board-surface">
                    <div style={topFaceBoardScaleWrapStyle}>
                      <div style={topFaceBoardInnerWrapStyle}>
                        <SuperMetalMonsBoard
                          showPlayerHud={false}
                          boardPreset="default"
                          boardTheme={isDarkMode ? 'dark' : 'light'}
                          showSpawnGhosts
                          showSpawnGhostsAlways
                          enableFreeTileMove
                          enableHoverClickScaling={false}
                          hoveredTileOverride={hoveredSpriteTile}
                          showHoveredTileCenterDot
                          onHoveredTileChange={setHoveredBoardTile}
                          onHudSnapshotChange={setHudSnapshot}
                          onPotionCountChange={(payload) => {
                            setHudSnapshot((current) =>
                              payload.side === 'white'
                                ? {
                                    ...current,
                                    playerPotionCount: payload.count,
                                  }
                                : {
                                    ...current,
                                    opponentPotionCount: payload.count,
                                  },
                            );
                          }}
                          onItemPickupChoiceOpenChange={setIsItemPickupChoiceOpen}
                          externalResetTrigger={externalResetTrigger}
                          onSelectedTileChange={setSelectedSpriteTile}
                        />
                      </div>
                    </div>
                  </div>
                  <div aria-hidden="true" style={currentBoardRotationHintStyle}>
                    right click + drag to rotate view
                  </div>
                  <div aria-hidden="true" style={boardGlossOverlayStyle} />
                  <div aria-hidden="true" style={currentTopFaceOutlineStyle} />
                </div>
                <div style={currentBottomFaceStyle} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {areReflectionsEnabled ? (
        <div
          aria-hidden="true"
          style={{
            ...billboardReflectionLayerStyle,
            clipPath: boardSurfaceClipPath ?? undefined,
            WebkitClipPath: boardSurfaceClipPath ?? undefined,
            opacity: boardSurfaceClipPath === null ? 0 : reflectionVisibility,
          }}>
          {billboardSprites.map((sprite) => (
            (() => {
              const sharedLowAngleDropPx =
                BILLBOARD_ALL_PIECES_LOW_ANGLE_DROP_PX * (1 - topDownRecenterBlend);
              const extraManaItemDropPx = isManaOrItemBillboardHref(sprite.href)
                ? BILLBOARD_MANA_ITEM_LOW_ANGLE_DROP_PX * (1 - topDownRecenterBlend)
                : 0;
              const lowAngleDropPx = sharedLowAngleDropPx + extraManaItemDropPx;
              const reflectionOpacity = clamp(
                sprite.opacity * BILLBOARD_REFLECTION_OPACITY * reflectionVisibility,
                0,
                0.48,
              );
              const reflectionBlurPx =
                BILLBOARD_REFLECTION_BLUR_PX + topDownRecenterBlend * 0.65;
              return (
                <div
                  key={`reflection-${sprite.key}`}
                  style={{
                    ...billboardSpritePlaneBaseStyle,
                    pointerEvents: 'none',
                    left: `${sprite.leftPx}px`,
                    top: `${sprite.topPx}px`,
                    width: `${sprite.widthPx * BILLBOARD_WIDTH_SCALE}px`,
                    height: `${sprite.heightPx * BILLBOARD_HEIGHT_SCALE}px`,
                    zIndex: sprite.zIndex,
                    transform: `translate(-50%, calc(${billboardTranslateYPercent}% + ${billboardGroundOffsetPx + lowAngleDropPx}px))`,
                    transition: 'none',
                  }}>
                  <div style={billboardSpriteReflectionWrapStyle}>
                    <img
                      src={sprite.href}
                      alt=""
                      draggable={false}
                      style={{
                        ...billboardSpriteReflectionImageStyle,
                        imageRendering: shouldUseSmoothBillboardRendering ? 'auto' : 'pixelated',
                        opacity: reflectionOpacity,
                        filter: `blur(${reflectionBlurPx}px)`,
                        transform: `${sprite.isRotatedQuarterTurn ? 'rotate(90deg) ' : ''}scaleY(-1)`,
                      }}
                    />
                  </div>
                </div>
              );
            })()
          ))}
        </div>
      ) : null}
      <div aria-hidden="true" style={billboardLayerStyle}>
        {billboardSprites.map((sprite) => (
          (() => {
            const isHoveredSprite = hoveredSpriteKey === sprite.key;
            const isSelectedSprite =
              selectedSpriteTile !== null &&
              selectedSpriteTile.row === sprite.tileRow &&
              selectedSpriteTile.col === sprite.tileCol;
            const isHoveredSpriteByTile =
              hoveredBoardTile !== null &&
              hoveredBoardTile.row === sprite.tileRow &&
              hoveredBoardTile.col === sprite.tileCol;
            const isHoveredSpriteByStandeeTile =
              hoveredSpriteTile !== null &&
              hoveredSpriteTile.row === sprite.tileRow &&
              hoveredSpriteTile.col === sprite.tileCol;
            const isEmphasizedSprite =
              isHoveredSprite ||
              isHoveredSpriteByTile ||
              isHoveredSpriteByStandeeTile ||
              isSelectedSprite;
            const baseSpriteFilter =
              isEmphasizedSprite
                ? billboardSpriteImageHoverGlowFilter
                : billboardSpriteImageStyle.filter;
            const resolvedSpriteFilter =
              typeof baseSpriteFilter === 'string' ? baseSpriteFilter : '';
            const finalSpriteFilter = sprite.isRotatedQuarterTurn
              ? `${resolvedSpriteFilter} blur(${BILLBOARD_FAINTED_BLUR_PX}px)`.trim()
              : resolvedSpriteFilter;
            const isItemStandee = isItemStandeePotionHref(sprite.href);
            const itemStandeeSparkles = isItemStandee
              ? getItemStandeeSparkles(sprite.key)
              : [];
            const spriteHitTargetStyle = getSpriteHitTargetStyle(sprite.href);
            const sharedLowAngleDropPx =
              BILLBOARD_ALL_PIECES_LOW_ANGLE_DROP_PX * (1 - topDownRecenterBlend);
            const extraManaItemDropPx = isManaOrItemBillboardHref(sprite.href)
              ? BILLBOARD_MANA_ITEM_LOW_ANGLE_DROP_PX * (1 - topDownRecenterBlend)
              : 0;
            const lowAngleDropPx = sharedLowAngleDropPx + extraManaItemDropPx;
            return (
          <div
            key={sprite.key}
            style={{
              ...billboardSpritePlaneBaseStyle,
              pointerEvents: 'none',
              left: `${sprite.leftPx}px`,
              top: `${sprite.topPx}px`,
              width: `${sprite.widthPx * BILLBOARD_WIDTH_SCALE}px`,
              height: `${sprite.heightPx * BILLBOARD_HEIGHT_SCALE}px`,
              zIndex: sprite.zIndex,
              transform: `translate(-50%, calc(${billboardTranslateYPercent}% + ${billboardGroundOffsetPx + lowAngleDropPx}px))`,
              transition: 'none',
            }}
            onPointerDown={(event) => {
              if (event.button !== 0) {
                return;
              }
              event.stopPropagation();
            }}
            onPointerEnter={() => {
              setHoveredSpriteKey(sprite.key);
              setHoveredSpriteTile({row: sprite.tileRow, col: sprite.tileCol});
            }}
            onPointerMove={() => {
              setHoveredSpriteKey(sprite.key);
              setHoveredSpriteTile({row: sprite.tileRow, col: sprite.tileCol});
            }}
            onPointerLeave={() => {
              setHoveredSpriteKey((current) => (current === sprite.key ? null : current));
              setHoveredSpriteTile((current) =>
                current !== null &&
                current.row === sprite.tileRow &&
                current.col === sprite.tileCol
                  ? null
                  : current,
              );
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              triggerTileClickFromSprite(sprite.tileCol, sprite.tileRow);
            }}>
            <div
              style={{
                ...billboardSpriteScaleWrapBaseStyle,
                transform: `scale(${isEmphasizedSprite ? BILLBOARD_HOVER_SCALE : 1})`,
                transition: 'transform 190ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}>
            <div
              style={{
                ...spriteHitTargetStyle,
                pointerEvents: isItemPickupChoiceOpen ? 'none' : 'auto',
              }}
              onPointerDown={(event) => {
                if (event.button !== 0) {
                  return;
                }
                event.stopPropagation();
              }}
              onPointerEnter={() => {
                setHoveredSpriteKey(sprite.key);
                setHoveredSpriteTile({row: sprite.tileRow, col: sprite.tileCol});
              }}
              onPointerMove={() => {
                setHoveredSpriteKey(sprite.key);
                setHoveredSpriteTile({row: sprite.tileRow, col: sprite.tileCol});
              }}
              onPointerLeave={() => {
                setHoveredSpriteKey((current) => (current === sprite.key ? null : current));
                setHoveredSpriteTile((current) =>
                  current !== null &&
                  current.row === sprite.tileRow &&
                  current.col === sprite.tileCol
                    ? null
                    : current,
                );
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                triggerTileClickFromSprite(sprite.tileCol, sprite.tileRow);
              }}
            />
            {isItemStandee ? (
              <div style={billboardItemStandeeSparkleLayerStyle}>
                <svg viewBox="0 0 1 1" style={billboardItemStandeeSparkleSvgStyle}>
                  {itemStandeeSparkles.map((particle) => {
                    const bar = particle.size / 3;
                    const baseX = particle.x;
                    const baseY = particle.y;
                    return (
                      <g key={`${sprite.key}-${particle.id}`} opacity={0}>
                        <animate
                          attributeName="opacity"
                          values={`0;${particle.opacity.toFixed(3)};${particle.opacity.toFixed(3)};0`}
                          keyTimes="0;0.18;0.65;1"
                          dur={`${particle.durationMs}ms`}
                          begin={`${particle.delayMs}ms`}
                          repeatCount="indefinite"
                        />
                        <animateTransform
                          attributeName="transform"
                          type="translate"
                          values={`${baseX.toFixed(3)} ${baseY.toFixed(3)};${baseX.toFixed(3)} ${(baseY - particle.driftY).toFixed(3)}`}
                          dur={`${particle.durationMs}ms`}
                          begin={`${particle.delayMs}ms`}
                          repeatCount="indefinite"
                        />
                        <rect
                          x={0}
                          y={bar}
                          width={particle.size}
                          height={bar}
                          fill={ITEM_STANDEE_SPARKLE_LIGHT_COLOR}
                        />
                        <rect
                          x={bar}
                          y={0}
                          width={bar}
                          height={particle.size}
                          fill={ITEM_STANDEE_SPARKLE_LIGHT_COLOR}
                        />
                        <rect
                          x={bar}
                          y={bar}
                          width={bar}
                          height={bar}
                          fill={ITEM_STANDEE_SPARKLE_DARK_COLOR}
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>
            ) : null}
            <img
              src={sprite.href}
              alt=""
              draggable={false}
              style={{
                ...billboardSpriteImageStyle,
                imageRendering: shouldUseSmoothBillboardRendering ? 'auto' : 'pixelated',
                filter: finalSpriteFilter,
                opacity: sprite.opacity,
                transform: sprite.isRotatedQuarterTurn ? 'rotate(90deg)' : 'none',
              }}
            />
            </div>
          </div>
            );
          })()
        ))}
      </div>
      <div aria-label="Opponent HUD overlay" style={opponentHudStripStyle}>
        <div style={playerHudCoreRowStyle}>
          <img src={HUD_AVATAR_OPPONENT} alt="" aria-hidden="true" draggable={false} style={playerHudAvatarStyle} />
          <span style={currentHudScoreStyle}>{hudSnapshot.opponentScore}</span>
          {hudSnapshot.opponentPotionCount > 0 ? (
            <div style={playerHudPotionRowStyle}>
              {Array.from({length: hudSnapshot.opponentPotionCount}).map((_, index) => (
                <img
                  key={`opponent-hud-potion-${index}`}
                  src={HUD_POTION_ICON_SRC}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  style={playerHudPotionIconStyle}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div aria-label="Player HUD overlay" style={playerHudStripStyle}>
        <div style={playerHudCoreRowStyle}>
          <img src={HUD_AVATAR_PLAYER} alt="" aria-hidden="true" draggable={false} style={playerHudAvatarStyle} />
          <span style={currentHudScoreStyle}>{hudSnapshot.playerScore}</span>
          {hudSnapshot.playerPotionCount > 0 ? (
            <div style={playerHudPotionRowStyle}>
              {Array.from({length: hudSnapshot.playerPotionCount}).map((_, index) => (
                <img
                  key={`player-hud-potion-${index}`}
                  src={HUD_POTION_ICON_SRC}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  style={playerHudPotionIconStyle}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div style={bottomControlsDockStyle}>
        <button
          type="button"
          aria-label="Undo move"
          disabled={!hudSnapshot.canReset || hudSnapshot.isResetAnimating}
          style={{
            ...undoHudButtonStyle,
            ...themedHudButtonStyle,
            opacity: hudSnapshot.canReset || hudSnapshot.isResetAnimating ? 0.92 : 0.52,
            cursor: hudSnapshot.canReset || hudSnapshot.isResetAnimating ? 'pointer' : 'default',
            color: hudSnapshot.canReset || hudSnapshot.isResetAnimating
              ? (isDarkMode ? '#eef2ff' : '#111')
              : '#808080',
          }}
          onClick={() => {
            setExternalResetTrigger((current) => current + 1);
          }}>
          <svg viewBox="0 0 512 512" aria-hidden="true" style={{width: 16, height: 16, display: 'block'}}>
            <path
              d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"
              fill="currentColor"
            />
          </svg>
        </button>
        <span aria-hidden="true" style={undoToBobGapStyle} />
        <div style={bottomControlsMainRowStyle}>
          <button
            type="button"
            style={{
              ...bobToggleButtonStyle,
              ...themedHudButtonStyle,
            }}
            onClick={() => {
              setIsBoardBobbing((current) => {
                const next = !current;
                if (next) {
                  setIsGrassModeEnabled(false);
                }
                return next;
              });
            }}>
            {isBoardBobbing ? 'bob: on' : 'bob: off'}
          </button>
          <button
            type="button"
            style={{
              ...reflectionsToggleButtonStyle,
              ...themedHudButtonStyle,
              ...bottomControlsJoinedButtonStyle,
            }}
            onClick={() => {
              setAreReflectionsEnabled((current) => !current);
            }}>
            {areReflectionsEnabled ? 'reflections: on' : 'reflections: off'}
          </button>
          <button
            type="button"
            style={{
              ...shadowToggleButtonStyle,
              ...themedHudButtonStyle,
              ...bottomControlsJoinedButtonStyle,
            }}
            onClick={() => {
              setIsBoardShadowEnabled((current) => {
                const next = !current;
                if (next) {
                  setIsGrassModeEnabled(false);
                }
                return next;
              });
            }}>
            {isBoardShadowEnabled ? 'shadow: on' : 'shadow: off'}
          </button>
          <button
            type="button"
            style={{
              ...grassToggleButtonStyle,
              ...themedHudButtonStyle,
              ...bottomControlsJoinedButtonStyle,
            }}
            onClick={() => {
              setIsGrassModeEnabled((current) => {
                const next = !current;
                if (next) {
                  setIsBoardBobbing(false);
                  setIsBoardShadowEnabled(false);
                }
                return next;
              });
            }}>
            {isGrassModeEnabled ? 'grass: on' : 'grass: off'}
          </button>
          <button
            type="button"
            style={{
              ...darkModeToggleButtonStyle,
              ...themedHudButtonStyle,
              ...bottomControlsJoinedButtonStyle,
            }}
            onClick={() => {
              setIsDarkMode((current) => !current);
            }}>
            {isDarkMode ? 'mode: dark' : 'mode: light'}
          </button>
        </div>
      </div>
    </main>
  );
}
