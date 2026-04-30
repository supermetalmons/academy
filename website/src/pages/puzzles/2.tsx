import {useCallback, useRef, useState, type ReactNode} from 'react';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import PuzzleTitleRow from '@site/src/components/PuzzleTitleRow';
import SuperMetalMonsBoard, {
  type SuperMetalMonsBoardSnapshot,
} from '@site/src/components/SuperMetalMonsBoard';
import {useSiteBoardTheme} from '@site/src/utils/siteBoardTheme';

const PUZZLE_BASE_BOARD_WIDTH_PX = 13 * 48;
const CAGE_MATCH_BLACK_ANGEL_ID = 'mon-puzzle2-1';
const CAGE_MATCH_BLACK_DRAINER_ID = 'mon-puzzle2-3';
const CAGE_MATCH_WHITE_DRAINER_ID = 'mon-puzzle2-5';

type ExpectedCageMatchEntity = {
  col: number;
  row: number;
  carriedByDrainerId?: string;
};

const CAGE_MATCH_EXPECTED_ENTITY_TILES: Record<string, ExpectedCageMatchEntity> = {
  'mon-puzzle2-0': {col: 10, row: 0},
  [CAGE_MATCH_BLACK_ANGEL_ID]: {col: 6, row: 0},
  'mon-puzzle2-2': {col: 2, row: 2},
  [CAGE_MATCH_BLACK_DRAINER_ID]: {col: 5, row: 0},
  'mon-puzzle2-4': {col: 8, row: 2},
  [CAGE_MATCH_WHITE_DRAINER_ID]: {col: 9, row: 1},
  'mon-puzzle2-6': {col: 10, row: 1},
  'mon-puzzle2-7': {col: 4, row: 2},
  'mon-puzzle2-8': {col: 9, row: 0},
  'mon-puzzle2-9': {col: 4, row: 3},
  'white-mana-puzzle2-0': {col: 7, row: 3},
  'white-mana-puzzle2-1': {col: 8, row: 1},
  'black-mana-puzzle2-0': {
    col: 9,
    row: 1,
    carriedByDrainerId: CAGE_MATCH_WHITE_DRAINER_ID,
  },
  'black-mana-puzzle2-1': {col: 5, row: 4},
  'super-mana-puzzle2-0': {col: 5, row: 5},
};

let lastSubmittedCageMatchWinningSnapshotKey: string | null = null;

function getCageMatchSnapshotKey(snapshot: SuperMetalMonsBoardSnapshot): string {
  return JSON.stringify({
    boardEntities: snapshot.boardEntities
      .map((entity) => ({
        carriedByDrainerId: entity.carriedByDrainerId,
        col: entity.col,
        heldItemKind: entity.heldItemKind,
        id: entity.id,
        isScored: entity.isScored,
        kind: entity.kind,
        monType: entity.monType,
        row: entity.row,
        side: entity.side,
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    faintedMonIds: [...snapshot.faintedMonIds].sort(),
    opponentPotionCount: snapshot.opponentPotionCount,
    opponentScore: snapshot.opponentScore,
    playerActiveAbilityStarAvailable: snapshot.playerActiveAbilityStarAvailable,
    playerManaMoveAvailable: snapshot.playerManaMoveAvailable,
    playerPotionCount: snapshot.playerPotionCount,
    playerScore: snapshot.playerScore,
  });
}

function isCageMatchSolution(snapshot: SuperMetalMonsBoardSnapshot | null): boolean {
  if (snapshot === null) {
    return false;
  }
  const entitiesById = new Map(
    snapshot.boardEntities.map((entity) => [entity.id, entity]),
  );
  const areExpectedTilesMatched = Object.entries(
    CAGE_MATCH_EXPECTED_ENTITY_TILES,
  ).every(([entityId, expected]) => {
    const entity = entitiesById.get(entityId);
    return (
      entity !== undefined &&
      entity.col === expected.col &&
      entity.row === expected.row &&
      entity.carriedByDrainerId === expected.carriedByDrainerId &&
      entity.isScored !== true
    );
  });
  if (!areExpectedTilesMatched) {
    return false;
  }
  const faintedMonIds = new Set(snapshot.faintedMonIds);
  return (
    faintedMonIds.size === 2 &&
    faintedMonIds.has(CAGE_MATCH_BLACK_ANGEL_ID) &&
    faintedMonIds.has(CAGE_MATCH_BLACK_DRAINER_ID) &&
    snapshot.playerScore === 3 &&
    snapshot.opponentScore === 3 &&
    snapshot.playerPotionCount === 0 &&
    snapshot.playerActiveAbilityStarAvailable === false &&
    snapshot.playerManaMoveAvailable === false
  );
}

export default function PuzzleTwoPage(): ReactNode {
  const boardTheme = useSiteBoardTheme();
  const [hasBoardChanges, setHasBoardChanges] = useState(false);
  const [boardChangeNonce, setBoardChangeNonce] = useState(0);
  const [boardRenderWidth, setBoardRenderWidth] = useState(PUZZLE_BASE_BOARD_WIDTH_PX);
  const [winPulseNonce, setWinPulseNonce] = useState(0);
  const [
    isSubmittedWinningSolutionCurrent,
    setIsSubmittedWinningSolutionCurrent,
  ] = useState(false);
  const boardSnapshotRef = useRef<SuperMetalMonsBoardSnapshot | null>(null);
  const handlePuzzleBoardSnapshotChange = useCallback(
    (snapshot: SuperMetalMonsBoardSnapshot) => {
      boardSnapshotRef.current = snapshot;
      const snapshotKey = getCageMatchSnapshotKey(snapshot);
      const isSubmittedCurrent =
        lastSubmittedCageMatchWinningSnapshotKey !== null &&
        lastSubmittedCageMatchWinningSnapshotKey === snapshotKey;
      if (
        lastSubmittedCageMatchWinningSnapshotKey !== null &&
        !isSubmittedCurrent
      ) {
        lastSubmittedCageMatchWinningSnapshotKey = null;
      }
      setIsSubmittedWinningSolutionCurrent(isSubmittedCurrent);
    },
    [],
  );
  const handlePuzzleBoardStateChange = useCallback(() => {
    setBoardChangeNonce((current) => current + 1);
  }, []);
  const handleCheckSolution = useCallback(
    () => isCageMatchSolution(boardSnapshotRef.current),
    [],
  );
  const handleCorrectSubmit = useCallback(() => {
    if (boardSnapshotRef.current !== null) {
      lastSubmittedCageMatchWinningSnapshotKey = getCageMatchSnapshotKey(
        boardSnapshotRef.current,
      );
      setIsSubmittedWinningSolutionCurrent(true);
    }
    setWinPulseNonce((current) => current + 1);
  }, []);
  const puzzlePageScale = Math.max(
    0.22,
    Math.min(1, boardRenderWidth / PUZZLE_BASE_BOARD_WIDTH_PX),
  );
  return (
    <BlankSectionPage title="Puzzles">
      <section
        style={{
          width: '100%',
          paddingTop: `${Math.max(2, Math.round(5 * puzzlePageScale))}px`,
          paddingBottom: `${Math.max(8, Math.round(20 * puzzlePageScale))}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
        <PuzzleTitleRow
          puzzleId="cage-match"
          title="Cage Match"
          isSubmitEnabled={hasBoardChanges}
          isSubmittedWinningSolutionCurrent={isSubmittedWinningSolutionCurrent}
          checkSolution={handleCheckSolution}
          onCorrectSubmit={handleCorrectSubmit}
          submitResetKey={boardChangeNonce}
          scale={puzzlePageScale}
          boardWidthPx={boardRenderWidth}
        />
        <SuperMetalMonsBoard
          boardTheme={boardTheme}
          showPlayerHud
          boardPreset="puzzle2"
          showSpawnGhosts
          enableFreeTileMove
          enableHoverClickScaling={false}
          onPuzzleBoardDirtyChange={setHasBoardChanges}
          onPuzzleBoardSnapshotChange={handlePuzzleBoardSnapshotChange}
          onPuzzleBoardStateChange={handlePuzzleBoardStateChange}
          onRenderWidthChange={setBoardRenderWidth}
          winningSolutionPulseTrigger={winPulseNonce}
        />
      </section>
    </BlankSectionPage>
  );
}
