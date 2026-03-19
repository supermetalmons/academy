import type {CSSProperties, ReactNode} from 'react';
import {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';

type NewTopLayoutProps = {
  children?: ReactNode;
};

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  margin: 0,
  backgroundColor: '#fff',
  backgroundImage: 'url("/assets/grass.png")',
  backgroundRepeat: 'repeat',
  backgroundPosition: 'top left',
  imageRendering: 'pixelated',
};

const headerBarStyle: CSSProperties = {
  width: '100%',
  backgroundColor: '#fff',
  borderBottom: '1px solid #000',
  position: 'sticky',
  top: 0,
  zIndex: 9999,
};

const logoLinkStyle: CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  width: '3.35rem',
  display: 'block',
  borderRight: '1px solid #000',
  overflow: 'hidden',
};

const logoImageStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

const headerInnerStyle: CSSProperties = {
  width: '100%',
  margin: 0,
  padding: '0.55rem 1rem',
  boxSizing: 'border-box',
  paddingLeft: '4.15rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
};

const homeLinkStyle: CSSProperties = {
  textDecoration: 'none',
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: '2.2rem',
  lineHeight: 1.05,
  color: '#000',
  fontWeight: 700,
};

const navStyle: CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
};

const buttonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  border: '1px solid #000',
  borderRadius: 0,
  backgroundColor: '#fff',
  color: '#000',
  textDecoration: 'none',
  padding: '0.27rem 0.72rem',
  fontSize: '1.05rem',
  lineHeight: 1.1,
  transition: 'transform 140ms ease, filter 140ms ease',
};

const activeButtonStyle: CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#000',
  color: '#fff',
};

const pressedButtonStyle: CSSProperties = {
  transform: 'translateY(1px) scale(0.96)',
  filter: 'brightness(0.87)',
};

const swirlStyle: CSSProperties = {
  position: 'fixed',
  right: '0.9rem',
  bottom: '0.9rem',
  fontSize: '1.1rem',
  lineHeight: 1,
  textDecoration: 'none',
};

const menuItems = [
  {label: 'Instruction', to: '/instruction'},
  {label: 'Puzzles', to: '/puzzles'},
  {label: 'Resources', to: '/resources'},
  {label: 'FAQ', to: '/faq'},
];

function isMenuItemActive(pathname: string, to: string): boolean {
  if (to === '/instruction') {
    return (
      pathname === '/instruction' ||
      pathname.startsWith('/instruction/') ||
      pathname === '/piece-details'
    );
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

function isInstructionContext(pathname: string): boolean {
  return (
    pathname === '/instruction' || pathname.startsWith('/instruction/') || pathname === '/piece-details'
  );
}

export default function NewTopLayout({children}: NewTopLayoutProps): ReactNode {
  const pathname = typeof window === 'undefined' ? '' : window.location.pathname;
  const logoSrc = isInstructionContext(pathname) ? '/assets/kingmon72.jpg' : '/assets/logoimage.jpg';
  const [pressedItem, setPressedItem] = useState<string | null>(null);

  useEffect(() => {
    setPressedItem(null);
  }, [pathname]);

  return (
    <main style={pageStyle}>
      <header style={headerBarStyle}>
        <Link to="/" aria-label="Go to home page" style={logoLinkStyle}>
          <img src={logoSrc} alt="" style={logoImageStyle} />
        </Link>
        <div style={headerInnerStyle}>
          <Link to="/" style={homeLinkStyle}>
            <h1 style={titleStyle}>❀ Mons Academy ⋆⋆⋆</h1>
          </Link>
          <nav style={navStyle} aria-label="Primary navigation">
            {menuItems.map((item) => {
              const isActive = isMenuItemActive(pathname, item.to);
              const isPressed = pressedItem === item.to;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onMouseDown={() => setPressedItem(item.to)}
                  onMouseUp={() => setPressedItem(null)}
                  onMouseLeave={() => setPressedItem(null)}
                  onTouchStart={() => setPressedItem(item.to)}
                  onTouchEnd={() => setPressedItem(null)}
                  style={{
                    ...(isActive ? activeButtonStyle : buttonStyle),
                    ...(isPressed ? pressedButtonStyle : undefined),
                  }}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      {children}
      <Link to="/main" aria-label="Go to old homepage" style={swirlStyle}>
        🌀
      </Link>
    </main>
  );
}
