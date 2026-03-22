import type {CSSProperties, ReactNode} from 'react';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import ResourcesSubnav from '@site/src/components/ResourcesSubnav';
import SuperMetalMonsBoard from '@site/src/components/SuperMetalMonsBoard';

const sandboxWrapStyle: CSSProperties = {
  width: '100%',
  paddingTop: '6px',
  paddingBottom: '20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

export default function ResourcesSandboxPage(): ReactNode {
  return (
    <BlankSectionPage title="Resources">
      <ResourcesSubnav active="sandbox" />
      <section style={sandboxWrapStyle}>
        <SuperMetalMonsBoard
          showPlayerHud
          boardPreset="default"
          showSpawnGhosts
          enableFreeTileMove
          enableHoverClickScaling={false}
        />
      </section>
    </BlankSectionPage>
  );
}
