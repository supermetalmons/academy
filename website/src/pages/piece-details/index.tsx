import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import InstructionSubnav from '@site/src/components/InstructionSubnav';
import PieceDetailsGallery from '@site/src/components/PieceDetailsGallery';
import {pieceDetailsBoardDiagram} from '@site/src/data/pieceDetails';

const contentStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '0.75rem',
  paddingBottom: '100px',
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

const boardDiagramFrameStyle = {
  width: 'min(100%, 620px)',
  aspectRatio: '960 / 895',
  alignSelf: 'center',
  borderRadius: '8px',
  backgroundColor: '#d6d6d6',
  overflow: 'hidden',
};

const boardDiagramStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'contain' as const,
  display: 'block',
  imageRendering: 'auto' as const,
};

export default function PieceDetailsPage(): ReactNode {
  return (
    <BlankSectionPage title="Instruction">
      <div style={contentStyle}>
        <InstructionSubnav active="basic-rules" />
        <Link to="/instruction" style={backLinkStyle}>
          <span aria-hidden="true" style={backArrowStyle}>←</span>
          <span style={backTextStyle}>back to board</span>
        </Link>
        <div style={boardDiagramFrameStyle}>
          <img
            src={pieceDetailsBoardDiagram}
            alt="Super Metal Mons board diagram"
            decoding="async"
            style={boardDiagramStyle}
          />
        </div>
        <PieceDetailsGallery />
      </div>
    </BlankSectionPage>
  );
}
