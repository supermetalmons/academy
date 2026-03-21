import type {CSSProperties, ReactNode} from 'react';
import {useState} from 'react';
import Link from '@docusaurus/Link';

type ResourcesSection = 'super-metal-mons' | 'gallery' | 'other';

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
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="section-subnav__label-icon section-subnav__label-icon--mobile"
      style={mobileLabelIconStyle}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="12.4" r="7.3" />
      <circle cx="9.1" cy="11.3" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="14.9" cy="11.3" r="0.8" fill="currentColor" stroke="none" />
      <path d="M8.6 15.1c1 .9 2.1 1.4 3.4 1.4s2.4-.5 3.4-1.4" />
    </svg>
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
  {key: 'gallery', label: galleryLabel, to: '/resources/gallery'},
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
