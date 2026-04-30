import {useCallback, useRef, useState, type ReactNode} from 'react';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import PuzzleTitleRow from '@site/src/components/PuzzleTitleRow';
import SuperMetalMonsBoard, {
  type SuperMetalMonsBoardSnapshot,
} from '@site/src/components/SuperMetalMonsBoard';
import {useSiteBoardTheme} from '@site/src/utils/siteBoardTheme';

const PUZZLE_BASE_BOARD_WIDTH_PX = 13 * 48;
const BOMBPROOF_WHITE_DRAINER_ID = 'mon-puzzle3-5';

type ExpectedBombproofEntity = {
  col: number;
  row: number;
  carriedByDrainerId?: string;
  heldItemKind?: 'bomb';
};

const BOMBPROOF_EXPECTED_ENTITY_TILES: Record<string, ExpectedBombproofEntity> = {
  'mon-puzzle3-0': {col: 0, row: 0},
  'mon-puzzle3-1': {col: 9, row: 1},
  'mon-puzzle3-2': {col: 1, row: 2},
  'mon-puzzle3-3': {col: 9, row: 2},
  'mon-puzzle3-4': {col: 10, row: 2, heldItemKind: 'bomb'},
  [BOMBPROOF_WHITE_DRAINER_ID]: {col: 8, row: 10},
  'mon-puzzle3-6': {col: 8, row: 7},
  'mon-puzzle3-7': {col: 9, row: 10},
  'mon-puzzle3-8': {col: 9, row: 5},
  'mon-puzzle3-9': {col: 7, row: 7},
  'white-mana-puzzle3-0': {col: 4, row: 3},
  'white-mana-puzzle3-1': {col: 6, row: 7},
  'white-mana-puzzle3-2': {
    col: 8,
    row: 10,
    carriedByDrainerId: BOMBPROOF_WHITE_DRAINER_ID,
  },
  'black-mana-puzzle3-0': {col: 1, row: 1},
  'black-mana-puzzle3-1': {col: 9, row: 7},
  'black-mana-puzzle3-2': {col: 10, row: 7},
  'super-mana-puzzle3-0': {col: 6, row: 6},
};

let lastSubmittedBombproofWinningSnapshotKey: string | null = null;

function getBombproofSnapshotKey(snapshot: SuperMetalMonsBoardSnapshot): string {
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

function isBombproofSolution(snapshot: SuperMetalMonsBoardSnapshot | null): boolean {
  if (snapshot === null) {
    return false;
  }
  const entitiesById = new Map(
    snapshot.boardEntities.map((entity) => [entity.id, entity]),
  );
  const areExpectedTilesMatched = Object.entries(
    BOMBPROOF_EXPECTED_ENTITY_TILES,
  ).every(([entityId, expected]) => {
    const entity = entitiesById.get(entityId);
    return (
      entity !== undefined &&
      entity.col === expected.col &&
      entity.row === expected.row &&
      entity.carriedByDrainerId === expected.carriedByDrainerId &&
      (expected.heldItemKind === undefined ||
        entity.heldItemKind === expected.heldItemKind) &&
      entity.isScored !== true
    );
  });
  if (!areExpectedTilesMatched) {
    return false;
  }
  return (
    snapshot.faintedMonIds.length === 0 &&
    snapshot.playerScore === 2 &&
    snapshot.opponentScore === 2 &&
    snapshot.playerPotionCount === 0 &&
    snapshot.playerActiveAbilityStarAvailable === false &&
    snapshot.playerManaMoveAvailable === false
  );
}

export default function PuzzleThreePage(): ReactNode {
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
      const snapshotKey = getBombproofSnapshotKey(snapshot);
      const isSubmittedCurrent =
        lastSubmittedBombproofWinningSnapshotKey !== null &&
        lastSubmittedBombproofWinningSnapshotKey === snapshotKey;
      if (
        lastSubmittedBombproofWinningSnapshotKey !== null &&
        !isSubmittedCurrent
      ) {
        lastSubmittedBombproofWinningSnapshotKey = null;
      }
      setIsSubmittedWinningSolutionCurrent(isSubmittedCurrent);
    },
    [],
  );
  const handlePuzzleBoardStateChange = useCallback(() => {
    setBoardChangeNonce((current) => current + 1);
  }, []);
  const handleCheckSolution = useCallback(
    () => isBombproofSolution(boardSnapshotRef.current),
    [],
  );
  const handleCorrectSubmit = useCallback(() => {
    if (boardSnapshotRef.current !== null) {
      lastSubmittedBombproofWinningSnapshotKey = getBombproofSnapshotKey(
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
          puzzleId="bombproof"
          title="Bombproof"
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
          boardPreset="puzzle3"
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
