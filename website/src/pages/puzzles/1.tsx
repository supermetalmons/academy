import {useState, type ReactNode} from 'react';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import PuzzleTitleRow from '@site/src/components/PuzzleTitleRow';
import SuperMetalMonsBoard from '@site/src/components/SuperMetalMonsBoard';

const PUZZLE_BASE_BOARD_WIDTH_PX = 13 * 48;

export default function PuzzleOnePage(): ReactNode {
  const [hasBoardChanges, setHasBoardChanges] = useState(false);
  const [boardRenderWidth, setBoardRenderWidth] = useState(PUZZLE_BASE_BOARD_WIDTH_PX);
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
          scale={puzzlePageScale}
          boardWidthPx={boardRenderWidth}
        />
        <SuperMetalMonsBoard
          showPlayerHud
          boardPreset="puzzle1"
          showSpawnGhosts
          enableFreeTileMove
          enableHoverClickScaling={false}
          onPuzzleBoardDirtyChange={setHasBoardChanges}
          onRenderWidthChange={setBoardRenderWidth}
        />
      </section>
    </BlankSectionPage>
  );
}
