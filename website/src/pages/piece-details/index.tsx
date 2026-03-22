import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import InstructionSubnav from '@site/src/components/InstructionSubnav';
import PieceDetailsGallery from '@site/src/components/PieceDetailsGallery';

const contentStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '0.75rem',
};

const backLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  color: '#0000EE',
  textDecoration: 'none',
  fontSize: '0.95rem',
  lineHeight: 1.2,
  width: 'fit-content',
};

const backArrowStyle = {
  textDecoration: 'none',
};

const backTextStyle = {
  textDecoration: 'underline',
  fontWeight: 700,
};

export default function PieceDetailsPage(): ReactNode {
  return (
    <BlankSectionPage title="Instruction">
      <div style={contentStyle}>
        <InstructionSubnav active="basic-rules" />
        <Link to="/instruction" style={backLinkStyle}>
          <span aria-hidden="true" style={backArrowStyle}>←</span>
          <span style={backTextStyle}>↑ back to board</span>
        </Link>
        <PieceDetailsGallery />
      </div>
    </BlankSectionPage>
  );
}
