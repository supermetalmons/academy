import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import Link from '@docusaurus/Link';
import {getPieceDetailPathByTitle} from '@site/src/data/pieceDetails';

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
const PREVIEW_BELOW_RESTORE_HYSTERESIS_PX = 42;
const THIN_RESOURCE_PREVIEW_Y_OFFSET_PX = -25;
const ACTIVE_PIECE_SCALE = 1.22;
const SCALE_ANIMATION_MS = 220;
const PUZZLE_RESET_ANIMATION_MS = 200;
const WAVE_PIXEL = 1 / 32;
const WAVE_FRAME_COUNT = 9;
const WAVE_FRAME_MS = 200;
const SPAWN_GHOST_SCALE = 0.76;
const SPAWN_GHOST_OPACITY = 0.34;
const PUZZLE_START_GHOST_SCALE = 0.56;
const PUZZLE_START_GHOST_OPACITY = 0.2;
const HELD_MANA_SCALE = 0.9;
const HELD_MANA_OFFSET_X_PX = 11;
const HELD_MANA_OFFSET_Y_PX = 6;
const HELD_SUPER_MANA_SCALE_MULTIPLIER = 0.77;
const HELD_SUPER_MANA_OFFSET_X_PX = -19;
const HELD_SUPER_MANA_OFFSET_Y_PX = -26;
const HELD_BOMB_SCALE_MULTIPLIER = 0.55;
const HELD_BOMB_OFFSET_X_PX = -11;
const HELD_BOMB_OFFSET_Y_PX = -7;
const RESET_SCORED_MANA_FADE_MS = 260;
const RESET_GHOST_FADE_MS = 260;
const HUD_SCORE_X_OFFSET_PX = 5;
const SCORED_MANA_FADE_OUT_MS = 320;
const SCORED_MANA_FADE_OUT_HOLD_MS = 70;
const MANA_POOL_PULSE_MS = 620;
const DEFAULT_ATTACK_INDICATOR_COLOR = '#8A0B0B';
const SPIRIT_ABILITY_INDICATOR_COLOR = '#B14CFF';
const ANGEL_PROTECTION_ZONE_COLOR = '#B14CFF';
const ANGEL_PROTECTION_ZONE_FADE_MS = 240;
const ANGEL_PROTECTION_ZONE_PULSE_MS = 1400;
const BOMB_RANGE_ZONE_COLOR = '#C61A1A';
const BOMB_RANGE_ZONE_FADE_MS = 220;
const BOMB_RANGE_ZONE_PULSE_MS = 1300;
const ITEM_SPARKLE_LIGHT_COLOR = '#FEFEFE';
const ITEM_SPARKLE_DARK_COLOR = '#000000';
const ITEM_SPARKLE_PARTICLES_PER_TILE = 7;
const ATTACK_EFFECT_DURATION_MS = 820;
const ATTACK_EFFECT_CLEANUP_BUFFER_MS = 80;
const DEMON_ATTACK_PARTICLE_COLORS = ['#FFB347', '#FF7A00', '#FF4300', '#FFD06E'];
const MYSTIC_ATTACK_PARTICLE_COLORS = ['#D9F4FF', '#97E8FF', '#61CCFF', '#9EE3FF'];
const BOMB_FLAME_PARTICLE_COLORS = ['#FFEFB0', '#FFD36A', '#FFAA3A', '#FF6E1F', '#F6400A'];
const BOMB_SMOKE_PARTICLE_COLORS = ['#F1ECE3', '#B3AAA0', '#868079', '#5D5955', '#3A3836'];
const FULLSCREEN_SCALE_MARGIN = 0.96;
const FULLSCREEN_HUD_VERTICAL_OFFSET_PX = 10;
const FULLSCREEN_THIN_HUD_MAX_WIDTH_PX = 860;
const FULLSCREEN_THIN_TOP_HUD_EXTRA_OFFSET_PX = -20;
const FULLSCREEN_THIN_BOTTOM_HUD_EXTRA_OFFSET_PX = 15;
const FULLSCREEN_THIN_OVERSCAN_PX = 40;
const FULLSCREEN_BUTTON_HITBOX_EXTRA_PX = 10;
const THIN_HUD_SIDE_SAFE_INSET_PX = 18;
const THIN_HUD_FULLSCREEN_SIDE_EXTRA_INSET_PX = 12;
const THIN_HUD_ACTION_BUTTON_SCALE = 1.32;
const THIN_HUD_ACTION_BUTTON_MIN_PX = 10;
const THIN_HUD_ACTION_RIGHT_INSET_PX = 14;
const THIN_HUD_ACTION_HITBOX_EXTRA_PX = 10;
const THIN_HUD_ACTION_RIGHT_INSET_MIN_PX = 4;
const HUD_FULLSCREEN_BUTTON_GAP_TO_RESET_PX = 10;

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

export const boardAssets = {
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
  bomb: '/assets/mons/bomb.png',
  potion: '/assets/mons/potion.png',
  bombOrPotion: '/assets/mons/bombOrPotion.png',
  supermana: '/assets/mons/supermana.png',
  supermanaSimple: '/assets/mons/supermanaSimple.png',
};

const moveResourceAssets = {
  statusMove: '/assets/mons/resources/statusMove.webp',
  statusAction: '/assets/mons/resources/statusAction.webp',
  statusPotion: '/assets/mons/resources/statusPotion.webp',
  statusMana: '/assets/mons/resources/statusMana.webp',
};

const hudAvatarAssets = {
  opponent: 'https://assets.mons.link/emojipack/1.webp',
  player: 'https://assets.mons.link/emojipack/2.webp',
};

type MoveResourceKey = 'statusMove' | 'statusAction' | 'statusMana';
type HudResourceKey = MoveResourceKey | 'statusPotion';

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

const defaultBlackManaPositions: Array<[number, number]> = [
  [4, 3],
  [6, 3],
  [3, 4],
  [5, 4],
  [7, 4],
];

const defaultWhiteManaPositions: Array<[number, number]> = [
  [3, 6],
  [5, 6],
  [7, 6],
  [4, 7],
  [6, 7],
];

const defaultSuperManaPositions: Array<[number, number]> = [[5, 5]];
const CENTER_SUPER_MANA_TILE_COL = 5;
const CENTER_SUPER_MANA_TILE_ROW = 5;

function toTileKey(col: number, row: number): string {
  return `${row}-${col}`;
}

function isCenterSuperManaTile(col: number, row: number): boolean {
  return col === CENTER_SUPER_MANA_TILE_COL && row === CENTER_SUPER_MANA_TILE_ROW;
}

type MonType = keyof typeof boardAssets.white;
type BoardScaleGroup = 'whiteMana' | 'blackMana' | 'item' | MonType;
export type SuperMetalMonsBoardPreset = 'default' | 'puzzle1' | 'puzzle2' | 'puzzle3' | 'puzzle4';
type BoardPresetItemKind = 'bombOrPotion' | 'bomb' | 'potion';
type BoardPresetMonPlacement = {
  col: number;
  row: number;
  side: 'black' | 'white';
  type: MonType;
};
type BoardPresetPickupPlacement = {
  col: number;
  row: number;
  kind: BoardPresetItemKind;
};
type BoardPresetConfig = {
  mons: BoardPresetMonPlacement[];
  whiteMana: Array<[number, number]>;
  blackMana: Array<[number, number]>;
  superMana: Array<[number, number]>;
  pickupItems: BoardPresetPickupPlacement[];
  initialScores?: {
    white: number;
    black: number;
  };
};

const boardPresetConfigs: Record<SuperMetalMonsBoardPreset, BoardPresetConfig> = {
  default: {
    mons: [
      {col: 3, row: 0, side: 'black', type: 'mystic'},
      {col: 4, row: 0, side: 'black', type: 'spirit'},
      {col: 5, row: 0, side: 'black', type: 'drainer'},
      {col: 6, row: 0, side: 'black', type: 'angel'},
      {col: 7, row: 0, side: 'black', type: 'demon'},
      {col: 3, row: 10, side: 'white', type: 'demon'},
      {col: 4, row: 10, side: 'white', type: 'angel'},
      {col: 5, row: 10, side: 'white', type: 'drainer'},
      {col: 6, row: 10, side: 'white', type: 'spirit'},
      {col: 7, row: 10, side: 'white', type: 'mystic'},
    ],
    whiteMana: defaultWhiteManaPositions,
    blackMana: defaultBlackManaPositions,
    superMana: defaultSuperManaPositions,
    pickupItems: pickupPositions.map(([col, row]) => ({col, row, kind: 'bombOrPotion'})),
  },
  puzzle1: {
    mons: [
      {col: 0, row: 0, side: 'black', type: 'mystic'},
      {col: 5, row: 1, side: 'black', type: 'angel'},
      {col: 4, row: 1, side: 'black', type: 'demon'},
      {col: 3, row: 2, side: 'black', type: 'spirit'},
      {col: 8, row: 4, side: 'black', type: 'drainer'},
      {col: 2, row: 4, side: 'white', type: 'spirit'},
      {col: 2, row: 1, side: 'white', type: 'mystic'},
      {col: 0, row: 6, side: 'white', type: 'drainer'},
      {col: 3, row: 4, side: 'white', type: 'demon'},
      {col: 1, row: 0, side: 'white', type: 'angel'},
    ],
    whiteMana: [
      [5, 2],
      [2, 5],
      [8, 8],
      [8, 9],
    ],
    blackMana: [
      [2, 2],
      [4, 3],
    ],
    superMana: [],
    pickupItems: [],
    initialScores: {
      white: 3,
      black: 4,
    },
  },
  puzzle2: {
    mons: [
      {col: 10, row: 0, side: 'black', type: 'demon'},
      {col: 7, row: 1, side: 'black', type: 'angel'},
      {col: 2, row: 2, side: 'black', type: 'spirit'},
      {col: 6, row: 2, side: 'black', type: 'drainer'},
      {col: 8, row: 2, side: 'black', type: 'mystic'},
      {col: 10, row: 2, side: 'white', type: 'drainer'},
      {col: 10, row: 1, side: 'white', type: 'mystic'},
      {col: 3, row: 2, side: 'white', type: 'spirit'},
      {col: 9, row: 4, side: 'white', type: 'demon'},
      {col: 4, row: 3, side: 'white', type: 'angel'},
    ],
    whiteMana: [
      [8, 1],
      [8, 1],
    ],
    blackMana: [
      [5, 4],
      [5, 4],
    ],
    superMana: [[5, 5]],
    pickupItems: [],
    initialScores: {
      white: 3,
      black: 3,
    },
  },
  puzzle3: {
    mons: [
      {col: 0, row: 0, side: 'black', type: 'drainer'},
      {col: 9, row: 1, side: 'black', type: 'angel'},
      {col: 1, row: 2, side: 'black', type: 'spirit'},
      {col: 9, row: 2, side: 'black', type: 'demon'},
      {col: 10, row: 2, side: 'black', type: 'mystic'},
      {col: 6, row: 8, side: 'white', type: 'drainer'},
      {col: 8, row: 9, side: 'white', type: 'mystic'},
      {col: 8, row: 10, side: 'white', type: 'spirit'},
      {col: 8, row: 7, side: 'white', type: 'demon'},
      {col: 7, row: 7, side: 'white', type: 'angel'},
    ],
    whiteMana: [
      [4, 3],
      [7, 8],
      [6, 8],
    ],
    blackMana: [
      [1, 1],
      [9, 7],
      [10, 7],
    ],
    superMana: [[6, 6]],
    pickupItems: [],
    initialScores: {
      white: 2,
      black: 2,
    },
  },
  puzzle4: {
    mons: [
      {col: 3, row: 0, side: 'black', type: 'mystic'},
      {col: 6, row: 1, side: 'black', type: 'demon'},
      {col: 8, row: 3, side: 'black', type: 'angel'},
      {col: 10, row: 3, side: 'black', type: 'spirit'},
      {col: 9, row: 4, side: 'black', type: 'drainer'},
      {col: 2, row: 6, side: 'white', type: 'drainer'},
      {col: 3, row: 5, side: 'white', type: 'mystic'},
      {col: 3, row: 6, side: 'white', type: 'spirit'},
      {col: 2, row: 5, side: 'white', type: 'demon'},
      {col: 10, row: 10, side: 'white', type: 'angel'},
    ],
    whiteMana: [
      [7, 6],
      [2, 6],
    ],
    blackMana: [
      [2, 1],
      [3, 3],
    ],
    superMana: [[6, 4]],
    pickupItems: [{col: 0, row: 5, kind: 'bombOrPotion'}],
    initialScores: {
      white: 3,
      black: 3,
    },
  },
};

const monSpawnOwnershipByTileKey = boardPresetConfigs.default.mons.reduce<Record<string, {side: 'black' | 'white'; type: MonType}>>(
  (result, mon) => {
    result[toTileKey(mon.col, mon.row)] = {
      side: mon.side,
      type: mon.type,
    };
    return result;
  },
  {},
);

const monSpawnTileBySideAndType = boardPresetConfigs.default.mons.reduce<Record<string, {col: number; row: number}>>(
  (result, mon) => {
    result[`${mon.side}-${mon.type}`] = {
      col: mon.col,
      row: mon.row,
    };
    return result;
  },
  {},
);
const gameSpawnGhostTileKeySet = new Set(
  boardPresetConfigs.default.mons.map((mon) => toTileKey(mon.col, mon.row)),
);

const topCornerManaPoolTileKeys = new Set([
  toTileKey(0, 0),
  toTileKey(10, 0),
]);
const cornerManaPoolTileKeySet = new Set(
  cornerManaPoolPositions.map(([col, row]) => toTileKey(col, row)),
);

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

const boardPieceImageStyle: CSSProperties = {
  imageRendering: 'crisp-edges',
  pointerEvents: 'none',
};

type SuperMetalMonsBoardProps = {
  align?: 'center' | 'left';
  showHoverPreview?: boolean;
  showMoveResources?: boolean;
  showPlayerHud?: boolean;
  enableHoverClickScaling?: boolean;
  boardPreset?: SuperMetalMonsBoardPreset;
  showSpawnGhosts?: boolean;
  enableFreeTileMove?: boolean;
  onPuzzleBoardDirtyChange?: (isDirty: boolean) => void;
  onRenderWidthChange?: (width: number) => void;
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

type ItemSparkleParticle = {
  id: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  driftY: number;
  durationMs: number;
  delayMs: number;
};

type PreviewContent = {
  kind: 'image' | 'manaPool';
  title: string;
  text: string;
  href?: string;
  detailPath?: string;
};

type BoardEntityKind = 'mon' | 'whiteMana' | 'blackMana' | 'superMana' | 'item';
type HeldItemKind = 'bomb';

type BoardEntity = {
  id: string;
  kind: BoardEntityKind;
  col: number;
  row: number;
  href: string;
  side?: 'black' | 'white';
  monType?: MonType;
  carriedByDrainerId?: string;
  heldItemKind?: HeldItemKind;
  isScored?: boolean;
};

type ResetAnimationStep = {
  fromCol: number;
  fromRow: number;
  toCol: number;
  toRow: number;
};

type ResetAnimationState = {
  startedAtMs: number;
  durationMs: number;
  byId: Record<string, ResetAnimationStep>;
};

type PersistedPuzzleBoardState = {
  boardEntities: BoardEntity[];
  playerScore: number;
  opponentScore: number;
  playerPotionCount: number;
  faintedMonIds?: string[];
};

type PendingItemPickupChoice = {
  monId: string;
  itemId: string;
  targetCol: number;
  targetRow: number;
};

type PendingDemonRebound = {
  attackerId: string;
  targetId: string;
  sourceCol: number;
  sourceRow: number;
  targetCol: number;
  targetRow: number;
  targetSpawnCol: number;
  targetSpawnRow: number;
  reboundOptions: Array<{col: number; row: number}>;
};

type PendingSpiritPush = {
  spiritId: string;
  targetId: string;
  sourceCol: number;
  sourceRow: number;
  destinationOptions: Array<{col: number; row: number}>;
};

type ScoredManaFadeSprite = {
  id: string;
  href: string;
  col: number;
  row: number;
  isFading: boolean;
};

type ManaPoolPulseSprite = {
  id: string;
  col: number;
  row: number;
  isExpanding: boolean;
};

type AttackEffectKind = 'demon' | 'mystic' | 'bomb';

type AttackEffectSprite = {
  id: string;
  seq: number;
  kind: AttackEffectKind;
  col: number;
  row: number;
  progress: number;
};

type AttackBurstParticle = {
  dx: number;
  dy: number;
  size: number;
  delayMs: number;
  durationMs: number;
  color: string;
  opacity: number;
};

type AngelProtectionZone = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type RenderedAngelProtectionZone = AngelProtectionZone & {
  status: 'entering' | 'active' | 'leaving';
};

type BombRangeZone = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type RenderedBombRangeZone = BombRangeZone & {
  status: 'entering' | 'active' | 'leaving';
};

const persistedPuzzleBoardStateByPreset = new Map<
  SuperMetalMonsBoardPreset,
  PersistedPuzzleBoardState
>();

function cloneBoardEntities(entities: BoardEntity[]): BoardEntity[] {
  return entities.map((entity) => ({...entity}));
}

function canEntityMoveToTile(entity: BoardEntity, targetCol: number, targetRow: number): boolean {
  if (isCenterSuperManaTile(targetCol, targetRow)) {
    if (entity.kind === 'mon') {
      return entity.monType === 'drainer';
    }
    if (entity.kind === 'superMana') {
      return true;
    }
    if (entity.kind === 'whiteMana' || entity.kind === 'blackMana') {
      return false;
    }
  }

  const spawnOwner = monSpawnOwnershipByTileKey[toTileKey(targetCol, targetRow)];
  if (spawnOwner === undefined) {
    return true;
  }
  if (
    entity.kind !== 'mon' ||
    entity.side === undefined ||
    entity.monType === undefined
  ) {
    return false;
  }
  return entity.side === spawnOwner.side && entity.monType === spawnOwner.type;
}

function isManaEntityKind(
  kind: BoardEntityKind,
): kind is 'whiteMana' | 'blackMana' | 'superMana' {
  return kind === 'whiteMana' || kind === 'blackMana' || kind === 'superMana';
}

function getManaScorePoints(kind: BoardEntityKind): number {
  if (kind === 'whiteMana') {
    return 1;
  }
  if (kind === 'blackMana' || kind === 'superMana') {
    return 2;
  }
  return 0;
}

function getBlackDrainerManaScorePoints(kind: BoardEntityKind): number {
  if (kind === 'blackMana') {
    return 1;
  }
  if (kind === 'whiteMana' || kind === 'superMana') {
    return 2;
  }
  return 0;
}

function getScoredManaEntityIdSet(entities: BoardEntity[]): Set<string> {
  return new Set(
    entities
      .filter((entity) => entity.isScored && isManaEntityKind(entity.kind))
      .map((entity) => entity.id),
  );
}

function getPersistedPuzzleBoardState(
  boardPreset: SuperMetalMonsBoardPreset,
  initialEntities: BoardEntity[],
): PersistedPuzzleBoardState | null {
  const persisted = persistedPuzzleBoardStateByPreset.get(boardPreset);
  if (persisted === undefined) {
    return null;
  }
  if (persisted.boardEntities.length !== initialEntities.length) {
    return null;
  }
  const initialEntityIdSet = new Set(initialEntities.map((entity) => entity.id));
  const isCompatible = persisted.boardEntities.every((entity) =>
    initialEntityIdSet.has(entity.id),
  );
  if (!isCompatible) {
    return null;
  }
  return persisted;
}

function getPlayerStartingPotionCount(boardPreset: SuperMetalMonsBoardPreset): number {
  if (boardPreset === 'puzzle1') {
    return 1;
  }
  if (boardPreset === 'puzzle2') {
    return 2;
  }
  if (boardPreset === 'puzzle3') {
    return 1;
  }
  if (boardPreset === 'puzzle4') {
    return 1;
  }
  return 0;
}

function getOpponentStartingPotionCount(boardPreset: SuperMetalMonsBoardPreset): number {
  if (boardPreset === 'puzzle1') {
    return 1;
  }
  return 0;
}

function getMonSpawnTile(side: 'black' | 'white', monType: MonType): {col: number; row: number} | null {
  return monSpawnTileBySideAndType[`${side}-${monType}`] ?? null;
}

function dropFaintedDrainerCarriedMana(
  currentEntities: BoardEntity[],
  nextEntities: BoardEntity[],
  faintedMonId: string,
  faintedMonType: MonType,
  faintedCol: number,
  faintedRow: number,
): void {
  if (faintedMonType !== 'drainer') {
    return;
  }
  const carriedManaIndex = currentEntities.findIndex(
    (entity) =>
      !entity.isScored &&
      entity.carriedByDrainerId === faintedMonId &&
      (entity.kind === 'whiteMana' ||
        entity.kind === 'blackMana' ||
        entity.kind === 'superMana'),
  );
  if (carriedManaIndex === -1) {
    return;
  }
  const carriedMana = currentEntities[carriedManaIndex];
  if (
    carriedMana.kind !== 'whiteMana' &&
    carriedMana.kind !== 'blackMana' &&
    carriedMana.kind !== 'superMana'
  ) {
    return;
  }
  if (carriedMana.kind === 'superMana') {
    const centerDrainer = nextEntities.find(
      (entity) =>
        entity.kind === 'mon' &&
        entity.monType === 'drainer' &&
        entity.side !== undefined &&
        entity.col === CENTER_SUPER_MANA_TILE_COL &&
        entity.row === CENTER_SUPER_MANA_TILE_ROW,
    );
    const centerDrainerHasCarriedMana =
      centerDrainer !== undefined &&
      nextEntities.some(
        (entity) =>
          !entity.isScored &&
          entity.carriedByDrainerId === centerDrainer.id &&
          (entity.kind === 'whiteMana' ||
            entity.kind === 'blackMana' ||
            entity.kind === 'superMana'),
      );
    nextEntities[carriedManaIndex] = {
      ...carriedMana,
      col: CENTER_SUPER_MANA_TILE_COL,
      row: CENTER_SUPER_MANA_TILE_ROW,
      carriedByDrainerId:
        centerDrainer !== undefined && !centerDrainerHasCarriedMana
          ? centerDrainer.id
          : undefined,
    };
    return;
  }
  nextEntities[carriedManaIndex] = {
    ...carriedMana,
    col: faintedCol,
    row: faintedRow,
    carriedByDrainerId: undefined,
  };
}

function getTwoStepOrthogonalMiddleTile(
  sourceCol: number,
  sourceRow: number,
  targetCol: number,
  targetRow: number,
): {col: number; row: number} | null {
  const deltaCol = targetCol - sourceCol;
  const deltaRow = targetRow - sourceRow;
  if (Math.abs(deltaCol) === 2 && deltaRow === 0) {
    return {col: sourceCol + deltaCol / 2, row: sourceRow};
  }
  if (Math.abs(deltaRow) === 2 && deltaCol === 0) {
    return {col: sourceCol, row: sourceRow + deltaRow / 2};
  }
  return null;
}

function isMonOnOwnSpawn(mon: {
  col: number;
  row: number;
  type: MonType;
  side: 'black' | 'white';
}): boolean {
  const spawnOwner = monSpawnOwnershipByTileKey[toTileKey(mon.col, mon.row)];
  return spawnOwner?.side === mon.side && spawnOwner.type === mon.type;
}

export function buildBoardEntitiesFromPreset(preset: SuperMetalMonsBoardPreset): BoardEntity[] {
  const presetConfig = boardPresetConfigs[preset];
  const entities: BoardEntity[] = [];
  presetConfig.mons.forEach((mon, index) => {
    entities.push({
      id: `mon-${preset}-${index}`,
      kind: 'mon',
      col: mon.col,
      row: mon.row,
      side: mon.side,
      monType: mon.type,
      href: mon.side === 'black' ? boardAssets.black[mon.type] : boardAssets.white[mon.type],
    });
  });
  presetConfig.whiteMana.forEach(([col, row], index) => {
    entities.push({
      id: `white-mana-${preset}-${index}`,
      kind: 'whiteMana',
      col,
      row,
      href: boardAssets.mana,
    });
  });
  presetConfig.blackMana.forEach(([col, row], index) => {
    entities.push({
      id: `black-mana-${preset}-${index}`,
      kind: 'blackMana',
      col,
      row,
      href: boardAssets.manaB,
    });
  });
  presetConfig.superMana.forEach(([col, row], index) => {
    entities.push({
      id: `super-mana-${preset}-${index}`,
      kind: 'superMana',
      col,
      row,
      href: boardAssets.supermana,
    });
  });
  presetConfig.pickupItems.forEach((item, index) => {
    entities.push({
      id: `item-${preset}-${index}`,
      kind: 'item',
      col: item.col,
      row: item.row,
      href: boardAssets[item.kind],
    });
  });

  if (preset === 'puzzle2') {
    const blackDrainer = entities.find(
      (entity) =>
        entity.kind === 'mon' &&
        entity.side === 'black' &&
        entity.monType === 'drainer',
    );
    const whiteDrainer = entities.find(
      (entity) =>
        entity.kind === 'mon' &&
        entity.side === 'white' &&
        entity.monType === 'drainer',
    );
    const blackMana = entities.find((entity) => entity.kind === 'blackMana');
    const whiteMana = entities.find((entity) => entity.kind === 'whiteMana');
    if (whiteDrainer !== undefined && blackMana !== undefined) {
      blackMana.carriedByDrainerId = whiteDrainer.id;
    }
    if (blackDrainer !== undefined && whiteMana !== undefined) {
      whiteMana.carriedByDrainerId = blackDrainer.id;
    }
  }
  if (preset === 'puzzle3' || preset === 'puzzle4') {
    const whiteDrainer = entities.find(
      (entity) =>
        entity.kind === 'mon' &&
        entity.side === 'white' &&
        entity.monType === 'drainer',
    );
    if (preset === 'puzzle3') {
      const blackMystic = entities.find(
        (entity) =>
          entity.kind === 'mon' &&
          entity.side === 'black' &&
          entity.monType === 'mystic',
      );
      if (blackMystic !== undefined) {
        blackMystic.heldItemKind = 'bomb';
      }
    }
    if (whiteDrainer !== undefined) {
      const heldWhiteMana = entities.find(
        (entity) =>
          entity.kind === 'whiteMana' &&
          entity.col === whiteDrainer.col &&
          entity.row === whiteDrainer.row,
      );
      if (heldWhiteMana !== undefined) {
        heldWhiteMana.carriedByDrainerId = whiteDrainer.id;
      }
    }
  }

  return entities;
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

function createCornerWaveLines(seed: number): CornerWaveLine[] {
  const random = mulberry32(seed);
  const lines: CornerWaveLine[] = [];
  const lineCount = 10;
  const usableYStart = 0.11;
  const usableYEnd = 0.89;
  const baseStep = (usableYEnd - usableYStart) / Math.max(1, lineCount - 1);
  for (let i = 0; i < lineCount; i += 1) {
    const width = (Math.floor(random() * 5) + 2) * WAVE_PIXEL;
    const jitter = (random() - 0.5) * baseStep * 1.45;
    const snappedY =
      Math.round((usableYStart + baseStep * i + jitter) / WAVE_PIXEL) * WAVE_PIXEL;
    const y = Math.max(WAVE_PIXEL, Math.min(1 - WAVE_PIXEL * 2, snappedY));
    lines.push({
      x: random() * (1 - width),
      width,
      y,
      color: random() > 0.5 ? colors.wave1 : colors.wave2,
    });
  }
  return lines.sort((a, b) => a.y - b.y);
}

function createItemSparkleParticles(seed: number): ItemSparkleParticle[] {
  const random = mulberry32(seed);
  const particles: ItemSparkleParticle[] = [];
  for (let i = 0; i < ITEM_SPARKLE_PARTICLES_PER_TILE; i += 1) {
    const y = 0.2 + random() * 0.75;
    particles.push({
      id: `sparkle-${i}`,
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

function createDemonAttackParticles(seed: number): AttackBurstParticle[] {
  const random = mulberry32(seed);
  const particles: AttackBurstParticle[] = [];
  const count = 16;
  for (let i = 0; i < count; i += 1) {
    const angle = random() * Math.PI * 2;
    const distance = 0.34 + random() * 1.02;
    particles.push({
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      size: 0.1 + random() * 0.14,
      delayMs: random() * 95,
      durationMs: 230 + random() * 220,
      color:
        DEMON_ATTACK_PARTICLE_COLORS[
          Math.floor(random() * DEMON_ATTACK_PARTICLE_COLORS.length)
        ],
      opacity: 0.62 + random() * 0.34,
    });
  }
  return particles;
}

function createMysticAttackParticles(seed: number): AttackBurstParticle[] {
  const random = mulberry32(seed);
  const particles: AttackBurstParticle[] = [];
  const count = 14;
  for (let i = 0; i < count; i += 1) {
    const angle = random() * Math.PI * 2;
    const distance = 0.42 + random() * 1.16;
    particles.push({
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      size: 0.04 + random() * 0.09,
      delayMs: random() * 80,
      durationMs: 240 + random() * 220,
      color:
        MYSTIC_ATTACK_PARTICLE_COLORS[
          Math.floor(random() * MYSTIC_ATTACK_PARTICLE_COLORS.length)
        ],
      opacity: 0.66 + random() * 0.3,
    });
  }
  return particles;
}

function createBombFlameParticles(seed: number): AttackBurstParticle[] {
  const random = mulberry32(seed);
  const particles: AttackBurstParticle[] = [];
  const count = 20;
  for (let i = 0; i < count; i += 1) {
    const angle = random() * Math.PI * 2;
    const distance = 0.36 + random() * 1.42;
    particles.push({
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      size: 0.08 + random() * 0.18,
      delayMs: random() * 62,
      durationMs: 190 + random() * 220,
      color:
        BOMB_FLAME_PARTICLE_COLORS[
          Math.floor(random() * BOMB_FLAME_PARTICLE_COLORS.length)
        ],
      opacity: 0.75 + random() * 0.25,
    });
  }
  return particles;
}

function createBombSmokeParticles(seed: number): AttackBurstParticle[] {
  const random = mulberry32(seed);
  const particles: AttackBurstParticle[] = [];
  const count = 16;
  for (let i = 0; i < count; i += 1) {
    const angle = random() * Math.PI * 2;
    const distance = 0.18 + random() * 1.12;
    particles.push({
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      size: 0.12 + random() * 0.24,
      delayMs: 35 + random() * 210,
      durationMs: 340 + random() * 360,
      color:
        BOMB_SMOKE_PARTICLE_COLORS[
          Math.floor(random() * BOMB_SMOKE_PARTICLE_COLORS.length)
        ],
      opacity: 0.38 + random() * 0.38,
    });
  }
  return particles;
}

function clamp01(value: number): number {
  if (value <= 0) {
    return 0;
  }
  if (value >= 1) {
    return 1;
  }
  return value;
}

function easeOutCubic(value: number): number {
  const t = clamp01(value);
  return 1 - Math.pow(1 - t, 3);
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

function animateHudScoreValue(node: HTMLSpanElement | null): void {
  if (node === null || typeof node.animate !== 'function') {
    return;
  }
  node.getAnimations().forEach((animation) => {
    animation.cancel();
  });
  node.animate(
    [
      {transform: `translateX(${HUD_SCORE_X_OFFSET_PX}px) translateY(0px) scale(1)`},
      {transform: `translateX(${HUD_SCORE_X_OFFSET_PX}px) translateY(-2px) scale(1.28)`},
      {transform: `translateX(${HUD_SCORE_X_OFFSET_PX}px) translateY(0px) scale(1)`},
    ],
    {
      duration: 880,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'none',
    },
  );
}

export default function SuperMetalMonsBoard({
  align = 'center',
  showHoverPreview = false,
  showMoveResources = false,
  showPlayerHud = false,
  enableHoverClickScaling = true,
  boardPreset = 'default',
  showSpawnGhosts = false,
  enableFreeTileMove = false,
  onPuzzleBoardDirtyChange,
  onRenderWidthChange,
}: SuperMetalMonsBoardProps): ReactNode {
  const playerStartingPotionCount = getPlayerStartingPotionCount(boardPreset);
  const opponentStartingPotionCount = getOpponentStartingPotionCount(boardPreset);
  const isSandboxFreeMoveBoard = enableFreeTileMove && boardPreset === 'default';
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const boardRowRef = useRef<HTMLDivElement | null>(null);
  const boardContainerRef = useRef<HTMLDivElement | null>(null);
  const boardSvgRef = useRef<SVGSVGElement | null>(null);
  const previewMessageBoxRef = useRef<HTMLDivElement | null>(null);
  const thinHintRowRef = useRef<HTMLParagraphElement | null>(null);
  const thinHintContentRef = useRef<HTMLSpanElement | null>(null);
  const moveResourceButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const resetIconRef = useRef<SVGSVGElement | null>(null);
  const opponentScoreRef = useRef<HTMLSpanElement | null>(null);
  const playerScoreRef = useRef<HTMLSpanElement | null>(null);
  const scoredManaFadeFrameByIdRef = useRef<Record<string, number>>({});
  const scoredManaFadeTimeoutByIdRef = useRef<Record<string, number>>({});
  const manaPoolPulseFrameByIdRef = useRef<Record<string, number>>({});
  const manaPoolPulseTimeoutByIdRef = useRef<Record<string, number>>({});
  const manaPoolPulseCounterRef = useRef(0);
  const attackEffectCounterRef = useRef(0);
  const attackEffectFrameByIdRef = useRef<Record<string, number>>({});
  const attackEffectTimeoutByIdRef = useRef<Record<string, number>>({});
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
  const [thinHintScale, setThinHintScale] = useState(1);
  const [isBoardFullscreen, setIsBoardFullscreen] = useState(false);
  const [isFullscreenThinHudMode, setIsFullscreenThinHudMode] = useState(false);
  const [isFullscreenButtonHovered, setIsFullscreenButtonHovered] = useState(false);
  const [fullscreenScale, setFullscreenScale] = useState(1);
  const [resetAnimation, setResetAnimation] = useState<ResetAnimationState | null>(null);
  const [resetAnimationProgress, setResetAnimationProgress] = useState(1);
  const initialBoardEntities = useMemo(
    () => buildBoardEntitiesFromPreset(boardPreset),
    [boardPreset],
  );
  const initialScores = useMemo(
    () => boardPresetConfigs[boardPreset].initialScores ?? {white: 0, black: 0},
    [boardPreset],
  );
  const initialPersistedPuzzleState = useMemo(
    () =>
      enableFreeTileMove
        ? getPersistedPuzzleBoardState(boardPreset, initialBoardEntities)
        : null,
    [boardPreset, enableFreeTileMove, initialBoardEntities],
  );
  const [playerScore, setPlayerScore] = useState(
    initialPersistedPuzzleState?.playerScore ?? initialScores.white,
  );
  const [opponentScore, setOpponentScore] = useState(
    initialPersistedPuzzleState?.opponentScore ?? initialScores.black,
  );
  const lastAnimatedOpponentScoreRef = useRef<number>(
    initialPersistedPuzzleState?.opponentScore ?? initialScores.black,
  );
  const lastAnimatedPlayerScoreRef = useRef<number>(
    initialPersistedPuzzleState?.playerScore ?? initialScores.white,
  );
  const [scoredManaFadeSpritesById, setScoredManaFadeSpritesById] = useState<
    Record<string, ScoredManaFadeSprite>
  >({});
  const [manaPoolPulseSprites, setManaPoolPulseSprites] = useState<ManaPoolPulseSprite[]>([]);
  const [attackEffectSprites, setAttackEffectSprites] = useState<AttackEffectSprite[]>([]);
  const [renderedAngelProtectionZones, setRenderedAngelProtectionZones] = useState<
    RenderedAngelProtectionZone[]
  >([]);
  const [renderedBombRangeZones, setRenderedBombRangeZones] = useState<
    RenderedBombRangeZone[]
  >([]);
  const [playerPotionCount, setPlayerPotionCount] = useState(
    initialPersistedPuzzleState?.playerPotionCount ?? playerStartingPotionCount,
  );
  const [faintedMonIdSet, setFaintedMonIdSet] = useState<Set<string>>(
    () =>
      isSandboxFreeMoveBoard
        ? new Set(initialPersistedPuzzleState?.faintedMonIds ?? [])
        : new Set(),
  );
  const [pendingItemPickupChoice, setPendingItemPickupChoice] =
    useState<PendingItemPickupChoice | null>(null);
  const [pendingDemonRebound, setPendingDemonRebound] =
    useState<PendingDemonRebound | null>(null);
  const [pendingSpiritPush, setPendingSpiritPush] =
    useState<PendingSpiritPush | null>(null);
  const [hoveredItemChoice, setHoveredItemChoice] = useState<'bomb' | 'potion' | null>(null);
  const [resetFadeInByEntityId, setResetFadeInByEntityId] = useState<Record<string, boolean>>({});
  const [resetGhostFadeInByTileKey, setResetGhostFadeInByTileKey] = useState<Record<string, boolean>>({});
  const resetFadeFrameRef = useRef<number | null>(null);
  const resetFadeTimeoutRef = useRef<number | null>(null);
  const resetGhostFadeFrameRef = useRef<number | null>(null);
  const resetGhostFadeTimeoutRef = useRef<number | null>(null);
  const previouslyScoredManaIdsRef = useRef<Set<string>>(new Set());
  const previousBoardEntitiesByIdRef = useRef<Map<string, BoardEntity>>(new Map());
  const previewBelowBreakpointWidthRef = useRef<number | null>(null);
  const scaledFactorRef = useRef(1);
  const [waveSeedNonce, setWaveSeedNonce] = useState(1);
  const canUseBoardFullscreen = enableFreeTileMove;
  const selectedTileHighlightClipPathId = useId().replace(/:/g, '');
  const itemSparkleClipPathIdPrefix = useId().replace(/:/g, '');
  const [boardEntities, setBoardEntities] = useState<BoardEntity[]>(
    initialPersistedPuzzleState !== null
      ? cloneBoardEntities(initialPersistedPuzzleState.boardEntities)
      : initialBoardEntities,
  );
  const playerHudResourceOrder: HudResourceKey[] =
    playerPotionCount > 0
      ? moveResourceOrder.flatMap((resourceKind) =>
          resourceKind === 'statusAction'
            ? [
                'statusAction',
                ...Array.from(
                  {length: playerPotionCount},
                  () => 'statusPotion' as const,
                ),
              ]
            : [resourceKind],
        )
      : moveResourceOrder;
  const opponentHudResourceOrder: HudResourceKey[] =
    opponentStartingPotionCount > 0
      ? [
          ...moveResourceOrder,
          ...Array.from(
            {length: opponentStartingPotionCount},
            () => 'statusPotion' as const,
          ),
        ]
      : moveResourceOrder;
  const isResetAnimating = resetAnimation !== null;
  const hasPuzzleBoardChanges = useMemo(() => {
    if (!enableFreeTileMove) {
      return false;
    }
    if (boardEntities.length !== initialBoardEntities.length) {
      return true;
    }
    const initialById = new Map(
      initialBoardEntities.map((entity) => [entity.id, entity]),
    );
    return boardEntities.some((entity) => {
      const initial = initialById.get(entity.id);
      return (
        initial === undefined ||
        initial.col !== entity.col ||
        initial.row !== entity.row ||
        initial.carriedByDrainerId !== entity.carriedByDrainerId ||
        initial.heldItemKind !== entity.heldItemKind ||
        initial.isScored !== entity.isScored
      );
    });
  }, [boardEntities, enableFreeTileMove, initialBoardEntities]);
  useEffect(() => {
    if (onPuzzleBoardDirtyChange === undefined) {
      return;
    }
    onPuzzleBoardDirtyChange(hasPuzzleBoardChanges);
  }, [hasPuzzleBoardChanges, onPuzzleBoardDirtyChange]);

  const markMonAsFaintedOnSpawn = (monId: string): void => {
    if (!isSandboxFreeMoveBoard) {
      return;
    }
    setFaintedMonIdSet((previous) => {
      if (previous.has(monId)) {
        return previous;
      }
      const next = new Set(previous);
      next.add(monId);
      return next;
    });
  };

  const clearScoredManaFadeTimerForId = (entityId: string) => {
    const frameId = scoredManaFadeFrameByIdRef.current[entityId];
    if (frameId !== undefined) {
      window.cancelAnimationFrame(frameId);
      delete scoredManaFadeFrameByIdRef.current[entityId];
    }
    const timeoutId = scoredManaFadeTimeoutByIdRef.current[entityId];
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
      delete scoredManaFadeTimeoutByIdRef.current[entityId];
    }
  };

  const clearAllScoredManaFadeTimers = () => {
    Object.values(scoredManaFadeFrameByIdRef.current).forEach((frameId) => {
      window.cancelAnimationFrame(frameId);
    });
    Object.values(scoredManaFadeTimeoutByIdRef.current).forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    scoredManaFadeFrameByIdRef.current = {};
    scoredManaFadeTimeoutByIdRef.current = {};
  };

  const clearManaPoolPulseTimerForId = (pulseId: string) => {
    const frameId = manaPoolPulseFrameByIdRef.current[pulseId];
    if (frameId !== undefined) {
      window.cancelAnimationFrame(frameId);
      delete manaPoolPulseFrameByIdRef.current[pulseId];
    }
    const timeoutId = manaPoolPulseTimeoutByIdRef.current[pulseId];
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
      delete manaPoolPulseTimeoutByIdRef.current[pulseId];
    }
  };

  const clearAllManaPoolPulseTimers = () => {
    Object.values(manaPoolPulseFrameByIdRef.current).forEach((frameId) => {
      window.cancelAnimationFrame(frameId);
    });
    Object.values(manaPoolPulseTimeoutByIdRef.current).forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    manaPoolPulseFrameByIdRef.current = {};
    manaPoolPulseTimeoutByIdRef.current = {};
  };

  const clearAttackEffectTimerForId = (effectId: string) => {
    const frameId = attackEffectFrameByIdRef.current[effectId];
    if (frameId !== undefined) {
      window.cancelAnimationFrame(frameId);
      delete attackEffectFrameByIdRef.current[effectId];
    }
    const timeoutId = attackEffectTimeoutByIdRef.current[effectId];
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
      delete attackEffectTimeoutByIdRef.current[effectId];
    }
  };

  const clearAllAttackEffectTimers = () => {
    Object.values(attackEffectFrameByIdRef.current).forEach((frameId) => {
      window.cancelAnimationFrame(frameId);
    });
    Object.values(attackEffectTimeoutByIdRef.current).forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    attackEffectFrameByIdRef.current = {};
    attackEffectTimeoutByIdRef.current = {};
  };

  const triggerAttackEffect = (kind: AttackEffectKind, col: number, row: number) => {
    attackEffectCounterRef.current += 1;
    const seq = attackEffectCounterRef.current;
    const id = `attack-effect-${seq}`;
    clearAttackEffectTimerForId(id);
    setAttackEffectSprites((current) => [
      ...current,
      {
        id,
        seq,
        kind,
        col,
        row,
        progress: 0,
      },
    ]);
    const startedAtMs = performance.now();
    const tick = (nowMs: number) => {
      const progress = clamp01((nowMs - startedAtMs) / ATTACK_EFFECT_DURATION_MS);
      setAttackEffectSprites((current) =>
        current.map((effect) =>
          effect.id === id ? {...effect, progress} : effect,
        ),
      );
      if (progress >= 1) {
        delete attackEffectFrameByIdRef.current[id];
        return;
      }
      attackEffectFrameByIdRef.current[id] = window.requestAnimationFrame(tick);
    };
    attackEffectFrameByIdRef.current[id] = window.requestAnimationFrame(tick);
    attackEffectTimeoutByIdRef.current[id] = window.setTimeout(() => {
      setAttackEffectSprites((current) =>
        current.filter((effect) => effect.id !== id),
      );
      delete attackEffectTimeoutByIdRef.current[id];
    }, ATTACK_EFFECT_DURATION_MS + ATTACK_EFFECT_CLEANUP_BUFFER_MS);
  };

  const triggerScoredManaFadeOut = (sprite: {
    id: string;
    href: string;
    col: number;
    row: number;
  }) => {
    clearScoredManaFadeTimerForId(sprite.id);
    setScoredManaFadeSpritesById((current) => ({
      ...current,
      [sprite.id]: {
        ...sprite,
        isFading: false,
      },
    }));
    scoredManaFadeFrameByIdRef.current[sprite.id] = window.requestAnimationFrame(() => {
      setScoredManaFadeSpritesById((current) => {
        const existing = current[sprite.id];
        if (existing === undefined) {
          return current;
        }
        return {
          ...current,
          [sprite.id]: {
            ...existing,
            isFading: true,
          },
        };
      });
      delete scoredManaFadeFrameByIdRef.current[sprite.id];
    });
    scoredManaFadeTimeoutByIdRef.current[sprite.id] = window.setTimeout(() => {
      setScoredManaFadeSpritesById((current) => {
        if (current[sprite.id] === undefined) {
          return current;
        }
        const next = {...current};
        delete next[sprite.id];
        return next;
      });
      delete scoredManaFadeTimeoutByIdRef.current[sprite.id];
    }, SCORED_MANA_FADE_OUT_MS + SCORED_MANA_FADE_OUT_HOLD_MS);
  };

  const triggerManaPoolScorePulse = (col: number, row: number) => {
    manaPoolPulseCounterRef.current += 1;
    const pulseId = `mana-pool-pulse-${manaPoolPulseCounterRef.current}`;
    clearManaPoolPulseTimerForId(pulseId);
    setManaPoolPulseSprites((current) => [
      ...current,
      {
        id: pulseId,
        col,
        row,
        isExpanding: false,
      },
    ]);
    manaPoolPulseFrameByIdRef.current[pulseId] = window.requestAnimationFrame(() => {
      setManaPoolPulseSprites((current) =>
        current.map((pulse) =>
          pulse.id === pulseId ? {...pulse, isExpanding: true} : pulse,
        ),
      );
      delete manaPoolPulseFrameByIdRef.current[pulseId];
    });
    manaPoolPulseTimeoutByIdRef.current[pulseId] = window.setTimeout(() => {
      setManaPoolPulseSprites((current) =>
        current.filter((pulse) => pulse.id !== pulseId),
      );
      clearManaPoolPulseTimerForId(pulseId);
    }, MANA_POOL_PULSE_MS + 80);
  };

  useEffect(() => {
    clearAllScoredManaFadeTimers();
    clearAllManaPoolPulseTimers();
    clearAllAttackEffectTimers();
    if (resetFadeFrameRef.current !== null) {
      window.cancelAnimationFrame(resetFadeFrameRef.current);
      resetFadeFrameRef.current = null;
    }
    if (resetFadeTimeoutRef.current !== null) {
      window.clearTimeout(resetFadeTimeoutRef.current);
      resetFadeTimeoutRef.current = null;
    }
    if (resetGhostFadeFrameRef.current !== null) {
      window.cancelAnimationFrame(resetGhostFadeFrameRef.current);
      resetGhostFadeFrameRef.current = null;
    }
    if (resetGhostFadeTimeoutRef.current !== null) {
      window.clearTimeout(resetGhostFadeTimeoutRef.current);
      resetGhostFadeTimeoutRef.current = null;
    }
    const persistedState =
      enableFreeTileMove
        ? getPersistedPuzzleBoardState(boardPreset, initialBoardEntities)
        : null;
    const nextBoardEntities =
      persistedState !== null
        ? cloneBoardEntities(persistedState.boardEntities)
        : initialBoardEntities;
    setBoardEntities(nextBoardEntities);
    setHoveredTile(null);
    setSelectedTile(null);
    setSelectedMoveResourceId(null);
    setResetAnimation(null);
    setResetAnimationProgress(1);
    setPlayerScore(persistedState?.playerScore ?? initialScores.white);
    setOpponentScore(persistedState?.opponentScore ?? initialScores.black);
    setPlayerPotionCount(
      persistedState?.playerPotionCount ?? playerStartingPotionCount,
    );
    setFaintedMonIdSet(
      isSandboxFreeMoveBoard
        ? new Set(persistedState?.faintedMonIds ?? [])
        : new Set(),
    );
    setPendingItemPickupChoice(null);
    setPendingDemonRebound(null);
    setPendingSpiritPush(null);
    setHoveredItemChoice(null);
    setScoredManaFadeSpritesById({});
    setManaPoolPulseSprites([]);
    setAttackEffectSprites([]);
    setRenderedAngelProtectionZones([]);
    setResetFadeInByEntityId({});
    setResetGhostFadeInByTileKey({});
    previouslyScoredManaIdsRef.current = getScoredManaEntityIdSet(nextBoardEntities);
    previousBoardEntitiesByIdRef.current = new Map(
      nextBoardEntities.map((entity) => [entity.id, entity]),
    );
    lastAnimatedOpponentScoreRef.current =
      persistedState?.opponentScore ?? initialScores.black;
    lastAnimatedPlayerScoreRef.current =
      persistedState?.playerScore ?? initialScores.white;
  }, [
    boardPreset,
    enableFreeTileMove,
    initialBoardEntities,
    initialScores.black,
    initialScores.white,
    isSandboxFreeMoveBoard,
    playerStartingPotionCount,
  ]);

  useEffect(
    () => () => {
      clearAllScoredManaFadeTimers();
      clearAllManaPoolPulseTimers();
      clearAllAttackEffectTimers();
      if (resetFadeFrameRef.current !== null) {
        window.cancelAnimationFrame(resetFadeFrameRef.current);
      }
      if (resetFadeTimeoutRef.current !== null) {
        window.clearTimeout(resetFadeTimeoutRef.current);
      }
      if (resetGhostFadeFrameRef.current !== null) {
        window.cancelAnimationFrame(resetGhostFadeFrameRef.current);
      }
      if (resetGhostFadeTimeoutRef.current !== null) {
        window.clearTimeout(resetGhostFadeTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const nextScoredManaIds = new Set<string>();
    let playerScoreDelta = 0;
    let opponentScoreDelta = 0;
    const previousBoardEntitiesById = previousBoardEntitiesByIdRef.current;
    boardEntities.forEach((entity) => {
      if (!entity.isScored || !isManaEntityKind(entity.kind)) {
        return;
      }
      nextScoredManaIds.add(entity.id);
      if (!previouslyScoredManaIdsRef.current.has(entity.id)) {
        const previousEntity = previousBoardEntitiesById.get(entity.id);
        const previousCarrierId =
          previousEntity !== undefined &&
          isManaEntityKind(previousEntity.kind)
            ? previousEntity.carriedByDrainerId
            : undefined;
        const previousCarrier =
          previousCarrierId !== undefined
            ? previousBoardEntitiesById.get(previousCarrierId)
            : undefined;
        const wasScoredByBlackDrainer =
          previousCarrier !== undefined &&
          previousCarrier.kind === 'mon' &&
          previousCarrier.monType === 'drainer' &&
          previousCarrier.side === 'black';
        if (wasScoredByBlackDrainer) {
          opponentScoreDelta += getBlackDrainerManaScorePoints(entity.kind);
        } else {
          playerScoreDelta += getManaScorePoints(entity.kind);
        }
      }
    });
    previouslyScoredManaIdsRef.current = nextScoredManaIds;
    previousBoardEntitiesByIdRef.current = new Map(
      boardEntities.map((entity) => [entity.id, entity]),
    );
    if (playerScoreDelta > 0) {
      setPlayerScore((prev) => prev + playerScoreDelta);
    }
    if (opponentScoreDelta > 0) {
      setOpponentScore((prev) => prev + opponentScoreDelta);
    }
  }, [boardEntities]);

  useEffect(() => {
    if (!isSandboxFreeMoveBoard) {
      setFaintedMonIdSet((previous) => (previous.size === 0 ? previous : new Set()));
      return;
    }
    setFaintedMonIdSet((previous) => {
      if (previous.size === 0) {
        return previous;
      }
      const boardEntityById = new Map(boardEntities.map((entity) => [entity.id, entity]));
      const next = new Set<string>();
      let removedAny = false;
      previous.forEach((monId) => {
        const entity = boardEntityById.get(monId);
        if (
          entity !== undefined &&
          entity.kind === 'mon' &&
          entity.side !== undefined &&
          entity.monType !== undefined &&
          isMonOnOwnSpawn({
            col: entity.col,
            row: entity.row,
            type: entity.monType,
            side: entity.side,
          })
        ) {
          next.add(monId);
          return;
        }
        removedAny = true;
      });
      return removedAny ? next : previous;
    });
  }, [boardEntities, isSandboxFreeMoveBoard]);

  useEffect(() => {
    if (!enableFreeTileMove) {
      return;
    }
    persistedPuzzleBoardStateByPreset.set(boardPreset, {
      boardEntities: cloneBoardEntities(boardEntities),
      playerScore,
      opponentScore,
      playerPotionCount,
      faintedMonIds: Array.from(faintedMonIdSet),
    });
  }, [
    boardEntities,
    boardPreset,
    enableFreeTileMove,
    faintedMonIdSet,
    opponentScore,
    playerPotionCount,
    playerScore,
  ]);

  useEffect(() => {
    if (lastAnimatedOpponentScoreRef.current === opponentScore) {
      return;
    }
    animateHudScoreValue(opponentScoreRef.current);
    lastAnimatedOpponentScoreRef.current = opponentScore;
  }, [opponentScore]);

  useEffect(() => {
    if (lastAnimatedPlayerScoreRef.current === playerScore) {
      return;
    }
    animateHudScoreValue(playerScoreRef.current);
    lastAnimatedPlayerScoreRef.current = playerScore;
  }, [playerScore]);

  useEffect(() => {
    scaledFactorRef.current = scaledFactor;
  }, [scaledFactor]);

  useEffect(() => {
    // Keep deterministic SSR output, then randomize wave layout per mounted board.
    setWaveSeedNonce(Math.floor(Math.random() * 0x3fffffff) + 1);
  }, []);

  useEffect(() => {
    onRenderWidthChange?.(renderWidth);
  }, [onRenderWidthChange, renderWidth]);

  useEffect(() => {
    if (resetAnimation === null) {
      return;
    }
    let frameId = 0;
    const tick = (now: number) => {
      const elapsedMs = now - resetAnimation.startedAtMs;
      const progress = Math.max(0, Math.min(1, elapsedMs / resetAnimation.durationMs));
      setResetAnimationProgress(progress);
      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
        return;
      }
      setResetAnimation(null);
      setResetAnimationProgress(1);
    };
    frameId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [resetAnimation]);

  useEffect(() => {
    if (canUseBoardFullscreen || !isBoardFullscreen) {
      return;
    }
    setIsBoardFullscreen(false);
  }, [canUseBoardFullscreen, isBoardFullscreen]);

  useEffect(() => {
    if (!isBoardFullscreen) {
      setIsFullscreenButtonHovered(false);
    }
  }, [isBoardFullscreen]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const mediaQuery = window.matchMedia(
      `(max-width: ${FULLSCREEN_THIN_HUD_MAX_WIDTH_PX}px)`,
    );
    const updateMode = () => {
      setIsFullscreenThinHudMode(mediaQuery.matches);
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
    if (!isBoardFullscreen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsBoardFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isBoardFullscreen]);

  useEffect(() => {
    if (!isBoardFullscreen || typeof document === 'undefined') {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isBoardFullscreen]);

  useLayoutEffect(() => {
    if (!isBoardFullscreen) {
      if (fullscreenScale !== 1) {
        setFullscreenScale(1);
      }
      return;
    }
    const node = boardRowRef.current;
    if (node === null) {
      return;
    }
    const updateFullscreenScale = () => {
      const naturalWidth = node.offsetWidth;
      const naturalHeight = node.offsetHeight;
      if (naturalWidth <= 0 || naturalHeight <= 0) {
        setFullscreenScale(1);
        return;
      }
      const horizontalInsetPx = isFullscreenThinHudMode ? 0 : 32;
      const verticalInsetPx = isFullscreenThinHudMode ? 0 : 32;
      const thinOverscanPx = isFullscreenThinHudMode ? FULLSCREEN_THIN_OVERSCAN_PX : 0;
      const maxWidth = Math.max(1, window.innerWidth - horizontalInsetPx + thinOverscanPx);
      const maxHeight = Math.max(1, window.innerHeight - verticalInsetPx + thinOverscanPx);
      const widthReference = isFullscreenThinHudMode
        ? Math.max(1, renderWidth)
        : naturalWidth;
      const fullscreenScaleMargin = isFullscreenThinHudMode
        ? 1
        : FULLSCREEN_SCALE_MARGIN;
      const rawScale = Math.min(
        maxWidth / widthReference,
        maxHeight / naturalHeight,
      );
      const nextScale =
        (isFullscreenThinHudMode ? rawScale : Math.min(1, rawScale)) *
        fullscreenScaleMargin;
      setFullscreenScale((current) =>
        Math.abs(current - nextScale) < 0.001 ? current : nextScale,
      );
    };

    updateFullscreenScale();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        updateFullscreenScale();
      });
      observer.observe(node);
      window.addEventListener('resize', updateFullscreenScale);
      return () => {
        observer.disconnect();
        window.removeEventListener('resize', updateFullscreenScale);
      };
    }

    window.addEventListener('resize', updateFullscreenScale);
    return () => {
      window.removeEventListener('resize', updateFullscreenScale);
    };
  }, [fullscreenScale, isBoardFullscreen, isFullscreenThinHudMode, renderWidth]);

  useLayoutEffect(() => {
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

  const maxUnitPixels =
    isBoardFullscreen && canUseBoardFullscreen ? 92 : MAX_UNIT_PIXELS;

  useLayoutEffect(() => {
    const updateRenderWidth = () => {
      const layoutWidth = availableWidth ?? window.innerWidth;
      const maxAvailableWidth = Math.max(120, layoutWidth - 2);
      const sideLayoutFitsAtMinUnit =
        !showHoverPreview ||
        MIN_SIDE_LAYOUT_UNIT_PIXELS * VIEWBOX_SIZE +
          getPreviewBoxWidth(MIN_SIDE_LAYOUT_UNIT_PIXELS) +
          getBoardGap(MIN_SIDE_LAYOUT_UNIT_PIXELS, true) <=
          maxAvailableWidth;
      const shouldForcePreviewBelow =
        showHoverPreview && !sideLayoutFitsAtMinUnit;
      let nextIsPreviewBelow = false;

      if (!showHoverPreview) {
        previewBelowBreakpointWidthRef.current = null;
        nextIsPreviewBelow = false;
      } else if (!isPreviewBelow) {
        if (shouldForcePreviewBelow) {
          previewBelowBreakpointWidthRef.current = layoutWidth;
          nextIsPreviewBelow = true;
        } else {
          nextIsPreviewBelow = false;
        }
      } else {
        const breakpointWidth =
          previewBelowBreakpointWidthRef.current ?? layoutWidth;
        const restoreThreshold =
          breakpointWidth + PREVIEW_BELOW_RESTORE_HYSTERESIS_PX;
        if (!shouldForcePreviewBelow && layoutWidth >= restoreThreshold) {
          previewBelowBreakpointWidthRef.current = null;
          nextIsPreviewBelow = false;
        } else {
          previewBelowBreakpointWidthRef.current = Math.min(
            breakpointWidth,
            layoutWidth,
          );
          nextIsPreviewBelow = true;
        }
      }

      setIsPreviewBelow(nextIsPreviewBelow);
      let snappedUnit = MIN_UNIT_PIXELS;

      for (let unit = maxUnitPixels; unit >= MIN_UNIT_PIXELS; unit -= 1) {
        if (unit % 2 !== 0) {
          continue;
        }
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
  }, [availableWidth, isPreviewBelow, maxUnitPixels, showHoverPreview]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setWaveFrameIndex((prev) => (prev + 1) % WAVE_FRAME_COUNT);
    }, WAVE_FRAME_MS);
    return () => {
      window.clearInterval(intervalId);
    };
  }, []);
  const isItemPickupChoiceOpen = pendingItemPickupChoice !== null;

  useEffect(() => {
    const clearSelectionOnOutsideClick = (event: PointerEvent) => {
      if (pendingItemPickupChoice !== null) {
        return;
      }
      if (pendingDemonRebound !== null) {
        const target = event.target as Node | null;
        if (target !== null && boardContainerRef.current?.contains(target)) {
          return;
        }
        setPendingDemonRebound(null);
        setSelectedTile({row: pendingDemonRebound.sourceRow, col: pendingDemonRebound.sourceCol});
        return;
      }
      if (pendingSpiritPush !== null) {
        const target = event.target as Node | null;
        if (target !== null && boardContainerRef.current?.contains(target)) {
          return;
        }
        setPendingSpiritPush(null);
        setSelectedTile({row: pendingSpiritPush.sourceRow, col: pendingSpiritPush.sourceCol});
        return;
      }
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
  }, [
    pendingDemonRebound,
    pendingSpiritPush,
    pendingItemPickupChoice,
    selectedTile,
    selectedMoveResourceId,
  ]);

  const svgStyle: CSSProperties = {
    width: `${renderWidth}px`,
    height: 'auto',
    display: 'block',
    imageRendering: 'pixelated',
    filter: isItemPickupChoiceOpen ? 'blur(2.3px)' : 'none',
    transition: 'filter 140ms ease-out',
    pointerEvents: isItemPickupChoiceOpen ? 'none' : 'auto',
  };

  const darkSquares: ReactNode[] = [];
  const hoverTiles: ReactNode[] = [];
  const currentWrapStyle: CSSProperties = {
    ...wrapStyle,
    justifyContent: isBoardFullscreen
      ? 'center'
      : align === 'left'
        ? 'flex-start'
        : 'center',
    ...(isBoardFullscreen
      ? {
          position: 'fixed',
          inset: 0,
          zIndex: 12050,
          backgroundColor: '#fff',
          boxSizing: 'border-box',
          padding: isFullscreenThinHudMode ? '0px' : '16px',
          alignItems: 'center',
          overflow: 'hidden',
        }
      : {}),
  };
  const visibleBoardEntities = useMemo(
    () =>
      boardEntities.filter(
        (entity) => entity.carriedByDrainerId === undefined && !entity.isScored,
      ),
    [boardEntities],
  );
  const activeAngels = useMemo(
    () =>
      visibleBoardEntities.filter(
        (entity): entity is BoardEntity & {
          kind: 'mon';
          side: 'black' | 'white';
          monType: 'angel';
        } =>
          entity.kind === 'mon' &&
          entity.side !== undefined &&
          entity.monType === 'angel' &&
          (!enableFreeTileMove ||
            (isSandboxFreeMoveBoard
              ? !faintedMonIdSet.has(entity.id)
              : !isMonOnOwnSpawn({
                  col: entity.col,
                  row: entity.row,
                  type: entity.monType,
                  side: entity.side,
                }))),
      ),
    [enableFreeTileMove, faintedMonIdSet, isSandboxFreeMoveBoard, visibleBoardEntities],
  );
  const getProtectingAngelsForTarget = (
    targetEntity: BoardEntity & {
      kind: 'mon';
      side: 'black' | 'white';
      monType: MonType;
    },
  ) =>
    activeAngels.filter(
      (angel) =>
        angel.side === targetEntity.side &&
        angel.id !== targetEntity.id &&
        Math.max(
          Math.abs(angel.col - targetEntity.col),
        Math.abs(angel.row - targetEntity.row),
        ) === 1,
    );
  const isMonCurrentlyFainted = (
    mon: BoardEntity & {
      kind: 'mon';
      side: 'black' | 'white';
      monType: MonType;
    },
  ): boolean => {
    if (!enableFreeTileMove) {
      return false;
    }
    const isOnOwnSpawn = isMonOnOwnSpawn({
      col: mon.col,
      row: mon.row,
      type: mon.monType,
      side: mon.side,
    });
    if (!isOnOwnSpawn) {
      return false;
    }
    return !isSandboxFreeMoveBoard || faintedMonIdSet.has(mon.id);
  };
  const isAbilityUserBlockedOnOwnSpawn = (
    mon: BoardEntity & {
      kind: 'mon';
      side: 'black' | 'white';
      monType: MonType;
    },
  ): boolean =>
    (mon.monType === 'spirit' ||
      mon.monType === 'demon' ||
      mon.monType === 'mystic') &&
    isMonOnOwnSpawn({
      col: mon.col,
      row: mon.row,
      type: mon.monType,
      side: mon.side,
    });
  const activeMonPositions = useMemo(
    () => ({
      black: visibleBoardEntities
        .filter(
          (entity): entity is BoardEntity & {kind: 'mon'; side: 'black'; monType: MonType} =>
            entity.kind === 'mon' && entity.side === 'black' && entity.monType !== undefined,
        )
        .map((entity) => ({
          id: entity.id,
          col: entity.col,
          row: entity.row,
          href: entity.href,
          type: entity.monType,
          heldItemKind: entity.heldItemKind,
        })),
      white: visibleBoardEntities
        .filter(
          (entity): entity is BoardEntity & {kind: 'mon'; side: 'white'; monType: MonType} =>
            entity.kind === 'mon' && entity.side === 'white' && entity.monType !== undefined,
        )
        .map((entity) => ({
          id: entity.id,
          col: entity.col,
          row: entity.row,
          href: entity.href,
          type: entity.monType,
          heldItemKind: entity.heldItemKind,
        })),
    }),
    [visibleBoardEntities],
  );
  const spawnGhosts = useMemo(
    () =>
      boardPresetConfigs.default.mons.map((mon) => ({
        col: mon.col,
        row: mon.row,
        href: mon.side === 'black' ? boardAssets.black[mon.type] : boardAssets.white[mon.type],
      })),
    [],
  );
  const puzzleStartGhosts = useMemo(
    () => {
      if (!enableFreeTileMove) {
        return [];
      }
      return initialBoardEntities
        .filter((entity) => {
          if (entity.kind === 'item') {
            return false;
          }
          if (
            (entity.kind === 'whiteMana' ||
              entity.kind === 'blackMana' ||
              entity.kind === 'superMana') &&
            entity.carriedByDrainerId !== undefined
          ) {
            return false;
          }
          return true;
        })
        .map((entity) => ({
          col: entity.col,
          row: entity.row,
          href: entity.href,
        }));
    },
    [enableFreeTileMove, initialBoardEntities],
  );
  const activeWhiteManaEntities = useMemo(
    () =>
      visibleBoardEntities.filter(
        (entity): entity is BoardEntity & {kind: 'whiteMana'} => entity.kind === 'whiteMana',
      ),
    [visibleBoardEntities],
  );
  const activeBlackManaEntities = useMemo(
    () =>
      visibleBoardEntities.filter(
        (entity): entity is BoardEntity & {kind: 'blackMana'} => entity.kind === 'blackMana',
      ),
    [visibleBoardEntities],
  );
  const activeSuperManaEntities = useMemo(
    () =>
      visibleBoardEntities.filter(
        (entity): entity is BoardEntity & {kind: 'superMana'} => entity.kind === 'superMana',
      ),
    [visibleBoardEntities],
  );
  const activeWhiteManaPositions = useMemo(
    () => activeWhiteManaEntities.map((entity) => [entity.col, entity.row] as [number, number]),
    [activeWhiteManaEntities],
  );
  const activeBlackManaPositions = useMemo(
    () => activeBlackManaEntities.map((entity) => [entity.col, entity.row] as [number, number]),
    [activeBlackManaEntities],
  );
  const activeSuperManaPositions = useMemo(
    () => activeSuperManaEntities.map((entity) => [entity.col, entity.row] as [number, number]),
    [activeSuperManaEntities],
  );
  const activePickupItems = useMemo(
    () =>
      visibleBoardEntities
        .filter((entity): entity is BoardEntity & {kind: 'item'} => entity.kind === 'item')
        .map((entity) => ({
          id: entity.id,
          col: entity.col,
          row: entity.row,
          href: entity.href,
        })),
    [visibleBoardEntities],
  );
  const itemSparkleParticlesByTileKey = useMemo(() => {
    const next: Record<string, ItemSparkleParticle[]> = {};
    activePickupItems.forEach((item, index) => {
      next[toTileKey(item.col, item.row)] = createItemSparkleParticles(
        waveSeedNonce + (index + 1) * 2467 + item.col * 97 + item.row * 131,
      );
    });
    return next;
  }, [activePickupItems, waveSeedNonce]);
  const scoredManaFadeSprites = useMemo(
    () => Object.values(scoredManaFadeSpritesById),
    [scoredManaFadeSpritesById],
  );
  const movableEntityTileKeySet = useMemo(
    () => new Set(visibleBoardEntities.map((entity) => toTileKey(entity.col, entity.row))),
    [visibleBoardEntities],
  );
  const carriedManaByDrainerId = useMemo(() => {
    const next: Record<
      string,
      {
        href: string;
        kind: 'whiteMana' | 'blackMana' | 'superMana';
      }
    > = {};
    boardEntities.forEach((entity) => {
      if (
        entity.carriedByDrainerId === undefined ||
        entity.isScored ||
        (entity.kind !== 'whiteMana' &&
          entity.kind !== 'blackMana' &&
          entity.kind !== 'superMana')
      ) {
        return;
      }
      next[entity.carriedByDrainerId] = {
        href: entity.href,
        kind: entity.kind,
      };
    });
    return next;
  }, [boardEntities]);
  const resetAnimationSourceTileKeySet = useMemo(() => {
    if (resetAnimation === null) {
      return new Set<string>();
    }
    return new Set(
      Object.values(resetAnimation.byId).map((step) => toTileKey(step.fromCol, step.fromRow)),
    );
  }, [resetAnimation]);
  const resetAnimationDestinationTileKeySet = useMemo(() => {
    if (resetAnimation === null) {
      return new Set<string>();
    }
    return new Set(
      Object.values(resetAnimation.byId).map((step) => toTileKey(step.toCol, step.toRow)),
    );
  }, [resetAnimation]);
  const resetGhostFadeTileKeySet = useMemo(
    () => new Set(Object.keys(resetGhostFadeInByTileKey)),
    [resetGhostFadeInByTileKey],
  );
  const pendingAbilityDotTileKeySet = useMemo(() => {
    const tileKeys = new Set<string>();
    if (pendingDemonRebound !== null) {
      pendingDemonRebound.reboundOptions.forEach((option) => {
        tileKeys.add(toTileKey(option.col, option.row));
      });
    }
    if (pendingSpiritPush !== null) {
      pendingSpiritPush.destinationOptions.forEach((option) => {
        tileKeys.add(toTileKey(option.col, option.row));
      });
    }
    return tileKeys;
  }, [pendingDemonRebound, pendingSpiritPush]);
  const ghostHiddenTileKeySet = useMemo(() => {
    if (resetAnimation === null) {
      return new Set<string>([
        ...movableEntityTileKeySet,
        ...pendingAbilityDotTileKeySet,
      ]);
    }
    const stationaryOccupiedTileKeys = Array.from(movableEntityTileKeySet).filter(
      (tileKey) => !resetAnimationDestinationTileKeySet.has(tileKey),
    );
    const blockedSourceTileKeys = Array.from(resetAnimationSourceTileKeySet).filter(
      (tileKey) => !resetGhostFadeTileKeySet.has(tileKey),
    );
    return new Set<string>([
      ...stationaryOccupiedTileKeys,
      ...blockedSourceTileKeys,
      ...pendingAbilityDotTileKeySet,
    ]);
  }, [
    movableEntityTileKeySet,
    pendingAbilityDotTileKeySet,
    resetAnimation,
    resetGhostFadeTileKeySet,
    resetAnimationDestinationTileKeySet,
    resetAnimationSourceTileKeySet,
  ]);
  const resetAnimationPositionByEntityId = useMemo(() => {
    if (resetAnimation === null) {
      return null;
    }
    const nextPositions: Record<string, {col: number; row: number}> = {};
    Object.entries(resetAnimation.byId).forEach(([entityId, step]) => {
      nextPositions[entityId] = {
        col: step.fromCol + (step.toCol - step.fromCol) * resetAnimationProgress,
        row: step.fromRow + (step.toRow - step.fromRow) * resetAnimationProgress,
      };
    });
    return nextPositions;
  }, [resetAnimation, resetAnimationProgress]);
  const getRenderedEntityCoords = (entity: {id: string; col: number; row: number}) =>
    resetAnimationPositionByEntityId?.[entity.id] ?? {col: entity.col, row: entity.row};
  const whiteManaTileKeys = new Set(
    activeWhiteManaPositions.map(([col, row]) => toTileKey(col, row)),
  );
  const blackManaTileKeys = new Set(
    activeBlackManaPositions.map(([col, row]) => toTileKey(col, row)),
  );
  const itemTileKeys = new Set(
    activePickupItems.map((item) => toTileKey(item.col, item.row)),
  );
  const monTileKeysByType: Record<MonType, Set<string>> = {
    angel: new Set<string>(),
    demon: new Set<string>(),
    drainer: new Set<string>(),
    spirit: new Set<string>(),
    mystic: new Set<string>(),
  };
  const monTypeByTileKey: Record<string, MonType> = {};
  [...activeMonPositions.black, ...activeMonPositions.white].forEach((mon) => {
    const tileKey = toTileKey(mon.col, mon.row);
    monTileKeysByType[mon.type].add(tileKey);
    monTypeByTileKey[tileKey] = mon.type;
  });
  const blackMonTileKeys = new Set(
    activeMonPositions.black.map((mon) => toTileKey(mon.col, mon.row)),
  );
  const pieceByTile: Record<string, PreviewContent> = {};
  const moveResourceById: Record<string, PreviewContent> = {};
  const cornerWaveLines = useMemo(
    () =>
      cornerManaPoolPositions.map((_, index) =>
        createCornerWaveLines(waveSeedNonce + (index + 1) * 7919),
      ),
    [waveSeedNonce],
  );
  const previewManaPoolWaves = useMemo(
    () => createCornerWaveLines(waveSeedNonce + 424242),
    [waveSeedNonce],
  );
  const getPreviewDetailPath = (title: string): string | undefined =>
    getPieceDetailPathByTitle(title) ?? undefined;

  activeMonPositions.black.forEach((mon) => {
    pieceByTile[`${mon.row}-${mon.col}`] = {
      kind: 'image',
      href: mon.href,
      title: explanationText[mon.type].title,
      text: explanationText[mon.type].text,
      detailPath: getPreviewDetailPath(explanationText[mon.type].title),
    };
  });
  activeMonPositions.white.forEach((mon) => {
    pieceByTile[`${mon.row}-${mon.col}`] = {
      kind: 'image',
      href: mon.href,
      title: explanationText[mon.type].title,
      text: explanationText[mon.type].text,
      detailPath: getPreviewDetailPath(explanationText[mon.type].title),
    };
  });
  activeBlackManaPositions.forEach(([col, row]) => {
    pieceByTile[`${row}-${col}`] = {
      kind: 'image',
      href: boardAssets.manaB,
      title: explanationText.blackMana.title,
      text: explanationText.blackMana.text,
      detailPath: getPreviewDetailPath(explanationText.blackMana.title),
    };
  });
  activeWhiteManaPositions.forEach(([col, row]) => {
    pieceByTile[`${row}-${col}`] = {
      kind: 'image',
      href: boardAssets.mana,
      title: explanationText.whiteMana.title,
      text: explanationText.whiteMana.text,
      detailPath: getPreviewDetailPath(explanationText.whiteMana.title),
    };
  });
  activePickupItems.forEach((item) => {
    pieceByTile[`${item.row}-${item.col}`] = {
      kind: 'image',
      href: item.href,
      title: explanationText.item.title,
      text: explanationText.item.text,
      detailPath: getPreviewDetailPath(explanationText.item.title),
    };
  });
  activeSuperManaPositions.forEach(([col, row]) => {
    pieceByTile[`${row}-${col}`] = {
      kind: 'image',
      href: boardAssets.supermana,
      title: explanationText.supermana.title,
      text: explanationText.supermana.text,
      detailPath: getPreviewDetailPath(explanationText.supermana.title),
    };
  });
  cornerManaPoolPositions.forEach(([col, row]) => {
    const tileKey = `${row}-${col}`;
    if (pieceByTile[tileKey] !== undefined) {
      return;
    }
    pieceByTile[tileKey] = {
      kind: 'manaPool',
      title: 'Mana Pool',
      text: 'Bring mana here to score points. 5 wins the game!',
      detailPath: getPreviewDetailPath('Mana Pool'),
    };
  });
  moveResourceItems.forEach((resource) => {
    const info = moveResourceInfo[resource.kind];
    moveResourceById[resource.id] = {
      kind: 'image',
      href: moveResourceAssets[resource.kind],
      title: info.title,
      text: info.text,
      detailPath: getPreviewDetailPath(info.title),
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
  const selectedMovableTile =
    enableFreeTileMove &&
    selectedTile !== null &&
    movableEntityTileKeySet.has(selectedTileKey ?? '')
      ? selectedTile
      : null;
  const isSpiritPushTargetDistance = (
    sourceCol: number,
    sourceRow: number,
    targetCol: number,
    targetRow: number,
  ): boolean =>
    Math.max(Math.abs(targetCol - sourceCol), Math.abs(targetRow - sourceRow)) === 2 &&
    (targetCol !== sourceCol || targetRow !== sourceRow);
  const isDemonMiddleTileBlocked = (
    middleTile: {col: number; row: number},
    ignoredEntityIdA?: string,
    ignoredEntityIdB?: string,
  ): boolean =>
    visibleBoardEntities.some(
      (entity) =>
        entity.kind !== 'item' &&
        entity.id !== ignoredEntityIdA &&
        entity.id !== ignoredEntityIdB &&
        entity.col === middleTile.col &&
        entity.row === middleTile.row,
    );
  const getDemonReboundOptions = (
    attacker: BoardEntity & {kind: 'mon'; side: 'black' | 'white'; monType: MonType},
    target: BoardEntity & {kind: 'mon'; side: 'black' | 'white'; monType: MonType},
    targetSpawnTile: {col: number; row: number} | null,
  ): Array<{col: number; row: number}> => {
    const options: Array<{col: number; row: number}> = [];
    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
        if (rowOffset === 0 && colOffset === 0) {
          continue;
        }
        const optionCol = target.col + colOffset;
        const optionRow = target.row + rowOffset;
        if (
          optionCol < 0 ||
          optionCol >= BOARD_SIZE ||
          optionRow < 0 ||
          optionRow >= BOARD_SIZE
        ) {
          continue;
        }
        if (!canEntityMoveToTile(attacker, optionCol, optionRow)) {
          continue;
        }
        if (
          targetSpawnTile !== null &&
          optionCol === targetSpawnTile.col &&
          optionRow === targetSpawnTile.row
        ) {
          continue;
        }
        const isOccupied = visibleBoardEntities.some(
          (entity) =>
            entity.id !== attacker.id &&
            entity.id !== target.id &&
            entity.col === optionCol &&
            entity.row === optionRow,
        );
        if (isOccupied) {
          continue;
        }
        options.push({col: optionCol, row: optionRow});
      }
    }
    return options;
  };
  const getSpiritPushDestinationOptions = (
    target: BoardEntity,
  ): Array<{col: number; row: number}> => {
    const options: Array<{col: number; row: number}> = [];
    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
        if (rowOffset === 0 && colOffset === 0) {
          continue;
        }
        const optionCol = target.col + colOffset;
        const optionRow = target.row + rowOffset;
        if (
          optionCol < 0 ||
          optionCol >= BOARD_SIZE ||
          optionRow < 0 ||
          optionRow >= BOARD_SIZE
        ) {
          continue;
        }
        if (!canEntityMoveToTile(target, optionCol, optionRow)) {
          continue;
        }
        const isOccupied = visibleBoardEntities.some(
          (entity) =>
            entity.id !== target.id &&
            entity.col === optionCol &&
            entity.row === optionRow,
        );
        if (isOccupied) {
          continue;
        }
        options.push({col: optionCol, row: optionRow});
      }
    }
    return options;
  };
  const attackIndicatorTargets = useMemo(() => {
    if (
      !enableFreeTileMove ||
      isResetAnimating ||
      pendingDemonRebound !== null ||
      pendingSpiritPush !== null ||
      selectedMovableTile === null
    ) {
      return [];
    }
    const selectedEntity = visibleBoardEntities.find(
      (entity) =>
        entity.col === selectedMovableTile.col &&
        entity.row === selectedMovableTile.row,
    );
    if (
      selectedEntity === undefined ||
      selectedEntity.kind !== 'mon' ||
      selectedEntity.side === undefined ||
      selectedEntity.monType === undefined
    ) {
      return [];
    }
    const isSelectedAbilityBlockedOnOwnSpawn =
      isAbilityUserBlockedOnOwnSpawn(selectedEntity);

    const isTargetProtectedByAngel = (
      targetEntity: BoardEntity & {kind: 'mon'; side: 'black' | 'white'; monType: MonType},
    ) => getProtectingAngelsForTarget(targetEntity).length > 0;

    if (selectedEntity.monType === 'spirit') {
      if (isSelectedAbilityBlockedOnOwnSpawn) {
        return [];
      }
      return visibleBoardEntities
        .filter((entity) => entity.id !== selectedEntity.id)
        .filter((targetEntity) => {
          if (
            targetEntity.kind === 'mon' &&
            targetEntity.side !== undefined &&
            targetEntity.monType !== undefined &&
            isMonCurrentlyFainted(targetEntity)
          ) {
            return false;
          }
          return true;
        })
        .filter((targetEntity) =>
          isSpiritPushTargetDistance(
            selectedEntity.col,
            selectedEntity.row,
            targetEntity.col,
            targetEntity.row,
          ),
        )
        .filter(
          (targetEntity) =>
            getSpiritPushDestinationOptions(targetEntity).length > 0,
        )
        .map((targetEntity) => ({
          id: targetEntity.id,
          col: targetEntity.col,
          row: targetEntity.row,
          color: SPIRIT_ABILITY_INDICATOR_COLOR,
        }));
    }

    return visibleBoardEntities
      .filter(
        (entity): entity is BoardEntity & {
          kind: 'mon';
          side: 'black' | 'white';
          monType: MonType;
        } =>
          entity.kind === 'mon' &&
          entity.side !== undefined &&
          entity.monType !== undefined,
      )
      .filter((targetEntity) => targetEntity.side !== selectedEntity.side)
      .filter((targetEntity) => !isMonCurrentlyFainted(targetEntity))
      .filter((targetEntity) => {
        if (selectedEntity.monType === 'mystic' && selectedEntity.heldItemKind !== 'bomb') {
          if (isSelectedAbilityBlockedOnOwnSpawn) {
            return false;
          }
          if (isTargetProtectedByAngel(targetEntity)) {
            return false;
          }
          if (
            Math.abs(targetEntity.col - selectedEntity.col) !== 2 ||
            Math.abs(targetEntity.row - selectedEntity.row) !== 2
          ) {
            return false;
          }
          const targetSpawnTile = getMonSpawnTile(
            targetEntity.side,
            targetEntity.monType,
          );
          if (targetSpawnTile === null) {
            return false;
          }
          return !visibleBoardEntities.some(
            (entity) =>
              entity.id !== targetEntity.id &&
              entity.col === targetSpawnTile.col &&
              entity.row === targetSpawnTile.row,
          );
        }

        if (selectedEntity.monType === 'demon' && selectedEntity.heldItemKind !== 'bomb') {
          if (isSelectedAbilityBlockedOnOwnSpawn) {
            return false;
          }
          if (isTargetProtectedByAngel(targetEntity)) {
            return false;
          }
          const isTargetOnOwnSpawn = isMonOnOwnSpawn({
            col: targetEntity.col,
            row: targetEntity.row,
            type: targetEntity.monType,
            side: targetEntity.side,
          });
          if (
            !canEntityMoveToTile(selectedEntity, targetEntity.col, targetEntity.row) &&
            !isTargetOnOwnSpawn
          ) {
            return false;
          }
          const middleTile = getTwoStepOrthogonalMiddleTile(
            selectedEntity.col,
            selectedEntity.row,
            targetEntity.col,
            targetEntity.row,
          );
          if (middleTile === null) {
            return false;
          }
          if (isCenterSuperManaTile(middleTile.col, middleTile.row)) {
            return false;
          }
          if (isDemonMiddleTileBlocked(middleTile, selectedEntity.id, targetEntity.id)) {
            return false;
          }
          const targetSpawnTile = getMonSpawnTile(
            targetEntity.side,
            targetEntity.monType,
          );
          if (targetSpawnTile === null) {
            return false;
          }
          const canRespawnTarget = !visibleBoardEntities.some(
            (entity) =>
              entity.id !== selectedEntity.id &&
              entity.id !== targetEntity.id &&
              entity.col === targetSpawnTile.col &&
              entity.row === targetSpawnTile.row,
          );
          if (!canRespawnTarget) {
            return false;
          }
          if (targetEntity.heldItemKind === 'bomb') {
            const attackerSpawnTile = getMonSpawnTile(
              selectedEntity.side,
              selectedEntity.monType,
            );
            if (attackerSpawnTile === null) {
              return false;
            }
            const canRespawnAttacker = !visibleBoardEntities.some(
              (entity) =>
                entity.id !== selectedEntity.id &&
                entity.id !== targetEntity.id &&
                entity.col === attackerSpawnTile.col &&
                entity.row === attackerSpawnTile.row,
            );
            if (!canRespawnAttacker) {
              return false;
            }
          }
          const targetCarriedMana = boardEntities.find(
            (entity) =>
              !entity.isScored &&
              entity.carriedByDrainerId === targetEntity.id &&
              (entity.kind === 'whiteMana' ||
                entity.kind === 'blackMana' ||
                entity.kind === 'superMana'),
          );
          const isTargetDrainerHoldingNormalMana =
            targetEntity.monType === 'drainer' &&
            targetEntity.heldItemKind !== 'bomb' &&
            (targetCarriedMana?.kind === 'whiteMana' ||
              targetCarriedMana?.kind === 'blackMana');
          if (!isTargetDrainerHoldingNormalMana) {
            return true;
          }
          return (
            getDemonReboundOptions(
              selectedEntity,
              targetEntity,
              targetSpawnTile,
            ).length > 0
          );
        }

        if (selectedEntity.heldItemKind === 'bomb') {
          if (targetEntity.side === selectedEntity.side) {
            return false;
          }
          const inBombRange =
            Math.max(
              Math.abs(targetEntity.col - selectedEntity.col),
              Math.abs(targetEntity.row - selectedEntity.row),
            ) <= 3 &&
            (targetEntity.col !== selectedEntity.col ||
              targetEntity.row !== selectedEntity.row);
          if (!inBombRange) {
            return false;
          }
          const targetSpawnTile = getMonSpawnTile(
            targetEntity.side,
            targetEntity.monType,
          );
          if (targetSpawnTile === null) {
            return false;
          }
          const isAlreadyOnSpawn =
            targetEntity.col === targetSpawnTile.col &&
            targetEntity.row === targetSpawnTile.row;
          if (isAlreadyOnSpawn) {
            return true;
          }
          return !visibleBoardEntities.some(
            (entity) =>
              entity.id !== targetEntity.id &&
              entity.col === targetSpawnTile.col &&
              entity.row === targetSpawnTile.row,
          );
        }

        return false;
      })
      .map((targetEntity) => ({
        id: targetEntity.id,
        col: targetEntity.col,
        row: targetEntity.row,
        color: DEFAULT_ATTACK_INDICATOR_COLOR,
      }));
  }, [
    activeAngels,
    boardEntities,
    enableFreeTileMove,
    faintedMonIdSet,
    isSandboxFreeMoveBoard,
    isResetAnimating,
    pendingDemonRebound,
    pendingSpiritPush,
    selectedMovableTile,
    visibleBoardEntities,
  ]);
  const abilityRangeHintTiles = useMemo(() => {
    if (
      !enableFreeTileMove ||
      isResetAnimating ||
      pendingDemonRebound !== null ||
      pendingSpiritPush !== null ||
      selectedMovableTile === null
    ) {
      return [];
    }
    const selectedEntity = visibleBoardEntities.find(
      (entity) =>
        entity.col === selectedMovableTile.col &&
        entity.row === selectedMovableTile.row,
    );
    if (
      selectedEntity === undefined ||
      selectedEntity.kind !== 'mon' ||
      selectedEntity.side === undefined ||
      selectedEntity.monType === undefined
    ) {
      return [];
    }
    if (
      selectedEntity.monType !== 'demon' &&
      selectedEntity.monType !== 'mystic' &&
      selectedEntity.monType !== 'spirit'
    ) {
      return [];
    }
    if (isAbilityUserBlockedOnOwnSpawn(selectedEntity)) {
      return [];
    }

    const occupiedTileKeySet = new Set(
      visibleBoardEntities.map((entity) => toTileKey(entity.col, entity.row)),
    );
    const dedupeTileKeySet = new Set<string>();
    const hints: Array<{col: number; row: number; color: string}> = [];
    const maybeAddHint = (col: number, row: number, color: string) => {
      if (col < 0 || col >= BOARD_SIZE || row < 0 || row >= BOARD_SIZE) {
        return;
      }
      const tileKey = toTileKey(col, row);
      if (
        occupiedTileKeySet.has(tileKey) ||
        dedupeTileKeySet.has(tileKey) ||
        gameSpawnGhostTileKeySet.has(tileKey)
      ) {
        return;
      }
      dedupeTileKeySet.add(tileKey);
      hints.push({col, row, color});
    };

    if (selectedEntity.monType === 'demon') {
      const orthogonalSteps: Array<[number, number]> = [
        [2, 0],
        [-2, 0],
        [0, 2],
        [0, -2],
      ];
      orthogonalSteps.forEach(([dCol, dRow]) => {
        const targetCol = selectedEntity.col + dCol;
        const targetRow = selectedEntity.row + dRow;
        const middleTile = getTwoStepOrthogonalMiddleTile(
          selectedEntity.col,
          selectedEntity.row,
          targetCol,
          targetRow,
        );
        if (middleTile === null) {
          return;
        }
        if (isCenterSuperManaTile(middleTile.col, middleTile.row)) {
          return;
        }
        if (isDemonMiddleTileBlocked(middleTile)) {
          return;
        }
        maybeAddHint(targetCol, targetRow, DEFAULT_ATTACK_INDICATOR_COLOR);
      });
      return hints;
    }

    if (selectedEntity.monType === 'mystic') {
      const diagonalSteps: Array<[number, number]> = [
        [2, 2],
        [-2, 2],
        [2, -2],
        [-2, -2],
      ];
      diagonalSteps.forEach(([dCol, dRow]) => {
        maybeAddHint(
          selectedEntity.col + dCol,
          selectedEntity.row + dRow,
          DEFAULT_ATTACK_INDICATOR_COLOR,
        );
      });
      return hints;
    }

    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        if (
          isSpiritPushTargetDistance(
            selectedEntity.col,
            selectedEntity.row,
            col,
            row,
          )
        ) {
          maybeAddHint(col, row, SPIRIT_ABILITY_INDICATOR_COLOR);
        }
      }
    }
    return hints;
  }, [
    enableFreeTileMove,
    isResetAnimating,
    pendingDemonRebound,
    pendingSpiritPush,
    selectedMovableTile,
    visibleBoardEntities,
  ]);
  const abilityRangeHintTileKeySet = useMemo(
    () =>
      new Set(abilityRangeHintTiles.map((tile) => toTileKey(tile.col, tile.row))),
    [abilityRangeHintTiles],
  );
  const puzzleStartGhostHiddenTileKeySet = useMemo(
    () => new Set([...ghostHiddenTileKeySet, ...abilityRangeHintTileKeySet]),
    [abilityRangeHintTileKeySet, ghostHiddenTileKeySet],
  );
  const angelProtectionZones = useMemo<AngelProtectionZone[]>(() => {
    if (
      !enableFreeTileMove ||
      isResetAnimating ||
      pendingDemonRebound !== null ||
      pendingSpiritPush !== null ||
      selectedMovableTile === null
    ) {
      return [];
    }
    const selectedEntity = visibleBoardEntities.find(
      (entity) =>
        entity.col === selectedMovableTile.col &&
        entity.row === selectedMovableTile.row,
    );
    if (
      selectedEntity === undefined ||
      selectedEntity.kind !== 'mon' ||
      selectedEntity.side === undefined ||
      selectedEntity.monType === undefined
    ) {
      return [];
    }
    if (selectedEntity.monType === 'angel') {
      const isSelectedAngelFaintedOnSpawn =
        isMonOnOwnSpawn({
          col: selectedEntity.col,
          row: selectedEntity.row,
          type: selectedEntity.monType,
          side: selectedEntity.side,
        }) &&
        (!isSandboxFreeMoveBoard || faintedMonIdSet.has(selectedEntity.id));
      if (isSelectedAngelFaintedOnSpawn) {
        return [];
      }
      const minCol = Math.max(0, selectedEntity.col - 1);
      const minRow = Math.max(0, selectedEntity.row - 1);
      const maxCol = Math.min(BOARD_SIZE, selectedEntity.col + 2);
      const maxRow = Math.min(BOARD_SIZE, selectedEntity.row + 2);
      return [
        {
          key: `selected-angel-${selectedEntity.id}`,
          x: minCol,
          y: minRow,
          width: maxCol - minCol,
          height: maxRow - minRow,
        },
      ];
    }
    if (
      (selectedEntity.monType === 'mystic' ||
        selectedEntity.monType === 'demon') &&
      isAbilityUserBlockedOnOwnSpawn(selectedEntity)
    ) {
      return [];
    }
    if (selectedEntity.monType !== 'mystic' && selectedEntity.monType !== 'demon') {
      return [];
    }

    const blockedAngelById = new Map<string, {col: number; row: number}>();
    visibleBoardEntities
      .filter(
        (entity): entity is BoardEntity & {
          kind: 'mon';
          side: 'black' | 'white';
          monType: MonType;
        } =>
          entity.kind === 'mon' &&
          entity.side !== undefined &&
          entity.monType !== undefined,
      )
      .filter((targetEntity) => targetEntity.side !== selectedEntity.side)
      .filter((targetEntity) => !isMonCurrentlyFainted(targetEntity))
      .forEach((targetEntity) => {
        const protectingAngels = getProtectingAngelsForTarget(targetEntity);
        if (protectingAngels.length === 0) {
          return;
        }
        const isTargetAttackableWithoutAngel = (() => {
          if (selectedEntity.monType === 'mystic') {
            if (
              Math.abs(targetEntity.col - selectedEntity.col) !== 2 ||
              Math.abs(targetEntity.row - selectedEntity.row) !== 2
            ) {
              return false;
            }
            const targetSpawnTile = getMonSpawnTile(
              targetEntity.side,
              targetEntity.monType,
            );
            if (targetSpawnTile === null) {
              return false;
            }
            return !visibleBoardEntities.some(
              (entity) =>
                entity.id !== targetEntity.id &&
                entity.col === targetSpawnTile.col &&
                entity.row === targetSpawnTile.row,
            );
          }
          if (selectedEntity.monType === 'demon') {
            const isTargetOnOwnSpawn = isMonOnOwnSpawn({
              col: targetEntity.col,
              row: targetEntity.row,
              type: targetEntity.monType,
              side: targetEntity.side,
            });
            if (
              !canEntityMoveToTile(selectedEntity, targetEntity.col, targetEntity.row) &&
              !isTargetOnOwnSpawn
            ) {
              return false;
            }
            const middleTile = getTwoStepOrthogonalMiddleTile(
              selectedEntity.col,
              selectedEntity.row,
              targetEntity.col,
              targetEntity.row,
            );
            if (middleTile === null) {
              return false;
            }
            if (isCenterSuperManaTile(middleTile.col, middleTile.row)) {
              return false;
            }
            if (isDemonMiddleTileBlocked(middleTile, selectedEntity.id, targetEntity.id)) {
              return false;
            }
            const targetSpawnTile = getMonSpawnTile(
              targetEntity.side,
              targetEntity.monType,
            );
            if (targetSpawnTile === null) {
              return false;
            }
            const canRespawnTarget = !visibleBoardEntities.some(
              (entity) =>
                entity.id !== selectedEntity.id &&
                entity.id !== targetEntity.id &&
                entity.col === targetSpawnTile.col &&
                entity.row === targetSpawnTile.row,
            );
            if (!canRespawnTarget) {
              return false;
            }
            if (targetEntity.heldItemKind === 'bomb') {
              const attackerSpawnTile = getMonSpawnTile(
                selectedEntity.side,
                selectedEntity.monType,
              );
              if (attackerSpawnTile === null) {
                return false;
              }
              const canRespawnAttacker = !visibleBoardEntities.some(
                (entity) =>
                  entity.id !== selectedEntity.id &&
                  entity.id !== targetEntity.id &&
                  entity.col === attackerSpawnTile.col &&
                  entity.row === attackerSpawnTile.row,
              );
              if (!canRespawnAttacker) {
                return false;
              }
            }
            const targetCarriedMana = boardEntities.find(
              (entity) =>
                !entity.isScored &&
                entity.carriedByDrainerId === targetEntity.id &&
                (entity.kind === 'whiteMana' ||
                  entity.kind === 'blackMana' ||
                  entity.kind === 'superMana'),
            );
            const isTargetDrainerHoldingNormalMana =
              targetEntity.monType === 'drainer' &&
              targetEntity.heldItemKind !== 'bomb' &&
              (targetCarriedMana?.kind === 'whiteMana' ||
                targetCarriedMana?.kind === 'blackMana');
            if (!isTargetDrainerHoldingNormalMana) {
              return true;
            }
            return (
              getDemonReboundOptions(
                selectedEntity,
                targetEntity,
                targetSpawnTile,
              ).length > 0
            );
          }
          return false;
        })();
        if (!isTargetAttackableWithoutAngel) {
          return;
        }
        protectingAngels.forEach((angel) => {
          blockedAngelById.set(angel.id, {col: angel.col, row: angel.row});
        });
      });

    return Array.from(blockedAngelById.entries()).map(([angelId, angel]) => {
      const minCol = Math.max(0, angel.col - 1);
      const minRow = Math.max(0, angel.row - 1);
      const maxCol = Math.min(BOARD_SIZE, angel.col + 2);
      const maxRow = Math.min(BOARD_SIZE, angel.row + 2);
      return {
        key: `blocked-angel-${angelId}`,
        x: minCol,
        y: minRow,
        width: maxCol - minCol,
        height: maxRow - minRow,
      };
    });
  }, [
    boardEntities,
    enableFreeTileMove,
    faintedMonIdSet,
    isResetAnimating,
    isSandboxFreeMoveBoard,
    pendingDemonRebound,
    pendingSpiritPush,
    selectedMovableTile,
    visibleBoardEntities,
  ]);
  const bombRangeZones = useMemo<BombRangeZone[]>(() => {
    if (
      !enableFreeTileMove ||
      isResetAnimating ||
      pendingDemonRebound !== null ||
      pendingSpiritPush !== null ||
      selectedMovableTile === null
    ) {
      return [];
    }
    const selectedEntity = visibleBoardEntities.find(
      (entity) =>
        entity.col === selectedMovableTile.col &&
        entity.row === selectedMovableTile.row,
    );
    if (
      selectedEntity === undefined ||
      selectedEntity.kind !== 'mon' ||
      selectedEntity.side === undefined ||
      selectedEntity.monType === undefined ||
      selectedEntity.heldItemKind !== 'bomb'
    ) {
      return [];
    }
    const isSelectedMonFainted =
      isMonOnOwnSpawn({
        col: selectedEntity.col,
        row: selectedEntity.row,
        type: selectedEntity.monType,
        side: selectedEntity.side,
      }) &&
      (!isSandboxFreeMoveBoard || faintedMonIdSet.has(selectedEntity.id));
    if (isSelectedMonFainted) {
      return [];
    }

    const range = 3;
    const minCol = Math.max(0, selectedEntity.col - range);
    const minRow = Math.max(0, selectedEntity.row - range);
    const maxCol = Math.min(BOARD_SIZE, selectedEntity.col + range + 1);
    const maxRow = Math.min(BOARD_SIZE, selectedEntity.row + range + 1);

    return [
      {
        key: `bomb-range-${selectedEntity.id}`,
        x: minCol,
        y: minRow,
        width: maxCol - minCol,
        height: maxRow - minRow,
      },
    ];
  }, [
    enableFreeTileMove,
    faintedMonIdSet,
    isResetAnimating,
    isSandboxFreeMoveBoard,
    pendingDemonRebound,
    pendingSpiritPush,
    selectedMovableTile,
    visibleBoardEntities,
  ]);
  useEffect(() => {
    setRenderedAngelProtectionZones((current) => {
      const nextZoneByKey = new Map(angelProtectionZones.map((zone) => [zone.key, zone]));
      const currentZoneByKey = new Map(current.map((zone) => [zone.key, zone]));
      const nextRenderedZones: RenderedAngelProtectionZone[] = [];

      angelProtectionZones.forEach((zone) => {
        const existingZone = currentZoneByKey.get(zone.key);
        if (existingZone === undefined) {
          nextRenderedZones.push({
            ...zone,
            status: 'entering',
          });
          return;
        }
        nextRenderedZones.push({
          ...zone,
          status: existingZone.status === 'leaving' ? 'active' : existingZone.status,
        });
      });

      current.forEach((zone) => {
        if (!nextZoneByKey.has(zone.key) && zone.status !== 'leaving') {
          nextRenderedZones.push({
            ...zone,
            status: 'leaving',
          });
        }
      });

      return nextRenderedZones;
    });
  }, [angelProtectionZones]);
  useEffect(() => {
    if (!renderedAngelProtectionZones.some((zone) => zone.status === 'entering')) {
      return;
    }
    const frameId = window.requestAnimationFrame(() => {
      setRenderedAngelProtectionZones((current) =>
        current.map((zone) =>
          zone.status === 'entering' ? {...zone, status: 'active'} : zone,
        ),
      );
    });
    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [renderedAngelProtectionZones]);
  useEffect(() => {
    setRenderedBombRangeZones((current) => {
      const nextZoneByKey = new Map(bombRangeZones.map((zone) => [zone.key, zone]));
      const currentZoneByKey = new Map(current.map((zone) => [zone.key, zone]));
      const nextRenderedZones: RenderedBombRangeZone[] = [];

      bombRangeZones.forEach((zone) => {
        const existingZone = currentZoneByKey.get(zone.key);
        if (existingZone === undefined) {
          nextRenderedZones.push({
            ...zone,
            status: 'entering',
          });
          return;
        }
        nextRenderedZones.push({
          ...zone,
          status: existingZone.status === 'leaving' ? 'active' : existingZone.status,
        });
      });

      current.forEach((zone) => {
        if (!nextZoneByKey.has(zone.key) && zone.status !== 'leaving') {
          nextRenderedZones.push({
            ...zone,
            status: 'leaving',
          });
        }
      });

      return nextRenderedZones;
    });
  }, [bombRangeZones]);
  useEffect(() => {
    if (!renderedBombRangeZones.some((zone) => zone.status === 'entering')) {
      return;
    }
    const frameId = window.requestAnimationFrame(() => {
      setRenderedBombRangeZones((current) =>
        current.map((zone) =>
          zone.status === 'entering' ? {...zone, status: 'active'} : zone,
        ),
      );
    });
    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [renderedBombRangeZones]);
  useEffect(() => {
    if (!renderedBombRangeZones.some((zone) => zone.status === 'leaving')) {
      return;
    }
    const timeoutId = window.setTimeout(() => {
      setRenderedBombRangeZones((current) =>
        current.filter((zone) => zone.status !== 'leaving'),
      );
    }, BOMB_RANGE_ZONE_FADE_MS);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [renderedBombRangeZones]);
  useEffect(() => {
    if (!renderedAngelProtectionZones.some((zone) => zone.status === 'leaving')) {
      return;
    }
    const timeoutId = window.setTimeout(() => {
      setRenderedAngelProtectionZones((current) =>
        current.filter((zone) => zone.status !== 'leaving'),
      );
    }, ANGEL_PROTECTION_ZONE_FADE_MS);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [renderedAngelProtectionZones]);
  const pendingDemonReboundDots = pendingDemonRebound?.reboundOptions ?? [];
  const pendingSpiritPushDots = pendingSpiritPush?.destinationOptions ?? [];
  const selectedBoardScaleGroup: BoardScaleGroup | null =
    selectedTileKey === null
      ? null
      : whiteManaTileKeys.has(selectedTileKey)
        ? 'whiteMana'
        : blackManaTileKeys.has(selectedTileKey)
          ? 'blackMana'
          : itemTileKeys.has(selectedTileKey)
            ? 'item'
            : monTypeByTileKey[selectedTileKey] ?? null;
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
  const boardSvgRect = boardSvgRef.current?.getBoundingClientRect() ?? null;
  const activeMoveResourceRect = activeMoveResourceButton?.getBoundingClientRect() ?? null;

  useEffect(() => {
    if (!enableHoverClickScaling) {
      if (scaledFactorRef.current !== 1) {
        scaledFactorRef.current = 1;
        setScaledFactor(1);
      }
      if (scaledTile !== null) {
        setScaledTile(null);
      }
      return;
    }

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
      const shouldKeepActiveScale =
        selectedTile !== null && scaledTile !== null;
      const nextScale = shouldKeepActiveScale ? ACTIVE_PIECE_SCALE : 1;
      setScaledTile(nextHighlighted);
      setScaledFactor(nextScale);
      scaledFactorRef.current = nextScale;
    }

    const from = isSameTile(nextHighlighted, scaledTile)
      ? scaledFactorRef.current
      : selectedTile !== null && scaledTile !== null
        ? ACTIVE_PIECE_SCALE
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
  }, [enableHoverClickScaling, highlightedTile, scaledTile, selectedTile]);

  const tilePixels = renderWidth / VIEWBOX_SIZE;
  const useBelowPreviewLayout = showHoverPreview && isPreviewBelow;
  const isThinAngelShieldMode = isFullscreenThinHudMode;
  const angelShieldPulseValues = isThinAngelShieldMode ? '0.6;1;0.6' : '0.5;1;0.5';
  const angelShieldOuterStrokeWidth = isThinAngelShieldMode ? 0.105 : 0.09;
  const angelShieldInnerStrokeWidth = isThinAngelShieldMode ? 0.052 : 0.045;
  const angelShieldOuterOpacity = isThinAngelShieldMode ? 0.2 : 0.16;
  const angelShieldInnerOpacity = isThinAngelShieldMode ? 0.5 : 0.42;
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
      ? thinResourceCenterYPx -
        thinResourceAnchorOffsetPx +
        THIN_RESOURCE_PREVIEW_Y_OFFSET_PX
      : 0;
  const thinFloatingAnchorTopYPx =
    activeBoardTileForThinPreview !== null
      ? thinTileTopYPx
      : activeMoveResourceId !== null
        ? thinResourceTopYPx
        : 0;
  const thinFloatingPreviewTopPx =
    activePiece !== null
      ? Math.max(6, thinFloatingAnchorTopYPx - 6 + 17)
      : 0;
  const thinBlackPreviewExtraOffsetPx = Math.max(10, Math.round(tilePixels * 0.35)) + 20;
  const thinFloatingPreviewBelowTopPx =
    activeBoardTileForThinPreview !== null
      ? ((activeBoardTileForThinPreview.row + 2) / VIEWBOX_SIZE) * renderWidth +
        6 +
        thinBlackPreviewExtraOffsetPx
      : thinFloatingPreviewTopPx + thinBlackPreviewExtraOffsetPx;
  const moveResourcesOffsetX = Math.round(tilePixels * -0.9);
  const moveResourcesOffsetY = Math.round(tilePixels * -0.62);

  useEffect(() => {
    if (!showHoverPreview || !isPreviewBelow) {
      setThinHintScale(1);
      return;
    }

    const node = thinHintRowRef.current;
    const contentNode = thinHintContentRef.current;
    if (node === null || contentNode === null) {
      return;
    }

    const updateThinHintScale = () => {
      const available = node.clientWidth;
      const content = contentNode.scrollWidth;
      if (available <= 0 || content <= 0) {
        setThinHintScale(1);
        return;
      }
      const nextScale = Math.min(1, available / content);
      setThinHintScale((current) => (Math.abs(current - nextScale) < 0.001 ? current : nextScale));
    };

    updateThinHintScale();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        updateThinHintScale();
      });
      observer.observe(node);
      return () => {
        observer.disconnect();
      };
    }

    window.addEventListener('resize', updateThinHintScale);
    return () => {
      window.removeEventListener('resize', updateThinHintScale);
    };
  }, [isPreviewBelow, renderWidth, showHoverPreview]);
  const boardRowStyle: CSSProperties = {
    display: 'flex',
    flexDirection: useBelowPreviewLayout ? 'column' : 'row',
    alignItems: 'flex-start',
    gap: `${useBelowPreviewLayout ? belowPreviewGapPx : boardGapPx}px`,
  };
  const currentBoardRowStyle: CSSProperties = isBoardFullscreen
    ? {
        ...boardRowStyle,
        transform: `scale(${fullscreenScale})`,
        transformOrigin: 'center center',
      }
    : boardRowStyle;
  const boardStackStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    position: 'relative',
    overflow: 'visible',
  };
  const quantizeToSpriteMultiple = (value: number) =>
    Math.max(72, Math.round(value / 36) * 36);
  const itemChoiceIconSizePx = quantizeToSpriteMultiple(tilePixels * 3.85);
  const itemChoiceModalStyle: CSSProperties =
    boardSvgRect === null
      ? {display: 'none'}
      : {
          position: 'fixed',
          left: `${boardSvgRect.left + boardSvgRect.width / 2}px`,
          top: `${boardSvgRect.top + boardSvgRect.height / 2}px`,
          transform: 'translate(-50%, -50%)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: `${Math.max(8, Math.round(tilePixels * 0.48))}px`,
          zIndex: 50,
          pointerEvents: 'auto',
        };
  const itemChoiceBackdropStyle: CSSProperties =
    boardSvgRect === null
      ? {display: 'none'}
      : {
          position: 'fixed',
          left: `${boardSvgRect.left}px`,
          top: `${boardSvgRect.top}px`,
          width: `${boardSvgRect.width}px`,
          height: `${boardSvgRect.height}px`,
          border: 'none',
          background: 'transparent',
          margin: 0,
          padding: 0,
          cursor: 'pointer',
          zIndex: 49,
        };
  const itemChoiceButtonStyle: CSSProperties = {
    border: 'none',
    background: 'transparent',
    padding: 0,
    margin: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    width: `${itemChoiceIconSizePx}px`,
    height: `${itemChoiceIconSizePx}px`,
    position: 'relative',
    overflow: 'visible',
  };
  const getItemChoiceButtonStyle = (kind: 'bomb' | 'potion'): CSSProperties => ({
    ...itemChoiceButtonStyle,
    transform: 'translateZ(0)',
    transformOrigin: 'center center',
    backfaceVisibility: 'hidden',
  });
  const getItemChoiceHoverHaloStyle = (
    kind: 'bomb' | 'potion',
  ): CSSProperties => ({
    width: `${Math.round(itemChoiceIconSizePx * 1.18)}px`,
    height: `${Math.round(itemChoiceIconSizePx * 1.18)}px`,
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%) translateZ(0)',
    borderRadius: '9999px',
    background:
      'radial-gradient(circle, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.62) 30%, rgba(255,255,255,0.36) 52%, rgba(255,255,255,0.14) 72%, rgba(255,255,255,0.04) 86%, rgba(255,255,255,0) 100%)',
    filter: 'blur(2.2px)',
    opacity: hoveredItemChoice === kind ? 1 : 0,
    transition: 'opacity 160ms ease-out',
    pointerEvents: 'none',
  });
  const itemChoiceIconStyle: CSSProperties = {
    width: `${itemChoiceIconSizePx}px`,
    height: `${itemChoiceIconSizePx}px`,
    display: 'block',
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    imageRendering: 'pixelated',
    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.28))',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitUserDrag: 'none',
    pointerEvents: 'none',
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
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitUserDrag: 'none',
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
    transform: `scale(${isActive && enableHoverClickScaling ? ACTIVE_PIECE_SCALE : 1})`,
    transition: `transform ${SCALE_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
    transformOrigin: 'center center',
  });
  const hudStatusIconSize = Math.max(
    enableFreeTileMove ? 6 : 7,
    Math.round(tilePixels * 0.42),
  );
  const hudAvatarSizePx = Math.max(
    enableFreeTileMove ? 12 : 16,
    Math.round(tilePixels * 0.64),
  );
  const hudScoreFontPx = Math.max(
    enableFreeTileMove ? 9 : 10,
    Math.round(tilePixels * 0.44),
  );
  const puzzleHudOverlapScale = enableFreeTileMove
    ? Math.max(0.3, Math.min(1, (tilePixels - 12) / 24))
    : 1;
  const puzzleHudOffsetScale = enableFreeTileMove
    ? Math.max(0, Math.min(1, (puzzleHudOverlapScale - 0.35) / 0.65))
    : 1;
  const isNarrowHudMode = enableFreeTileMove && isFullscreenThinHudMode;
  const hudActionButtonSizePx = Math.max(
    hudStatusIconSize,
    isNarrowHudMode ? THIN_HUD_ACTION_BUTTON_MIN_PX : 0,
    Math.round(
      hudStatusIconSize * (isNarrowHudMode ? THIN_HUD_ACTION_BUTTON_SCALE : 1),
    ),
  );
  const hudActionButtonRightInsetPx = isNarrowHudMode
    ? Math.min(
        THIN_HUD_ACTION_RIGHT_INSET_PX,
        Math.max(
          THIN_HUD_ACTION_RIGHT_INSET_MIN_PX,
          Math.round(renderWidth * (isBoardFullscreen ? 0.04 : 0.035)),
        ),
      )
    : 0;
  const wideHudActionButtonSpacingPx = isNarrowHudMode ? 0 : 10;
  const hudActionButtonGapPx =
    (isBoardFullscreen ? 50 : 30) +
    hudActionButtonRightInsetPx +
    wideHudActionButtonSpacingPx;
  const hudFullscreenButtonHitboxExtraPx =
    FULLSCREEN_BUTTON_HITBOX_EXTRA_PX +
    (isNarrowHudMode ? THIN_HUD_ACTION_HITBOX_EXTRA_PX : 0);
  const hudFullscreenButtonWidthPx =
    hudActionButtonSizePx + hudFullscreenButtonHitboxExtraPx;
  const hudNarrowFullscreenButtonRightPx =
    -Math.round(hudFullscreenButtonHitboxExtraPx / 2) +
    Math.round(hudActionButtonRightInsetPx * 0.25);
  const hudFullscreenButtonRightPx = isNarrowHudMode
    ? hudNarrowFullscreenButtonRightPx
    : -Math.round(hudFullscreenButtonHitboxExtraPx / 2);
  const narrowHudSideInsetPx = isNarrowHudMode
    ? Math.min(
        THIN_HUD_SIDE_SAFE_INSET_PX +
          (isBoardFullscreen ? THIN_HUD_FULLSCREEN_SIDE_EXTRA_INSET_PX : 0),
        Math.max(
          Math.round(tilePixels * 0.75),
          Math.round(renderWidth * (isBoardFullscreen ? 0.1 : 0.08)),
        ),
      )
    : 0;
  const topHudOverlapPx = Math.round(40 * puzzleHudOverlapScale);
  const bottomHudOverlapPx = Math.round(30 * puzzleHudOverlapScale);
  const hudHorizontalInsetPx = isNarrowHudMode
    ? Math.max(
        Math.round(tilePixels * 0.72),
        narrowHudSideInsetPx,
      )
    : tilePixels;
  const hudRowWidthPx = Math.max(0, renderWidth - hudHorizontalInsetPx * 2);
  const hudRowBaseStyle: CSSProperties = {
    width: `${hudRowWidthPx}px`,
    marginLeft: `${hudHorizontalInsetPx}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#808080',
    opacity: 0.69,
    lineHeight: 1,
    overflow: 'visible',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  };
  const topHudRowStyle: CSSProperties = {
    ...hudRowBaseStyle,
    marginBottom: `${Math.max(4, Math.round(tilePixels * 0.14)) - topHudOverlapPx}px`,
    transform: isBoardFullscreen
      ? `translateY(${FULLSCREEN_HUD_VERTICAL_OFFSET_PX + (isFullscreenThinHudMode ? FULLSCREEN_THIN_TOP_HUD_EXTRA_OFFSET_PX : 0)}px)`
      : undefined,
  };
  const bottomHudRowStyle: CSSProperties = {
    ...hudRowBaseStyle,
    marginTop: `${Math.max(4, Math.round(tilePixels * 0.14)) - bottomHudOverlapPx}px`,
    transform: isBoardFullscreen
      ? `translateY(${-FULLSCREEN_HUD_VERTICAL_OFFSET_PX + (isFullscreenThinHudMode ? FULLSCREEN_THIN_BOTTOM_HUD_EXTRA_OFFSET_PX : 0)}px)`
      : undefined,
  };
  const hudPlayerClusterStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${Math.max(4, Math.round(tilePixels * 0.16))}px`,
    minWidth: 0,
  };
  const hudScoreTextStyle: CSSProperties = {
    fontFamily: coordTextStyle.fontFamily,
    fontSize: `${hudScoreFontPx}px`,
    fontWeight: 600,
    color: '#6f6f6f',
    opacity: 0.8,
    minWidth: `${Math.max(8, Math.round(hudScoreFontPx * 0.6))}px`,
    textAlign: 'center',
    transform: `translateX(${HUD_SCORE_X_OFFSET_PX}px)`,
    userSelect: 'none',
    WebkitUserSelect: 'none',
  };
  const hudAvatarStyle: CSSProperties = {
    width: `${hudAvatarSizePx}px`,
    height: `${hudAvatarSizePx}px`,
    display: 'block',
    borderRadius: 0,
    objectFit: 'cover',
    imageRendering: 'auto',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitUserDrag: 'none',
  };
  const opponentHudAvatarStyle: CSSProperties = {
    ...hudAvatarStyle,
    transform: 'translateX(-1px)',
  };
  const hudStatusRowStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${Math.max(2, Math.round(tilePixels * 0.08))}px`,
  };
  const playerHudClusterStyle: CSSProperties = enableFreeTileMove
    ? {
        ...hudPlayerClusterStyle,
        transform: `translateY(${
          -Math.round(12 * puzzleHudOffsetScale) + (isSandboxFreeMoveBoard ? 5 : 0)
        }px)`,
      }
    : hudPlayerClusterStyle;
  const playerHudStatusRowStyle: CSSProperties = enableFreeTileMove
    ? {
        ...hudStatusRowStyle,
        transform: `translateY(${Math.round(3 * puzzleHudOffsetScale)}px)`,
      }
    : hudStatusRowStyle;
  const hudStatusGroupStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  };
  const hideSandboxPlayerTurnResources = isSandboxFreeMoveBoard;
  const hudStatusIconStyle: CSSProperties = {
    width: `${hudStatusIconSize}px`,
    height: `${hudStatusIconSize}px`,
    display: 'block',
    imageRendering: 'auto',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitUserDrag: 'none',
  };
  const hudResetButtonStyle: CSSProperties = {
    marginTop: '15px',
    width: `${hudActionButtonSizePx}px`,
    height: `${hudActionButtonSizePx}px`,
    border: 'none',
    background: 'transparent',
    padding: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#808080',
    opacity: 0.85,
    userSelect: 'none',
    WebkitUserSelect: 'none',
  };
  const hudActionButtonsWrapStyle: CSSProperties = {
    marginTop: '15px',
    width: `${hudActionButtonSizePx + hudActionButtonGapPx}px`,
    height: `${hudActionButtonSizePx}px`,
    position: 'relative',
    alignSelf: 'flex-end',
  };
  const getHudResetButtonStateStyle = (enabled: boolean): CSSProperties => ({
    ...hudResetButtonStyle,
    color: enabled ? '#000000' : '#808080',
    opacity: enabled ? 1 : 0.52,
    cursor: enabled ? 'pointer' : 'default',
    transition: 'color 220ms ease, opacity 220ms ease',
  });
  const getHudResetButtonOffsetStyle = (isFullscreen: boolean): CSSProperties => ({
    right: isFullscreen
      ? `${
          hudFullscreenButtonRightPx +
          hudFullscreenButtonWidthPx +
          HUD_FULLSCREEN_BUTTON_GAP_TO_RESET_PX
        }px`
      : `${
          30 +
          hudActionButtonRightInsetPx +
          wideHudActionButtonSpacingPx
        }px`,
    position: 'absolute',
    top: 0,
    marginTop: 0,
  });
  const getHudFullscreenButtonStyle = (isActive: boolean): CSSProperties => ({
    ...hudResetButtonStyle,
    marginTop: 0,
    position: 'absolute',
    right: `${
      hudFullscreenButtonRightPx
    }px`,
    top: `${-Math.round(hudFullscreenButtonHitboxExtraPx / 2)}px`,
    width: `${hudFullscreenButtonWidthPx}px`,
    height: `${hudFullscreenButtonWidthPx}px`,
    padding: `${Math.round(hudFullscreenButtonHitboxExtraPx / 2)}px`,
    boxSizing: 'border-box',
    color: isFullscreenButtonHovered ? '#fff' : isActive ? '#000' : '#6f6f6f',
    backgroundColor: isFullscreenButtonHovered ? '#000' : 'transparent',
    borderRadius: '2px',
    opacity: isFullscreenButtonHovered ? 1 : isActive ? 1 : 0.9,
    cursor: 'pointer',
    transform: isFullscreenButtonHovered ? 'translateY(-1.5px) scale(1.16)' : 'none',
    filter: isFullscreenButtonHovered ? 'brightness(1.02)' : 'none',
    willChange: 'transform, color, background-color',
    transition:
      'color 220ms ease, opacity 220ms ease, filter 180ms ease, transform 180ms ease, background-color 180ms ease',
  });
  const hudResetIconStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'block',
    transformOrigin: 'center center',
  };
  const isMoveResourceActive = (
    resourceId: string,
    resourceKind: MoveResourceKey,
  ): boolean => {
    if (selectedMoveResourceKind === 'statusMove' && resourceKind === 'statusMove') {
      return true;
    }
    return activeMoveResourceId === resourceId;
  };
  const applyItemPickupChoice = (
    choice: 'bomb' | 'potion',
    pendingChoice: PendingItemPickupChoice | null,
  ) => {
    if (pendingChoice === null) {
      return;
    }
    const {monId, itemId, targetCol, targetRow} = pendingChoice;
    setBoardEntities((currentEntities) => {
      const monIndex = currentEntities.findIndex((entity) => entity.id === monId);
      const itemIndex = currentEntities.findIndex((entity) => entity.id === itemId);
      if (monIndex === -1 || itemIndex === -1) {
        return currentEntities;
      }
      const selectedMon = currentEntities[monIndex];
      const selectedItem = currentEntities[itemIndex];
      if (
        selectedMon.kind !== 'mon' ||
        selectedMon.side === undefined ||
        selectedMon.monType === undefined ||
        selectedItem.kind !== 'item' ||
        selectedItem.isScored
      ) {
        return currentEntities;
      }
      if (!canEntityMoveToTile(selectedMon, targetCol, targetRow)) {
        return currentEntities;
      }
      const isTargetOccupied = currentEntities.some(
        (entity) =>
          entity.id !== selectedMon.id &&
          entity.id !== selectedItem.id &&
          !entity.isScored &&
          entity.carriedByDrainerId === undefined &&
          entity.col === targetCol &&
          entity.row === targetRow,
      );
      if (isTargetOccupied) {
        return currentEntities;
      }
      const nextEntities = [...currentEntities];
      nextEntities[monIndex] = {
        ...selectedMon,
        col: targetCol,
        row: targetRow,
        heldItemKind:
          choice === 'bomb' ? 'bomb' : selectedMon.heldItemKind,
      };
      const carriedManaIndex = currentEntities.findIndex(
        (entity) =>
          !entity.isScored &&
          entity.carriedByDrainerId === selectedMon.id &&
          (entity.kind === 'whiteMana' ||
            entity.kind === 'blackMana' ||
            entity.kind === 'superMana'),
      );
      if (carriedManaIndex !== -1) {
        nextEntities[carriedManaIndex] = {
          ...nextEntities[carriedManaIndex],
          col: targetCol,
          row: targetRow,
        };
      }
      nextEntities[itemIndex] = {
        ...selectedItem,
        isScored: true,
      };
      return nextEntities;
    });
    if (choice === 'potion') {
      setPlayerPotionCount((prev) => prev + 1);
    }
    setSelectedTile({row: targetRow, col: targetCol});
    setPendingItemPickupChoice(null);
    setPendingDemonRebound(null);
    setPendingSpiritPush(null);
    setHoveredItemChoice(null);
  };
  const resetBoardToInitialPuzzleState = () => {
    if (!hasPuzzleBoardChanges || isResetAnimating) {
      return;
    }
    clearAllScoredManaFadeTimers();
    clearAllManaPoolPulseTimers();
    setScoredManaFadeSpritesById({});
    setManaPoolPulseSprites([]);
    if (resetIconRef.current !== null) {
      resetIconRef.current.getAnimations().forEach((animation) => {
        animation.cancel();
      });
      resetIconRef.current.animate(
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
    const initialEntityById = new Map(
      initialBoardEntities.map((entity) => [entity.id, entity]),
    );
    const scoredManaEntityIds = boardEntities
      .filter((entity) => entity.isScored && isManaEntityKind(entity.kind))
      .map((entity) => entity.id);
    const currentVisibleOccupiedTileKeySet = new Set(
      boardEntities
        .filter((entity) => entity.carriedByDrainerId === undefined && !entity.isScored)
        .map((entity) => toTileKey(entity.col, entity.row)),
    );
    const initialVisibleOccupiedTileKeySet = new Set(
      initialBoardEntities
        .filter((entity) => entity.carriedByDrainerId === undefined && !entity.isScored)
        .map((entity) => toTileKey(entity.col, entity.row)),
    );
    const allGhostTileKeys = new Set(
      showSpawnGhosts
        ? [
            ...spawnGhosts.map((ghost) => toTileKey(ghost.col, ghost.row)),
            ...(enableFreeTileMove
              ? puzzleStartGhosts.map((ghost) => toTileKey(ghost.col, ghost.row))
              : []),
          ]
        : [],
    );
    const resetGhostFadeTileKeys = Array.from(allGhostTileKeys).filter(
      (tileKey) =>
        currentVisibleOccupiedTileKeySet.has(tileKey) &&
        !initialVisibleOccupiedTileKeySet.has(tileKey),
    );
    const nextAnimationById: Record<string, ResetAnimationStep> = {};
    boardEntities.forEach((entity) => {
      const initialEntity = initialEntityById.get(entity.id);
      if (initialEntity === undefined) {
        return;
      }
      if (entity.isScored) {
        return;
      }
      if (entity.col === initialEntity.col && entity.row === initialEntity.row) {
        return;
      }
      nextAnimationById[entity.id] = {
        fromCol: entity.col,
        fromRow: entity.row,
        toCol: initialEntity.col,
        toRow: initialEntity.row,
      };
    });
    setBoardEntities(initialBoardEntities);
    setPlayerScore(initialScores.white);
    setOpponentScore(initialScores.black);
    setPlayerPotionCount(playerStartingPotionCount);
    setFaintedMonIdSet(new Set());
    previouslyScoredManaIdsRef.current = new Set();
    triggerResetFadeInForEntities(scoredManaEntityIds);
    triggerGhostFadeInForTiles(resetGhostFadeTileKeys);
    const hasAnimationSteps = Object.keys(nextAnimationById).length > 0;
    if (hasAnimationSteps) {
      setResetAnimation({
        startedAtMs: performance.now(),
        durationMs: PUZZLE_RESET_ANIMATION_MS,
        byId: nextAnimationById,
      });
      setResetAnimationProgress(0);
    } else {
      setResetAnimation(null);
      setResetAnimationProgress(1);
    }
    setHoveredTile(null);
    setSelectedTile(null);
    setHoveredMoveResourceId(null);
    setSelectedMoveResourceId(null);
    setPendingItemPickupChoice(null);
    setPendingDemonRebound(null);
    setPendingSpiritPush(null);
    setHoveredItemChoice(null);
    setScaledTile(null);
    setScaledFactor(1);
    scaledFactorRef.current = 1;
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
  const previewTitleLinkStyle: CSSProperties = {
    color: '#0000EE',
    textDecoration: 'underline',
    pointerEvents: 'auto',
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
  const thinPreviewHintRowStyle: CSSProperties = {
    width: `${renderWidth}px`,
    display: 'block',
    position: 'relative',
    alignSelf: 'flex-start',
    height: `${Math.max(12, Math.round(previewTextFontPx * 1.35))}px`,
    marginBottom: `${Math.max(6, Math.round(tilePixels * 0.2))}px`,
    overflow: 'visible',
  };
  const thinPreviewHintContentStyle: CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: 'calc(50% + 14px)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: `${Math.max(8, Math.round(previewTextFontPx * 0.9))}px`,
    fontSize: `${previewTextFontPx}px`,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    transform: `translate(-50%, -50%) scale(${thinHintScale})`,
    transformOrigin: 'center center',
  };
  const thinPreviewHintPrimaryTextStyle: CSSProperties = {
    ...previewHintPrimaryTextStyle,
    whiteSpace: 'nowrap',
  };
  const thinPreviewHintLinkStyle: CSSProperties = {
    ...previewHintLinkStyle,
    marginTop: 0,
    whiteSpace: 'nowrap',
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
            : selectedBoardScaleGroup !== null
              ? monTileKeysByType[selectedBoardScaleGroup].has(tileKey)
              : false;
    const isSingleActive =
      scaledTile !== null &&
      scaledTile.row === row &&
      scaledTile.col === col;
    const isActive = enableHoverClickScaling && (isGroupActive || isSingleActive);
    const scale = isActive ? scaledFactor : 1;
    const snapToPixelUnits = (value: number): number => Math.round(value * tilePixels) / tilePixels;
    const size = Math.max(1 / tilePixels, snapToPixelUnits(scale));
    const offset = (size - 1) / 2;
    return {
      x: snapToPixelUnits(col - offset),
      y: snapToPixelUnits(row - offset),
      size,
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
  const spawnGhostSizePx = Math.max(1, Math.round(tilePixels * SPAWN_GHOST_SCALE));
  const spawnGhostInsetPx = Math.max(0, Math.floor((tilePixels - spawnGhostSizePx) / 2));
  const spawnGhostSizeUnits = spawnGhostSizePx / tilePixels;
  const spawnGhostInsetUnits = spawnGhostInsetPx / tilePixels;
  const puzzleStartGhostSizePx = Math.max(1, Math.round(tilePixels * PUZZLE_START_GHOST_SCALE));
  const puzzleStartGhostInsetPx = Math.max(0, Math.floor((tilePixels - puzzleStartGhostSizePx) / 2));
  const puzzleStartGhostSizeUnits = puzzleStartGhostSizePx / tilePixels;
  const puzzleStartGhostInsetUnits = puzzleStartGhostInsetPx / tilePixels;
  const heldManaOffsetXUnits = HELD_MANA_OFFSET_X_PX / tilePixels;
  const heldManaOffsetYUnits = HELD_MANA_OFFSET_Y_PX / tilePixels;
  const heldSuperManaOffsetXUnits = HELD_SUPER_MANA_OFFSET_X_PX / tilePixels;
  const heldSuperManaOffsetYUnits = HELD_SUPER_MANA_OFFSET_Y_PX / tilePixels;
  const heldBombOffsetXUnits = HELD_BOMB_OFFSET_X_PX / tilePixels;
  const heldBombOffsetYUnits = HELD_BOMB_OFFSET_Y_PX / tilePixels;
  function triggerResetFadeInForEntities(entityIds: string[]) {
    if (resetFadeFrameRef.current !== null) {
      window.cancelAnimationFrame(resetFadeFrameRef.current);
      resetFadeFrameRef.current = null;
    }
    if (resetFadeTimeoutRef.current !== null) {
      window.clearTimeout(resetFadeTimeoutRef.current);
      resetFadeTimeoutRef.current = null;
    }
    if (entityIds.length === 0) {
      setResetFadeInByEntityId({});
      return;
    }
    const hiddenState = entityIds.reduce<Record<string, boolean>>((result, entityId) => {
      result[entityId] = false;
      return result;
    }, {});
    const shownState = entityIds.reduce<Record<string, boolean>>((result, entityId) => {
      result[entityId] = true;
      return result;
    }, {});
    setResetFadeInByEntityId(hiddenState);
    resetFadeFrameRef.current = window.requestAnimationFrame(() => {
      resetFadeFrameRef.current = window.requestAnimationFrame(() => {
        setResetFadeInByEntityId(shownState);
        resetFadeFrameRef.current = null;
        resetFadeTimeoutRef.current = window.setTimeout(() => {
          setResetFadeInByEntityId({});
          resetFadeTimeoutRef.current = null;
        }, RESET_SCORED_MANA_FADE_MS);
      });
    });
  }
  function triggerGhostFadeInForTiles(tileKeys: string[]) {
    if (resetGhostFadeFrameRef.current !== null) {
      window.cancelAnimationFrame(resetGhostFadeFrameRef.current);
      resetGhostFadeFrameRef.current = null;
    }
    if (resetGhostFadeTimeoutRef.current !== null) {
      window.clearTimeout(resetGhostFadeTimeoutRef.current);
      resetGhostFadeTimeoutRef.current = null;
    }
    if (tileKeys.length === 0) {
      setResetGhostFadeInByTileKey({});
      return;
    }
    const hiddenState = tileKeys.reduce<Record<string, boolean>>((result, tileKey) => {
      result[tileKey] = false;
      return result;
    }, {});
    const shownState = tileKeys.reduce<Record<string, boolean>>((result, tileKey) => {
      result[tileKey] = true;
      return result;
    }, {});
    setResetGhostFadeInByTileKey(hiddenState);
    resetGhostFadeFrameRef.current = window.requestAnimationFrame(() => {
      resetGhostFadeFrameRef.current = window.requestAnimationFrame(() => {
        setResetGhostFadeInByTileKey(shownState);
        resetGhostFadeFrameRef.current = null;
        resetGhostFadeTimeoutRef.current = window.setTimeout(() => {
          setResetGhostFadeInByTileKey({});
          resetGhostFadeTimeoutRef.current = null;
        }, RESET_GHOST_FADE_MS);
      });
    });
  }
  function getEntityImageStyle(entityId: string): CSSProperties {
    if (!(entityId in resetFadeInByEntityId)) {
      return boardPieceImageStyle;
    }
    return {
      ...boardPieceImageStyle,
      opacity: resetFadeInByEntityId[entityId] ? 1 : 0,
      transition: `opacity ${RESET_SCORED_MANA_FADE_MS}ms ease-out`,
    };
  }
  function getGhostImageStyle(tileKey: string, baseOpacity: number): CSSProperties {
    if (!(tileKey in resetGhostFadeInByTileKey)) {
      return {
        ...boardPieceImageStyle,
        opacity: baseOpacity,
      };
    }
    return {
      ...boardPieceImageStyle,
      opacity: resetGhostFadeInByTileKey[tileKey] ? baseOpacity : 0,
      transition: `opacity ${RESET_GHOST_FADE_MS}ms ease-out`,
    };
  }
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const tileKey = `${row}-${col}`;
      const hasSelectablePiece = pieceByTile[tileKey] !== undefined;
      const canMoveSelectedPiece =
        !isResetAnimating &&
        enableFreeTileMove &&
        selectedTile !== null &&
        movableEntityTileKeySet.has(`${selectedTile.row}-${selectedTile.col}`);
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
            cursor:
              !isResetAnimating &&
              !isItemPickupChoiceOpen &&
              (hasSelectablePiece || canMoveSelectedPiece)
                ? 'pointer'
                : 'default',
          }}
          onMouseEnter={() => {
            if (isResetAnimating || isItemPickupChoiceOpen) {
              return;
            }
            setHoveredTile({row, col});
          }}
          onClick={() => {
            if (isResetAnimating || isItemPickupChoiceOpen) {
              return;
            }
            const targetTile = {row, col};
            const targetTileKey = `${row}-${col}`;
            const selectedTileKey =
              selectedTile !== null ? `${selectedTile.row}-${selectedTile.col}` : null;
            setSelectedMoveResourceId(null);
            if (pendingDemonRebound !== null) {
              const reboundChoice = pendingDemonRebound.reboundOptions.find(
                (option) => option.col === col && option.row === row,
              );
              if (reboundChoice === undefined) {
                setPendingDemonRebound(null);
                setSelectedTile({
                  row: pendingDemonRebound.sourceRow,
                  col: pendingDemonRebound.sourceCol,
                });
                return;
              }
              const pendingReboundTargetEntity = visibleBoardEntities.find(
                (entity) => entity.id === pendingDemonRebound.targetId,
              );
              const pendingReboundTargetHasBomb =
                pendingReboundTargetEntity?.kind === 'mon' &&
                pendingReboundTargetEntity.heldItemKind === 'bomb';
              const pendingReboundAttackerEntity = visibleBoardEntities.find(
                (entity) => entity.id === pendingDemonRebound.attackerId,
              );
              const pendingReboundAttackerSpawnTile =
                pendingReboundAttackerEntity !== undefined &&
                pendingReboundAttackerEntity.kind === 'mon' &&
                pendingReboundAttackerEntity.side !== undefined &&
                pendingReboundAttackerEntity.monType !== undefined
                  ? getMonSpawnTile(
                      pendingReboundAttackerEntity.side,
                      pendingReboundAttackerEntity.monType,
                    )
                  : null;
              setBoardEntities((currentEntities) => {
                const sourceIndex = currentEntities.findIndex(
                  (entity) => entity.id === pendingDemonRebound.attackerId,
                );
                const targetIndex = currentEntities.findIndex(
                  (entity) => entity.id === pendingDemonRebound.targetId,
                );
                if (sourceIndex === -1 || targetIndex === -1) {
                  return currentEntities;
                }
                const sourceMon = currentEntities[sourceIndex];
                const targetMon = currentEntities[targetIndex];
                if (
                  sourceMon.kind !== 'mon' ||
                  sourceMon.monType !== 'demon' ||
                  sourceMon.side === undefined ||
                  targetMon.kind !== 'mon' ||
                  targetMon.side === undefined ||
                  targetMon.monType === undefined
                ) {
                  return currentEntities;
                }
                if (sourceMon.side === targetMon.side) {
                  return currentEntities;
                }
                if (!canEntityMoveToTile(sourceMon, reboundChoice.col, reboundChoice.row)) {
                  return currentEntities;
                }
                const isReboundTileOccupied = currentEntities.some(
                  (entity) =>
                    entity.id !== sourceMon.id &&
                    entity.id !== targetMon.id &&
                    !entity.isScored &&
                    entity.carriedByDrainerId === undefined &&
                    entity.col === reboundChoice.col &&
                    entity.row === reboundChoice.row,
                );
                if (isReboundTileOccupied) {
                  return currentEntities;
                }
                const respawnTile = getMonSpawnTile(targetMon.side, targetMon.monType);
                if (respawnTile === null) {
                  return currentEntities;
                }
                if (
                  reboundChoice.col === respawnTile.col &&
                  reboundChoice.row === respawnTile.row
                ) {
                  return currentEntities;
                }
                const isRespawnTileOccupied = currentEntities.some(
                  (entity) =>
                    entity.id !== sourceMon.id &&
                    entity.id !== targetMon.id &&
                    !entity.isScored &&
                    entity.carriedByDrainerId === undefined &&
                    entity.col === respawnTile.col &&
                    entity.row === respawnTile.row,
                );
                if (isRespawnTileOccupied) {
                  return currentEntities;
                }
                const targetOriginalCol = targetMon.col;
                const targetOriginalRow = targetMon.row;
                const nextEntities = [...currentEntities];
                const doesTargetHoldBomb = targetMon.heldItemKind === 'bomb';
                const attackerRespawnTile = doesTargetHoldBomb
                  ? getMonSpawnTile(sourceMon.side, sourceMon.monType)
                  : null;
                if (doesTargetHoldBomb && attackerRespawnTile === null) {
                  return currentEntities;
                }
                if (attackerRespawnTile !== null) {
                  const isAttackerRespawnTileOccupied = currentEntities.some(
                    (entity) =>
                      entity.id !== sourceMon.id &&
                      entity.id !== targetMon.id &&
                      !entity.isScored &&
                      entity.carriedByDrainerId === undefined &&
                      entity.col === attackerRespawnTile.col &&
                      entity.row === attackerRespawnTile.row,
                  );
                  if (isAttackerRespawnTileOccupied) {
                    return currentEntities;
                  }
                }
                nextEntities[sourceIndex] = {
                  ...sourceMon,
                  col: attackerRespawnTile?.col ?? reboundChoice.col,
                  row: attackerRespawnTile?.row ?? reboundChoice.row,
                  heldItemKind:
                    attackerRespawnTile !== null && sourceMon.heldItemKind === 'bomb'
                      ? undefined
                      : sourceMon.heldItemKind,
                };
                nextEntities[targetIndex] = {
                  ...targetMon,
                  col: respawnTile.col,
                  row: respawnTile.row,
                  heldItemKind:
                    targetMon.heldItemKind === 'bomb'
                      ? undefined
                      : targetMon.heldItemKind,
                };
                dropFaintedDrainerCarriedMana(
                  currentEntities,
                  nextEntities,
                  targetMon.id,
                  targetMon.monType,
                  targetOriginalCol,
                  targetOriginalRow,
                );
                return nextEntities;
              });
              markMonAsFaintedOnSpawn(pendingDemonRebound.targetId);
              if (pendingReboundTargetHasBomb) {
                markMonAsFaintedOnSpawn(pendingDemonRebound.attackerId);
              }
              triggerAttackEffect(
                pendingReboundTargetHasBomb ? 'bomb' : 'demon',
                pendingDemonRebound.targetCol,
                pendingDemonRebound.targetRow,
              );
              setPendingDemonRebound(null);
              if (pendingReboundTargetHasBomb && pendingReboundAttackerSpawnTile !== null) {
                setSelectedTile({
                  row: pendingReboundAttackerSpawnTile.row,
                  col: pendingReboundAttackerSpawnTile.col,
                });
              } else {
                setSelectedTile({row: reboundChoice.row, col: reboundChoice.col});
              }
              return;
            }
            if (pendingSpiritPush !== null) {
              const destinationChoice = pendingSpiritPush.destinationOptions.find(
                (option) => option.col === col && option.row === row,
              );
              if (destinationChoice === undefined) {
                setPendingSpiritPush(null);
                setSelectedTile({
                  row: pendingSpiritPush.sourceRow,
                  col: pendingSpiritPush.sourceCol,
                });
                return;
              }
              const spiritPushTargetEntity = visibleBoardEntities.find(
                (entity) => entity.id === pendingSpiritPush.targetId,
              );
              const scoredSpiritPushedMana =
                spiritPushTargetEntity !== undefined &&
                isManaEntityKind(spiritPushTargetEntity.kind) &&
                cornerManaPoolTileKeySet.has(
                  toTileKey(destinationChoice.col, destinationChoice.row),
                )
                  ? {
                      id: spiritPushTargetEntity.id,
                      href: spiritPushTargetEntity.href,
                      col: destinationChoice.col,
                      row: destinationChoice.row,
                    }
                  : null;
              setBoardEntities((currentEntities) => {
                const spiritIndex = currentEntities.findIndex(
                  (entity) => entity.id === pendingSpiritPush.spiritId,
                );
                const targetIndex = currentEntities.findIndex(
                  (entity) => entity.id === pendingSpiritPush.targetId,
                );
                if (spiritIndex === -1 || targetIndex === -1) {
                  return currentEntities;
                }
                const spirit = currentEntities[spiritIndex];
                const target = currentEntities[targetIndex];
                if (
                  spirit.kind !== 'mon' ||
                  spirit.monType !== 'spirit' ||
                  spirit.side === undefined ||
                  target.isScored
                ) {
                  return currentEntities;
                }
                if (!canEntityMoveToTile(target, destinationChoice.col, destinationChoice.row)) {
                  return currentEntities;
                }
                const isDestinationOccupied = currentEntities.some(
                  (entity) =>
                    entity.id !== target.id &&
                    !entity.isScored &&
                    entity.carriedByDrainerId === undefined &&
                    entity.col === destinationChoice.col &&
                    entity.row === destinationChoice.row,
                );
                if (isDestinationOccupied) {
                  return currentEntities;
                }
                const nextEntities = [...currentEntities];
                const isDestinationManaPool = cornerManaPoolTileKeySet.has(
                  toTileKey(destinationChoice.col, destinationChoice.row),
                );
                nextEntities[targetIndex] = {
                  ...target,
                  col: destinationChoice.col,
                  row: destinationChoice.row,
                  isScored:
                    isDestinationManaPool && isManaEntityKind(target.kind)
                      ? true
                      : target.isScored,
                  carriedByDrainerId:
                    isDestinationManaPool && isManaEntityKind(target.kind)
                      ? undefined
                      : target.carriedByDrainerId,
                };
                if (target.kind === 'mon' && target.monType === 'drainer') {
                  const carriedManaIndex = currentEntities.findIndex(
                    (entity) =>
                      !entity.isScored &&
                      entity.carriedByDrainerId === target.id &&
                      (entity.kind === 'whiteMana' ||
                        entity.kind === 'blackMana' ||
                        entity.kind === 'superMana'),
                  );
                  if (carriedManaIndex !== -1) {
                    nextEntities[carriedManaIndex] = {
                      ...nextEntities[carriedManaIndex],
                      col: destinationChoice.col,
                      row: destinationChoice.row,
                    };
                  }
                }
                return nextEntities;
              });
              if (scoredSpiritPushedMana !== null) {
                triggerScoredManaFadeOut(scoredSpiritPushedMana);
                triggerManaPoolScorePulse(
                  scoredSpiritPushedMana.col,
                  scoredSpiritPushedMana.row,
                );
              }
              setPendingSpiritPush(null);
              setSelectedTile({
                row: pendingSpiritPush.sourceRow,
                col: pendingSpiritPush.sourceCol,
              });
              return;
            }
            if (
              enableFreeTileMove &&
              selectedTile !== null &&
              isSameTile(selectedTile, targetTile)
            ) {
              setSelectedTile(null);
              return;
            }
            const hasMovableEntityAtTarget = movableEntityTileKeySet.has(targetTileKey);
            if (
              enableFreeTileMove &&
              selectedTile !== null &&
              selectedTileKey !== null &&
              movableEntityTileKeySet.has(selectedTileKey)
            ) {
              const sourceRow = selectedTile.row;
              const sourceCol = selectedTile.col;
              const selectedEntity = visibleBoardEntities.find(
                (entity) => entity.row === sourceRow && entity.col === sourceCol,
              );
              if (selectedEntity === undefined) {
                return;
              }
              if (selectedEntity.kind === 'item') {
                if (isSameTile(selectedTile, targetTile)) {
                  setSelectedTile(null);
                  return;
                }
                if (hasMovableEntityAtTarget && !isSameTile(selectedTile, targetTile)) {
                  setSelectedTile(targetTile);
                  return;
                }
                setBoardEntities((currentEntities) => {
                  const sourceIndex = currentEntities.findIndex(
                    (entity) => entity.id === selectedEntity.id,
                  );
                  if (sourceIndex === -1) {
                    return currentEntities;
                  }
                  const sourceEntity = currentEntities[sourceIndex];
                  if (sourceEntity.kind !== 'item' || sourceEntity.isScored) {
                    return currentEntities;
                  }
                  const isTargetOccupied = currentEntities.some(
                    (entity) =>
                      entity.id !== sourceEntity.id &&
                      !entity.isScored &&
                      entity.carriedByDrainerId === undefined &&
                      entity.col === col &&
                      entity.row === row,
                  );
                  if (isTargetOccupied) {
                    return currentEntities;
                  }
                  const nextEntities = [...currentEntities];
                  nextEntities[sourceIndex] = {
                    ...sourceEntity,
                    col,
                    row,
                  };
                  return nextEntities;
                });
                setSelectedTile(targetTile);
                return;
              }
              const carriedManaEntity = boardEntities.find(
                (entity) =>
                  entity.carriedByDrainerId === selectedEntity.id &&
                  !entity.isScored &&
                  (entity.kind === 'whiteMana' ||
                    entity.kind === 'blackMana' ||
                    entity.kind === 'superMana'),
              );
              const targetEntity = visibleBoardEntities.find(
                (entity) => entity.row === row && entity.col === col,
              );
              const isTargetManaPool = cornerManaPoolTileKeySet.has(toTileKey(col, row));
              const isSelectedDrainer =
                selectedEntity.kind === 'mon' &&
                selectedEntity.side !== undefined &&
                selectedEntity.monType === 'drainer';
              const isTargetManaEntity =
                targetEntity !== undefined &&
                (targetEntity.kind === 'whiteMana' ||
                  targetEntity.kind === 'blackMana' ||
                  targetEntity.kind === 'superMana');
              const isTargetProtectedByAngel =
                targetEntity !== undefined &&
                targetEntity.kind === 'mon' &&
                targetEntity.side !== undefined &&
                targetEntity.monType !== undefined &&
                getProtectingAngelsForTarget(targetEntity).length > 0;
              const isTargetMonFainted =
                targetEntity !== undefined &&
                targetEntity.kind === 'mon' &&
                targetEntity.side !== undefined &&
                targetEntity.monType !== undefined &&
                isMonCurrentlyFainted(targetEntity);
              const isSelectedAbilityBlockedOnOwnSpawn =
                selectedEntity.kind === 'mon' &&
                selectedEntity.side !== undefined &&
                selectedEntity.monType !== undefined &&
                isAbilityUserBlockedOnOwnSpawn(selectedEntity);
              const targetItemEntity =
                targetEntity !== undefined && targetEntity.kind === 'item'
                  ? targetEntity
                  : null;
              const canSpiritPushTargetEntity =
                selectedEntity.kind === 'mon' &&
                selectedEntity.side !== undefined &&
                selectedEntity.monType === 'spirit' &&
                targetEntity !== undefined &&
                targetEntity.id !== selectedEntity.id &&
                !isSelectedAbilityBlockedOnOwnSpawn &&
                !isTargetMonFainted &&
                isSpiritPushTargetDistance(sourceCol, sourceRow, col, row);
              if (canSpiritPushTargetEntity) {
                const destinationOptions = getSpiritPushDestinationOptions(targetEntity);
                if (destinationOptions.length > 0) {
                  setPendingSpiritPush({
                    spiritId: selectedEntity.id,
                    targetId: targetEntity.id,
                    sourceCol,
                    sourceRow,
                    destinationOptions,
                  });
                } else {
                  setPendingSpiritPush(null);
                }
                setSelectedTile({row: sourceRow, col: sourceCol});
                return;
              }

              if (selectedEntity.kind === 'mon' && targetItemEntity !== null) {
                if (!canEntityMoveToTile(selectedEntity, col, row)) {
                  return;
                }
                const nextPendingPickupChoice: PendingItemPickupChoice = {
                  monId: selectedEntity.id,
                  itemId: targetItemEntity.id,
                  targetCol: col,
                  targetRow: row,
                };
                const shouldAutoSelectPotion =
                  isSelectedDrainer &&
                  carriedManaEntity !== undefined;
                if (shouldAutoSelectPotion) {
                  applyItemPickupChoice('potion', nextPendingPickupChoice);
                } else {
                  setPendingItemPickupChoice(nextPendingPickupChoice);
                }
                return;
              }

              const canThrowBombAtEnemyMon =
                selectedEntity.kind === 'mon' &&
                selectedEntity.side !== undefined &&
                selectedEntity.heldItemKind === 'bomb' &&
                targetEntity !== undefined &&
                targetEntity.kind === 'mon' &&
                targetEntity.side !== undefined &&
                targetEntity.monType !== undefined &&
                !isTargetMonFainted &&
                selectedEntity.side !== targetEntity.side &&
                Math.max(
                  Math.abs(col - sourceCol),
                  Math.abs(row - sourceRow),
                ) <= 3 &&
                (col !== sourceCol || row !== sourceRow);
              if (canThrowBombAtEnemyMon) {
                setBoardEntities((currentEntities) => {
                  const sourceIndex = currentEntities.findIndex(
                    (entity) => entity.id === selectedEntity.id,
                  );
                  const targetIndex = currentEntities.findIndex(
                    (entity) => entity.id === targetEntity.id,
                  );
                  if (sourceIndex === -1 || targetIndex === -1) {
                    return currentEntities;
                  }
                  const sourceMon = currentEntities[sourceIndex];
                  const targetMon = currentEntities[targetIndex];
                  if (
                    sourceMon.kind !== 'mon' ||
                    sourceMon.side === undefined ||
                    sourceMon.heldItemKind !== 'bomb' ||
                    targetMon.kind !== 'mon' ||
                    targetMon.side === undefined ||
                    targetMon.monType === undefined ||
                    sourceMon.side === targetMon.side
                  ) {
                    return currentEntities;
                  }
                  const inBombRange =
                    Math.max(
                      Math.abs(targetMon.col - sourceMon.col),
                      Math.abs(targetMon.row - sourceMon.row),
                    ) <= 3 &&
                    (targetMon.col !== sourceMon.col ||
                      targetMon.row !== sourceMon.row);
                  if (!inBombRange) {
                    return currentEntities;
                  }
                  const respawnTile = getMonSpawnTile(targetMon.side, targetMon.monType);
                  if (respawnTile === null) {
                    return currentEntities;
                  }
                  const isAlreadyOnSpawn =
                    targetMon.col === respawnTile.col &&
                    targetMon.row === respawnTile.row;
                  if (!isAlreadyOnSpawn) {
                    const isRespawnTileOccupied = currentEntities.some(
                      (entity) =>
                        entity.id !== targetMon.id &&
                        !entity.isScored &&
                        entity.carriedByDrainerId === undefined &&
                        entity.col === respawnTile.col &&
                        entity.row === respawnTile.row,
                    );
                    if (isRespawnTileOccupied) {
                      return currentEntities;
                    }
                  }
                  const nextEntities = [...currentEntities];
                  nextEntities[sourceIndex] = {
                    ...sourceMon,
                    heldItemKind: undefined,
                  };
                  const targetOriginalCol = targetMon.col;
                  const targetOriginalRow = targetMon.row;
                  nextEntities[targetIndex] = {
                    ...targetMon,
                    col: respawnTile.col,
                    row: respawnTile.row,
                    heldItemKind:
                      targetMon.heldItemKind === 'bomb'
                        ? undefined
                        : targetMon.heldItemKind,
                  };
                  dropFaintedDrainerCarriedMana(
                    currentEntities,
                    nextEntities,
                    targetMon.id,
                    targetMon.monType,
                    targetOriginalCol,
                    targetOriginalRow,
                  );
                  return nextEntities;
                });
                markMonAsFaintedOnSpawn(targetEntity.id);
                triggerAttackEffect('bomb', col, row);
                setSelectedTile({row: sourceRow, col: sourceCol});
                return;
              }

              if (isSelectedDrainer && isTargetManaEntity) {
                if (selectedEntity.heldItemKind === 'bomb') {
                  return;
                }
                if (!canEntityMoveToTile(selectedEntity, targetEntity.col, targetEntity.row)) {
                  return;
                }
                setBoardEntities((currentEntities) => {
                  const sourceIndex = currentEntities.findIndex(
                    (entity) => entity.id === selectedEntity.id,
                  );
                  const targetManaIndex = currentEntities.findIndex(
                    (entity) => entity.id === targetEntity.id,
                  );
                  if (sourceIndex === -1 || targetManaIndex === -1) {
                    return currentEntities;
                  }
                  const sourceDrainer = currentEntities[sourceIndex];
                  const targetMana = currentEntities[targetManaIndex];
                  if (
                    sourceDrainer.kind !== 'mon' ||
                    sourceDrainer.monType !== 'drainer' ||
                    sourceDrainer.side === undefined ||
                    (targetMana.kind !== 'whiteMana' &&
                      targetMana.kind !== 'blackMana' &&
                      targetMana.kind !== 'superMana')
                  ) {
                    return currentEntities;
                  }
                  const sourceDrainerCol = sourceDrainer.col;
                  const sourceDrainerRow = sourceDrainer.row;
                  const carriedIndex = currentEntities.findIndex(
                    (entity) =>
                      !entity.isScored &&
                      entity.carriedByDrainerId === sourceDrainer.id &&
                      (entity.kind === 'whiteMana' ||
                        entity.kind === 'blackMana' ||
                        entity.kind === 'superMana'),
                  );
                  const nextEntities = [...currentEntities];
                  nextEntities[sourceIndex] = {
                    ...sourceDrainer,
                    col: targetMana.col,
                    row: targetMana.row,
                  };
                  if (carriedIndex !== -1 && carriedIndex !== targetManaIndex) {
                    const carriedMana = currentEntities[carriedIndex];
                    nextEntities[carriedIndex] = {
                      ...carriedMana,
                      col: sourceDrainerCol,
                      row: sourceDrainerRow,
                      carriedByDrainerId: undefined,
                    };
                  }
                  nextEntities[targetManaIndex] = {
                    ...targetMana,
                    col: targetMana.col,
                    row: targetMana.row,
                    carriedByDrainerId: sourceDrainer.id,
                  };
                  return nextEntities;
                });
                setSelectedTile(targetTile);
                return;
              }

              if (isSelectedDrainer && carriedManaEntity !== undefined) {
                const ownDrainerSpawnTile = getMonSpawnTile(
                  selectedEntity.side,
                  'drainer',
                );
                const isDropTargetCenter =
                  isCenterSuperManaTile(col, row) &&
                  targetEntity === undefined;
                const isCarriedSuperMana = carriedManaEntity.kind === 'superMana';
                const shouldDropOnCenter = isDropTargetCenter && !isCarriedSuperMana;
                const isDropTargetOwnSpawn =
                  ownDrainerSpawnTile !== null &&
                  ownDrainerSpawnTile.col === col &&
                  ownDrainerSpawnTile.row === row &&
                  targetEntity === undefined;
                if (shouldDropOnCenter || isDropTargetOwnSpawn) {
                  if (!canEntityMoveToTile(selectedEntity, col, row)) {
                    return;
                  }
                  setBoardEntities((currentEntities) => {
                    const sourceIndex = currentEntities.findIndex(
                      (entity) => entity.id === selectedEntity.id,
                    );
                    const carriedIndex = currentEntities.findIndex(
                      (entity) => entity.id === carriedManaEntity.id,
                    );
                    if (sourceIndex === -1 || carriedIndex === -1) {
                      return currentEntities;
                    }
                    const sourceDrainer = currentEntities[sourceIndex];
                    const carriedMana = currentEntities[carriedIndex];
                    if (
                      sourceDrainer.kind !== 'mon' ||
                      sourceDrainer.monType !== 'drainer' ||
                      sourceDrainer.side === undefined ||
                      (carriedMana.kind !== 'whiteMana' &&
                        carriedMana.kind !== 'blackMana' &&
                        carriedMana.kind !== 'superMana')
                    ) {
                      return currentEntities;
                    }
                    const isTargetOccupied = currentEntities.some(
                      (entity) =>
                        entity.id !== sourceDrainer.id &&
                        entity.id !== carriedMana.id &&
                        !entity.isScored &&
                        entity.carriedByDrainerId === undefined &&
                        entity.col === col &&
                        entity.row === row,
                    );
                    if (isTargetOccupied) {
                      return currentEntities;
                    }
                    const sourceDrainerCol = sourceDrainer.col;
                    const sourceDrainerRow = sourceDrainer.row;
                    const nextEntities = [...currentEntities];
                    nextEntities[sourceIndex] = {
                      ...sourceDrainer,
                      col,
                      row,
                    };
                    nextEntities[carriedIndex] = {
                      ...carriedMana,
                      col: sourceDrainerCol,
                      row: sourceDrainerRow,
                      carriedByDrainerId: undefined,
                    };
                    return nextEntities;
                  });
                  setSelectedTile(targetTile);
                  return;
                }
              }
              const canMysticAttackEnemyMon =
                selectedEntity.kind === 'mon' &&
                selectedEntity.side !== undefined &&
                selectedEntity.monType === 'mystic' &&
                targetEntity !== undefined &&
                targetEntity.kind === 'mon' &&
                targetEntity.side !== undefined &&
                targetEntity.monType !== undefined &&
                !isSelectedAbilityBlockedOnOwnSpawn &&
                !isTargetMonFainted &&
                !isTargetProtectedByAngel &&
                selectedEntity.side !== targetEntity.side &&
                Math.abs(col - sourceCol) === 2 &&
                Math.abs(row - sourceRow) === 2;
              if (canMysticAttackEnemyMon) {
                const targetSpawnTile = getMonSpawnTile(
                  targetEntity.side,
                  targetEntity.monType,
                );
                const canRespawnTargetOnSpawnTile =
                  targetSpawnTile !== null &&
                  !visibleBoardEntities.some(
                    (entity) =>
                      entity.id !== targetEntity.id &&
                      entity.col === targetSpawnTile.col &&
                      entity.row === targetSpawnTile.row,
                  );
                if (canRespawnTargetOnSpawnTile) {
                  setBoardEntities((currentEntities) => {
                    const targetIndex = currentEntities.findIndex(
                      (entity) => entity.id === targetEntity.id,
                    );
                    if (targetIndex === -1) {
                      return currentEntities;
                    }
                    const targetMon = currentEntities[targetIndex];
                    if (
                      targetMon.kind !== 'mon' ||
                      targetMon.side === undefined ||
                      targetMon.monType === undefined
                    ) {
                      return currentEntities;
                    }
                    if (selectedEntity.side === targetMon.side) {
                      return currentEntities;
                    }
                    const respawnTile = getMonSpawnTile(targetMon.side, targetMon.monType);
                    if (respawnTile === null) {
                      return currentEntities;
                    }
                    const isRespawnTileOccupied = currentEntities.some(
                      (entity) =>
                        entity.id !== targetMon.id &&
                        !entity.isScored &&
                        entity.carriedByDrainerId === undefined &&
                        entity.col === respawnTile.col &&
                        entity.row === respawnTile.row,
                    );
                    if (isRespawnTileOccupied) {
                      return currentEntities;
                    }
                    const nextEntities = [...currentEntities];
                    const targetOriginalCol = targetMon.col;
                    const targetOriginalRow = targetMon.row;
                    nextEntities[targetIndex] = {
                      ...targetMon,
                      col: respawnTile.col,
                      row: respawnTile.row,
                      heldItemKind:
                        targetMon.heldItemKind === 'bomb'
                          ? undefined
                          : targetMon.heldItemKind,
                    };
                    dropFaintedDrainerCarriedMana(
                      currentEntities,
                      nextEntities,
                      targetMon.id,
                      targetMon.monType,
                      targetOriginalCol,
                      targetOriginalRow,
                    );
                    return nextEntities;
                  });
                  markMonAsFaintedOnSpawn(targetEntity.id);
                  triggerAttackEffect('mystic', col, row);
                }
                setSelectedTile({row: sourceRow, col: sourceCol});
                return;
              }
              const demonAttackMiddleTile = getTwoStepOrthogonalMiddleTile(
                sourceCol,
                sourceRow,
                col,
                row,
              );
              const isDemonAttackTargetOnOwnSpawn =
                targetEntity !== undefined &&
                targetEntity.kind === 'mon' &&
                targetEntity.side !== undefined &&
                targetEntity.monType !== undefined &&
                isMonOnOwnSpawn({
                  col: targetEntity.col,
                  row: targetEntity.row,
                  type: targetEntity.monType,
                  side: targetEntity.side,
                });
              const doesDemonAttackTargetHoldBomb =
                targetEntity !== undefined &&
                targetEntity.kind === 'mon' &&
                targetEntity.heldItemKind === 'bomb';
              const demonAttackerSpawnTile =
                selectedEntity.kind === 'mon' &&
                selectedEntity.side !== undefined &&
                selectedEntity.monType !== undefined
                  ? getMonSpawnTile(selectedEntity.side, selectedEntity.monType)
                  : null;
              const canRespawnDemonAttackerOnBombFaint =
                !doesDemonAttackTargetHoldBomb ||
                (demonAttackerSpawnTile !== null &&
                  !visibleBoardEntities.some(
                    (entity) =>
                      entity.id !== selectedEntity.id &&
                      entity.id !== targetEntity?.id &&
                      entity.col === demonAttackerSpawnTile.col &&
                      entity.row === demonAttackerSpawnTile.row,
                  ));
              const canDemonAttackEnemyMon =
                selectedEntity.kind === 'mon' &&
                selectedEntity.side !== undefined &&
                selectedEntity.monType === 'demon' &&
                (canEntityMoveToTile(selectedEntity, col, row) ||
                  isDemonAttackTargetOnOwnSpawn) &&
                targetEntity !== undefined &&
                targetEntity.kind === 'mon' &&
                targetEntity.side !== undefined &&
                targetEntity.monType !== undefined &&
                !isSelectedAbilityBlockedOnOwnSpawn &&
                !isTargetMonFainted &&
                !isTargetProtectedByAngel &&
                selectedEntity.side !== targetEntity.side &&
                demonAttackMiddleTile !== null &&
                canRespawnDemonAttackerOnBombFaint &&
                !isCenterSuperManaTile(
                  demonAttackMiddleTile.col,
                  demonAttackMiddleTile.row,
                ) &&
                !isDemonMiddleTileBlocked(
                  demonAttackMiddleTile,
                  selectedEntity.id,
                  targetEntity.id,
                );
              if (canDemonAttackEnemyMon) {
                const targetSpawnTile = getMonSpawnTile(
                  targetEntity.side,
                  targetEntity.monType,
                );
                const canRespawnTargetOnSpawnTile =
                  targetSpawnTile !== null &&
                  !visibleBoardEntities.some(
                    (entity) =>
                      entity.id !== selectedEntity.id &&
                      entity.id !== targetEntity.id &&
                      entity.col === targetSpawnTile.col &&
                      entity.row === targetSpawnTile.row,
                  );
                if (canRespawnTargetOnSpawnTile) {
                  const targetCarriedMana = boardEntities.find(
                    (entity) =>
                      !entity.isScored &&
                      entity.carriedByDrainerId === targetEntity.id &&
                      (entity.kind === 'whiteMana' ||
                        entity.kind === 'blackMana' ||
                        entity.kind === 'superMana'),
                  );
                  const isTargetDrainerHoldingNormalMana =
                    targetEntity.monType === 'drainer' &&
                    targetEntity.heldItemKind !== 'bomb' &&
                    (targetCarriedMana?.kind === 'whiteMana' ||
                      targetCarriedMana?.kind === 'blackMana');
                  const shouldUseSpawnRebound =
                    !doesDemonAttackTargetHoldBomb &&
                    isDemonAttackTargetOnOwnSpawn &&
                    !canEntityMoveToTile(
                      selectedEntity,
                      targetEntity.col,
                      targetEntity.row,
                    );
                  if (
                    (isTargetDrainerHoldingNormalMana || shouldUseSpawnRebound) &&
                    targetSpawnTile !== null
                  ) {
                    const reboundOptions = getDemonReboundOptions(
                      selectedEntity,
                      targetEntity,
                      targetSpawnTile,
                    );
                    if (reboundOptions.length === 0) {
                      setSelectedTile({row: sourceRow, col: sourceCol});
                      return;
                    }
                    setPendingDemonRebound({
                      attackerId: selectedEntity.id,
                      targetId: targetEntity.id,
                      sourceCol,
                      sourceRow,
                      targetCol: targetEntity.col,
                      targetRow: targetEntity.row,
                      targetSpawnCol: targetSpawnTile.col,
                      targetSpawnRow: targetSpawnTile.row,
                      reboundOptions,
                    });
                    return;
                  }
                  setBoardEntities((currentEntities) => {
                    const sourceIndex = currentEntities.findIndex(
                      (entity) => entity.id === selectedEntity.id,
                    );
                    const targetIndex = currentEntities.findIndex(
                      (entity) => entity.id === targetEntity.id,
                    );
                    if (sourceIndex === -1 || targetIndex === -1) {
                      return currentEntities;
                    }
                    const sourceEntity = currentEntities[sourceIndex];
                    const targetMon = currentEntities[targetIndex];
                    if (
                      sourceEntity.kind !== 'mon' ||
                      sourceEntity.monType !== 'demon' ||
                      sourceEntity.side === undefined ||
                      targetMon.kind !== 'mon' ||
                      targetMon.side === undefined ||
                      targetMon.monType === undefined
                    ) {
                      return currentEntities;
                    }
                    if (sourceEntity.side === targetMon.side) {
                      return currentEntities;
                    }
                    const respawnTile = getMonSpawnTile(targetMon.side, targetMon.monType);
                    if (respawnTile === null) {
                      return currentEntities;
                    }
                    const doesTargetHoldBomb = targetMon.heldItemKind === 'bomb';
                    const attackerRespawnTile = doesTargetHoldBomb
                      ? getMonSpawnTile(sourceEntity.side, sourceEntity.monType)
                      : null;
                    if (doesTargetHoldBomb && attackerRespawnTile === null) {
                      return currentEntities;
                    }
                    if (attackerRespawnTile !== null) {
                      const isAttackerRespawnTileOccupied = currentEntities.some(
                        (entity) =>
                          entity.id !== sourceEntity.id &&
                          entity.id !== targetMon.id &&
                          !entity.isScored &&
                          entity.carriedByDrainerId === undefined &&
                          entity.col === attackerRespawnTile.col &&
                          entity.row === attackerRespawnTile.row,
                      );
                      if (isAttackerRespawnTileOccupied) {
                        return currentEntities;
                      }
                    }
                    const isRespawnTileOccupied = currentEntities.some(
                      (entity) =>
                        entity.id !== sourceEntity.id &&
                        entity.id !== targetMon.id &&
                        !entity.isScored &&
                        entity.carriedByDrainerId === undefined &&
                        entity.col === respawnTile.col &&
                        entity.row === respawnTile.row,
                    );
                    if (isRespawnTileOccupied) {
                      return currentEntities;
                    }
                    const nextEntities = [...currentEntities];
                    const targetOriginalCol = targetMon.col;
                    const targetOriginalRow = targetMon.row;
                    const isTargetAlreadyOnSpawn =
                      targetMon.col === respawnTile.col &&
                      targetMon.row === respawnTile.row;
                    if (attackerRespawnTile !== null) {
                      nextEntities[sourceIndex] = {
                        ...sourceEntity,
                        col: attackerRespawnTile.col,
                        row: attackerRespawnTile.row,
                        heldItemKind:
                          sourceEntity.heldItemKind === 'bomb'
                            ? undefined
                            : sourceEntity.heldItemKind,
                      };
                    } else if (!isTargetAlreadyOnSpawn) {
                      nextEntities[sourceIndex] = {
                        ...sourceEntity,
                        col: targetMon.col,
                        row: targetMon.row,
                      };
                    }
                    nextEntities[targetIndex] = {
                      ...targetMon,
                      col: respawnTile.col,
                      row: respawnTile.row,
                      heldItemKind:
                        targetMon.heldItemKind === 'bomb'
                          ? undefined
                          : targetMon.heldItemKind,
                    };
                    dropFaintedDrainerCarriedMana(
                      currentEntities,
                      nextEntities,
                      targetMon.id,
                      targetMon.monType,
                      targetOriginalCol,
                      targetOriginalRow,
                    );
                    return nextEntities;
                  });
                  markMonAsFaintedOnSpawn(targetEntity.id);
                  if (doesDemonAttackTargetHoldBomb) {
                    markMonAsFaintedOnSpawn(selectedEntity.id);
                  }
                  triggerAttackEffect(
                    doesDemonAttackTargetHoldBomb ? 'bomb' : 'demon',
                    col,
                    row,
                  );
                  if (doesDemonAttackTargetHoldBomb && demonAttackerSpawnTile !== null) {
                    setSelectedTile({
                      row: demonAttackerSpawnTile.row,
                      col: demonAttackerSpawnTile.col,
                    });
                  } else {
                    setSelectedTile(
                      isDemonAttackTargetOnOwnSpawn ? {row: sourceRow, col: sourceCol} : targetTile,
                    );
                  }
                  return;
                }
              }
              const canScoreSelectedManaOnPool =
                targetEntity === undefined &&
                isTargetManaPool &&
                isManaEntityKind(selectedEntity.kind);
              const canScoreCarriedManaOnPool =
                isSelectedDrainer &&
                carriedManaEntity !== undefined &&
                targetEntity === undefined &&
                isTargetManaPool;
              if (canScoreSelectedManaOnPool) {
                if (!canEntityMoveToTile(selectedEntity, col, row)) {
                  return;
                }
                setBoardEntities((currentEntities) => {
                  const sourceIndex = currentEntities.findIndex(
                    (entity) => entity.id === selectedEntity.id,
                  );
                  if (sourceIndex === -1) {
                    return currentEntities;
                  }
                  const sourceEntity = currentEntities[sourceIndex];
                  if (!isManaEntityKind(sourceEntity.kind) || sourceEntity.isScored) {
                    return currentEntities;
                  }
                  const isTargetOccupied = currentEntities.some(
                    (entity) =>
                      entity.id !== sourceEntity.id &&
                      !entity.isScored &&
                      entity.carriedByDrainerId === undefined &&
                      entity.col === col &&
                      entity.row === row,
                  );
                  if (isTargetOccupied) {
                    return currentEntities;
                  }
                  const nextEntities = [...currentEntities];
                  nextEntities[sourceIndex] = {
                    ...sourceEntity,
                    col,
                    row,
                    carriedByDrainerId: undefined,
                    isScored: true,
                  };
                  return nextEntities;
                });
                triggerScoredManaFadeOut({
                  id: selectedEntity.id,
                  href: selectedEntity.href,
                  col,
                  row,
                });
                triggerManaPoolScorePulse(col, row);
                setSelectedTile(null);
                return;
              }
              if (
                hasMovableEntityAtTarget &&
                !isSameTile(selectedTile, targetTile)
              ) {
                setSelectedTile(targetTile);
                return;
              }
              if (!canEntityMoveToTile(selectedEntity, col, row)) {
                return;
              }
              setBoardEntities((currentEntities) => {
                const sourceIndex = currentEntities.findIndex(
                  (entity) => entity.id === selectedEntity.id,
                );
                if (sourceIndex === -1) {
                  return currentEntities;
                }
                const targetIndex = currentEntities.findIndex(
                  (entity) =>
                    !entity.isScored &&
                    entity.carriedByDrainerId === undefined &&
                    entity.row === row &&
                    entity.col === col,
                );
                if (targetIndex !== -1) {
                  return currentEntities;
                }
                const nextEntities = [...currentEntities];
                nextEntities[sourceIndex] = {
                  ...nextEntities[sourceIndex],
                  row,
                  col,
                };
                if (selectedEntity.kind === 'mon' && selectedEntity.monType === 'drainer') {
                  const carriedIndex = currentEntities.findIndex(
                    (entity) =>
                      !entity.isScored &&
                      entity.carriedByDrainerId === selectedEntity.id &&
                      (entity.kind === 'whiteMana' ||
                        entity.kind === 'blackMana' ||
                        entity.kind === 'superMana'),
                  );
                  if (carriedIndex !== -1) {
                    if (canScoreCarriedManaOnPool) {
                      nextEntities[carriedIndex] = {
                        ...nextEntities[carriedIndex],
                        row,
                        col,
                        carriedByDrainerId: undefined,
                        isScored: true,
                      };
                    } else {
                      nextEntities[carriedIndex] = {
                        ...nextEntities[carriedIndex],
                        row,
                        col,
                      };
                    }
                  }
                }
                return nextEntities;
              });
              if (canScoreCarriedManaOnPool && carriedManaEntity !== undefined) {
                triggerScoredManaFadeOut({
                  id: carriedManaEntity.id,
                  href: carriedManaEntity.href,
                  col,
                  row,
                });
                triggerManaPoolScorePulse(col, row);
              }
              setSelectedTile(targetTile);
              return;
            }
            const clickedPiece = pieceByTile[tileKey] ?? null;
            if (clickedPiece !== null) {
              setSelectedTile(targetTile);
              return;
            }
            setSelectedTile(null);
          }}
        />,
      );
    }
  }

  return (
    <div
      ref={wrapRef}
      style={currentWrapStyle}
      className={enableFreeTileMove ? 'super-mons-board super-mons-board--puzzle' : 'super-mons-board'}>
      <div ref={boardRowRef} style={currentBoardRowStyle}>
        <div ref={boardContainerRef} style={boardStackStyle}>
          {showPlayerHud ? (
            <div style={topHudRowStyle} aria-label="Opponent HUD">
              <div style={hudPlayerClusterStyle}>
                <img src={hudAvatarAssets.opponent} alt="" aria-hidden="true" style={opponentHudAvatarStyle} draggable={false} />
                <span ref={opponentScoreRef} style={hudScoreTextStyle}>{opponentScore}</span>
              </div>
              <div style={hudStatusRowStyle} aria-label="Opponent turn resources">
                {opponentHudResourceOrder.map((resourceKind, index) => (
                  <img
                    key={`opponent-status-${resourceKind}-${index}`}
                    src={moveResourceAssets[resourceKind]}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    style={{
                      ...hudStatusIconStyle,
                      opacity: resourceKind === 'statusPotion' ? 1 : 0,
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {showHoverPreview && useBelowPreviewLayout ? (
            <p ref={thinHintRowRef} style={thinPreviewHintRowStyle}>
              <span ref={thinHintContentRef} style={thinPreviewHintContentStyle}>
                <span style={thinPreviewHintPrimaryTextStyle}>
                  (Click/hover over an element for details)
                </span>
                <Link to="/piece-details" style={thinPreviewHintLinkStyle}>
                  show all piece details
                </Link>
              </span>
            </p>
          ) : null}

          <svg
            ref={boardSvgRef}
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

          {selectedMovableTile !== null ? (
            <>
              <defs>
                <clipPath id={selectedTileHighlightClipPathId}>
                  <rect
                    x={selectedMovableTile.col}
                    y={selectedMovableTile.row}
                    width={1}
                    height={1}
                  />
                </clipPath>
              </defs>
              <circle
                cx={selectedMovableTile.col + 0.5}
                cy={selectedMovableTile.row + 0.5}
                r={0.58}
                fill="#58F776"
                opacity={1}
                clipPath={`url(#${selectedTileHighlightClipPathId})`}
                pointerEvents="none"
                shapeRendering="geometricPrecision"
              />
            </>
          ) : null}

	        {showSpawnGhosts
	          ? spawnGhosts.map((ghost, index) => (
              ghostHiddenTileKeySet.has(toTileKey(ghost.col, ghost.row))
                ? null
                : (
		              <image
	                key={`spawn-ghost-${index}`}
	                href={ghost.href}
	                x={ghost.col + spawnGhostInsetUnits}
	                y={ghost.row + spawnGhostInsetUnits}
                width={spawnGhostSizeUnits}
                height={spawnGhostSizeUnits}
                style={getGhostImageStyle(
                  toTileKey(ghost.col, ghost.row),
                  SPAWN_GHOST_OPACITY,
                )}
	              />
		            )
            ))
	          : null}

	          {showSpawnGhosts && enableFreeTileMove
	            ? puzzleStartGhosts.map((ghost, index) => (
                puzzleStartGhostHiddenTileKeySet.has(toTileKey(ghost.col, ghost.row))
                  ? null
                  : (
	                <image
	                  key={`puzzle-start-ghost-${index}`}
	                  href={ghost.href}
	                  x={ghost.col + puzzleStartGhostInsetUnits}
	                  y={ghost.row + puzzleStartGhostInsetUnits}
                  width={puzzleStartGhostSizeUnits}
                  height={puzzleStartGhostSizeUnits}
                  style={getGhostImageStyle(
                    toTileKey(ghost.col, ghost.row),
                    PUZZLE_START_GHOST_OPACITY,
                  )}
	                />
		              )
              ))
	            : null}

        {renderedBombRangeZones.map((zone, index) => (
          (() => {
            const frameX = zone.x;
            const frameY = zone.y;
            const frameWidth = zone.width;
            const frameHeight = zone.height;
            return (
              <g
                key={`bomb-range-zone-${zone.key}-${index}`}
                pointerEvents="none"
                style={{
                  opacity: zone.status === 'active' ? 1 : 0,
                  transition: `opacity ${BOMB_RANGE_ZONE_FADE_MS}ms ease`,
                  filter: `drop-shadow(0 0 0.08px ${BOMB_RANGE_ZONE_COLOR}) drop-shadow(0 0 0.14px ${BOMB_RANGE_ZONE_COLOR})`,
                }}>
                <g>
                  <animate
                    attributeName="opacity"
                    values="0.5;1;0.5"
                    dur={`${BOMB_RANGE_ZONE_PULSE_MS}ms`}
                    repeatCount="indefinite"
                  />
                  <rect
                    x={frameX}
                    y={frameY}
                    width={frameWidth}
                    height={frameHeight}
                    fill="none"
                    stroke={BOMB_RANGE_ZONE_COLOR}
                    strokeWidth={0.1}
                    opacity={0.16}
                    shapeRendering="geometricPrecision"
                  />
                  <rect
                    x={frameX}
                    y={frameY}
                    width={frameWidth}
                    height={frameHeight}
                    fill="none"
                    stroke={BOMB_RANGE_ZONE_COLOR}
                    strokeWidth={0.05}
                    opacity={0.42}
                    shapeRendering="geometricPrecision"
                  />
                </g>
              </g>
            );
          })()
        ))}

        {renderedAngelProtectionZones.map((zone, index) => (
          (() => {
            const frameX = zone.x;
            const frameY = zone.y;
            const frameWidth = zone.width;
            const frameHeight = zone.height;
            return (
              <g
                key={`angel-protection-zone-${zone.key}-${index}`}
                pointerEvents="none"
                style={{
                  opacity: zone.status === 'active' ? 1 : 0,
                  transition: `opacity ${ANGEL_PROTECTION_ZONE_FADE_MS}ms ease`,
                  filter: `drop-shadow(0 0 0.08px ${ANGEL_PROTECTION_ZONE_COLOR}) drop-shadow(0 0 0.14px ${ANGEL_PROTECTION_ZONE_COLOR})`,
                }}>
                <g>
                  <animate
                    attributeName="opacity"
                    values={angelShieldPulseValues}
                    dur={`${ANGEL_PROTECTION_ZONE_PULSE_MS}ms`}
                    repeatCount="indefinite"
                  />
                  <rect
                    x={frameX}
                    y={frameY}
                    width={frameWidth}
                    height={frameHeight}
                    fill="none"
                    stroke={ANGEL_PROTECTION_ZONE_COLOR}
                    strokeWidth={angelShieldOuterStrokeWidth}
                    opacity={angelShieldOuterOpacity}
                    shapeRendering="geometricPrecision"
                  />
                  <rect
                    x={frameX}
                    y={frameY}
                    width={frameWidth}
                    height={frameHeight}
                    fill="none"
                    stroke={ANGEL_PROTECTION_ZONE_COLOR}
                    strokeWidth={angelShieldInnerStrokeWidth}
                    opacity={angelShieldInnerOpacity}
                    shapeRendering="geometricPrecision"
                  />
                </g>
              </g>
            );
          })()
        ))}

        {activeBlackManaEntities.map((entity) => (
          (() => {
            const {col, row} = getRenderedEntityCoords(entity);
            const frame = getPieceFrame(row, col);
            return (
              <image
                key={entity.id}
                href={boardAssets.manaB}
                x={frame.x}
                y={frame.y}
                width={frame.size}
                height={frame.size}
                style={getEntityImageStyle(entity.id)}
              />
            );
          })()
        ))}

        {activeWhiteManaEntities.map((entity) => (
          (() => {
            const {col, row} = getRenderedEntityCoords(entity);
            const frame = getPieceFrame(row, col);
            return (
              <image
                key={entity.id}
                href={boardAssets.mana}
                x={frame.x}
                y={frame.y}
                width={frame.size}
                height={frame.size}
                style={getEntityImageStyle(entity.id)}
              />
            );
          })()
        ))}

        {activeSuperManaEntities.map((entity) => (
          (() => {
            const {col, row} = getRenderedEntityCoords(entity);
            const frame = getPieceFrame(row, col);
            return (
              <image
                key={entity.id}
                href={boardAssets.supermana}
                x={frame.x}
                y={frame.y}
                width={frame.size}
                height={frame.size}
                style={getEntityImageStyle(entity.id)}
              />
            );
          })()
        ))}

        {scoredManaFadeSprites.map((sprite) => {
          const frame = getPieceFrame(sprite.row, sprite.col);
          return (
            <image
              key={`scored-mana-fade-${sprite.id}`}
              href={sprite.href}
              x={frame.x}
              y={frame.y}
              width={frame.size}
              height={frame.size}
              style={{
                ...boardPieceImageStyle,
                opacity: sprite.isFading ? 0 : 1,
                transition: `opacity ${SCORED_MANA_FADE_OUT_MS}ms ease-out`,
              }}
            />
          );
        })}

        {activePickupItems.map((item) => {
          const tileKey = toTileKey(item.col, item.row);
          const clipPathId = `${itemSparkleClipPathIdPrefix}-${item.id}`;
          const particles = itemSparkleParticlesByTileKey[tileKey] ?? [];
          return (
            <g key={`item-sparkles-${item.id}`} pointerEvents="none">
              <defs>
                <clipPath id={clipPathId}>
                  <rect x={item.col} y={item.row} width={1} height={1} />
                </clipPath>
              </defs>
              <g clipPath={`url(#${clipPathId})`} shapeRendering="crispEdges">
                {particles.map((particle) => {
                  const bar = particle.size / 3;
                  const baseX = item.col + particle.x;
                  const baseY = item.row + particle.y;
                  return (
                    <g
                      key={`${item.id}-${particle.id}`}
                      opacity={0}>
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
                        fill={ITEM_SPARKLE_LIGHT_COLOR}
                      />
                      <rect
                        x={bar}
                        y={0}
                        width={bar}
                        height={particle.size}
                        fill={ITEM_SPARKLE_LIGHT_COLOR}
                      />
                      <rect
                        x={bar}
                        y={bar}
                        width={bar}
                        height={bar}
                        fill={ITEM_SPARKLE_DARK_COLOR}
                      />
                    </g>
                  );
                })}
              </g>
            </g>
          );
        })}

        {activePickupItems.map((item) => (
          (() => {
            const {col, row} = getRenderedEntityCoords(item);
            const frame = getPieceFrame(row, col);
            return (
              <image
                key={item.id}
                href={item.href}
                x={frame.x}
                y={frame.y}
                width={frame.size}
                height={frame.size}
                style={boardPieceImageStyle}
              />
            );
          })()
        ))}

        {activeMonPositions.black.map((mon) => (
          (() => {
            const {col, row} = getRenderedEntityCoords(mon);
            const frame = getPieceFrame(row, col);
            const isRotatedOnSpawn =
              enableFreeTileMove &&
              isMonOnOwnSpawn({
                col: mon.col,
                row: mon.row,
                type: mon.type,
                side: 'black',
              }) &&
              (!isSandboxFreeMoveBoard || faintedMonIdSet.has(mon.id));
            const rotationCenterX = frame.x + frame.size / 2;
            const rotationCenterY = frame.y + frame.size / 2;
            const heldManaData =
              mon.type === 'drainer' ? carriedManaByDrainerId[mon.id] : undefined;
            const isHeldSuperMana = heldManaData?.kind === 'superMana';
            const heldManaHref =
              isHeldSuperMana
                ? boardAssets.supermanaSimple
                : heldManaData?.href;
            const heldBombHref =
              heldManaHref === undefined && mon.heldItemKind === 'bomb'
                ? boardAssets.bomb
                : undefined;
            const isHeldBomb = heldBombHref !== undefined;
            const heldPieceHref = heldManaHref ?? heldBombHref;
            const heldManaSize =
              frame.size *
              HELD_MANA_SCALE *
              (isHeldSuperMana
                ? HELD_SUPER_MANA_SCALE_MULTIPLIER
                : isHeldBomb
                  ? HELD_BOMB_SCALE_MULTIPLIER
                  : 1);
            const heldManaX =
              frame.x +
              frame.size -
              heldManaSize * 0.96 +
              heldManaOffsetXUnits +
              (isHeldSuperMana
                ? heldSuperManaOffsetXUnits
                : isHeldBomb
                  ? heldBombOffsetXUnits
                  : 0);
            const heldManaY =
              frame.y +
              frame.size -
              heldManaSize * 0.96 +
              heldManaOffsetYUnits +
              (isHeldSuperMana
                ? heldSuperManaOffsetYUnits
                : isHeldBomb
                  ? heldBombOffsetYUnits
                  : 0);
            return (
              <g key={mon.id}>
                <image
                  href={mon.href}
                  x={frame.x}
                  y={frame.y}
                  width={frame.size}
                  height={frame.size}
                  transform={isRotatedOnSpawn ? `rotate(90 ${rotationCenterX} ${rotationCenterY})` : undefined}
                  style={boardPieceImageStyle}
                />
                {heldPieceHref !== undefined ? (
                  <image
                    href={heldPieceHref}
                    x={heldManaX}
                    y={heldManaY}
                    width={heldManaSize}
                    height={heldManaSize}
                    style={boardPieceImageStyle}
                  />
                ) : null}
              </g>
            );
          })()
        ))}

        {activeMonPositions.white.map((mon) => (
          (() => {
            const {col, row} = getRenderedEntityCoords(mon);
            const frame = getPieceFrame(row, col);
            const isRotatedOnSpawn =
              enableFreeTileMove &&
              isMonOnOwnSpawn({
                col: mon.col,
                row: mon.row,
                type: mon.type,
                side: 'white',
              }) &&
              (!isSandboxFreeMoveBoard || faintedMonIdSet.has(mon.id));
            const rotationCenterX = frame.x + frame.size / 2;
            const rotationCenterY = frame.y + frame.size / 2;
            const heldManaData =
              mon.type === 'drainer' ? carriedManaByDrainerId[mon.id] : undefined;
            const isHeldSuperMana = heldManaData?.kind === 'superMana';
            const heldManaHref =
              isHeldSuperMana
                ? boardAssets.supermanaSimple
                : heldManaData?.href;
            const heldBombHref =
              heldManaHref === undefined && mon.heldItemKind === 'bomb'
                ? boardAssets.bomb
                : undefined;
            const isHeldBomb = heldBombHref !== undefined;
            const heldPieceHref = heldManaHref ?? heldBombHref;
            const heldManaSize =
              frame.size *
              HELD_MANA_SCALE *
              (isHeldSuperMana
                ? HELD_SUPER_MANA_SCALE_MULTIPLIER
                : isHeldBomb
                  ? HELD_BOMB_SCALE_MULTIPLIER
                  : 1);
            const heldManaX =
              frame.x +
              frame.size -
              heldManaSize * 0.96 +
              heldManaOffsetXUnits +
              (isHeldSuperMana
                ? heldSuperManaOffsetXUnits
                : isHeldBomb
                  ? heldBombOffsetXUnits
                  : 0);
            const heldManaY =
              frame.y +
              frame.size -
              heldManaSize * 0.96 +
              heldManaOffsetYUnits +
              (isHeldSuperMana
                ? heldSuperManaOffsetYUnits
                : isHeldBomb
                  ? heldBombOffsetYUnits
                  : 0);
            return (
              <g key={mon.id}>
                <image
                  href={mon.href}
                  x={frame.x}
                  y={frame.y}
                  width={frame.size}
                  height={frame.size}
                  transform={isRotatedOnSpawn ? `rotate(90 ${rotationCenterX} ${rotationCenterY})` : undefined}
                  style={boardPieceImageStyle}
                />
                {heldPieceHref !== undefined ? (
                  <image
                    href={heldPieceHref}
                    x={heldManaX}
                    y={heldManaY}
                    width={heldManaSize}
                    height={heldManaSize}
                    style={boardPieceImageStyle}
                  />
                ) : null}
              </g>
            );
          })()
        ))}

        {manaPoolPulseSprites.map((pulse) => {
          const centerX = pulse.col + 0.5;
          const centerY = pulse.row + 0.5;
          return (
            <g key={pulse.id} pointerEvents="none">
              <circle
                cx={centerX}
                cy={centerY}
                r={0.22}
                fill="#8CB4FF"
                style={{
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  transform: pulse.isExpanding ? 'scale(2.7)' : 'scale(1)',
                  opacity: pulse.isExpanding ? 0 : 0.86,
                  transition: `transform ${MANA_POOL_PULSE_MS}ms cubic-bezier(0.2, 0.9, 0.25, 1), opacity ${MANA_POOL_PULSE_MS}ms ease-out`,
                }}
              />
              <circle
                cx={centerX}
                cy={centerY}
                r={0.28}
                fill="none"
                stroke="#DDEAFF"
                strokeWidth={0.07}
                style={{
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  transform: pulse.isExpanding ? 'scale(3.4)' : 'scale(1)',
                  strokeOpacity: pulse.isExpanding ? 0 : 1,
                  transition: `transform ${MANA_POOL_PULSE_MS}ms cubic-bezier(0.2, 0.9, 0.25, 1), stroke-opacity ${MANA_POOL_PULSE_MS}ms ease-out`,
                }}
              />
            </g>
          );
        })}

        {attackEffectSprites.map((effect) => {
          const seed = effect.seq * 1399 + effect.col * 97 + effect.row * 173;
          const centerX = effect.col + 0.5;
          const centerY = effect.row + 0.5;
          const progress = clamp01(effect.progress);
          const elapsedMs = ATTACK_EFFECT_DURATION_MS * progress;
          if (effect.kind === 'bomb') {
            const flameParticles = createBombFlameParticles(seed);
            const smokeParticles = createBombSmokeParticles(seed + 9191);
            const flashOpacity = Math.max(0, 1 - progress * 1.9);
            const flashRadius = 0.22 + easeOutCubic(progress) * 1.18;
            const heatOpacity = Math.max(0, 0.9 * (1 - progress * 1.25));
            const heatRadius = 0.2 + easeOutCubic(progress) * 0.84;
            const shockRingRadius = 0.16 + easeOutCubic(progress) * 1.84;
            const shockRingOpacity = Math.max(0, 0.86 * (1 - progress * 1.3));
            return (
              <g
                key={effect.id}
                transform={`translate(${centerX} ${centerY})`}
                pointerEvents="none"
                style={{shapeRendering: 'geometricPrecision'}}>
                <circle
                  cx={0}
                  cy={0}
                  r={flashRadius}
                  fill="#FFF9D0"
                  opacity={flashOpacity}
                />
                <circle
                  cx={0}
                  cy={0}
                  r={heatRadius}
                  fill="#FFB24A"
                  opacity={heatOpacity}
                />
                <circle
                  cx={0}
                  cy={0}
                  r={shockRingRadius}
                  fill="none"
                  stroke="#FF7E1A"
                  strokeWidth={0.12}
                  opacity={shockRingOpacity}
                />
                {flameParticles.map((particle, index) => {
                  const localProgress = clamp01(
                    (elapsedMs - particle.delayMs) / particle.durationMs,
                  );
                  const traveled = easeOutCubic(localProgress);
                  const px = particle.dx * traveled;
                  const py = particle.dy * traveled;
                  const radiusBase = Math.max(
                    0.014,
                    particle.size * (1 - 0.86 * localProgress),
                  );
                  const flameAngleDeg =
                    (Math.atan2(particle.dy, particle.dx) * 180) / Math.PI + 90;
                  const opacity = Math.max(
                    0,
                    particle.opacity * (1 - localProgress) * 1.12,
                  );
                  return (
                    <g
                      key={`${effect.id}-bomb-flame-${index}`}
                      transform={`translate(${px.toFixed(3)} ${py.toFixed(3)})`}
                      opacity={opacity}>
                      <ellipse
                        cx={0}
                        cy={0}
                        rx={(radiusBase * 0.62).toFixed(3)}
                        ry={(radiusBase * 1.6).toFixed(3)}
                        fill={particle.color}
                        transform={`rotate(${flameAngleDeg.toFixed(2)})`}
                      />
                      <circle
                        cx={0}
                        cy={0}
                        r={(radiusBase * 0.36).toFixed(3)}
                        fill="#FFFDEA"
                        opacity={0.88}
                      />
                    </g>
                  );
                })}
                {smokeParticles.map((particle, index) => {
                  const localProgress = clamp01(
                    (elapsedMs - particle.delayMs) / particle.durationMs,
                  );
                  const traveled = easeOutCubic(localProgress);
                  const px = particle.dx * (0.45 + traveled * 0.72);
                  const py = particle.dy * (0.38 + traveled * 0.72) - traveled * 0.42;
                  const radius = Math.max(
                    0.02,
                    particle.size * (0.78 + localProgress * 0.96),
                  );
                  const opacity = Math.max(
                    0,
                    particle.opacity * (1 - localProgress * 0.9),
                  );
                  return (
                    <g
                      key={`${effect.id}-bomb-smoke-${index}`}
                      transform={`translate(${px.toFixed(3)} ${py.toFixed(3)})`}
                      opacity={opacity}>
                      <circle
                        cx={0}
                        cy={0}
                        r={radius.toFixed(3)}
                        fill={particle.color}
                      />
                    </g>
                  );
                })}
              </g>
            );
          }
          if (effect.kind === 'demon') {
            const particles = createDemonAttackParticles(seed);
            const coreOpacity = Math.max(0, 0.95 * (1 - progress));
            const coreRadius = 0.24 * (1 + easeOutCubic(progress) * 4.2);
            return (
              <g
                key={effect.id}
                transform={`translate(${centerX} ${centerY})`}
                pointerEvents="none"
                style={{shapeRendering: 'geometricPrecision'}}>
                <circle
                  cx={0}
                  cy={0}
                  r={coreRadius}
                  fill="#FFD59A"
                  opacity={coreOpacity}
                />
                {particles.map((particle, index) => {
                  const localProgress = clamp01(
                    (elapsedMs - particle.delayMs) / particle.durationMs,
                  );
                  const traveled = easeOutCubic(localProgress);
                  const px = particle.dx * traveled;
                  const py = particle.dy * traveled;
                  const radius = Math.max(
                    0.004,
                    particle.size * (1 - 0.85 * localProgress),
                  );
                  const opacity = Math.max(
                    0,
                    particle.opacity * (1 - localProgress) * 1.08,
                  );
                  const flameAngleDeg =
                    (Math.atan2(particle.dy, particle.dx) * 180) / Math.PI + 90;
                  return (
                    <g
                      key={`${effect.id}-demon-${index}`}
                      transform={`translate(${px.toFixed(3)} ${py.toFixed(3)})`}
                      opacity={opacity}>
                      <ellipse
                        cx={0}
                        cy={0}
                        rx={(radius * 0.58).toFixed(3)}
                        ry={(radius * 1.55).toFixed(3)}
                        fill={particle.color}
                        transform={`rotate(${flameAngleDeg.toFixed(2)})`}
                      />
                      <circle
                        cx={0}
                        cy={0}
                        r={(radius * 0.32).toFixed(3)}
                        fill="#FFE3A4"
                        opacity={0.78}
                      />
                    </g>
                  );
                })}
              </g>
            );
          }

          const particles = createMysticAttackParticles(seed);
          const coreOpacity = Math.max(0, 1 - progress);
          const coreRadius = 0.18 * (1 + easeOutCubic(progress) * 4);
          const ringRadius = 0.28 + progress * 1.05;
          const ringOpacity = Math.max(0, 0.88 * (1 - progress));
          return (
            <g
              key={effect.id}
              transform={`translate(${centerX} ${centerY})`}
              pointerEvents="none"
              style={{shapeRendering: 'geometricPrecision'}}>
              <circle
                cx={0}
                cy={0}
                r={coreRadius}
                fill="#E7FAFF"
                opacity={coreOpacity}
              />
              <circle
                cx={0}
                cy={0}
                r={ringRadius}
                fill="none"
                stroke="#7ED8FF"
                strokeWidth={0.075}
                opacity={ringOpacity}
              />
              {particles.map((particle, index) => {
                const localProgress = clamp01(
                  (elapsedMs - particle.delayMs) / particle.durationMs,
                );
                const traveled = easeOutCubic(localProgress);
                const x2 = particle.dx * traveled;
                const y2 = particle.dy * traveled;
                const opacity = Math.max(0, particle.opacity * (1 - localProgress));
                const norm = Math.max(
                  0.0001,
                  Math.sqrt(particle.dx * particle.dx + particle.dy * particle.dy),
                );
                const perpX = -particle.dy / norm;
                const perpY = particle.dx / norm;
                const bend = (1 - localProgress) * 0.11;
                const midX = x2 * 0.52 + perpX * bend;
                const midY = y2 * 0.52 + perpY * bend;
                return (
                  <g key={`${effect.id}-mystic-${index}`} opacity={opacity}>
                    <polyline
                      points={`0,0 ${midX.toFixed(3)},${midY.toFixed(3)} ${x2.toFixed(3)},${y2.toFixed(3)}`}
                      fill="none"
                      stroke={particle.color}
                      strokeWidth={Math.max(0.022, particle.size * 1.25)}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx={x2.toFixed(3)}
                      cy={y2.toFixed(3)}
                      r={Math.max(0.012, particle.size * 0.42)}
                      fill="#E6FAFF"
                      opacity={0.86}
                    />
                  </g>
                );
              })}
            </g>
          );
        })}

        {abilityRangeHintTiles.map((tile, index) => (
          <circle
            key={`ability-range-hint-${tile.col}-${tile.row}-${index}`}
            cx={tile.col + 0.5}
            cy={tile.row + 0.5}
            r={0.145}
            fill="none"
            stroke={tile.color}
            strokeWidth={0.055}
            opacity={0.16}
            pointerEvents="none"
          />
        ))}

        {attackIndicatorTargets.map((target) => {
          const cornerSize = 0.24;
          const left = target.col;
          const top = target.row;
          const right = target.col + 1;
          const bottom = target.row + 1;
          return (
            <g key={`attack-indicator-${target.id}`} pointerEvents="none" opacity={0.92}>
              <polygon
                points={`${left},${top} ${left + cornerSize},${top} ${left},${top + cornerSize}`}
                fill={target.color}
              />
              <polygon
                points={`${right},${top} ${right - cornerSize},${top} ${right},${top + cornerSize}`}
                fill={target.color}
              />
              <polygon
                points={`${left},${bottom} ${left + cornerSize},${bottom} ${left},${bottom - cornerSize}`}
                fill={target.color}
              />
              <polygon
                points={`${right},${bottom} ${right - cornerSize},${bottom} ${right},${bottom - cornerSize}`}
                fill={target.color}
              />
            </g>
          );
        })}

        {pendingDemonReboundDots.map((dot, index) => (
          <circle
            key={`demon-rebound-dot-${dot.col}-${dot.row}-${index}`}
            cx={dot.col + 0.5}
            cy={dot.row + 0.5}
            r={0.12}
            fill={DEFAULT_ATTACK_INDICATOR_COLOR}
            opacity={0.92}
            pointerEvents="none"
          />
        ))}
        {pendingSpiritPushDots.map((dot, index) => (
          <circle
            key={`spirit-push-dot-${dot.col}-${dot.row}-${index}`}
            cx={dot.col + 0.5}
            cy={dot.row + 0.5}
            r={0.12}
            fill={SPIRIT_ABILITY_INDICATOR_COLOR}
            opacity={0.92}
            pointerEvents="none"
          />
        ))}

          {hoverTiles}

        {files.map((label, col) => (
          (() => {
            const isActive = hoveredTile === null || hoveredTile.col === col;
            return (
          <text
            key={`file-bottom-${label}`}
            className="board-coordinate-label"
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
            className="board-coordinate-label"
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

          {isItemPickupChoiceOpen ? (
            <>
              <button
                type="button"
                aria-label="Cancel item pickup"
                style={itemChoiceBackdropStyle}
                onClick={() => {
                  setPendingItemPickupChoice(null);
                  setHoveredItemChoice(null);
                }}
              />
              <div style={itemChoiceModalStyle} aria-label="Choose item pickup">
              <button
                type="button"
                aria-label="Pick bomb"
                style={getItemChoiceButtonStyle('bomb')}
                onMouseEnter={() => {
                  setHoveredItemChoice('bomb');
                }}
                onMouseLeave={() => {
                  setHoveredItemChoice((current) =>
                    current === 'bomb' ? null : current,
                  );
                }}
                onClick={() => {
                  applyItemPickupChoice('bomb', pendingItemPickupChoice);
                }}>
                <span
                  aria-hidden="true"
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'block',
                  }}>
                  <span style={getItemChoiceHoverHaloStyle('bomb')} />
                  <img
                    src={boardAssets.bomb}
                    alt="Bomb"
                    draggable={false}
                    style={itemChoiceIconStyle}
                  />
                </span>
              </button>
              <button
                type="button"
                aria-label="Pick potion"
                style={getItemChoiceButtonStyle('potion')}
                onMouseEnter={() => {
                  setHoveredItemChoice('potion');
                }}
                onMouseLeave={() => {
                  setHoveredItemChoice((current) =>
                    current === 'potion' ? null : current,
                  );
                }}
                onClick={() => {
                  applyItemPickupChoice('potion', pendingItemPickupChoice);
                }}>
                <span
                  aria-hidden="true"
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'block',
                  }}>
                  <span style={getItemChoiceHoverHaloStyle('potion')} />
                  <img
                    src={boardAssets.potion}
                    alt="Potion"
                    draggable={false}
                    style={itemChoiceIconStyle}
                  />
                </span>
              </button>
              </div>
            </>
          ) : null}

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
              <h4 style={previewTitleStyle}>
                {activePiece?.detailPath ? (
                  <Link to={activePiece.detailPath} style={previewTitleLinkStyle}>
                    {activePiece.title}
                  </Link>
                ) : (
                  activePiece?.title ?? ''
                )}
              </h4>
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

          {showPlayerHud ? (
            <div style={bottomHudRowStyle} aria-label="Player HUD">
              <div className="player-hud-cluster" style={playerHudClusterStyle}>
                <img src={hudAvatarAssets.player} alt="" aria-hidden="true" style={hudAvatarStyle} draggable={false} />
                <span ref={playerScoreRef} style={hudScoreTextStyle}>{playerScore}</span>
              </div>
              <div style={enableFreeTileMove ? hudStatusGroupStyle : undefined}>
                {!hideSandboxPlayerTurnResources ? (
                  <div
                    className="player-hud-status-row"
                    style={playerHudStatusRowStyle}
                    aria-label="Player turn resources">
                    {playerHudResourceOrder.map((resourceKind, index) => (
                      <img
                        key={`player-status-${resourceKind}-${index}`}
                        src={moveResourceAssets[resourceKind]}
                        alt=""
                        aria-hidden="true"
                        draggable={false}
                        style={hudStatusIconStyle}
                      />
                    ))}
                  </div>
                ) : null}
                {enableFreeTileMove ? (
                  <div style={hudActionButtonsWrapStyle}>
                    <button
                      type="button"
                      className="player-hud-reset-button"
                      aria-label="Reset puzzle board"
                      disabled={!hasPuzzleBoardChanges || isResetAnimating}
                      style={{
                        ...getHudResetButtonStateStyle(hasPuzzleBoardChanges || isResetAnimating),
                        ...getHudResetButtonOffsetStyle(isBoardFullscreen),
                      }}
                      onClick={resetBoardToInitialPuzzleState}>
                      <svg
                        ref={resetIconRef}
                        viewBox="0 0 512 512"
                        aria-hidden="true"
                        style={hudResetIconStyle}>
                        <path
                          d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                    {canUseBoardFullscreen ? (
                      <button
                        type="button"
                        aria-label={isBoardFullscreen ? 'Close fullscreen board' : 'Open fullscreen board'}
                        style={getHudFullscreenButtonStyle(isBoardFullscreen)}
                        onMouseEnter={() => {
                          setIsFullscreenButtonHovered(true);
                        }}
                        onMouseLeave={() => {
                          setIsFullscreenButtonHovered(false);
                        }}
                        onFocus={() => {
                          setIsFullscreenButtonHovered(true);
                        }}
                        onBlur={() => {
                          setIsFullscreenButtonHovered(false);
                        }}
                        onClick={(event) => {
                          setIsFullscreenButtonHovered(false);
                          event.currentTarget.blur();
                          setIsBoardFullscreen((current) => !current);
                        }}>
                        <svg viewBox="0 0 24 24" aria-hidden="true" style={hudResetIconStyle}>
                          {isBoardFullscreen ? (
                            <path
                              d="M6 6L18 18M18 6L6 18"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2.4}
                              strokeLinecap="round"
                            />
                          ) : (
                            <>
                              <g
                                style={{
                                  transform: isFullscreenButtonHovered
                                    ? 'translate(-0.9px, -0.9px)'
                                    : 'translate(0px, 0px)',
                                  transition: 'transform 180ms ease',
                                }}>
                                <path
                                  d="M4 9V4h5"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2.2}
                                  strokeLinecap="square"
                                />
                              </g>
                              <g
                                style={{
                                  transform: isFullscreenButtonHovered
                                    ? 'translate(0.9px, -0.9px)'
                                    : 'translate(0px, 0px)',
                                  transition: 'transform 180ms ease',
                                }}>
                                <path
                                  d="M15 4h5v5"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2.2}
                                  strokeLinecap="square"
                                />
                              </g>
                              <g
                                style={{
                                  transform: isFullscreenButtonHovered
                                    ? 'translate(0.9px, 0.9px)'
                                    : 'translate(0px, 0px)',
                                  transition: 'transform 180ms ease',
                                }}>
                                <path
                                  d="M20 15v5h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2.2}
                                  strokeLinecap="square"
                                />
                              </g>
                              <g
                                style={{
                                  transform: isFullscreenButtonHovered
                                    ? 'translate(-0.9px, 0.9px)'
                                    : 'translate(0px, 0px)',
                                  transition: 'transform 180ms ease',
                                }}>
                                <path
                                  d="M9 20H4v-5"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2.2}
                                  strokeLinecap="square"
                                />
                              </g>
                            </>
                          )}
                        </svg>
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
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
              <h4 style={previewTitleStyle}>
                {activePiece?.detailPath ? (
                  <Link to={activePiece.detailPath} style={previewTitleLinkStyle}>
                    {activePiece.title}
                  </Link>
                ) : (
                  activePiece?.title ?? ''
                )}
              </h4>
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
