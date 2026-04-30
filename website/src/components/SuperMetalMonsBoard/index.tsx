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
import {createPortal} from 'react-dom';
import Link from '@docusaurus/Link';
import ThreeDBoardSurface from '@site/src/components/ThreeDBoardSurface';
import {getPieceDetailPathByTitle} from '@site/src/data/pieceDetails';
import {
  playBoardSoundEffect,
  preloadBoardSoundEffects,
  type BoardSoundEffectKey,
} from '@site/src/utils/boardSoundEffects';

const BOARD_SIZE = 11;
const files = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
const VIEWBOX_SIZE = 13;
const PLAYER_MOVEMENT_POINT_COUNT = 5;
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
const WIN_PIECE_PULSE_SCALE = 1.2;
const WIN_PIECE_PULSE_UP_MS = 320;
const WIN_PIECE_PULSE_DOWN_MS = 560;
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
const FULLSCREEN_HELD_NORMAL_MANA_EXTRA_OFFSET_X_PX = 11;
const FULLSCREEN_HELD_NORMAL_MANA_EXTRA_OFFSET_Y_PX = 3;
const FULLSCREEN_RESET_BUTTON_LEFT_NUDGE_PX = 10;
const FULLSCREEN_RESET_BUTTON_EXTRA_LEFT_NUDGE_PX = 6;
const FULLSCREEN_PLAYER_RESOURCE_UP_NUDGE_PX = 4;
const FULLSCREEN_OPPONENT_RESOURCE_DOWN_NUDGE_PX = 8;
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
const FAINTED_MON_OPACITY = 0.7;
const FAINTED_MON_BLUR_PX = 0.07;
const PUZZLE_FAINTED_MON_BLUR_PX = 0.035;
const MANA_POOL_PULSE_MS = 620;
const DEFAULT_ATTACK_INDICATOR_COLOR = '#EF3030';
const SPIRIT_ABILITY_INDICATOR_COLOR = '#C95CFF';
const ANGEL_PROTECTION_ZONE_COLOR = '#C06CFF';
const ADJACENT_MOVE_DOT_COLOR = '#2FAF4C';
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
const POTION_BUBBLE_EFFECT_DELAY_MS = 260;
const POTION_BUBBLE_EFFECT_DURATION_MS = 920;
const POTION_BUBBLE_EFFECT_CLEANUP_BUFFER_MS = 80;
const POTION_RESOURCE_ICON_EXIT_MS = 420;
const DEMON_ATTACK_PARTICLE_COLORS = ['#FFB347', '#FF7A00', '#FF4300', '#FFD06E'];
const MYSTIC_ATTACK_PARTICLE_COLORS = ['#D9F4FF', '#97E8FF', '#61CCFF', '#9EE3FF'];
const BOMB_FLAME_PARTICLE_COLORS = ['#FFEFB0', '#FFD36A', '#FFAA3A', '#FF6E1F', '#F6400A'];
const BOMB_SMOKE_PARTICLE_COLORS = ['#F1ECE3', '#B3AAA0', '#868079', '#5D5955', '#3A3836'];
const POTION_BUBBLE_PARTICLE_COLORS = ['#F4D8FF', '#D99AFF', '#B95CFF', '#8F35D8'];
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
const HUD_3D_BUTTON_GAP_TO_RESET_PX = 16;
const HUD_3D_BUTTON_LEFT_NUDGE_PX = -3;
const HUD_3D_BUTTON_DOWN_NUDGE_PX = 0.5;
const HUD_NON_FULLSCREEN_ACTION_BUTTON_LEFT_NUDGE_PX = 1;
const INSTRUCTION_ABILITY_DEMO_TICK_MS = 500;
const INSTRUCTION_ABILITY_DEMO_MOVE_MS = 320;
const INSTRUCTION_DRAINER_MOVEMENT_LIMIT_NOTE =
  "(you can't actually move this far in 1 turn)";
const SANDBOX_SETUP_MANA_SQUARE_COLOR = '#C8D8FF';

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

type BoardColorPalette = typeof colors;

const darkModeColors: BoardColorPalette = {
  darkSquare: '#121212',
  lightSquare: '#545454',
  manaPool: '#FCF20B',
  pickupItemSquare: '#B0B0B0',
  simpleManaSquare: '#8F760E',
  wave1: '#C4B400',
  wave2: '#E1CD2A',
  border: '#F1F1F1',
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
type ItemPickupChoiceKind = 'bomb' | 'potion';

const moveResourceInfo: Record<HudResourceKey, {title: string; text: string}> = {
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
  statusPotion: {
    title: 'Potion',
    text: 'Adds one extra active ability resource to your turn.',
  },
};

const moveResourceOrder: MoveResourceKey[] = [
  ...Array.from({length: PLAYER_MOVEMENT_POINT_COUNT}, () => 'statusMove' as const),
  'statusAction',
  'statusMana',
];

type MoveResourceDisplayItem = {
  id: string;
  kind: HudResourceKey;
  isExiting?: boolean;
};

const moveResourceItems: MoveResourceDisplayItem[] = moveResourceOrder.map((kind, index) => ({
  id: `${kind}-${index}`,
  kind,
}));
const instructionPotionMoveResourceItem: MoveResourceDisplayItem = {
  id: 'instruction-statusPotion-0',
  kind: 'statusPotion' as const,
};
const moveResourceKindById: Record<string, HudResourceKey> = Object.fromEntries(
  [...moveResourceItems, instructionPotionMoveResourceItem].map((resource) => [
    resource.id,
    resource.kind,
  ]),
) as Record<string, HudResourceKey>;

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
      [8, 7],
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
  bomb: {
    title: 'Bomb',
    text: 'Can be thrown at an enemy mon up to 3 tiles away. The bomb is spent when it hits.',
  },
  potion: {
    title: 'Potion',
    text: 'Adds one extra active ability resource to your turn.',
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
  enableInstructionAbilityDemos?: boolean;
  boardTheme?: 'light' | 'dark';
  boardPreset?: SuperMetalMonsBoardPreset;
  showSpawnGhosts?: boolean;
  enableFreeTileMove?: boolean;
  hoveredTileOverride?: Tile | null;
  showHoveredTileCenterDot?: boolean;
  showSpawnGhostsAlways?: boolean;
  onHoveredTileChange?: (tile: Tile | null) => void;
  onHudSnapshotChange?: (snapshot: {
    playerScore: number;
    opponentScore: number;
    playerPotionCount: number;
    opponentPotionCount: number;
    canReset: boolean;
    isResetAnimating: boolean;
  }) => void;
  onPotionCountChange?: (
    payload:
      | {
          side: 'white';
          count: number;
        }
      | {
          side: 'black';
          count: number;
        },
  ) => void;
  onItemPickupChoiceOpenChange?: (isOpen: boolean) => void;
  externalResetTrigger?: number;
  onSelectedTileChange?: (tile: Tile | null) => void;
  onPuzzleBoardDirtyChange?: (isDirty: boolean) => void;
  onPuzzleBoardSnapshotChange?: (snapshot: SuperMetalMonsBoardSnapshot) => void;
  onPuzzleBoardStateChange?: () => void;
  onRenderWidthChange?: (width: number) => void;
  winningSolutionPulseTrigger?: number;
  threeDBoardViewportBottomExtensionPx?: number;
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

export type BoardEntityKind = 'mon' | 'whiteMana' | 'blackMana' | 'superMana' | 'item';
export type HeldItemKind = 'bomb';

export type BoardEntity = {
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
export type SuperMetalMonsBoardSnapshot = {
  boardEntities: BoardEntity[];
  faintedMonIds: string[];
  opponentPotionCount: number;
  opponentScore: number;
  playerActiveAbilityStarAvailable: boolean;
  playerManaMoveAvailable: boolean;
  playerPotionCount: number;
  playerScore: number;
};
type MonBoardEntity = BoardEntity & {
  kind: 'mon';
  side: 'black' | 'white';
  monType: MonType;
};
type WhiteMonBoardEntity = MonBoardEntity & {side: 'white'};

function isMonBoardEntity(entity: BoardEntity): entity is MonBoardEntity {
  return entity.kind === 'mon' && entity.side !== undefined && entity.monType !== undefined;
}

function isWhiteMonBoardEntity(entity: BoardEntity): entity is WhiteMonBoardEntity {
  return isMonBoardEntity(entity) && entity.side === 'white';
}

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
  opponentPotionCount?: number;
  faintedMonIds?: string[];
  playerActiveAbilityStarAvailable?: boolean;
  playerManaMoveAvailable?: boolean;
  playerMovementDistanceOffsetsByMonId?: Record<string, number>;
  playerMovementStartTileOverridesByMonId?: Record<string, {col: number; row: number}>;
  sandboxManaSpawnTileById?: Record<string, {col: number; row: number}>;
  sandboxItemSpawnTileById?: Record<string, {col: number; row: number}>;
};

type BoardUndoSnapshot = {
  boardEntities: BoardEntity[];
  playerScore: number;
  opponentScore: number;
  playerPotionCount: number;
  opponentPotionCount: number;
  playerActiveAbilityStarAvailable: boolean;
  playerManaMoveAvailable: boolean;
  playerMovementDistanceOffsetsByMonId: Record<string, number>;
  playerMovementStartTileOverridesByMonId: Record<string, {col: number; row: number}>;
  faintedMonIds: string[];
  forcedManaScoreSideById: Record<string, 'white' | 'black'>;
  sandboxDirectManaScoreSide: 'white' | 'black';
  sandboxManaSpawnTileById: Record<string, {col: number; row: number}>;
  sandboxItemSpawnTileById: Record<string, {col: number; row: number}>;
  selectedTile: Tile | null;
  selectedMoveResourceId: string | null;
};

type PendingItemPickupChoice = {
  monId: string;
  monSide: 'black' | 'white';
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
  kind: AttackEffectKind;
  col: number;
  row: number;
  progress: number;
  particles: AttackEffectParticleSet;
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

type AttackEffectParticleSet = {
  bombFlame?: AttackBurstParticle[];
  bombSmoke?: AttackBurstParticle[];
  demon?: AttackBurstParticle[];
  mystic?: AttackBurstParticle[];
};

type PotionBubbleParticle = {
  dx: number;
  dy: number;
  size: number;
  delayMs: number;
  durationMs: number;
  color: string;
  opacity: number;
  rise: number;
  wobble: number;
};

type PotionBubbleEffectSprite = {
  id: string;
  col: number;
  row: number;
  progress: number;
  particles: PotionBubbleParticle[];
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

type AbilityTargetIndicator = {
  id: string;
  col: number;
  row: number;
  color: string;
};

type AbilityRangeHintTile = {
  col: number;
  row: number;
  color: string;
};

type InstructionAbilityDemoKey = 'angel' | 'demon' | 'drainer' | 'spirit' | 'mystic';
type InstructionDemoKey =
  | InstructionAbilityDemoKey
  | 'mana'
  | 'superMana'
  | ItemPickupChoiceKind;
type InstructionAbilityDemoSide = 'black' | 'white';

type InstructionAbilityDemoState = {
  key: InstructionDemoKey;
  side: InstructionAbilityDemoSide;
  selectedManaId?: string;
  entities: BoardEntity[];
  transitionEntityIds: string[];
  transitionFromByEntityId: Record<string, {col: number; row: number}>;
  animationNonce: number;
  angelProtectionZones: AngelProtectionZone[];
  abilityTargetIndicators: AbilityTargetIndicator[];
  abilityRangeHintTiles: AbilityRangeHintTile[];
  demonReboundDots: Array<{col: number; row: number}>;
  spiritPushDots: Array<{col: number; row: number}>;
  manaMoveDots: Array<{col: number; row: number}>;
  movementResourceCount: number;
  activeAbilityResourceAvailable: boolean;
  manaMoveResourceAvailable: boolean;
  potionResourceAvailable?: boolean;
  faintedMonIds: string[];
};

type InstructionAbilityDemoStep = {
  update: (entities: BoardEntity[]) => BoardEntity[];
  transitionEntityIds?: string[];
  slideTransitionEntityIds?: string[];
  angelProtectionZones?: AngelProtectionZone[];
  abilityTargetIndicators?: AbilityTargetIndicator[];
  hideAbilityRangeHintTiles?: boolean;
  hideAbilityTargetIndicators?: boolean;
  demonReboundDots?: Array<{col: number; row: number}>;
  spiritPushDots?: Array<{col: number; row: number}>;
  movementResourceCost?: number;
  consumeActiveAbilityResource?: boolean;
  consumePotionResource?: boolean;
  restoreActiveAbilityResource?: boolean;
  restoreTurnResources?: boolean;
  consumeManaMoveResource?: boolean;
  soundEffects?: BoardSoundEffectKey[];
  faintedMonIds?: string[];
  potionBubbleEffect?: {
    col: number;
    row: number;
  };
  attackEffect?: {
    kind: AttackEffectKind;
    col: number;
    row: number;
  };
  scoredMana?: {
    id: string;
    href: string;
    col: number;
    row: number;
  };
};

const defaultInstructionDemoEntityIds = {
  black: {
    mystic: 'mon-default-0',
    spirit: 'mon-default-1',
    drainer: 'mon-default-2',
    angel: 'mon-default-3',
    demon: 'mon-default-4',
  },
  white: {
    demon: 'mon-default-5',
    angel: 'mon-default-6',
    drainer: 'mon-default-7',
    spirit: 'mon-default-8',
    mystic: 'mon-default-9',
  },
  mana: {
    white: {
      d5: 'white-mana-default-0',
      h5: 'white-mana-default-2',
      e4: 'white-mana-default-3',
      g4: 'white-mana-default-4',
    },
    black: {
      d5: 'black-mana-default-4',
      h5: 'black-mana-default-2',
      e4: 'black-mana-default-1',
      f5: 'black-mana-default-3',
      g4: 'black-mana-default-0',
    },
    byId: {
      'white-mana-default-0': {
        side: 'white',
        from: {col: 3, row: 6},
        to: {col: 2, row: 7},
      },
      'white-mana-default-3': {
        side: 'white',
        from: {col: 4, row: 7},
        to: {col: 3, row: 8},
      },
      'white-mana-default-1': {
        side: 'white',
        from: {col: 5, row: 6},
        to: {col: 5, row: 7},
      },
      'white-mana-default-4': {
        side: 'white',
        from: {col: 6, row: 7},
        to: {col: 7, row: 8},
      },
      'white-mana-default-2': {
        side: 'white',
        from: {col: 7, row: 6},
        to: {col: 8, row: 7},
      },
      'black-mana-default-4': {
        side: 'black',
        from: {col: 7, row: 4},
        to: {col: 8, row: 3},
      },
      'black-mana-default-1': {
        side: 'black',
        from: {col: 6, row: 3},
        to: {col: 7, row: 2},
      },
      'black-mana-default-3': {
        side: 'black',
        from: {col: 5, row: 4},
        to: {col: 5, row: 3},
      },
      'black-mana-default-0': {
        side: 'black',
        from: {col: 4, row: 3},
        to: {col: 3, row: 2},
      },
      'black-mana-default-2': {
        side: 'black',
        from: {col: 3, row: 4},
        to: {col: 2, row: 3},
      },
    },
  },
} as const;

const persistedPuzzleBoardStateByPreset = new Map<
  SuperMetalMonsBoardPreset,
  PersistedPuzzleBoardState
>();
const SANDBOX_BOARD_STATE_STORAGE_KEY = 'mons-academy-sandbox-board-state-v1';

function cloneBoardEntities(entities: BoardEntity[]): BoardEntity[] {
  return entities.map((entity) => ({...entity}));
}

function cloneNumberById(value: unknown): Record<string, number> | undefined {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }
  return Object.fromEntries(
    Object.entries(value).flatMap(([entityId, count]) =>
      typeof count === 'number' ? [[entityId, count]] : [],
    ),
  );
}

function cloneTileById(value: unknown): Record<string, {col: number; row: number}> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value).flatMap(([entityId, tile]) => {
      if (tile === null || typeof tile !== 'object' || Array.isArray(tile)) {
        return [];
      }
      const maybeTile = tile as Partial<{col: number; row: number}>;
      if (typeof maybeTile.col !== 'number' || typeof maybeTile.row !== 'number') {
        return [];
      }
      return [[entityId, {col: maybeTile.col, row: maybeTile.row}]];
    }),
  );
}

function isPersistedPuzzleBoardStateCompatible(
  persisted: PersistedPuzzleBoardState,
  initialEntities: BoardEntity[],
): boolean {
  if (persisted.boardEntities.length !== initialEntities.length) {
    return false;
  }
  const initialEntityIdSet = new Set(initialEntities.map((entity) => entity.id));
  return persisted.boardEntities.every((entity) => initialEntityIdSet.has(entity.id));
}

function parsePersistedPuzzleBoardState(
  rawValue: string | null,
): PersistedPuzzleBoardState | null {
  if (rawValue === null) {
    return null;
  }
  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }
    const state = parsed as Partial<PersistedPuzzleBoardState>;
    if (
      !Array.isArray(state.boardEntities) ||
      typeof state.playerScore !== 'number' ||
      typeof state.opponentScore !== 'number' ||
      typeof state.playerPotionCount !== 'number'
    ) {
      return null;
    }
    return {
      boardEntities: cloneBoardEntities(state.boardEntities as BoardEntity[]),
      playerScore: state.playerScore,
      opponentScore: state.opponentScore,
      playerPotionCount: state.playerPotionCount,
      opponentPotionCount:
        typeof state.opponentPotionCount === 'number'
          ? state.opponentPotionCount
          : undefined,
      faintedMonIds: Array.isArray(state.faintedMonIds)
        ? state.faintedMonIds.filter((id): id is string => typeof id === 'string')
        : undefined,
      playerActiveAbilityStarAvailable:
        typeof state.playerActiveAbilityStarAvailable === 'boolean'
          ? state.playerActiveAbilityStarAvailable
          : undefined,
      playerManaMoveAvailable:
        typeof state.playerManaMoveAvailable === 'boolean'
          ? state.playerManaMoveAvailable
          : undefined,
      playerMovementDistanceOffsetsByMonId: cloneNumberById(
        state.playerMovementDistanceOffsetsByMonId,
      ),
      playerMovementStartTileOverridesByMonId: cloneTileById(
        state.playerMovementStartTileOverridesByMonId,
      ),
      sandboxManaSpawnTileById: cloneTileById(state.sandboxManaSpawnTileById),
      sandboxItemSpawnTileById: cloneTileById(state.sandboxItemSpawnTileById),
    };
  } catch {
    return null;
  }
}

function readPersistedSandboxBoardStateFromStorage(
  initialEntities: BoardEntity[],
): PersistedPuzzleBoardState | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const persisted = parsePersistedPuzzleBoardState(
    window.localStorage.getItem(SANDBOX_BOARD_STATE_STORAGE_KEY),
  );
  if (
    persisted === null ||
    !isPersistedPuzzleBoardStateCompatible(persisted, initialEntities)
  ) {
    return null;
  }
  return persisted;
}

function writePersistedSandboxBoardStateToStorage(
  state: PersistedPuzzleBoardState,
): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(SANDBOX_BOARD_STATE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota/private mode failures.
  }
}

function boardTile(file: string, rank: number): {col: number; row: number} {
  return {
    col: files.indexOf(file),
    row: BOARD_SIZE - rank,
  };
}

function getAngelProtectionZoneForTile(
  key: string,
  col: number,
  row: number,
): AngelProtectionZone {
  const minCol = Math.max(0, col - 1);
  const minRow = Math.max(0, row - 1);
  const maxCol = Math.min(BOARD_SIZE, col + 2);
  const maxRow = Math.min(BOARD_SIZE, row + 2);
  return {
    key,
    x: minCol,
    y: minRow,
    width: maxCol - minCol,
    height: maxRow - minRow,
  };
}

function updateBoardEntity(
  entities: BoardEntity[],
  entityId: string,
  updates: Partial<BoardEntity>,
): BoardEntity[] {
  return entities.map((entity) =>
    entity.id === entityId
      ? {
          ...entity,
          ...updates,
        }
      : entity,
  );
}

function updateBoardEntities(
  entities: BoardEntity[],
  updatesByEntityId: Record<string, Partial<BoardEntity>>,
): BoardEntity[] {
  return entities.map((entity) => {
    const updates = updatesByEntityId[entity.id];
    return updates === undefined
      ? entity
      : {
          ...entity,
          ...updates,
        };
  });
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

function isDrainerHoldingMana(entities: BoardEntity[], drainerId: string): boolean {
  return entities.some(
    (entity) =>
      !entity.isScored &&
      entity.carriedByDrainerId === drainerId &&
      isManaEntityKind(entity.kind),
  );
}

function canDrainerReceiveMana(entities: BoardEntity[], entity: BoardEntity): boolean {
  return (
    entity.kind === 'mon' &&
    entity.side !== undefined &&
    entity.monType === 'drainer' &&
    entity.heldItemKind !== 'bomb' &&
    !isDrainerHoldingMana(entities, entity.id)
  );
}

function isAdjacentTileMove(
  sourceCol: number,
  sourceRow: number,
  targetCol: number,
  targetRow: number,
): boolean {
  return Math.max(Math.abs(targetCol - sourceCol), Math.abs(targetRow - sourceRow)) === 1;
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
  if (!isPersistedPuzzleBoardStateCompatible(persisted, initialEntities)) {
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

function getOptimalDirectMonMovementDistance(
  mon: MonBoardEntity,
  targetCol: number,
  targetRow: number,
  entities: BoardEntity[],
  movementStartTileByMonId: Map<string, {col: number; row: number}>,
  allowedTargetEntityId?: string,
): number | null {
  if (
    targetCol < 0 ||
    targetCol >= BOARD_SIZE ||
    targetRow < 0 ||
    targetRow >= BOARD_SIZE ||
    !canEntityMoveToTile(mon, targetCol, targetRow)
  ) {
    return null;
  }
  const startTile =
    movementStartTileByMonId.get(mon.id) ?? getMonSpawnTile(mon.side, mon.monType);
  if (startTile === null) {
    return null;
  }

  const targetTileKey = toTileKey(targetCol, targetRow);
  const startTileKey = toTileKey(startTile.col, startTile.row);
  const blockedTileKeySet = new Set<string>();
  entities.forEach((entity) => {
    if (
      entity.id === mon.id ||
      entity.id === allowedTargetEntityId ||
      entity.isScored ||
      entity.carriedByDrainerId !== undefined
    ) {
      return;
    }
    blockedTileKeySet.add(toTileKey(entity.col, entity.row));
  });
  // Movement cost replays from the mon's historical start tile. Another piece can
  // later occupy that tile, but that should not make this mon's cost impossible.
  blockedTileKeySet.delete(startTileKey);
  if (blockedTileKeySet.has(targetTileKey)) {
    return null;
  }

  if (startTileKey === targetTileKey) {
    return 0;
  }

  const queue: Array<{col: number; row: number; distance: number}> = [
    {col: startTile.col, row: startTile.row, distance: 0},
  ];
  const visitedTileKeySet = new Set<string>([startTileKey]);
  for (let queueIndex = 0; queueIndex < queue.length; queueIndex += 1) {
    const current = queue[queueIndex];
    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
        if (rowOffset === 0 && colOffset === 0) {
          continue;
        }
        const nextCol = current.col + colOffset;
        const nextRow = current.row + rowOffset;
        if (
          nextCol < 0 ||
          nextCol >= BOARD_SIZE ||
          nextRow < 0 ||
          nextRow >= BOARD_SIZE ||
          !canEntityMoveToTile(mon, nextCol, nextRow)
        ) {
          continue;
        }
        const nextTileKey = toTileKey(nextCol, nextRow);
        if (visitedTileKeySet.has(nextTileKey) || blockedTileKeySet.has(nextTileKey)) {
          continue;
        }
        const nextDistance = current.distance + 1;
        if (nextTileKey === targetTileKey) {
          return nextDistance;
        }
        visitedTileKeySet.add(nextTileKey);
        queue.push({col: nextCol, row: nextRow, distance: nextDistance});
      }
    }
  }
  return null;
}

function getPlayerMovementPointsUsedForEntities(
  entities: BoardEntity[],
  movementStartTileByMonId: Map<string, {col: number; row: number}>,
  faintedMonIdSet: Set<string>,
  movementDistanceOffsetsByMonId: Record<string, number>,
): number {
  return entities
    .filter(
      (entity): entity is WhiteMonBoardEntity =>
        isWhiteMonBoardEntity(entity) &&
        !entity.isScored &&
        entity.carriedByDrainerId === undefined,
    )
    .reduce((total, mon) => {
      if (
        faintedMonIdSet.has(mon.id) &&
        isMonOnOwnSpawn({
          col: mon.col,
          row: mon.row,
          type: mon.monType,
          side: mon.side,
        })
      ) {
        return total;
      }
      const distance =
        getOptimalDirectMonMovementDistance(
          mon,
          mon.col,
          mon.row,
          entities,
          movementStartTileByMonId,
        ) ?? PLAYER_MOVEMENT_POINT_COUNT + 1;
      return total + Math.max(0, distance - (movementDistanceOffsetsByMonId[mon.id] ?? 0));
    }, 0);
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

function createCornerWaveLines(
  seed: number,
  palette: BoardColorPalette = colors,
): CornerWaveLine[] {
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
      color: random() > 0.5 ? palette.wave1 : palette.wave2,
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

function createPotionBubbleParticles(seed: number): PotionBubbleParticle[] {
  const random = mulberry32(seed);
  const particles: PotionBubbleParticle[] = [];
  const count = 24;
  for (let i = 0; i < count; i += 1) {
    const angle = random() * Math.PI * 2;
    const distance = 0.13 + random() * 0.78;
    particles.push({
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance * 0.72,
      size: 0.06 + random() * 0.12,
      delayMs: random() * 170,
      durationMs: 420 + random() * 360,
      color:
        POTION_BUBBLE_PARTICLE_COLORS[
          Math.floor(random() * POTION_BUBBLE_PARTICLE_COLORS.length)
      ],
      opacity: 0.48 + random() * 0.36,
      rise: 0.34 + random() * 0.78,
      wobble: 0.03 + random() * 0.085,
    });
  }
  return particles;
}

function createAttackEffectParticleSet(
  kind: AttackEffectKind,
  seed: number,
): AttackEffectParticleSet {
  if (kind === 'bomb') {
    return {
      bombFlame: createBombFlameParticles(seed),
      bombSmoke: createBombSmokeParticles(seed + 9191),
    };
  }
  if (kind === 'demon') {
    return {
      demon: createDemonAttackParticles(seed),
    };
  }
  return {
    mystic: createMysticAttackParticles(seed),
  };
}

const gameBoardEffectImageAssetHrefs = [
  ...Object.values(boardAssets.white),
  ...Object.values(boardAssets.black),
  boardAssets.mana,
  boardAssets.manaB,
  boardAssets.bomb,
  boardAssets.potion,
  boardAssets.bombOrPotion,
  boardAssets.supermana,
  boardAssets.supermanaSimple,
  ...Object.values(moveResourceAssets),
  hudAvatarAssets.opponent,
  hudAvatarAssets.player,
];

const preloadedGameBoardEffectAssetHrefs = new Set<string>();
const preloadedGameBoardEffectImages: HTMLImageElement[] = [];
let warmedGameBoardParticleTemplates: {
  itemSparkle: ItemSparkleParticle[];
  bombFlame: AttackBurstParticle[];
  bombSmoke: AttackBurstParticle[];
  demon: AttackBurstParticle[];
  mystic: AttackBurstParticle[];
  potionBubbles: PotionBubbleParticle[];
} | null = null;

function preloadGameBoardEffectAssets(): void {
  if (warmedGameBoardParticleTemplates === null) {
    const bombParticles = createAttackEffectParticleSet('bomb', 9001);
    const demonParticles = createAttackEffectParticleSet('demon', 9002);
    const mysticParticles = createAttackEffectParticleSet('mystic', 9003);
    warmedGameBoardParticleTemplates = {
      itemSparkle: createItemSparkleParticles(9000),
      bombFlame: bombParticles.bombFlame ?? [],
      bombSmoke: bombParticles.bombSmoke ?? [],
      demon: demonParticles.demon ?? [],
      mystic: mysticParticles.mystic ?? [],
      potionBubbles: createPotionBubbleParticles(9004),
    };
  }

  if (typeof window === 'undefined') {
    return;
  }

  gameBoardEffectImageAssetHrefs.forEach((href) => {
    if (preloadedGameBoardEffectAssetHrefs.has(href)) {
      return;
    }
    preloadedGameBoardEffectAssetHrefs.add(href);
    const image = new Image();
    image.decoding = 'async';
    image.loading = 'eager';
    image.src = href;
    if (typeof image.decode === 'function') {
      void image.decode().catch(() => undefined);
    }
    preloadedGameBoardEffectImages.push(image);
  });
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
  enableInstructionAbilityDemos = false,
  boardTheme = 'light',
  boardPreset = 'default',
  showSpawnGhosts = false,
  enableFreeTileMove = false,
  hoveredTileOverride = null,
  showHoveredTileCenterDot = false,
  showSpawnGhostsAlways = false,
  onHoveredTileChange,
  onHudSnapshotChange,
  onPotionCountChange,
  onItemPickupChoiceOpenChange,
  externalResetTrigger = 0,
  onSelectedTileChange,
  onPuzzleBoardDirtyChange,
  onPuzzleBoardSnapshotChange,
  onPuzzleBoardStateChange,
  onRenderWidthChange,
  winningSolutionPulseTrigger = 0,
  threeDBoardViewportBottomExtensionPx = 0,
}: SuperMetalMonsBoardProps): ReactNode {
  const playerStartingPotionCount = getPlayerStartingPotionCount(boardPreset);
  const opponentStartingPotionCount = getOpponentStartingPotionCount(boardPreset);
  const isSandboxFreeMoveBoard = enableFreeTileMove && boardPreset === 'default';
  const isPuzzleBoard = enableFreeTileMove && boardPreset !== 'default';
  const isInstructionBoard =
    enableInstructionAbilityDemos && !enableFreeTileMove && boardPreset === 'default';

  useEffect(() => {
    preloadBoardSoundEffects();
  }, []);
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
  const potionBubbleEffectCounterRef = useRef(0);
  const potionBubbleEffectDelayByIdRef = useRef<Record<string, number>>({});
  const potionBubbleEffectFrameByIdRef = useRef<Record<string, number>>({});
  const potionBubbleEffectTimeoutByIdRef = useRef<Record<string, number>>({});
  const potionResourceExitCounterRef = useRef(0);
  const potionResourceExitTimeoutByIdRef = useRef<Record<string, number>>({});
  const lastActiveAbilityUsedPotionRef = useRef(false);
  const previousExternalResetTriggerRef = useRef(externalResetTrigger);
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
  const [isThreeDBoardViewEnabled, setIsThreeDBoardViewEnabled] = useState(false);
  const [isBoardPerspectiveFlipped, setIsBoardPerspectiveFlipped] = useState(false);
  const [
    boardPerspectiveFlipAnimationNonce,
    setBoardPerspectiveFlipAnimationNonce,
  ] = useState(0);
  const [fullscreenScale, setFullscreenScale] = useState(1);
  const [instructionAbilityDemoState, setInstructionAbilityDemoState] =
    useState<InstructionAbilityDemoState | null>(null);
  const [
    instructionAbilityDemoTransitionProgress,
    setInstructionAbilityDemoTransitionProgress,
  ] = useState(1);
  const [resetAnimation, setResetAnimation] = useState<ResetAnimationState | null>(null);
  const [resetAnimationProgress, setResetAnimationProgress] = useState(1);
  const [undoHistory, setUndoHistory] = useState<BoardUndoSnapshot[]>([]);
  const [sandboxManaSpawnTileById, setSandboxManaSpawnTileById] = useState<
    Record<string, {col: number; row: number}>
  >({});
  const [sandboxItemSpawnTileById, setSandboxItemSpawnTileById] = useState<
    Record<string, {col: number; row: number}>
  >({});

  const canUseThreeDBoardView = enableFreeTileMove;

  useEffect(() => {
    onSelectedTileChange?.(selectedTile);
  }, [onSelectedTileChange, selectedTile]);

  useEffect(() => {
    if (!canUseThreeDBoardView && isThreeDBoardViewEnabled) {
      setIsThreeDBoardViewEnabled(false);
    }
  }, [canUseThreeDBoardView, isThreeDBoardViewEnabled]);

  useEffect(() => {
    onHoveredTileChange?.(hoveredTile);
  }, [hoveredTile, onHoveredTileChange]);
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
  const [potionBubbleEffectSprites, setPotionBubbleEffectSprites] = useState<
    PotionBubbleEffectSprite[]
  >([]);
  const [exitingPlayerPotionResourceIds, setExitingPlayerPotionResourceIds] =
    useState<string[]>([]);
  const [exitingInstructionPotionResourceIds, setExitingInstructionPotionResourceIds] =
    useState<string[]>([]);
  const [renderedAngelProtectionZones, setRenderedAngelProtectionZones] = useState<
    RenderedAngelProtectionZone[]
  >([]);
  const [renderedBombRangeZones, setRenderedBombRangeZones] = useState<
    RenderedBombRangeZone[]
  >([]);
  const [playerPotionCount, setPlayerPotionCount] = useState(
    initialPersistedPuzzleState?.playerPotionCount ?? playerStartingPotionCount,
  );
  const [opponentPotionCount, setOpponentPotionCount] = useState(
    initialPersistedPuzzleState?.opponentPotionCount ?? opponentStartingPotionCount,
  );
  const [playerActiveAbilityStarAvailable, setPlayerActiveAbilityStarAvailable] = useState(
    () => initialPersistedPuzzleState?.playerActiveAbilityStarAvailable ?? true,
  );
  const [playerManaMoveAvailable, setPlayerManaMoveAvailable] = useState(
    () => initialPersistedPuzzleState?.playerManaMoveAvailable ?? true,
  );
  const [
    playerMovementDistanceOffsetsByMonId,
    setPlayerMovementDistanceOffsetsByMonId,
  ] = useState<Record<string, number>>(
    () => initialPersistedPuzzleState?.playerMovementDistanceOffsetsByMonId ?? {},
  );
  const [
    playerMovementStartTileOverridesByMonId,
    setPlayerMovementStartTileOverridesByMonId,
  ] = useState<Record<string, {col: number; row: number}>>(
    () => initialPersistedPuzzleState?.playerMovementStartTileOverridesByMonId ?? {},
  );
  const [faintedMonIdSet, setFaintedMonIdSet] = useState<Set<string>>(
    () =>
      enableFreeTileMove
        ? new Set(initialPersistedPuzzleState?.faintedMonIds ?? [])
        : new Set(),
  );
  const [pendingItemPickupChoice, setPendingItemPickupChoice] =
    useState<PendingItemPickupChoice | null>(null);
  const [
    instructionItemPickupChoiceTile,
    setInstructionItemPickupChoiceTile,
  ] = useState<Tile | null>(null);
  const [
    instructionSelectedItemChoice,
    setInstructionSelectedItemChoice,
  ] = useState<{kind: ItemPickupChoiceKind; tile: Tile} | null>(null);
  const [pendingDemonRebound, setPendingDemonRebound] =
    useState<PendingDemonRebound | null>(null);
  const [pendingSpiritPush, setPendingSpiritPush] =
    useState<PendingSpiritPush | null>(null);
  const [hoveredItemChoice, setHoveredItemChoice] = useState<'bomb' | 'potion' | null>(null);
  const isItemPickupChoiceOpen =
    pendingItemPickupChoice !== null || instructionItemPickupChoiceTile !== null;
  const [resetFadeInByEntityId, setResetFadeInByEntityId] = useState<Record<string, boolean>>({});
  const [resetGhostFadeInByTileKey, setResetGhostFadeInByTileKey] = useState<Record<string, boolean>>({});
  const [winPiecePulsePhase, setWinPiecePulsePhase] = useState<'idle' | 'up' | 'down'>('idle');
  const resetFadeFrameRef = useRef<number | null>(null);
  const resetFadeTimeoutRef = useRef<number | null>(null);
  const resetGhostFadeFrameRef = useRef<number | null>(null);
  const resetGhostFadeTimeoutRef = useRef<number | null>(null);
  const instructionAbilityDemoTimeoutRef = useRef<number | null>(null);
  const instructionAbilityDemoTransitionFrameRef = useRef<number | null>(null);
  const instructionAbilityDemoRunIdRef = useRef(0);
  const suppressBoardClickUntilRef = useRef(0);
  const winPiecePulseUpTimeoutRef = useRef<number | null>(null);
  const winPiecePulseDownTimeoutRef = useRef<number | null>(null);
  const previouslyScoredManaIdsRef = useRef<Set<string>>(new Set());
  const previousBoardEntitiesByIdRef = useRef<Map<string, BoardEntity>>(new Map());
  const didNotifyInitialPuzzleBoardStateRef = useRef(false);
  const forcedManaScoreSideByIdRef = useRef<Record<string, 'white' | 'black'>>({});
  const sandboxDirectManaScoreSideRef = useRef<'white' | 'black'>('white');
  const previewBelowBreakpointWidthRef = useRef<number | null>(null);
  const scaledFactorRef = useRef(1);
  const [waveSeedNonce, setWaveSeedNonce] = useState(1);
  const canUseBoardFullscreen = enableFreeTileMove;
  const faintedMonBlurPx =
    boardPreset === 'default' ? FAINTED_MON_BLUR_PX : PUZZLE_FAINTED_MON_BLUR_PX;
  const selectedTileHighlightClipPathId = useId().replace(/:/g, '');
  const itemSparkleClipPathIdPrefix = useId().replace(/:/g, '');
  const [boardEntities, setBoardEntities] = useState<BoardEntity[]>(
    initialPersistedPuzzleState !== null
      ? cloneBoardEntities(initialPersistedPuzzleState.boardEntities)
      : initialBoardEntities,
  );
  const displayedBoardEntities = instructionAbilityDemoState?.entities ?? boardEntities;
  const initialMovementStartTileByMonId = useMemo(
    () =>
      new Map(
        initialBoardEntities
          .filter(isMonBoardEntity)
          .map((entity) => [entity.id, {col: entity.col, row: entity.row}]),
    ),
    [initialBoardEntities],
  );
  const initialBoardEntityById = useMemo(
    () => new Map(initialBoardEntities.map((entity) => [entity.id, entity])),
    [initialBoardEntities],
  );
  const sandboxManaSpawnOriginTileById = useMemo(
    () =>
      new Map(
        initialBoardEntities
          .filter(
            (entity) =>
              entity.kind === 'whiteMana' || entity.kind === 'blackMana',
          )
          .map((entity) => [entity.id, {col: entity.col, row: entity.row}]),
      ),
    [initialBoardEntities],
  );
  const sandboxItemSpawnOriginTileById = useMemo(
    () =>
      new Map(
        initialBoardEntities
          .filter((entity) => entity.kind === 'item')
          .map((entity) => [entity.id, {col: entity.col, row: entity.row}]),
      ),
    [initialBoardEntities],
  );
  const hasSandboxMonMovedFromInitial = useMemo(
    () =>
      isSandboxFreeMoveBoard &&
      boardEntities.some((entity) => {
        if (!isMonBoardEntity(entity)) {
          return false;
        }
        const initialEntity = initialBoardEntityById.get(entity.id);
        return (
          initialEntity === undefined ||
          initialEntity.col !== entity.col ||
          initialEntity.row !== entity.row
        );
      }),
    [boardEntities, initialBoardEntityById, isSandboxFreeMoveBoard],
  );
  const sandboxManaSpawnOriginTileKeySet = useMemo(() => {
    if (!isSandboxFreeMoveBoard) {
      return new Set<string>();
    }
    return new Set(
      Object.keys(sandboxManaSpawnTileById).flatMap((manaId) => {
        const originTile = sandboxManaSpawnOriginTileById.get(manaId);
        return originTile === undefined ? [] : [toTileKey(originTile.col, originTile.row)];
      }),
    );
  }, [
    isSandboxFreeMoveBoard,
    sandboxManaSpawnOriginTileById,
    sandboxManaSpawnTileById,
  ]);
  const sandboxManaSpawnTiles = useMemo(() => {
    if (!isSandboxFreeMoveBoard) {
      return [];
    }
    return Object.entries(sandboxManaSpawnTileById).map(([manaId, tile]) => ({
      id: manaId,
      ...tile,
    }));
  }, [isSandboxFreeMoveBoard, sandboxManaSpawnTileById]);
  const sandboxItemSpawnOriginTileKeySet = useMemo(() => {
    if (!isSandboxFreeMoveBoard) {
      return new Set<string>();
    }
    return new Set(
      Object.keys(sandboxItemSpawnTileById).flatMap((itemId) => {
        const originTile = sandboxItemSpawnOriginTileById.get(itemId);
        return originTile === undefined ? [] : [toTileKey(originTile.col, originTile.row)];
      }),
    );
  }, [
    isSandboxFreeMoveBoard,
    sandboxItemSpawnOriginTileById,
    sandboxItemSpawnTileById,
  ]);
  const sandboxItemSpawnTiles = useMemo(() => {
    if (!isSandboxFreeMoveBoard) {
      return [];
    }
    return Object.entries(sandboxItemSpawnTileById).map(([itemId, tile]) => ({
      id: itemId,
      ...tile,
    }));
  }, [isSandboxFreeMoveBoard, sandboxItemSpawnTileById]);
  const instructionAbilityDemoBasePositionByEntityId = useMemo(
    () =>
      new Map(
        initialBoardEntities.map((entity) => [
          entity.id,
          {col: entity.col, row: entity.row},
        ]),
      ),
    [initialBoardEntities],
  );
  const movementStartTileByMonId = useMemo(() => {
    const next = new Map(initialMovementStartTileByMonId);
    Object.entries(playerMovementStartTileOverridesByMonId).forEach(([monId, tile]) => {
      next.set(monId, tile);
    });
    return next;
  }, [initialMovementStartTileByMonId, playerMovementStartTileOverridesByMonId]);
  const playerMovementPointsUsed = isPuzzleBoard
    ? getPlayerMovementPointsUsedForEntities(
        boardEntities,
        movementStartTileByMonId,
        faintedMonIdSet,
        playerMovementDistanceOffsetsByMonId,
      )
    : 0;
  const hasPlayerUsedDirectManaMove = isPuzzleBoard && !playerManaMoveAvailable;
  const playerMovementPointsRemaining = Math.max(
    0,
    hasPlayerUsedDirectManaMove
      ? 0
      : PLAYER_MOVEMENT_POINT_COUNT - playerMovementPointsUsed,
  );
  const showPlayerActiveAbilityStar =
    !isPuzzleBoard ||
    (playerActiveAbilityStarAvailable && !hasPlayerUsedDirectManaMove);
  const showPlayerManaMoveResource = !isPuzzleBoard || playerManaMoveAvailable;
  const isInstructionSelectedItemChoiceActive =
    isInstructionBoard &&
    instructionSelectedItemChoice !== null &&
    selectedTile !== null &&
    isSameTile(selectedTile, instructionSelectedItemChoice.tile);
  const showInstructionPotionResource =
    instructionAbilityDemoState === null &&
    !isItemPickupChoiceOpen &&
    isInstructionSelectedItemChoiceActive &&
    instructionSelectedItemChoice?.kind === 'potion';
  const exitingPlayerPotionResourceItems: MoveResourceDisplayItem[] =
    exitingPlayerPotionResourceIds.map((id) => ({
      id,
      kind: 'statusPotion',
      isExiting: true,
    }));
  const exitingInstructionPotionResourceItems: MoveResourceDisplayItem[] =
    exitingInstructionPotionResourceIds.map((id) => ({
      id,
      kind: 'statusPotion',
      isExiting: true,
    }));
  let playerMoveResourceIndex = 0;
  const playerHudResourceItems: MoveResourceDisplayItem[] = moveResourceOrder.flatMap(
    (resourceKind, resourceIndex): MoveResourceDisplayItem[] => {
      if (resourceKind === 'statusMove') {
        playerMoveResourceIndex += 1;
        return !isPuzzleBoard || playerMoveResourceIndex <= playerMovementPointsRemaining
          ? [{id: `player-statusMove-${resourceIndex}`, kind: resourceKind}]
          : [];
      }
      if (resourceKind === 'statusAction') {
        if (hasPlayerUsedDirectManaMove) {
          return [
            ...Array.from({length: playerPotionCount}, (_, potionIndex) => ({
              id: `player-statusPotion-${potionIndex}`,
              kind: 'statusPotion' as const,
            })),
            ...exitingPlayerPotionResourceItems,
          ];
        }
        return [
          ...(showPlayerActiveAbilityStar
            ? [{id: `player-statusAction-${resourceIndex}`, kind: 'statusAction' as const}]
            : []),
          ...Array.from({length: playerPotionCount}, (_, potionIndex) => ({
            id: `player-statusPotion-${potionIndex}`,
            kind: 'statusPotion' as const,
          })),
          ...exitingPlayerPotionResourceItems,
        ];
      }
      if (resourceKind === 'statusMana' && !showPlayerManaMoveResource) {
        return [];
      }
      return [{id: `player-${resourceKind}-${resourceIndex}`, kind: resourceKind}];
    },
  );
  let instructionDemoMoveResourceIndex = 0;
  const displayedMoveResourceItems = moveResourceItems.flatMap((resource) => {
    if (instructionAbilityDemoState !== null) {
      if (resource.kind === 'statusMove') {
        instructionDemoMoveResourceIndex += 1;
        return instructionDemoMoveResourceIndex <=
          instructionAbilityDemoState.movementResourceCount
          ? [resource]
          : [];
      }
      if (resource.kind === 'statusAction') {
        return [
          ...(instructionAbilityDemoState.activeAbilityResourceAvailable ? [resource] : []),
          ...(instructionAbilityDemoState.potionResourceAvailable === true
            ? [instructionPotionMoveResourceItem]
            : []),
          ...exitingInstructionPotionResourceItems,
        ];
      }
      if (resource.kind === 'statusMana') {
        return instructionAbilityDemoState.manaMoveResourceAvailable ? [resource] : [];
      }
    }
    if (showInstructionPotionResource && resource.kind === 'statusAction') {
      return [resource, instructionPotionMoveResourceItem, ...exitingInstructionPotionResourceItems];
    }
    return [resource];
  });
  const showInstructionDrainerMovementLimitNote =
    instructionAbilityDemoState?.key === 'drainer' &&
    instructionAbilityDemoState.movementResourceCount === 0 &&
    instructionAbilityDemoState.animationNonce > PLAYER_MOVEMENT_POINT_COUNT;
  const opponentHudResourceOrder: HudResourceKey[] =
    opponentPotionCount > 0
      ? [
          ...moveResourceOrder,
          ...Array.from(
            {length: opponentPotionCount},
            () => 'statusPotion' as const,
          ),
        ]
      : moveResourceOrder;
  const playerActiveAbilityResourceCount =
    (playerActiveAbilityStarAvailable ? 1 : 0) + playerPotionCount;
  const canUsePlayerActiveAbility =
    !isPuzzleBoard ||
    (!hasPlayerUsedDirectManaMove && playerActiveAbilityResourceCount > 0);
  const isResetAnimating = resetAnimation !== null;
  const canUndoBoardAction =
    enableFreeTileMove && undoHistory.length > 0 && !isResetAnimating;
  const boardColors: BoardColorPalette =
    boardTheme === 'dark' ? darkModeColors : colors;
  const hoveredTileCenterDotColor =
    boardTheme === 'dark' ? '#c5c9d3' : '#5a5a5a';
  const hasPuzzleBoardChanges = useMemo(() => {
    if (!enableFreeTileMove) {
      return false;
    }
    if (faintedMonIdSet.size > 0) {
      return true;
    }
    if (playerActiveAbilityStarAvailable !== true) {
      return true;
    }
    if (playerManaMoveAvailable !== true) {
      return true;
    }
    if (Object.keys(playerMovementDistanceOffsetsByMonId).length > 0) {
      return true;
    }
    if (Object.keys(playerMovementStartTileOverridesByMonId).length > 0) {
      return true;
    }
    if (playerPotionCount !== playerStartingPotionCount) {
      return true;
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
  }, [
    boardEntities,
    enableFreeTileMove,
    faintedMonIdSet,
    initialBoardEntities,
    isSandboxFreeMoveBoard,
    playerActiveAbilityStarAvailable,
    playerManaMoveAvailable,
    playerMovementDistanceOffsetsByMonId,
    playerMovementStartTileOverridesByMonId,
    playerPotionCount,
    playerStartingPotionCount,
  ]);
  useEffect(() => {
    if (onPuzzleBoardDirtyChange === undefined) {
      return;
    }
    onPuzzleBoardDirtyChange(hasPuzzleBoardChanges);
  }, [hasPuzzleBoardChanges, onPuzzleBoardDirtyChange]);
  useEffect(() => {
    if (!enableFreeTileMove) {
      return;
    }
    onPuzzleBoardSnapshotChange?.({
      boardEntities: cloneBoardEntities(boardEntities),
      faintedMonIds: Array.from(faintedMonIdSet),
      opponentPotionCount,
      opponentScore,
      playerActiveAbilityStarAvailable,
      playerManaMoveAvailable,
      playerPotionCount,
      playerScore,
    });
    if (onPuzzleBoardStateChange === undefined) {
      return;
    }
    if (!didNotifyInitialPuzzleBoardStateRef.current) {
      didNotifyInitialPuzzleBoardStateRef.current = true;
      return;
    }
    onPuzzleBoardStateChange();
  }, [
    boardEntities,
    enableFreeTileMove,
    faintedMonIdSet,
    onPuzzleBoardSnapshotChange,
    onPuzzleBoardStateChange,
    opponentPotionCount,
    opponentScore,
    playerActiveAbilityStarAvailable,
    playerManaMoveAvailable,
    playerMovementDistanceOffsetsByMonId,
    playerMovementStartTileOverridesByMonId,
    playerPotionCount,
    playerScore,
  ]);
  useEffect(() => {
    onHudSnapshotChange?.({
      playerScore,
      opponentScore,
      playerPotionCount,
      opponentPotionCount,
      canReset: hasPuzzleBoardChanges,
      isResetAnimating,
    });
  }, [
    hasPuzzleBoardChanges,
    isResetAnimating,
    onHudSnapshotChange,
    opponentPotionCount,
    opponentScore,
    playerPotionCount,
    playerScore,
  ]);

  const markMonAsFaintedOnSpawn = (monId: string): void => {
    if (!enableFreeTileMove) {
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

  const clearPotionBubbleEffectTimerForId = (effectId: string) => {
    const delayId = potionBubbleEffectDelayByIdRef.current[effectId];
    if (delayId !== undefined) {
      window.clearTimeout(delayId);
      delete potionBubbleEffectDelayByIdRef.current[effectId];
    }
    const frameId = potionBubbleEffectFrameByIdRef.current[effectId];
    if (frameId !== undefined) {
      window.cancelAnimationFrame(frameId);
      delete potionBubbleEffectFrameByIdRef.current[effectId];
    }
    const timeoutId = potionBubbleEffectTimeoutByIdRef.current[effectId];
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
      delete potionBubbleEffectTimeoutByIdRef.current[effectId];
    }
  };

  const clearAllPotionBubbleEffectTimers = () => {
    Object.values(potionBubbleEffectDelayByIdRef.current).forEach((delayId) => {
      window.clearTimeout(delayId);
    });
    Object.values(potionBubbleEffectFrameByIdRef.current).forEach((frameId) => {
      window.cancelAnimationFrame(frameId);
    });
    Object.values(potionBubbleEffectTimeoutByIdRef.current).forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    potionBubbleEffectDelayByIdRef.current = {};
    potionBubbleEffectFrameByIdRef.current = {};
    potionBubbleEffectTimeoutByIdRef.current = {};
  };

  const clearAllPotionResourceExitTimers = () => {
    Object.values(potionResourceExitTimeoutByIdRef.current).forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    potionResourceExitTimeoutByIdRef.current = {};
  };

  const triggerPotionResourceIconExit = (scope: 'instruction' | 'player') => {
    potionResourceExitCounterRef.current += 1;
    const id = `${scope}-potion-exit-${potionResourceExitCounterRef.current}`;
    if (scope === 'player') {
      setExitingPlayerPotionResourceIds((current) => [...current, id]);
    } else {
      setExitingInstructionPotionResourceIds((current) => [...current, id]);
    }
    potionResourceExitTimeoutByIdRef.current[id] = window.setTimeout(() => {
      if (scope === 'player') {
        setExitingPlayerPotionResourceIds((current) =>
          current.filter((currentId) => currentId !== id),
        );
      } else {
        setExitingInstructionPotionResourceIds((current) =>
          current.filter((currentId) => currentId !== id),
        );
      }
      delete potionResourceExitTimeoutByIdRef.current[id];
    }, POTION_RESOURCE_ICON_EXIT_MS);
  };

  const triggerAttackEffect = (kind: AttackEffectKind, col: number, row: number) => {
    playBoardSoundEffect(
      kind === 'bomb'
        ? 'bomb'
        : kind === 'mystic'
          ? 'mysticAbility'
          : 'demonAbility',
    );
    attackEffectCounterRef.current += 1;
    const seq = attackEffectCounterRef.current;
    const id = `attack-effect-${seq}`;
    const particleSeed = seq * 1399 + col * 97 + row * 173;
    clearAttackEffectTimerForId(id);
    setAttackEffectSprites((current) => [
      ...current,
      {
        id,
        kind,
        col,
        row,
        progress: 0,
        particles: createAttackEffectParticleSet(kind, particleSeed),
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

  const triggerPotionBubbleEffect = (col: number, row: number) => {
    potionBubbleEffectCounterRef.current += 1;
    const seq = potionBubbleEffectCounterRef.current;
    const id = `potion-bubble-effect-${seq}`;
    const particleSeed = seq * 1531 + col * 107 + row * 191;
    clearPotionBubbleEffectTimerForId(id);

    potionBubbleEffectDelayByIdRef.current[id] = window.setTimeout(() => {
      delete potionBubbleEffectDelayByIdRef.current[id];
      setPotionBubbleEffectSprites((current) => [
        ...current,
        {
          id,
          col,
          row,
          progress: 0,
          particles: createPotionBubbleParticles(particleSeed),
        },
      ]);
      const startedAtMs = performance.now();
      const tick = (nowMs: number) => {
        const progress = clamp01(
          (nowMs - startedAtMs) / POTION_BUBBLE_EFFECT_DURATION_MS,
        );
        setPotionBubbleEffectSprites((current) =>
          current.map((effect) =>
            effect.id === id ? {...effect, progress} : effect,
          ),
        );
        if (progress >= 1) {
          delete potionBubbleEffectFrameByIdRef.current[id];
          return;
        }
        potionBubbleEffectFrameByIdRef.current[id] =
          window.requestAnimationFrame(tick);
      };
      potionBubbleEffectFrameByIdRef.current[id] = window.requestAnimationFrame(tick);
      potionBubbleEffectTimeoutByIdRef.current[id] = window.setTimeout(() => {
        setPotionBubbleEffectSprites((current) =>
          current.filter((effect) => effect.id !== id),
        );
        delete potionBubbleEffectTimeoutByIdRef.current[id];
      }, POTION_BUBBLE_EFFECT_DURATION_MS + POTION_BUBBLE_EFFECT_CLEANUP_BUFFER_MS);
    }, POTION_BUBBLE_EFFECT_DELAY_MS);
  };

  const triggerPotionBubbleEffectAfterPotionAbility = (col: number, row: number) => {
    if (!lastActiveAbilityUsedPotionRef.current) {
      return;
    }
    lastActiveAbilityUsedPotionRef.current = false;
    triggerPotionBubbleEffect(col, row);
  };

  const triggerScoredManaFadeOut = (sprite: {
    id: string;
    href: string;
    col: number;
    row: number;
  }) => {
    playBoardSoundEffect(sprite.href === boardAssets.supermana ? 'scoreSuperMana' : 'scoreMana');
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

  const triggerManaScoreEffects = (sprite: {
    id: string;
    href: string;
    col: number;
    row: number;
  }) => {
    triggerScoredManaFadeOut(sprite);
    triggerManaPoolScorePulse(sprite.col, sprite.row);
  };

  const createBoardUndoSnapshot = (
    entities: BoardEntity[] = boardEntities,
  ): BoardUndoSnapshot => ({
    boardEntities: cloneBoardEntities(entities),
    playerScore,
    opponentScore,
    playerPotionCount,
    opponentPotionCount,
    playerActiveAbilityStarAvailable,
    playerManaMoveAvailable,
    playerMovementDistanceOffsetsByMonId: {...playerMovementDistanceOffsetsByMonId},
    playerMovementStartTileOverridesByMonId: Object.fromEntries(
      Object.entries(playerMovementStartTileOverridesByMonId).map(([monId, tile]) => [
        monId,
        {...tile},
      ]),
    ),
    faintedMonIds: Array.from(faintedMonIdSet),
    forcedManaScoreSideById: {...forcedManaScoreSideByIdRef.current},
    sandboxDirectManaScoreSide: sandboxDirectManaScoreSideRef.current,
    sandboxManaSpawnTileById: Object.fromEntries(
      Object.entries(sandboxManaSpawnTileById).map(([manaId, tile]) => [
        manaId,
        {...tile},
      ]),
    ),
    sandboxItemSpawnTileById: Object.fromEntries(
      Object.entries(sandboxItemSpawnTileById).map(([itemId, tile]) => [
        itemId,
        {...tile},
      ]),
    ),
    selectedTile: selectedTile === null ? null : {...selectedTile},
    selectedMoveResourceId,
  });

  const setBoardEntitiesWithUndo = (
    updater: (currentEntities: BoardEntity[]) => BoardEntity[],
  ): void => {
    if (enableFreeTileMove) {
      const snapshot = createBoardUndoSnapshot();
      setUndoHistory((currentHistory) => [...currentHistory, snapshot]);
    }
    setBoardEntities((currentEntities) => {
      const nextEntities = updater(currentEntities);
      if (nextEntities === currentEntities) {
        return currentEntities;
      }
      return nextEntities;
    });
  };

  const restoreBoardUndoSnapshot = (snapshot: BoardUndoSnapshot): void => {
    clearAllScoredManaFadeTimers();
    clearAllManaPoolPulseTimers();
    clearAllAttackEffectTimers();
    clearAllPotionBubbleEffectTimers();
    clearAllPotionResourceExitTimers();
    clearWinPiecePulseTimers();
    const nextBoardEntities = cloneBoardEntities(snapshot.boardEntities);
    setBoardEntities(nextBoardEntities);
    setPlayerScore(snapshot.playerScore);
    setOpponentScore(snapshot.opponentScore);
    setPlayerPotionCount(snapshot.playerPotionCount);
    setOpponentPotionCount(snapshot.opponentPotionCount);
    setPlayerActiveAbilityStarAvailable(snapshot.playerActiveAbilityStarAvailable);
    setPlayerManaMoveAvailable(snapshot.playerManaMoveAvailable);
    setPlayerMovementDistanceOffsetsByMonId({
      ...snapshot.playerMovementDistanceOffsetsByMonId,
    });
    setPlayerMovementStartTileOverridesByMonId(
      Object.fromEntries(
        Object.entries(snapshot.playerMovementStartTileOverridesByMonId).map(
          ([monId, tile]) => [monId, {...tile}],
        ),
      ),
    );
    setFaintedMonIdSet(new Set(snapshot.faintedMonIds));
    setSandboxManaSpawnTileById(
      Object.fromEntries(
        Object.entries(snapshot.sandboxManaSpawnTileById).map(([manaId, tile]) => [
          manaId,
          {...tile},
        ]),
      ),
    );
    setSandboxItemSpawnTileById(
      Object.fromEntries(
        Object.entries(snapshot.sandboxItemSpawnTileById).map(([itemId, tile]) => [
          itemId,
          {...tile},
        ]),
      ),
    );
    setHoveredTile(null);
    setSelectedTile(snapshot.selectedTile === null ? null : {...snapshot.selectedTile});
    setHoveredMoveResourceId(null);
    setSelectedMoveResourceId(snapshot.selectedMoveResourceId);
    setPendingItemPickupChoice(null);
    setPendingDemonRebound(null);
    setPendingSpiritPush(null);
    setHoveredItemChoice(null);
    setScoredManaFadeSpritesById({});
    setManaPoolPulseSprites([]);
    setAttackEffectSprites([]);
    setPotionBubbleEffectSprites([]);
    setExitingPlayerPotionResourceIds([]);
    setExitingInstructionPotionResourceIds([]);
    setRenderedAngelProtectionZones([]);
    setRenderedBombRangeZones([]);
    setResetFadeInByEntityId({});
    setResetGhostFadeInByTileKey({});
    setResetAnimation(null);
    setResetAnimationProgress(1);
    setWinPiecePulsePhase('idle');
    lastActiveAbilityUsedPotionRef.current = false;
    forcedManaScoreSideByIdRef.current = {...snapshot.forcedManaScoreSideById};
    sandboxDirectManaScoreSideRef.current = snapshot.sandboxDirectManaScoreSide;
    previouslyScoredManaIdsRef.current = getScoredManaEntityIdSet(nextBoardEntities);
    previousBoardEntitiesByIdRef.current = new Map(
      nextBoardEntities.map((entity) => [entity.id, entity]),
    );
    lastAnimatedOpponentScoreRef.current = snapshot.opponentScore;
    lastAnimatedPlayerScoreRef.current = snapshot.playerScore;
    onPotionCountChange?.({side: 'white', count: snapshot.playerPotionCount});
    onPotionCountChange?.({side: 'black', count: snapshot.opponentPotionCount});
  };

  const undoLastBoardAction = (): void => {
    if (!enableFreeTileMove || isResetAnimating || undoHistory.length === 0) {
      return;
    }
    const snapshot = undoHistory[undoHistory.length - 1];
    if (snapshot === undefined) {
      return;
    }
    playBoardSoundEffect('undo');
    setUndoHistory((currentHistory) => currentHistory.slice(0, -1));
    restoreBoardUndoSnapshot(snapshot);
  };

  const clearWinPiecePulseTimers = () => {
    if (winPiecePulseUpTimeoutRef.current !== null) {
      window.clearTimeout(winPiecePulseUpTimeoutRef.current);
      winPiecePulseUpTimeoutRef.current = null;
    }
    if (winPiecePulseDownTimeoutRef.current !== null) {
      window.clearTimeout(winPiecePulseDownTimeoutRef.current);
      winPiecePulseDownTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (winningSolutionPulseTrigger <= 0) {
      return;
    }
    clearWinPiecePulseTimers();
    setWinPiecePulsePhase('up');
    winPiecePulseUpTimeoutRef.current = window.setTimeout(() => {
      setWinPiecePulsePhase('down');
      winPiecePulseUpTimeoutRef.current = null;
    }, WIN_PIECE_PULSE_UP_MS);
    winPiecePulseDownTimeoutRef.current = window.setTimeout(() => {
      setWinPiecePulsePhase('idle');
      winPiecePulseDownTimeoutRef.current = null;
    }, WIN_PIECE_PULSE_UP_MS + WIN_PIECE_PULSE_DOWN_MS);
  }, [winningSolutionPulseTrigger]);

  useEffect(() => {
    clearAllScoredManaFadeTimers();
    clearAllManaPoolPulseTimers();
    clearAllAttackEffectTimers();
    clearAllPotionBubbleEffectTimers();
    clearAllPotionResourceExitTimers();
    clearWinPiecePulseTimers();
    setWinPiecePulsePhase('idle');
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
    const memoryPersistedState =
      enableFreeTileMove
        ? getPersistedPuzzleBoardState(boardPreset, initialBoardEntities)
        : null;
    const storedSandboxState =
      memoryPersistedState === null && isSandboxFreeMoveBoard
        ? readPersistedSandboxBoardStateFromStorage(initialBoardEntities)
        : null;
    const persistedState = memoryPersistedState ?? storedSandboxState;
    if (storedSandboxState !== null) {
      persistedPuzzleBoardStateByPreset.set(boardPreset, storedSandboxState);
    }
    const nextBoardEntities =
      persistedState !== null
        ? cloneBoardEntities(persistedState.boardEntities)
        : initialBoardEntities;
    setBoardEntities(nextBoardEntities);
    setUndoHistory([]);
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
    setOpponentPotionCount(
      persistedState?.opponentPotionCount ?? opponentStartingPotionCount,
    );
    setPlayerActiveAbilityStarAvailable(
      persistedState?.playerActiveAbilityStarAvailable ?? true,
    );
    setPlayerManaMoveAvailable(
      persistedState?.playerManaMoveAvailable ?? true,
    );
    setPlayerMovementDistanceOffsetsByMonId(
      persistedState?.playerMovementDistanceOffsetsByMonId ?? {},
    );
    setPlayerMovementStartTileOverridesByMonId(
      persistedState?.playerMovementStartTileOverridesByMonId ?? {},
    );
    setFaintedMonIdSet(
      enableFreeTileMove
        ? new Set(persistedState?.faintedMonIds ?? [])
        : new Set(),
    );
    setSandboxManaSpawnTileById(cloneTileById(persistedState?.sandboxManaSpawnTileById));
    setSandboxItemSpawnTileById(cloneTileById(persistedState?.sandboxItemSpawnTileById));
    setPendingItemPickupChoice(null);
    setPendingDemonRebound(null);
    setPendingSpiritPush(null);
    setHoveredItemChoice(null);
    setScoredManaFadeSpritesById({});
    setManaPoolPulseSprites([]);
    setAttackEffectSprites([]);
    setPotionBubbleEffectSprites([]);
    setExitingPlayerPotionResourceIds([]);
    setExitingInstructionPotionResourceIds([]);
    setRenderedAngelProtectionZones([]);
    setResetFadeInByEntityId({});
    setResetGhostFadeInByTileKey({});
    previouslyScoredManaIdsRef.current = getScoredManaEntityIdSet(nextBoardEntities);
    forcedManaScoreSideByIdRef.current = {};
    sandboxDirectManaScoreSideRef.current = 'white';
    lastActiveAbilityUsedPotionRef.current = false;
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
    opponentStartingPotionCount,
    playerStartingPotionCount,
  ]);

  useEffect(
    () => () => {
      clearAllScoredManaFadeTimers();
      clearAllManaPoolPulseTimers();
      clearAllAttackEffectTimers();
      clearAllPotionBubbleEffectTimers();
      clearAllPotionResourceExitTimers();
      clearWinPiecePulseTimers();
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
    displayedBoardEntities.forEach((entity) => {
      if (!entity.isScored || !isManaEntityKind(entity.kind)) {
        return;
      }
      nextScoredManaIds.add(entity.id);
      if (!previouslyScoredManaIdsRef.current.has(entity.id)) {
        const forcedScoreSide = forcedManaScoreSideByIdRef.current[entity.id];
        if (forcedScoreSide !== undefined) {
          delete forcedManaScoreSideByIdRef.current[entity.id];
          if (forcedScoreSide === 'black') {
            opponentScoreDelta += getBlackDrainerManaScorePoints(entity.kind);
          } else {
            playerScoreDelta += getManaScorePoints(entity.kind);
          }
          return;
        }
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
  }, [displayedBoardEntities]);

  useEffect(() => {
    if (!enableFreeTileMove) {
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
  }, [boardEntities, enableFreeTileMove]);

  useEffect(() => {
    if (!enableFreeTileMove) {
      return;
    }
    const nextPersistedState: PersistedPuzzleBoardState = {
      boardEntities: cloneBoardEntities(boardEntities),
      playerScore,
      opponentScore,
      playerPotionCount,
      opponentPotionCount,
      faintedMonIds: Array.from(faintedMonIdSet),
      playerActiveAbilityStarAvailable,
      playerManaMoveAvailable,
      playerMovementDistanceOffsetsByMonId,
      playerMovementStartTileOverridesByMonId,
      sandboxManaSpawnTileById: cloneTileById(sandboxManaSpawnTileById),
      sandboxItemSpawnTileById: cloneTileById(sandboxItemSpawnTileById),
    };
    persistedPuzzleBoardStateByPreset.set(boardPreset, nextPersistedState);
    if (isSandboxFreeMoveBoard) {
      writePersistedSandboxBoardStateToStorage(nextPersistedState);
    }
  }, [
    boardEntities,
    boardPreset,
    enableFreeTileMove,
    faintedMonIdSet,
    isSandboxFreeMoveBoard,
    opponentPotionCount,
    opponentScore,
    playerActiveAbilityStarAvailable,
    playerManaMoveAvailable,
    playerMovementDistanceOffsetsByMonId,
    playerMovementStartTileOverridesByMonId,
    playerPotionCount,
    playerScore,
    sandboxItemSpawnTileById,
    sandboxManaSpawnTileById,
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
    preloadGameBoardEffectAssets();
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
      const layoutWidth = isBoardFullscreen ? window.innerWidth : availableWidth ?? window.innerWidth;
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
  }, [availableWidth, isBoardFullscreen, isPreviewBelow, maxUnitPixels, showHoverPreview]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setWaveFrameIndex((prev) => (prev + 1) % WAVE_FRAME_COUNT);
    }, WAVE_FRAME_MS);
    return () => {
      window.clearInterval(intervalId);
    };
  }, []);
  useEffect(() => {
    onItemPickupChoiceOpenChange?.(isItemPickupChoiceOpen);
  }, [isItemPickupChoiceOpen, onItemPickupChoiceOpenChange]);

  useEffect(() => {
    const clearSelectionOnOutsideClick = (event: PointerEvent) => {
      if (isItemPickupChoiceOpen) {
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
      if (event.button !== 0) {
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
      setInstructionSelectedItemChoice(null);
    };

    document.addEventListener('pointerdown', clearSelectionOnOutsideClick);
    return () => {
      document.removeEventListener('pointerdown', clearSelectionOnOutsideClick);
    };
  }, [
    pendingDemonRebound,
    pendingSpiritPush,
    isItemPickupChoiceOpen,
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
  const boardPerspectiveContentTransform = isBoardPerspectiveFlipped
    ? 'rotate(180 5.5 5.5)'
    : undefined;
  const threeDBoardViewportScale = Math.max(0.001, fullscreenScale);
  const threeDBoardViewportWidth =
    isBoardFullscreen && typeof window !== 'undefined'
      ? Math.ceil(window.innerWidth / threeDBoardViewportScale)
      : Math.max(renderWidth, Math.floor(availableWidth ?? renderWidth));
  const threeDBoardViewportHeight =
    isBoardFullscreen && typeof window !== 'undefined'
      ? Math.ceil(window.innerHeight / threeDBoardViewportScale)
      : undefined;

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
      displayedBoardEntities.filter(
        (entity) => entity.carriedByDrainerId === undefined && !entity.isScored,
      ),
    [displayedBoardEntities],
  );
  const rememberSandboxDirectManaScoreSide = (
    entity: BoardEntity | null | undefined,
  ) => {
    if (
      !isSandboxFreeMoveBoard ||
      entity === null ||
      entity === undefined ||
      entity.kind !== 'mon' ||
      entity.side === undefined
    ) {
      return;
    }
    sandboxDirectManaScoreSideRef.current = entity.side;
  };
  const selectableSourceTileKeySet = useMemo(
    () =>
      new Set(
        visibleBoardEntities
          .filter((entity) => {
            if (!isPuzzleBoard) {
              return true;
            }
            if (hasPlayerUsedDirectManaMove) {
              return false;
            }
            if (
              isManaEntityKind(entity.kind) &&
              (!playerManaMoveAvailable || entity.kind !== 'whiteMana')
            ) {
              return false;
            }
            if (entity.kind !== 'mon') {
              return true;
            }
            if (entity.side === 'black') {
              return false;
            }
            return true;
          })
          .map((entity) => toTileKey(entity.col, entity.row)),
      ),
    [
      isPuzzleBoard,
      hasPlayerUsedDirectManaMove,
      playerManaMoveAvailable,
      visibleBoardEntities,
    ],
  );
  const isMonFaintedOnOwnSpawn = (mon: BoardEntity): boolean => {
    if (!isMonBoardEntity(mon)) {
      return false;
    }
    return (
      enableFreeTileMove &&
      faintedMonIdSet.has(mon.id) &&
      isMonOnOwnSpawn({
        col: mon.col,
        row: mon.row,
        type: mon.monType,
        side: mon.side,
      })
    );
  };
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
          !isMonFaintedOnOwnSpawn(entity),
      ),
    [enableFreeTileMove, faintedMonIdSet, visibleBoardEntities],
  );
  const getProtectingAngelsForTarget = (targetEntity: BoardEntity) =>
    !isMonBoardEntity(targetEntity)
      ? []
      : activeAngels.filter(
          (angel) =>
            angel.side === targetEntity.side &&
            angel.id !== targetEntity.id &&
            Math.max(
              Math.abs(angel.col - targetEntity.col),
              Math.abs(angel.row - targetEntity.row),
            ) === 1,
        );
  const isMonCurrentlyFainted = (mon: BoardEntity): boolean => {
    return isMonFaintedOnOwnSpawn(mon);
  };
  const isPlayerActiveAbilitySource = (
    entity: BoardEntity,
  ): entity is BoardEntity & {
    kind: 'mon';
    side: 'white';
    monType: 'spirit' | 'demon' | 'mystic';
  } =>
    isPuzzleBoard &&
    entity.kind === 'mon' &&
    entity.side === 'white' &&
    entity.monType !== undefined &&
    (entity.monType === 'spirit' ||
      ((entity.monType === 'demon' || entity.monType === 'mystic') &&
        entity.heldItemKind !== 'bomb'));
  const isAbilityUserBlockedOnOwnSpawn = (mon: BoardEntity): boolean => {
    if (!isMonBoardEntity(mon)) {
      return false;
    }
    return (
      (mon.monType === 'spirit' ||
        mon.monType === 'demon' ||
        mon.monType === 'mystic') &&
      isMonOnOwnSpawn({
        col: mon.col,
        row: mon.row,
        type: mon.monType,
        side: mon.side,
      })
    );
  };
  const activeMonPositions = useMemo(
    () => ({
      black: visibleBoardEntities
        .filter(
          (entity): entity is BoardEntity & {kind: 'mon'; side: 'black'; monType: MonType} =>
            entity.kind === 'mon' && entity.side === 'black' && entity.monType !== undefined,
        )
        .map((entity) => {
          const isFainted =
            isMonFaintedOnOwnSpawn(entity) ||
            (instructionAbilityDemoState?.faintedMonIds.includes(entity.id) ?? false);
          return {
            id: entity.id,
            col: entity.col,
            row: entity.row,
            href: entity.href,
            type: entity.monType,
            heldItemKind: entity.heldItemKind,
            isFainted,
          };
        }),
      white: visibleBoardEntities
        .filter(
          (entity): entity is BoardEntity & {kind: 'mon'; side: 'white'; monType: MonType} =>
            entity.kind === 'mon' && entity.side === 'white' && entity.monType !== undefined,
        )
        .map((entity) => {
          const isFainted =
            isMonFaintedOnOwnSpawn(entity) ||
            (instructionAbilityDemoState?.faintedMonIds.includes(entity.id) ?? false);
          return {
            id: entity.id,
            col: entity.col,
            row: entity.row,
            href: entity.href,
            type: entity.monType,
            heldItemKind: entity.heldItemKind,
            isFainted,
          };
        }),
    }),
    [enableFreeTileMove, faintedMonIdSet, instructionAbilityDemoState, visibleBoardEntities],
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
          if (isMonBoardEntity(entity)) {
            const homeSpawnTile = getMonSpawnTile(entity.side, entity.monType);
            if (
              homeSpawnTile !== null &&
              homeSpawnTile.col === entity.col &&
              homeSpawnTile.row === entity.row
            ) {
              return false;
            }
          }
          if (
            (entity.kind === 'whiteMana' ||
              entity.kind === 'blackMana' ||
              entity.kind === 'superMana') &&
            (isSandboxFreeMoveBoard || entity.carriedByDrainerId !== undefined)
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
    [enableFreeTileMove, initialBoardEntities, isSandboxFreeMoveBoard],
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
    displayedBoardEntities.forEach((entity) => {
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
  }, [displayedBoardEntities]);
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
  const getRenderedEntityCoords = (entity: {id: string; col: number; row: number}) => {
    if (resetAnimationPositionByEntityId?.[entity.id] !== undefined) {
      return resetAnimationPositionByEntityId[entity.id];
    }
    if (instructionAbilityDemoState !== null) {
      return instructionAbilityDemoBasePositionByEntityId.get(entity.id) ??
        {col: entity.col, row: entity.row};
    }
    return {col: entity.col, row: entity.row};
  };
  const getInstructionAbilityDemoEntityDelta = (entity: {
    id: string;
    col: number;
    row: number;
  }) => {
    const basePosition = instructionAbilityDemoBasePositionByEntityId.get(entity.id);
    const transitionFrom =
      instructionAbilityDemoState !== null &&
      instructionAbilityDemoState.transitionEntityIds.includes(entity.id)
        ? instructionAbilityDemoState.transitionFromByEntityId[entity.id]
        : undefined;
    const renderedPosition =
      transitionFrom === undefined
        ? {col: entity.col, row: entity.row}
        : {
            col:
              transitionFrom.col +
              (entity.col - transitionFrom.col) * instructionAbilityDemoTransitionProgress,
            row:
              transitionFrom.row +
              (entity.row - transitionFrom.row) * instructionAbilityDemoTransitionProgress,
          };
    return basePosition === undefined
      ? {col: 0, row: 0}
      : {
          col: renderedPosition.col - basePosition.col,
          row: renderedPosition.row - basePosition.row,
        };
  };
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
        createCornerWaveLines(waveSeedNonce + (index + 1) * 7919, boardColors),
      ),
    [boardColors, waveSeedNonce],
  );
  const previewManaPoolWaves = useMemo(
    () => createCornerWaveLines(waveSeedNonce + 424242, boardColors),
    [boardColors, waveSeedNonce],
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
  const instructionSelectedItemTileKey =
    instructionSelectedItemChoice === null
      ? null
      : toTileKey(instructionSelectedItemChoice.tile.col, instructionSelectedItemChoice.tile.row);

  activePickupItems.forEach((item) => {
    const itemTileKey = toTileKey(item.col, item.row);
    const selectedInstructionItemKind =
      !isItemPickupChoiceOpen &&
      isInstructionSelectedItemChoiceActive &&
      instructionSelectedItemTileKey === itemTileKey
        ? instructionSelectedItemChoice?.kind ?? null
        : null;
    const itemInfo =
      selectedInstructionItemKind === 'bomb'
        ? explanationText.bomb
        : selectedInstructionItemKind === 'potion'
          ? explanationText.potion
          : explanationText.item;
    pieceByTile[`${item.row}-${item.col}`] = {
      kind: 'image',
      href:
        selectedInstructionItemKind === 'bomb'
          ? boardAssets.bomb
          : selectedInstructionItemKind === 'potion'
            ? boardAssets.potion
            : item.href,
      title: itemInfo.title,
      text: itemInfo.text,
      detailPath: getPreviewDetailPath(itemInfo.title),
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
  [...moveResourceItems, instructionPotionMoveResourceItem].forEach((resource) => {
    const info = moveResourceInfo[resource.kind];
    moveResourceById[resource.id] = {
      kind: 'image',
      href: moveResourceAssets[resource.kind],
      title: info.title,
      text: info.text,
      detailPath: getPreviewDetailPath(info.title),
    };
  });

  const effectiveHoveredTile = hoveredTileOverride ?? hoveredTile;

  const hoveredPiece =
    effectiveHoveredTile !== null
      ? pieceByTile[`${effectiveHoveredTile.row}-${effectiveHoveredTile.col}`] ?? null
      : null;
  const instructionDemoSelectedPiece =
    instructionAbilityDemoState !== null && selectedTile !== null
      ? (() => {
          if (instructionAbilityDemoState.key === 'mana') {
            const selectedMana = boardEntities.find(
              (entity) => entity.id === instructionAbilityDemoState.selectedManaId,
            );
            if (
              selectedMana === undefined ||
              (selectedMana.kind !== 'whiteMana' && selectedMana.kind !== 'blackMana')
            ) {
              return null;
            }
            const info =
              selectedMana.kind === 'whiteMana'
                ? explanationText.whiteMana
                : explanationText.blackMana;
            return {
              kind: 'image' as const,
              href: selectedMana.href,
              title: info.title,
              text: info.text,
              detailPath: getPreviewDetailPath(info.title),
            };
          }
          if (instructionAbilityDemoState.key === 'superMana') {
            const selectedMana = boardEntities.find(
              (entity) => entity.id === instructionAbilityDemoState.selectedManaId,
            );
            if (selectedMana === undefined || selectedMana.kind !== 'superMana') {
              return null;
            }
            const info = explanationText.supermana;
            return {
              kind: 'image' as const,
              href: selectedMana.href,
              title: info.title,
              text: info.text,
              detailPath: getPreviewDetailPath(info.title),
            };
          }
          if (
            instructionAbilityDemoState.key === 'bomb' ||
            instructionAbilityDemoState.key === 'potion'
          ) {
            const info = explanationText[instructionAbilityDemoState.key];
            return {
              kind: 'image' as const,
              href:
                instructionAbilityDemoState.key === 'bomb'
                  ? boardAssets.bomb
                  : boardAssets.potion,
              title: info.title,
              text: info.text,
              detailPath: getPreviewDetailPath(info.title),
            };
          }
          const selectedBaseEntity = boardEntities.find(
	            (entity) =>
	              entity.kind === 'mon' &&
	              entity.side === instructionAbilityDemoState.side &&
	              entity.monType === instructionAbilityDemoState.key &&
	              entity.col === selectedTile.col &&
              entity.row === selectedTile.row,
          );
          if (
            selectedBaseEntity === undefined ||
            selectedBaseEntity.monType === undefined
          ) {
            return null;
          }
          const info = explanationText[selectedBaseEntity.monType];
          return {
            kind: 'image' as const,
            href: selectedBaseEntity.href,
            title: info.title,
            text: info.text,
            detailPath: getPreviewDetailPath(info.title),
          };
        })()
      : null;
  const shouldPrioritizeInstructionDemoSelectedPiece =
    instructionDemoSelectedPiece !== null &&
    instructionAbilityDemoState !== null &&
    (instructionAbilityDemoState.key === 'bomb' ||
      instructionAbilityDemoState.key === 'potion');
  const selectedPiece =
    selectedTile !== null
      ? shouldPrioritizeInstructionDemoSelectedPiece
        ? instructionDemoSelectedPiece
        : pieceByTile[`${selectedTile.row}-${selectedTile.col}`] ??
          instructionDemoSelectedPiece
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
    selectableSourceTileKeySet.has(selectedTileKey ?? '')
      ? selectedTile
      : null;
  useEffect(() => {
    if (
      !enableFreeTileMove ||
      selectedTile === null ||
      selectedTileKey === null ||
      !movableEntityTileKeySet.has(selectedTileKey) ||
      selectableSourceTileKeySet.has(selectedTileKey)
    ) {
      return;
    }
    setSelectedTile(null);
  }, [
    enableFreeTileMove,
    movableEntityTileKeySet,
    selectableSourceTileKeySet,
    selectedTile,
    selectedTileKey,
  ]);
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
    attacker: BoardEntity,
    target: BoardEntity,
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
        const destinationOccupants = visibleBoardEntities.filter(
          (entity) =>
            entity.id !== target.id &&
            entity.col === optionCol &&
            entity.row === optionRow,
        );
        if (destinationOccupants.length === 0) {
          if (!canEntityMoveToTile(target, optionCol, optionRow)) {
            continue;
          }
          options.push({col: optionCol, row: optionRow});
          continue;
        }
        if (destinationOccupants.length > 1) {
          continue;
        }
        const destinationOccupant = destinationOccupants[0];
        const canPushManaIntoDrainerHands =
          isManaEntityKind(target.kind) &&
          canDrainerReceiveMana(boardEntities, destinationOccupant);
        if (canPushManaIntoDrainerHands) {
          options.push({col: optionCol, row: optionRow});
          continue;
        }
        const canPushDrainerOntoMana =
          target.kind === 'mon' &&
          target.side !== undefined &&
          target.monType === 'drainer' &&
          target.heldItemKind !== 'bomb' &&
          isManaEntityKind(destinationOccupant.kind) &&
          canEntityMoveToTile(target, optionCol, optionRow);
        if (canPushDrainerOntoMana) {
          options.push({col: optionCol, row: optionRow});
        }
        continue;
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
    if (isPlayerActiveAbilitySource(selectedEntity) && !canUsePlayerActiveAbility) {
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
      const spiritTargetsWithDestinations = visibleBoardEntities
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
        .map((targetEntity) => ({
          targetEntity,
          destinationOptions: getSpiritPushDestinationOptions(targetEntity),
        }))
        .filter(({destinationOptions}) => destinationOptions.length > 0);
      const indicators: Array<{id: string; col: number; row: number; color: string}> =
        spiritTargetsWithDestinations.map(({targetEntity}) => ({
          id: targetEntity.id,
          col: targetEntity.col,
          row: targetEntity.row,
          color: SPIRIT_ABILITY_INDICATOR_COLOR,
        }));
      spiritTargetsWithDestinations.forEach(({targetEntity, destinationOptions}) => {
        if (
          targetEntity.kind !== 'mon' ||
          targetEntity.side === undefined ||
          targetEntity.monType !== 'drainer' ||
          targetEntity.heldItemKind === 'bomb'
        ) {
          return;
        }
        const drainerHoldsMana = boardEntities.some(
          (entity) =>
            !entity.isScored &&
            entity.carriedByDrainerId === targetEntity.id &&
            isManaEntityKind(entity.kind),
        );
        if (!drainerHoldsMana) {
          return;
        }
        destinationOptions.forEach((option) => {
          const destinationMana = visibleBoardEntities.find(
            (entity) =>
              entity.col === option.col &&
              entity.row === option.row &&
              isManaEntityKind(entity.kind),
          );
          if (destinationMana === undefined) {
            return;
          }
          indicators.push({
            id: `spirit-drainer-mana-destination-${targetEntity.id}-${option.col}-${option.row}`,
            col: option.col,
            row: option.row,
            color: SPIRIT_ABILITY_INDICATOR_COLOR,
          });
        });
      });
      return indicators;
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
    canUsePlayerActiveAbility,
    enableFreeTileMove,
    faintedMonIdSet,
    isPuzzleBoard,
    isSandboxFreeMoveBoard,
    isResetAnimating,
    pendingDemonRebound,
    pendingSpiritPush,
    selectedMovableTile,
    visibleBoardEntities,
  ]);
  const attackTargetHighlightMonIdSet = useMemo(() => {
    if (
      !enableFreeTileMove ||
      isResetAnimating ||
      pendingDemonRebound !== null ||
      pendingSpiritPush !== null ||
      selectedMovableTile === null
    ) {
      return new Set<string>();
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
      return new Set<string>();
    }
    if (selectedEntity.monType !== 'demon' && selectedEntity.monType !== 'mystic') {
      return new Set<string>();
    }
    if (isAbilityUserBlockedOnOwnSpawn(selectedEntity)) {
      return new Set<string>();
    }
    const monIdSet = new Set(
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
        .map((entity) => entity.id),
    );
    const highlightedTargetIdSet = new Set<string>();
    attackIndicatorTargets.forEach((target) => {
      if (monIdSet.has(target.id)) {
        highlightedTargetIdSet.add(target.id);
      }
    });
    return highlightedTargetIdSet;
  }, [
    attackIndicatorTargets,
    enableFreeTileMove,
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
    if (isPlayerActiveAbilitySource(selectedEntity) && !canUsePlayerActiveAbility) {
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
    canUsePlayerActiveAbility,
    enableFreeTileMove,
    isPuzzleBoard,
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
      if (isMonFaintedOnOwnSpawn(selectedEntity)) {
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
    if (isPlayerActiveAbilitySource(selectedEntity) && !canUsePlayerActiveAbility) {
      return [];
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
    canUsePlayerActiveAbility,
    enableFreeTileMove,
    faintedMonIdSet,
    isPuzzleBoard,
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
    if (isMonFaintedOnOwnSpawn(selectedEntity)) {
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
  const displayedDemonReboundDots = [
    ...pendingDemonReboundDots,
    ...(instructionAbilityDemoState?.demonReboundDots ?? []),
  ];
  const pendingSpiritPushAttackIndicators = useMemo(() => {
    if (pendingSpiritPush === null) {
      return [];
    }
    const targetEntity = visibleBoardEntities.find(
      (entity) => entity.id === pendingSpiritPush.targetId,
    );
    if (targetEntity === undefined) {
      return [];
    }
    const indicators: AbilityTargetIndicator[] = [];
    if (
      isManaEntityKind(targetEntity.kind)
    ) {
      pendingSpiritPush.destinationOptions.forEach((option) => {
        const destinationDrainer = visibleBoardEntities.find(
          (entity) =>
            !entity.isScored &&
            entity.carriedByDrainerId === undefined &&
            entity.col === option.col &&
            entity.row === option.row &&
            canDrainerReceiveMana(boardEntities, entity),
        );
        if (destinationDrainer === undefined) {
          return;
        }
        indicators.push({
          id: `pending-spirit-mana-receiver-${targetEntity.id}-${option.col}-${option.row}`,
          col: option.col,
          row: option.row,
          color: SPIRIT_ABILITY_INDICATOR_COLOR,
        });
      });
    }
    if (
      targetEntity.kind === 'mon' &&
      targetEntity.side !== undefined &&
      targetEntity.monType === 'drainer' &&
      targetEntity.heldItemKind !== 'bomb'
    ) {
      const drainerHoldsMana = boardEntities.some(
        (entity) =>
          !entity.isScored &&
          entity.carriedByDrainerId === targetEntity.id &&
          isManaEntityKind(entity.kind),
      );
      if (drainerHoldsMana) {
        pendingSpiritPush.destinationOptions.forEach((option) => {
          const destinationMana = visibleBoardEntities.find(
            (entity) =>
              !entity.isScored &&
              entity.carriedByDrainerId === undefined &&
              entity.col === option.col &&
              entity.row === option.row &&
              isManaEntityKind(entity.kind),
          );
          if (destinationMana === undefined) {
            return;
          }
          indicators.push({
            id: `pending-spirit-drainer-mana-${targetEntity.id}-${option.col}-${option.row}`,
            col: option.col,
            row: option.row,
            color: SPIRIT_ABILITY_INDICATOR_COLOR,
          });
        });
      }
    }
    return indicators;
  }, [boardEntities, pendingSpiritPush, visibleBoardEntities]);
  const pendingSpiritPushIndicatorTileKeySet = useMemo(
    () =>
      new Set(
        pendingSpiritPushAttackIndicators.map((target) => toTileKey(target.col, target.row)),
      ),
    [pendingSpiritPushAttackIndicators],
  );
  const pendingSpiritPushDots =
    pendingSpiritPush?.destinationOptions.filter(
      (option) => !pendingSpiritPushIndicatorTileKeySet.has(toTileKey(option.col, option.row)),
    ) ?? [];
  const displayedSpiritPushDots = [
    ...pendingSpiritPushDots,
    ...(instructionAbilityDemoState?.spiritPushDots ?? []),
  ];
  const directManaMoveDrainerTargetIndicators = useMemo<AbilityTargetIndicator[]>(() => {
    if (
      !isPuzzleBoard ||
      isResetAnimating ||
      pendingDemonRebound !== null ||
      pendingSpiritPush !== null ||
      selectedMovableTile === null ||
      !playerManaMoveAvailable
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
      selectedEntity.kind !== 'whiteMana'
    ) {
      return [];
    }
    return visibleBoardEntities
      .filter(
        (entity): entity is BoardEntity & {
          kind: 'mon';
          side: 'black' | 'white';
          monType: 'drainer';
        } =>
          canDrainerReceiveMana(boardEntities, entity) &&
          isAdjacentTileMove(selectedEntity.col, selectedEntity.row, entity.col, entity.row),
      )
      .map((entity) => ({
        id: `direct-mana-drainer-target-${selectedEntity.id}-${entity.id}`,
        col: entity.col,
        row: entity.row,
        color: ADJACENT_MOVE_DOT_COLOR,
      }));
  }, [
    isPuzzleBoard,
    isResetAnimating,
    pendingDemonRebound,
    pendingSpiritPush,
    playerManaMoveAvailable,
    selectedMovableTile,
    boardEntities,
    visibleBoardEntities,
  ]);
  const displayedAttackIndicatorTargets: AbilityTargetIndicator[] = [
    ...attackIndicatorTargets,
    ...directManaMoveDrainerTargetIndicators,
    ...(instructionAbilityDemoState?.abilityTargetIndicators ?? []),
  ];
  const displayedAbilityRangeHintTiles: AbilityRangeHintTile[] = [
    ...abilityRangeHintTiles,
    ...(instructionAbilityDemoState?.abilityRangeHintTiles ?? []),
  ];
  const isInstructionAbilityDemoWideMode =
    enableInstructionAbilityDemos &&
    showHoverPreview &&
    !isPreviewBelow &&
    !enableFreeTileMove &&
    boardPreset === 'default';
  const selectedBoardScaleGroup: BoardScaleGroup | null =
    selectedTileKey === null || isInstructionAbilityDemoWideMode
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
      : isInstructionAbilityDemoWideMode
        ? hoveredPiece !== null
          ? effectiveHoveredTile
          : null
      : selectedTile !== null
      ? selectedTile
      : hoveredPiece !== null
        ? effectiveHoveredTile
        : null;
  const activeBoardTileForThinPreview =
    selectedPiece !== null
      ? selectedTile
      : selectedMoveResource === null &&
          hoveredMoveResource === null &&
          hoveredPiece !== null
        ? effectiveHoveredTile
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
  const canRunInstructionAbilityDemo = isInstructionAbilityDemoWideMode;
  const selectedInstructionAbilityDemo = useMemo<{
    key: InstructionAbilityDemoKey;
    side: InstructionAbilityDemoSide;
  } | null>(() => {
    if (!canRunInstructionAbilityDemo || selectedTile === null) {
      return null;
    }
    const selectedEntity = boardEntities.find(
      (entity) =>
        entity.kind === 'mon' &&
        entity.side !== undefined &&
        entity.col === selectedTile.col &&
        entity.row === selectedTile.row,
    );
    if (selectedEntity?.monType === undefined) {
      return null;
    }
    if (
      selectedEntity.monType === 'angel' ||
      selectedEntity.monType === 'demon' ||
      selectedEntity.monType === 'drainer' ||
      selectedEntity.monType === 'spirit' ||
      selectedEntity.monType === 'mystic'
    ) {
      return {key: selectedEntity.monType, side: selectedEntity.side};
    }
    return null;
  }, [boardEntities, canRunInstructionAbilityDemo, selectedTile]);
  const selectedInstructionAbilityDemoKey = selectedInstructionAbilityDemo?.key ?? null;
  const selectedInstructionAbilityDemoSide = selectedInstructionAbilityDemo?.side ?? 'white';
  const selectedInstructionManaDemo = useMemo<{
    id: string;
    side: InstructionAbilityDemoSide;
    from: {col: number; row: number};
    to: {col: number; row: number};
  } | null>(() => {
    if (!canRunInstructionAbilityDemo || selectedTile === null) {
      return null;
    }
    const selectedEntity = boardEntities.find(
      (entity) =>
        entity.kind === 'whiteMana' &&
        entity.col === selectedTile.col &&
        entity.row === selectedTile.row,
    );
    if (selectedEntity === undefined) {
      return null;
    }
    const demoConfig =
      defaultInstructionDemoEntityIds.mana.byId[
        selectedEntity.id as keyof typeof defaultInstructionDemoEntityIds.mana.byId
      ];
    return demoConfig === undefined
      ? null
      : {
          id: selectedEntity.id,
          ...demoConfig,
        };
  }, [boardEntities, canRunInstructionAbilityDemo, selectedTile]);
  const selectedInstructionSuperManaDemo = useMemo<{
    id: string;
  } | null>(() => {
    if (!canRunInstructionAbilityDemo || selectedTile === null) {
      return null;
    }
    const selectedEntity = boardEntities.find(
      (entity) =>
        entity.kind === 'superMana' &&
        entity.col === selectedTile.col &&
        entity.row === selectedTile.row,
    );
    return selectedEntity === undefined ? null : {id: selectedEntity.id};
  }, [boardEntities, canRunInstructionAbilityDemo, selectedTile]);
  const selectedInstructionItemDemo =
    !isItemPickupChoiceOpen && isInstructionSelectedItemChoiceActive
      ? instructionSelectedItemChoice?.kind ?? null
      : null;

  useEffect(() => {
    instructionAbilityDemoRunIdRef.current += 1;
    if (instructionAbilityDemoTimeoutRef.current !== null) {
      window.clearTimeout(instructionAbilityDemoTimeoutRef.current);
      instructionAbilityDemoTimeoutRef.current = null;
    }

    if (!enableInstructionAbilityDemos) {
      setInstructionAbilityDemoState(null);
      setInstructionAbilityDemoTransitionProgress(1);
      if (instructionAbilityDemoTransitionFrameRef.current !== null) {
        window.cancelAnimationFrame(instructionAbilityDemoTransitionFrameRef.current);
        instructionAbilityDemoTransitionFrameRef.current = null;
      }
      return;
    }

    if (
      selectedInstructionAbilityDemoKey === null &&
      selectedInstructionManaDemo === null &&
      selectedInstructionSuperManaDemo === null &&
      selectedInstructionItemDemo === null
    ) {
      setInstructionAbilityDemoState(null);
      setInstructionAbilityDemoTransitionProgress(1);
      if (instructionAbilityDemoTransitionFrameRef.current !== null) {
        window.cancelAnimationFrame(instructionAbilityDemoTransitionFrameRef.current);
        instructionAbilityDemoTransitionFrameRef.current = null;
      }
      clearAllAttackEffectTimers();
      clearAllPotionBubbleEffectTimers();
      clearAllPotionResourceExitTimers();
      clearAllManaPoolPulseTimers();
      clearAllScoredManaFadeTimers();
      setAttackEffectSprites([]);
      setPotionBubbleEffectSprites([]);
      setExitingPlayerPotionResourceIds([]);
      setExitingInstructionPotionResourceIds([]);
      setManaPoolPulseSprites([]);
      setScoredManaFadeSpritesById({});
      return;
    }

    clearAllAttackEffectTimers();
    clearAllPotionBubbleEffectTimers();
    clearAllPotionResourceExitTimers();
    clearAllManaPoolPulseTimers();
    clearAllScoredManaFadeTimers();
    setAttackEffectSprites([]);
    setPotionBubbleEffectSprites([]);
    setExitingPlayerPotionResourceIds([]);
    setExitingInstructionPotionResourceIds([]);
    setManaPoolPulseSprites([]);
    setScoredManaFadeSpritesById({});
    setInstructionAbilityDemoTransitionProgress(1);
    if (instructionAbilityDemoTransitionFrameRef.current !== null) {
      window.cancelAnimationFrame(instructionAbilityDemoTransitionFrameRef.current);
      instructionAbilityDemoTransitionFrameRef.current = null;
    }

    const runId = instructionAbilityDemoRunIdRef.current;
    const playInstructionDemoStepSound = (step: InstructionAbilityDemoStep) => {
      const sounds: BoardSoundEffectKey[] = [...(step.soundEffects ?? [])];
      if (step.movementResourceCost !== undefined) {
        sounds.push('move');
      }
      if (step.consumeActiveAbilityResource && step.attackEffect === undefined) {
        if (
          selectedInstructionAbilityDemoKey === 'spirit' ||
          selectedInstructionItemDemo === 'potion'
        ) {
          sounds.push('spiritAbility');
        }
      }
      if (step.consumePotionResource) {
        sounds.push('usePotion');
        if (selectedInstructionItemDemo === 'potion') {
          sounds.push('spiritAbility');
        }
      }
      const playedSounds = new Set<BoardSoundEffectKey>();
      sounds.forEach((sound) => {
        if (playedSounds.has(sound)) {
          return;
        }
        playedSounds.add(sound);
        playBoardSoundEffect(sound);
      });
    };

    if (selectedInstructionManaDemo !== null) {
      const baseEntities = cloneBoardEntities(initialBoardEntities);
      const getManaMoveDots = (entities: BoardEntity[]): Array<{col: number; row: number}> => {
        const selectedMana = entities.find(
          (entity) => entity.id === selectedInstructionManaDemo.id,
        );
        if (
          selectedMana === undefined ||
          (selectedMana.kind !== 'whiteMana' && selectedMana.kind !== 'blackMana')
        ) {
          return [];
        }
        const visibleEntities = entities.filter(
          (entity) => entity.carriedByDrainerId === undefined && !entity.isScored,
        );
        const dots: Array<{col: number; row: number}> = [];
        for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
          for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
            if (rowOffset === 0 && colOffset === 0) {
              continue;
            }
            const optionCol = selectedMana.col + colOffset;
            const optionRow = selectedMana.row + rowOffset;
            if (
              optionCol < 0 ||
              optionCol >= BOARD_SIZE ||
              optionRow < 0 ||
              optionRow >= BOARD_SIZE ||
              !canEntityMoveToTile(selectedMana, optionCol, optionRow)
            ) {
              continue;
            }
            const isOccupied = visibleEntities.some(
              (entity) =>
                entity.id !== selectedMana.id &&
                entity.col === optionCol &&
                entity.row === optionRow,
            );
            if (!isOccupied) {
              dots.push({col: optionCol, row: optionRow});
            }
          }
        }
        return dots;
      };
      const resetManaStep: InstructionAbilityDemoStep = {
        update: () => cloneBoardEntities(baseEntities),
        restoreTurnResources: true,
      };
      const steps: InstructionAbilityDemoStep[] = [
        {
          update: (entities) => entities,
          manaMoveDots: getManaMoveDots(baseEntities),
        },
        {
          update: (entities) =>
            updateBoardEntity(entities, selectedInstructionManaDemo.id, selectedInstructionManaDemo.to),
          consumeManaMoveResource: true,
          soundEffects: ['move'],
        },
        {
          update: (entities) => entities,
        },
        resetManaStep,
      ];
      let currentEntities = cloneBoardEntities(baseEntities);
      let currentMovementResourceCount = PLAYER_MOVEMENT_POINT_COUNT;
      let currentActiveAbilityResourceAvailable = true;
      let currentManaMoveResourceAvailable = true;
      let stepIndex = 0;
      const applyInstructionManaDemoResourceStep = (step: InstructionAbilityDemoStep) => {
        if (step.restoreTurnResources) {
          currentMovementResourceCount = PLAYER_MOVEMENT_POINT_COUNT;
          currentActiveAbilityResourceAvailable = true;
          currentManaMoveResourceAvailable = true;
        }
        if (step.consumeManaMoveResource) {
          currentMovementResourceCount = 0;
          currentActiveAbilityResourceAvailable = false;
          currentManaMoveResourceAvailable = false;
        }
      };
      setInstructionAbilityDemoState({
        key: 'mana',
        side: selectedInstructionManaDemo.side,
        selectedManaId: selectedInstructionManaDemo.id,
        entities: currentEntities,
        transitionEntityIds: [],
        transitionFromByEntityId: {},
        animationNonce: 0,
        angelProtectionZones: [],
        abilityTargetIndicators: [],
        abilityRangeHintTiles: [],
        demonReboundDots: [],
        spiritPushDots: [],
        manaMoveDots: [],
        movementResourceCount: currentMovementResourceCount,
        activeAbilityResourceAvailable: currentActiveAbilityResourceAvailable,
        manaMoveResourceAvailable: currentManaMoveResourceAvailable,
        faintedMonIds: [],
      });
      const playNextManaStep = () => {
        if (instructionAbilityDemoRunIdRef.current !== runId) {
          return;
        }
        const step = steps[stepIndex];
        currentEntities = step.update(cloneBoardEntities(currentEntities));
        applyInstructionManaDemoResourceStep(step);
        setInstructionAbilityDemoState({
          key: 'mana',
          side: selectedInstructionManaDemo.side,
          selectedManaId: selectedInstructionManaDemo.id,
          entities: currentEntities,
          transitionEntityIds: [],
          transitionFromByEntityId: {},
          animationNonce: stepIndex + 1,
          angelProtectionZones: [],
          abilityTargetIndicators: [],
          abilityRangeHintTiles: [],
          demonReboundDots: [],
          spiritPushDots: [],
          manaMoveDots: step.manaMoveDots ?? [],
          movementResourceCount: currentMovementResourceCount,
          activeAbilityResourceAvailable: currentActiveAbilityResourceAvailable,
          manaMoveResourceAvailable: currentManaMoveResourceAvailable,
          faintedMonIds: [],
        });
        playInstructionDemoStepSound(step);
        stepIndex = (stepIndex + 1) % steps.length;
        instructionAbilityDemoTimeoutRef.current = window.setTimeout(
          playNextManaStep,
          INSTRUCTION_ABILITY_DEMO_TICK_MS,
        );
      };
      instructionAbilityDemoTimeoutRef.current = window.setTimeout(
        playNextManaStep,
        INSTRUCTION_ABILITY_DEMO_TICK_MS,
      );
      return () => {
        if (instructionAbilityDemoTimeoutRef.current !== null) {
          window.clearTimeout(instructionAbilityDemoTimeoutRef.current);
          instructionAbilityDemoTimeoutRef.current = null;
        }
        setInstructionAbilityDemoTransitionProgress(1);
        instructionAbilityDemoRunIdRef.current += 1;
      };
    }

    if (selectedInstructionSuperManaDemo !== null) {
      const baseEntities = cloneBoardEntities(initialBoardEntities);
      const whiteSpiritId = defaultInstructionDemoEntityIds.white.spirit;
      const blackSpiritId = defaultInstructionDemoEntityIds.black.spirit;
      const superManaId = selectedInstructionSuperManaDemo.id;
      const h4 = boardTile('H', 4);
      const e7 = boardTile('E', 7);
      const f6 = boardTile('F', 6);
      const g5 = boardTile('G', 5);
      const getPreparedSuperManaEntities = () =>
        updateBoardEntities(cloneBoardEntities(baseEntities), {
          [whiteSpiritId]: h4,
          [blackSpiritId]: e7,
          [superManaId]: f6,
        });
      const getSuperManaSpiritPushDots = (
        entities: BoardEntity[],
      ): Array<{col: number; row: number}> => {
        const visibleEntities = entities.filter(
          (entity) => entity.carriedByDrainerId === undefined && !entity.isScored,
        );
        const superMana = visibleEntities.find((entity) => entity.id === superManaId);
        if (superMana === undefined || superMana.kind !== 'superMana') {
          return [];
        }
        const dots: Array<{col: number; row: number}> = [];
        for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
          for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
            if (rowOffset === 0 && colOffset === 0) {
              continue;
            }
            const optionCol = superMana.col + colOffset;
            const optionRow = superMana.row + rowOffset;
            if (
              optionCol < 0 ||
              optionCol >= BOARD_SIZE ||
              optionRow < 0 ||
              optionRow >= BOARD_SIZE ||
              !canEntityMoveToTile(superMana, optionCol, optionRow)
            ) {
              continue;
            }
            const isOccupied = visibleEntities.some(
              (entity) =>
                entity.id !== superMana.id &&
                entity.col === optionCol &&
                entity.row === optionRow,
            );
            if (!isOccupied) {
              dots.push({col: optionCol, row: optionRow});
            }
          }
        }
        return dots;
      };
      const getSuperManaTargetIndicator = (
        entities: BoardEntity[],
      ): AbilityTargetIndicator[] => {
        const superMana = entities.find((entity) => entity.id === superManaId);
        if (superMana === undefined) {
          return [];
        }
        return [
          {
            id: `instruction-super-mana-target-${superManaId}`,
            col: superMana.col,
            row: superMana.row,
            color: SPIRIT_ABILITY_INDICATOR_COLOR,
          },
        ];
      };
      const resetSuperManaStep: InstructionAbilityDemoStep = {
        update: () => getPreparedSuperManaEntities(),
        restoreTurnResources: true,
      };
      const steps: InstructionAbilityDemoStep[] = [
        {
          update: (entities) => entities,
          abilityTargetIndicators: getSuperManaTargetIndicator(
            getPreparedSuperManaEntities(),
          ),
          spiritPushDots: getSuperManaSpiritPushDots(getPreparedSuperManaEntities()),
        },
        {
          update: (entities) => updateBoardEntity(entities, superManaId, g5),
          soundEffects: ['spiritAbility'],
        },
        {
          update: (entities) => entities,
          abilityTargetIndicators: getSuperManaTargetIndicator(
            updateBoardEntity(getPreparedSuperManaEntities(), superManaId, g5),
          ),
          spiritPushDots: getSuperManaSpiritPushDots(
            updateBoardEntity(getPreparedSuperManaEntities(), superManaId, g5),
          ),
        },
        {
          update: (entities) => updateBoardEntity(entities, superManaId, f6),
          soundEffects: ['spiritAbility'],
        },
        resetSuperManaStep,
      ];
      let currentEntities = getPreparedSuperManaEntities();
      let currentMovementResourceCount = PLAYER_MOVEMENT_POINT_COUNT;
      let currentActiveAbilityResourceAvailable = true;
      let currentManaMoveResourceAvailable = true;
      let stepIndex = 0;
      const applyInstructionSuperManaDemoResourceStep = (step: InstructionAbilityDemoStep) => {
        if (step.restoreTurnResources) {
          currentMovementResourceCount = PLAYER_MOVEMENT_POINT_COUNT;
          currentActiveAbilityResourceAvailable = true;
          currentManaMoveResourceAvailable = true;
        }
        if (step.consumeActiveAbilityResource) {
          currentActiveAbilityResourceAvailable = false;
        }
      };
      setInstructionAbilityDemoState({
        key: 'superMana',
        side: 'white',
        selectedManaId: superManaId,
        entities: currentEntities,
        transitionEntityIds: [],
        transitionFromByEntityId: {},
        animationNonce: 0,
        angelProtectionZones: [],
        abilityTargetIndicators: [],
        abilityRangeHintTiles: [],
        demonReboundDots: [],
        spiritPushDots: [],
        manaMoveDots: [],
        movementResourceCount: currentMovementResourceCount,
        activeAbilityResourceAvailable: currentActiveAbilityResourceAvailable,
        manaMoveResourceAvailable: currentManaMoveResourceAvailable,
        faintedMonIds: [],
      });
      const playNextSuperManaStep = () => {
        if (instructionAbilityDemoRunIdRef.current !== runId) {
          return;
        }
        const step = steps[stepIndex];
        currentEntities = step.update(cloneBoardEntities(currentEntities));
        applyInstructionSuperManaDemoResourceStep(step);
        setInstructionAbilityDemoState({
          key: 'superMana',
          side: 'white',
          selectedManaId: superManaId,
          entities: currentEntities,
          transitionEntityIds: [],
          transitionFromByEntityId: {},
          animationNonce: stepIndex + 1,
          angelProtectionZones: [],
          abilityTargetIndicators: step.abilityTargetIndicators ?? [],
          abilityRangeHintTiles: [],
          demonReboundDots: [],
          spiritPushDots: step.spiritPushDots ?? [],
          manaMoveDots: [],
          movementResourceCount: currentMovementResourceCount,
          activeAbilityResourceAvailable: currentActiveAbilityResourceAvailable,
          manaMoveResourceAvailable: currentManaMoveResourceAvailable,
          faintedMonIds: [],
        });
        playInstructionDemoStepSound(step);
        stepIndex = (stepIndex + 1) % steps.length;
        instructionAbilityDemoTimeoutRef.current = window.setTimeout(
          playNextSuperManaStep,
          INSTRUCTION_ABILITY_DEMO_TICK_MS,
        );
      };
      instructionAbilityDemoTimeoutRef.current = window.setTimeout(
        playNextSuperManaStep,
        INSTRUCTION_ABILITY_DEMO_TICK_MS,
      );
      return () => {
        if (instructionAbilityDemoTimeoutRef.current !== null) {
          window.clearTimeout(instructionAbilityDemoTimeoutRef.current);
          instructionAbilityDemoTimeoutRef.current = null;
        }
        setInstructionAbilityDemoTransitionProgress(1);
        instructionAbilityDemoRunIdRef.current += 1;
      };
    }

    if (selectedInstructionItemDemo !== null) {
      const baseEntities = cloneBoardEntities(initialBoardEntities);
      const whiteDemonId = defaultInstructionDemoEntityIds.white.demon;
      const whiteSpiritId = defaultInstructionDemoEntityIds.white.spirit;
      const whiteDrainerId = defaultInstructionDemoEntityIds.white.drainer;
      const blackAngelId = defaultInstructionDemoEntityIds.black.angel;
      const blackDrainerId = defaultInstructionDemoEntityIds.black.drainer;
      const superManaId = 'super-mana-default-0';
      const a6 = boardTile('A', 6);
      const b7 = boardTile('B', 7);
      const c10 = boardTile('C', 10);
      const d10 = boardTile('D', 10);
      const f1 = boardTile('F', 1);
      const f6 = boardTile('F', 6);
      const h7 = boardTile('H', 7);
      const i9 = boardTile('I', 9);
      const j7 = boardTile('J', 7);
      const j8 = boardTile('J', 8);
      const j10 = boardTile('J', 10);
      const k6 = boardTile('K', 6);
      const k11 = boardTile('K', 11);
      const h7ManaId =
        baseEntities.find(
          (entity) =>
            entity.kind === 'blackMana' &&
            entity.col === h7.col &&
            entity.row === h7.row,
        )?.id ?? defaultInstructionDemoEntityIds.mana.black.d5;
      const h7ManaHref =
        baseEntities.find((entity) => entity.id === h7ManaId)?.href ?? boardAssets.manaB;
      const a6ItemId = baseEntities.find(
        (entity) =>
          entity.kind === 'item' &&
          entity.col === a6.col &&
          entity.row === a6.row,
      )?.id;
      const k6ItemId = baseEntities.find(
        (entity) =>
          entity.kind === 'item' &&
          entity.col === k6.col &&
          entity.row === k6.row,
      )?.id;
      const getPreparedPotionEntities = () =>
        updateBoardEntities(cloneBoardEntities(baseEntities), {
          [whiteDrainerId]: f1,
          [whiteSpiritId]: k6,
          [blackDrainerId]: i9,
          ...(k6ItemId !== undefined ? {[k6ItemId]: {isScored: true}} : {}),
          [h7ManaId]: {
            ...i9,
            carriedByDrainerId: blackDrainerId,
            isScored: false,
          },
        });
      const getPreparedBombEntities = () =>
        updateBoardEntities(cloneBoardEntities(baseEntities), {
          [whiteDemonId]: {
            ...a6,
            heldItemKind: 'bomb',
          },
          [blackAngelId]: d10,
          [blackDrainerId]: c10,
          ...(a6ItemId !== undefined ? {[a6ItemId]: {isScored: true}} : {}),
          [superManaId]: {
            ...c10,
            carriedByDrainerId: blackDrainerId,
            isScored: false,
          },
        });
      const getItemDemoSpiritPushOptions = (
        entities: BoardEntity[],
        targetId: string,
      ): Array<{col: number; row: number}> => {
        const visibleEntities = entities.filter(
          (entity) => entity.carriedByDrainerId === undefined && !entity.isScored,
        );
        const target = visibleEntities.find((entity) => entity.id === targetId);
        if (target === undefined) {
          return [];
        }
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
              optionRow >= BOARD_SIZE ||
              !canEntityMoveToTile(target, optionCol, optionRow)
            ) {
              continue;
            }
            const isOccupied = visibleEntities.some(
              (entity) =>
                entity.id !== target.id &&
                entity.col === optionCol &&
                entity.row === optionRow,
            );
            if (!isOccupied) {
              options.push({col: optionCol, row: optionRow});
            }
          }
        }
        return options;
      };
      const createItemResetStep = (): InstructionAbilityDemoStep => ({
        update: () =>
          selectedInstructionItemDemo === 'potion'
            ? getPreparedPotionEntities()
            : getPreparedBombEntities(),
        restoreTurnResources: true,
      });
      const itemSteps: InstructionAbilityDemoStep[] =
        selectedInstructionItemDemo === 'potion'
          ? [
              {
                update: (entities) => updateBoardEntity(entities, whiteSpiritId, j7),
                movementResourceCost: 1,
              },
              {
                update: (entities) => entities,
                abilityTargetIndicators: [
                  {
                    id: `instruction-potion-target-${blackDrainerId}-first`,
                    ...i9,
                    color: SPIRIT_ABILITY_INDICATOR_COLOR,
                  },
                ],
                spiritPushDots: getItemDemoSpiritPushOptions(
                  updateBoardEntity(getPreparedPotionEntities(), whiteSpiritId, j7),
                  blackDrainerId,
                ),
              },
              {
                update: (entities) =>
                  updateBoardEntities(entities, {
                    [blackDrainerId]: j10,
                    [h7ManaId]: {
                      ...j10,
                      carriedByDrainerId: blackDrainerId,
                      isScored: false,
                    },
                  }),
                consumeActiveAbilityResource: true,
              },
              {
                update: (entities) => updateBoardEntity(entities, whiteSpiritId, j8),
                movementResourceCost: 1,
              },
              {
                update: (entities) => entities,
                abilityTargetIndicators: [
                  {
                    id: `instruction-potion-target-${blackDrainerId}-second`,
                    ...j10,
                    color: SPIRIT_ABILITY_INDICATOR_COLOR,
                  },
                ],
                spiritPushDots: getItemDemoSpiritPushOptions(
                  updateBoardEntities(getPreparedPotionEntities(), {
                    [whiteSpiritId]: j8,
                    [blackDrainerId]: j10,
                    [h7ManaId]: {
                      ...j10,
                      carriedByDrainerId: blackDrainerId,
                      isScored: false,
                    },
                  }),
                  blackDrainerId,
                ),
              },
              {
                update: (entities) =>
                  updateBoardEntities(entities, {
                    [blackDrainerId]: k11,
                    [h7ManaId]: {
                      ...k11,
                      carriedByDrainerId: undefined,
                      isScored: true,
                    },
                  }),
                consumePotionResource: true,
                potionBubbleEffect: j8,
                scoredMana: {
                  id: h7ManaId,
                  href: h7ManaHref,
                  ...k11,
                },
              },
              {
                update: (entities) => entities,
              },
              createItemResetStep(),
            ]
          : [
              {
                update: (entities) =>
                  updateBoardEntity(entities, whiteDemonId, {
                    ...b7,
                    heldItemKind: 'bomb',
                  }),
                abilityTargetIndicators: [
                  {
                    id: `instruction-bomb-target-${blackDrainerId}`,
                    ...c10,
                    color: DEFAULT_ATTACK_INDICATOR_COLOR,
                  },
                  {
                    id: `instruction-bomb-target-${blackAngelId}`,
                    ...d10,
                    color: DEFAULT_ATTACK_INDICATOR_COLOR,
                  },
                ],
              },
              {
                update: (entities) =>
                  updateBoardEntities(entities, {
                    [whiteDemonId]: {
                      ...b7,
                      heldItemKind: undefined,
                    },
                    [blackDrainerId]: getMonSpawnTile('black', 'drainer') ?? c10,
                    [superManaId]: {
                      ...f6,
                      carriedByDrainerId: undefined,
                      isScored: false,
                    },
                  }),
                faintedMonIds: [blackDrainerId],
                attackEffect: {
                  kind: 'bomb',
                  ...c10,
                },
              },
              {
                update: (entities) => entities,
                faintedMonIds: [blackDrainerId],
              },
              createItemResetStep(),
            ];
      let currentEntities =
        selectedInstructionItemDemo === 'potion'
          ? getPreparedPotionEntities()
          : getPreparedBombEntities();
      let currentMovementResourceCount = PLAYER_MOVEMENT_POINT_COUNT;
      let currentActiveAbilityResourceAvailable = true;
      let currentManaMoveResourceAvailable = true;
      let currentPotionResourceAvailable = selectedInstructionItemDemo === 'potion';
      let stepIndex = 0;
      const applyInstructionItemDemoResourceStep = (step: InstructionAbilityDemoStep) => {
        if (step.restoreTurnResources) {
          currentMovementResourceCount = PLAYER_MOVEMENT_POINT_COUNT;
          currentActiveAbilityResourceAvailable = true;
          currentManaMoveResourceAvailable = true;
          currentPotionResourceAvailable = selectedInstructionItemDemo === 'potion';
        }
        if (step.movementResourceCost !== undefined) {
          currentMovementResourceCount = Math.max(
            0,
            currentMovementResourceCount - step.movementResourceCost,
          );
        }
        if (step.consumeActiveAbilityResource) {
          currentActiveAbilityResourceAvailable = false;
        }
        if (step.consumePotionResource) {
          triggerPotionResourceIconExit('instruction');
          currentPotionResourceAvailable = false;
        }
      };
      setInstructionAbilityDemoState({
        key: selectedInstructionItemDemo,
        side: 'white',
        entities: currentEntities,
        transitionEntityIds: [],
        transitionFromByEntityId: {},
        animationNonce: 0,
        angelProtectionZones: [],
        abilityTargetIndicators: [],
        abilityRangeHintTiles: [],
        demonReboundDots: [],
        spiritPushDots: [],
        manaMoveDots: [],
        movementResourceCount: currentMovementResourceCount,
        activeAbilityResourceAvailable: currentActiveAbilityResourceAvailable,
        manaMoveResourceAvailable: currentManaMoveResourceAvailable,
        potionResourceAvailable: currentPotionResourceAvailable,
        faintedMonIds: [],
      });
      const playNextItemStep = () => {
        if (instructionAbilityDemoRunIdRef.current !== runId) {
          return;
        }
        const step = itemSteps[stepIndex];
        currentEntities = step.update(cloneBoardEntities(currentEntities));
        applyInstructionItemDemoResourceStep(step);
        setInstructionAbilityDemoState({
          key: selectedInstructionItemDemo,
          side: 'white',
          entities: currentEntities,
          transitionEntityIds: [],
          transitionFromByEntityId: {},
          animationNonce: stepIndex + 1,
          angelProtectionZones: [],
          abilityTargetIndicators: step.abilityTargetIndicators ?? [],
          abilityRangeHintTiles: [],
          demonReboundDots: [],
          spiritPushDots: step.spiritPushDots ?? [],
          manaMoveDots: [],
          movementResourceCount: currentMovementResourceCount,
          activeAbilityResourceAvailable: currentActiveAbilityResourceAvailable,
          manaMoveResourceAvailable: currentManaMoveResourceAvailable,
          potionResourceAvailable: currentPotionResourceAvailable,
          faintedMonIds: step.faintedMonIds ?? [],
        });
        playInstructionDemoStepSound(step);
        if (step.attackEffect !== undefined) {
          triggerAttackEffect(
            step.attackEffect.kind,
            step.attackEffect.col,
            step.attackEffect.row,
          );
        }
        if (step.scoredMana !== undefined) {
          triggerManaScoreEffects(step.scoredMana);
        }
        if (step.potionBubbleEffect !== undefined) {
          triggerPotionBubbleEffect(
            step.potionBubbleEffect.col,
            step.potionBubbleEffect.row,
          );
        }
        stepIndex = (stepIndex + 1) % itemSteps.length;
        instructionAbilityDemoTimeoutRef.current = window.setTimeout(
          playNextItemStep,
          INSTRUCTION_ABILITY_DEMO_TICK_MS,
        );
      };
      instructionAbilityDemoTimeoutRef.current = window.setTimeout(
        playNextItemStep,
        INSTRUCTION_ABILITY_DEMO_TICK_MS,
      );
      return () => {
        if (instructionAbilityDemoTimeoutRef.current !== null) {
          window.clearTimeout(instructionAbilityDemoTimeoutRef.current);
          instructionAbilityDemoTimeoutRef.current = null;
        }
        setInstructionAbilityDemoTransitionProgress(1);
        instructionAbilityDemoRunIdRef.current += 1;
      };
    }

    const actorSide = selectedInstructionAbilityDemoSide;
    const opponentSide: InstructionAbilityDemoSide = actorSide === 'white' ? 'black' : 'white';
    const actorIds = defaultInstructionDemoEntityIds[actorSide];
    const opponentIds = defaultInstructionDemoEntityIds[opponentSide];
    const manaIds = defaultInstructionDemoEntityIds.mana[actorSide];
    const mirrorInstructionTile = (tile: {col: number; row: number}) =>
      actorSide === 'white'
        ? tile
        : {col: BOARD_SIZE - 1 - tile.col, row: BOARD_SIZE - 1 - tile.row};
    const a4 = mirrorInstructionTile(boardTile('A', 4));
    const c2 = mirrorInstructionTile(boardTile('C', 2));
    const c3 = mirrorInstructionTile(boardTile('C', 3));
    const c4 = mirrorInstructionTile(boardTile('C', 4));
    const d2 = mirrorInstructionTile(boardTile('D', 2));
    const d3 = mirrorInstructionTile(boardTile('D', 3));
    const d4 = mirrorInstructionTile(boardTile('D', 4));
    const d5 = mirrorInstructionTile(boardTile('D', 5));
    const b3 = mirrorInstructionTile(boardTile('B', 3));
    const e2 = mirrorInstructionTile(boardTile('E', 2));
    const e4 = mirrorInstructionTile(boardTile('E', 4));
    const f2 = mirrorInstructionTile(boardTile('F', 2));
    const f3 = mirrorInstructionTile(boardTile('F', 3));
    const g2 = mirrorInstructionTile(boardTile('G', 2));
    const g4 = mirrorInstructionTile(boardTile('G', 4));
    const h2 = mirrorInstructionTile(boardTile('H', 2));
    const h3 = mirrorInstructionTile(boardTile('H', 3));
    const i4 = mirrorInstructionTile(boardTile('I', 4));
    const i3 = mirrorInstructionTile(boardTile('I', 3));
    const j2 = mirrorInstructionTile(boardTile('J', 2));
    const j4 = mirrorInstructionTile(boardTile('J', 4));
    const j5 = mirrorInstructionTile(boardTile('J', 5));
    const k1 = mirrorInstructionTile(boardTile('K', 1));
    const actorAngelSpawn = getMonSpawnTile(actorSide, 'angel') ?? e2;
    const opponentDemonSpawn = getMonSpawnTile(opponentSide, 'demon') ?? d4;
    const opponentDrainerSpawn = getMonSpawnTile(opponentSide, 'drainer') ?? c4;
    const opponentMysticSpawn = getMonSpawnTile(opponentSide, 'mystic') ?? j4;
    const demonReboundTile = d5;
    const baseEntities = cloneBoardEntities(initialBoardEntities);
    const g4ManaHref =
      baseEntities.find((entity) => entity.id === manaIds.g4)?.href ??
      (actorSide === 'white' ? boardAssets.mana : boardAssets.manaB);
    const initialAngelProtectionZones =
      selectedInstructionAbilityDemoKey === 'angel'
        ? [
            getAngelProtectionZoneForTile(
              `instruction-angel-${actorIds.angel}`,
              actorAngelSpawn.col,
              actorAngelSpawn.row,
            ),
          ]
        : [];
    const getPreparedBaseEntities = () => {
      if (selectedInstructionAbilityDemoKey === 'demon') {
        return updateBoardEntities(cloneBoardEntities(baseEntities), {
          [opponentIds.demon]: d4,
          [opponentIds.drainer]: c4,
          [manaIds.d5]: {
            ...c4,
            carriedByDrainerId: opponentIds.drainer,
            isScored: false,
          },
          [manaIds.e4]: {
            ...c3,
            carriedByDrainerId: undefined,
            isScored: false,
          },
        });
      }
      if (selectedInstructionAbilityDemoKey === 'angel') {
        return updateBoardEntities(cloneBoardEntities(baseEntities), {
          [opponentIds.mystic]: b3,
          [opponentIds.demon]: f3,
        });
      }
      if (selectedInstructionAbilityDemoKey === 'mystic') {
        return updateBoardEntities(cloneBoardEntities(baseEntities), {
          [opponentIds.mystic]: j4,
          [opponentIds.drainer]: j5,
          [manaIds.h5]: {
            ...j5,
            carriedByDrainerId: opponentIds.drainer,
            isScored: false,
          },
          [manaIds.g4]: {
            ...i4,
            carriedByDrainerId: undefined,
            isScored: false,
          },
        });
      }
      return cloneBoardEntities(baseEntities);
    };
    const createResetStep = (
      transitionEntityIds: string[] = [],
    ): InstructionAbilityDemoStep => ({
      update: () => getPreparedBaseEntities(),
      angelProtectionZones: initialAngelProtectionZones,
      restoreTurnResources: true,
      ...(transitionEntityIds.length > 0 ? {slideTransitionEntityIds: transitionEntityIds} : {}),
    });
    const resetStep = createResetStep();
    const createInstructionAbilityRangeHintTiles = (
      entities: BoardEntity[],
      sourceTile: {col: number; row: number},
      monType: 'demon' | 'spirit' | 'mystic',
    ): AbilityRangeHintTile[] => {
      const occupiedTileKeySet = new Set(
        entities
          .filter((entity) => !entity.isScored && entity.carriedByDrainerId === undefined)
          .map((entity) => toTileKey(entity.col, entity.row)),
      );
      const dedupeTileKeySet = new Set<string>();
      const hints: AbilityRangeHintTile[] = [];
      const maybeAddHint = (col: number, row: number, color: string) => {
        if (col < 0 || col >= BOARD_SIZE || row < 0 || row >= BOARD_SIZE) {
          return;
        }
        const tileKey = toTileKey(col, row);
        if (occupiedTileKeySet.has(tileKey) || dedupeTileKeySet.has(tileKey)) {
          return;
        }
        dedupeTileKeySet.add(tileKey);
        hints.push({col, row, color});
      };
      const isDemoDemonMiddleTileBlocked = (middleTile: {col: number; row: number}) =>
        entities.some(
          (entity) =>
            !entity.isScored &&
            entity.carriedByDrainerId === undefined &&
            entity.kind !== 'item' &&
            entity.col === middleTile.col &&
            entity.row === middleTile.row,
        );

      if (monType === 'demon') {
        const orthogonalSteps: Array<[number, number]> = [
          [2, 0],
          [-2, 0],
          [0, 2],
          [0, -2],
        ];
        orthogonalSteps.forEach(([dCol, dRow]) => {
          const targetCol = sourceTile.col + dCol;
          const targetRow = sourceTile.row + dRow;
          const middleTile = getTwoStepOrthogonalMiddleTile(
            sourceTile.col,
            sourceTile.row,
            targetCol,
            targetRow,
          );
          if (middleTile === null) {
            return;
          }
          if (isCenterSuperManaTile(middleTile.col, middleTile.row)) {
            return;
          }
          if (isDemoDemonMiddleTileBlocked(middleTile)) {
            return;
          }
          maybeAddHint(targetCol, targetRow, DEFAULT_ATTACK_INDICATOR_COLOR);
        });
        return hints;
      }

      if (monType === 'mystic') {
        const diagonalSteps: Array<[number, number]> = [
          [2, 2],
          [-2, 2],
          [2, -2],
          [-2, -2],
        ];
        diagonalSteps.forEach(([dCol, dRow]) => {
          maybeAddHint(
            sourceTile.col + dCol,
            sourceTile.row + dRow,
            DEFAULT_ATTACK_INDICATOR_COLOR,
          );
        });
        return hints;
      }

      for (let row = 0; row < BOARD_SIZE; row += 1) {
        for (let col = 0; col < BOARD_SIZE; col += 1) {
          if (
            Math.max(Math.abs(col - sourceTile.col), Math.abs(row - sourceTile.row)) === 2 &&
            (col !== sourceTile.col || row !== sourceTile.row)
          ) {
            maybeAddHint(col, row, SPIRIT_ABILITY_INDICATOR_COLOR);
          }
        }
      }
      return hints;
    };
    const getInstructionAbilityDemoRangeHintTiles = (
      entities: BoardEntity[],
    ): AbilityRangeHintTile[] => {
      if (
        selectedInstructionAbilityDemoKey !== 'demon' &&
        selectedInstructionAbilityDemoKey !== 'spirit' &&
        selectedInstructionAbilityDemoKey !== 'mystic'
      ) {
        return [];
      }
      const sourceId = actorIds[selectedInstructionAbilityDemoKey];
      const sourceEntity = entities.find((entity) => entity.id === sourceId);
      if (
        sourceEntity === undefined ||
        sourceEntity.kind !== 'mon' ||
        sourceEntity.side !== actorSide ||
        sourceEntity.monType !== selectedInstructionAbilityDemoKey
      ) {
        return [];
      }
      const sourceSpawnTile = getMonSpawnTile(sourceEntity.side, sourceEntity.monType);
      if (
        sourceSpawnTile === null ||
        (sourceEntity.col === sourceSpawnTile.col && sourceEntity.row === sourceSpawnTile.row)
      ) {
        return [];
      }
      return createInstructionAbilityRangeHintTiles(
        entities,
        {col: sourceEntity.col, row: sourceEntity.row},
        selectedInstructionAbilityDemoKey,
      );
    };
    const getInstructionVisibleBoardEntities = (entities: BoardEntity[]) =>
      entities.filter((entity) => entity.carriedByDrainerId === undefined && !entity.isScored);
    const getInstructionSpiritPushDestinationOptions = (
      entities: BoardEntity[],
      targetId: string,
    ): Array<{col: number; row: number}> => {
      const visibleEntities = getInstructionVisibleBoardEntities(entities);
      const target = visibleEntities.find((entity) => entity.id === targetId);
      if (target === undefined) {
        return [];
      }
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
          const destinationOccupants = visibleEntities.filter(
            (entity) =>
              entity.id !== target.id &&
              entity.col === optionCol &&
              entity.row === optionRow,
          );
          if (destinationOccupants.length === 0) {
            if (canEntityMoveToTile(target, optionCol, optionRow)) {
              options.push({col: optionCol, row: optionRow});
            }
            continue;
          }
          if (destinationOccupants.length > 1) {
            continue;
          }
          const destinationOccupant = destinationOccupants[0];
          const canPushManaIntoDrainerHands =
            isManaEntityKind(target.kind) &&
            canDrainerReceiveMana(entities, destinationOccupant);
          if (canPushManaIntoDrainerHands) {
            options.push({col: optionCol, row: optionRow});
            continue;
          }
          const canPushDrainerOntoMana =
            target.kind === 'mon' &&
            target.side !== undefined &&
            target.monType === 'drainer' &&
            target.heldItemKind !== 'bomb' &&
            isManaEntityKind(destinationOccupant.kind) &&
            canEntityMoveToTile(target, optionCol, optionRow);
          if (canPushDrainerOntoMana) {
            options.push({col: optionCol, row: optionRow});
          }
        }
      }
      return options;
    };
    const getInstructionSpiritAbilityTargetIndicators = (
      entities: BoardEntity[],
    ): AbilityTargetIndicator[] => {
      if (selectedInstructionAbilityDemoKey !== 'spirit') {
        return [];
      }
      const visibleEntities = getInstructionVisibleBoardEntities(entities);
      const spirit = visibleEntities.find((entity) => entity.id === actorIds.spirit);
      if (
        spirit === undefined ||
        spirit.kind !== 'mon' ||
        spirit.side !== actorSide ||
        spirit.monType !== 'spirit'
      ) {
        return [];
      }
      const spiritSpawnTile = getMonSpawnTile(spirit.side, spirit.monType);
      if (
        spiritSpawnTile === null ||
        (spirit.col === spiritSpawnTile.col && spirit.row === spiritSpawnTile.row)
      ) {
        return [];
      }
      return visibleEntities
        .filter((entity) => entity.id !== spirit.id)
        .filter(
          (entity) =>
            Math.max(Math.abs(entity.col - spirit.col), Math.abs(entity.row - spirit.row)) ===
              2 && (entity.col !== spirit.col || entity.row !== spirit.row),
        )
        .filter(
          (entity) => getInstructionSpiritPushDestinationOptions(entities, entity.id).length > 0,
        )
        .map((entity) => ({
          id: `instruction-spirit-target-${entity.id}`,
          col: entity.col,
          row: entity.row,
          color: SPIRIT_ABILITY_INDICATOR_COLOR,
        }));
    };
    const dedupeAbilityTargetIndicators = (
      indicators: AbilityTargetIndicator[],
    ): AbilityTargetIndicator[] => {
      const seenIndicatorIds = new Set<string>();
      return indicators.filter((indicator) => {
        if (seenIndicatorIds.has(indicator.id)) {
          return false;
        }
        seenIndicatorIds.add(indicator.id);
        return true;
      });
    };
    const getInstructionMysticAbilityTargetIndicators = (
      entities: BoardEntity[],
    ): AbilityTargetIndicator[] => {
      if (selectedInstructionAbilityDemoKey !== 'mystic') {
        return [];
      }
      const actorMystic = entities.find((entity) => entity.id === actorIds.mystic);
      const opponentMystic = entities.find((entity) => entity.id === opponentIds.mystic);
      if (
        actorMystic?.col !== h2.col ||
        actorMystic.row !== h2.row ||
        opponentMystic?.col !== j4.col ||
        opponentMystic.row !== j4.row
      ) {
        return [];
      }
      return [
        {
          id: `instruction-mystic-target-${opponentIds.mystic}`,
          ...j4,
          color: DEFAULT_ATTACK_INDICATOR_COLOR,
        },
      ];
    };
    const getInstructionAbilityDemoTargetIndicators = (
      entities: BoardEntity[],
      stepIndicators: AbilityTargetIndicator[] = [],
    ): AbilityTargetIndicator[] =>
      selectedInstructionAbilityDemoKey === 'spirit'
        ? getInstructionSpiritAbilityTargetIndicators(entities)
        : selectedInstructionAbilityDemoKey === 'mystic'
          ? dedupeAbilityTargetIndicators([
              ...stepIndicators,
              ...getInstructionMysticAbilityTargetIndicators(entities),
            ])
          : stepIndicators;
    const getInstructionDemonReboundOptions = (
      entities: BoardEntity[],
      attackerId: string,
      targetId: string,
    ): Array<{col: number; row: number}> => {
      const attacker = entities.find((entity) => entity.id === attackerId);
      const target = entities.find((entity) => entity.id === targetId);
      if (
        attacker === undefined ||
        target === undefined ||
        attacker.kind !== 'mon' ||
        target.kind !== 'mon' ||
        target.side === undefined ||
        target.monType === undefined
      ) {
        return [];
      }
      const targetSpawnTile = getMonSpawnTile(target.side, target.monType);
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
            optionRow >= BOARD_SIZE ||
            !canEntityMoveToTile(attacker, optionCol, optionRow)
          ) {
            continue;
          }
          if (
            targetSpawnTile !== null &&
            optionCol === targetSpawnTile.col &&
            optionRow === targetSpawnTile.row
          ) {
            continue;
          }
          const isOccupied = entities.some(
            (entity) =>
              entity.id !== attacker.id &&
              entity.id !== target.id &&
              !entity.isScored &&
              entity.carriedByDrainerId === undefined &&
              entity.col === optionCol &&
              entity.row === optionRow,
          );
          if (!isOccupied) {
            options.push({col: optionCol, row: optionRow});
          }
        }
      }
      return options;
    };
    const moveDrainerWithMana = (
      entities: BoardEntity[],
      tile: {col: number; row: number},
      hasMana: boolean,
    ) =>
      updateBoardEntities(entities, {
        [actorIds.drainer]: tile,
        ...(hasMana
          ? {
              [manaIds.g4]: {
                ...tile,
                carriedByDrainerId: actorIds.drainer,
                isScored: false,
              },
            }
          : {}),
      });
    const getSpiritReadyEntities = () =>
      updateBoardEntity(getPreparedBaseEntities(), actorIds.spirit, g2);
    const stepsByKey: Record<InstructionAbilityDemoKey, InstructionAbilityDemoStep[]> = {
      demon: [
        {
          update: (entities) =>
            updateBoardEntity(entities, actorIds.demon, d2),
          transitionEntityIds: [actorIds.demon],
          movementResourceCost: 1,
          abilityTargetIndicators: [
            {
              id: `instruction-demon-target-${opponentIds.demon}`,
              ...d4,
              color: DEFAULT_ATTACK_INDICATOR_COLOR,
            },
          ],
        },
        {
          update: (entities) =>
            updateBoardEntities(entities, {
              [actorIds.demon]: d4,
              [opponentIds.demon]: opponentDemonSpawn,
            }),
          transitionEntityIds: [actorIds.demon],
          consumeActiveAbilityResource: true,
          faintedMonIds: [opponentIds.demon],
          attackEffect: {
            kind: 'demon',
            ...d4,
          },
        },
        {
          update: () => getPreparedBaseEntities(),
          slideTransitionEntityIds: [actorIds.demon],
          restoreTurnResources: true,
          soundEffects: ['undo'],
        },
        {
          update: (entities) =>
            updateBoardEntity(entities, actorIds.demon, c2),
          transitionEntityIds: [actorIds.demon],
          movementResourceCost: 1,
        },
        {
          update: (entities) => entities,
        },
        {
          update: (entities) =>
            updateBoardEntity(entities, actorIds.demon, b3),
          transitionEntityIds: [actorIds.demon],
          movementResourceCost: 1,
        },
        {
          update: (entities) =>
            updateBoardEntity(entities, actorIds.demon, a4),
          transitionEntityIds: [actorIds.demon],
          movementResourceCost: 1,
          abilityTargetIndicators: [
            {
              id: `instruction-demon-target-${opponentIds.drainer}`,
              ...c4,
              color: DEFAULT_ATTACK_INDICATOR_COLOR,
            },
          ],
        },
        {
          update: (entities) => entities,
          demonReboundDots: getInstructionDemonReboundOptions(
            updateBoardEntity(getPreparedBaseEntities(), actorIds.demon, a4),
            actorIds.demon,
            opponentIds.drainer,
          ),
        },
        {
          update: (entities) =>
            updateBoardEntities(entities, {
              [actorIds.demon]: demonReboundTile,
              [opponentIds.drainer]: opponentDrainerSpawn,
              [manaIds.d5]: {
                ...c4,
                carriedByDrainerId: undefined,
                isScored: false,
              },
            }),
          transitionEntityIds: [actorIds.demon],
          consumeActiveAbilityResource: true,
          faintedMonIds: [opponentIds.drainer],
          attackEffect: {
            kind: 'demon',
            ...c4,
          },
        },
        {
          update: (entities) => entities,
          faintedMonIds: [opponentIds.drainer],
        },
        resetStep,
      ],
      angel: [
        {
          update: (entities) => entities,
          angelProtectionZones: initialAngelProtectionZones,
        },
        {
          update: (entities) => entities,
          angelProtectionZones: initialAngelProtectionZones,
        },
        resetStep,
      ],
      drainer: [
        {
          update: (entities) =>
            updateBoardEntity(entities, actorIds.drainer, f2),
          transitionEntityIds: [actorIds.drainer],
          movementResourceCost: 1,
        },
        {
          update: (entities) =>
            updateBoardEntity(entities, actorIds.drainer, f3),
          transitionEntityIds: [actorIds.drainer],
          movementResourceCost: 1,
        },
        {
          update: (entities) => moveDrainerWithMana(entities, g4, true),
          transitionEntityIds: [actorIds.drainer],
          movementResourceCost: 1,
          soundEffects: ['manaPickUp'],
        },
        {
          update: (entities) => moveDrainerWithMana(entities, h3, true),
          transitionEntityIds: [actorIds.drainer],
          movementResourceCost: 1,
        },
        {
          update: (entities) => moveDrainerWithMana(entities, i3, true),
          transitionEntityIds: [actorIds.drainer],
          movementResourceCost: 1,
        },
        {
          update: (entities) => moveDrainerWithMana(entities, j2, true),
          transitionEntityIds: [actorIds.drainer],
          movementResourceCost: 1,
        },
        {
          update: (entities) =>
            updateBoardEntities(entities, {
              [actorIds.drainer]: k1,
              [manaIds.g4]: {
                ...k1,
                carriedByDrainerId: undefined,
                isScored: true,
              },
            }),
          transitionEntityIds: [actorIds.drainer],
          movementResourceCost: 1,
          scoredMana: {
            id: manaIds.g4,
            href: g4ManaHref,
            ...k1,
          },
        },
        {
          update: (entities) => entities,
        },
        resetStep,
      ],
      spirit: [
        {
          update: (entities) =>
            updateBoardEntity(entities, actorIds.spirit, g2),
          transitionEntityIds: [actorIds.spirit],
          movementResourceCost: 1,
        },
        {
          update: (entities) => entities,
          hideAbilityRangeHintTiles: true,
          hideAbilityTargetIndicators: true,
          spiritPushDots: getInstructionSpiritPushDestinationOptions(
            getSpiritReadyEntities(),
            manaIds.g4,
          ),
        },
        {
          update: (entities) =>
            updateBoardEntity(entities, manaIds.g4, h3),
          transitionEntityIds: [manaIds.g4],
          consumeActiveAbilityResource: true,
        },
        {
          update: (entities) =>
            updateBoardEntity(entities, manaIds.g4, g4),
          transitionEntityIds: [manaIds.g4],
          restoreActiveAbilityResource: true,
        },
        {
          update: (entities) => entities,
          hideAbilityRangeHintTiles: true,
          hideAbilityTargetIndicators: true,
          spiritPushDots: getInstructionSpiritPushDestinationOptions(
            getSpiritReadyEntities(),
            manaIds.e4,
          ),
        },
        {
          update: (entities) =>
            updateBoardEntity(entities, manaIds.e4, d3),
          transitionEntityIds: [manaIds.e4],
          consumeActiveAbilityResource: true,
        },
        {
          update: (entities) =>
            updateBoardEntity(entities, manaIds.e4, e4),
          transitionEntityIds: [manaIds.e4],
          restoreActiveAbilityResource: true,
        },
        {
          update: (entities) => entities,
          hideAbilityRangeHintTiles: true,
          hideAbilityTargetIndicators: true,
          spiritPushDots: getInstructionSpiritPushDestinationOptions(
            getSpiritReadyEntities(),
            actorIds.angel,
          ),
        },
        {
          update: (entities) =>
            updateBoardEntity(entities, actorIds.angel, e2),
          transitionEntityIds: [actorIds.angel],
          consumeActiveAbilityResource: true,
        },
        resetStep,
      ],
      mystic: [
        {
          update: (entities) =>
            updateBoardEntity(entities, actorIds.mystic, h2),
          transitionEntityIds: [actorIds.mystic],
          movementResourceCost: 1,
          abilityTargetIndicators: [
            {
              id: `instruction-mystic-target-${opponentIds.mystic}`,
              ...j4,
              color: DEFAULT_ATTACK_INDICATOR_COLOR,
            },
          ],
        },
        {
          update: (entities) =>
            updateBoardEntity(entities, opponentIds.mystic, opponentMysticSpawn),
          consumeActiveAbilityResource: true,
          faintedMonIds: [opponentIds.mystic],
          attackEffect: {
            kind: 'mystic',
            ...j4,
          },
        },
        {
          update: () => getPreparedBaseEntities(),
          slideTransitionEntityIds: [actorIds.mystic],
          restoreTurnResources: true,
          soundEffects: ['undo'],
        },
        {
          update: (entities) =>
            updateBoardEntity(entities, actorIds.mystic, h2),
          transitionEntityIds: [actorIds.mystic],
          movementResourceCost: 1,
        },
        {
          update: (entities) =>
            updateBoardEntity(entities, actorIds.mystic, h3),
          transitionEntityIds: [actorIds.mystic],
          movementResourceCost: 1,
          abilityTargetIndicators: [
            {
              id: `instruction-mystic-target-${opponentIds.drainer}`,
              ...j5,
              color: DEFAULT_ATTACK_INDICATOR_COLOR,
            },
          ],
        },
        {
          update: (entities) =>
            updateBoardEntities(entities, {
              [opponentIds.drainer]: opponentDrainerSpawn,
              [manaIds.h5]: {
                ...j5,
                carriedByDrainerId: undefined,
                isScored: false,
              },
            }),
          consumeActiveAbilityResource: true,
          faintedMonIds: [opponentIds.drainer],
          attackEffect: {
            kind: 'mystic',
            ...j5,
          },
        },
        {
          update: (entities) => entities,
          faintedMonIds: [opponentIds.drainer],
        },
        resetStep,
      ],
    };
    const steps = stepsByKey[selectedInstructionAbilityDemoKey];
    let currentEntities = getPreparedBaseEntities();
    let currentMovementResourceCount = PLAYER_MOVEMENT_POINT_COUNT;
    let currentActiveAbilityResourceAvailable = true;
    let currentManaMoveResourceAvailable = true;
    let stepIndex = 0;
    const applyInstructionDemoResourceStep = (step: InstructionAbilityDemoStep) => {
      if (step.restoreTurnResources) {
        currentMovementResourceCount = PLAYER_MOVEMENT_POINT_COUNT;
        currentActiveAbilityResourceAvailable = true;
        currentManaMoveResourceAvailable = true;
      }
      if (step.restoreActiveAbilityResource) {
        currentActiveAbilityResourceAvailable = true;
      }
      if (step.movementResourceCost !== undefined) {
        currentMovementResourceCount = Math.max(
          0,
          currentMovementResourceCount - step.movementResourceCost,
        );
      }
      if (step.consumeActiveAbilityResource) {
        currentActiveAbilityResourceAvailable = false;
      }
      if (step.consumeManaMoveResource) {
        currentMovementResourceCount = 0;
        currentActiveAbilityResourceAvailable = false;
        currentManaMoveResourceAvailable = false;
      }
    };
    setInstructionAbilityDemoState({
      key: selectedInstructionAbilityDemoKey,
      side: actorSide,
      entities: currentEntities,
      transitionEntityIds: [],
      transitionFromByEntityId: {},
      animationNonce: 0,
      angelProtectionZones: initialAngelProtectionZones,
      abilityTargetIndicators: getInstructionAbilityDemoTargetIndicators(currentEntities),
      abilityRangeHintTiles: getInstructionAbilityDemoRangeHintTiles(currentEntities),
      demonReboundDots: [],
      spiritPushDots: [],
      manaMoveDots: [],
      movementResourceCount: currentMovementResourceCount,
      activeAbilityResourceAvailable: currentActiveAbilityResourceAvailable,
      manaMoveResourceAvailable: currentManaMoveResourceAvailable,
      faintedMonIds: [],
    });

    const playNextStep = () => {
      if (instructionAbilityDemoRunIdRef.current !== runId) {
        return;
      }
      const step = steps[stepIndex];
      const previousEntities = currentEntities;
      currentEntities = step.update(cloneBoardEntities(currentEntities));
      const transitionEntityIds = step.slideTransitionEntityIds ?? [];
      const previousEntityById = new Map(
        previousEntities.map((entity) => [entity.id, entity]),
      );
      const transitionFromByEntityId = Object.fromEntries(
        transitionEntityIds.flatMap((entityId) => {
          const previousEntity = previousEntityById.get(entityId);
          return previousEntity === undefined
            ? []
            : [[entityId, {col: previousEntity.col, row: previousEntity.row}]];
        }),
      );
      if (instructionAbilityDemoTransitionFrameRef.current !== null) {
        window.cancelAnimationFrame(instructionAbilityDemoTransitionFrameRef.current);
        instructionAbilityDemoTransitionFrameRef.current = null;
      }
      setInstructionAbilityDemoTransitionProgress(transitionEntityIds.length > 0 ? 0 : 1);
      applyInstructionDemoResourceStep(step);
      setInstructionAbilityDemoState({
        key: selectedInstructionAbilityDemoKey,
        side: actorSide,
        entities: currentEntities,
        transitionEntityIds,
        transitionFromByEntityId,
        animationNonce: stepIndex + 1,
        angelProtectionZones: step.angelProtectionZones ?? [],
        abilityTargetIndicators: step.hideAbilityTargetIndicators
          ? []
          : getInstructionAbilityDemoTargetIndicators(
              currentEntities,
              step.abilityTargetIndicators ?? [],
            ),
        abilityRangeHintTiles: step.hideAbilityRangeHintTiles
          ? []
          : getInstructionAbilityDemoRangeHintTiles(currentEntities),
        demonReboundDots: step.demonReboundDots ?? [],
        spiritPushDots: step.spiritPushDots ?? [],
        manaMoveDots: step.manaMoveDots ?? [],
        movementResourceCount: currentMovementResourceCount,
        activeAbilityResourceAvailable: currentActiveAbilityResourceAvailable,
        manaMoveResourceAvailable: currentManaMoveResourceAvailable,
        faintedMonIds: step.faintedMonIds ?? [],
      });
      if (transitionEntityIds.length > 0) {
        let startedAtMs: number | null = null;
        const tickTransition = (now: number) => {
          if (instructionAbilityDemoRunIdRef.current !== runId) {
            return;
          }
          if (startedAtMs === null) {
            startedAtMs = now;
          }
          const progress = Math.max(
            0,
            Math.min(1, (now - startedAtMs) / INSTRUCTION_ABILITY_DEMO_MOVE_MS),
          );
          setInstructionAbilityDemoTransitionProgress(progress);
          if (progress < 1) {
            instructionAbilityDemoTransitionFrameRef.current =
              window.requestAnimationFrame(tickTransition);
            return;
          }
          instructionAbilityDemoTransitionFrameRef.current = null;
        };
        instructionAbilityDemoTransitionFrameRef.current =
          window.requestAnimationFrame(tickTransition);
      }
      if (step.attackEffect !== undefined) {
        triggerAttackEffect(
          step.attackEffect.kind,
          step.attackEffect.col,
          step.attackEffect.row,
        );
      }
      if (step.scoredMana !== undefined) {
        triggerManaScoreEffects(step.scoredMana);
      }
      if (step.potionBubbleEffect !== undefined) {
        triggerPotionBubbleEffect(
          step.potionBubbleEffect.col,
          step.potionBubbleEffect.row,
        );
      }
      playInstructionDemoStepSound(step);
      stepIndex = (stepIndex + 1) % steps.length;
      instructionAbilityDemoTimeoutRef.current = window.setTimeout(
        playNextStep,
        INSTRUCTION_ABILITY_DEMO_TICK_MS,
      );
    };

    instructionAbilityDemoTimeoutRef.current = window.setTimeout(
      playNextStep,
      INSTRUCTION_ABILITY_DEMO_TICK_MS,
    );

    return () => {
      if (instructionAbilityDemoTimeoutRef.current !== null) {
        window.clearTimeout(instructionAbilityDemoTimeoutRef.current);
        instructionAbilityDemoTimeoutRef.current = null;
      }
      if (instructionAbilityDemoTransitionFrameRef.current !== null) {
        window.cancelAnimationFrame(instructionAbilityDemoTransitionFrameRef.current);
        instructionAbilityDemoTransitionFrameRef.current = null;
      }
      setInstructionAbilityDemoTransitionProgress(1);
      instructionAbilityDemoRunIdRef.current += 1;
    };
  }, [
    enableInstructionAbilityDemos,
    initialBoardEntities,
    selectedInstructionAbilityDemoKey,
    selectedInstructionAbilityDemoSide,
    selectedInstructionItemDemo,
    selectedInstructionManaDemo,
    selectedInstructionSuperManaDemo,
  ]);

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
          zIndex: 12091,
          pointerEvents: 'auto',
        };
  const itemChoiceBackdropStyle: CSSProperties =
    boardSvgRect === null
      ? {display: 'none'}
      : {
          position: 'fixed',
          inset: 0,
          border: 'none',
          background: 'rgba(255, 255, 255, 0.02)',
          margin: 0,
          padding: 0,
          cursor: 'pointer',
          zIndex: 12090,
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
  const blockItemChoicePointerThrough = () => {
    suppressBoardClickUntilRef.current = performance.now() + 250;
  };
  const itemPickupChoiceOverlay =
    isItemPickupChoiceOpen && boardSvgRect !== null
      ? (
          <>
            <button
              type="button"
              aria-label="Cancel item pickup"
              style={itemChoiceBackdropStyle}
              onPointerDown={(event) => {
                blockItemChoicePointerThrough();
                event.stopPropagation();
              }}
              onClick={(event) => {
                blockItemChoicePointerThrough();
                event.stopPropagation();
                setPendingItemPickupChoice(null);
                setInstructionItemPickupChoiceTile(null);
                setInstructionSelectedItemChoice(null);
                setHoveredItemChoice(null);
              }}
            />
            <div
              style={itemChoiceModalStyle}
              aria-label="Choose item pickup"
              onPointerDown={(event) => {
                blockItemChoicePointerThrough();
                event.stopPropagation();
              }}
              onClick={(event) => {
                blockItemChoicePointerThrough();
                event.stopPropagation();
              }}>
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
                  blockItemChoicePointerThrough();
                  if (instructionItemPickupChoiceTile !== null) {
                    playBoardSoundEffect('pickupBomb');
                    setInstructionSelectedItemChoice({
                      kind: 'bomb',
                      tile: instructionItemPickupChoiceTile,
                    });
                    setSelectedTile(instructionItemPickupChoiceTile);
                    setSelectedMoveResourceId(null);
                    setInstructionItemPickupChoiceTile(null);
                    setHoveredItemChoice(null);
                    return;
                  }
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
                  blockItemChoicePointerThrough();
                  if (instructionItemPickupChoiceTile !== null) {
                    playBoardSoundEffect('pickupPotion');
                    setInstructionSelectedItemChoice({
                      kind: 'potion',
                      tile: instructionItemPickupChoiceTile,
                    });
                    setSelectedTile(instructionItemPickupChoiceTile);
                    setSelectedMoveResourceId(null);
                    setInstructionItemPickupChoiceTile(null);
                    setHoveredItemChoice(null);
                    return;
                  }
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
        )
      : null;
  const moveResourceGapPx = Math.max(3, Math.round(tilePixels * 0.14));
  const moveResourceSize = Math.max(6, Math.round(tilePixels * 0.5));
  const instructionDrainerMovementLimitNoteWidthPx = Math.max(
    moveResourceSize * PLAYER_MOVEMENT_POINT_COUNT +
      moveResourceGapPx * (PLAYER_MOVEMENT_POINT_COUNT - 1),
    Math.round(tilePixels * 7.8),
  );
  const moveResourcesWrapStyle: CSSProperties = {
    marginTop: `${Math.max(4, Math.round(tilePixels * 0.22))}px`,
    width: `${renderWidth}px`,
    minHeight: `${moveResourceSize}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: `${moveResourceGapPx}px`,
    transform: `translate(${moveResourcesOffsetX}px, ${moveResourcesOffsetY}px)`,
  };
  const instructionDrainerMovementLimitNoteStyle: CSSProperties = {
    width: `${instructionDrainerMovementLimitNoteWidthPx}px`,
    color: '#000',
    fontSize: `${Math.max(10, Math.round(tilePixels * 0.32))}px`,
    fontStyle: 'italic',
    fontWeight: 700,
    lineHeight: 1.1,
    opacity: 0.62,
    textAlign: 'right',
    whiteSpace: 'nowrap',
    flex: '0 0 auto',
    pointerEvents: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  };
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
  const hudThreeDButtonReservedWidthPx = Math.round(hudActionButtonSizePx * 1.18);
  const hudThreeDButtonWidthPx = Math.round(hudActionButtonSizePx * 1.34);
  const hudThreeDButtonHeightPx = Math.max(
    8,
    Math.round(hudActionButtonSizePx * 0.9),
  );
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
    ...(isThreeDBoardViewEnabled
      ? {
          position: 'relative',
          zIndex: 30,
        }
      : {}),
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
  const opponentHudStatusRowStyle: CSSProperties = {
    ...hudStatusRowStyle,
    transform: isBoardFullscreen
      ? `translateY(${FULLSCREEN_OPPONENT_RESOURCE_DOWN_NUDGE_PX}px)`
      : undefined,
  };
  const playerHudClusterStyle: CSSProperties = enableFreeTileMove
    ? {
        ...hudPlayerClusterStyle,
        transform: `translateY(${
          -Math.round(12 * puzzleHudOffsetScale) +
          (isSandboxFreeMoveBoard ? 5 : 0) -
          (isPuzzleBoard ? 1.5 : 0)
        }px)`,
      }
    : hudPlayerClusterStyle;
  const playerHudStatusRowStyle: CSSProperties = enableFreeTileMove
    ? {
        ...hudStatusRowStyle,
        minHeight: `${hudStatusIconSize}px`,
        transform: `translateY(${
          Math.round(3 * puzzleHudOffsetScale) -
          (isBoardFullscreen ? FULLSCREEN_PLAYER_RESOURCE_UP_NUDGE_PX : 0)
        }px)`,
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
  const hudPerspectiveInlineButtonStyle: CSSProperties = {
    ...hudResetButtonStyle,
    marginTop: 0,
    color: isBoardPerspectiveFlipped ? '#000000' : '#6f6f6f',
    opacity: isBoardPerspectiveFlipped ? 1 : 0.9,
    flex: '0 0 auto',
    transform: 'translateX(8px)',
    transition: 'color 220ms ease, opacity 220ms ease',
  };
  const hudActionButtonsWrapStyle: CSSProperties = {
    marginTop: '15px',
    width: `${
      hudActionButtonSizePx +
      hudActionButtonGapPx +
      (canUseThreeDBoardView
        ? hudThreeDButtonReservedWidthPx + HUD_3D_BUTTON_GAP_TO_RESET_PX
        : 0)
    }px`,
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
  const getHudResetButtonRightPx = (isFullscreen: boolean): number =>
    isFullscreen
      ? hudFullscreenButtonRightPx +
        hudFullscreenButtonWidthPx +
        HUD_FULLSCREEN_BUTTON_GAP_TO_RESET_PX +
        FULLSCREEN_RESET_BUTTON_LEFT_NUDGE_PX +
        FULLSCREEN_RESET_BUTTON_EXTRA_LEFT_NUDGE_PX +
        (canUseThreeDBoardView
          ? hudThreeDButtonReservedWidthPx + HUD_3D_BUTTON_GAP_TO_RESET_PX
          : 0)
      : 30 +
        hudActionButtonRightInsetPx +
        wideHudActionButtonSpacingPx +
        HUD_NON_FULLSCREEN_ACTION_BUTTON_LEFT_NUDGE_PX +
        (canUseThreeDBoardView
          ? hudThreeDButtonReservedWidthPx + HUD_3D_BUTTON_GAP_TO_RESET_PX
          : 0);
  const getHudResetButtonOffsetStyle = (isFullscreen: boolean): CSSProperties => ({
    right: `${getHudResetButtonRightPx(isFullscreen)}px`,
    position: 'absolute',
    top: 0,
    marginTop: 0,
  });
  const getHudThreeDButtonOffsetStyle = (isFullscreen: boolean): CSSProperties => ({
    right: isFullscreen
      ? `${
          hudFullscreenButtonRightPx +
          hudFullscreenButtonWidthPx +
          HUD_FULLSCREEN_BUTTON_GAP_TO_RESET_PX +
          FULLSCREEN_RESET_BUTTON_LEFT_NUDGE_PX +
          HUD_3D_BUTTON_LEFT_NUDGE_PX
        }px`
      : `${
          30 +
          hudActionButtonRightInsetPx +
          wideHudActionButtonSpacingPx +
          HUD_NON_FULLSCREEN_ACTION_BUTTON_LEFT_NUDGE_PX +
          HUD_3D_BUTTON_LEFT_NUDGE_PX
        }px`,
    position: 'absolute',
    top: `${
      Math.round((hudActionButtonSizePx - hudThreeDButtonHeightPx) / 2) +
      HUD_3D_BUTTON_DOWN_NUDGE_PX
    }px`,
    marginTop: 0,
    width: `${hudThreeDButtonWidthPx}px`,
    height: `${hudThreeDButtonHeightPx}px`,
  });
  const getHudUndoButtonOffsetStyle = (): CSSProperties => {
    const undoButtonRightPx = Math.max(
      0,
      Math.round(renderWidth / 2 - hudHorizontalInsetPx - hudActionButtonSizePx / 2),
    );
    return {
      right: `${undoButtonRightPx}px`,
      position: 'absolute',
      top: 0,
      marginTop: 0,
    };
  };
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
  const hudThreeDIconStyle: CSSProperties = {
    ...hudResetIconStyle,
    width: '112%',
    height: '112%',
  };
  const isMoveResourceActive = (
    resourceId: string,
    resourceKind: HudResourceKey,
  ): boolean => {
    if (selectedMoveResourceKind === 'statusMove' && resourceKind === 'statusMove') {
      return true;
    }
    return activeMoveResourceId === resourceId;
  };
  const consumePlayerActiveAbilityResource = (): boolean => {
    lastActiveAbilityUsedPotionRef.current = false;
    if (!isPuzzleBoard) {
      return true;
    }
    if (hasPlayerUsedDirectManaMove) {
      return false;
    }
    if (playerActiveAbilityStarAvailable) {
      setPlayerActiveAbilityStarAvailable(false);
      return true;
    }
    if (playerPotionCount <= 0) {
      return false;
    }
    playBoardSoundEffect('usePotion');
    lastActiveAbilityUsedPotionRef.current = true;
    triggerPotionResourceIconExit('player');
    setPlayerPotionCount((prev) => {
      if (prev <= 0) {
        return prev;
      }
      const next = prev - 1;
      onPotionCountChange?.({
        side: 'white',
        count: next,
      });
      return next;
    });
    return true;
  };
  const consumePlayerManaMoveResource = (): boolean => {
    if (!isPuzzleBoard) {
      return true;
    }
    if (!playerManaMoveAvailable) {
      return false;
    }
    setPlayerManaMoveAvailable(false);
    return true;
  };
  const updateSandboxSetupManaSpawnTile = (
    mana: BoardEntity,
    targetCol: number,
    targetRow: number,
  ): void => {
    if (
      !isSandboxFreeMoveBoard ||
      hasSandboxMonMovedFromInitial ||
      (mana.kind !== 'whiteMana' && mana.kind !== 'blackMana')
    ) {
      return;
    }
    const originTile = sandboxManaSpawnOriginTileById.get(mana.id);
    if (originTile === undefined) {
      return;
    }
    setSandboxManaSpawnTileById((current) => {
      const isBackOnOrigin =
        originTile.col === targetCol && originTile.row === targetRow;
      const existingTile = current[mana.id];
      if (
        isBackOnOrigin &&
        existingTile === undefined
      ) {
        return current;
      }
      if (
        !isBackOnOrigin &&
        existingTile?.col === targetCol &&
        existingTile.row === targetRow
      ) {
        return current;
      }
      const next = {...current};
      if (isBackOnOrigin) {
        delete next[mana.id];
      } else {
        next[mana.id] = {col: targetCol, row: targetRow};
      }
      return next;
    });
  };
  const updateSandboxSetupItemSpawnTile = (
    item: BoardEntity,
    targetCol: number,
    targetRow: number,
  ): void => {
    if (!isSandboxFreeMoveBoard || hasSandboxMonMovedFromInitial || item.kind !== 'item') {
      return;
    }
    const originTile = sandboxItemSpawnOriginTileById.get(item.id);
    if (originTile === undefined) {
      return;
    }
    setSandboxItemSpawnTileById((current) => {
      const isBackOnOrigin =
        originTile.col === targetCol && originTile.row === targetRow;
      const existingTile = current[item.id];
      if (isBackOnOrigin && existingTile === undefined) {
        return current;
      }
      if (
        !isBackOnOrigin &&
        existingTile?.col === targetCol &&
        existingTile.row === targetRow
      ) {
        return current;
      }
      const next = {...current};
      if (isBackOnOrigin) {
        delete next[item.id];
      } else {
        next[item.id] = {col: targetCol, row: targetRow};
      }
      return next;
    });
  };
  const getWhiteMonMovementCharge = (
    mon: WhiteMonBoardEntity,
    targetCol: number,
    targetRow: number,
    entities: BoardEntity[],
    allowedTargetEntityId?: string,
    enforceDirectMoveLimit = true,
  ): number | null => {
    const distance = getOptimalDirectMonMovementDistance(
      mon,
      targetCol,
      targetRow,
      entities,
      movementStartTileByMonId,
      allowedTargetEntityId,
    );
    if (
      distance === null ||
      (enforceDirectMoveLimit && distance > PLAYER_MOVEMENT_POINT_COUNT)
    ) {
      return null;
    }
    return Math.max(
      0,
      distance - (playerMovementDistanceOffsetsByMonId[mon.id] ?? 0),
    );
  };
  const setWhiteDrainerMovementAnchorAfterManaPickup = (
    mon: BoardEntity,
    anchorCol: number,
    anchorRow: number,
    movementCharge: number | null,
  ): void => {
    if (
      !isPuzzleBoard ||
      !isWhiteMonBoardEntity(mon) ||
      mon.monType !== 'drainer' ||
      movementCharge === null
    ) {
      return;
    }
    const safeMovementCharge = Math.max(0, movementCharge);
    setPlayerMovementStartTileOverridesByMonId((current) => {
      const initialStartTile = initialMovementStartTileByMonId.get(mon.id);
      const isInitialAnchor =
        initialStartTile !== undefined &&
        initialStartTile.col === anchorCol &&
        initialStartTile.row === anchorRow;
      const currentTile = current[mon.id];
      if (
        (isInitialAnchor && currentTile === undefined) ||
        (!isInitialAnchor &&
          currentTile?.col === anchorCol &&
          currentTile.row === anchorRow)
      ) {
        return current;
      }
      const next = {...current};
      if (isInitialAnchor) {
        delete next[mon.id];
      } else {
        next[mon.id] = {col: anchorCol, row: anchorRow};
      }
      return next;
    });
    setPlayerMovementDistanceOffsetsByMonId((current) => {
      const nextOffset = -safeMovementCharge;
      const previousOffset = current[mon.id] ?? 0;
      if (previousOffset === nextOffset) {
        return current;
      }
      const next = {...current};
      if (nextOffset === 0) {
        delete next[mon.id];
      } else {
        next[mon.id] = nextOffset;
      }
      return next;
    });
  };
  const canUseDirectWhiteMonMove = (
    mon: BoardEntity,
    targetCol: number,
    targetRow: number,
    allowedTargetEntityId?: string,
  ): boolean => {
    if (!isPuzzleBoard || !isWhiteMonBoardEntity(mon)) {
      return true;
    }
    if (hasPlayerUsedDirectManaMove) {
      return false;
    }
    const targetCharge = getWhiteMonMovementCharge(
      mon,
      targetCol,
      targetRow,
      boardEntities,
      allowedTargetEntityId,
    );
    if (targetCharge === null) {
      return false;
    }
    const currentCharge =
      getWhiteMonMovementCharge(mon, mon.col, mon.row, boardEntities, undefined, false) ??
      PLAYER_MOVEMENT_POINT_COUNT + 1;
    return (
      playerMovementPointsUsed - currentCharge + targetCharge <=
      PLAYER_MOVEMENT_POINT_COUNT
    );
  };
  const preserveWhiteMonMovementChargeAfterFreeMove = (
    mon: BoardEntity,
    nextCol: number,
    nextRow: number,
    nextEntities: BoardEntity[],
  ): void => {
    if (!isPuzzleBoard || !isWhiteMonBoardEntity(mon)) {
      return;
    }
    const targetDistance =
      getOptimalDirectMonMovementDistance(
        mon,
        nextCol,
        nextRow,
        nextEntities,
        movementStartTileByMonId,
      ) ?? PLAYER_MOVEMENT_POINT_COUNT + 1;
    const currentDistance =
      getOptimalDirectMonMovementDistance(
        mon,
        mon.col,
        mon.row,
        boardEntities,
        movementStartTileByMonId,
      ) ?? PLAYER_MOVEMENT_POINT_COUNT + 1;
    const currentCharge = Math.max(
      0,
      currentDistance - (playerMovementDistanceOffsetsByMonId[mon.id] ?? 0),
    );
    const nextOffset = targetDistance - currentCharge;
    setPlayerMovementDistanceOffsetsByMonId((current) => {
      const previousOffset = current[mon.id] ?? 0;
      if (previousOffset === nextOffset) {
        return current;
      }
      const next = {...current};
      if (nextOffset === 0) {
        delete next[mon.id];
      } else {
        next[mon.id] = nextOffset;
      }
      return next;
    });
  };
  const setWhiteDemonMovementStartAfterAttack = (
    mon: BoardEntity,
    nextCol: number,
    nextRow: number,
  ): void => {
    if (
      !isPuzzleBoard ||
      !isWhiteMonBoardEntity(mon) ||
      mon.monType !== 'demon'
    ) {
      return;
    }
    const currentDistance =
      getOptimalDirectMonMovementDistance(
        mon,
        mon.col,
        mon.row,
        boardEntities,
        movementStartTileByMonId,
      ) ?? PLAYER_MOVEMENT_POINT_COUNT + 1;
    const currentCharge = Math.max(
      0,
      currentDistance - (playerMovementDistanceOffsetsByMonId[mon.id] ?? 0),
    );
    setPlayerMovementStartTileOverridesByMonId((current) => {
      const currentTile = current[mon.id];
      if (currentTile?.col === nextCol && currentTile.row === nextRow) {
        return current;
      }
      return {
        ...current,
        [mon.id]: {col: nextCol, row: nextRow},
      };
    });
    setPlayerMovementDistanceOffsetsByMonId((current) => {
      const nextOffset = -currentCharge;
      const previousOffset = current[mon.id] ?? 0;
      if (previousOffset === nextOffset) {
        return current;
      }
      const next = {...current};
      if (nextOffset === 0) {
        delete next[mon.id];
      } else {
        next[mon.id] = nextOffset;
      }
      return next;
    });
  };
  const buildMovementChargeEntitiesWithMonMove = (
    monId: string,
    nextCol: number,
    nextRow: number,
    extraUpdater?: (entity: BoardEntity) => BoardEntity,
  ): BoardEntity[] =>
    boardEntities.map((entity) => {
      if (entity.id === monId) {
        return {
          ...entity,
          col: nextCol,
          row: nextRow,
        };
      }
      return extraUpdater?.(entity) ?? entity;
    });
  const directMoveHintTiles = useMemo(() => {
    if (
      !isPuzzleBoard ||
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
    if (selectedEntity === undefined) {
      return [];
    }
    const occupiedTileKeySet = new Set(
      visibleBoardEntities.map((entity) => toTileKey(entity.col, entity.row)),
    );
    const blockedHintTileKeySet = new Set([
      ...abilityRangeHintTileKeySet,
      ...pendingAbilityDotTileKeySet,
    ]);
    const hints: Array<{col: number; row: number; isAdjacentDirectMove: boolean}> = [];
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        const tileKey = toTileKey(col, row);
        const isAdjacentDirectMove =
          (selectedEntity.kind === 'mon' || isManaEntityKind(selectedEntity.kind)) &&
          isAdjacentTileMove(selectedEntity.col, selectedEntity.row, col, row);
        if (
          occupiedTileKeySet.has(tileKey) ||
          blockedHintTileKeySet.has(tileKey) ||
          !canEntityMoveToTile(selectedEntity, col, row)
        ) {
          continue;
        }
        if (isManaEntityKind(selectedEntity.kind)) {
          if (
            !playerManaMoveAvailable ||
            (isPuzzleBoard && selectedEntity.kind !== 'whiteMana') ||
            Math.max(
              Math.abs(col - selectedEntity.col),
              Math.abs(row - selectedEntity.row),
            ) > 1
          ) {
            continue;
          }
          hints.push({col, row, isAdjacentDirectMove});
          continue;
        }
        if (selectedEntity.kind === 'mon') {
          if (!canUseDirectWhiteMonMove(selectedEntity, col, row)) {
            continue;
          }
          hints.push({col, row, isAdjacentDirectMove});
          continue;
        }
        if (selectedEntity.kind === 'item') {
          hints.push({col, row, isAdjacentDirectMove});
        }
      }
    }
    return hints;
  }, [
    abilityRangeHintTileKeySet,
    canUseDirectWhiteMonMove,
    isPuzzleBoard,
    isResetAnimating,
    pendingAbilityDotTileKeySet,
    pendingDemonRebound,
    pendingSpiritPush,
    playerManaMoveAvailable,
    selectedMovableTile,
    visibleBoardEntities,
  ]);
  const directMoveHintTileKeySet = useMemo(
    () =>
      new Set([
        ...directMoveHintTiles.map((tile) => toTileKey(tile.col, tile.row)),
        ...directManaMoveDrainerTargetIndicators.map((target) =>
          toTileKey(target.col, target.row),
        ),
      ]),
    [directManaMoveDrainerTargetIndicators, directMoveHintTiles],
  );
  const applyItemPickupChoice = (
    choice: 'bomb' | 'potion',
    pendingChoice: PendingItemPickupChoice | null,
  ) => {
    if (pendingChoice === null) {
      return;
    }
    const {monId, monSide, itemId, targetCol, targetRow} = pendingChoice;
    const pendingMon = boardEntities.find((entity) => entity.id === monId);
    const pendingItem = boardEntities.find((entity) => entity.id === itemId);
    if (
      pendingMon === undefined ||
      pendingItem === undefined ||
      pendingItem.kind !== 'item' ||
      pendingItem.isScored ||
      !canUseDirectWhiteMonMove(pendingMon, targetCol, targetRow, itemId)
    ) {
      return;
    }
    setBoardEntitiesWithUndo((currentEntities) => {
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
    playBoardSoundEffect(choice === 'bomb' ? 'pickupBomb' : 'pickupPotion');
    if (choice === 'potion') {
      if (monSide === 'black') {
        setOpponentPotionCount((prev) => {
          const next = prev + 1;
          onPotionCountChange?.({
            side: 'black',
            count: next,
          });
          return next;
        });
      } else {
        setPlayerPotionCount((prev) => {
          const next = prev + 1;
          onPotionCountChange?.({
            side: 'white',
            count: next,
          });
          return next;
        });
      }
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
    playBoardSoundEffect('undo');
    clearAllScoredManaFadeTimers();
    clearAllManaPoolPulseTimers();
    clearAllAttackEffectTimers();
    clearAllPotionBubbleEffectTimers();
    clearAllPotionResourceExitTimers();
    setScoredManaFadeSpritesById({});
    setManaPoolPulseSprites([]);
    setAttackEffectSprites([]);
    setPotionBubbleEffectSprites([]);
    setExitingPlayerPotionResourceIds([]);
    setExitingInstructionPotionResourceIds([]);
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
    setUndoHistory([]);
    setPlayerScore(initialScores.white);
    setOpponentScore(initialScores.black);
    setPlayerPotionCount(playerStartingPotionCount);
    setOpponentPotionCount(opponentStartingPotionCount);
    setPlayerActiveAbilityStarAvailable(true);
    setPlayerManaMoveAvailable(true);
    setPlayerMovementDistanceOffsetsByMonId({});
    setPlayerMovementStartTileOverridesByMonId({});
    setFaintedMonIdSet(new Set());
    setSandboxManaSpawnTileById({});
    setSandboxItemSpawnTileById({});
    previouslyScoredManaIdsRef.current = new Set();
    forcedManaScoreSideByIdRef.current = {};
    sandboxDirectManaScoreSideRef.current = 'white';
    lastActiveAbilityUsedPotionRef.current = false;
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
  useEffect(() => {
    if (!enableFreeTileMove) {
      previousExternalResetTriggerRef.current = externalResetTrigger;
      return;
    }
    if (previousExternalResetTriggerRef.current === externalResetTrigger) {
      return;
    }
    previousExternalResetTriggerRef.current = externalResetTrigger;
    resetBoardToInitialPuzzleState();
  }, [enableFreeTileMove, externalResetTrigger, resetBoardToInitialPuzzleState]);
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
  const fullscreenHeldNormalManaExtraOffsetXUnits =
    enableFreeTileMove && isBoardFullscreen
      ? FULLSCREEN_HELD_NORMAL_MANA_EXTRA_OFFSET_X_PX / tilePixels
      : 0;
  const fullscreenHeldNormalManaExtraOffsetYUnits =
    enableFreeTileMove && isBoardFullscreen
      ? FULLSCREEN_HELD_NORMAL_MANA_EXTRA_OFFSET_Y_PX / tilePixels
      : 0;
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
  function getWinPiecePulseStyle(): CSSProperties | undefined {
    if (winPiecePulsePhase === 'idle') {
      return undefined;
    }
    const pulseTransition =
      winPiecePulsePhase === 'up'
        ? `transform ${WIN_PIECE_PULSE_UP_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
        : `transform ${WIN_PIECE_PULSE_DOWN_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
    return {
      transform: winPiecePulsePhase === 'up' ? `scale(${WIN_PIECE_PULSE_SCALE})` : 'scale(1)',
      transformBox: 'fill-box',
      transformOrigin: 'center center',
      transition: pulseTransition,
    };
  }
  function getInstructionAbilityDemoEntityTransform(entity: {
    id: string;
    col: number;
    row: number;
  }): string | undefined {
    if (instructionAbilityDemoState === null) {
      return undefined;
    }
    const delta = getInstructionAbilityDemoEntityDelta(entity);
    return `translate(${delta.col} ${delta.row})`;
  }
  function getEntityGroupStyle(entity: {
    id: string;
    col: number;
    row: number;
  }): CSSProperties | undefined {
    return getWinPiecePulseStyle();
  }
  function renderInstructionAbilityDemoMotion(entity: {
    id: string;
    col: number;
    row: number;
  }): ReactNode {
    void entity;
    return null;
  }
  function getBoardPieceImageStyle(baseStyle: CSSProperties = boardPieceImageStyle): CSSProperties {
    return baseStyle;
  }
  function getEntityImageStyle(entityId: string): CSSProperties {
    if (!(entityId in resetFadeInByEntityId)) {
      return getBoardPieceImageStyle();
    }
    return getBoardPieceImageStyle({
      ...boardPieceImageStyle,
      opacity: resetFadeInByEntityId[entityId] ? 1 : 0,
      transition: `opacity ${RESET_SCORED_MANA_FADE_MS}ms ease-out`,
    });
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
  function getBoardPerspectiveImageTransform(
    x: number,
    y: number,
    width: number,
    height: number,
    baseRotationDeg = 0,
  ): string | undefined {
    const rotationDeg = baseRotationDeg - (isBoardPerspectiveFlipped ? 180 : 0);
    if (Math.abs(rotationDeg % 360) < 0.001) {
      return undefined;
    }
    return `rotate(${rotationDeg} ${x + width / 2} ${y + height / 2})`;
  }
  function renderMonPiece(mon: {
    id: string;
    col: number;
    row: number;
    href: string;
    type: MonType;
    heldItemKind?: HeldItemKind;
    isFainted: boolean;
  }): ReactNode {
    const {col, row} = getRenderedEntityCoords(mon);
    const frame = getPieceFrame(row, col);
    const isAttackTargetHighlighted = attackTargetHighlightMonIdSet.has(mon.id);
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
    const shouldApplyFullscreenHeldNormalManaOffset =
      heldManaData !== undefined && !isHeldSuperMana;
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
          : shouldApplyFullscreenHeldNormalManaOffset
            ? fullscreenHeldNormalManaExtraOffsetXUnits
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
          : shouldApplyFullscreenHeldNormalManaOffset
            ? fullscreenHeldNormalManaExtraOffsetYUnits
            : 0);
    return (
      <g
        key={mon.id}
        transform={getInstructionAbilityDemoEntityTransform(mon)}
        style={getEntityGroupStyle(mon)}>
        {renderInstructionAbilityDemoMotion(mon)}
        <image
          data-billboard-id={mon.id}
          data-attack-targeted={isAttackTargetHighlighted ? 'true' : undefined}
          href={mon.href}
          x={frame.x}
          y={frame.y}
          width={frame.size}
          height={frame.size}
          transform={getBoardPerspectiveImageTransform(
            frame.x,
            frame.y,
            frame.size,
            frame.size,
            mon.isFainted ? 90 : 0,
          )}
          style={
            mon.isFainted
              ? getBoardPieceImageStyle({
                  ...boardPieceImageStyle,
                  opacity: FAINTED_MON_OPACITY,
                  filter: `blur(${faintedMonBlurPx}px)`,
                })
              : getBoardPieceImageStyle()
          }
        />
        {heldPieceHref !== undefined ? (
          <image
            data-billboard-id={`${mon.id}-held`}
            href={heldPieceHref}
            x={heldManaX}
            y={heldManaY}
            width={heldManaSize}
            height={heldManaSize}
            transform={getBoardPerspectiveImageTransform(
              heldManaX,
              heldManaY,
              heldManaSize,
              heldManaSize,
            )}
            style={getBoardPieceImageStyle()}
          />
        ) : null}
      </g>
    );
  }
  const liftedInstructionBlackDemonId =
    instructionAbilityDemoState?.key === 'demon' &&
    instructionAbilityDemoState.side === 'black'
      ? defaultInstructionDemoEntityIds.black.demon
      : null;
  const liftedInstructionBlackDemon =
    liftedInstructionBlackDemonId === null
      ? null
      : activeMonPositions.black.find((mon) => mon.id === liftedInstructionBlackDemonId) ?? null;
  const displayedBlackMonPositions =
    liftedInstructionBlackDemonId === null
      ? activeMonPositions.black
      : activeMonPositions.black.filter((mon) => mon.id !== liftedInstructionBlackDemonId);
  const displayedAngelProtectionZones: RenderedAngelProtectionZone[] = [
    ...renderedAngelProtectionZones,
    ...(instructionAbilityDemoState?.angelProtectionZones.map((zone) => ({
      ...zone,
      status: 'active' as const,
    })) ?? []),
  ];
  const instructionBombRangeZones: RenderedBombRangeZone[] = (() => {
    if (instructionAbilityDemoState?.key !== 'bomb') {
      return [];
    }
    const bombHolder = visibleBoardEntities.find(
      (entity) =>
        entity.kind === 'mon' &&
        entity.heldItemKind === 'bomb',
    );
    if (bombHolder === undefined) {
      return [];
    }
    const range = 3;
    const minCol = Math.max(0, bombHolder.col - range);
    const minRow = Math.max(0, bombHolder.row - range);
    const maxCol = Math.min(BOARD_SIZE, bombHolder.col + range + 1);
    const maxRow = Math.min(BOARD_SIZE, bombHolder.row + range + 1);
    return [
      {
        key: `instruction-bomb-range-${bombHolder.id}`,
        x: minCol,
        y: minRow,
        width: maxCol - minCol,
        height: maxRow - minRow,
        status: 'active',
      },
    ];
  })();
  const displayedBombRangeZones: RenderedBombRangeZone[] = [
    ...renderedBombRangeZones,
    ...instructionBombRangeZones,
  ];
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const tileKey = `${row}-${col}`;
      const hasSelectablePiece = pieceByTile[tileKey] !== undefined;
      const canMoveSelectedPiece =
        !isResetAnimating &&
        enableFreeTileMove &&
        selectedMovableTile !== null;
      if ((row + col) % 2 === 1) {
        darkSquares.push(
          <rect
            key={`dark-${row}-${col}`}
            x={col}
            y={row}
            width={1}
            height={1}
            fill={boardColors.darkSquare}
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
            if (performance.now() < suppressBoardClickUntilRef.current) {
              return;
            }
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
              if (!consumePlayerActiveAbilityResource()) {
                setPendingDemonRebound(null);
                setSelectedTile({
                  row: pendingDemonRebound.sourceRow,
                  col: pendingDemonRebound.sourceCol,
                });
                return;
              }
              triggerPotionBubbleEffectAfterPotionAbility(
                pendingDemonRebound.targetCol,
                pendingDemonRebound.targetRow,
              );
              if (
                pendingReboundAttackerEntity !== undefined &&
                pendingReboundAttackerEntity.kind === 'mon' &&
                pendingReboundAttackerEntity.side === 'white' &&
                pendingReboundAttackerEntity.monType === 'demon'
              ) {
                const nextSourceCol =
                  pendingReboundTargetHasBomb && pendingReboundAttackerSpawnTile !== null
                    ? pendingReboundAttackerSpawnTile.col
                    : reboundChoice.col;
                const nextSourceRow =
                  pendingReboundTargetHasBomb && pendingReboundAttackerSpawnTile !== null
                    ? pendingReboundAttackerSpawnTile.row
                    : reboundChoice.row;
                setWhiteDemonMovementStartAfterAttack(
                  pendingReboundAttackerEntity,
                  nextSourceCol,
                  nextSourceRow,
                );
              }
              setBoardEntitiesWithUndo((currentEntities) => {
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
                const nextSourceCol = attackerRespawnTile?.col ?? reboundChoice.col;
                const nextSourceRow = attackerRespawnTile?.row ?? reboundChoice.row;
                nextEntities[sourceIndex] = {
                  ...sourceMon,
                  col: nextSourceCol,
                  row: nextSourceRow,
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
              const isSpiritPushDestinationManaPool = cornerManaPoolTileKeySet.has(
                toTileKey(destinationChoice.col, destinationChoice.row),
              );
              if (!consumePlayerActiveAbilityResource()) {
                setPendingSpiritPush(null);
                setSelectedTile({
                  row: pendingSpiritPush.sourceRow,
                  col: pendingSpiritPush.sourceCol,
                });
                return;
              }
              triggerPotionBubbleEffectAfterPotionAbility(
                pendingSpiritPush.sourceCol,
                pendingSpiritPush.sourceRow,
              );
              const pushedOwnMon =
                boardEntities.find(
                  (entity) => entity.id === pendingSpiritPush.targetId,
                ) ?? null;
              const pushingSpirit =
                boardEntities.find(
                  (entity) => entity.id === pendingSpiritPush.spiritId,
                ) ?? null;
              const spiritPushDestinationOccupant =
                boardEntities.find(
                  (entity) =>
                    !entity.isScored &&
                    entity.carriedByDrainerId === undefined &&
                    entity.col === destinationChoice.col &&
                    entity.row === destinationChoice.row,
                ) ?? null;
              const carriedManaByPushedDrainer =
                pushedOwnMon !== null &&
                pushedOwnMon.kind === 'mon' &&
                pushedOwnMon.monType === 'drainer'
                  ? boardEntities.find(
                      (entity) =>
                        !entity.isScored &&
                        entity.carriedByDrainerId === pushedOwnMon.id &&
                        isManaEntityKind(entity.kind),
                    ) ?? null
                  : null;
              const scoredSpiritPushedMana =
                isSpiritPushDestinationManaPool && pushedOwnMon !== null
                  ? isManaEntityKind(pushedOwnMon.kind)
                    ? {
                        id: pushedOwnMon.id,
                        href: pushedOwnMon.href,
                        col: destinationChoice.col,
                        row: destinationChoice.row,
                      }
                    : carriedManaByPushedDrainer !== null
                      ? {
                          id: carriedManaByPushedDrainer.id,
                          href: carriedManaByPushedDrainer.href,
                          col: destinationChoice.col,
                          row: destinationChoice.row,
                        }
                      : null
                  : null;
              const shouldAnchorPushedOwnDrainerManaPickup =
                pushingSpirit !== null &&
                pushingSpirit.kind === 'mon' &&
                pushingSpirit.side === 'white' &&
                pushedOwnMon !== null &&
                pushedOwnMon.kind === 'mon' &&
                pushedOwnMon.side === 'white' &&
                pushedOwnMon.monType === 'drainer' &&
                spiritPushDestinationOccupant !== null &&
                isManaEntityKind(spiritPushDestinationOccupant.kind);
              const shouldAnchorPushedOwnDrainerManaScore =
                pushingSpirit !== null &&
                pushingSpirit.kind === 'mon' &&
                pushingSpirit.side === 'white' &&
                pushedOwnMon !== null &&
                pushedOwnMon.kind === 'mon' &&
                pushedOwnMon.side === 'white' &&
                pushedOwnMon.monType === 'drainer' &&
                isSpiritPushDestinationManaPool &&
                carriedManaByPushedDrainer !== null;
              const shouldAnchorStationaryOwnDrainerManaPickup =
                pushingSpirit !== null &&
                pushingSpirit.kind === 'mon' &&
                pushingSpirit.side === 'white' &&
                pushedOwnMon !== null &&
                isManaEntityKind(pushedOwnMon.kind) &&
                spiritPushDestinationOccupant !== null &&
                spiritPushDestinationOccupant.kind === 'mon' &&
                spiritPushDestinationOccupant.side === 'white' &&
                spiritPushDestinationOccupant.monType === 'drainer';
              const spiritPushDrainerAnchorMon = shouldAnchorPushedOwnDrainerManaPickup
                ? pushedOwnMon
                : shouldAnchorPushedOwnDrainerManaScore
                  ? pushedOwnMon
                  : shouldAnchorStationaryOwnDrainerManaPickup
                    ? spiritPushDestinationOccupant
                    : null;
              const spiritPushDrainerAnchorCharge =
                spiritPushDrainerAnchorMon !== null &&
                isWhiteMonBoardEntity(spiritPushDrainerAnchorMon)
                  ? getWhiteMonMovementCharge(
                      spiritPushDrainerAnchorMon,
                      spiritPushDrainerAnchorMon.col,
                      spiritPushDrainerAnchorMon.row,
                      boardEntities,
                      undefined,
                      false,
                    )
                  : null;
              if (
                pushingSpirit !== null &&
                pushingSpirit.kind === 'mon' &&
                pushingSpirit.side === 'white' &&
                pushedOwnMon !== null &&
                pushedOwnMon.kind === 'mon' &&
                pushedOwnMon.side === 'white' &&
                pushedOwnMon.monType !== undefined
              ) {
                if (
                  !shouldAnchorPushedOwnDrainerManaPickup &&
                  !shouldAnchorPushedOwnDrainerManaScore
                ) {
                  preserveWhiteMonMovementChargeAfterFreeMove(
                    pushedOwnMon,
                    destinationChoice.col,
                    destinationChoice.row,
                    buildMovementChargeEntitiesWithMonMove(
                      pushedOwnMon.id,
                      destinationChoice.col,
                      destinationChoice.row,
                      (entity) =>
                        entity.col === destinationChoice.col &&
                        entity.row === destinationChoice.row &&
                        isManaEntityKind(entity.kind)
                          ? {...entity, carriedByDrainerId: pushedOwnMon.id}
                          : entity,
                    ),
                  );
                }
              }
              setBoardEntitiesWithUndo((currentEntities) => {
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
                const destinationOccupants = currentEntities.filter(
                  (entity) =>
                    entity.id !== target.id &&
                    !entity.isScored &&
                    entity.carriedByDrainerId === undefined &&
                    entity.col === destinationChoice.col &&
                    entity.row === destinationChoice.row,
                );
                if (destinationOccupants.length > 1) {
                  return currentEntities;
                }
                const destinationOccupant =
                  destinationOccupants.length === 1 ? destinationOccupants[0] : null;
                const destinationDrainer =
                  destinationOccupant !== null &&
                  destinationOccupant.kind === 'mon' &&
                  destinationOccupant.side !== undefined &&
                  destinationOccupant.monType === 'drainer'
                    ? destinationOccupant
                    : null;
                const destinationMana =
                  destinationOccupant !== null && isManaEntityKind(destinationOccupant.kind)
                    ? destinationOccupant
                    : null;
                const isManaPushedIntoDrainerHands =
                  isManaEntityKind(target.kind) && destinationDrainer !== null;
                const isDrainerPushedOntoAdjacentMana =
                  target.kind === 'mon' &&
                  target.side !== undefined &&
                  target.monType === 'drainer' &&
                  destinationMana !== null;
                if (
                  !isManaPushedIntoDrainerHands &&
                  !canEntityMoveToTile(target, destinationChoice.col, destinationChoice.row)
                ) {
                  return currentEntities;
                }
                if (isManaPushedIntoDrainerHands && destinationDrainer.heldItemKind === 'bomb') {
                  return currentEntities;
                }
                if (
                  isManaPushedIntoDrainerHands &&
                  !canDrainerReceiveMana(currentEntities, destinationDrainer)
                ) {
                  return currentEntities;
                }
                if (
                  isDrainerPushedOntoAdjacentMana &&
                  target.kind === 'mon' &&
                  target.heldItemKind === 'bomb'
                ) {
                  return currentEntities;
                }
                if (
                  destinationOccupant !== null &&
                  !isManaPushedIntoDrainerHands &&
                  !isDrainerPushedOntoAdjacentMana
                ) {
                  return currentEntities;
                }
                const nextEntities = [...currentEntities];
                if (isManaPushedIntoDrainerHands) {
                  const pushedMana = target;
                  const receiverDrainer = destinationDrainer;
                  if (isSpiritPushDestinationManaPool) {
                    nextEntities[targetIndex] = {
                      ...pushedMana,
                      col: destinationChoice.col,
                      row: destinationChoice.row,
                      carriedByDrainerId: undefined,
                      isScored: true,
                    };
                    forcedManaScoreSideByIdRef.current[pushedMana.id] =
                      receiverDrainer.side;
                    return nextEntities;
                  }
                  nextEntities[targetIndex] = {
                    ...pushedMana,
                    col: destinationChoice.col,
                    row: destinationChoice.row,
                    carriedByDrainerId: receiverDrainer.id,
                  };
                  return nextEntities;
                }
                if (isDrainerPushedOntoAdjacentMana && target.kind === 'mon') {
                  const pushedDrainer = target;
                  const pickedUpManaIndex = currentEntities.findIndex(
                    (entity) => entity.id === destinationMana.id,
                  );
                  if (pickedUpManaIndex === -1) {
                    return currentEntities;
                  }
                  const carriedManaIndex = currentEntities.findIndex(
                    (entity) =>
                      !entity.isScored &&
                      entity.carriedByDrainerId === pushedDrainer.id &&
                      (entity.kind === 'whiteMana' ||
                        entity.kind === 'blackMana' ||
                        entity.kind === 'superMana'),
                  );
                  nextEntities[targetIndex] = {
                    ...pushedDrainer,
                    col: destinationChoice.col,
                    row: destinationChoice.row,
                  };
                  if (carriedManaIndex !== -1 && carriedManaIndex !== pickedUpManaIndex) {
                    const carriedMana = currentEntities[carriedManaIndex];
                    nextEntities[carriedManaIndex] = {
                      ...carriedMana,
                      col: pushedDrainer.col,
                      row: pushedDrainer.row,
                      carriedByDrainerId: undefined,
                    };
                  }
                  nextEntities[pickedUpManaIndex] = {
                    ...currentEntities[pickedUpManaIndex],
                    col: destinationChoice.col,
                    row: destinationChoice.row,
                    carriedByDrainerId: pushedDrainer.id,
                  };
                  return nextEntities;
                }
                nextEntities[targetIndex] = {
                  ...target,
                  col: destinationChoice.col,
                  row: destinationChoice.row,
                  isScored:
                    isSpiritPushDestinationManaPool && isManaEntityKind(target.kind)
                      ? true
                      : target.isScored,
                  carriedByDrainerId:
                    isSpiritPushDestinationManaPool && isManaEntityKind(target.kind)
                      ? undefined
                      : target.carriedByDrainerId,
                };
                if (isSpiritPushDestinationManaPool && isManaEntityKind(target.kind)) {
                  forcedManaScoreSideByIdRef.current[target.id] = spirit.side;
                }
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
                      isScored: isSpiritPushDestinationManaPool,
                      carriedByDrainerId: isSpiritPushDestinationManaPool
                        ? undefined
                        : nextEntities[carriedManaIndex].carriedByDrainerId,
                    };
                  }
                }
                return nextEntities;
              });
              if (scoredSpiritPushedMana !== null) {
                triggerManaScoreEffects(scoredSpiritPushedMana);
              } else {
                playBoardSoundEffect('spiritAbility');
              }
              if (spiritPushDrainerAnchorMon !== null) {
                setWhiteDrainerMovementAnchorAfterManaPickup(
                  spiritPushDrainerAnchorMon,
                  destinationChoice.col,
                  destinationChoice.row,
                  spiritPushDrainerAnchorCharge,
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
            const hasSelectableSourceEntityAtTarget =
              selectableSourceTileKeySet.has(targetTileKey);
            if (
              enableFreeTileMove &&
              selectedTile !== null &&
              selectedTileKey !== null &&
              selectableSourceTileKeySet.has(selectedTileKey)
            ) {
              const sourceRow = selectedTile.row;
              const sourceCol = selectedTile.col;
              const selectedEntity = visibleBoardEntities.find(
                (entity) => entity.row === sourceRow && entity.col === sourceCol,
              );
              if (selectedEntity === undefined) {
                return;
              }
              const targetEntity = visibleBoardEntities.find(
                (entity) => entity.row === row && entity.col === col,
              );
              if (selectedEntity.kind === 'item') {
                if (isSameTile(selectedTile, targetTile)) {
                  setSelectedTile(null);
                  return;
                }
                if (hasMovableEntityAtTarget && !isSameTile(selectedTile, targetTile)) {
                  if (hasSelectableSourceEntityAtTarget) {
                    rememberSandboxDirectManaScoreSide(targetEntity);
                    setSelectedTile(targetTile);
                  }
                  return;
                }
                setBoardEntitiesWithUndo((currentEntities) => {
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
                playBoardSoundEffect('move');
                updateSandboxSetupItemSpawnTile(selectedEntity, col, row);
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
                canUsePlayerActiveAbility &&
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
                if (
                  !canUseDirectWhiteMonMove(
                    selectedEntity,
                    col,
                    row,
                    targetItemEntity.id,
                  )
                ) {
                  return;
                }
                const nextPendingPickupChoice: PendingItemPickupChoice = {
                  monId: selectedEntity.id,
                  monSide: selectedEntity.side,
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
                  playBoardSoundEffect('choosePickup');
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
                setBoardEntitiesWithUndo((currentEntities) => {
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
                const canLoadedDrainerSwapAdjacentMana =
                  carriedManaEntity !== undefined &&
                  isAdjacentTileMove(
                    selectedEntity.col,
                    selectedEntity.row,
                    targetEntity.col,
                    targetEntity.row,
                  );
                const canSelectedDrainerPickUpTargetMana =
                  (carriedManaEntity === undefined || canLoadedDrainerSwapAdjacentMana) &&
                  selectedEntity.heldItemKind !== 'bomb' &&
                  canEntityMoveToTile(selectedEntity, targetEntity.col, targetEntity.row) &&
                  canUseDirectWhiteMonMove(
                    selectedEntity,
                    targetEntity.col,
                    targetEntity.row,
                    targetEntity.id,
                  );
                if (!canSelectedDrainerPickUpTargetMana) {
                  if (hasSelectableSourceEntityAtTarget) {
                    rememberSandboxDirectManaScoreSide(targetEntity);
                    setSelectedTile(targetTile);
                  }
                  return;
                }
                const directDrainerPickupMovementCharge =
                  isWhiteMonBoardEntity(selectedEntity)
                    ? getWhiteMonMovementCharge(
                        selectedEntity,
                        targetEntity.col,
                        targetEntity.row,
                        boardEntities,
                        targetEntity.id,
                      )
                    : null;
                setBoardEntitiesWithUndo((currentEntities) => {
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
                setWhiteDrainerMovementAnchorAfterManaPickup(
                  selectedEntity,
                  targetEntity.col,
                  targetEntity.row,
                  directDrainerPickupMovementCharge,
                );
                playBoardSoundEffect('manaPickUp');
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
                  if (!canUseDirectWhiteMonMove(selectedEntity, col, row)) {
                    return;
                  }
                  setBoardEntitiesWithUndo((currentEntities) => {
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
                  playBoardSoundEffect('move');
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
                canUsePlayerActiveAbility &&
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
                  if (!consumePlayerActiveAbilityResource()) {
                    setSelectedTile({row: sourceRow, col: sourceCol});
                    return;
                  }
                  triggerPotionBubbleEffectAfterPotionAbility(sourceCol, sourceRow);
                  setBoardEntitiesWithUndo((currentEntities) => {
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
                canUsePlayerActiveAbility &&
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
                  if (!consumePlayerActiveAbilityResource()) {
                    setSelectedTile({row: sourceRow, col: sourceCol});
                    return;
                  }
                  triggerPotionBubbleEffectAfterPotionAbility(col, row);
                  if (selectedEntity.side === 'white') {
                    const nextDemonTile =
                      doesDemonAttackTargetHoldBomb && demonAttackerSpawnTile !== null
                        ? demonAttackerSpawnTile
                        : isDemonAttackTargetOnOwnSpawn
                          ? {col: selectedEntity.col, row: selectedEntity.row}
                          : {col: targetEntity.col, row: targetEntity.row};
                    if (targetSpawnTile !== null) {
                      setWhiteDemonMovementStartAfterAttack(
                        selectedEntity,
                        nextDemonTile.col,
                        nextDemonTile.row,
                      );
                    }
                  }
                  setBoardEntitiesWithUndo((currentEntities) => {
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
                isManaEntityKind(selectedEntity.kind) &&
                (!isPuzzleBoard || selectedEntity.kind === 'whiteMana');
              const canScoreCarriedManaOnPool =
                isSelectedDrainer &&
                carriedManaEntity !== undefined &&
                targetEntity === undefined &&
                isTargetManaPool;
              const directDrainerScoreMovementCharge =
                canScoreCarriedManaOnPool && isWhiteMonBoardEntity(selectedEntity)
                  ? getWhiteMonMovementCharge(
                      selectedEntity,
                      col,
                      row,
                      boardEntities,
                      undefined,
                    )
                  : null;
              if (canScoreSelectedManaOnPool) {
                if (!canEntityMoveToTile(selectedEntity, col, row)) {
                  return;
                }
                if (
                  isPuzzleBoard &&
                  Math.max(Math.abs(col - sourceCol), Math.abs(row - sourceRow)) > 1
                ) {
                  return;
                }
                if (!consumePlayerManaMoveResource()) {
                  setSelectedTile(null);
                  return;
                }
                setBoardEntitiesWithUndo((currentEntities) => {
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
                  if (isSandboxFreeMoveBoard) {
                    forcedManaScoreSideByIdRef.current[sourceEntity.id] =
                      sandboxDirectManaScoreSideRef.current;
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
                triggerManaScoreEffects({
                  id: selectedEntity.id,
                  href: selectedEntity.href,
                  col,
                  row,
                });
                setSelectedTile(null);
                return;
              }
              const targetDrainerEntity =
                targetEntity !== undefined &&
                canDrainerReceiveMana(boardEntities, targetEntity)
                  ? targetEntity
                  : null;
              const canMoveSelectedManaIntoTargetDrainer =
                targetDrainerEntity !== null &&
                isManaEntityKind(selectedEntity.kind) &&
                (!isPuzzleBoard ||
                  (selectedEntity.kind === 'whiteMana' &&
                    isAdjacentTileMove(sourceCol, sourceRow, col, row)));
              if (canMoveSelectedManaIntoTargetDrainer) {
                if (!consumePlayerManaMoveResource()) {
                  setSelectedTile(null);
                  return;
                }
                const isTargetDrainerOnManaPool = cornerManaPoolTileKeySet.has(
                  toTileKey(targetDrainerEntity.col, targetDrainerEntity.row),
                );
                const targetDrainerScoreMovementCharge =
                  isTargetDrainerOnManaPool && isWhiteMonBoardEntity(targetDrainerEntity)
                    ? getWhiteMonMovementCharge(
                        targetDrainerEntity,
                        targetDrainerEntity.col,
                        targetDrainerEntity.row,
                        boardEntities,
                        undefined,
                        false,
                      )
                    : null;
                const scoredDirectDrainerMana = isTargetDrainerOnManaPool
                  ? {
                      id: selectedEntity.id,
                      href: selectedEntity.href,
                      col: targetDrainerEntity.col,
                      row: targetDrainerEntity.row,
                    }
                  : null;
                setBoardEntitiesWithUndo((currentEntities) => {
                  const sourceIndex = currentEntities.findIndex(
                    (entity) => entity.id === selectedEntity.id,
                  );
                  const targetDrainerIndex = currentEntities.findIndex(
                    (entity) => entity.id === targetDrainerEntity.id,
                  );
                  if (sourceIndex === -1 || targetDrainerIndex === -1) {
                    return currentEntities;
                  }
                  const sourceMana = currentEntities[sourceIndex];
                  const receiverDrainer = currentEntities[targetDrainerIndex];
                  if (
                    !isManaEntityKind(sourceMana.kind) ||
                    sourceMana.isScored ||
                    receiverDrainer.kind !== 'mon' ||
                    receiverDrainer.side === undefined ||
                    receiverDrainer.monType !== 'drainer' ||
                    !canDrainerReceiveMana(currentEntities, receiverDrainer)
                  ) {
                    return currentEntities;
                  }
                  const nextEntities = [...currentEntities];
                  if (isTargetDrainerOnManaPool) {
                    nextEntities[sourceIndex] = {
                      ...sourceMana,
                      col: receiverDrainer.col,
                      row: receiverDrainer.row,
                      carriedByDrainerId: undefined,
                      isScored: true,
                    };
                    forcedManaScoreSideByIdRef.current[sourceMana.id] =
                      receiverDrainer.side;
                    return nextEntities;
                  }
                  nextEntities[sourceIndex] = {
                    ...sourceMana,
                    col: receiverDrainer.col,
                    row: receiverDrainer.row,
                    carriedByDrainerId: receiverDrainer.id,
                  };
                  return nextEntities;
                });
                updateSandboxSetupManaSpawnTile(selectedEntity, col, row);
                if (scoredDirectDrainerMana !== null) {
                  setWhiteDrainerMovementAnchorAfterManaPickup(
                    targetDrainerEntity,
                    targetDrainerEntity.col,
                    targetDrainerEntity.row,
                    targetDrainerScoreMovementCharge,
                  );
                  triggerManaScoreEffects(scoredDirectDrainerMana);
                } else {
                  playBoardSoundEffect('manaPickUp');
                }
                setSelectedTile(isPuzzleBoard ? null : targetTile);
                return;
              }
              if (
                hasMovableEntityAtTarget &&
                !isSameTile(selectedTile, targetTile)
              ) {
                if (hasSelectableSourceEntityAtTarget) {
                  rememberSandboxDirectManaScoreSide(targetEntity);
                  setSelectedTile(targetTile);
                }
                return;
              }
              if (!canEntityMoveToTile(selectedEntity, col, row)) {
                return;
              }
              const isDirectManaMove = isManaEntityKind(selectedEntity.kind);
              const isDirectMonMove = selectedEntity.kind === 'mon';
              if (
                isDirectManaMove &&
                isPuzzleBoard &&
                (selectedEntity.kind !== 'whiteMana' ||
                  Math.max(Math.abs(col - sourceCol), Math.abs(row - sourceRow)) > 1)
              ) {
                return;
              }
              if (
                isDirectMonMove &&
                !canUseDirectWhiteMonMove(selectedEntity, col, row)
              ) {
                return;
              }
              if (isDirectManaMove && !consumePlayerManaMoveResource()) {
                setSelectedTile(null);
                return;
              }
              rememberSandboxDirectManaScoreSide(selectedEntity);
              setBoardEntitiesWithUndo((currentEntities) => {
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
              if (isDirectManaMove) {
                updateSandboxSetupManaSpawnTile(selectedEntity, col, row);
              }
              if (canScoreCarriedManaOnPool && carriedManaEntity !== undefined) {
                setWhiteDrainerMovementAnchorAfterManaPickup(
                  selectedEntity,
                  col,
                  row,
                  directDrainerScoreMovementCharge,
                );
                triggerManaScoreEffects({
                  id: carriedManaEntity.id,
                  href: carriedManaEntity.href,
                  col,
                  row,
                });
              } else {
                playBoardSoundEffect('move');
              }
              setSelectedTile(isDirectManaMove && isPuzzleBoard ? null : targetTile);
              return;
            }
            const clickedEntity = visibleBoardEntities.find(
              (entity) => entity.row === row && entity.col === col,
            );
            if (isInstructionBoard && clickedEntity?.kind === 'item') {
              setSelectedTile(targetTile);
              setSelectedMoveResourceId(null);
              setInstructionSelectedItemChoice(null);
              setInstructionItemPickupChoiceTile(targetTile);
              setHoveredItemChoice(null);
              return;
            }
            if (
              isInstructionBoard &&
              clickedEntity !== undefined &&
              (clickedEntity.kind === 'whiteMana' || clickedEntity.kind === 'blackMana')
            ) {
              setSelectedTile(targetTile);
              setSelectedMoveResourceId(null);
              return;
            }
            const clickedPiece = pieceByTile[tileKey] ?? null;
            if (clickedPiece?.kind === 'manaPool') {
              setSelectedTile(targetTile);
              return;
            }
            if (clickedPiece !== null && hasSelectableSourceEntityAtTarget) {
              rememberSandboxDirectManaScoreSide(clickedEntity);
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
                {enableFreeTileMove ? (
                  <button
                    type="button"
                    className="player-hud-perspective-button"
                    aria-label={
                      isBoardPerspectiveFlipped
                        ? 'Show white board perspective'
                        : 'Show black board perspective'
                    }
                    aria-pressed={isBoardPerspectiveFlipped}
                    style={hudPerspectiveInlineButtonStyle}
                    onClick={(event) => {
                      event.currentTarget.blur();
                      setBoardPerspectiveFlipAnimationNonce((current) => current + 1);
                      setIsBoardPerspectiveFlipped((current) => !current);
                    }}>
                    <svg viewBox="0 0 32 24" aria-hidden="true" style={hudResetIconStyle}>
                      <g key={`perspective-up-${boardPerspectiveFlipAnimationNonce}`}>
                        {boardPerspectiveFlipAnimationNonce > 0 ? (
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0 8 12"
                            to="180 8 12"
                            dur="320ms"
                            fill="remove"
                          />
                        ) : null}
                        <path
                          d="M8 19V5M3.8 9.2 8 5l4.2 4.2"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                      <g key={`perspective-down-${boardPerspectiveFlipAnimationNonce}`}>
                        {boardPerspectiveFlipAnimationNonce > 0 ? (
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0 24 12"
                            to="180 24 12"
                            dur="320ms"
                            fill="remove"
                          />
                        ) : null}
                        <path
                          d="M24 5v14M19.8 14.8 24 19l4.2-4.2"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                    </svg>
                  </button>
                ) : null}
              </div>
              <div style={opponentHudStatusRowStyle} aria-label="Opponent turn resources">
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

          <ThreeDBoardSurface
            enabled={canUseThreeDBoardView && isThreeDBoardViewEnabled}
            renderWidth={renderWidth}
            viewportWidth={threeDBoardViewportWidth}
            viewportHeight={threeDBoardViewportHeight}
            viewportBottomExtensionPx={threeDBoardViewportBottomExtensionPx}
            isFullscreen={isBoardFullscreen}
            boardTheme={boardTheme}
            hoveredTile={hoveredTile}
            selectedTile={selectedTile}
            isItemPickupChoiceOpen={isItemPickupChoiceOpen}
            onHoveredTileChange={setHoveredTile}>
            <svg
              ref={boardSvgRef}
              viewBox="-1 -1 13 13"
              style={svgStyle}
              shapeRendering="crispEdges"
              aria-label="Super Metal Mons board"
              onMouseLeave={() => {
                setHoveredTile(null);
              }}>
          <g transform={boardPerspectiveContentTransform}>
          <rect x={0} y={0} width={11} height={11} fill={boardColors.lightSquare} />
          {darkSquares}

        {manaPoolPositions.map(([col, row], i) => (
          <rect
            key={`mana-pool-${i}`}
            x={col}
            y={row}
            width={1}
            height={1}
            fill={boardColors.manaPool}
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
                        fill={boardColors.manaPool}
                      />
                    </>
                  ) : null}
                </g>
              );
            })}
          </g>
        ))}

        {pickupPositions.map(([col, row], i) =>
          sandboxItemSpawnOriginTileKeySet.has(toTileKey(col, row)) ? null : (
            <rect
                key={`pickup-${i}`}
                x={col}
                y={row}
                width={1}
                height={1}
                fill={boardColors.pickupItemSquare}
              />
            ),
          )}

          {sandboxItemSpawnTiles.map((tile) => (
            <rect
              key={`sandbox-setup-item-spawn-${tile.id}`}
              x={tile.col}
              y={tile.row}
              width={1}
              height={1}
              fill={boardColors.pickupItemSquare}
            />
          ))}

	          {simpleManaPositions.map(([col, row], i) =>
	            sandboxManaSpawnOriginTileKeySet.has(toTileKey(col, row)) ? null : (
	              <rect
	                key={`simple-mana-${i}`}
	                x={col}
                y={row}
                width={1}
                height={1}
                fill={boardColors.simpleManaSquare}
	              />
	            ),
	          )}

          {sandboxManaSpawnTiles.map((tile) => (
            <rect
              key={`sandbox-setup-mana-spawn-${tile.id}`}
              x={tile.col}
              y={tile.row}
              width={1}
              height={1}
              fill={SANDBOX_SETUP_MANA_SQUARE_COLOR}
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
	              !showSpawnGhostsAlways &&
	              (ghostHiddenTileKeySet.has(toTileKey(ghost.col, ghost.row)) ||
	                directMoveHintTileKeySet.has(toTileKey(ghost.col, ghost.row)))
	                ? null
	                : (
			              <image
		                key={`spawn-ghost-${index}`}
	                  data-billboard-ignore="true"
	                  className="spawn-ghost-image"
		                href={ghost.href}
	                x={ghost.col + spawnGhostInsetUnits}
	                y={ghost.row + spawnGhostInsetUnits}
	                width={spawnGhostSizeUnits}
	                height={spawnGhostSizeUnits}
                  transform={getBoardPerspectiveImageTransform(
                    ghost.col + spawnGhostInsetUnits,
                    ghost.row + spawnGhostInsetUnits,
                    spawnGhostSizeUnits,
                    spawnGhostSizeUnits,
                  )}
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
	                puzzleStartGhostHiddenTileKeySet.has(toTileKey(ghost.col, ghost.row)) ||
	                directMoveHintTileKeySet.has(toTileKey(ghost.col, ghost.row))
	                  ? null
	                  : (
			                <image
		                  key={`puzzle-start-ghost-${index}`}
		                  data-billboard-ignore="true"
		                  href={ghost.href}
	                  x={ghost.col + puzzleStartGhostInsetUnits}
	                  y={ghost.row + puzzleStartGhostInsetUnits}
	                  width={puzzleStartGhostSizeUnits}
	                  height={puzzleStartGhostSizeUnits}
                    transform={getBoardPerspectiveImageTransform(
                      ghost.col + puzzleStartGhostInsetUnits,
                      ghost.row + puzzleStartGhostInsetUnits,
                      puzzleStartGhostSizeUnits,
                      puzzleStartGhostSizeUnits,
                    )}
                  style={getGhostImageStyle(
                    toTileKey(ghost.col, ghost.row),
                    PUZZLE_START_GHOST_OPACITY,
                  )}
	                />
		              )
	              ))
		            : null}

        {directMoveHintTiles.map((tile, index) => (
          <circle
            key={`direct-move-hint-${tile.col}-${tile.row}-${index}`}
            cx={tile.col + 0.5}
            cy={tile.row + 0.5}
            r={tile.isAdjacentDirectMove ? 0.125 : 0.095}
            fill={tile.isAdjacentDirectMove ? ADJACENT_MOVE_DOT_COLOR : hoveredTileCenterDotColor}
            opacity={tile.isAdjacentDirectMove ? 0.78 : 0.16}
            pointerEvents="none"
            shapeRendering="geometricPrecision"
          />
        ))}

        {(instructionAbilityDemoState?.manaMoveDots ?? []).map((tile, index) => (
          <circle
            key={`instruction-mana-move-dot-${tile.col}-${tile.row}-${index}`}
            cx={tile.col + 0.5}
            cy={tile.row + 0.5}
            r={0.125}
            fill={ADJACENT_MOVE_DOT_COLOR}
            opacity={0.78}
            pointerEvents="none"
            shapeRendering="geometricPrecision"
          />
        ))}

        {displayedBombRangeZones.map((zone, index) => (
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

        {displayedAngelProtectionZones.map((zone, index) => (
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
              <g
                key={entity.id}
                transform={getInstructionAbilityDemoEntityTransform(entity)}
                style={getEntityGroupStyle(entity)}>
                {renderInstructionAbilityDemoMotion(entity)}
                <image
                  data-billboard-id={entity.id}
                  href={boardAssets.manaB}
                  x={frame.x}
                  y={frame.y}
                  width={frame.size}
                  height={frame.size}
                  transform={getBoardPerspectiveImageTransform(
                    frame.x,
                    frame.y,
                    frame.size,
                    frame.size,
                  )}
                  style={getEntityImageStyle(entity.id)}
                />
              </g>
            );
          })()
        ))}

        {activeWhiteManaEntities.map((entity) => (
          (() => {
            const {col, row} = getRenderedEntityCoords(entity);
            const frame = getPieceFrame(row, col);
            return (
              <g
                key={entity.id}
                transform={getInstructionAbilityDemoEntityTransform(entity)}
                style={getEntityGroupStyle(entity)}>
                {renderInstructionAbilityDemoMotion(entity)}
                <image
                  data-billboard-id={entity.id}
                  href={boardAssets.mana}
                  x={frame.x}
                  y={frame.y}
                  width={frame.size}
                  height={frame.size}
                  transform={getBoardPerspectiveImageTransform(
                    frame.x,
                    frame.y,
                    frame.size,
                    frame.size,
                  )}
                  style={getEntityImageStyle(entity.id)}
                />
              </g>
            );
          })()
        ))}

        {activeSuperManaEntities.map((entity) => (
          (() => {
            const {col, row} = getRenderedEntityCoords(entity);
            const frame = getPieceFrame(row, col);
            return (
              <g
                key={entity.id}
                transform={getInstructionAbilityDemoEntityTransform(entity)}
                style={getEntityGroupStyle(entity)}>
                {renderInstructionAbilityDemoMotion(entity)}
                <image
                  data-billboard-id={entity.id}
                  href={boardAssets.supermana}
                  x={frame.x}
                  y={frame.y}
                  width={frame.size}
                  height={frame.size}
                  transform={getBoardPerspectiveImageTransform(
                    frame.x,
                    frame.y,
                    frame.size,
                    frame.size,
                  )}
                  style={getEntityImageStyle(entity.id)}
                />
              </g>
            );
          })()
        ))}

        {scoredManaFadeSprites.map((sprite) => {
          const frame = getPieceFrame(sprite.row, sprite.col);
          return (
            <image
              key={`scored-mana-fade-${sprite.id}`}
              data-billboard-ignore="true"
              href={sprite.href}
              x={frame.x}
              y={frame.y}
              width={frame.size}
              height={frame.size}
              transform={getBoardPerspectiveImageTransform(
                frame.x,
                frame.y,
                frame.size,
                frame.size,
              )}
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
              <g
                key={item.id}
                transform={getInstructionAbilityDemoEntityTransform(item)}
                style={getEntityGroupStyle(item)}>
                {renderInstructionAbilityDemoMotion(item)}
                <image
                  data-billboard-id={item.id}
                  href={item.href}
                  x={frame.x}
                  y={frame.y}
                  width={frame.size}
                  height={frame.size}
                  transform={getBoardPerspectiveImageTransform(
                    frame.x,
                    frame.y,
                    frame.size,
                    frame.size,
                  )}
                  style={getBoardPieceImageStyle()}
                />
              </g>
            );
          })()
        ))}

        {displayedBlackMonPositions.map((mon) => renderMonPiece(mon))}

        {activeMonPositions.white.map((mon) => renderMonPiece(mon))}

        {liftedInstructionBlackDemon !== null
          ? renderMonPiece(liftedInstructionBlackDemon)
          : null}

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
          const centerX = effect.col + 0.5;
          const centerY = effect.row + 0.5;
          const progress = clamp01(effect.progress);
          const elapsedMs = ATTACK_EFFECT_DURATION_MS * progress;
          if (effect.kind === 'bomb') {
            const flameParticles = effect.particles.bombFlame ?? [];
            const smokeParticles = effect.particles.bombSmoke ?? [];
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
            const particles = effect.particles.demon ?? [];
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

          const particles = effect.particles.mystic ?? [];
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

        {potionBubbleEffectSprites.map((effect) => {
          const centerX = effect.col + 0.5;
          const centerY = effect.row + 0.5;
          const progress = clamp01(effect.progress);
          const elapsedMs = POTION_BUBBLE_EFFECT_DURATION_MS * progress;
          const ringProgress = easeOutCubic(progress);
          const ringOpacity = Math.max(0, 0.54 * (1 - progress * 1.25));
          const glowOpacity = Math.max(0, 0.22 * (1 - progress * 1.55));
          return (
            <g
              key={effect.id}
              transform={`translate(${centerX} ${centerY})`}
              pointerEvents="none"
              style={{shapeRendering: 'geometricPrecision'}}>
              <circle
                cx={0}
                cy={0}
                r={(0.3 + ringProgress * 1.15).toFixed(3)}
                fill="none"
                stroke="#B14CFF"
                strokeWidth={0.085}
                opacity={ringOpacity}
              />
              <circle
                cx={0}
                cy={0}
                r={(0.24 + ringProgress * 0.78).toFixed(3)}
                fill="#D69BFF"
                opacity={glowOpacity}
              />
              {effect.particles.map((particle, index) => {
                const localElapsedMs = elapsedMs - particle.delayMs;
                if (localElapsedMs < 0) {
                  return null;
                }
                const localProgress = clamp01(localElapsedMs / particle.durationMs);
                const traveled = easeOutCubic(localProgress);
                const fade = Math.sin(localProgress * Math.PI);
                const wobble =
                  Math.sin(localProgress * Math.PI * 2.4 + index * 0.62) *
                  particle.wobble;
                const px = particle.dx * (0.35 + traveled * 0.78) + wobble;
                const py =
                  particle.dy * (0.45 + traveled * 0.34) -
                  particle.rise * traveled;
                const radius = Math.max(
                  0.014,
                  particle.size * (0.74 + fade * 0.32),
                );
                const opacity = Math.max(
                  0,
                  particle.opacity * fade * (1 - localProgress * 0.12),
                );
                return (
                  <g
                    key={`${effect.id}-potion-bubble-${index}`}
                    transform={`translate(${px.toFixed(3)} ${py.toFixed(3)})`}
                    opacity={opacity}>
                    <circle
                      cx={0}
                      cy={0}
                      r={radius.toFixed(3)}
                      fill={particle.color}
                      opacity={0.44}
                    />
                    <circle
                      cx={0}
                      cy={0}
                      r={(radius * 0.72).toFixed(3)}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth={Math.max(0.01, radius * 0.24).toFixed(3)}
                      opacity={0.72}
                    />
                    <circle
                      cx={(-radius * 0.22).toFixed(3)}
                      cy={(-radius * 0.24).toFixed(3)}
                      r={(radius * 0.18).toFixed(3)}
                      fill="#FFFFFF"
                      opacity={0.72}
                    />
                  </g>
                );
              })}
            </g>
          );
        })}

        {displayedAbilityRangeHintTiles.map((tile, index) => (
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

        {displayedAttackIndicatorTargets.map((target) => {
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
        {pendingSpiritPushAttackIndicators.map((target) => {
          const cornerSize = 0.24;
          const left = target.col;
          const top = target.row;
          const right = target.col + 1;
          const bottom = target.row + 1;
          return (
            <g key={`pending-spirit-attack-indicator-${target.id}`} pointerEvents="none" opacity={0.92}>
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

        {displayedDemonReboundDots.map((dot, index) => (
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
        {displayedSpiritPushDots.map((dot, index) => (
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

        {showHoveredTileCenterDot && effectiveHoveredTile !== null ? (
          <circle
            cx={effectiveHoveredTile.col + 0.5}
            cy={effectiveHoveredTile.row + 0.5}
            r={0.08}
            fill={hoveredTileCenterDotColor}
            opacity={0.85}
            pointerEvents="none"
          />
        ) : null}

          {hoverTiles}
          </g>

        {files.map((label, col) => (
          (() => {
            const tileCol = isBoardPerspectiveFlipped ? BOARD_SIZE - 1 - col : col;
            const isActive =
              effectiveHoveredTile === null || effectiveHoveredTile.col === tileCol;
            return (
          <text
            key={`file-bottom-${label}`}
            className="board-coordinate-label"
            x={col + 0.5}
            y={11.34}
            textAnchor="middle"
            fill={boardColors.border}
            style={{
              ...coordTextStyle,
              opacity: isActive ? coordTextStyle.opacity : 0,
              transitionProperty: 'opacity',
              transitionDuration: isActive ? '120ms' : '300ms',
              transitionTimingFunction: 'ease',
            }}>
            {files[tileCol]}
          </text>
            );
          })()
        ))}

        {Array.from({length: BOARD_SIZE}).map((_, row) => (
          (() => {
            const tileRow = isBoardPerspectiveFlipped ? BOARD_SIZE - 1 - row : row;
            const isActive =
              effectiveHoveredTile === null || effectiveHoveredTile.row === tileRow;
            return (
          <text
            key={`rank-left-${row}`}
            className="board-coordinate-label"
            x={-0.22}
            y={row + 0.57}
            textAnchor="middle"
            fill={boardColors.border}
            style={{
              ...coordTextStyle,
              opacity: isActive ? coordTextStyle.opacity : 0,
              transitionProperty: 'opacity',
              transitionDuration: isActive ? '120ms' : '300ms',
              transitionTimingFunction: 'ease',
            }}>
            {11 - tileRow}
          </text>
            );
          })()
        ))}

            </svg>
          </ThreeDBoardSurface>

          {typeof document !== 'undefined' && itemPickupChoiceOverlay !== null
            ? createPortal(itemPickupChoiceOverlay, document.body)
            : itemPickupChoiceOverlay}

          {showThinFloatingPreview ? (
            <div ref={previewMessageBoxRef} style={thinFloatingPreviewBoxStyle}>
              <div style={previewImageSlotStyle}>
                {activePiece?.kind === 'manaPool' ? (
                  <svg
                    viewBox="0 0 1 1"
                    style={previewPoolSvgStyle}
                    shapeRendering="crispEdges"
                    aria-label="Mana pool preview">
                    <rect x={0} y={0} width={1} height={1} fill={boardColors.manaPool} />
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
                                  fill={boardColors.manaPool}
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
              {showInstructionDrainerMovementLimitNote ? (
                <span style={instructionDrainerMovementLimitNoteStyle}>
                  {INSTRUCTION_DRAINER_MOVEMENT_LIMIT_NOTE}
                </span>
              ) : null}
              {displayedMoveResourceItems.map((resource) => (
                <button
                  key={resource.id}
                  ref={(node) => {
                    moveResourceButtonRefs.current[resource.id] = node;
                  }}
                  type="button"
                  disabled={resource.isExiting === true}
                  aria-label={moveResourceInfo[resource.kind].title}
                  style={{
                    ...getMoveResourceButtonStyle(
                      isMoveResourceActive(resource.id, resource.kind),
                    ),
                    pointerEvents: resource.isExiting === true ? 'none' : undefined,
                  }}
                  onMouseEnter={() => {
                    if (resource.isExiting === true) {
                      return;
                    }
                    setHoveredMoveResourceId(resource.id);
                  }}
                  onFocus={() => {
                    if (resource.isExiting === true) {
                      return;
                    }
                    setHoveredMoveResourceId(resource.id);
                  }}
                  onBlur={() => {
                    setHoveredMoveResourceId((current) =>
                      current === resource.id ? null : current,
                    );
                  }}
                  onClick={() => {
                    if (resource.isExiting === true) {
                      return;
                    }
                    setSelectedTile(null);
                    setSelectedMoveResourceId(resource.id);
                  }}>
                  <img
                    className={
                      resource.isExiting ? 'mons-potion-resource-exit' : undefined
                    }
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
                    {playerHudResourceItems.map((resource) => (
                      <img
                        key={resource.id}
                        className={
                          resource.isExiting ? 'mons-potion-resource-exit' : undefined
                        }
                        src={moveResourceAssets[resource.kind]}
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
                      className="player-hud-undo-button"
                      aria-label="Undo last board action"
                      disabled={!canUndoBoardAction}
                        style={{
                          ...getHudResetButtonStateStyle(canUndoBoardAction),
                          ...getHudUndoButtonOffsetStyle(),
                        }}
                      onClick={undoLastBoardAction}>
                      <svg viewBox="0 0 24 24" aria-hidden="true" style={hudResetIconStyle}>
                        <path
                          d="M15.5 5L8.5 12L15.5 19"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.6}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
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
                    {canUseThreeDBoardView ? (
                      <button
                        type="button"
                        className="player-hud-3d-button"
                        aria-label={
                          isThreeDBoardViewEnabled
                            ? 'Switch to 2D board view'
                            : 'Switch to 3D board view'
                        }
                        aria-pressed={isThreeDBoardViewEnabled}
                        style={{
                          ...getHudResetButtonStateStyle(true),
                          ...getHudThreeDButtonOffsetStyle(isBoardFullscreen),
                          color: isThreeDBoardViewEnabled ? '#000000' : '#6f6f6f',
                          opacity: isThreeDBoardViewEnabled ? 1 : 0.9,
                        }}
                        onClick={() => {
                          setIsThreeDBoardViewEnabled((current) => !current);
                        }}>
                        <svg viewBox="0 0 32 24" aria-hidden="true" style={hudThreeDIconStyle}>
                          <path
                            d="M16 4.2 27.2 9.6 16 15 4.8 9.6 16 4.2Z"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            strokeLinejoin="round"
                          />
                          <path
                            d="M4.8 9.6v3.9L16 18.9l11.2-5.4V9.6M16 15v3.9"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    ) : null}
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
                    <rect x={0} y={0} width={1} height={1} fill={boardColors.manaPool} />
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
                                  fill={boardColors.manaPool}
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
