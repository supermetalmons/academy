import type {CSSProperties, ReactNode} from 'react';
import NewTopLayout from '@site/src/components/NewTopLayout';

type BlankSectionPageProps = {
  title: string;
  children?: ReactNode;
  boxClassName?: string;
};

const contentWrapStyle: CSSProperties = {
  minHeight: 'calc(100vh - 96px)',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: 'calc(1rem + 43px) 1rem 1rem',
};

const boxStyle: CSSProperties = {
  width: 'min(900px, calc(100% - 2rem))',
  minHeight: '62vh',
  backgroundColor: '#fff',
  border: '1px solid #000',
  borderRadius: 0,
  padding: '1rem',
};

const boxTitleStyle: CSSProperties = {
  margin: 0,
  color: '#000',
  fontSize: '1.7rem',
  lineHeight: 1.1,
  fontWeight: 700,
};

const boxContentStyle: CSSProperties = {
  marginTop: '1rem',
};

export default function BlankSectionPage({
  title,
  children,
  boxClassName,
}: BlankSectionPageProps): ReactNode {
  return (
    <NewTopLayout>
      <section style={contentWrapStyle}>
        <div className={boxClassName} style={boxStyle}>
          <h2 style={boxTitleStyle}>{title}</h2>
          <div style={boxContentStyle}>{children}</div>
        </div>
      </section>
    </NewTopLayout>
  );
}
