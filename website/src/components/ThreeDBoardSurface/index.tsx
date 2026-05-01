import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';

type Tile = {
  row: number;
  col: number;
};

type Rotation = {
  x: number;
  y: number;
};

type BillboardSprite = {
  key: string;
  trackKey: string;
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
  isHeldAttachment: boolean;
  isLockedHeldAttachment: boolean;
  lockedHeldAnchorHeightPx?: number;
  isAttackTargeted: boolean;
};

type SvgImageFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
};

type TouchPoint = {
  x: number;
  y: number;
};

type TouchGestureAnchor = {
  centerX: number;
  centerY: number;
  distance: number;
};

type DragState = {
  mode: 'rotate' | 'pan';
  pointerId: number;
  lastX: number;
  lastY: number;
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

type ThreeDBoardSurfaceProps = {
  children: ReactNode;
  enabled: boolean;
  renderWidth: number;
  viewportWidth?: number;
  viewportHeight?: number;
  viewportBottomExtensionPx?: number;
  isFullscreen?: boolean;
  boardTheme?: 'light' | 'dark';
  hoveredTile?: Tile | null;
  selectedTile?: Tile | null;
  isItemPickupChoiceOpen?: boolean;
  onHoveredTileChange?: (tile: Tile | null) => void;
};

const PRISM_HEIGHT_RATIO = 28 / 460;
const BOARD_SURFACE_SCALE = 0.82;
const BOARD_SURFACE_Z_OFFSET_PX = 0.24;
const ROTATION_SENSITIVITY = 0.34;
const TOUCH_ROTATION_SENSITIVITY = ROTATION_SENSITIVITY * 0.72;
const TOUCH_PINCH_SCALE_MIN_STEP = 0.92;
const TOUCH_PINCH_SCALE_MAX_STEP = 1.08;
const ZOOM_MIN = 0.65;
const ZOOM_MAX = 4;
const EMBEDDED_INITIAL_ROTATION: Rotation = {x: -45, y: 0};
const EMBEDDED_INITIAL_ZOOM = 1.28;
const BILLBOARD_ZOOM_IN_VERTICAL_OFFSET_PX = 7.5;
const BILLBOARD_ZOOM_OUT_VERTICAL_OFFSET_PX = -0.9;
const BILLBOARD_TOP_DOWN_VERTICAL_OFFSET_PX = -3;
const BILLBOARD_MID_TILT_EXTRA_DROP_PX = 3;
const WHEEL_ZOOM_SENSITIVITY = 0.0017;
const WHEEL_ZOOM_MAX_STEP = 0.09;
const BILLBOARD_WIDTH_SCALE = 1.12;
const BILLBOARD_HEIGHT_SCALE = 1.2;
const BILLBOARD_GROUND_OFFSET_PX = 4;
const BILLBOARD_ALL_PIECES_LOW_ANGLE_DROP_PX = 1.1;
const BILLBOARD_MIN_OPACITY = 0.45;
const BILLBOARD_SMOOTH_RENDER_MAX_ZOOM = 1.8;
const BILLBOARD_MANA_ITEM_LOW_ANGLE_DROP_PX = 3.5;
const BILLBOARD_HELD_ATTACHMENT_LOW_ANGLE_DROP_PX = 0.9;
const BILLBOARD_LOCKED_HELD_MANA_NUDGE_X_PX = 4;
const BILLBOARD_LOCKED_HELD_MANA_NUDGE_Y_PX = 3;
const BILLBOARD_LOCKED_HELD_BOMB_NUDGE_X_PX = 5;
const BILLBOARD_LOCKED_HELD_BOMB_NUDGE_Y_PX = 16;
const BILLBOARD_HOVER_SCALE = 1.08;
const BILLBOARD_ATTACK_TARGET_SCALE = 1.115;
const BILLBOARD_FAINTED_BLUR_PX = 0.55;
const BILLBOARD_VERTICAL_OFFSET_RECENTER_STRENGTH = 0.65;
const BILLBOARD_REFLECTION_OPACITY = 0.28;
const BILLBOARD_REFLECTION_BLUR_PX = 0.55;
const BILLBOARD_REFLECTION_HEIGHT_SCALE = 0.86;
const BILLBOARD_REFLECTION_VERTICAL_OFFSET_PX = -2;
const TOP_DOWN_RECENTER_START_DEG = 52;
const TOP_DOWN_RECENTER_END_DEG = 84;
const ITEM_STANDEE_SPARKLE_LIGHT_COLOR = '#FEFEFE';
const ITEM_STANDEE_SPARKLE_DARK_COLOR = '#000000';
const ITEM_STANDEE_SPARKLES_PER_ICON = 7;
const MONS_ASSET_PATH_FRAGMENT = '/assets/mons/';
const VIEWPORT_TOP_EXTENSION_PX = 2;
const VIEWPORT_BOTTOM_EXTENSION_PX = 8;
const PAN_MIN_VISIBLE_RATIO = 0.14;
const PAN_MIN_VISIBLE_MIN_PX = 42;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
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

function getPointDistance(left: TouchPoint, right: TouchPoint): number {
  const dx = right.x - left.x;
  const dy = right.y - left.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function parseSvgUnit(value: string | null): number | null {
  if (value === null) {
    return null;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isManaOrItemBillboardHref(href: string): boolean {
  return /\/(mana|manab|supermana|supermanasimple|bomborpotion)\.png$/.test(
    href.toLowerCase(),
  );
}

function isItemStandeePotionHref(href: string): boolean {
  return /\/bomborpotion\.png$/.test(href.toLowerCase());
}

function isNormalManaBillboardHref(href: string): boolean {
  return /\/(mana|manab)\.png$/.test(href.toLowerCase());
}

function isSuperManaBillboardHref(href: string): boolean {
  return /\/(supermana|supermanasimple)\.png$/.test(href.toLowerCase());
}

function isItemBillboardHref(href: string): boolean {
  return /\/(bomborpotion|bomb|potion)\.png$/.test(href.toLowerCase());
}

function isMonBillboardHref(href: string): boolean {
  return /\/(angel|demon|drainer|spirit|mystic)b?\.png$/.test(href.toLowerCase());
}

function isHeldAttachmentBillboardHref(href: string): boolean {
  return /\/(mana|manab|supermana|supermanasimple|bomb)\.png$/.test(
    href.toLowerCase(),
  );
}

function getSvgImageFrame(image: SVGImageElement): SvgImageFrame | null {
  const x = parseSvgUnit(image.getAttribute('x'));
  const y = parseSvgUnit(image.getAttribute('y'));
  const width = parseSvgUnit(image.getAttribute('width'));
  const height = parseSvgUnit(image.getAttribute('height'));
  if (
    x === null ||
    y === null ||
    width === null ||
    height === null ||
    width <= 0 ||
    height <= 0
  ) {
    return null;
  }
  return {
    x,
    y,
    width,
    height,
    centerX: x + width / 2,
    centerY: y + height / 2,
  };
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStringToSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
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

function getBoardSvg(boardHost: HTMLElement): SVGSVGElement | null {
  return boardHost.querySelector<SVGSVGElement>(
    'svg[aria-label="Super Metal Mons board"]',
  );
}

function areBillboardSpritesEquivalent(
  previous: BillboardSprite[],
  next: BillboardSprite[],
): boolean {
  if (previous.length !== next.length) {
    return false;
  }
  for (let index = 0; index < previous.length; index += 1) {
    const left = previous[index];
    const right = next[index];
    if (
      left.key !== right.key ||
      left.trackKey !== right.trackKey ||
      left.zIndex !== right.zIndex ||
      left.tileCol !== right.tileCol ||
      left.tileRow !== right.tileRow ||
      left.isRotatedQuarterTurn !== right.isRotatedQuarterTurn ||
      left.isHeldAttachment !== right.isHeldAttachment ||
      left.isLockedHeldAttachment !== right.isLockedHeldAttachment ||
      left.isAttackTargeted !== right.isAttackTargeted
    ) {
      return false;
    }
    if (
      Math.abs(left.leftPx - right.leftPx) > 0.01 ||
      Math.abs(left.topPx - right.topPx) > 0.01 ||
      Math.abs(left.widthPx - right.widthPx) > 0.01 ||
      Math.abs(left.heightPx - right.heightPx) > 0.01 ||
      Math.abs(
        (left.lockedHeldAnchorHeightPx ?? 0) - (right.lockedHeldAnchorHeightPx ?? 0),
      ) > 0.01 ||
      Math.abs(left.opacity - right.opacity) > 0.001
    ) {
      return false;
    }
  }
  return true;
}

function extractBillboardSprites(
  boardHost: HTMLElement,
  viewportHost: HTMLElement,
  zoomScale: number,
  rotation: Rotation,
): BillboardSprite[] {
  const svg = getBoardSvg(boardHost);
  if (svg === null) {
    return [];
  }
  const svgCtm = svg.getScreenCTM();
  if (svgCtm === null) {
    return [];
  }
  const viewportRect = viewportHost.getBoundingClientRect();
  const viewportScaleX =
    viewportHost.offsetWidth > 0 ? viewportRect.width / viewportHost.offsetWidth : 1;
  const viewportScaleY =
    viewportHost.offsetHeight > 0
      ? viewportRect.height / viewportHost.offsetHeight
      : viewportScaleX;
  const toViewportX = (screenX: number) => (screenX - viewportRect.left) / viewportScaleX;
  const toViewportY = (screenY: number) => (screenY - viewportRect.top) / viewportScaleY;
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

  Array.from(svg.querySelectorAll<SVGImageElement>('image')).forEach((image, index) => {
    if (
      image.getAttribute('data-billboard-ignore') === 'true' ||
      image.classList.contains('spawn-ghost-image')
    ) {
      return;
    }
    const href = image.getAttribute('href') ?? image.href.baseVal ?? '';
    if (!href.includes(MONS_ASSET_PATH_FRAGMENT)) {
      return;
    }
    const explicitTrackKey = image.getAttribute('data-billboard-id');
    const trackKey =
      explicitTrackKey && explicitTrackKey.trim().length > 0
        ? `id:${explicitTrackKey.trim()}`
        : `auto:${href}-${index}`;
    const isAttackTargeted = image.getAttribute('data-attack-targeted') === 'true';
    const inlineOpacity = Number.parseFloat(
      image.style.opacity || image.getAttribute('opacity') || '1',
    );
    if (Number.isFinite(inlineOpacity) && inlineOpacity <= BILLBOARD_MIN_OPACITY) {
      return;
    }
    const opacity = Number.isFinite(inlineOpacity) ? clamp(inlineOpacity, 0, 1) : 1;
    const transformAttr = image.getAttribute('transform') ?? '';
    const isRotatedQuarterTurn = /rotate\(\s*90(?:[,\s)]|$)/i.test(transformAttr);
    const frame = getSvgImageFrame(image);
    if (frame === null) {
      return;
    }

    let depthCenterUnitsX = frame.centerX;
    let depthCenterUnitsY = frame.centerY;
    let isHeldAttachment = false;
    let isLockedHeldAttachment = false;
    let lockedHeldAnchorHeightPx: number | undefined;
    if (
      frame.centerX < 0 ||
      frame.centerX > 11 ||
      frame.centerY < 0 ||
      frame.centerY > 11
    ) {
      return;
    }

    const imageCtm = image.getScreenCTM() ?? svgCtm;
    const centerPoint = new DOMPoint(frame.centerX, frame.centerY).matrixTransform(imageCtm);
    let leftPx = Number(toViewportX(centerPoint.x).toFixed(2));
    let topPx = Number(toViewportY(centerPoint.y).toFixed(2));
    let tileCol = Math.max(0, Math.min(10, Math.floor(frame.centerX)));
    let tileRow = Math.max(0, Math.min(10, Math.floor(frame.centerY)));
    const widthPxRaw =
      unscaledUnitPx === null
        ? frame.width
        : frame.width * unscaledUnitPx * BOARD_SURFACE_SCALE * zoomScale;
    const heightPxRaw =
      unscaledUnitPx === null
        ? frame.height
        : frame.height * unscaledUnitPx * BOARD_SURFACE_SCALE * zoomScale;
    let widthPx = Number(widthPxRaw.toFixed(2));
    let heightPx = Number(heightPxRaw.toFixed(2));

    if (isHeldAttachmentBillboardHref(href)) {
      const parent = image.parentElement;
      if (parent instanceof SVGGElement && unscaledUnitPx !== null) {
        const siblingImages = Array.from(parent.children).filter(
          (node): node is SVGImageElement => node instanceof SVGImageElement,
        );
        const holderImage = siblingImages.find((candidate) => {
          if (candidate === image) {
            return false;
          }
          const candidateHref =
            candidate.getAttribute('href') ?? candidate.href.baseVal ?? '';
          return isMonBillboardHref(candidateHref);
        });
        if (holderImage !== undefined) {
          const holderFrame = getSvgImageFrame(holderImage);
          if (holderFrame !== null) {
            const holderCtm = holderImage.getScreenCTM() ?? svgCtm;
            const holderCenterPoint = new DOMPoint(
              holderFrame.centerX,
              holderFrame.centerY,
            ).matrixTransform(holderCtm);
            const holderLeftPx = Number(toViewportX(holderCenterPoint.x).toFixed(2));
            const holderTopPx = Number(toViewportY(holderCenterPoint.y).toFixed(2));
            depthCenterUnitsX = holderFrame.centerX;
            depthCenterUnitsY = holderFrame.centerY;
            tileCol = Math.max(0, Math.min(10, Math.floor(depthCenterUnitsX)));
            tileRow = Math.max(0, Math.min(10, Math.floor(depthCenterUnitsY)));
            isHeldAttachment = true;
            isLockedHeldAttachment = true;
            const heldOffsetXUnits = frame.centerX - holderFrame.centerX;
            const heldOffsetYUnits = frame.centerY - holderFrame.centerY;
            const unitPx = unscaledUnitPx * BOARD_SURFACE_SCALE * zoomScale;
            const isHeldManaAttachment =
              isNormalManaBillboardHref(href) || isSuperManaBillboardHref(href);
            const holderWidthPx = holderFrame.width * unitPx;
            const holderHeightPx = holderFrame.height * unitPx;
            const nudgeScale = zoomScale / EMBEDDED_INITIAL_ZOOM;
            widthPx = Number((holderWidthPx * (frame.width / holderFrame.width)).toFixed(2));
            heightPx = Number((holderHeightPx * (frame.height / holderFrame.height)).toFixed(2));
            lockedHeldAnchorHeightPx = Number((holderFrame.height * unitPx).toFixed(2));
            leftPx = Number(
              (
                holderLeftPx +
                heldOffsetXUnits * unitPx +
                (isHeldManaAttachment
                  ? BILLBOARD_LOCKED_HELD_MANA_NUDGE_X_PX
                  : BILLBOARD_LOCKED_HELD_BOMB_NUDGE_X_PX) *
                  nudgeScale
              ).toFixed(2),
            );
            topPx = Number(
              (
                holderTopPx +
                heldOffsetYUnits * unitPx +
                (isHeldManaAttachment
                  ? BILLBOARD_LOCKED_HELD_MANA_NUDGE_Y_PX
                  : BILLBOARD_LOCKED_HELD_BOMB_NUDGE_Y_PX) *
                  nudgeScale
              ).toFixed(2),
            );
          }
        }
      }
    }

    const localX = depthCenterUnitsX - 5.5;
    const localZ = depthCenterUnitsY - 5.5;
    const rotatedZ = -localX * sinY + localZ * cosY;
    const depthSort = rotatedZ * cosX + (isHeldAttachment ? 0.0008 : 0);
    depthSprites.push({
      key: `${trackKey}-${frame.x.toFixed(3)}-${frame.y.toFixed(3)}-${frame.width.toFixed(
        3,
      )}-${frame.height.toFixed(3)}`,
      trackKey,
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
      isHeldAttachment,
      isLockedHeldAttachment,
      lockedHeldAnchorHeightPx,
      isAttackTargeted,
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
    trackKey: sprite.trackKey,
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
    isHeldAttachment: sprite.isHeldAttachment,
    isLockedHeldAttachment: sprite.isLockedHeldAttachment,
    lockedHeldAnchorHeightPx: sprite.lockedHeldAnchorHeightPx,
    isAttackTargeted: sprite.isAttackTargeted,
  }));
}

function extractBoardSurfaceClipPath(
  boardHost: HTMLElement,
  viewportHost: HTMLElement,
): string | null {
  const svg = getBoardSvg(boardHost);
  if (svg === null) {
    return null;
  }
  const svgCtm = svg.getScreenCTM();
  if (svgCtm === null) {
    return null;
  }
  const viewportRect = viewportHost.getBoundingClientRect();
  const viewportScaleX =
    viewportHost.offsetWidth > 0 ? viewportRect.width / viewportHost.offsetWidth : 1;
  const viewportScaleY =
    viewportHost.offsetHeight > 0
      ? viewportRect.height / viewportHost.offsetHeight
      : viewportScaleX;
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
    .map(
      (point) =>
        `${((point.x - viewportRect.left) / viewportScaleX).toFixed(1)}px ${((point.y - viewportRect.top) / viewportScaleY).toFixed(1)}px`,
    )
    .join(', ')})`;
}

const billboardGroundShadowBlobStyle: CSSProperties = {
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  borderRadius: '999px',
  pointerEvents: 'none',
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

const billboardAttackTargetGlowStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: '56%',
  width: '78%',
  height: '58%',
  transform: 'translate(-50%, -50%)',
  borderRadius: '999px',
  pointerEvents: 'none',
  zIndex: 0,
  background:
    'radial-gradient(ellipse at center, rgba(255, 68, 68, 0.62) 0%, rgba(255, 68, 68, 0.34) 44%, rgba(255, 68, 68, 0) 80%)',
  filter: 'blur(2.4px)',
  transition: 'opacity 140ms ease-out, transform 190ms cubic-bezier(0.22, 1, 0.36, 1)',
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

export default function ThreeDBoardSurface(props: ThreeDBoardSurfaceProps) {
  const {
    children,
    enabled,
    renderWidth,
    viewportWidth = renderWidth,
    viewportHeight,
    viewportBottomExtensionPx = 0,
    isFullscreen = false,
    boardTheme = 'light',
    hoveredTile = null,
    selectedTile = null,
    isItemPickupChoiceOpen = false,
    onHoveredTileChange,
  } = props;
  const [rotation, setRotation] = useState<Rotation>(EMBEDDED_INITIAL_ROTATION);
  const [zoomScale, setZoomScale] = useState(EMBEDDED_INITIAL_ZOOM);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [panOffset, setPanOffset] = useState({x: 0, y: 0});
  const [hoveredSpriteKey, setHoveredSpriteKey] = useState<string | null>(null);
  const [hoveredSpriteTile, setHoveredSpriteTile] = useState<Tile | null>(null);
  const [billboardSprites, setBillboardSprites] = useState<BillboardSprite[]>([]);
  const [boardSurfaceClipPath, setBoardSurfaceClipPath] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const boardHostRef = useRef<HTMLDivElement | null>(null);
  const activeTouchPointsRef = useRef<Map<number, TouchPoint>>(new Map());
  const touchGestureAnchorRef = useRef<TouchGestureAnchor | null>(null);
  const isTouchGestureActiveRef = useRef(false);
  const isDragActiveRef = useRef(false);
  const rotationRef = useRef(rotation);
  const zoomScaleRef = useRef(zoomScale);
  const itemStandeeSparklesByKeyRef = useRef<Record<string, ItemStandeeSparkleParticle[]>>(
    {},
  );

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  useEffect(() => {
    zoomScaleRef.current = zoomScale;
  }, [zoomScale]);

  useEffect(() => {
    isDragActiveRef.current = dragState !== null;
  }, [dragState]);

  useEffect(() => {
    if (!enabled || !isItemPickupChoiceOpen) {
      return;
    }
    setHoveredSpriteKey(null);
    setHoveredSpriteTile(null);
    onHoveredTileChange?.(null);
  }, [enabled, isItemPickupChoiceOpen, onHoveredTileChange]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }
    const boardHost = boardHostRef.current;
    const viewportHost = viewportRef.current;
    if (boardHost === null || viewportHost === null) {
      return;
    }
    let rafId = 0;
    let isRunning = true;
    let lastMeasureMs = 0;
    const tick = (nowMs: number) => {
      if (!isRunning) {
        return;
      }
      if (isItemPickupChoiceOpen) {
        rafId = window.requestAnimationFrame(tick);
        return;
      }
      if (lastMeasureMs !== 0 && nowMs - lastMeasureMs < 16) {
        rafId = window.requestAnimationFrame(tick);
        return;
      }
      lastMeasureMs = nowMs;
      const nextSprites = extractBillboardSprites(
        boardHost,
        viewportHost,
        zoomScaleRef.current,
        rotationRef.current,
      );
      setBillboardSprites((current) =>
        current.length > 0 && nextSprites.length === 0
          ? current
          : areBillboardSpritesEquivalent(current, nextSprites)
            ? current
            : nextSprites,
      );
      const nextClipPath = extractBoardSurfaceClipPath(boardHost, viewportHost);
      setBoardSurfaceClipPath((current) =>
        current === nextClipPath ? current : nextClipPath,
      );
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
    return () => {
      isRunning = false;
      window.cancelAnimationFrame(rafId);
    };
  }, [enabled, isItemPickupChoiceOpen]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }
    const viewport = viewportRef.current;
    if (viewport === null) {
      return;
    }
    const handleNativeWheel = (event: globalThis.WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const deltaPx = normalizeWheelDeltaPx(event.deltaY, event.deltaMode);
      if (!Number.isFinite(deltaPx) || deltaPx === 0) {
        return;
      }
      const rawZoomDelta = -deltaPx * WHEEL_ZOOM_SENSITIVITY;
      const zoomDelta = Math.min(
        WHEEL_ZOOM_MAX_STEP,
        Math.max(-WHEEL_ZOOM_MAX_STEP, rawZoomDelta),
      );
      if (zoomDelta !== 0) {
        setZoomScale((current) => clamp(current + zoomDelta, ZOOM_MIN, ZOOM_MAX));
      }
    };
    viewport.addEventListener('wheel', handleNativeWheel, {
      capture: true,
      passive: false,
    });
    return () => {
      viewport.removeEventListener('wheel', handleNativeWheel, {
        capture: true,
      });
    };
  }, [enabled]);

  if (!enabled) {
    return <>{children}</>;
  }

  const safeRenderWidth = Math.max(1, renderWidth);
  const safeViewportWidth = Math.max(safeRenderWidth, viewportWidth);
  const naturalViewportHeight =
    safeRenderWidth +
    VIEWPORT_TOP_EXTENSION_PX +
    VIEWPORT_BOTTOM_EXTENSION_PX +
    Math.max(0, viewportBottomExtensionPx);
  const safeViewportHeight = Math.max(
    naturalViewportHeight,
    viewportHeight ?? naturalViewportHeight,
  );
  const pannedBoardSizePx = safeRenderWidth * zoomScale;
  const panMinVisiblePx = Math.max(
    PAN_MIN_VISIBLE_MIN_PX,
    safeRenderWidth * PAN_MIN_VISIBLE_RATIO,
  );
  const maxPanOffsetX = Math.max(
    0,
    (safeViewportWidth + pannedBoardSizePx) / 2 - panMinVisiblePx,
  );
  const maxPanOffsetY = Math.max(
    0,
    (safeViewportHeight + pannedBoardSizePx) / 2 - panMinVisiblePx,
  );
  const clampPanOffset = (offset: {x: number; y: number}) => ({
    x: clamp(offset.x, -maxPanOffsetX, maxPanOffsetX),
    y: clamp(offset.y, -maxPanOffsetY, maxPanOffsetY),
  });
  const clampedPanOffset = clampPanOffset(panOffset);
  const prismWidth = safeRenderWidth * BOARD_SURFACE_SCALE;
  const prismDepth = prismWidth;
  const prismHeight = prismWidth * PRISM_HEIGHT_RATIO;
  const isDark = boardTheme === 'dark';
  const topDownRecenterBlend = clamp(
    (Math.abs(rotation.x) - TOP_DOWN_RECENTER_START_DEG) /
      (TOP_DOWN_RECENTER_END_DEG - TOP_DOWN_RECENTER_START_DEG),
    0,
    1,
  );
  const reflectionVisibility = Math.pow(1 - topDownRecenterBlend, 1.65);
  const boardSurfaceViewScaleY = clamp(
    Math.sin((Math.abs(rotation.x) * Math.PI) / 180),
    0.24,
    1,
  );
  const billboardTranslateYPercent = -100 + 50 * topDownRecenterBlend;
  const verticalOffsetRecenterBlend =
    topDownRecenterBlend * BILLBOARD_VERTICAL_OFFSET_RECENTER_STRENGTH;
  const billboardGroundOffsetPx = BILLBOARD_GROUND_OFFSET_PX * (1 - verticalOffsetRecenterBlend);
  const rawBillboardZoomVerticalOffsetPx =
    zoomScale >= EMBEDDED_INITIAL_ZOOM
      ? BILLBOARD_ZOOM_IN_VERTICAL_OFFSET_PX *
        clamp(
          (zoomScale - EMBEDDED_INITIAL_ZOOM) /
            Math.max(0.001, ZOOM_MAX - EMBEDDED_INITIAL_ZOOM),
          0,
          1,
        )
      : BILLBOARD_ZOOM_OUT_VERTICAL_OFFSET_PX *
        clamp(
          (EMBEDDED_INITIAL_ZOOM - zoomScale) /
            Math.max(0.001, EMBEDDED_INITIAL_ZOOM - ZOOM_MIN),
          0,
          1,
        );
  const billboardZoomVerticalOffsetPx =
    rawBillboardZoomVerticalOffsetPx * (1 - topDownRecenterBlend);
  const billboardTopDownVerticalOffsetPx =
    BILLBOARD_TOP_DOWN_VERTICAL_OFFSET_PX * topDownRecenterBlend;
  const midTiltExtraDropPx =
    BILLBOARD_MID_TILT_EXTRA_DROP_PX *
    Math.sin(
      Math.PI *
        clamp(Math.abs(rotation.x) / Math.max(1, TOP_DOWN_RECENTER_END_DEG), 0, 1),
    );
  const shouldUseSmoothBillboardRendering = zoomScale <= BILLBOARD_SMOOTH_RENDER_MAX_ZOOM;
  const boardGlossAngleDeg = clamp(18 + rotation.y * 0.32, -46, 46);
  const boardGlossCenterXPercent = clamp(50 + rotation.y * 0.58, 8, 92);
  const boardGlossCenterYPercent = clamp(47 - rotation.x * 0.74, 6, 94);
  const boardGlossSpotOpacity = isDark
    ? 0.11 + (1 - topDownRecenterBlend) * 0.06
    : 0.15 + (1 - topDownRecenterBlend) * 0.08;
  const boardGlossSweepOpacity = isDark
    ? 0.06 + (1 - topDownRecenterBlend) * 0.04
    : 0.08 + (1 - topDownRecenterBlend) * 0.05;

  const groundPieceShadows = (() => {
    const shadowSpriteByTile = new Map<string, BillboardSprite>();
    billboardSprites.forEach((sprite) => {
      if (sprite.isHeldAttachment) {
        return;
      }
      const tileKey = `${sprite.tileCol}-${sprite.tileRow}`;
      const existing = shadowSpriteByTile.get(tileKey);
      if (existing === undefined || sprite.zIndex > existing.zIndex) {
        shadowSpriteByTile.set(tileKey, sprite);
      }
    });
    const shadowHeightScale = clamp(boardSurfaceViewScaleY, 0.24, 1);
    const shadowBlurPx = 1.6 + (1 - shadowHeightScale) * 1.15;
    const baseShadowOpacity = isDark ? 0.68 : 0.6;
    return Array.from(shadowSpriteByTile.values()).map((sprite) => {
      const diameterPx = clamp(sprite.widthPx * 0.69, 15, 33);
      return {
        key: sprite.trackKey,
        leftPx: sprite.leftPx,
        topPx: sprite.topPx + (1 - shadowHeightScale) * 0.7 + midTiltExtraDropPx,
        widthPx: diameterPx,
        heightPx: diameterPx * shadowHeightScale,
        blurPx: shadowBlurPx,
        opacity: baseShadowOpacity * (1 - 0.42 * topDownRecenterBlend),
      };
    });
  })();

  const getItemStandeeSparkles = (spriteKey: string): ItemStandeeSparkleParticle[] => {
    const cached = itemStandeeSparklesByKeyRef.current[spriteKey];
    if (cached !== undefined) {
      return cached;
    }
    const particles = createItemStandeeSparkleParticles(hashStringToSeed(spriteKey));
    itemStandeeSparklesByKeyRef.current[spriteKey] = particles;
    return particles;
  };

  const triggerTileClickFromSprite = (tileCol: number, tileRow: number) => {
    const boardHost = boardHostRef.current;
    if (boardHost === null || typeof window === 'undefined') {
      return;
    }
    const svg = getBoardSvg(boardHost);
    if (svg === null) {
      return;
    }
    const targetRect = Array.from(
      svg.querySelectorAll<SVGRectElement>('rect[fill="transparent"]'),
    ).find((rect) => {
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

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') {
      activeTouchPointsRef.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
      event.currentTarget.setPointerCapture(event.pointerId);
      if (activeTouchPointsRef.current.size >= 2) {
        const points = Array.from(activeTouchPointsRef.current.values());
        const first = points[0];
        const second = points[1];
        if (first !== undefined && second !== undefined) {
          touchGestureAnchorRef.current = {
            centerX: (first.x + second.x) / 2,
            centerY: (first.y + second.y) / 2,
            distance: Math.max(1, getPointDistance(first, second)),
          };
          isTouchGestureActiveRef.current = true;
          isDragActiveRef.current = true;
        }
      }
      return;
    }
    if (event.button !== 1 && event.button !== 2) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setDragState({
      mode: event.button === 1 ? 'pan' : 'rotate',
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastY: event.clientY,
    });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') {
      if (!activeTouchPointsRef.current.has(event.pointerId)) {
        return;
      }
      activeTouchPointsRef.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
      if (activeTouchPointsRef.current.size < 2) {
        touchGestureAnchorRef.current = null;
        isTouchGestureActiveRef.current = false;
        isDragActiveRef.current = dragState !== null;
        return;
      }
      const points = Array.from(activeTouchPointsRef.current.values());
      const first = points[0];
      const second = points[1];
      if (first === undefined || second === undefined) {
        return;
      }
      const centerX = (first.x + second.x) / 2;
      const centerY = (first.y + second.y) / 2;
      const distance = Math.max(1, getPointDistance(first, second));
      const anchor = touchGestureAnchorRef.current ?? {
        centerX,
        centerY,
        distance,
      };
      const deltaX = centerX - anchor.centerX;
      const deltaY = centerY - anchor.centerY;
      const distanceRatio = clamp(
        distance / Math.max(1, anchor.distance),
        TOUCH_PINCH_SCALE_MIN_STEP,
        TOUCH_PINCH_SCALE_MAX_STEP,
      );
      if (deltaX !== 0 || deltaY !== 0) {
        setRotation((current) => ({
          x: clamp(current.x - deltaY * TOUCH_ROTATION_SENSITIVITY, -89, 0),
          y: current.y + deltaX * TOUCH_ROTATION_SENSITIVITY,
        }));
      }
      if (distanceRatio !== 1) {
        setZoomScale((current) => clamp(current * distanceRatio, ZOOM_MIN, ZOOM_MAX));
      }
      touchGestureAnchorRef.current = {centerX, centerY, distance};
      isTouchGestureActiveRef.current = true;
      isDragActiveRef.current = true;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (!dragState || event.pointerId !== dragState.pointerId) {
      return;
    }
    const deltaX = event.clientX - dragState.lastX;
    const deltaY = event.clientY - dragState.lastY;
    if (deltaX === 0 && deltaY === 0) {
      return;
    }
    if (dragState.mode === 'pan') {
      setPanOffset((current) =>
        clampPanOffset({
          x: current.x + deltaX,
          y: current.y + deltaY,
        }),
      );
      setDragState((current) =>
        current
          ? {
              ...current,
              lastX: event.clientX,
              lastY: event.clientY,
            }
          : current,
      );
      event.preventDefault();
      event.stopPropagation();
      return;
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
    event.preventDefault();
    event.stopPropagation();
  };

  const clearDragState = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') {
      activeTouchPointsRef.current.delete(event.pointerId);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      if (activeTouchPointsRef.current.size >= 2) {
        const points = Array.from(activeTouchPointsRef.current.values());
        const first = points[0];
        const second = points[1];
        if (first !== undefined && second !== undefined) {
          touchGestureAnchorRef.current = {
            centerX: (first.x + second.x) / 2,
            centerY: (first.y + second.y) / 2,
            distance: Math.max(1, getPointDistance(first, second)),
          };
        }
        isTouchGestureActiveRef.current = true;
        isDragActiveRef.current = true;
      } else {
        touchGestureAnchorRef.current = null;
        isTouchGestureActiveRef.current = false;
        isDragActiveRef.current = dragState !== null;
      }
      return;
    }
    if (!dragState || event.pointerId !== dragState.pointerId) {
      return;
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragState(null);
  };

  const viewportStyle: CSSProperties = {
    width: safeViewportWidth,
    height: safeViewportHeight,
    maxWidth: 'none',
    position: 'absolute',
    left: '50%',
    top: isFullscreen ? '50%' : -VIEWPORT_TOP_EXTENSION_PX,
    transform: isFullscreen ? 'translate(-50%, -50%)' : 'translateX(-50%)',
    overflow: isFullscreen ? 'visible' : 'hidden',
    overscrollBehavior: 'contain',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'none',
    cursor: dragState?.mode === 'pan' ? 'grabbing' : undefined,
  };

  const layoutSlotStyle: CSSProperties = {
    width: safeRenderWidth,
    height: safeRenderWidth,
    position: 'relative',
    overflow: 'visible',
  };

  const sceneFrameStyle: CSSProperties = {
    position: 'absolute',
    top: isFullscreen ? 0 : VIEWPORT_TOP_EXTENSION_PX,
    left: 0,
    right: 0,
    height: isFullscreen ? safeViewportHeight : safeRenderWidth,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    perspective: 'none',
    transform: `translate(${clampedPanOffset.x}px, ${clampedPanOffset.y}px)`,
  };

  const zoomLayerStyle: CSSProperties = {
    position: 'relative',
    transform: `scale(${zoomScale})`,
    transformOrigin: '50% 50%',
    willChange: 'transform',
  };

  const prismCoreStyle: CSSProperties = {
    position: 'relative',
    width: prismWidth,
    height: prismHeight,
    transformStyle: 'preserve-3d',
    willChange: 'transform',
    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
  };

  const faceBaseStyle: CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    boxSizing: 'border-box',
    border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.32)',
    backfaceVisibility: 'hidden',
  };

  const frontFaceStyle: CSSProperties = {
    ...faceBaseStyle,
    width: prismWidth,
    height: prismHeight,
    background: isDark
      ? 'linear-gradient(150deg, rgba(44,49,58,0.98) 0%, rgba(34,38,47,0.98) 48%, rgba(26,30,38,0.98) 100%)'
      : 'linear-gradient(150deg, rgba(245,245,245,0.98) 0%, rgba(227,227,227,0.98) 48%, rgba(214,214,214,0.98) 100%)',
    transform: `translate(-50%, -50%) translateZ(${prismDepth / 2}px)`,
    pointerEvents: 'none',
  };

  const backFaceStyle: CSSProperties = {
    ...frontFaceStyle,
    background: isDark
      ? 'linear-gradient(150deg, rgba(34,38,47,0.98) 0%, rgba(26,30,38,0.98) 55%, rgba(19,23,30,0.98) 100%)'
      : 'linear-gradient(150deg, rgba(228,228,228,0.98) 0%, rgba(209,209,209,0.98) 55%, rgba(196,196,196,0.98) 100%)',
    transform: `translate(-50%, -50%) rotateY(180deg) translateZ(${prismDepth / 2}px)`,
  };

  const rightFaceStyle: CSSProperties = {
    ...faceBaseStyle,
    width: prismDepth,
    height: prismHeight,
    background: isDark
      ? 'linear-gradient(180deg, rgba(37,42,50,0.98) 0%, rgba(24,28,35,0.98) 100%)'
      : 'linear-gradient(180deg, rgba(232,232,232,0.98) 0%, rgba(207,207,207,0.98) 100%)',
    transform: `translate(-50%, -50%) rotateY(90deg) translateZ(${prismWidth / 2}px)`,
    pointerEvents: 'none',
  };

  const leftFaceStyle: CSSProperties = {
    ...rightFaceStyle,
    background: isDark
      ? 'linear-gradient(180deg, rgba(32,36,44,0.98) 0%, rgba(22,26,33,0.98) 100%)'
      : 'linear-gradient(180deg, rgba(220,220,220,0.98) 0%, rgba(194,194,194,0.98) 100%)',
    transform: `translate(-50%, -50%) rotateY(-90deg) translateZ(${prismWidth / 2}px)`,
  };

  const topFaceStyle: CSSProperties = {
    ...faceBaseStyle,
    width: prismWidth,
    height: prismDepth,
    border: 'none',
    backgroundColor: isDark ? '#0f131b' : '#fff',
    overflow: 'hidden',
    transform: `translate(-50%, -50%) rotateX(90deg) translateZ(${prismHeight / 2}px)`,
  };

  const bottomFaceStyle: CSSProperties = {
    ...faceBaseStyle,
    width: prismWidth,
    height: prismDepth,
    background: isDark
      ? 'linear-gradient(150deg, rgba(26,30,37,0.98) 0%, rgba(17,21,27,0.98) 100%)'
      : 'linear-gradient(150deg, rgba(214,214,214,0.98) 0%, rgba(190,190,190,0.98) 100%)',
    transform: `translate(-50%, -50%) rotateX(-90deg) translateZ(${prismHeight / 2}px)`,
    pointerEvents: 'none',
  };

  const topFaceBoardHostStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
  };

  const topFaceBoardScaleWrapStyle: CSSProperties = {
    transform: `translateZ(${BOARD_SURFACE_Z_OFFSET_PX}px) scale(${BOARD_SURFACE_SCALE})`,
    transformOrigin: 'center center',
    width: safeRenderWidth,
    height: safeRenderWidth,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  };

  const baseShadowStyle: CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: prismWidth * 0.78,
    height: Math.max(18, prismHeight * 0.86),
    transform: `translate(-50%, ${prismDepth * 0.32}px)`,
    background: isDark
      ? 'radial-gradient(ellipse at center, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.28) 58%, rgba(0,0,0,0) 100%)'
      : 'radial-gradient(ellipse at center, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.11) 55%, rgba(0,0,0,0) 100%)',
    filter: 'blur(12px)',
    pointerEvents: 'none',
  };

  const boardGlossOverlayStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 2,
    mixBlendMode: 'screen',
    opacity: 1,
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
  };

  const topFaceOutlineStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    boxSizing: 'border-box',
    border: isDark ? '1px solid rgba(255,255,255,0.52)' : '1px solid rgba(0, 0, 0, 0.62)',
    pointerEvents: 'none',
    zIndex: 3,
  };

  const billboardLayerStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    overflow: 'visible',
    pointerEvents: 'none',
    zIndex: 14,
  };

  const itemChoiceVeilStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    zIndex: 24,
    pointerEvents: 'none',
    background: isDark
      ? 'rgba(0, 0, 0, 0.12)'
      : 'rgba(255, 255, 255, 0.12)',
    backdropFilter: isItemPickupChoiceOpen ? 'blur(2.3px)' : 'none',
    WebkitBackdropFilter: isItemPickupChoiceOpen ? 'blur(2.3px)' : 'none',
    opacity: isItemPickupChoiceOpen ? 1 : 0,
    transition: 'opacity 150ms ease',
  };

  const reflectionLayerStyle: CSSProperties = {
    ...billboardLayerStyle,
    zIndex: 13,
    clipPath: boardSurfaceClipPath ?? undefined,
    WebkitClipPath: boardSurfaceClipPath ?? undefined,
    opacity: boardSurfaceClipPath === null ? 0 : reflectionVisibility,
  };

  const groundShadowLayerStyle: CSSProperties = {
    ...billboardLayerStyle,
    zIndex: 12,
    clipPath: boardSurfaceClipPath ?? undefined,
    WebkitClipPath: boardSurfaceClipPath ?? undefined,
    opacity: boardSurfaceClipPath === null ? 0 : 1,
  };
  const getLockedHeldAttachmentYOffsetPx = (sprite: BillboardSprite): number => {
    if (
      !sprite.isLockedHeldAttachment ||
      sprite.lockedHeldAnchorHeightPx === undefined
    ) {
      return 0;
    }
    return (
      (billboardTranslateYPercent / 100) *
      (sprite.lockedHeldAnchorHeightPx * BILLBOARD_HEIGHT_SCALE -
        sprite.heightPx * BILLBOARD_HEIGHT_SCALE)
    );
  };

  return (
    <div style={layoutSlotStyle}>
      <div
        ref={viewportRef}
        aria-label="3D board window"
        data-three-d-board-surface
        style={viewportStyle}
        onContextMenuCapture={(event) => {
          event.preventDefault();
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={clearDragState}
        onPointerCancel={clearDragState}
        onAuxClick={(event) => {
          if (event.button === 1) {
            event.preventDefault();
          }
        }}>
      <style>{`
        [data-three-d-board-surface],
        [data-three-d-board-surface] * {
          user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        [data-three-d-board-surface] svg {
          overflow: visible;
          shape-rendering: geometricPrecision;
          image-rendering: auto;
          backface-visibility: hidden;
        }
        [data-three-d-board-surface] svg rect,
        [data-three-d-board-surface] svg path,
        [data-three-d-board-surface] svg line,
        [data-three-d-board-surface] svg polygon {
          shape-rendering: geometricPrecision;
        }
        [data-three-d-board-surface] svg image:not(.spawn-ghost-image) {
          opacity: 0 !important;
        }
        [data-three-d-board-surface] svg image.spawn-ghost-image[href*="B.png"] {
          transform-box: fill-box;
          transform-origin: center;
          transform: rotate(180deg);
        }
      `}</style>
      <div style={sceneFrameStyle}>
        <div style={zoomLayerStyle}>
          <div style={baseShadowStyle} />
          <div style={prismCoreStyle}>
            <div style={frontFaceStyle} />
            <div style={backFaceStyle} />
            <div style={rightFaceStyle} />
            <div style={leftFaceStyle} />
            <div style={topFaceStyle}>
              <div ref={boardHostRef} style={topFaceBoardHostStyle}>
                <div style={topFaceBoardScaleWrapStyle}>{children}</div>
              </div>
              <div aria-hidden="true" style={boardGlossOverlayStyle} />
              <div aria-hidden="true" style={topFaceOutlineStyle} />
            </div>
            <div style={bottomFaceStyle} />
          </div>
        </div>
      </div>

      {groundPieceShadows.length > 0 ? (
        <div aria-hidden="true" style={groundShadowLayerStyle}>
          {groundPieceShadows.map((shadow) => (
            <div
              key={`ground-shadow-${shadow.key}`}
              style={{
                ...billboardGroundShadowBlobStyle,
                left: `${shadow.leftPx}px`,
                top: `${shadow.topPx}px`,
                width: `${shadow.widthPx}px`,
                height: `${shadow.heightPx}px`,
                filter: `blur(${shadow.blurPx.toFixed(2)}px)`,
                opacity: shadow.opacity,
                background:
                  'radial-gradient(ellipse at center, rgba(98, 98, 98, 0.4) 0%, rgba(98, 98, 98, 0.24) 52%, rgba(98, 98, 98, 0) 86%)',
              }}
            />
          ))}
        </div>
      ) : null}

      <div aria-hidden="true" style={reflectionLayerStyle}>
        {billboardSprites.map((sprite) => {
          const sharedLowAngleDropPx =
            BILLBOARD_ALL_PIECES_LOW_ANGLE_DROP_PX * (1 - verticalOffsetRecenterBlend);
          const extraManaItemDropPx = sprite.isHeldAttachment
            ? sprite.isLockedHeldAttachment
              ? 0
              : BILLBOARD_HELD_ATTACHMENT_LOW_ANGLE_DROP_PX * (1 - verticalOffsetRecenterBlend)
            : isManaOrItemBillboardHref(sprite.href)
              ? BILLBOARD_MANA_ITEM_LOW_ANGLE_DROP_PX * (1 - verticalOffsetRecenterBlend)
              : 0;
          const lowAngleDropPx = sharedLowAngleDropPx + extraManaItemDropPx;
          const lockedHeldAttachmentYOffsetPx = getLockedHeldAttachmentYOffsetPx(sprite);
          const reflectionOpacity = clamp(
            sprite.opacity * BILLBOARD_REFLECTION_OPACITY * reflectionVisibility,
            0,
            0.48,
          );
          const reflectionBlurPx =
            BILLBOARD_REFLECTION_BLUR_PX + topDownRecenterBlend * 0.65;
          return (
            <div
              key={`reflection-${sprite.trackKey}`}
              style={{
                ...billboardSpritePlaneBaseStyle,
                pointerEvents: 'none',
                left: `${sprite.leftPx}px`,
                top: `${sprite.topPx}px`,
                width: `${sprite.widthPx * BILLBOARD_WIDTH_SCALE}px`,
                height: `${sprite.heightPx * BILLBOARD_HEIGHT_SCALE}px`,
                zIndex: sprite.zIndex,
                transform: `translate(-50%, calc(${billboardTranslateYPercent}% + ${billboardGroundOffsetPx + lowAngleDropPx + billboardZoomVerticalOffsetPx + billboardTopDownVerticalOffsetPx + lockedHeldAttachmentYOffsetPx + midTiltExtraDropPx}px))`,
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
        })}
      </div>

      <div aria-hidden="true" style={billboardLayerStyle}>
        {billboardSprites.map((sprite) => {
          const isHoveredSprite = hoveredSpriteKey === sprite.trackKey;
          const isSelectedSprite =
            selectedTile !== null &&
            selectedTile.row === sprite.tileRow &&
            selectedTile.col === sprite.tileCol;
          const isHoveredSpriteByTile =
            hoveredTile !== null &&
            hoveredTile.row === sprite.tileRow &&
            hoveredTile.col === sprite.tileCol;
          const isHoveredSpriteByStandeeTile =
            hoveredSpriteTile !== null &&
            hoveredSpriteTile.row === sprite.tileRow &&
            hoveredSpriteTile.col === sprite.tileCol;
          const isAttackTargeted = sprite.isAttackTargeted && !sprite.isHeldAttachment;
          const isEmphasizedSprite =
            isHoveredSprite ||
            isHoveredSpriteByTile ||
            isHoveredSpriteByStandeeTile ||
            isSelectedSprite;
          const resolvedSpriteFilter = isEmphasizedSprite
            ? billboardSpriteImageHoverGlowFilter
            : billboardSpriteImageStyle.filter ?? '';
          const finalSpriteFilter = sprite.isRotatedQuarterTurn
            ? `${resolvedSpriteFilter} blur(${BILLBOARD_FAINTED_BLUR_PX}px)`.trim()
            : resolvedSpriteFilter;
          const targetScale = isAttackTargeted ? BILLBOARD_ATTACK_TARGET_SCALE : 1;
          const emphasizedScale = isEmphasizedSprite ? BILLBOARD_HOVER_SCALE : 1;
          const effectiveSpriteScale = Math.max(targetScale, emphasizedScale);
          const isItemStandee = isItemStandeePotionHref(sprite.href);
          const itemStandeeSparkles = isItemStandee
            ? getItemStandeeSparkles(sprite.trackKey)
            : [];
          const spriteHitTargetStyle = getSpriteHitTargetStyle(sprite.href);
          const sharedLowAngleDropPx =
            BILLBOARD_ALL_PIECES_LOW_ANGLE_DROP_PX * (1 - verticalOffsetRecenterBlend);
          const extraManaItemDropPx = sprite.isHeldAttachment
            ? sprite.isLockedHeldAttachment
              ? 0
              : BILLBOARD_HELD_ATTACHMENT_LOW_ANGLE_DROP_PX * (1 - verticalOffsetRecenterBlend)
            : isManaOrItemBillboardHref(sprite.href)
              ? BILLBOARD_MANA_ITEM_LOW_ANGLE_DROP_PX * (1 - verticalOffsetRecenterBlend)
              : 0;
          const lowAngleDropPx = sharedLowAngleDropPx + extraManaItemDropPx;
          const lockedHeldAttachmentYOffsetPx = getLockedHeldAttachmentYOffsetPx(sprite);
          const updateSpriteHover = () => {
            setHoveredSpriteKey(sprite.trackKey);
            setHoveredSpriteTile({row: sprite.tileRow, col: sprite.tileCol});
            onHoveredTileChange?.({row: sprite.tileRow, col: sprite.tileCol});
          };
          const clearSpriteHover = () => {
            setHoveredSpriteKey((current) =>
              current === sprite.trackKey ? null : current,
            );
            setHoveredSpriteTile((current) =>
              current !== null &&
              current.row === sprite.tileRow &&
              current.col === sprite.tileCol
                ? null
                : current,
            );
            onHoveredTileChange?.(null);
          };
          const clickSprite = (event: PointerEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            triggerTileClickFromSprite(sprite.tileCol, sprite.tileRow);
          };

          return (
            <div
              key={sprite.trackKey}
              style={{
                ...billboardSpritePlaneBaseStyle,
                pointerEvents: 'none',
                left: `${sprite.leftPx}px`,
                top: `${sprite.topPx}px`,
                width: `${sprite.widthPx * BILLBOARD_WIDTH_SCALE}px`,
                height: `${sprite.heightPx * BILLBOARD_HEIGHT_SCALE}px`,
                zIndex: sprite.zIndex,
                transform: `translate(-50%, calc(${billboardTranslateYPercent}% + ${billboardGroundOffsetPx + lowAngleDropPx + billboardZoomVerticalOffsetPx + billboardTopDownVerticalOffsetPx + lockedHeldAttachmentYOffsetPx + midTiltExtraDropPx}px))`,
                transition: 'none',
              }}>
              <div
                style={{
                  ...billboardSpriteScaleWrapBaseStyle,
                  transform: `scale(${effectiveSpriteScale})`,
                  transition: 'transform 190ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}>
                {isAttackTargeted ? (
                  <div
                    aria-hidden="true"
                    style={{
                      ...billboardAttackTargetGlowStyle,
                      opacity: 0.9,
                      transform: `translate(-50%, -50%) scale(${effectiveSpriteScale})`,
                    }}
                  />
                ) : null}
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
                  onPointerEnter={updateSpriteHover}
                  onPointerMove={updateSpriteHover}
                  onPointerLeave={clearSpriteHover}
                  onClick={clickSprite}
                />
                {itemStandeeSparkles.length > 0 ? (
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
        })}
      </div>
      <div aria-hidden="true" style={itemChoiceVeilStyle} />
      </div>
    </div>
  );
}
