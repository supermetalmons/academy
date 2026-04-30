import type {ReactNode} from 'react';
import type {FallbackParams} from '@docusaurus/ErrorBoundary';
import {SiteStatusCard} from '@site/src/components/SiteStatusPage';

function getErrorDetails(error: Error): string {
  return error.stack ?? error.message;
}

export default function ErrorPageContent({
  error,
  tryAgain,
}: FallbackParams): ReactNode {
  return (
    <SiteStatusCard
      eyebrow="Site Error"
      title="Something Broke"
      message={
        <p>
          This section hit an error while rendering. Try again, or move back to
          another part of the Academy.
        </p>
      }
      actions={[
        {label: 'Try Again', onClick: tryAgain},
        {label: 'Home', to: '/'},
      ]}
      details={getErrorDetails(error)}
    />
  );
}
