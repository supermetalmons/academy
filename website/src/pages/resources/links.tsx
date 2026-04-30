import type {CSSProperties, ReactNode} from 'react';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import ResourcesSubnav from '@site/src/components/ResourcesSubnav';

type ChainKind = 'ethereum' | 'solana';
type AlternatePlayIconKind = 'steam' | 'googleDrive';

const externalLinkProps = {
  target: '_blank',
  rel: 'noreferrer',
} as const;

const emojipackFontDownloadItem = {
  label: 'Emojipack Font Download',
  href: 'https://drive.google.com/drive/folders/12z0-LVx_ItZDojkrO6IkDCo40kjx7B2A?usp=sharing',
} as const;

const alternatePlayItems: Array<{label: string; href: string; iconKind?: AlternatePlayIconKind}> = [
  {
    label: "Meinong's Tabletop Edition",
    href: 'https://coldnightwarmth.github.io/meinongs-tabletop/',
  },
  {
    label: 'Tabletop Simulator Edition',
    href: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3210189942&searchtext=',
    iconKind: 'steam',
  },
  {
    label: "Google Docs Drag n' Drop Version",
    href: 'https://docs.google.com/document/d/1NlqRdtJ2uzyO67uC2TwPNweSRMmp6Cb7L5PGs-sjhgg/edit?usp=sharing',
    iconKind: 'googleDrive',
  },
];

const githubRepoItems: Array<{label: string; href: string}> = [
  {label: 'Super Metal Mons', href: 'https://github.com/supermetalmons'},
  {label: 'mons.link', href: 'https://github.com/supermetalmons/mons'},
  {label: 'Mons Academy', href: 'https://github.com/supermetalmons/academy'},
  {label: "Meinong's Tabletop", href: 'https://github.com/coldnightwarmth/meinongs-tabletop'},
];

const pastTournamentItems: Array<{
  label: string;
  href: string;
  winnerText?: string;
  runnerUpText?: string;
  statusText?: string;
}> = [
  {
    label: 'Sunday Session Test Tourney',
    href: 'https://mons.link/event/4Nh32rLIAYI',
    statusText: 'Undecided: lambchop vs. meinong',
  },
  {
    label: "Fall Challenge Finals '25",
    href: 'https://x.com/i/broadcasts/1BdGYZgwWrEJX',
    winnerText: 'Winner: lambchop',
    runnerUpText: 'Runner-up: Moldy',
  },
  {
    label: 'G40 Invitational',
    href: 'https://x.com/i/broadcasts/1lPJqvEokZMxb',
    winnerText: 'Winner: Ivan Grachyov',
    runnerUpText: 'Runner-up: meinong',
  },
  {
    label: "SMM Inaugural Invitational Tournament '25",
    href: 'https://x.com/i/broadcasts/1ynKOlQbvDqGR',
    winnerText: 'Winner: GardenParty85',
    runnerUpText: 'Runner-up: lambchop',
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
    label: 'Sunday Mons Swag',
    href: 'https://www.tensor.trade/trade/292f6b9d-9de7-4219-9b8b-566fd7f5a217',
    chain: 'solana',
  },
  {
    label: 'SMM 4 year anniversary set!',
    href: 'https://www.tensor.trade/trade/smm_4_year_anniversary_set',
    chain: 'solana',
  },
  {label: 'Swag Pack', href: 'https://www.tensor.trade/trade/swag_pack', chain: 'solana'},
  {label: 'Little Swag Boxes', href: 'https://www.tensor.trade/trade/little_swag_boxes', chain: 'solana'},
  {label: 'Little Swag Hoodies', href: 'https://mons.shop/little_swag_hoodies', chain: 'solana'},
];

const traitCollectionItems: Array<{label: string; href: string; chain?: ChainKind}> = [
  {label: 'Allstarz', href: 'https://opensea.io/collection/allstarz-official', chain: 'ethereum'},
  {label: 'Flopawrettes', href: 'https://www.tensor.trade/trade/flopawrettes'},
  {label: 'Scarecrow by Jim Spindle', href: 'https://www.tensor.trade/trade/scarecrow_spindle'},
  {label: 'Pick-me Ports', href: 'https://www.tensor.trade/trade/pickme_ports'},
  {
    label: 'Pifella 2 Parasite Chamber',
    href: 'https://www.tensor.trade/trade/pifella_2_parasite_chamber',
  },
  {label: 'Planet Peppa', href: 'https://www.tensor.trade/trade/planet_peppa'},
  {label: 'Record of Hyperwar', href: 'https://www.tensor.trade/trade/record_of_hyperwar'},
  {label: 'Hyperwarhaul', href: 'https://www.tensor.trade/trade/hyperwarhaul'},
  {label: 'Hyperwarhaul+', href: 'https://www.tensor.trade/trade/hyperwarhaul_'},
  {label: 'Peer Study 3: Afella 2', href: 'https://www.tensor.trade/trade/afella_2'},
  {label: 'Bad Hand', href: 'https://www.tensor.trade/trade/badhand'},
  {
    label: 'Ghosts',
    href: 'https://www.tensor.trade/trade/c6163e25-3671-4039-a0d4-5cc78da69f1d',
  },
];

const collectionsWrapStyle: CSSProperties = {
  marginTop: 'calc(1rem + 15px)',
  padding: '0 clamp(16px, 4.5vw, 50px)',
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

const githubReposTitleStyle: CSSProperties = {
  ...collectionsTitleStyle,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.42rem',
};

const githubReposTitleIconStyle: CSSProperties = {
  width: '1.05rem',
  height: '1.05rem',
  display: 'block',
  color: '#000',
  transform: 'translateY(-1px)',
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

const tournamentWinnerTextStyle: CSSProperties = {
  lineHeight: 1.2,
  opacity: 0.8,
  fontSize: '0.82em',
  marginLeft: '1.15rem',
};

const tournamentRunnerUpTextStyle: CSSProperties = {
  ...tournamentWinnerTextStyle,
  opacity: 0.46,
};

const tournamentWinnerRowStyle: CSSProperties = {
  ...tournamentWinnerTextStyle,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.3rem',
};

const tournamentWinnerIconStyle: CSSProperties = {
  lineHeight: 1,
  transform: 'translateY(-0.01rem)',
};

const trailingMetaIconWrapStyle: CSSProperties = {
  marginLeft: '5px',
  display: 'inline-flex',
  alignItems: 'center',
  opacity: 0.9,
};

const googleDriveIconStyle: CSSProperties = {
  width: '0.92rem',
  height: '0.92rem',
  display: 'block',
  flex: '0 0 auto',
  transform: 'translateY(1px)',
};

const steamIconStyle: CSSProperties = {
  ...googleDriveIconStyle,
  transform: 'translateY(0px)',
  imageRendering: 'auto',
  filter: 'blur(0.08px)',
};

const collectionLinkWithIconStyle: CSSProperties = {
  ...collectionTextStyle,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
};

const collectionLinkWithTrailingIconStyle: CSSProperties = {
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

function renderGoogleDriveIcon(): ReactNode {
  return (
    <img
      src="/assets/google-drive-icon.svg"
      alt=""
      aria-hidden="true"
      draggable={false}
      style={googleDriveIconStyle}
    />
  );
}

function renderSteamIcon(): ReactNode {
  return (
    <img
      src="/assets/steam-logo.svg"
      alt=""
      aria-hidden="true"
      draggable={false}
      style={steamIconStyle}
    />
  );
}

function renderAlternatePlayIcon(iconKind: AlternatePlayIconKind): ReactNode {
  if (iconKind === 'steam') {
    return renderSteamIcon();
  }
  return renderGoogleDriveIcon();
}

function renderGitHubIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={githubReposTitleIconStyle} fill="currentColor">
      <path d="M12 2C6.48 2 2 6.58 2 12.22c0 4.52 2.87 8.35 6.84 9.7.5.09.68-.22.68-.49v-1.9c-2.78.62-3.37-1.2-3.37-1.2-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.56 2.35 1.11 2.92.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.13-4.55-5.03 0-1.11.39-2.02 1.03-2.74-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.05A9.33 9.33 0 0 1 12 6.98c.85 0 1.69.12 2.49.34 1.9-1.32 2.74-1.05 2.74-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.74 0 3.91-2.34 4.77-4.57 5.03.36.32.68.94.68 1.9v2.8c0 .27.18.58.69.48A10.22 10.22 0 0 0 22 12.22C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

export default function ResourcesLinksPage(): ReactNode {
  return (
    <BlankSectionPage title="Resources">
      <ResourcesSubnav active="other" />
      <section style={collectionsWrapStyle}>
        <h3 style={collectionsTitleStyle}>Past Tournaments</h3>
        <ul style={collectionsListStyle}>
          {pastTournamentItems.map((item) => (
            <li
              key={item.label}
              style={{
                ...collectionItemStyle,
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '0.14rem',
              }}>
              <span style={collectionItemStyle}>
                <span style={collectionChevronStyle} aria-hidden="true">
                  ›
                </span>
                <a href={item.href} {...externalLinkProps} style={collectionTextStyle}>
                  {item.label}
                </a>
              </span>
              {item.statusText ? (
                <span style={tournamentWinnerTextStyle}>{item.statusText}</span>
              ) : (
                <>
                  <span style={tournamentWinnerRowStyle}>
                    <span aria-hidden="true" style={tournamentWinnerIconStyle}>
                      🏆
                    </span>
                    <span>{item.winnerText}</span>
                  </span>
                  <span style={tournamentRunnerUpTextStyle}>{item.runnerUpText}</span>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section style={{...collectionsWrapStyle, ...collectionsBlockStyle}}>
        <h3 style={collectionsTitleStyle}>Alternate ways to play Mons</h3>
        <ul style={collectionsListStyle}>
          {alternatePlayItems.map((item) => (
            <li key={item.label} style={collectionItemStyle}>
              <span style={collectionChevronStyle} aria-hidden="true">
                ›
              </span>
              <a href={item.href} {...externalLinkProps} style={collectionLinkWithTrailingIconStyle}>
                <span>{item.label}</span>
                {item.iconKind ? renderAlternatePlayIcon(item.iconKind) : null}
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section style={{...collectionsWrapStyle, ...collectionsBlockStyle}}>
        <h3 style={collectionsTitleStyle}>Complete List of Mons Related Collections</h3>
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
      <section style={{...collectionsWrapStyle, ...collectionsBlockStyle}}>
        <h3 style={collectionsTitleStyle}>Complete List of Collection w/ Mons Traits</h3>
        <ul style={collectionsListStyle}>
          {traitCollectionItems.map((item) => (
            <li key={item.label} style={collectionItemStyle}>
              <span style={collectionChevronStyle} aria-hidden="true">
                ›
              </span>
              <a href={item.href} {...externalLinkProps} style={collectionLinkWithIconStyle}>
                {renderChainIcon(item.chain ?? 'solana')}
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section style={{...collectionsWrapStyle, ...collectionsBlockStyle}}>
        <h3 style={githubReposTitleStyle}>
          <span>GitHub Repos</span>
          {renderGitHubIcon()}
        </h3>
        <ul style={collectionsListStyle}>
          {githubRepoItems.map((item) => (
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
      <section style={{...collectionsWrapStyle, ...collectionsBlockStyle, ...bottomPadStyle}}>
        <ul style={collectionsListStyle}>
          <li style={collectionItemStyle}>
            <span style={collectionChevronStyle} aria-hidden="true">
              ›
            </span>
            <a href={emojipackFontDownloadItem.href} {...externalLinkProps} style={collectionTextStyle}>
              {emojipackFontDownloadItem.label}
            </a>
            <span style={trailingMetaIconWrapStyle}>{renderGoogleDriveIcon()}</span>
          </li>
        </ul>
      </section>
    </BlankSectionPage>
  );
}
