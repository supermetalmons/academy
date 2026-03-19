import type {ReactNode} from 'react';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import InstructionSubnav from '@site/src/components/InstructionSubnav';
import SuperMetalMonsBoard from '@site/src/components/SuperMetalMonsBoard';

export default function InstructionPage(): ReactNode {
  return (
    <BlankSectionPage title="Instruction">
      <InstructionSubnav active="basic-rules" />
      <SuperMetalMonsBoard align="left" showHoverPreview showMoveResources />
    </BlankSectionPage>
  );
}
