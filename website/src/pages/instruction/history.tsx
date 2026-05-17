import type {ReactNode} from 'react';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import InstructionSubnav from '@site/src/components/InstructionSubnav';

export default function InstructionHistoryPage(): ReactNode {
  return (
    <BlankSectionPage title="Instruction">
      <InstructionSubnav active="history" />
    </BlankSectionPage>
  );
}
