import {useState, type ReactNode} from 'react';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import PuzzleTitleRow from '@site/src/components/PuzzleTitleRow';
import SuperMetalMonsBoard from '@site/src/components/SuperMetalMonsBoard';

export default function PuzzleOnePage(): ReactNode {
  const [hasBoardChanges, setHasBoardChanges] = useState(false);
  return (
    <BlankSectionPage title="Puzzles">
      <section style={{paddingTop: '5px', paddingBottom: '20px'}}>
        <PuzzleTitleRow puzzleId="restraint" title="Restraint" isSubmitEnabled={hasBoardChanges} />
        <SuperMetalMonsBoard showPlayerHud boardPreset="puzzle1" showSpawnGhosts enableFreeTileMove enableHoverClickScaling={false} onPuzzleBoardDirtyChange={setHasBoardChanges} />
      </section>
    </BlankSectionPage>
  );
}
