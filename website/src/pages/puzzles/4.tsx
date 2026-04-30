import {useCallback, useState, type ReactNode} from 'react';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import PuzzleTitleRow from '@site/src/components/PuzzleTitleRow';
import SuperMetalMonsBoard from '@site/src/components/SuperMetalMonsBoard';
import {useSiteBoardTheme} from '@site/src/utils/siteBoardTheme';

const PUZZLE_BASE_BOARD_WIDTH_PX = 13 * 48;

export default function PuzzleFourPage(): ReactNode {
  const boardTheme = useSiteBoardTheme();
  const [hasBoardChanges, setHasBoardChanges] = useState(false);
  const [boardChangeNonce, setBoardChangeNonce] = useState(0);
  const [boardRenderWidth, setBoardRenderWidth] = useState(PUZZLE_BASE_BOARD_WIDTH_PX);
  const handlePuzzleBoardStateChange = useCallback(() => {
    setBoardChangeNonce((current) => current + 1);
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
          puzzleId="split-formation"
          title="Split Formation"
          isSubmitEnabled={hasBoardChanges}
          incorrectSubmitLabel="coming soon..."
          submitResetKey={boardChangeNonce}
          scale={puzzlePageScale}
          boardWidthPx={boardRenderWidth}
        />
        <SuperMetalMonsBoard
          boardTheme={boardTheme}
          showPlayerHud
          boardPreset="puzzle4"
          showSpawnGhosts
          enableFreeTileMove
          enableHoverClickScaling={false}
          onPuzzleBoardDirtyChange={setHasBoardChanges}
          onPuzzleBoardStateChange={handlePuzzleBoardStateChange}
          onRenderWidthChange={setBoardRenderWidth}
        />
      </section>
    </BlankSectionPage>
  );
}
