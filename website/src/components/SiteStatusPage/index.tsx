import type {CSSProperties, ReactNode} from 'react';
import Link from '@docusaurus/Link';
import NewTopLayout from '@site/src/components/NewTopLayout';

type SiteStatusAction = {
  label: string;
  to?: string;
  onClick?: () => void;
};

type SiteStatusCardProps = {
  eyebrow: string;
  title: string;
  message: ReactNode;
  actions?: SiteStatusAction[];
  details?: string;
};

type SiteStatusPageProps = SiteStatusCardProps;

const wrapStyle: CSSProperties = {
  minHeight: 'calc(100vh - 96px)',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: 'calc(1rem + 43px) 1rem 1rem',
  boxSizing: 'border-box',
};

const cardStyle: CSSProperties = {
  width: 'min(900px, calc(100% - 2rem))',
  minHeight: '46vh',
  backgroundColor: '#fff',
  border: '1px solid #000',
  borderRadius: 0,
  padding: '1rem',
  boxSizing: 'border-box',
  color: '#000',
};

const eyebrowStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.92rem',
  lineHeight: 1.1,
  fontWeight: 700,
  letterSpacing: 0,
  opacity: 0.62,
};

const titleStyle: CSSProperties = {
  margin: '0.34rem 0 0',
  fontSize: 'clamp(2rem, 6vw, 4.7rem)',
  lineHeight: 0.95,
  fontWeight: 900,
  letterSpacing: 0,
};

const messageStyle: CSSProperties = {
  margin: '0.95rem 0 0',
  maxWidth: '58ch',
  fontSize: '1.04rem',
  lineHeight: 1.45,
};

const actionsStyle: CSSProperties = {
  marginTop: '1rem',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
};

const actionStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid #000',
  borderRadius: 0,
  backgroundColor: '#fff',
  color: '#000',
  textDecoration: 'none',
  padding: '0.32rem 0.72rem',
  fontSize: '1rem',
  lineHeight: 1.1,
  cursor: 'pointer',
  font: 'inherit',
  userSelect: 'none',
  WebkitUserSelect: 'none',
};

const detailsStyle: CSSProperties = {
  marginTop: '1.1rem',
  borderTop: '1px solid #000',
  paddingTop: '0.75rem',
  fontSize: '0.82rem',
  lineHeight: 1.35,
  whiteSpace: 'pre-wrap',
  opacity: 0.66,
  maxHeight: '12rem',
  overflow: 'auto',
};

function SiteStatusActionButton({action}: {action: SiteStatusAction}): ReactNode {
  if (action.to !== undefined) {
    return (
      <Link className="mons-box-button" to={action.to} style={actionStyle}>
        {action.label}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className="mons-box-button"
      style={actionStyle}
      onClick={action.onClick}>
      {action.label}
    </button>
  );
}

export function SiteStatusCard({
  eyebrow,
  title,
  message,
  actions = [],
  details,
}: SiteStatusCardProps): ReactNode {
  return (
    <section style={wrapStyle}>
      <article style={cardStyle}>
        <p style={eyebrowStyle}>{eyebrow}</p>
        <h1 style={titleStyle}>{title}</h1>
        <div style={messageStyle}>{message}</div>
        {actions.length > 0 ? (
          <div style={actionsStyle}>
            {actions.map((action) => (
              <SiteStatusActionButton key={action.label} action={action} />
            ))}
          </div>
        ) : null}
        {details !== undefined && details.trim() !== '' ? (
          <pre style={detailsStyle}>{details}</pre>
        ) : null}
      </article>
    </section>
  );
}

export default function SiteStatusPage(props: SiteStatusPageProps): ReactNode {
  return (
    <NewTopLayout>
      <SiteStatusCard {...props} />
    </NewTopLayout>
  );
}
