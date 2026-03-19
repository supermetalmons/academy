import type {ReactNode} from 'react';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import ResourcesSubnav from '@site/src/components/ResourcesSubnav';
import SuperMetalMonsRandomViewer from '@site/src/components/SuperMetalMonsRandomViewer';

const viewerPaddingStyle = {
  padding: '15px 0',
};

export default function ResourcesPage(): ReactNode {
  return (
    <BlankSectionPage title="Resources">
      <ResourcesSubnav active="super-metal-mons" />
      <div style={viewerPaddingStyle}>
        <SuperMetalMonsRandomViewer />
      </div>
    </BlankSectionPage>
  );
}
