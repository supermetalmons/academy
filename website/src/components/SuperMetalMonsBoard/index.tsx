import {useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode} from 'react';
import Link from '@docusaurus/Link';

const BOARD_SIZE = 11;
const files = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
const VIEWBOX_SIZE = 13;
const MAX_UNIT_PIXELS = 48;
const MIN_UNIT_PIXELS = 6;
const MIN_PREVIEW_TEXT_WIDTH = 150;
const MIN_PREVIEW_SCALE = 0.35;
const PREVIEW_SCALE_BASE_UNIT = 20;
const PREVIEW_LEFT_BIAS_PX = 35;
const PREVIEW_GAP_SAFETY_PX = 2;
const PREVIEW_BOX_EXTRA_WIDTH_PX = 24;
const MIN_SIDE_LAYOUT_UNIT_PIXELS = 22;
const THIN_PREVIEW_MIN_SCALE = 0.2;
const ACTIVE_PIECE_SCALE = 1.22;
const SCALE_ANIMATION_MS = 220;
const WAVE_PIXEL = 1 / 32;
const WAVE_FRAME_COUNT = 9;
const WAVE_FRAME_MS = 200;

const colors = {
  darkSquare: '#BEBEBE',
  lightSquare: '#E8E8E8',
  manaPool: '#030DF4',
  pickupItemSquare: '#4F4F4F',
  simpleManaSquare: '#88A8F8',
  wave1: '#6666FF',
  wave2: '#00FCFF',
  border: '#000000',
};

const boardAssets = {
  white: {
    angel: '/assets/mons/angel.png',
    demon: '/assets/mons/demon.png',
    drainer: '/assets/mons/drainer.png',
    spirit: '/assets/mons/spirit.png',
    mystic: '/assets/mons/mystic.png',
  },
  black: {
    angel: '/assets/mons/angelB.png',
    demon: '/assets/mons/demonB.png',
    drainer: '/assets/mons/drainerB.png',
    spirit: '/assets/mons/spiritB.png',
    mystic: '/assets/mons/mysticB.png',
  },
  mana: '/assets/mons/mana.png',
  manaB: '/assets/mons/manaB.png',
  bombOrPotion: '/assets/mons/bombOrPotion.png',
  supermana: '/assets/mons/supermana.png',
};

const moveResourceAssets = {
  statusMove: '/assets/mons/resources/statusMove.webp',
  statusAction: '/assets/mons/resources/statusAction.webp',
  statusMana: '/assets/mons/resources/statusMana.webp',
};

type MoveResourceKey = 'statusMove' | 'statusAction' | 'statusMana';

const moveResourceInfo: Record<MoveResourceKey, {title: string; text: string}> = {
  statusMove: {
    title: 'Movement Points',
    text: 'Each turn you have 5 movement points you can use on any mon.',
  },
  statusAction: {
    title: 'Active Abilities',
    text: 'Each turn you have one active ability point you can use on your spirit, demon, or mystic.',
  },
  statusMana: {
    title: 'Mana Moves',
    text: 'Each turn you have one mana move. Select one of your own mana and move it one tiles in any direction. This ends your turn.',
  },
};

const moveResourceOrder: MoveResourceKey[] = [
  'statusMove',
  'statusMove',
  'statusMove',
  'statusMove',
  'statusMove',
  'statusAction',
  'statusMana',
];

const moveResourceItems = moveResourceOrder.map((kind, index) => ({
  id: `${kind}-${index}`,
  kind,
}));
const moveResourceKindById: Record<string, MoveResourceKey> = Object.fromEntries(
  moveResourceItems.map((resource) => [resource.id, resource.kind]),
) as Record<string, MoveResourceKey>;

const manaPoolPositions: Array<[number, number]> = [
  [5, 5],
  [0, 0],
  [10, 10],
  [10, 0],
  [0, 10],
];

const cornerManaPoolPositions: Array<[number, number]> = [
  [0, 0],
  [10, 0],
  [0, 10],
  [10, 10],
];

const pickupPositions: Array<[number, number]> = [
  [0, 5],
  [10, 5],
];

const simpleManaPositions: Array<[number, number]> = [
  [4, 3],
  [6, 3],
  [4, 7],
  [6, 7],
  [3, 4],
  [5, 4],
  [7, 4],
  [3, 6],
  [5, 6],
  [7, 6],
];

const blackManaPositions: Array<[number, number]> = [
  [4, 3],
  [6, 3],
  [3, 4],
  [5, 4],
  [7, 4],
];

const whiteManaPositions: Array<[number, number]> = [
  [3, 6],
  [5, 6],
  [7, 6],
  [4, 7],
  [6, 7],
];

function toTileKey(col: number, row: number): string {
  return `${row}-${col}`;
}

const whiteManaTileKeys = new Set(
  whiteManaPositions.map(([col, row]) => toTileKey(col, row)),
);
const blackManaTileKeys = new Set(
  blackManaPositions.map(([col, row]) => toTileKey(col, row)),
);
const itemTileKeys = new Set(
  pickupPositions.map(([col, row]) => toTileKey(col, row)),
);

const monPositions = {
  black: [
    {col: 3, row: 0, href: boardAssets.black.mystic, type: 'mystic'},
    {col: 4, row: 0, href: boardAssets.black.spirit, type: 'spirit'},
    {col: 5, row: 0, href: boardAssets.black.drainer, type: 'drainer'},
    {col: 6, row: 0, href: boardAssets.black.angel, type: 'angel'},
    {col: 7, row: 0, href: boardAssets.black.demon, type: 'demon'},
  ],
  white: [
    {col: 3, row: 10, href: boardAssets.white.demon, type: 'demon'},
    {col: 4, row: 10, href: boardAssets.white.angel, type: 'angel'},
    {col: 5, row: 10, href: boardAssets.white.drainer, type: 'drainer'},
    {col: 6, row: 10, href: boardAssets.white.spirit, type: 'spirit'},
    {col: 7, row: 10, href: boardAssets.white.mystic, type: 'mystic'},
  ],
};
const blackMonTileKeys = new Set(
  monPositions.black.map((mon) => toTileKey(mon.col, mon.row)),
);
const topCornerManaPoolTileKeys = new Set([
  toTileKey(0, 0),
  toTileKey(10, 0),
]);

const explanationText = {
  drainer: {
    title: 'Drainer',
    text: 'Can move onto mana and carry mana.',
  },
  angel: {
    title: 'Angel',
    text: 'Protects adjacent friendly mons from incoming demon or mystic attacks.',
  },
  demon: {
    title: 'Demon',
    text: 'Attacks two tiles away orthoganally. Moves to target location and cannot target through other pieces.',
  },
  spirit: {
    title: 'Spirit',
    text: 'Can target any piece exactly two tiles away and push it one tile in any direction.',
  },
  mystic: {
    title: 'Mystic',
    text: 'Attacks two tiles away diagonally. Can target through/over other pieces.',
  },
  whiteMana: {
    title: 'White Mana',
    text: 'Bring mana to a corner pool to score 1 point. Can be mana moved at the end of your turn.',
  },
  blackMana: {
    title: 'Black Mana',
    text: 'Bring enemy mana to a corner pool to score 2 points. Cannot be mana moved.',
  },
  supermana: {
    title: 'Super Mana',
    text: 'Bring super mana to a corner pool to score 2 points. Returns to center tile if drainer is fainted while holding.',
  },
  item: {
    title: 'Item Pickup',
    text: 'Move onto an item to pick it up. You must choose between either option.',
  },
};

const wrapStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
};

const coordTextStyle: CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '0.24px',
  opacity: 0.58,
  userSelect: 'none',
};

const pixelImageStyle: CSSProperties = {
  imageRendering: 'pixelated',
  pointerEvents: 'none',
};

type SuperMetalMonsBoardProps = {
  align?: 'center' | 'left';
  showHoverPreview?: boolean;
  showMoveResources?: boolean;
};

type Tile = {
  row: number;
  col: number;
};

type CornerWaveLine = {
  x: number;
  width: number;
  y: number;
  color: string;
};

type PreviewContent = {
  kind: 'image' | 'manaPool';
  title: string;
  text: string;
  href?: string;
};

function mulberry32(seed: number): () => number {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function createCornerWaveLines(seed: number): CornerWaveLine[] {
  const random = mulberry32(seed);
  const lines: CornerWaveLine[] = [];
  for (let i = 0; i < 10; i += 1) {
    const width = (Math.floor(random() * 4) + 3) * WAVE_PIXEL;
    lines.push({
      x: random() * (1 - width),
      width,
      y: WAVE_PIXEL * (2 + i * 3),
      color: i % 2 === 0 ? colors.wave1 : colors.wave2,
    });
  }
  return lines;
}

function isSameTile(a: Tile | null, b: Tile | null): boolean {
  return a?.row === b?.row && a?.col === b?.col;
}

function getPreviewScale(unit: number, minScale = MIN_PREVIEW_SCALE): number {
  return Math.max(minScale, Math.min(1, unit / PREVIEW_SCALE_BASE_UNIT));
}

function getPreviewBoxWidth(unit: number, minScale = MIN_PREVIEW_SCALE): number {
  const previewScale = getPreviewScale(unit, minScale);
  const previewTextWidth = Math.max(
    Math.round(unit * 2.5 * previewScale),
    Math.round(MIN_PREVIEW_TEXT_WIDTH * previewScale),
  );
  const previewBoxExtraWidth = Math.max(
    16,
    Math.round(PREVIEW_BOX_EXTRA_WIDTH_PX * previewScale),
  );
  return previewTextWidth + previewBoxExtraWidth;
}

function getBoardGap(unit: number, showHoverPreview: boolean): number {
  if (!showHoverPreview) {
    return 0;
  }
  const previewScale = getPreviewScale(unit);
  const desiredPreviewOffset = Math.round(PREVIEW_LEFT_BIAS_PX * previewScale);
  const baseGap = Math.max(6, Math.round(unit * 0.5));
  return Math.max(baseGap, desiredPreviewOffset + PREVIEW_GAP_SAFETY_PX);
}

function getTopNavWrapped(): boolean | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const nav = document.querySelector('nav[aria-label="Primary navigation"]');
  if (!(nav instanceof HTMLElement)) {
    return null;
  }
  const items = Array.from(nav.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement,
  );
  if (items.length <= 1) {
    return false;
  }
  const firstTop = items[0].offsetTop;
  return items.some((item) => Math.abs(item.offsetTop - firstTop) > 1);
}

export default function SuperMetalMonsBoard({
  align = 'center',
  showHoverPreview = false,
  showMoveResources = false,
}: SuperMetalMonsBoardProps): ReactNode {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const boardContainerRef = useRef<HTMLDivElement | null>(null);
  const previewMessageBoxRef = useRef<HTMLDivElement | null>(null);
  const moveResourceButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [hoveredTile, setHoveredTile] = useState<Tile | null>(null);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [hoveredMoveResourceId, setHoveredMoveResourceId] = useState<string | null>(null);
  const [selectedMoveResourceId, setSelectedMoveResourceId] = useState<string | null>(null);
  const [scaledTile, setScaledTile] = useState<Tile | null>(null);
  const [scaledFactor, setScaledFactor] = useState(1);
  const [waveFrameIndex, setWaveFrameIndex] = useState(0);
  const [renderWidth, setRenderWidth] = useState(MAX_UNIT_PIXELS * VIEWBOX_SIZE);
  const [isPreviewBelow, setIsPreviewBelow] = useState(false);
  const [availableWidth, setAvailableWidth] = useState<number | null>(null);
  const scaledFactorRef = useRef(1);

  useEffect(() => {
    scaledFactorRef.current = scaledFactor;
  }, [scaledFactor]);

  useEffect(() => {
    const node = wrapRef.current;
    if (node === null) {
      return;
    }

    const updateAvailableWidth = () => {
      setAvailableWidth(node.clientWidth);
    };

    updateAvailableWidth();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        updateAvailableWidth();
      });
      observer.observe(node);
      return () => {
        observer.disconnect();
      };
    }

    window.addEventListener('resize', updateAvailableWidth);
    return () => {
      window.removeEventListener('resize', updateAvailableWidth);
    };
  }, []);

  useEffect(() => {
    const updateRenderWidth = () => {
      const layoutWidth = availableWidth ?? window.innerWidth;
      const maxAvailableWidth = Math.max(120, layoutWidth - 2);
      const sideLayoutFitsAtMinUnit =
        !showHoverPreview ||
        MIN_SIDE_LAYOUT_UNIT_PIXELS * VIEWBOX_SIZE +
          getPreviewBoxWidth(MIN_SIDE_LAYOUT_UNIT_PIXELS) +
          getBoardGap(MIN_SIDE_LAYOUT_UNIT_PIXELS, true) <=
          maxAvailableWidth;
      const topNavWrapped = getTopNavWrapped();
      const nextIsPreviewBelow = showHoverPreview && (
        topNavWrapped ?? !sideLayoutFitsAtMinUnit
      );
      setIsPreviewBelow(nextIsPreviewBelow);
      let snappedUnit = MIN_UNIT_PIXELS;

      for (let unit = MAX_UNIT_PIXELS; unit >= MIN_UNIT_PIXELS; unit -= 1) {
        const boardWidth = unit * VIEWBOX_SIZE;
        const rowWidth =
          showHoverPreview && !nextIsPreviewBelow
            ? boardWidth + getPreviewBoxWidth(unit) + getBoardGap(unit, true)
            : boardWidth;

        if (rowWidth <= maxAvailableWidth || unit === MIN_UNIT_PIXELS) {
          snappedUnit = unit;
          break;
        }
      }

      setRenderWidth(snappedUnit * VIEWBOX_SIZE);
    };

    updateRenderWidth();
  }, [availableWidth, showHoverPreview]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setWaveFrameIndex((prev) => (prev + 1) % WAVE_FRAME_COUNT);
    }, WAVE_FRAME_MS);
    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const clearSelectionOnOutsideClick = (event: PointerEvent) => {
      if (selectedTile === null && selectedMoveResourceId === null) {
        return;
      }
      const target = event.target as Node | null;
      if (
        target !== null &&
        (boardContainerRef.current?.contains(target) ||
          previewMessageBoxRef.current?.contains(target))
      ) {
        return;
      }
      setSelectedTile(null);
      setSelectedMoveResourceId(null);
    };

    document.addEventListener('pointerdown', clearSelectionOnOutsideClick);
    return () => {
      document.removeEventListener('pointerdown', clearSelectionOnOutsideClick);
    };
  }, [selectedTile, selectedMoveResourceId]);

  const svgStyle: CSSProperties = {
    width: `${renderWidth}px`,
    height: 'auto',
    display: 'block',
    imageRendering: 'pixelated',
  };

  const darkSquares: ReactNode[] = [];
  const hoverTiles: ReactNode[] = [];
  const currentWrapStyle: CSSProperties = {
    ...wrapStyle,
    justifyContent: align === 'left' ? 'flex-start' : 'center',
  };
  const pieceByTile: Record<string, PreviewContent> = {};
  const moveResourceById: Record<string, PreviewContent> = {};
  const cornerWaveLines = useMemo(
    () =>
      cornerManaPoolPositions.map((_, index) => createCornerWaveLines(index + 1)),
    [],
  );
  const previewManaPoolWaves = useMemo(() => createCornerWaveLines(777), []);

  monPositions.black.forEach((mon) => {
    pieceByTile[`${mon.row}-${mon.col}`] = {
      kind: 'image',
      href: mon.href,
      title: explanationText[mon.type].title,
      text: explanationText[mon.type].text,
    };
  });
  monPositions.white.forEach((mon) => {
    pieceByTile[`${mon.row}-${mon.col}`] = {
      kind: 'image',
      href: mon.href,
      title: explanationText[mon.type].title,
      text: explanationText[mon.type].text,
    };
  });
  blackManaPositions.forEach(([col, row]) => {
    pieceByTile[`${row}-${col}`] = {
      kind: 'image',
      href: boardAssets.manaB,
      title: explanationText.blackMana.title,
      text: explanationText.blackMana.text,
    };
  });
  whiteManaPositions.forEach(([col, row]) => {
    pieceByTile[`${row}-${col}`] = {
      kind: 'image',
      href: boardAssets.mana,
      title: explanationText.whiteMana.title,
      text: explanationText.whiteMana.text,
    };
  });
  pickupPositions.forEach(([col, row]) => {
    pieceByTile[`${row}-${col}`] = {
      kind: 'image',
      href: boardAssets.bombOrPotion,
      title: explanationText.item.title,
      text: explanationText.item.text,
    };
  });
  pieceByTile['5-5'] = {
    kind: 'image',
    href: boardAssets.supermana,
    title: explanationText.supermana.title,
    text: explanationText.supermana.text,
  };
  cornerManaPoolPositions.forEach(([col, row]) => {
    pieceByTile[`${row}-${col}`] = {
      kind: 'manaPool',
      title: 'Mana Pool',
      text: 'Bring mana here to score points. 5 wins the game!',
    };
  });
  moveResourceItems.forEach((resource) => {
    const info = moveResourceInfo[resource.kind];
    moveResourceById[resource.id] = {
      kind: 'image',
      href: moveResourceAssets[resource.kind],
      title: info.title,
      text: info.text,
    };
  });

  const hoveredPiece =
    hoveredTile !== null
      ? pieceByTile[`${hoveredTile.row}-${hoveredTile.col}`] ?? null
      : null;
  const selectedPiece =
    selectedTile !== null
      ? pieceByTile[`${selectedTile.row}-${selectedTile.col}`] ?? null
      : null;
  const hoveredMoveResource =
    hoveredMoveResourceId !== null
      ? moveResourceById[hoveredMoveResourceId] ?? null
      : null;
  const selectedMoveResource =
    selectedMoveResourceId !== null
      ? moveResourceById[selectedMoveResourceId] ?? null
      : null;
  const activePiece =
    selectedMoveResource ??
    selectedPiece ??
    hoveredMoveResource ??
    hoveredPiece;
  const activePieceHref = activePiece?.href ?? null;
  const activeMoveResourceId = selectedMoveResourceId ?? hoveredMoveResourceId;
  const selectedMoveResourceKind =
    selectedMoveResourceId !== null
      ? moveResourceKindById[selectedMoveResourceId] ?? null
      : null;
  const selectedTileKey =
    selectedTile !== null ? `${selectedTile.row}-${selectedTile.col}` : null;
  const selectedBoardScaleGroup =
    selectedTileKey === null
      ? null
      : whiteManaTileKeys.has(selectedTileKey)
        ? 'whiteMana'
        : blackManaTileKeys.has(selectedTileKey)
          ? 'blackMana'
          : itemTileKeys.has(selectedTileKey)
            ? 'item'
            : null;
  const highlightedTile =
    selectedMoveResource !== null
      ? null
      : selectedTile !== null
      ? selectedTile
      : hoveredPiece !== null
        ? hoveredTile
        : null;
  const activeBoardTileForThinPreview =
    selectedPiece !== null
      ? selectedTile
      : selectedMoveResource === null &&
          hoveredMoveResource === null &&
          hoveredPiece !== null
        ? hoveredTile
        : null;
  const activeMoveResourceButton =
    activeMoveResourceId !== null
      ? moveResourceButtonRefs.current[activeMoveResourceId] ?? null
      : null;
  const boardContainerRect = boardContainerRef.current?.getBoundingClientRect() ?? null;
  const activeMoveResourceRect = activeMoveResourceButton?.getBoundingClientRect() ?? null;

  useEffect(() => {
    let frameId = 0;
    const nextHighlighted = highlightedTile;

    if (nextHighlighted === null) {
      if (scaledTile === null || scaledFactorRef.current === 1) {
        return;
      }

      const from = scaledFactorRef.current;
      const start = performance.now();
      const tickDown = (now: number) => {
        const progress = Math.min((now - start) / SCALE_ANIMATION_MS, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = from + (1 - from) * eased;
        setScaledFactor(value);
        if (progress < 1) {
          frameId = window.requestAnimationFrame(tickDown);
          return;
        }
        setScaledFactor(1);
        setScaledTile(null);
      };
      frameId = window.requestAnimationFrame(tickDown);
      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    if (!isSameTile(nextHighlighted, scaledTile)) {
      setScaledTile(nextHighlighted);
      setScaledFactor(1);
      scaledFactorRef.current = 1;
    }

    const from = isSameTile(nextHighlighted, scaledTile)
      ? scaledFactorRef.current
      : 1;
    const start = performance.now();
    const tickUp = (now: number) => {
      const progress = Math.min((now - start) / SCALE_ANIMATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = from + (ACTIVE_PIECE_SCALE - from) * eased;
      setScaledFactor(value);
      if (progress < 1) {
        frameId = window.requestAnimationFrame(tickUp);
      }
    };
    frameId = window.requestAnimationFrame(tickUp);
    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [highlightedTile, scaledTile]);

  const tilePixels = renderWidth / VIEWBOX_SIZE;
  const useBelowPreviewLayout = showHoverPreview && isPreviewBelow;
  const previewScale = useBelowPreviewLayout
    ? getPreviewScale(tilePixels, THIN_PREVIEW_MIN_SCALE)
    : getPreviewScale(tilePixels);
  const previewSizePx = Math.round(tilePixels * 2.5 * previewScale);
  const previewBoxWidthPx = getPreviewBoxWidth(
    tilePixels,
    useBelowPreviewLayout ? THIN_PREVIEW_MIN_SCALE : MIN_PREVIEW_SCALE,
  );
  const boardGapPx = getBoardGap(tilePixels, showHoverPreview);
  const belowPreviewGapPx = Math.max(10, Math.round(tilePixels * 0.4));
  const desiredPreviewLeftOffsetPx = Math.round(PREVIEW_LEFT_BIAS_PX * previewScale);
  const previewLeftOffsetPx = useBelowPreviewLayout
    ? 0
    : Math.min(
        desiredPreviewLeftOffsetPx,
        Math.max(0, boardGapPx - PREVIEW_GAP_SAFETY_PX),
      );
  const previewMessagePaddingX = Math.max(6, Math.round(10 * previewScale));
  const previewMessagePaddingY = Math.max(5, Math.round(8 * previewScale));
  const previewTextWidthBasePx = Math.max(
    previewSizePx,
    Math.round(MIN_PREVIEW_TEXT_WIDTH * previewScale),
  );
  const previewTextWidthPx = Math.min(
    previewTextWidthBasePx,
    Math.max(28, previewBoxWidthPx - previewMessagePaddingX * 2),
  );
  const previewMessagePaddingTopPx = previewMessagePaddingY;
  const previewMessagePaddingBottomPx = previewMessagePaddingY + 8;
  const previewBoxLiftPx = 3;
  const previewMessageRadius = Math.max(4, Math.round(8 * previewScale));
  const previewMessageGap = Math.max(4, Math.round(6 * previewScale));
  const previewTitleFontPx = Math.max(9, Math.round(16 * previewScale));
  const previewTextFontPx = Math.max(8, Math.round(14 * previewScale));
  const isMovementPreview = activePiece?.title === moveResourceInfo.statusMove.title;
  const isManaOrItemPreview =
    activePiece?.title === explanationText.whiteMana.title ||
    activePiece?.title === explanationText.blackMana.title ||
    activePiece?.title === explanationText.item.title;
  const previewTitleCenterFromTopPx =
    previewMessagePaddingTopPx +
    previewSizePx +
    previewMessageGap +
    Math.round(previewTitleFontPx * 0.55);
  const showThinFloatingPreview =
    useBelowPreviewLayout &&
    activePiece !== null &&
    (activeBoardTileForThinPreview !== null || activeMoveResourceId !== null);
  const isThinBlackMonPreview =
    useBelowPreviewLayout &&
    activeBoardTileForThinPreview !== null &&
    (() => {
      const activeTileKey = `${activeBoardTileForThinPreview.row}-${activeBoardTileForThinPreview.col}`;
      return (
        blackMonTileKeys.has(activeTileKey) ||
        topCornerManaPoolTileKeys.has(activeTileKey)
      );
    })();
  const thinFloatingPreviewWidthPx = Math.min(previewBoxWidthPx, Math.max(88, renderWidth - 8));
  const thinTileCenterXPx =
    activeBoardTileForThinPreview !== null
      ? ((activeBoardTileForThinPreview.col + 1.5) / VIEWBOX_SIZE) * renderWidth
      : 0;
  const thinResourceCenterXPx =
    activeMoveResourceRect !== null && boardContainerRect !== null
      ? activeMoveResourceRect.left - boardContainerRect.left + activeMoveResourceRect.width / 2
      : 0;
  const thinFloatingAnchorCenterXPx =
    activeBoardTileForThinPreview !== null
      ? thinTileCenterXPx
      : activeMoveResourceId !== null
        ? thinResourceCenterXPx
        : 0;
  const thinFloatingPreviewCenterXPx =
    activePiece !== null
      ? Math.min(
          renderWidth - thinFloatingPreviewWidthPx / 2 - 4,
          Math.max(thinFloatingPreviewWidthPx / 2 + 4, thinFloatingAnchorCenterXPx),
        )
      : 0;
  const thinTileTopYPx =
    activeBoardTileForThinPreview !== null
      ? ((activeBoardTileForThinPreview.row + 1) / VIEWBOX_SIZE) * renderWidth
      : 0;
  const thinResourceCenterYPx =
    activeMoveResourceRect !== null && boardContainerRect !== null
      ? activeMoveResourceRect.top -
        boardContainerRect.top +
        activeMoveResourceRect.height / 2
      : 0;
  const thinResourceAnchorOffsetPx = Math.max(3, Math.round(tilePixels * 0.25));
  const thinResourceTopYPx =
    activeMoveResourceRect !== null && boardContainerRect !== null
      ? thinResourceCenterYPx - thinResourceAnchorOffsetPx
      : 0;
  const thinFloatingAnchorTopYPx =
    activeBoardTileForThinPreview !== null
      ? thinTileTopYPx
      : activeMoveResourceId !== null
        ? thinResourceTopYPx
        : 0;
  const thinFloatingPreviewTopPx =
    activePiece !== null
      ? Math.max(6, thinFloatingAnchorTopYPx - 6)
      : 0;
  const thinFloatingPreviewBelowTopPx =
    activeBoardTileForThinPreview !== null
      ? ((activeBoardTileForThinPreview.row + 2) / VIEWBOX_SIZE) * renderWidth + 6
      : thinFloatingPreviewTopPx;
  const moveResourcesOffsetX = Math.round(tilePixels * -0.9);
  const moveResourcesOffsetY = Math.round(tilePixels * -0.62);
  const boardRowStyle: CSSProperties = {
    display: 'flex',
    flexDirection: useBelowPreviewLayout ? 'column' : 'row',
    alignItems: 'flex-start',
    gap: `${useBelowPreviewLayout ? belowPreviewGapPx : boardGapPx}px`,
  };
  const boardStackStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    position: 'relative',
    overflow: 'visible',
  };
  const moveResourcesWrapStyle: CSSProperties = {
    marginTop: `${Math.max(4, Math.round(tilePixels * 0.22))}px`,
    width: `${renderWidth}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: `${Math.max(3, Math.round(tilePixels * 0.14))}px`,
    transform: `translate(${moveResourcesOffsetX}px, ${moveResourcesOffsetY}px)`,
  };
  const moveResourceSize = Math.max(6, Math.round(tilePixels * 0.5));
  const moveResourceIconStyle: CSSProperties = {
    width: `${moveResourceSize}px`,
    height: `${moveResourceSize}px`,
    imageRendering: 'auto',
    display: 'block',
    pointerEvents: 'none',
  };
  const getMoveResourceButtonStyle = (isActive: boolean): CSSProperties => ({
    border: 'none',
    background: 'transparent',
    margin: 0,
    padding: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transform: `scale(${isActive ? ACTIVE_PIECE_SCALE : 1})`,
    transition: `transform ${SCALE_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
    transformOrigin: 'center center',
  });
  const isMoveResourceActive = (
    resourceId: string,
    resourceKind: MoveResourceKey,
  ): boolean => {
    if (selectedMoveResourceKind === 'statusMove' && resourceKind === 'statusMove') {
      return true;
    }
    return activeMoveResourceId === resourceId;
  };
  const previewPanelStyle: CSSProperties = {
    width: `${previewBoxWidthPx}px`,
    height: `${renderWidth}px`,
    position: 'relative',
    alignSelf: 'flex-start',
    overflow: 'visible',
  };
  const previewImageSlotStyle: CSSProperties = {
    width: `${previewSizePx}px`,
    height: `${previewSizePx}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    flexShrink: 0,
    filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.12))',
  };
  const previewImageStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    imageRendering: 'pixelated',
    display: 'block',
  };
  const activePreviewImageStyle: CSSProperties = isMovementPreview
    ? {
        ...previewImageStyle,
        transform: 'translateY(-3px) scale(0.9)',
      }
    : isManaOrItemPreview
      ? {
          ...previewImageStyle,
          transform: 'scale(1.08)',
        }
    : previewImageStyle;
  const previewPoolSvgStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'block',
    imageRendering: 'pixelated',
  };
  const previewMessageBoxStyle: CSSProperties = {
    width: `${Math.min(previewBoxWidthPx, renderWidth)}px`,
    position: 'absolute',
    left: `calc(50% - ${previewLeftOffsetPx}px)`,
    top: `calc(50% - ${previewTitleCenterFromTopPx + previewBoxLiftPx}px)`,
    transform: 'translateX(-50%)',
    border: '1px solid #000',
    borderRadius: `${previewMessageRadius}px`,
    backgroundColor: '#fff',
    boxSizing: 'border-box',
    padding: `${previewMessagePaddingTopPx}px ${previewMessagePaddingX}px ${previewMessagePaddingBottomPx}px`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: `${previewMessageGap}px`,
    visibility: activePiece ? 'visible' : 'hidden',
  };
  const thinFloatingPreviewBoxStyle: CSSProperties = {
    width: `${thinFloatingPreviewWidthPx}px`,
    position: 'absolute',
    left: `${thinFloatingPreviewCenterXPx}px`,
    top: `${isThinBlackMonPreview ? thinFloatingPreviewBelowTopPx : thinFloatingPreviewTopPx}px`,
    transform: isThinBlackMonPreview
      ? 'translate(-50%, 0)'
      : 'translate(-50%, -100%)',
    border: '1px solid #000',
    borderRadius: `${previewMessageRadius}px`,
    backgroundColor: '#fff',
    boxSizing: 'border-box',
    padding: `${previewMessagePaddingTopPx}px ${previewMessagePaddingX}px ${previewMessagePaddingBottomPx}px`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: `${previewMessageGap}px`,
    pointerEvents: 'none',
    zIndex: 3,
  };
  const previewTextStyle: CSSProperties = {
    margin: 0,
    textAlign: 'center',
    color: '#000',
    fontSize: `${previewTextFontPx}px`,
    lineHeight: 1.25,
    width: `${previewTextWidthPx}px`,
  };
  const previewTitleStyle: CSSProperties = {
    margin: 0,
    fontSize: `${previewTitleFontPx}px`,
    lineHeight: 1.1,
    color: '#000',
    textAlign: 'center',
    fontWeight: 900,
    textDecoration: 'underline',
  };
  const previewHintStyle: CSSProperties = {
    margin: 0,
    position: 'absolute',
    left: `calc(50% - ${previewLeftOffsetPx}px)`,
    top: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#000',
    fontSize: `${previewTextFontPx}px`,
    lineHeight: 1.2,
    width: `${previewTextWidthPx}px`,
    textAlign: 'center',
  };
  const previewHintPrimaryTextStyle: CSSProperties = {
    color: '#000',
    fontWeight: 600,
    fontStyle: 'italic',
    opacity: 0.4,
    display: 'inline-block',
  };
  const previewHintLinkStyle: CSSProperties = {
    color: '#0000EE',
    textDecoration: 'underline',
    fontStyle: 'italic',
    fontWeight: 600,
    opacity: 1,
    display: 'inline-block',
    marginTop: `${Math.round(previewTextFontPx * 2.5)}px`,
  };
  const getPieceFrame = (row: number, col: number) => {
    const tileKey = `${row}-${col}`;
    const isGroupActive =
      selectedBoardScaleGroup === 'whiteMana'
        ? whiteManaTileKeys.has(tileKey)
        : selectedBoardScaleGroup === 'blackMana'
          ? blackManaTileKeys.has(tileKey)
          : selectedBoardScaleGroup === 'item'
            ? itemTileKeys.has(tileKey)
            : false;
    const isSingleActive =
      scaledTile !== null &&
      scaledTile.row === row &&
      scaledTile.col === col;
    const isActive = isGroupActive || isSingleActive;
    const scale = isActive ? scaledFactor : 1;
    const offset = (scale - 1) / 2;
    return {
      x: col - offset,
      y: row - offset,
      size: scale,
    };
  };
  const getWaveSlideFrame = (line: CornerWaveLine, frameIndex: number) => {
    let sliderX = line.x + line.width - WAVE_PIXEL * frameIndex;
    const attemptedWidth = Math.min(frameIndex, 3) * WAVE_PIXEL;
    if (sliderX < line.x) {
      if (sliderX + attemptedWidth <= line.x) {
        return {x: line.x, width: 0};
      }
      const visibleWidth = attemptedWidth - line.x + sliderX;
      if (visibleWidth < WAVE_PIXEL / 2) {
        return {x: line.x, width: 0};
      }
      sliderX = line.x;
      return {x: sliderX, width: visibleWidth};
    }
    return {x: sliderX, width: attemptedWidth};
  };
  const supermanaFrame = getPieceFrame(5, 5);
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const hasSelectablePiece = pieceByTile[`${row}-${col}`] !== undefined;
      if ((row + col) % 2 === 1) {
        darkSquares.push(
          <rect
            key={`dark-${row}-${col}`}
            x={col}
            y={row}
            width={1}
            height={1}
            fill={colors.darkSquare}
          />,
        );
      }

      hoverTiles.push(
        <rect
          key={`hover-${row}-${col}`}
          x={col}
          y={row}
          width={1}
          height={1}
          fill="transparent"
          style={{
            cursor: hasSelectablePiece ? 'pointer' : 'default',
          }}
          onMouseEnter={() => {
            setHoveredTile({row, col});
          }}
          onClick={() => {
            const clickedPiece = pieceByTile[`${row}-${col}`] ?? null;
            setSelectedMoveResourceId(null);
            if (clickedPiece !== null) {
              setSelectedTile({row, col});
              return;
            }
            setSelectedTile(null);
          }}
        />,
      );
    }
  }

  return (
    <div ref={wrapRef} style={currentWrapStyle}>
      <div style={boardRowStyle}>
        <div ref={boardContainerRef} style={boardStackStyle}>
          <svg
            viewBox="-1 -1 13 13"
            style={svgStyle}
            shapeRendering="crispEdges"
            aria-label="Super Metal Mons board"
            onMouseLeave={() => {
              setHoveredTile(null);
            }}>
          <rect x={0} y={0} width={11} height={11} fill={colors.lightSquare} />
          {darkSquares}

        {manaPoolPositions.map(([col, row], i) => (
          <rect
            key={`mana-pool-${i}`}
            x={col}
            y={row}
            width={1}
            height={1}
            fill={colors.manaPool}
          />
        ))}

        {cornerManaPoolPositions.map(([poolCol, poolRow], poolIndex) => (
          <g
            key={`corner-waves-${poolIndex}`}
            transform={`translate(${poolCol}, ${poolRow})`}
            opacity={0.5}>
            {cornerWaveLines[poolIndex].map((line, lineIndex) => {
              const slide = getWaveSlideFrame(line, waveFrameIndex);
              return (
                <g key={`wave-line-${poolIndex}-${lineIndex}`}>
                  <rect
                    x={line.x}
                    y={line.y}
                    width={line.width}
                    height={WAVE_PIXEL}
                    fill={line.color}
                  />
                  {slide.width > 0 ? (
                    <>
                      <rect
                        x={slide.x}
                        y={line.y - WAVE_PIXEL}
                        width={slide.width}
                        height={WAVE_PIXEL}
                        fill={line.color}
                      />
                      <rect
                        x={slide.x}
                        y={line.y}
                        width={slide.width}
                        height={WAVE_PIXEL}
                        fill={colors.manaPool}
                      />
                    </>
                  ) : null}
                </g>
              );
            })}
          </g>
        ))}

        {pickupPositions.map(([col, row], i) => (
          <rect
              key={`pickup-${i}`}
              x={col}
              y={row}
              width={1}
              height={1}
              fill={colors.pickupItemSquare}
            />
          ))}

          {simpleManaPositions.map(([col, row], i) => (
            <rect
              key={`simple-mana-${i}`}
              x={col}
              y={row}
              width={1}
              height={1}
              fill={colors.simpleManaSquare}
            />
          ))}

        {blackManaPositions.map(([col, row], i) => (
          (() => {
            const frame = getPieceFrame(row, col);
            return (
              <image
                key={`black-mana-${i}`}
                href={boardAssets.manaB}
                x={frame.x}
                y={frame.y}
                width={frame.size}
                height={frame.size}
                style={pixelImageStyle}
              />
            );
          })()
        ))}

        {whiteManaPositions.map(([col, row], i) => (
          (() => {
            const frame = getPieceFrame(row, col);
            return (
              <image
                key={`white-mana-${i}`}
                href={boardAssets.mana}
                x={frame.x}
                y={frame.y}
                width={frame.size}
                height={frame.size}
                style={pixelImageStyle}
              />
            );
          })()
        ))}

        <image
          key="supermana"
          href={boardAssets.supermana}
          x={supermanaFrame.x}
          y={supermanaFrame.y}
          width={supermanaFrame.size}
          height={supermanaFrame.size}
          style={pixelImageStyle}
        />

        {pickupPositions.map(([col, row], i) => (
          (() => {
            const frame = getPieceFrame(row, col);
            return (
              <image
                key={`pickup-item-${i}`}
                href={boardAssets.bombOrPotion}
                x={frame.x}
                y={frame.y}
                width={frame.size}
                height={frame.size}
                style={pixelImageStyle}
              />
            );
          })()
        ))}

        {monPositions.black.map((mon, i) => (
          (() => {
            const frame = getPieceFrame(mon.row, mon.col);
            return (
              <image
                key={`black-mon-${i}`}
                href={mon.href}
                x={frame.x}
                y={frame.y}
                width={frame.size}
                height={frame.size}
                style={pixelImageStyle}
              />
            );
          })()
        ))}

        {monPositions.white.map((mon, i) => (
          (() => {
            const frame = getPieceFrame(mon.row, mon.col);
            return (
              <image
                key={`white-mon-${i}`}
                href={mon.href}
                x={frame.x}
                y={frame.y}
                width={frame.size}
                height={frame.size}
                style={pixelImageStyle}
              />
            );
          })()
        ))}

          {hoverTiles}

        {files.map((label, col) => (
          (() => {
            const isActive = hoveredTile === null || hoveredTile.col === col;
            return (
          <text
            key={`file-bottom-${label}`}
            x={col + 0.5}
            y={11.34}
            textAnchor="middle"
            fill={colors.border}
            style={{
              ...coordTextStyle,
              opacity: isActive ? coordTextStyle.opacity : 0,
              transitionProperty: 'opacity',
              transitionDuration: isActive ? '120ms' : '300ms',
              transitionTimingFunction: 'ease',
            }}>
            {label}
          </text>
            );
          })()
        ))}

        {Array.from({length: BOARD_SIZE}).map((_, row) => (
          (() => {
            const isActive = hoveredTile === null || hoveredTile.row === row;
            return (
          <text
            key={`rank-left-${row}`}
            x={-0.22}
            y={row + 0.57}
            textAnchor="middle"
            fill={colors.border}
            style={{
              ...coordTextStyle,
              opacity: isActive ? coordTextStyle.opacity : 0,
              transitionProperty: 'opacity',
              transitionDuration: isActive ? '120ms' : '300ms',
              transitionTimingFunction: 'ease',
            }}>
            {11 - row}
          </text>
            );
          })()
        ))}

          </svg>

          {showThinFloatingPreview ? (
            <div ref={previewMessageBoxRef} style={thinFloatingPreviewBoxStyle}>
              <div style={previewImageSlotStyle}>
                {activePiece?.kind === 'manaPool' ? (
                  <svg
                    viewBox="0 0 1 1"
                    style={previewPoolSvgStyle}
                    shapeRendering="crispEdges"
                    aria-label="Mana pool preview">
                    <rect x={0} y={0} width={1} height={1} fill={colors.manaPool} />
                    <g opacity={0.5}>
                      {previewManaPoolWaves.map((line, lineIndex) => {
                        const slide = getWaveSlideFrame(line, waveFrameIndex);
                        return (
                          <g key={`preview-wave-floating-${lineIndex}`}>
                            <rect
                              x={line.x}
                              y={line.y}
                              width={line.width}
                              height={WAVE_PIXEL}
                              fill={line.color}
                            />
                            {slide.width > 0 ? (
                              <>
                                <rect
                                  x={slide.x}
                                  y={line.y - WAVE_PIXEL}
                                  width={slide.width}
                                  height={WAVE_PIXEL}
                                  fill={line.color}
                                />
                                <rect
                                  x={slide.x}
                                  y={line.y}
                                  width={slide.width}
                                  height={WAVE_PIXEL}
                                  fill={colors.manaPool}
                                />
                              </>
                            ) : null}
                          </g>
                        );
                      })}
                    </g>
                  </svg>
                ) : activePiece ? (
                  <img
                    src={activePieceHref}
                    alt={`${activePiece.title} preview`}
                    style={activePreviewImageStyle}
                  />
                ) : null}
              </div>
              <h4 style={previewTitleStyle}>{activePiece?.title ?? ''}</h4>
              <p style={previewTextStyle}>
                {activePiece?.text ?? ''}
              </p>
            </div>
          ) : null}

          {showMoveResources ? (
            <div
              style={moveResourcesWrapStyle}
              aria-label="Move resources"
              onMouseLeave={() => {
                setHoveredMoveResourceId(null);
              }}>
              {moveResourceItems.map((resource) => (
                <button
                  key={resource.id}
                  ref={(node) => {
                    moveResourceButtonRefs.current[resource.id] = node;
                  }}
                  type="button"
                  aria-label={moveResourceInfo[resource.kind].title}
                  style={getMoveResourceButtonStyle(
                    isMoveResourceActive(resource.id, resource.kind),
                  )}
                  onMouseEnter={() => {
                    setHoveredMoveResourceId(resource.id);
                  }}
                  onFocus={() => {
                    setHoveredMoveResourceId(resource.id);
                  }}
                  onBlur={() => {
                    setHoveredMoveResourceId((current) =>
                      current === resource.id ? null : current,
                    );
                  }}
                  onClick={() => {
                    setSelectedTile(null);
                    setSelectedMoveResourceId(resource.id);
                  }}>
                  <img
                    src={moveResourceAssets[resource.kind]}
                    alt={moveResourceInfo[resource.kind].title}
                    style={moveResourceIconStyle}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {showHoverPreview && !useBelowPreviewLayout ? (
          <div style={previewPanelStyle}>
            {!activePiece ? (
              <p style={previewHintStyle}>
                <span style={previewHintPrimaryTextStyle}>
                  (Click/hover over an element for details)
                </span>
                <br />
                <Link to="/piece-details" style={previewHintLinkStyle}>
                  show all piece details
                </Link>
              </p>
            ) : null}
            <div ref={previewMessageBoxRef} style={previewMessageBoxStyle}>
              <div style={previewImageSlotStyle}>
                {activePiece?.kind === 'manaPool' ? (
                  <svg
                    viewBox="0 0 1 1"
                    style={previewPoolSvgStyle}
                    shapeRendering="crispEdges"
                    aria-label="Mana pool preview">
                    <rect x={0} y={0} width={1} height={1} fill={colors.manaPool} />
                    <g opacity={0.5}>
                      {previewManaPoolWaves.map((line, lineIndex) => {
                        const slide = getWaveSlideFrame(line, waveFrameIndex);
                        return (
                          <g key={`preview-wave-${lineIndex}`}>
                            <rect
                              x={line.x}
                              y={line.y}
                              width={line.width}
                              height={WAVE_PIXEL}
                              fill={line.color}
                            />
                            {slide.width > 0 ? (
                              <>
                                <rect
                                  x={slide.x}
                                  y={line.y - WAVE_PIXEL}
                                  width={slide.width}
                                  height={WAVE_PIXEL}
                                  fill={line.color}
                                />
                                <rect
                                  x={slide.x}
                                  y={line.y}
                                  width={slide.width}
                                  height={WAVE_PIXEL}
                                  fill={colors.manaPool}
                                />
                              </>
                            ) : null}
                          </g>
                        );
                      })}
                    </g>
                  </svg>
                ) : activePiece ? (
                  <img
                    src={activePieceHref}
                    alt={`${activePiece.title} preview`}
                    style={activePreviewImageStyle}
                  />
                ) : null}
              </div>
              <h4 style={previewTitleStyle}>{activePiece?.title ?? ''}</h4>
              <p style={previewTextStyle}>
                {activePiece?.text ?? ''}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
