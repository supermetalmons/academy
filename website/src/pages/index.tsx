import type {CSSProperties, ReactNode} from 'react';
import Link from '@docusaurus/Link';

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
};

const headerInnerStyle: CSSProperties = {
  width: 'min(1120px, calc(100% - 2rem))',
  margin: '0 auto',
  padding: '0.35rem 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
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
  {label: 'Lessons', to: '/docs/intro/overview'},
  {label: 'Puzzles', to: '/docs/puzzles/overview'},
  {label: 'Resources', to: '/docs/resources/overview'},
  {label: 'FAQ', to: '/docs/faq/super-metal-mons-faq'},
];

export default function Home(): ReactNode {
  return (
    <main style={pageStyle}>
      <header style={headerBarStyle}>
        <div style={headerInnerStyle}>
          <h1 style={titleStyle}>Mons Academy</h1>
          <nav style={navStyle} aria-label="Primary navigation">
            {menuItems.map((item) => (
              <Link key={item.label} to={item.to} style={buttonStyle}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <Link to="/main" aria-label="Go to old homepage" style={swirlStyle}>
        🌀
      </Link>
    </main>
  );
}
