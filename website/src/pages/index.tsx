import {
  memo,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import NewTopLayout from '@site/src/components/NewTopLayout';

type Point = {
  x: number;
  y: number;
};

type HomeSpriteKey = 'bosch' | 'omom';

const BOSCH_SPRITE_SRC = '/assets/bosch-pixel.png';
const OMOM_SPRITE_SRC = '/assets/omom-pixel.png';
const WHITE_MANA_SPRITE_SRC = '/assets/mons/mana.png';
const BLACK_MANA_SPRITE_SRC = '/assets/mons/manaB.png';
const HOME_SPRITE_RETRY_COUNT = 1;
const loadedHomeSpriteSrcSet = new Set<string>();

const homeWelcomeLayerStyle = {
  position: 'fixed' as const,
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 3,
  width: 'min(92vw, 640px)',
  display: 'flex',
  justifyContent: 'center',
  pointerEvents: 'none' as const,
};

const homeWelcomeBoxStyle = {
  backgroundColor: '#fff',
  color: '#000',
  border: '1px solid #000',
  borderRadius: 0,
  padding: '20px',
  maxWidth: '100%',
  textAlign: 'center' as const,
  fontSize: '0.86rem',
  lineHeight: 1.25,
};

const homeSpriteLayerStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
};

const spriteStackBaseStyle: CSSProperties = {
  position: 'absolute',
  display: 'inline-flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'flex-end',
  transform: 'translate(-50%, -50%)',
  gap: 0,
};

const boschStackStyle: CSSProperties = {
  ...spriteStackBaseStyle,
  width: '105px',
};

const omomStackStyle: CSSProperties = {
  ...spriteStackBaseStyle,
  width: '68px',
};

const homePixelImageStyle = {
  display: 'block',
  width: '100%',
  height: 'auto',
  imageRendering: 'pixelated' as const,
};

const spriteShadowStyle = {
  width: '100%',
  height: '12px',
  marginTop: '-2px',
  borderRadius: '9999px',
  background:
    'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.28) 0%, rgba(0, 0, 0, 0.18) 44%, rgba(0, 0, 0, 0.06) 74%, rgba(0, 0, 0, 0) 100%)',
  filter: 'blur(1.5px)',
};

const boschShadowStyle = {
  ...spriteShadowStyle,
  width: '66%',
  height: '16px',
  marginTop: '-7px',
  marginLeft: '1px',
};

const omomShadowStyle = {
  ...spriteShadowStyle,
  width: '96%',
  height: '14px',
  marginTop: '-6px',
  marginLeft: '1px',
};

const DEFAULT_VIEWPORT_WIDTH = 1280;
const DEFAULT_VIEWPORT_HEIGHT = 720;
const BOSCH_SPEED_PX_PER_SECOND = 260;
const SPRITE_BOUNCE_DURATION_MS = 420;
const FOLLOW_DISTANCE_SCALE = 0.84;
const BOSCH_STACK_WIDTH = 105;
const OMOM_STACK_WIDTH = 68;
const HOME_MANA_STACK_WIDTH = 70;
const SPRITE_GAP_PX = 20;
const SPRITE_ROW_VERTICAL_SHIFT_PX = -10;
const OMOM_VERTICAL_OFFSET_PX = 20;
const SPRITE_TARGET_PADDING_X = 90;
const SPRITE_TARGET_PADDING_Y = 90;
const MAX_TRAIL_DISTANCE_PX = 2200;
const TARGET_DOT_FADE_DISTANCE_PX = 220;
const MOBILE_WELCOME_GUARD_BREAKPOINT_PX = 780;
const HOME_WELCOME_TOP_CLEARANCE_PX = 18;
const DEFAULT_WELCOME_BOX_HEIGHT_PX = 92;
const HOME_MANA_MAX_COUNT = 11;
const HOME_MANA_SPAWN_MIN_MS = 3000;
const HOME_MANA_SPAWN_MAX_MS = 7000;
const HOME_MANA_PICKUP_RADIUS_PX = 58;
const HOME_MANA_SPAWN_AVOID_RADIUS_PX = 86;
const HOME_MANA_EDGE_PADDING_PX = 72;
const HOME_MANA_BURST_MS = 620;
const HOME_MANA_BURST_SIZE_PX = 92;
const HOME_MANA_FADE_MS = 320;
const HOME_BLACK_MANA_CHANCE = 0.34;
const HOME_COLLECTED_MANA_TRAIL_START_PX = 78;
const HOME_COLLECTED_MANA_TRAIL_SPACING_PX = 46;
const HOME_TRAIL_RETENTION_HEADROOM_MANA_COUNT = HOME_MANA_MAX_COUNT + 4;
const HOME_TRAIL_RETENTION_PADDING_PX = 520;

const targetDotStyle: CSSProperties = {
  position: 'absolute',
  width: '30px',
  height: '30px',
  borderRadius: '9999px',
  transform: 'translate(-50%, -50%)',
  background:
    'radial-gradient(circle, rgba(245, 252, 255, 0.95) 0%, rgba(190, 227, 255, 0.78) 36%, rgba(128, 188, 255, 0.42) 62%, rgba(128, 188, 255, 0) 78%)',
  boxShadow:
    '0 0 14px rgba(146, 204, 255, 0.72), 0 0 28px rgba(146, 204, 255, 0.36)',
  filter: 'blur(0.3px)',
  pointerEvents: 'none',
};

const manaStackStyle: CSSProperties = {
  ...spriteStackBaseStyle,
  width: `${HOME_MANA_STACK_WIDTH}px`,
  opacity: 0,
  transition: `opacity ${HOME_MANA_FADE_MS}ms ease-out`,
  willChange: 'opacity, transform',
};

const manaShadowStyle: CSSProperties = {
  ...spriteShadowStyle,
  width: '60%',
  height: '10px',
  marginTop: '-5px',
  marginLeft: '1px',
  opacity: 0.76,
};

const homeManaBurstLayerStyle: CSSProperties = {
  position: 'absolute',
  width: `${HOME_MANA_BURST_SIZE_PX}px`,
  height: `${HOME_MANA_BURST_SIZE_PX}px`,
  transform: 'translate(-50%, -50%)',
  pointerEvents: 'none',
};

const homeManaBurstCoreStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  width: '20px',
  height: '20px',
  marginLeft: '-10px',
  marginTop: '-10px',
  borderRadius: '9999px',
  backgroundColor: '#8CB4FF',
  transform: 'scale(1)',
  opacity: 0.86,
  transition: `transform ${HOME_MANA_BURST_MS}ms cubic-bezier(0.2, 0.9, 0.25, 1), opacity ${HOME_MANA_BURST_MS}ms ease-out`,
};

const homeManaBurstRingStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  width: '28px',
  height: '28px',
  marginLeft: '-14px',
  marginTop: '-14px',
  borderRadius: '9999px',
  border: '4px solid #DDEAFF',
  transform: 'scale(1)',
  opacity: 1,
  transition: `transform ${HOME_MANA_BURST_MS}ms cubic-bezier(0.2, 0.9, 0.25, 1), opacity ${HOME_MANA_BURST_MS}ms ease-out`,
};

const homeManaAnimationStyle = `
@keyframes homeManaFloat {
  0%, 100% { transform: translateY(2px); }
  50% { transform: translateY(-8px); }
}

@keyframes homeManaShadowPulse {
  0%, 100% {
    transform: scaleX(1.08);
    opacity: 0.76;
  }
  50% {
    transform: scaleX(0.78);
    opacity: 0.46;
  }
}

.home-mana-float-core {
  display: block;
  width: 100%;
  animation-name: homeManaFloat;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  will-change: transform;
}

.home-mana-float-shadow {
  animation-name: homeManaShadowPulse;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  transform-origin: center;
  will-change: transform, opacity;
}
`;

type PathData = {
  points: Point[];
  cumulative: number[];
  totalLength: number;
};

type TrailPoint = Point & {distance: number};

type HomeManaKind = 'black' | 'white';
type HomeManaStatus = 'entering' | 'active' | 'leaving';

type HomeManaSprite = Point & {
  id: string;
  kind: HomeManaKind;
  status: HomeManaStatus;
  floatDurationMs: number;
  floatDelayMs: number;
};

type HomeManaBurst = Point & {
  id: string;
  isExpanding: boolean;
};

type HomeCollectedManaSprite = Point & {
  id: string;
  kind: HomeManaKind;
  floatDurationMs: number;
  floatDelayMs: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function distanceBetween(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.hypot(dx, dy);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function getWelcomeTopPx(
  viewportWidth: number,
  viewportHeight: number,
  headerHeight: number,
  welcomeBoxHeight: number,
): number {
  const baseTop = viewportHeight * 0.4 - 90;
  const resolvedWelcomeBoxHeight =
    welcomeBoxHeight > 0 ? welcomeBoxHeight : DEFAULT_WELCOME_BOX_HEIGHT_PX;
  const minTop = headerHeight + HOME_WELCOME_TOP_CLEARANCE_PX + resolvedWelcomeBoxHeight / 2;
  if (viewportWidth > MOBILE_WELCOME_GUARD_BREAKPOINT_PX) {
    return Math.max(baseTop, minTop);
  }
  return Math.max(baseTop, minTop);
}

function getCurrentHeaderHeight(): number {
  if (typeof window === 'undefined') {
    return 0;
  }
  const headerNode = document.querySelector('header');
  if (!(headerNode instanceof HTMLElement)) {
    return 0;
  }
  return Math.round(headerNode.getBoundingClientRect().height);
}

function createInitialPositions(viewportWidth: number, viewportHeight: number): {
  bosch: Point;
  omom: Point;
} {
  const rowWidth = BOSCH_STACK_WIDTH + SPRITE_GAP_PX + OMOM_STACK_WIDTH;
  const rowLeft = viewportWidth * 0.5 - rowWidth * 0.5;
  const baseY = viewportHeight * 0.5 + SPRITE_ROW_VERTICAL_SHIFT_PX;
  return {
    bosch: {
      x: rowLeft + BOSCH_STACK_WIDTH * 0.5,
      y: baseY,
    },
    omom: {
      x: rowLeft + BOSCH_STACK_WIDTH + SPRITE_GAP_PX + OMOM_STACK_WIDTH * 0.5,
      y: baseY + OMOM_VERTICAL_OFFSET_PX,
    },
  };
}

function clampToViewport(point: Point, viewportWidth: number, viewportHeight: number): Point {
  return {
    x: clamp(point.x, SPRITE_TARGET_PADDING_X, viewportWidth - SPRITE_TARGET_PADDING_X),
    y: clamp(point.y, SPRITE_TARGET_PADDING_Y, viewportHeight - SPRITE_TARGET_PADDING_Y),
  };
}

function createRandomPath(
  start: Point,
  target: Point,
  viewportWidth: number,
  viewportHeight: number,
): Point[] {
  const totalDistance = distanceBetween(start, target);
  if (totalDistance < 6) {
    return [start, target];
  }

  const direction = {
    x: (target.x - start.x) / totalDistance,
    y: (target.y - start.y) / totalDistance,
  };
  const perpendicular = {
    x: -direction.y,
    y: direction.x,
  };

  const waypointCount = clamp(Math.round(totalDistance / 360), 0, 2);
  const sideJitterMagnitude = Math.min(52, totalDistance * 0.08);
  const forwardJitterMagnitude = Math.min(18, totalDistance * 0.03);
  const points: Point[] = [start];

  for (let i = 1; i <= waypointCount; i += 1) {
    const t = i / (waypointCount + 1);
    const basePoint = {
      x: lerp(start.x, target.x, t),
      y: lerp(start.y, target.y, t),
    };
    const sideJitter = (Math.random() * 2 - 1) * sideJitterMagnitude;
    const forwardJitter = (Math.random() * 2 - 1) * forwardJitterMagnitude;
    points.push(
      clampToViewport(
        {
          x:
            basePoint.x +
            perpendicular.x * sideJitter +
            direction.x * forwardJitter,
          y:
            basePoint.y +
            perpendicular.y * sideJitter +
            direction.y * forwardJitter,
        },
        viewportWidth,
        viewportHeight,
      ),
    );
  }

  points.push(target);
  return points;
}

function buildPathData(points: Point[]): PathData {
  const cumulative: number[] = [0];
  for (let i = 1; i < points.length; i += 1) {
    const segmentLength = distanceBetween(points[i - 1], points[i]);
    cumulative.push(cumulative[cumulative.length - 1] + segmentLength);
  }
  return {
    points,
    cumulative,
    totalLength: cumulative[cumulative.length - 1] ?? 0,
  };
}

function pointAtPathDistance(path: PathData, distance: number): Point {
  const {points, cumulative, totalLength} = path;
  if (points.length === 0) {
    return {x: 0, y: 0};
  }
  if (distance <= 0) {
    return points[0];
  }
  if (distance >= totalLength) {
    return points[points.length - 1];
  }
  for (let i = 1; i < cumulative.length; i += 1) {
    const segmentEnd = cumulative[i];
    if (distance <= segmentEnd) {
      const segmentStart = cumulative[i - 1];
      const segmentLength = segmentEnd - segmentStart;
      const t = segmentLength <= 0 ? 0 : (distance - segmentStart) / segmentLength;
      return {
        x: lerp(points[i - 1].x, points[i].x, t),
        y: lerp(points[i - 1].y, points[i].y, t),
      };
    }
  }
  return points[points.length - 1];
}

function pointAtTrailDistance(trail: TrailPoint[], distance: number): Point {
  if (trail.length === 0) {
    return {x: 0, y: 0};
  }
  if (distance <= trail[0].distance) {
    return {x: trail[0].x, y: trail[0].y};
  }
  const trailEnd = trail[trail.length - 1];
  if (distance >= trailEnd.distance) {
    return {x: trailEnd.x, y: trailEnd.y};
  }
  for (let i = 1; i < trail.length; i += 1) {
    const current = trail[i];
    if (distance <= current.distance) {
      const previous = trail[i - 1];
      const segmentLength = current.distance - previous.distance;
      const t =
        segmentLength <= 0 ? 0 : (distance - previous.distance) / segmentLength;
      return {
        x: lerp(previous.x, current.x, t),
        y: lerp(previous.y, current.y, t),
      };
    }
  }
  return {x: trailEnd.x, y: trailEnd.y};
}

function getHomeTrailRetentionDistancePx(
  collectedManaCount: number,
  followDistancePx: number,
): number {
  const furthestTailOffsetPx =
    followDistancePx +
    HOME_COLLECTED_MANA_TRAIL_START_PX +
    Math.max(0, collectedManaCount - 1) * HOME_COLLECTED_MANA_TRAIL_SPACING_PX;
  return Math.max(
    MAX_TRAIL_DISTANCE_PX,
    furthestTailOffsetPx + HOME_TRAIL_RETENTION_PADDING_PX,
  );
}

function appendTrailPoint(
  trail: TrailPoint[],
  point: Point,
  maxTrailDistancePx = MAX_TRAIL_DISTANCE_PX,
): void {
  if (trail.length === 0) {
    trail.push({...point, distance: 0});
    return;
  }
  const previous = trail[trail.length - 1];
  const segmentLength = distanceBetween(previous, point);
  if (segmentLength < 0.35) {
    return;
  }
  trail.push({
    ...point,
    distance: previous.distance + segmentLength,
  });

  const newest = trail[trail.length - 1];
  const minAllowedDistance = newest.distance - maxTrailDistancePx;
  while (trail.length > 2 && trail[1].distance < minAllowedDistance) {
    trail.shift();
  }
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutQuad(t: number): number {
  if (t < 0.5) {
    return 2 * t * t;
  }
  return 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function getBounceScale(elapsedMs: number): number {
  const progress = clamp(elapsedMs / SPRITE_BOUNCE_DURATION_MS, 0, 1);
  if (progress <= 0.36) {
    return lerp(1, 1.08, easeOutCubic(progress / 0.36));
  }
  if (progress <= 0.72) {
    return lerp(1.08, 0.96, easeInOutQuad((progress - 0.36) / 0.36));
  }
  return lerp(0.96, 1, easeOutCubic((progress - 0.72) / 0.28));
}

function getRandomHomeManaSpawnDelayMs(): number {
  return Math.round(
    HOME_MANA_SPAWN_MIN_MS +
      Math.random() * (HOME_MANA_SPAWN_MAX_MS - HOME_MANA_SPAWN_MIN_MS),
  );
}

function getRandomHomeManaKind(): HomeManaKind {
  return Math.random() < HOME_BLACK_MANA_CHANCE ? 'black' : 'white';
}

function getHomeManaSpriteSrc(kind: HomeManaKind): string {
  return kind === 'black' ? BLACK_MANA_SPRITE_SRC : WHITE_MANA_SPRITE_SRC;
}

function getCollectedManaTransform(point: Point): string {
  return `translate(${point.x}px, ${point.y}px) translate(-50%, -50%)`;
}

function applyCollectedManaElementPosition(
  node: HTMLDivElement,
  sprite: HomeCollectedManaSprite,
): void {
  node.style.transform = getCollectedManaTransform(sprite);
  node.style.zIndex = `${Math.round(sprite.y) - 2}`;
}

function isPointInsideRectWithPadding(
  point: Point,
  rect: DOMRect,
  padding: number,
): boolean {
  return (
    point.x >= rect.left - padding &&
    point.x <= rect.right + padding &&
    point.y >= rect.top - padding &&
    point.y <= rect.bottom + padding
  );
}

type HomeCollectedManaTrailProps = {
  currentSpritesRef: MutableRefObject<HomeCollectedManaSprite[]>;
  elementRefs: MutableRefObject<Record<string, HTMLDivElement | null>>;
  sprites: HomeCollectedManaSprite[];
};

const HomeCollectedManaTrail = memo(function HomeCollectedManaTrail({
  currentSpritesRef,
  elementRefs,
  sprites,
}: HomeCollectedManaTrailProps): ReactNode {
  return (
    <>
      {sprites.map((sprite) => {
        const floatAnimationStyle: CSSProperties = {
          animationDuration: `${sprite.floatDurationMs}ms`,
          animationDelay: `${sprite.floatDelayMs}ms`,
        };
        return (
          <div
            key={sprite.id}
            ref={(node) => {
              elementRefs.current[sprite.id] = node;
              if (node !== null) {
                const latestSprite =
                  currentSpritesRef.current.find(
                    (currentSprite) => currentSprite.id === sprite.id,
                  ) ?? sprite;
                applyCollectedManaElementPosition(node, latestSprite);
              }
            }}
            style={{
              ...manaStackStyle,
              left: 0,
              top: 0,
              opacity: 1,
              transform: getCollectedManaTransform(sprite),
              zIndex: Math.round(sprite.y) - 2,
            }}>
            <span
              className="home-mana-float-core"
              aria-hidden="true"
              style={floatAnimationStyle}>
              <img
                src={getHomeManaSpriteSrc(sprite.kind)}
                alt=""
                aria-hidden="true"
                style={homePixelImageStyle}
                loading="eager"
                decoding="async"
                draggable={false}
              />
            </span>
            <span
              aria-hidden="true"
              className="home-mana-float-shadow"
              style={{
                ...manaShadowStyle,
                ...floatAnimationStyle,
              }}
            />
          </div>
        );
      })}
    </>
  );
});

type HomeExperienceProps = {
  welcomeContent?: ReactNode;
};

const defaultHomeWelcomeContent = (
  <>
    Welcome to <strong>Mons Academy</strong>, this realm's #1 learning hub for
    all things <strong>Super Metal Mons</strong>!
  </>
);

export function HomeExperience({
  welcomeContent = defaultHomeWelcomeContent,
}: HomeExperienceProps): ReactNode {
  const initialPositions = createInitialPositions(
    typeof window === 'undefined' ? DEFAULT_VIEWPORT_WIDTH : window.innerWidth,
    typeof window === 'undefined' ? DEFAULT_VIEWPORT_HEIGHT : window.innerHeight,
  );
  const [boschPosition, setBoschPosition] = useState<Point>(initialPositions.bosch);
  const [omomPosition, setOmomPosition] = useState<Point>(initialPositions.omom);
  const [boschScale, setBoschScale] = useState(1);
  const [omomScale, setOmomScale] = useState(1);
  const [targetDotPosition, setTargetDotPosition] = useState<Point | null>(null);
  const [targetDotOpacity, setTargetDotOpacity] = useState(0);
  const [homeManaSprites, setHomeManaSprites] = useState<HomeManaSprite[]>([]);
  const [collectedHomeManaSprites, setCollectedHomeManaSprites] = useState<
    HomeCollectedManaSprite[]
  >([]);
  const [homeManaBursts, setHomeManaBursts] = useState<HomeManaBurst[]>([]);
  const [homeWelcomeBoxHeight, setHomeWelcomeBoxHeight] = useState<number>(
    DEFAULT_WELCOME_BOX_HEIGHT_PX,
  );
  const [homeSpriteLoadedByKey, setHomeSpriteLoadedByKey] = useState<
    Record<HomeSpriteKey, boolean>
  >(() => ({
    bosch: loadedHomeSpriteSrcSet.has(BOSCH_SPRITE_SRC),
    omom: loadedHomeSpriteSrcSet.has(OMOM_SPRITE_SRC),
  }));
  const [homeWelcomeTopPx, setHomeWelcomeTopPx] = useState<number>(() =>
    getWelcomeTopPx(
      typeof window === 'undefined' ? DEFAULT_VIEWPORT_WIDTH : window.innerWidth,
      typeof window === 'undefined' ? DEFAULT_VIEWPORT_HEIGHT : window.innerHeight,
      typeof window === 'undefined' ? 56 : getCurrentHeaderHeight(),
      DEFAULT_WELCOME_BOX_HEIGHT_PX,
    ),
  );
  const areHomeSpritesReady =
    homeSpriteLoadedByKey.bosch && homeSpriteLoadedByKey.omom;

  const boschPositionRef = useRef<Point>(initialPositions.bosch);
  const omomPositionRef = useRef<Point>(initialPositions.omom);
  const homeWelcomeBoxRef = useRef<HTMLDivElement | null>(null);
  const boschImageRef = useRef<HTMLImageElement | null>(null);
  const omomImageRef = useRef<HTMLImageElement | null>(null);
  const boschScaleRef = useRef(1);
  const omomScaleRef = useRef(1);
  const followDistanceRef = useRef<number>(
    distanceBetween(initialPositions.bosch, initialPositions.omom) * FOLLOW_DISTANCE_SCALE,
  );
  const targetDotOpacityRef = useRef(0);
  const trailRef = useRef<TrailPoint[]>([
    {...initialPositions.omom, distance: 0},
    {
      ...initialPositions.bosch,
      distance:
        distanceBetween(initialPositions.bosch, initialPositions.omom) *
        FOLLOW_DISTANCE_SCALE,
    },
  ]);
  const activePathRef = useRef<PathData | null>(null);
  const activePathDistanceRef = useRef(0);
  const isMovingRef = useRef(false);
  const activeGuidePointerIdRef = useRef<number | null>(null);
  const lastGuideTargetRef = useRef<Point | null>(null);
  const bounceStartedAtRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimestampRef = useRef<number | null>(null);
  const homeManaSpritesRef = useRef<HomeManaSprite[]>([]);
  const collectedHomeManaSpritesRef = useRef<HomeCollectedManaSprite[]>([]);
  const collectedHomeManaElementRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const homeManaIdCounterRef = useRef(0);
  const collectedHomeManaIdCounterRef = useRef(0);
  const homeManaBurstIdCounterRef = useRef(0);
  const homeManaSpawnTimerRef = useRef<number | null>(null);
  const homeManaBurstFrameByIdRef = useRef<Record<string, number>>({});
  const homeManaBurstTimeoutByIdRef = useRef<Record<string, number>>({});
  const homeManaFadeFrameByIdRef = useRef<Record<string, number>>({});
  const homeManaFadeTimeoutByIdRef = useRef<Record<string, number>>({});

  const setHomeManaSpritesSynced = (sprites: HomeManaSprite[]): void => {
    homeManaSpritesRef.current = sprites;
    setHomeManaSprites(sprites);
  };

  const setCollectedHomeManaSpritesSynced = (
    sprites: HomeCollectedManaSprite[],
  ): void => {
    collectedHomeManaSpritesRef.current = sprites;
    setCollectedHomeManaSprites(sprites);
  };

  const getHomeTrailRetentionDistance = (): number =>
    getHomeTrailRetentionDistancePx(
      collectedHomeManaSpritesRef.current.length +
        HOME_TRAIL_RETENTION_HEADROOM_MANA_COUNT,
      followDistanceRef.current,
    );

  const clearHomeManaBurstTimerForId = (burstId: string): void => {
    const frameId = homeManaBurstFrameByIdRef.current[burstId];
    if (frameId !== undefined) {
      window.cancelAnimationFrame(frameId);
      delete homeManaBurstFrameByIdRef.current[burstId];
    }
    const timeoutId = homeManaBurstTimeoutByIdRef.current[burstId];
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
      delete homeManaBurstTimeoutByIdRef.current[burstId];
    }
  };

  const clearHomeManaFadeTimerForId = (manaId: string): void => {
    const frameId = homeManaFadeFrameByIdRef.current[manaId];
    if (frameId !== undefined) {
      window.cancelAnimationFrame(frameId);
      delete homeManaFadeFrameByIdRef.current[manaId];
    }
    const timeoutId = homeManaFadeTimeoutByIdRef.current[manaId];
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
      delete homeManaFadeTimeoutByIdRef.current[manaId];
    }
  };

  const triggerHomeManaPickupBurst = (point: Point): void => {
    if (typeof window === 'undefined') {
      return;
    }
    homeManaBurstIdCounterRef.current += 1;
    const burstId = `home-mana-burst-${homeManaBurstIdCounterRef.current}`;
    setHomeManaBursts((current) => [
      ...current,
      {
        id: burstId,
        x: point.x,
        y: point.y,
        isExpanding: false,
      },
    ]);
    homeManaBurstFrameByIdRef.current[burstId] = window.requestAnimationFrame(() => {
      setHomeManaBursts((current) =>
        current.map((burst) =>
          burst.id === burstId ? {...burst, isExpanding: true} : burst,
        ),
      );
      delete homeManaBurstFrameByIdRef.current[burstId];
    });
    homeManaBurstTimeoutByIdRef.current[burstId] = window.setTimeout(() => {
      setHomeManaBursts((current) =>
        current.filter((burst) => burst.id !== burstId),
      );
      clearHomeManaBurstTimerForId(burstId);
    }, HOME_MANA_BURST_MS + 90);
  };

  const getCollectedManaTrailPosition = (index: number): Point => {
    const trail = trailRef.current;
    if (trail.length === 0) {
      return omomPositionRef.current;
    }
    const trailStart = trail[0];
    const trailEndDistance = trail[trail.length - 1]?.distance ?? trailStart.distance;
    const targetDistance =
      trailEndDistance -
      followDistanceRef.current -
      HOME_COLLECTED_MANA_TRAIL_START_PX -
      index * HOME_COLLECTED_MANA_TRAIL_SPACING_PX;
    if (targetDistance > trailStart.distance || trail.length < 2) {
      return pointAtTrailDistance(trail, targetDistance);
    }

    const nextTrailPoint = trail[1];
    const directionLength = Math.max(
      0.0001,
      distanceBetween(trailStart, nextTrailPoint),
    );
    const distanceBehindStart =
      trailStart.distance -
      targetDistance +
      HOME_COLLECTED_MANA_TRAIL_START_PX * 0.45;
    return clampToViewport(
      {
        x: trailStart.x - ((nextTrailPoint.x - trailStart.x) / directionLength) * distanceBehindStart,
        y: trailStart.y - ((nextTrailPoint.y - trailStart.y) / directionLength) * distanceBehindStart,
      },
      window.innerWidth,
      window.innerHeight,
    );
  };

  const updateCollectedManaTrailPositions = (): void => {
    const currentSprites = collectedHomeManaSpritesRef.current;
    if (currentSprites.length === 0) {
      return;
    }
    const nextSprites = currentSprites.map((sprite, index) => ({
      ...sprite,
      ...getCollectedManaTrailPosition(index),
    }));
    collectedHomeManaSpritesRef.current = nextSprites;
    nextSprites.forEach((sprite) => {
      const node = collectedHomeManaElementRefs.current[sprite.id];
      if (node !== undefined && node !== null) {
        applyCollectedManaElementPosition(node, sprite);
      }
    });
  };

  const recalculateCollectedManaTrailState = (
    sprites: HomeCollectedManaSprite[],
  ): HomeCollectedManaSprite[] =>
    sprites.map((sprite, index) => ({
      ...sprite,
      ...getCollectedManaTrailPosition(index),
    }));

  const createHomeManaSpawnPoint = (): Point => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const headerHeight = getCurrentHeaderHeight();
    const minX = Math.min(HOME_MANA_EDGE_PADDING_PX, viewportWidth * 0.5);
    const maxX = Math.max(minX, viewportWidth - HOME_MANA_EDGE_PADDING_PX);
    const minY = Math.min(
      Math.max(
        HOME_MANA_EDGE_PADDING_PX,
        headerHeight + HOME_MANA_STACK_WIDTH * 0.5 + 14,
      ),
      viewportHeight * 0.5,
    );
    const maxY = Math.max(minY, viewportHeight - HOME_MANA_EDGE_PADDING_PX);
    const welcomeRect =
      homeWelcomeBoxRef.current instanceof HTMLElement
        ? homeWelcomeBoxRef.current.getBoundingClientRect()
        : null;
    let fallbackPoint: Point = {x: (minX + maxX) / 2, y: (minY + maxY) / 2};

    for (let attempt = 0; attempt < 40; attempt += 1) {
      const candidate = {
        x: minX + Math.random() * (maxX - minX),
        y: minY + Math.random() * (maxY - minY),
      };
      fallbackPoint = candidate;
      if (
        welcomeRect !== null &&
        isPointInsideRectWithPadding(candidate, welcomeRect, HOME_MANA_STACK_WIDTH)
      ) {
        continue;
      }
      if (
        distanceBetween(candidate, boschPositionRef.current) <
          HOME_MANA_SPAWN_AVOID_RADIUS_PX ||
        distanceBetween(candidate, omomPositionRef.current) <
          HOME_MANA_SPAWN_AVOID_RADIUS_PX * 0.72
      ) {
        continue;
      }
      if (
        homeManaSpritesRef.current.some(
          (sprite) => distanceBetween(candidate, sprite) < HOME_MANA_STACK_WIDTH * 0.95,
        )
      ) {
        continue;
      }
      return candidate;
    }

    return fallbackPoint;
  };

  const spawnHomeMana = (): boolean => {
    if (
      typeof window === 'undefined' ||
      homeManaSpritesRef.current.length >= HOME_MANA_MAX_COUNT
    ) {
      return false;
    }
    homeManaIdCounterRef.current += 1;
    const floatDurationMs = Math.round(2600 + Math.random() * 1300);
    const nextMana = {
      id: `home-mana-${homeManaIdCounterRef.current}`,
      kind: getRandomHomeManaKind(),
      status: 'entering' as const,
      floatDurationMs,
      floatDelayMs: -Math.round(Math.random() * floatDurationMs),
      ...createHomeManaSpawnPoint(),
    };
    const nextSprites = [...homeManaSpritesRef.current, nextMana];
    setHomeManaSpritesSynced(nextSprites);
    homeManaFadeFrameByIdRef.current[nextMana.id] = window.requestAnimationFrame(() => {
      setHomeManaSpritesSynced(
        homeManaSpritesRef.current.map((sprite) =>
          sprite.id === nextMana.id && sprite.status === 'entering'
            ? {...sprite, status: 'active'}
            : sprite,
        ),
      );
      delete homeManaFadeFrameByIdRef.current[nextMana.id];
    });
    return true;
  };

  const collectTouchedHomeMana = (boschPoint: Point): void => {
    const currentManaSprites = homeManaSpritesRef.current;
    if (currentManaSprites.length === 0) {
      return;
    }

    const collectedManaSprites = currentManaSprites.filter(
      (sprite) =>
        sprite.status !== 'leaving' &&
        distanceBetween(sprite, boschPoint) <= HOME_MANA_PICKUP_RADIUS_PX,
    );
    if (collectedManaSprites.length === 0) {
      return;
    }

    const collectedManaIdSet = new Set(
      collectedManaSprites.map((sprite) => sprite.id),
    );
    setHomeManaSpritesSynced(
      currentManaSprites.map((sprite) =>
        collectedManaIdSet.has(sprite.id) ? {...sprite, status: 'leaving'} : sprite,
      ),
    );
    const newlyCollectedManaSprites = collectedManaSprites.map((sprite, index) => {
      collectedHomeManaIdCounterRef.current += 1;
      const floatDurationMs = Math.round(2400 + Math.random() * 1200);
      return {
        id: `home-collected-mana-${collectedHomeManaIdCounterRef.current}`,
        kind: sprite.kind,
        floatDurationMs,
        floatDelayMs: -Math.round(Math.random() * floatDurationMs),
        ...getCollectedManaTrailPosition(index),
      };
    });
    setCollectedHomeManaSpritesSynced(
      recalculateCollectedManaTrailState([
        ...collectedHomeManaSpritesRef.current,
        ...newlyCollectedManaSprites,
      ]),
    );
    collectedManaSprites.forEach((sprite) => {
      clearHomeManaFadeTimerForId(sprite.id);
      triggerHomeManaPickupBurst(sprite);
      homeManaFadeTimeoutByIdRef.current[sprite.id] = window.setTimeout(() => {
        setHomeManaSpritesSynced(
          homeManaSpritesRef.current.filter((currentSprite) => currentSprite.id !== sprite.id),
        );
        clearHomeManaFadeTimerForId(sprite.id);
      }, HOME_MANA_FADE_MS + 80);
    });
  };

  const markHomeSpriteLoaded = (key: HomeSpriteKey, src: string): void => {
    loadedHomeSpriteSrcSet.add(src);
    setHomeSpriteLoadedByKey((current) =>
      current[key] ? current : {...current, [key]: true},
    );
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const scheduleNextHomeManaSpawn = (): void => {
      homeManaSpawnTimerRef.current = window.setTimeout(() => {
        homeManaSpawnTimerRef.current = null;
        spawnHomeMana();
        scheduleNextHomeManaSpawn();
      }, getRandomHomeManaSpawnDelayMs());
    };

    if (homeManaSpritesRef.current.some((sprite) => sprite.status === 'entering')) {
      setHomeManaSpritesSynced(
        homeManaSpritesRef.current.map((sprite) =>
          sprite.status === 'entering' ? {...sprite, status: 'active'} : sprite,
        ),
      );
    }
    if (homeManaSpritesRef.current.length === 0) {
      spawnHomeMana();
    }
    scheduleNextHomeManaSpawn();

    return () => {
      if (homeManaSpawnTimerRef.current !== null) {
        window.clearTimeout(homeManaSpawnTimerRef.current);
      }
      homeManaSpawnTimerRef.current = null;
      Object.keys(homeManaBurstFrameByIdRef.current).forEach((burstId) => {
        clearHomeManaBurstTimerForId(burstId);
      });
      Object.keys(homeManaBurstTimeoutByIdRef.current).forEach((burstId) => {
        clearHomeManaBurstTimerForId(burstId);
      });
      Object.keys(homeManaFadeFrameByIdRef.current).forEach((manaId) => {
        clearHomeManaFadeTimerForId(manaId);
      });
      Object.keys(homeManaFadeTimeoutByIdRef.current).forEach((manaId) => {
        clearHomeManaFadeTimerForId(manaId);
      });
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const maybeMarkFromElement = (
      key: HomeSpriteKey,
      src: string,
      element: HTMLImageElement | null,
    ): void => {
      if (element !== null && element.complete && element.naturalWidth > 0) {
        markHomeSpriteLoaded(key, src);
      }
    };

    maybeMarkFromElement('bosch', BOSCH_SPRITE_SRC, boschImageRef.current);
    maybeMarkFromElement('omom', OMOM_SPRITE_SRC, omomImageRef.current);

    let disposed = false;
    const cleanups: Array<() => void> = [];
    const preloadSprite = (
      key: HomeSpriteKey,
      src: string,
      alreadyLoaded: boolean,
    ) => {
      if (alreadyLoaded) {
        return;
      }
      let image: HTMLImageElement | null = null;
      let attempt = 0;

      const clearImageListeners = () => {
        if (image === null) {
          return;
        }
        image.onload = null;
        image.onerror = null;
      };

      const handleLoaded = () => {
        if (disposed) {
          return;
        }
        markHomeSpriteLoaded(key, src);
      };

      const loadAttempt = () => {
        if (disposed) {
          return;
        }
        clearImageListeners();
        const requestedSrc =
          attempt === 0
            ? src
            : `${src}?homeSpriteRetry=${Date.now()}-${attempt}`;
        image = new window.Image();
        image.decoding = 'async';
        image.loading = 'eager';
        image.onload = () => {
          handleLoaded();
        };
        image.onerror = () => {
          if (disposed) {
            return;
          }
          if (attempt < HOME_SPRITE_RETRY_COUNT) {
            attempt += 1;
            loadAttempt();
          }
        };
        image.src = requestedSrc;
        if (image.complete && image.naturalWidth > 0) {
          handleLoaded();
        }
      };

      loadAttempt();
      cleanups.push(() => {
        clearImageListeners();
      });
    };

    preloadSprite('bosch', BOSCH_SPRITE_SRC, homeSpriteLoadedByKey.bosch);
    preloadSprite('omom', OMOM_SPRITE_SRC, homeSpriteLoadedByKey.omom);

    return () => {
      disposed = true;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [homeSpriteLoadedByKey.bosch, homeSpriteLoadedByKey.omom]);

  useEffect(() => {
    if (typeof window === 'undefined' || areHomeSpritesReady) {
      return;
    }

    let isDisposed = false;
    let probeTimeout: number | null = null;
    let probeAttempts = 0;
    const maxProbeAttempts = 80;
    const probeIntervalMs = 60;

    const probeImageReadyState = (): void => {
      if (isDisposed) {
        return;
      }
      probeAttempts += 1;

      const boschNode = boschImageRef.current;
      const omomNode = omomImageRef.current;
      const isBoschReady =
        boschNode !== null && boschNode.complete && boschNode.naturalWidth > 0;
      const isOmomReady =
        omomNode !== null && omomNode.complete && omomNode.naturalWidth > 0;

      if (isBoschReady) {
        markHomeSpriteLoaded('bosch', BOSCH_SPRITE_SRC);
      }
      if (isOmomReady) {
        markHomeSpriteLoaded('omom', OMOM_SPRITE_SRC);
      }

      if ((isBoschReady && isOmomReady) || probeAttempts >= maxProbeAttempts) {
        return;
      }

      probeTimeout = window.setTimeout(probeImageReadyState, probeIntervalMs);
    };

    const handlePageShow = (): void => {
      probeImageReadyState();
    };
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        probeImageReadyState();
      }
    };

    probeImageReadyState();
    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isDisposed = true;
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (probeTimeout !== null) {
        window.clearTimeout(probeTimeout);
      }
    };
  }, [areHomeSpritesReady]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const nextInitial = createInitialPositions(window.innerWidth, window.innerHeight);
    boschPositionRef.current = nextInitial.bosch;
    omomPositionRef.current = nextInitial.omom;
    followDistanceRef.current =
      distanceBetween(nextInitial.bosch, nextInitial.omom) * FOLLOW_DISTANCE_SCALE;
    trailRef.current = [
      {...nextInitial.omom, distance: 0},
      {...nextInitial.bosch, distance: followDistanceRef.current},
    ];
    setBoschPosition(nextInitial.bosch);
    setOmomPosition(nextInitial.omom);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const updateWelcomeTop = (): void => {
      setHomeWelcomeTopPx(
        getWelcomeTopPx(
          window.innerWidth,
          window.innerHeight,
          getCurrentHeaderHeight(),
          homeWelcomeBoxHeight,
        ),
      );
    };

    updateWelcomeTop();

    const headerNode = document.querySelector('header');
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && headerNode instanceof HTMLElement) {
      observer = new ResizeObserver(() => {
        updateWelcomeTop();
      });
      observer.observe(headerNode);
    }
    let welcomeObserver: ResizeObserver | null = null;
    const welcomeNode = homeWelcomeBoxRef.current;
    if (typeof ResizeObserver !== 'undefined' && welcomeNode instanceof HTMLElement) {
      welcomeObserver = new ResizeObserver((entries) => {
        const nextHeight = Math.round(entries[0]?.contentRect.height ?? 0);
        if (nextHeight > 0) {
          setHomeWelcomeBoxHeight((current) =>
            current === nextHeight ? current : nextHeight,
          );
        }
        updateWelcomeTop();
      });
      welcomeObserver.observe(welcomeNode);
    }

    window.addEventListener('resize', updateWelcomeTop);
    window.addEventListener('orientationchange', updateWelcomeTop);

    return () => {
      window.removeEventListener('resize', updateWelcomeTop);
      window.removeEventListener('orientationchange', updateWelcomeTop);
      if (observer) {
        observer.disconnect();
      }
      if (welcomeObserver) {
        welcomeObserver.disconnect();
      }
    };
  }, [homeWelcomeBoxHeight]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const htmlStyle = document.documentElement.style;
    const bodyStyle = document.body.style;
    const previous = {
      htmlOverflow: htmlStyle.overflow,
      htmlOverscrollBehavior: htmlStyle.overscrollBehavior,
      htmlTouchAction: htmlStyle.touchAction,
      bodyOverflow: bodyStyle.overflow,
      bodyOverscrollBehavior: bodyStyle.overscrollBehavior,
      bodyHeight: bodyStyle.height,
      bodyTouchAction: bodyStyle.touchAction,
    };

    htmlStyle.overflow = 'hidden';
    htmlStyle.overscrollBehavior = 'none';
    htmlStyle.touchAction = 'none';
    bodyStyle.overflow = 'hidden';
    bodyStyle.overscrollBehavior = 'none';
    bodyStyle.height = '100vh';
    bodyStyle.touchAction = 'none';

    return () => {
      htmlStyle.overflow = previous.htmlOverflow;
      htmlStyle.overscrollBehavior = previous.htmlOverscrollBehavior;
      htmlStyle.touchAction = previous.htmlTouchAction;
      bodyStyle.overflow = previous.bodyOverflow;
      bodyStyle.overscrollBehavior = previous.bodyOverscrollBehavior;
      bodyStyle.height = previous.bodyHeight;
      bodyStyle.touchAction = previous.bodyTouchAction;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const tick = (timestamp: number): void => {
      if (lastFrameTimestampRef.current === null) {
        lastFrameTimestampRef.current = timestamp;
      }
      const elapsedSeconds = Math.min(
        0.05,
        (timestamp - lastFrameTimestampRef.current) / 1000,
      );
      lastFrameTimestampRef.current = timestamp;

      let shouldContinue = false;
      let hasPositionUpdate = false;

      if (isMovingRef.current && activePathRef.current) {
        shouldContinue = true;
        hasPositionUpdate = true;

        const path = activePathRef.current;
        const nextPathDistance = Math.min(
          path.totalLength,
          activePathDistanceRef.current + BOSCH_SPEED_PX_PER_SECOND * elapsedSeconds,
        );
        activePathDistanceRef.current = nextPathDistance;

        const nextBoschPosition = pointAtPathDistance(path, nextPathDistance);
        boschPositionRef.current = nextBoschPosition;
        appendTrailPoint(
          trailRef.current,
          nextBoschPosition,
          getHomeTrailRetentionDistance(),
        );
        setBoschPosition(nextBoschPosition);
        collectTouchedHomeMana(nextBoschPosition);

        const trail = trailRef.current;
        const trailEndDistance = trail[trail.length - 1]?.distance ?? 0;
        const targetOmomTrailDistance = Math.max(
          trail[0]?.distance ?? 0,
          trailEndDistance - followDistanceRef.current,
        );
        const nextOmomPosition = pointAtTrailDistance(trail, targetOmomTrailDistance);
        omomPositionRef.current = nextOmomPosition;
        setOmomPosition(nextOmomPosition);
        updateCollectedManaTrailPositions();

        if (nextPathDistance >= path.totalLength) {
          isMovingRef.current = false;
          activePathRef.current = null;
          shouldContinue = false;
        }
      }

      if (isMovingRef.current && activePathRef.current) {
        const remainingDistance = Math.max(
          0,
          activePathRef.current.totalLength - activePathDistanceRef.current,
        );
        const nextDotOpacity =
          remainingDistance >= TARGET_DOT_FADE_DISTANCE_PX
            ? 1
            : clamp(remainingDistance / TARGET_DOT_FADE_DISTANCE_PX, 0, 1);
        if (Math.abs(nextDotOpacity - targetDotOpacityRef.current) > 0.015) {
          targetDotOpacityRef.current = nextDotOpacity;
          setTargetDotOpacity(nextDotOpacity);
        }
      } else if (targetDotOpacityRef.current !== 0) {
        targetDotOpacityRef.current = 0;
        setTargetDotOpacity(0);
      }

      const bounceStart = bounceStartedAtRef.current;
      if (bounceStart !== null) {
        const bounceElapsedMs = timestamp - bounceStart;
        if (bounceElapsedMs < SPRITE_BOUNCE_DURATION_MS) {
          const bounceScale = getBounceScale(bounceElapsedMs);
          if (Math.abs(bounceScale - boschScaleRef.current) > 0.0005) {
            boschScaleRef.current = bounceScale;
            setBoschScale(bounceScale);
          }
          if (Math.abs(bounceScale - omomScaleRef.current) > 0.0005) {
            omomScaleRef.current = bounceScale;
            setOmomScale(bounceScale);
          }
          shouldContinue = true;
        } else {
          bounceStartedAtRef.current = null;
          if (boschScaleRef.current !== 1) {
            boschScaleRef.current = 1;
            setBoschScale(1);
          }
          if (omomScaleRef.current !== 1) {
            omomScaleRef.current = 1;
            setOmomScale(1);
          }
        }
      } else if (hasPositionUpdate) {
        if (boschScaleRef.current !== 1) {
          boschScaleRef.current = 1;
          setBoschScale(1);
        }
        if (omomScaleRef.current !== 1) {
          omomScaleRef.current = 1;
          setOmomScale(1);
        }
      }

      if (!shouldContinue) {
        animationFrameRef.current = null;
        lastFrameTimestampRef.current = null;
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(tick);
    };

    const ensureAnimation = (): void => {
      if (animationFrameRef.current !== null) {
        return;
      }
      lastFrameTimestampRef.current = null;
      animationFrameRef.current = window.requestAnimationFrame(tick);
    };

    const guideBoschToPoint = (
      point: Point,
      options: {randomizePath: boolean; triggerBounce: boolean; minDistancePx: number},
    ): void => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const start = boschPositionRef.current;
      const clampedTarget = clampToViewport(point, viewportWidth, viewportHeight);
      const previousTarget = lastGuideTargetRef.current;
      if (
        previousTarget !== null &&
        activePathRef.current !== null &&
        distanceBetween(previousTarget, clampedTarget) < options.minDistancePx
      ) {
        return;
      }
      if (distanceBetween(start, clampedTarget) < options.minDistancePx) {
        return;
      }

      appendTrailPoint(trailRef.current, start, getHomeTrailRetentionDistance());
      activePathRef.current = buildPathData(
        options.randomizePath
          ? createRandomPath(start, clampedTarget, viewportWidth, viewportHeight)
          : [start, clampedTarget],
      );
      activePathDistanceRef.current = 0;
      isMovingRef.current = true;
      lastGuideTargetRef.current = clampedTarget;
      if (options.triggerBounce) {
        bounceStartedAtRef.current = performance.now();
      }
      setTargetDotPosition(clampedTarget);
      targetDotOpacityRef.current = 1;
      setTargetDotOpacity(1);
      ensureAnimation();
    };

    const handlePointerDown = (event: PointerEvent): void => {
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }
      const targetElement = event.target instanceof Element ? event.target : null;
      if (
        targetElement !== null &&
        (
          targetElement.closest('header') ||
          targetElement.closest('aside[aria-label="Site menu"]') ||
          targetElement.closest('button[aria-label="Close site menu"]') ||
          targetElement.closest('a[aria-label="Go to settings"]') ||
          targetElement.closest('a[aria-label="Return to previous page"]')
        )
      ) {
        return;
      }
      activeGuidePointerIdRef.current = event.pointerId;
      guideBoschToPoint(
        {x: event.clientX, y: event.clientY},
        {randomizePath: true, triggerBounce: true, minDistancePx: 4},
      );
    };

    const handlePointerMove = (event: PointerEvent): void => {
      if (activeGuidePointerIdRef.current !== event.pointerId) {
        return;
      }
      if (event.cancelable) {
        event.preventDefault();
      }
      guideBoschToPoint(
        {x: event.clientX, y: event.clientY},
        {randomizePath: false, triggerBounce: false, minDistancePx: 6},
      );
    };

    const endPointerGuide = (event: PointerEvent): void => {
      if (activeGuidePointerIdRef.current !== event.pointerId) {
        return;
      }
      activeGuidePointerIdRef.current = null;
    };

    const handleResize = (): void => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const nextBosch = clampToViewport(
        boschPositionRef.current,
        viewportWidth,
        viewportHeight,
      );
      const nextOmom = clampToViewport(
        omomPositionRef.current,
        viewportWidth,
        viewportHeight,
      );
      boschPositionRef.current = nextBosch;
      omomPositionRef.current = nextOmom;
      setBoschPosition(nextBosch);
      setOmomPosition(nextOmom);
      updateCollectedManaTrailPositions();
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', endPointerGuide);
    window.addEventListener('pointercancel', endPointerGuide);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', endPointerGuide);
      window.removeEventListener('pointercancel', endPointerGuide);
      window.removeEventListener('resize', handleResize);
      activeGuidePointerIdRef.current = null;
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = null;
      lastFrameTimestampRef.current = null;
    };
  }, []);

  return (
    <NewTopLayout
      underCloudChildren={
        <div style={homeSpriteLayerStyle}>
          <style>{homeManaAnimationStyle}</style>
          {targetDotPosition ? (
            <span
              aria-hidden="true"
              style={{
                ...targetDotStyle,
                left: `${targetDotPosition.x}px`,
                top: `${targetDotPosition.y}px`,
                opacity: targetDotOpacity,
                zIndex: 1,
              }}
            />
          ) : null}
          <div
            style={{
              opacity: areHomeSpritesReady ? 1 : 0,
              transition: 'opacity 140ms ease-out',
            }}>
            {homeManaSprites.map((sprite) => {
              const manaSrc =
                sprite.kind === 'black'
                  ? BLACK_MANA_SPRITE_SRC
                  : WHITE_MANA_SPRITE_SRC;
              const floatAnimationStyle: CSSProperties = {
                animationDuration: `${sprite.floatDurationMs}ms`,
                animationDelay: `${sprite.floatDelayMs}ms`,
              };
              return (
                <div
                  key={sprite.id}
                  style={{
                    ...manaStackStyle,
                    left: `${sprite.x}px`,
                    top: `${sprite.y}px`,
                    opacity: sprite.status === 'active' ? 1 : 0,
                    zIndex: Math.round(sprite.y),
                  }}>
                  <span
                    className="home-mana-float-core"
                    aria-hidden="true"
                    style={floatAnimationStyle}>
                    <img
                      src={manaSrc}
                      alt=""
                      aria-hidden="true"
                      style={homePixelImageStyle}
                      loading="eager"
                      decoding="async"
                      draggable={false}
                    />
                  </span>
                  <span
                    aria-hidden="true"
                    className="home-mana-float-shadow"
                    style={{
                      ...manaShadowStyle,
                      ...floatAnimationStyle,
                    }}
                  />
                </div>
              );
            })}
            <HomeCollectedManaTrail
              currentSpritesRef={collectedHomeManaSpritesRef}
              elementRefs={collectedHomeManaElementRefs}
              sprites={collectedHomeManaSprites}
            />
            <div
              style={{
                ...boschStackStyle,
                left: `${boschPosition.x}px`,
                top: `${boschPosition.y}px`,
                transform: `translate(-50%, -50%) scale(${boschScale})`,
                zIndex: Math.round(boschPosition.y),
              }}>
              <img
                ref={boschImageRef}
                src={BOSCH_SPRITE_SRC}
                alt="Bosch pixel art"
                style={homePixelImageStyle}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                draggable={false}
                onLoad={() => {
                  markHomeSpriteLoaded('bosch', BOSCH_SPRITE_SRC);
                }}
              />
              <span aria-hidden="true" style={boschShadowStyle} />
            </div>
            <div
              style={{
                ...omomStackStyle,
                left: `${omomPosition.x}px`,
                top: `${omomPosition.y}px`,
                transform: `translate(-50%, -50%) scale(${omomScale})`,
                zIndex: Math.round(omomPosition.y),
              }}>
              <img
                ref={omomImageRef}
                src={OMOM_SPRITE_SRC}
                alt="Omom pixel art"
                style={homePixelImageStyle}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                draggable={false}
                onLoad={() => {
                  markHomeSpriteLoaded('omom', OMOM_SPRITE_SRC);
                }}
              />
              <span aria-hidden="true" style={omomShadowStyle} />
            </div>
            {homeManaBursts.map((burst) => (
              <span
                key={burst.id}
                aria-hidden="true"
                style={{
                  ...homeManaBurstLayerStyle,
                  left: `${burst.x}px`,
                  top: `${burst.y}px`,
                  zIndex: Math.round(burst.y) + 120,
                }}>
                <span
                  style={{
                    ...homeManaBurstCoreStyle,
                    transform: burst.isExpanding ? 'scale(2.7)' : 'scale(1)',
                    opacity: burst.isExpanding ? 0 : 0.86,
                  }}
                />
                <span
                  style={{
                    ...homeManaBurstRingStyle,
                    transform: burst.isExpanding ? 'scale(3.4)' : 'scale(1)',
                    opacity: burst.isExpanding ? 0 : 1,
                  }}
                />
              </span>
            ))}
          </div>
        </div>
      }>
      <div style={{...homeWelcomeLayerStyle, top: `${homeWelcomeTopPx}px`}}>
        <div ref={homeWelcomeBoxRef} className="home-welcome-box" style={homeWelcomeBoxStyle}>
          {welcomeContent}
        </div>
      </div>
    </NewTopLayout>
  );
}

export default function Home(): ReactNode {
  return <HomeExperience />;
}
