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

const items: Array<{key: ResourcesSection; label: string; to: string}> = [
  {key: 'super-metal-mons', label: 'Mons', to: '/resources'},
  {key: 'gallery', label: 'Gallery', to: '/resources/gallery'},
  {key: 'other', label: 'Links', to: '/resources/links'},
];

export default function ResourcesSubnav({active}: ResourcesSubnavProps): ReactNode {
  const [pressedItem, setPressedItem] = useState<ResourcesSection | null>(null);

  return (
    <nav aria-label="Resources sections" style={wrapStyle}>
      {items.map((item) => {
        const isPressed = pressedItem === item.key;
        return (
          <Link
            key={item.key}
            to={item.to}
            onMouseDown={() => setPressedItem(item.key)}
            onMouseUp={() => setPressedItem(null)}
            onMouseLeave={() => setPressedItem(null)}
            onTouchStart={() => setPressedItem(item.key)}
            onTouchEnd={() => setPressedItem(null)}
            style={{
              ...(item.key === active ? activeButtonStyle : inactiveButtonStyle),
              ...(isPressed ? pressedButtonStyle : undefined),
            }}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
