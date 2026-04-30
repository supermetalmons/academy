import {useCallback, useRef, useState, type ReactNode} from 'react';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import PuzzleTitleRow from '@site/src/components/PuzzleTitleRow';
import SuperMetalMonsBoard, {
  type SuperMetalMonsBoardSnapshot,
} from '@site/src/components/SuperMetalMonsBoard';
import {useSiteBoardTheme} from '@site/src/utils/siteBoardTheme';

const PUZZLE_BASE_BOARD_WIDTH_PX = 13 * 48;
const RESTRAINT_BLACK_SPIRIT_ID = 'mon-puzzle1-3';
const RESTRAINT_EXPECTED_ENTITY_TILES: Record<string, {col: number; row: number}> = {
  'mon-puzzle1-0': {col: 0, row: 0},
  'mon-puzzle1-1': {col: 5, row: 1},
  'mon-puzzle1-2': {col: 4, row: 1},
  [RESTRAINT_BLACK_SPIRIT_ID]: {col: 4, row: 0},
  'mon-puzzle1-4': {col: 8, row: 4},
  'mon-puzzle1-5': {col: 3, row: 3},
  'mon-puzzle1-6': {col: 1, row: 1},
  'mon-puzzle1-7': {col: 1, row: 2},
  'mon-puzzle1-8': {col: 3, row: 2},
  'mon-puzzle1-9': {col: 1, row: 0},
  'white-mana-puzzle1-0': {col: 5, row: 2},
  'white-mana-puzzle1-1': {col: 3, row: 4},
  'white-mana-puzzle1-2': {col: 8, row: 8},
  'white-mana-puzzle1-3': {col: 8, row: 7},
  'black-mana-puzzle1-0': {col: 2, row: 2},
  'black-mana-puzzle1-1': {col: 4, row: 3},
};

let lastSubmittedRestraintWinningSnapshotKey: string | null = null;

function getRestraintSnapshotKey(snapshot: SuperMetalMonsBoardSnapshot): string {
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

function isRestraintSolution(snapshot: SuperMetalMonsBoardSnapshot | null): boolean {
  if (snapshot === null) {
    return false;
  }
  const entitiesById = new Map(
    snapshot.boardEntities.map((entity) => [entity.id, entity]),
  );
  const areExpectedTilesMatched = Object.entries(RESTRAINT_EXPECTED_ENTITY_TILES).every(
    ([entityId, tile]) => {
      const entity = entitiesById.get(entityId);
      return (
        entity !== undefined &&
        entity.col === tile.col &&
        entity.row === tile.row &&
        entity.carriedByDrainerId === undefined &&
        entity.isScored !== true
      );
    },
  );
  if (!areExpectedTilesMatched) {
    return false;
  }
  const faintedMonIds = new Set(snapshot.faintedMonIds);
  return (
    faintedMonIds.size === 1 &&
    faintedMonIds.has(RESTRAINT_BLACK_SPIRIT_ID) &&
    snapshot.playerScore === 3 &&
    snapshot.opponentScore === 4 &&
    snapshot.playerPotionCount === 0 &&
    snapshot.playerActiveAbilityStarAvailable === false &&
    snapshot.playerManaMoveAvailable === false
  );
}

export default function PuzzleOnePage(): ReactNode {
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
      const snapshotKey = getRestraintSnapshotKey(snapshot);
      const isSubmittedCurrent =
        lastSubmittedRestraintWinningSnapshotKey !== null &&
        lastSubmittedRestraintWinningSnapshotKey === snapshotKey;
      if (
        lastSubmittedRestraintWinningSnapshotKey !== null &&
        !isSubmittedCurrent
      ) {
        lastSubmittedRestraintWinningSnapshotKey = null;
      }
      setIsSubmittedWinningSolutionCurrent(isSubmittedCurrent);
    },
    [],
  );
  const handlePuzzleBoardStateChange = useCallback(() => {
    setBoardChangeNonce((current) => current + 1);
  }, []);
  const handleCheckSolution = useCallback(
    () => isRestraintSolution(boardSnapshotRef.current),
    [],
  );
  const handleCorrectSubmit = useCallback(() => {
    if (boardSnapshotRef.current !== null) {
      lastSubmittedRestraintWinningSnapshotKey = getRestraintSnapshotKey(
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
          puzzleId="restraint"
          title="Restraint"
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
          boardPreset="puzzle1"
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
