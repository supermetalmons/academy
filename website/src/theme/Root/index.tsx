import type {ReactNode} from 'react';
import {SiteMusicPlayerProvider} from '@site/src/components/SiteMusicPlayer';

export default function Root({children}: {children: ReactNode}): ReactNode {
  return <SiteMusicPlayerProvider>{children}</SiteMusicPlayerProvider>;
}
