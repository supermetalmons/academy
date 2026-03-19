import type {ReactNode} from 'react';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import ResourcesSubnav from '@site/src/components/ResourcesSubnav';

export default function ResourcesOtherPage(): ReactNode {
  return (
    <BlankSectionPage title="Resources">
      <ResourcesSubnav active="other" />
    </BlankSectionPage>
  );
}
