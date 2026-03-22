import {useEffect, useRef, useState, type CSSProperties, type ReactNode} from 'react';
import NewTopLayout from '@site/src/components/NewTopLayout';

type Point = {
  x: number;
  y: number;
};

type HomeSpriteKey = 'bosch' | 'omom';

const BOSCH_SPRITE_SRC = '/assets/bosch-pixel.png';
const OMOM_SPRITE_SRC = '/assets/omom-pixel.png';
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

type PathData = {
  points: Point[];
  cumulative: number[];
  totalLength: number;
};

type TrailPoint = Point & {distance: number};

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
  const baseTop = viewportHeight * 0.4 - 110;
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
      x: rowLeft + BOSCH_STACK_WIDTH * 0.5 - 15,
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

function appendTrailPoint(trail: TrailPoint[], point: Point): void {
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
  const minAllowedDistance = newest.distance - MAX_TRAIL_DISTANCE_PX;
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

export default function Home(): ReactNode {
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
  const bounceStartedAtRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimestampRef = useRef<number | null>(null);

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
      bodyOverflow: bodyStyle.overflow,
      bodyOverscrollBehavior: bodyStyle.overscrollBehavior,
      bodyHeight: bodyStyle.height,
    };

    htmlStyle.overflow = 'hidden';
    htmlStyle.overscrollBehavior = 'none';
    bodyStyle.overflow = 'hidden';
    bodyStyle.overscrollBehavior = 'none';
    bodyStyle.height = '100vh';

    return () => {
      htmlStyle.overflow = previous.htmlOverflow;
      htmlStyle.overscrollBehavior = previous.htmlOverscrollBehavior;
      bodyStyle.overflow = previous.bodyOverflow;
      bodyStyle.overscrollBehavior = previous.bodyOverscrollBehavior;
      bodyStyle.height = previous.bodyHeight;
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
        appendTrailPoint(trailRef.current, nextBoschPosition);
        setBoschPosition(nextBoschPosition);

        const trail = trailRef.current;
        const trailEndDistance = trail[trail.length - 1]?.distance ?? 0;
        const targetOmomTrailDistance = Math.max(
          trail[0]?.distance ?? 0,
          trailEndDistance - followDistanceRef.current,
        );
        const nextOmomPosition = pointAtTrailDistance(trail, targetOmomTrailDistance);
        omomPositionRef.current = nextOmomPosition;
        setOmomPosition(nextOmomPosition);

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

    const handlePointerDown = (event: PointerEvent): void => {
      const targetElement = event.target instanceof Element ? event.target : null;
      if (
        targetElement !== null &&
        (
          targetElement.closest('header') ||
          targetElement.closest('aside[aria-label="Site menu"]') ||
          targetElement.closest('button[aria-label="Close site menu"]')
        )
      ) {
        return;
      }
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const start = boschPositionRef.current;
      const clampedTarget = clampToViewport(
        {x: event.clientX, y: event.clientY},
        viewportWidth,
        viewportHeight,
      );
      if (distanceBetween(start, clampedTarget) < 4) {
        return;
      }

      appendTrailPoint(trailRef.current, start);
      const randomizedPath = createRandomPath(
        start,
        clampedTarget,
        viewportWidth,
        viewportHeight,
      );
      activePathRef.current = buildPathData(randomizedPath);
      activePathDistanceRef.current = 0;
      isMovingRef.current = true;
      bounceStartedAtRef.current = performance.now();
      setTargetDotPosition(clampedTarget);
      targetDotOpacityRef.current = 1;
      setTargetDotOpacity(1);
      ensureAnimation();
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
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', handleResize);
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
          </div>
        </div>
      }>
      <div style={{...homeWelcomeLayerStyle, top: `${homeWelcomeTopPx}px`}}>
        <div ref={homeWelcomeBoxRef} style={homeWelcomeBoxStyle}>
          Welcome to <strong>Mons Academy</strong>, this world's #1 learning hub for all things <strong>Super Metal Mons</strong>!
        </div>
      </div>
    </NewTopLayout>
  );
}
