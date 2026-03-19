import type {ReactNode} from 'react';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import InstructionSubnav from '@site/src/components/InstructionSubnav';

export default function InstructionLessonsPage(): ReactNode {
  return (
    <BlankSectionPage title="Instruction">
      <InstructionSubnav active="lessons" />
    </BlankSectionPage>
  );
}
