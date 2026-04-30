import type {ReactNode} from 'react';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import InstructionSubnav from '@site/src/components/InstructionSubnav';
import SuperMetalMonsBoard from '@site/src/components/SuperMetalMonsBoard';
import {useSiteBoardTheme} from '@site/src/utils/siteBoardTheme';

export default function InstructionPage(): ReactNode {
  const boardTheme = useSiteBoardTheme();

  return (
    <BlankSectionPage title="Instruction" boxClassName="instruction-board-page-no-select">
      <InstructionSubnav active="basic-rules" />
      <SuperMetalMonsBoard
        align="left"
        boardTheme={boardTheme}
        showHoverPreview
        showMoveResources
        showSpawnGhosts
        enableInstructionAbilityDemos
      />
    </BlankSectionPage>
  );
}
