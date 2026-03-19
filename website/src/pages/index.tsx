import type {CSSProperties, ReactNode} from 'react';
import Link from '@docusaurus/Link';

const pageStyle: CSSProperties = {
  backgroundColor: '#fff',
  backgroundImage: 'url("/assets/grass.png")',
  backgroundRepeat: 'repeat',
  backgroundPosition: 'top left',
  backgroundSize: '700px',
  imageRendering: 'pixelated',
  minHeight: '100vh',
  paddingTop: 0,
};

const topBarStyle: CSSProperties = {
  width: '100%',
  backgroundColor: '#fff',
};

const topRowStyle: CSSProperties = {
  width: 'min(1080px, calc(100% - 2rem))',
  margin: '0 auto',
  padding: '0.2rem 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
};

const headingStyle: CSSProperties = {
  margin: 0,
  fontSize: '2.375rem',
  fontWeight: 600,
  color: '#000',
  lineHeight: 1.1,
};

const navStyle: CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
};

const buttonStyle: CSSProperties = {
  border: '1px solid #000',
  borderRadius: 0,
  backgroundColor: '#fff',
  color: '#000',
  textDecoration: 'none',
  padding: '0.27rem 0.72rem',
  fontSize: '1.05rem',
  lineHeight: 1.1,
  display: 'inline-flex',
  alignItems: 'center',
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
      <div style={topBarStyle}>
        <section style={topRowStyle}>
          <h1 style={headingStyle}>Mons Academy</h1>
          <nav style={navStyle} aria-label="Primary navigation">
            {menuItems.map((item) => (
              <Link key={item.label} to={item.to} style={buttonStyle}>
                {item.label}
              </Link>
            ))}
          </nav>
        </section>
      </div>
      <Link to="/main" aria-label="Go to old site" style={swirlStyle}>
        🌀
      </Link>
    </main>
  );
}
