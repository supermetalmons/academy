import type {CSSProperties, ReactNode} from 'react';
import {useState} from 'react';
import Link from '@docusaurus/Link';

type ResourcesSection = 'super-metal-mons' | 'sandbox' | 'gallery' | 'music' | 'other';

type ResourcesSubnavProps = {
  active: ResourcesSection;
};

const wrapStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  marginBottom: '0.9rem',
};

const baseButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  border: '1px solid #000',
  borderRadius: 0,
  padding: '0.27rem 0.72rem',
  fontSize: '1rem',
  lineHeight: 1.1,
  textDecoration: 'none',
  transition: 'transform 140ms ease, filter 140ms ease',
};

const inactiveButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  backgroundColor: '#fff',
  color: '#000',
};

const activeButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  backgroundColor: '#000',
  color: '#fff',
};

const pressedButtonStyle: CSSProperties = {
  transform: 'translateY(1px) scale(0.96)',
  filter: 'brightness(0.87)',
};

const labelWithIconStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.36rem',
};

const mobileLabelIconStyle: CSSProperties = {
  width: '14px',
  height: '14px',
  display: 'block',
  flexShrink: 0,
};

const monsLabel: ReactNode = (
  <span style={labelWithIconStyle}>
    <img
      src="/assets/mons/drainer.png"
      alt=""
      aria-hidden="true"
      className="section-subnav__label-icon section-subnav__label-icon--mobile section-subnav__drainer-icon"
      style={mobileLabelIconStyle}
    />
    <span className="section-subnav__label-text">Mons</span>
  </span>
);

const galleryLabel: ReactNode = (
  <span style={labelWithIconStyle}>
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="section-subnav__label-icon section-subnav__label-icon--mobile"
      style={mobileLabelIconStyle}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round">
      <rect x="3.3" y="4.2" width="17.4" height="15.6" rx="1.2" />
      <circle cx="8.1" cy="9.1" r="1.2" fill="currentColor" stroke="none" />
      <path d="M6.2 17.2l4.4-4.5 3.1 2.9 3.7-3.4 2.1 5" />
    </svg>
    <span className="section-subnav__label-text">Gallery</span>
  </span>
);

const musicLabel: ReactNode = (
  <span style={labelWithIconStyle}>
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="section-subnav__label-icon section-subnav__label-icon--mobile"
      style={mobileLabelIconStyle}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M9 18V5.4l10-1.8v12.6" />
      <circle cx="6.6" cy="18.2" r="2.4" />
      <circle cx="16.6" cy="16.2" r="2.4" />
    </svg>
    <span className="section-subnav__label-text">Tunes</span>
  </span>
);

const sandboxLabel: ReactNode = (
  <span style={labelWithIconStyle}>
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="section-subnav__label-icon section-subnav__label-icon--mobile"
      style={mobileLabelIconStyle}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="square"
      strokeLinejoin="miter">
      <rect x="2.5" y="2.5" width="19" height="19" />
      <line x1="8.83" y1="2.5" x2="8.83" y2="21.5" />
      <line x1="15.17" y1="2.5" x2="15.17" y2="21.5" />
      <line x1="2.5" y1="8.83" x2="21.5" y2="8.83" />
      <line x1="2.5" y1="15.17" x2="21.5" y2="15.17" />
      <rect x="8.83" y="8.83" width="6.34" height="6.34" fill="currentColor" stroke="none" />
    </svg>
    <span className="section-subnav__label-text">Sandbox</span>
  </span>
);

const linksLabel: ReactNode = (
  <span style={labelWithIconStyle}>
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="section-subnav__label-icon section-subnav__label-icon--mobile"
      style={mobileLabelIconStyle}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M9.2 8.5 6 11.7a3.5 3.5 0 1 0 5 5l3.2-3.2" />
      <path d="m14.8 15.5 3.2-3.2a3.5 3.5 0 1 0-5-5L9.8 10.3" />
    </svg>
    <span className="section-subnav__label-text">Links</span>
  </span>
);

const items: Array<{key: ResourcesSection; label: ReactNode; to: string}> = [
  {key: 'super-metal-mons', label: monsLabel, to: '/resources'},
  {key: 'sandbox', label: sandboxLabel, to: '/resources/sandbox'},
  {key: 'gallery', label: galleryLabel, to: '/resources/gallery'},
  {key: 'music', label: musicLabel, to: '/resources/music'},
  {key: 'other', label: linksLabel, to: '/resources/links'},
];

export default function ResourcesSubnav({active}: ResourcesSubnavProps): ReactNode {
  const [pressedItem, setPressedItem] = useState<ResourcesSection | null>(null);

  return (
    <nav aria-label="Resources sections" style={wrapStyle} className="section-subnav">
      {items.map((item) => {
        const isPressed = pressedItem === item.key;
        const isActive = item.key === active;
        return (
          <Link
            key={item.key}
            to={item.to}
            className={`section-subnav__tab${isActive ? ' section-subnav__tab--active' : ''}`}
            onMouseDown={() => setPressedItem(item.key)}
            onMouseUp={() => setPressedItem(null)}
            onMouseLeave={() => setPressedItem(null)}
            onTouchStart={() => setPressedItem(item.key)}
            onTouchEnd={() => setPressedItem(null)}
            style={{
              ...(isActive ? activeButtonStyle : inactiveButtonStyle),
              ...(isPressed ? pressedButtonStyle : undefined),
            }}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
