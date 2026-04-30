import type {ReactNode} from 'react';
import type {FallbackParams} from '@docusaurus/ErrorBoundary';
import SiteStatusPage from '@site/src/components/SiteStatusPage';

function getErrorDetails(error: Error): string {
  return error.stack ?? error.message;
}

export default function Error({error, tryAgain}: FallbackParams): ReactNode {
  return (
    <SiteStatusPage
      eyebrow="Site Error"
      title="Something Broke"
      message={
        <p>
          The site hit an error while loading this page. You can retry the page,
          or head back to a stable section.
        </p>
      }
      actions={[
        {label: 'Try Again', onClick: tryAgain},
        {label: 'Home', to: '/'},
        {label: 'Resources', to: '/resources'},
      ]}
      details={getErrorDetails(error)}
    />
  );
}
