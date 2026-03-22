import type {CSSProperties, ReactNode} from 'react';
import {useState} from 'react';
import Link from '@docusaurus/Link';

type InstructionSection = 'basic-rules' | 'video-tutorial' | 'lessons' | 'manual';

type InstructionSubnavProps = {
  active: InstructionSection;
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
  gap: '0.38rem',
};

const labelIconStyle: CSSProperties = {
  width: '14px',
  height: '14px',
  display: 'block',
  flexShrink: 0,
};

const videoIconStyle: CSSProperties = {
  ...labelIconStyle,
  width: '17px',
  height: '17px',
};

const lessonsIconStyle: CSSProperties = {
  ...labelIconStyle,
  width: '16px',
  height: '16px',
};

const manualIconStyle: CSSProperties = {
  ...labelIconStyle,
  width: '19px',
  height: '15px',
  objectFit: 'contain',
  imageRendering: 'auto',
};

const basicRulesLabel: ReactNode = (
  <span style={labelWithIconStyle}>
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={labelIconStyle}
      className="section-subnav__label-icon"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="square"
      strokeLinejoin="miter">
      <rect x="2" y="2" width="20" height="20" />
      <line x1="8.67" y1="2" x2="8.67" y2="22" />
      <line x1="15.33" y1="2" x2="15.33" y2="22" />
      <line x1="2" y1="8.67" x2="22" y2="8.67" />
      <line x1="2" y1="15.33" x2="22" y2="15.33" />

      <rect x="2" y="2" width="6.67" height="6.67" fill="currentColor" stroke="none" />
      <rect x="15.33" y="2" width="6.67" height="6.67" fill="currentColor" stroke="none" />
      <rect x="8.67" y="8.67" width="6.67" height="6.67" fill="currentColor" stroke="none" />
      <rect x="2" y="15.33" width="6.67" height="6.67" fill="currentColor" stroke="none" />
      <rect x="15.33" y="15.33" width="6.67" height="6.67" fill="currentColor" stroke="none" />
    </svg>
    <span className="section-subnav__label-text">Basic Rules</span>
  </span>
);

const videoTutorialLabel: ReactNode = (
  <span style={labelWithIconStyle}>
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={videoIconStyle}
      className="section-subnav__label-icon"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="12" r="9.2" />
      <path d="M8.4 6.9v10.2L17 12z" fill="currentColor" stroke="none" />
    </svg>
    <span className="section-subnav__label-text">Videos</span>
  </span>
);

const lessonsLabel = (isActive: boolean): ReactNode => {
  const pageColor = isActive ? '#fff' : '#000';
  const detailColor = isActive ? '#000' : '#fff';
  return (
    <span style={labelWithIconStyle}>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        style={lessonsIconStyle}
        className="section-subnav__label-icon"
        fill="none"
        stroke="none"
        strokeLinecap="round"
        strokeLinejoin="round">
        <rect x="3.1" y="2.3" width="13.8" height="19.4" rx="0.8" fill={pageColor} />
        <line x1="6.2" y1="7.5" x2="13.9" y2="7.5" stroke={detailColor} strokeWidth="1.35" />
        <line x1="6.2" y1="10.9" x2="13.9" y2="10.9" stroke={detailColor} strokeWidth="1.35" />
        <path d="m13.9 13.3 4.8-4.8 2.2 2.2-4.8 4.8-3.1.8z" fill={detailColor} />
        <path d="m18.7 8.5 1.1-1.1 2.2 2.2-1.1 1.1z" fill={pageColor} />
      </svg>
      <span className="section-subnav__label-text">Lessons</span>
    </span>
  );
};

const manualLabel = (isActive: boolean): ReactNode => (
  <span style={labelWithIconStyle}>
    <img
      src="/assets/171322.png"
      alt=""
      aria-hidden="true"
      className="section-subnav__label-icon"
      style={{
        ...manualIconStyle,
        filter: isActive ? 'invert(1)' : 'none',
      }}
    />
    <span className="section-subnav__label-text">Manual</span>
  </span>
);

const items: Array<{key: InstructionSection; label: (isActive: boolean) => ReactNode; to: string}> = [
  {key: 'basic-rules', label: () => basicRulesLabel, to: '/instruction'},
  {key: 'video-tutorial', label: () => videoTutorialLabel, to: '/instruction/video-tutorial'},
  {key: 'lessons', label: lessonsLabel, to: '/instruction/lessons'},
  {key: 'manual', label: manualLabel, to: '/instruction/manual'},
];

export default function InstructionSubnav({active}: InstructionSubnavProps): ReactNode {
  const [pressedItem, setPressedItem] = useState<InstructionSection | null>(null);

  return (
    <nav aria-label="Instruction sections" style={wrapStyle} className="section-subnav">
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
            {item.label(isActive)}
          </Link>
        );
      })}
    </nav>
  );
}
