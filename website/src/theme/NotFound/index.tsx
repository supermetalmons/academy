import type {ReactNode} from 'react';
import {PageMetadata} from '@docusaurus/theme-common';
import {HomeExperience} from '@site/src/pages';

const notFoundWelcomeStyle = {
  display: 'grid',
  gap: '0.3rem',
} as const;

const notFoundTitleStyle = {
  fontWeight: 900,
} as const;

export default function NotFound(): ReactNode {
  return (
    <>
      <PageMetadata title="Page Not Found" />
      <HomeExperience
        welcomeContent={
          <span style={notFoundWelcomeStyle}>
            <strong style={notFoundTitleStyle}>Page Not Found</strong>
            <span>We could not find what you were looking for.</span>
          </span>
        }
      />
    </>
  );
}
