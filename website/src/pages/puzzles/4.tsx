import {useState, type ReactNode} from 'react';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import PuzzleTitleRow from '@site/src/components/PuzzleTitleRow';
import SuperMetalMonsBoard from '@site/src/components/SuperMetalMonsBoard';

export default function PuzzleFourPage(): ReactNode {
  const [hasBoardChanges, setHasBoardChanges] = useState(false);
  return (
    <BlankSectionPage title="Puzzles">
      <section style={{paddingTop: '5px', paddingBottom: '20px'}}>
        <PuzzleTitleRow puzzleId="split-formation" title="Split Formation" isSubmitEnabled={hasBoardChanges} />
        <SuperMetalMonsBoard showPlayerHud boardPreset="puzzle4" showSpawnGhosts enableFreeTileMove enableHoverClickScaling={false} onPuzzleBoardDirtyChange={setHasBoardChanges} />
      </section>
    </BlankSectionPage>
  );
}
