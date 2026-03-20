import type {CSSProperties, ReactNode} from 'react';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import ResourcesSubnav from '@site/src/components/ResourcesSubnav';

type ChainKind = 'ethereum' | 'solana';

const externalLinkProps = {
  target: '_blank',
  rel: 'noreferrer',
} as const;

const emojipackFontDownloadItem = {
  label: 'Emojipack Font Download',
  href: 'https://drive.google.com/drive/folders/12z0-LVx_ItZDojkrO6IkDCo40kjx7B2A?usp=sharing',
} as const;

const alternatePlayItems: Array<{label: string; href: string}> = [
  {
    label: 'Tabletop Simulator Edition',
    href: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3210189942&searchtext=',
  },
  {
    label: "Google Docs Drag n' Drop Version",
    href: 'https://docs.google.com/document/d/1NlqRdtJ2uzyO67uC2TwPNweSRMmp6Cb7L5PGs-sjhgg/edit?usp=sharing',
  },
];

const collectionItems: Array<{label: string; href: string; chain: ChainKind}> = [
  {
    label: 'Super Metal Mons! (gen 1)',
    href: 'https://opensea.io/collection/supermetalmons',
    chain: 'ethereum',
  },
  {
    label: 'Super Metal Mons!! (gen 2)',
    href: 'https://opensea.io/collection/super-metal-mons-gen-2',
    chain: 'ethereum',
  },
  {label: 'EMOJIPACK', href: 'https://opensea.io/collection/theemojipack', chain: 'ethereum'},
  {label: 'Super Sofubi', href: 'https://opensea.io/collection/super-sofubi', chain: 'solana'},
  {label: 'Little Swag World', href: 'https://www.tensor.trade/trade/little_swag_world', chain: 'solana'},
  {
    label: 'Organic Evolution: King Mega-Morphing Mons!',
    href: 'https://www.tensor.trade/trade/organic_evolution',
    chain: 'solana',
  },
  {label: 'Little Swag World HEXP', href: 'https://www.tensor.trade/trade/lswhexp', chain: 'solana'},
  {
    label: 'SMM 4 year anniversary set!',
    href: 'https://www.tensor.trade/trade/smm_4_year_anniversary_set',
    chain: 'solana',
  },
  {label: 'Swag Pack', href: 'https://www.tensor.trade/trade/swag_pack', chain: 'solana'},
  {label: 'Little Swag Boxes', href: 'https://www.tensor.trade/trade/little_swag_boxes', chain: 'solana'},
];

const collectionsWrapStyle: CSSProperties = {
  marginTop: 'calc(1rem + 15px)',
  padding: '0 50px',
};

const collectionsBlockStyle: CSSProperties = {
  marginTop: 'calc(1.2rem + 1em)',
};

const bottomPadStyle: CSSProperties = {
  paddingBottom: '40px',
};

const collectionsTitleStyle: CSSProperties = {
  margin: 0,
  color: '#000',
  fontSize: '1.2rem',
  lineHeight: 1.2,
  fontWeight: 700,
};

const collectionsListStyle: CSSProperties = {
  margin: '0.6rem 0 0',
  paddingLeft: 0,
  listStyle: 'none',
  color: '#000',
};

const collectionItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  margin: '0.24rem 0',
};

const collectionChevronStyle: CSSProperties = {
  fontSize: '0.98rem',
  lineHeight: 1,
  transform: 'translateY(-0.01rem)',
};

const collectionTextStyle: CSSProperties = {
  lineHeight: 1.25,
};

const trailingMetaTextStyle: CSSProperties = {
  lineHeight: 1.25,
  opacity: 0.82,
  fontSize: '0.82em',
  marginLeft: '5px',
  position: 'relative',
  top: '0',
};

const collectionLinkWithIconStyle: CSSProperties = {
  ...collectionTextStyle,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
};

const chainIconStyle: CSSProperties = {
  width: '0.86rem',
  height: '0.86rem',
  display: 'block',
  color: '#000',
  opacity: 0.85,
  flex: '0 0 auto',
};

function renderChainIcon(chain: ChainKind): ReactNode {
  if (chain === 'ethereum') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" style={chainIconStyle} fill="currentColor">
        <path d="M12 1.8 5.7 12 12 8.6 18.3 12 12 1.8Z" />
        <path d="M12 22.2 5.7 13.3 12 16.7 18.3 13.3 12 22.2Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={chainIconStyle} fill="currentColor">
      <path d="M6 4.8h14L17.4 7.7H3.4L6 4.8Z" />
      <path d="M6.6 10.6h14l-2.6 2.9H4L6.6 10.6Z" />
      <path d="M7.2 16.4h14l-2.6 2.9H4.6l2.6-2.9Z" />
    </svg>
  );
}

export default function ResourcesLinksPage(): ReactNode {
  return (
    <BlankSectionPage title="Resources">
      <ResourcesSubnav active="other" />
      <section style={collectionsWrapStyle}>
        <h3 style={collectionsTitleStyle}>Alternate ways to play Mons</h3>
        <ul style={collectionsListStyle}>
          {alternatePlayItems.map((item) => (
            <li key={item.label} style={collectionItemStyle}>
              <span style={collectionChevronStyle} aria-hidden="true">
                ›
              </span>
              <a href={item.href} {...externalLinkProps} style={collectionTextStyle}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section style={{...collectionsWrapStyle, ...collectionsBlockStyle}}>
        <h3 style={collectionsTitleStyle}>Complete List of Mons Related collections</h3>
        <ul style={collectionsListStyle}>
          {collectionItems.map((item) => (
            <li key={item.label} style={collectionItemStyle}>
              <span style={collectionChevronStyle} aria-hidden="true">
                ›
              </span>
              <a href={item.href} {...externalLinkProps} style={collectionLinkWithIconStyle}>
                {renderChainIcon(item.chain)}
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section style={{...collectionsWrapStyle, ...collectionsBlockStyle, ...bottomPadStyle}}>
        <ul style={collectionsListStyle}>
          <li style={collectionItemStyle}>
            <span style={collectionChevronStyle} aria-hidden="true">
              ›
            </span>
            <a href={emojipackFontDownloadItem.href} {...externalLinkProps} style={collectionTextStyle}>
              {emojipackFontDownloadItem.label}
            </a>
            <span style={trailingMetaTextStyle}>(Google Drive)</span>
          </li>
        </ul>
      </section>
    </BlankSectionPage>
  );
}
