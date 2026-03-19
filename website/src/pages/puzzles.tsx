import type {ReactNode} from 'react';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import SuperMetalMonsBoard from '@site/src/components/SuperMetalMonsBoard';

export default function PuzzlesPage(): ReactNode {
  return (
    <BlankSectionPage title="Puzzles">
      <SuperMetalMonsBoard />
    </BlankSectionPage>
  );
}
