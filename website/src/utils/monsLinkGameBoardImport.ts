import {
  boardAssets,
  type BoardEntity,
  type SuperMetalMonsBoardSnapshot,
} from '@site/src/components/SuperMetalMonsBoard';
import {
  fetchMonsLinkGameMatches,
  type MonsLinkGameItem,
  type MonsLinkGameMatchPair,
  type MonsLinkMatchRecord,
} from '@site/src/utils/monsLinkAcademyClient';

type AcademyMonType = NonNullable<BoardEntity['monType']>;
type AcademySide = NonNullable<BoardEntity['side']>;

type MonsWebRuntime = {
  default: (input?: unknown) => Promise<unknown>;
  Color: {White: number; Black: number};
  Consumable: {Potion: number; Bomb: number; BombOrPotion: number};
  ItemModelKind: {
    Mon: number;
    Mana: number;
    MonWithMana: number;
    MonWithConsumable: number;
    Consumable: number;
  };
  Location: new (i: number, j: number) => {i: number; j: number};
  ManaKind: {Regular: number; Supermana: number};
  MonKind: {Demon: number; Drainer: number; Angel: number; Spirit: number; Mystic: number};
  MonsGameModel: {
    from_fen: (fen: string) => MonsWebGameModel | undefined;
  };
};

type MonsWebGameModel = {
  active_color: () => number;
  black_score: () => number;
  is_later_than: (otherFen: string) => boolean;
  item: (location: {i: number; j: number}) => MonsWebItemModel | undefined;
  white_score: () => number;
};

type MonsWebItemModel = {
  consumable?: number;
  kind: number;
  mana?: {
    color: number;
    kind: number;
  };
  mon?: {
    color: number;
    is_fainted: () => boolean;
    kind: number;
  };
};

let monsWebRuntimePromise: Promise<MonsWebRuntime> | null = null;

async function loadMonsWebRuntime(): Promise<MonsWebRuntime> {
  if (monsWebRuntimePromise !== null) {
    return monsWebRuntimePromise;
  }
  monsWebRuntimePromise = (async () => {
    // @ts-ignore - this is a vendored wasm-bindgen module loaded at runtime.
    const runtime = (await import('@site/src/vendor/mons-web/mons-web.js')) as MonsWebRuntime;
    await runtime.default('/assets/vendor/mons-web_bg.wasm');
    return runtime;
  })();
  return monsWebRuntimePromise;
}

function getMonType(runtime: MonsWebRuntime, kind: number | undefined): AcademyMonType | null {
  switch (kind) {
    case runtime.MonKind.Demon:
      return 'demon';
    case runtime.MonKind.Drainer:
      return 'drainer';
    case runtime.MonKind.Angel:
      return 'angel';
    case runtime.MonKind.Spirit:
      return 'spirit';
    case runtime.MonKind.Mystic:
      return 'mystic';
    default:
      return null;
  }
}

function getSide(runtime: MonsWebRuntime, color: number | undefined): AcademySide | null {
  if (color === runtime.Color.White) {
    return 'white';
  }
  if (color === runtime.Color.Black) {
    return 'black';
  }
  return null;
}

function nextEntityId(
  counterByKey: Record<string, number>,
  prefix: string,
  row: number,
  col: number,
): string {
  const count = counterByKey[prefix] ?? 0;
  counterByKey[prefix] = count + 1;
  return `mons-link-${prefix}-${row}-${col}-${count}`;
}

function createMonEntity(
  runtime: MonsWebRuntime,
  item: MonsWebItemModel,
  row: number,
  col: number,
  counterByKey: Record<string, number>,
): BoardEntity | null {
  const mon = item.mon;
  const side = getSide(runtime, mon?.color);
  const monType = getMonType(runtime, mon?.kind);
  if (side === null || monType === null) {
    return null;
  }
  return {
    id: nextEntityId(counterByKey, `${side}-${monType}`, row, col),
    kind: 'mon',
    col,
    row,
    side,
    monType,
    href: boardAssets[side][monType],
  };
}

function createManaEntity(
  runtime: MonsWebRuntime,
  item: MonsWebItemModel,
  row: number,
  col: number,
  counterByKey: Record<string, number>,
  carriedByDrainerId?: string,
): BoardEntity | null {
  const mana = item.mana;
  if (!mana) {
    return null;
  }
  if (mana.kind === runtime.ManaKind.Supermana) {
    return {
      id: nextEntityId(counterByKey, 'super-mana', row, col),
      kind: 'superMana',
      col,
      row,
      href: boardAssets.supermana,
      carriedByDrainerId,
    };
  }
  const isBlackMana = mana.color === runtime.Color.Black;
  return {
    id: nextEntityId(counterByKey, isBlackMana ? 'black-mana' : 'white-mana', row, col),
    kind: isBlackMana ? 'blackMana' : 'whiteMana',
    col,
    row,
    href: isBlackMana ? boardAssets.manaB : boardAssets.mana,
    carriedByDrainerId,
  };
}

function getConsumableHref(runtime: MonsWebRuntime, consumable: number | undefined): string {
  if (consumable === runtime.Consumable.Bomb) {
    return boardAssets.bomb;
  }
  if (consumable === runtime.Consumable.Potion) {
    return boardAssets.potion;
  }
  return boardAssets.bombOrPotion;
}

function decodeGameModel(
  runtime: MonsWebRuntime,
  gameModel: MonsWebGameModel,
): SuperMetalMonsBoardSnapshot {
  const boardEntities: BoardEntity[] = [];
  const faintedMonIds: string[] = [];
  const counterByKey: Record<string, number> = {};

  for (let row = 0; row < 11; row += 1) {
    for (let col = 0; col < 11; col += 1) {
      const item = gameModel.item(new runtime.Location(row, col));
      if (!item) {
        continue;
      }
      if (item.kind === runtime.ItemModelKind.Mon) {
        const monEntity = createMonEntity(runtime, item, row, col, counterByKey);
        if (monEntity !== null) {
          boardEntities.push(monEntity);
          if (item.mon?.is_fainted()) {
            faintedMonIds.push(monEntity.id);
          }
        }
        continue;
      }
      if (item.kind === runtime.ItemModelKind.Mana) {
        const manaEntity = createManaEntity(runtime, item, row, col, counterByKey);
        if (manaEntity !== null) {
          boardEntities.push(manaEntity);
        }
        continue;
      }
      if (item.kind === runtime.ItemModelKind.MonWithMana) {
        const monEntity = createMonEntity(runtime, item, row, col, counterByKey);
        if (monEntity !== null) {
          boardEntities.push(monEntity);
          if (item.mon?.is_fainted()) {
            faintedMonIds.push(monEntity.id);
          }
          const manaEntity = createManaEntity(runtime, item, row, col, counterByKey, monEntity.id);
          if (manaEntity !== null) {
            boardEntities.push(manaEntity);
          }
        }
        continue;
      }
      if (item.kind === runtime.ItemModelKind.MonWithConsumable) {
        const monEntity = createMonEntity(runtime, item, row, col, counterByKey);
        if (monEntity !== null) {
          boardEntities.push({
            ...monEntity,
            heldItemKind: 'bomb',
          });
          if (item.mon?.is_fainted()) {
            faintedMonIds.push(monEntity.id);
          }
        }
        continue;
      }
      if (item.kind === runtime.ItemModelKind.Consumable) {
        boardEntities.push({
          id: nextEntityId(counterByKey, 'item', row, col),
          kind: 'item',
          col,
          row,
          href: getConsumableHref(runtime, item.consumable),
        });
      }
    }
  }

  return {
    boardEntities,
    faintedMonIds,
    opponentPotionCount: 0,
    opponentScore: gameModel.black_score(),
    playerActiveAbilityStarAvailable: true,
    playerManaMoveAvailable: true,
    playerPotionCount: 0,
    playerScore: gameModel.white_score(),
  };
}

function pickBestMatch(
  runtime: MonsWebRuntime,
  pair: MonsLinkGameMatchPair,
): MonsLinkMatchRecord {
  if (pair.hostMatch !== null && pair.guestMatch === null) {
    return pair.hostMatch;
  }
  if (pair.hostMatch === null && pair.guestMatch !== null) {
    return pair.guestMatch;
  }
  if (pair.hostMatch === null || pair.guestMatch === null) {
    throw new Error('No saved board state was found for this mons.link game.');
  }

  const hostGame = runtime.MonsGameModel.from_fen(pair.hostMatch.fen);
  const guestGame = runtime.MonsGameModel.from_fen(pair.guestMatch.fen);
  if (hostGame && !guestGame) {
    return pair.hostMatch;
  }
  if (!hostGame && guestGame) {
    return pair.guestMatch;
  }
  if (hostGame && guestGame) {
    if (hostGame.is_later_than(pair.guestMatch.fen)) {
      return pair.hostMatch;
    }
    if (guestGame.is_later_than(pair.hostMatch.fen)) {
      return pair.guestMatch;
    }
  }

  const hostMovesLength = pair.hostMatch.flatMovesString?.length ?? 0;
  const guestMovesLength = pair.guestMatch.flatMovesString?.length ?? 0;
  return guestMovesLength > hostMovesLength ? pair.guestMatch : pair.hostMatch;
}

export async function loadMonsLinkGameBoardSnapshot(
  game: MonsLinkGameItem,
): Promise<SuperMetalMonsBoardSnapshot> {
  const [runtime, pair] = await Promise.all([
    loadMonsWebRuntime(),
    fetchMonsLinkGameMatches(game),
  ]);
  const match = pickBestMatch(runtime, pair);
  const gameModel = runtime.MonsGameModel.from_fen(match.fen);
  if (!gameModel) {
    throw new Error('Could not decode this mons.link board state.');
  }
  return decodeGameModel(runtime, gameModel);
}
