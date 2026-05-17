import type {CSSProperties, ReactNode} from 'react';
import {useEffect, useMemo, useState} from 'react';
import BlankSectionPage from '@site/src/components/BlankSectionPage';
import ResourcesSubnav from '@site/src/components/ResourcesSubnav';
import SuperMetalMonsBoard, {
  type SuperMetalMonsBoardSnapshot,
} from '@site/src/components/SuperMetalMonsBoard';
import {useSiteBoardTheme} from '@site/src/utils/siteBoardTheme';
import {loadMonsLinkGameBoardSnapshot} from '@site/src/utils/monsLinkGameBoardImport';
import {
  monsLinkAuthProviderNotes,
  monsLinkEmptyMiningMaterials,
  readStoredMonsLinkSession,
  signInMonsLinkWithEthereum,
  signInMonsLinkWithSolana,
  signOutMonsLinkAcademy,
  subscribeMonsLinkAcademyData,
  type MonsLinkGameItem,
  type MonsLinkProfile,
  type MonsLinkSession,
} from '@site/src/utils/monsLinkAcademyClient';

const sandboxWrapStyle: CSSProperties = {
  width: '100%',
  paddingTop: '6px',
  paddingBottom: '20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const userPageToggleStyle: CSSProperties = {
  position: 'fixed',
  left: 'calc(0.9rem + 1px)',
  bottom: 'calc(2.58rem + 5px)',
  zIndex: 120,
  width: '1.1rem',
  height: '1.1rem',
  border: 0,
  backgroundColor: 'transparent',
  color: '#000',
  padding: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.1rem',
  lineHeight: 1,
  cursor: 'pointer',
  userSelect: 'none',
  WebkitUserSelect: 'none',
};

const profilePanelStyle: CSSProperties = {
  width: '100%',
  minHeight: '520px',
  padding: '34px 16px 56px',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  color: '#000',
};

const signinPanelStyle: CSSProperties = {
  width: 'min(100%, 560px)',
  border: '1px solid #000',
  backgroundColor: '#fff',
  padding: '22px',
  boxSizing: 'border-box',
  display: 'grid',
  gap: '0.85rem',
  textAlign: 'center',
};

const signinTitleStyle: CSSProperties = {
  margin: '0 0 0.3rem',
  fontSize: '1.05rem',
  fontWeight: 700,
};

const signinButtonsStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '0.55rem',
};

const signinButtonStyle: CSSProperties = {
  border: '1px solid #000',
  borderRadius: 0,
  backgroundColor: '#fff',
  color: '#000',
  padding: '0.55rem 0.65rem',
  font: 'inherit',
  lineHeight: 1.1,
  cursor: 'pointer',
  userSelect: 'none',
  WebkitUserSelect: 'none',
};

const signinButtonDisabledStyle: CSSProperties = {
  ...signinButtonStyle,
  opacity: 0.45,
  cursor: 'not-allowed',
};

const profileCardStyle: CSSProperties = {
  width: 'min(100%, 360px)',
  aspectRatio: '2217 / 1625',
  border: '1px solid #000',
  borderRadius: '14px',
  backgroundColor: '#fff',
  padding: 0,
  boxSizing: 'border-box',
  textAlign: 'center',
  overflow: 'hidden',
  position: 'relative',
  boxShadow: '0 10px 24px rgba(0,0,0,0.18)',
};

const profileCardBgStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  userSelect: 'none',
  WebkitUserSelect: 'none',
};

const profileEmojiStyle: CSSProperties = {
  width: '34%',
  height: 'auto',
  display: 'block',
  position: 'absolute',
  top: '19%',
  left: '50%',
  transform: 'translateX(-50%)',
  imageRendering: 'auto',
  filter: 'drop-shadow(0 4px 5px rgba(0,0,0,0.26))',
  userSelect: 'none',
  WebkitUserSelect: 'none',
};

const profileCardTextWrapStyle: CSSProperties = {
  position: 'absolute',
  left: '9%',
  right: '9%',
  bottom: '10%',
  display: 'grid',
  gap: '0.32rem',
  justifyItems: 'center',
};

const profileNameStyle: CSSProperties = {
  margin: 0,
  maxWidth: '100%',
  padding: '0.24rem 0.5rem',
  border: '1px solid rgba(0,0,0,0.5)',
  borderRadius: '8px',
  backgroundColor: 'rgba(255,255,255,0.68)',
  backdropFilter: 'blur(2px)',
  color: '#000',
  fontSize: 'clamp(0.9rem, 4vw, 1.15rem)',
  fontWeight: 700,
  lineHeight: 1.05,
  overflowWrap: 'anywhere',
};

const profileAddressStyle: CSSProperties = {
  margin: 0,
  padding: '0.22rem 0.44rem',
  border: '1px solid rgba(0,0,0,0.42)',
  borderRadius: '7px',
  backgroundColor: 'rgba(255,255,255,0.62)',
  color: '#000',
  fontSize: '0.7rem',
  lineHeight: 1.25,
  wordBreak: 'break-word',
};

const statGridStyle: CSSProperties = {
  width: 'min(100%, 620px)',
  marginTop: '1.55rem',
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '0.65rem',
};

const statCardStyle: CSSProperties = {
  border: '1px solid #000',
  backgroundColor: '#fff',
  padding: '0.75rem 0.65rem',
  textAlign: 'center',
};

const statValueStyle: CSSProperties = {
  display: 'block',
  fontSize: '1.25rem',
  fontWeight: 700,
};

const statLabelStyle: CSSProperties = {
  display: 'block',
  marginTop: '0.18rem',
  fontSize: '0.78rem',
  opacity: 0.68,
};

const materialBreakdownStyle: CSSProperties = {
  width: 'min(100%, 620px)',
  marginTop: '0.55rem',
  display: 'flex',
  justifyContent: 'center',
  gap: '0.7rem',
  flexWrap: 'wrap',
  fontSize: '0.78rem',
  lineHeight: 1.25,
  opacity: 0.74,
};

const gamesListStyle: CSSProperties = {
  width: 'min(100%, 720px)',
  margin: '1.45rem 0 1.1rem',
  padding: 0,
  listStyle: 'none',
  display: 'grid',
  gap: '0.45rem',
};

const gameButtonStyle: CSSProperties = {
  width: '100%',
  border: '1px solid #000',
  borderRadius: 0,
  backgroundColor: '#fff',
  color: '#000',
  padding: '0.58rem 0.7rem',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: '0.7rem',
  alignItems: 'center',
  textAlign: 'left',
  font: 'inherit',
  cursor: 'pointer',
};

const gameMetaStyle: CSSProperties = {
  fontSize: '0.76rem',
  opacity: 0.66,
};

const profileNoteStyle: CSSProperties = {
  width: 'min(100%, 720px)',
  margin: '0.8rem 0 0',
  fontSize: '0.78rem',
  lineHeight: 1.3,
  opacity: 0.72,
  textAlign: 'center',
};

const errorStyle: CSSProperties = {
  color: '#8a0000',
  fontSize: '0.82rem',
  lineHeight: 1.3,
};

const selectedGameNoticeStyle: CSSProperties = {
  margin: '0 0 0.75rem',
  fontSize: '0.8rem',
  lineHeight: 1.3,
  textAlign: 'center',
  opacity: 0.72,
};

function formatShortAddress(value: string | null): string {
  if (!value) {
    return '';
  }
  return value.length > 18 ? `${value.slice(0, 8)}...${value.slice(-6)}` : value;
}

function getProfileDisplayName(profile: MonsLinkProfile): string {
  return profile.username || formatShortAddress(profile.eth) || formatShortAddress(profile.sol) || 'mons.link player';
}

function getMaterialsTotal(profile: MonsLinkProfile | null): number {
  const materials = profile?.mining.materials ?? monsLinkEmptyMiningMaterials;
  return materials.dust + materials.slime + materials.gum + materials.metal + materials.ice;
}

function formatGameDate(ms: number): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(ms));
}

export default function ResourcesSandboxPage(): ReactNode {
  const boardTheme = useSiteBoardTheme();
  const [isProfilePageOpen, setIsProfilePageOpen] = useState(false);
  const [session, setSession] = useState<MonsLinkSession | null>(() => readStoredMonsLinkSession());
  const [profile, setProfile] = useState<MonsLinkProfile | null>(null);
  const [games, setGames] = useState<MonsLinkGameItem[]>([]);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<MonsLinkGameItem | null>(null);
  const [loadedGameSnapshot, setLoadedGameSnapshot] =
    useState<SuperMetalMonsBoardSnapshot | null>(null);
  const [isGameLoading, setIsGameLoading] = useState(false);
  const [gameLoadError, setGameLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (session === null) {
      setProfile(null);
      setGames([]);
      return undefined;
    }
    return subscribeMonsLinkAcademyData(
      session,
      setProfile,
      setGames,
      (error) => setAuthError(error.message),
    );
  }, [session]);

  const materialsTotal = useMemo(() => getMaterialsTotal(profile), [profile]);
  const materials = profile?.mining.materials ?? monsLinkEmptyMiningMaterials;

  const runSignIn = async (provider: 'eth' | 'sol'): Promise<void> => {
    if (isSigningIn) {
      return;
    }
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const nextProfile =
        provider === 'eth'
          ? await signInMonsLinkWithEthereum()
          : await signInMonsLinkWithSolana();
      setProfile(nextProfile);
      setSession({profileId: nextProfile.id, loginUid: nextProfile.loginUid});
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Could not sign in.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    setAuthError(null);
    await signOutMonsLinkAcademy();
    setSession(null);
    setProfile(null);
    setGames([]);
  };

  const handleGameClick = (game: MonsLinkGameItem): void => {
    setSelectedGame(game);
    setIsProfilePageOpen(false);
    setIsGameLoading(true);
    setGameLoadError(null);
    void loadMonsLinkGameBoardSnapshot(game)
      .then((snapshot) => {
        setLoadedGameSnapshot(snapshot);
      })
      .catch((error) => {
        setLoadedGameSnapshot(null);
        setGameLoadError(
          error instanceof Error
            ? error.message
            : 'Could not load this mons.link board state.',
        );
      })
      .finally(() => setIsGameLoading(false));
  };

  const renderProfilePage = (): ReactNode => (
    <section style={profilePanelStyle} aria-label="mons.link account profile">
      {session === null ? (
        <div style={signinPanelStyle}>
          <p style={signinTitleStyle}>Sign in with your mons.link account to load your games</p>
          <div style={signinButtonsStyle}>
            <button
              type="button"
              style={signinButtonStyle}
              disabled={isSigningIn}
              onClick={() => {
                void runSignIn('eth');
              }}>
              Ethereum
            </button>
            <button
              type="button"
              style={signinButtonStyle}
              disabled={isSigningIn}
              onClick={() => {
                void runSignIn('sol');
              }}>
              Solana
            </button>
            <button
              type="button"
              style={signinButtonDisabledStyle}
              disabled
              title={monsLinkAuthProviderNotes.apple ?? undefined}>
              Apple
            </button>
            <button
              type="button"
              style={signinButtonDisabledStyle}
              disabled
              title={monsLinkAuthProviderNotes.x ?? undefined}>
              X
            </button>
          </div>
          <p style={profileNoteStyle}>
            Apple and X need mons.link backend origin/redirect configuration before Academy can complete those sign-ins.
          </p>
          {authError ? <span style={errorStyle}>{authError}</span> : null}
        </div>
      ) : (
        <>
          <article style={profileCardStyle}>
            {profile ? (
              <>
                <img
                  src={`https://assets.mons.link/cards/bg/${profile.cardBackgroundId ?? 30}.webp`}
                  alt=""
                  aria-hidden="true"
                  style={profileCardBgStyle}
                  draggable={false}
                />
                <img
                  src={`https://assets.mons.link/emojipack_hq/${profile.emoji}.webp`}
                  alt=""
                  aria-hidden="true"
                  style={profileEmojiStyle}
                  draggable={false}
                />
                <div style={profileCardTextWrapStyle}>
                  <h2 style={profileNameStyle}>{getProfileDisplayName(profile)}</h2>
                  <p style={profileAddressStyle}>
                    {profile.eth ? `ETH ${formatShortAddress(profile.eth)}` : null}
                    {profile.eth && profile.sol ? <br /> : null}
                    {profile.sol ? `SOL ${formatShortAddress(profile.sol)}` : null}
                    {(profile.eth || profile.sol) && profile.totalManaPoints > 0 ? <br /> : null}
                    {profile.totalManaPoints > 0 ? `mp: ${profile.totalManaPoints}` : null}
                  </p>
                </div>
              </>
            ) : (
              <p style={signinTitleStyle}>loading profile...</p>
            )}
          </article>
          <div style={statGridStyle} aria-label="mons.link account stats">
            <div style={statCardStyle}>
              <span style={statValueStyle}>{games.length}</span>
              <span style={statLabelStyle}>games played</span>
            </div>
            <div style={statCardStyle}>
              <span style={statValueStyle}>{profile?.totalManaPoints ?? 0}</span>
              <span style={statLabelStyle}>mana points scored</span>
            </div>
            <div style={statCardStyle}>
              <span style={statValueStyle}>{materialsTotal}</span>
              <span style={statLabelStyle}>materials mined</span>
            </div>
          </div>
          <div style={materialBreakdownStyle} aria-label="Materials mined breakdown">
            <span>dust {materials.dust}</span>
            <span>slime {materials.slime}</span>
            <span>gum {materials.gum}</span>
            <span>metal {materials.metal}</span>
            <span>ice {materials.ice}</span>
          </div>
          <ol style={gamesListStyle} aria-label="Past mons.link games">
            {games.length === 0 ? (
              <li style={profileNoteStyle}>No games found for this account yet.</li>
            ) : (
              games.map((game) => (
                <li key={game.id}>
                  <button type="button" style={gameButtonStyle} onClick={() => handleGameClick(game)}>
                    <span>
                      {game.opponentName ? `vs. ${game.opponentName}` : game.inviteId}
                      <br />
                      <span style={gameMetaStyle}>
                        {game.status} - {game.kind} - {formatGameDate(game.listSortAtMs)}
                      </span>
                    </span>
                    <span style={gameMetaStyle}>load</span>
                  </button>
                </li>
              ))
            )}
          </ol>
          {authError ? <span style={errorStyle}>{authError}</span> : null}
          <button type="button" style={{...signinButtonStyle, marginTop: '1rem'}} onClick={() => void handleSignOut()}>
            sign out
          </button>
        </>
      )}
    </section>
  );

  return (
    <BlankSectionPage title="Resources">
      <ResourcesSubnav
        active="sandbox"
        onTabClick={(section) => {
          if (section === 'sandbox') {
            setIsProfilePageOpen(false);
          }
        }}
      />
      <button
        type="button"
        aria-label={isProfilePageOpen ? 'Return to sandbox board' : 'Open mons.link profile'}
        style={userPageToggleStyle}
        onClick={() => setIsProfilePageOpen((current) => !current)}>
        👤
      </button>
      <section style={sandboxWrapStyle}>
        {isProfilePageOpen ? (
          renderProfilePage()
        ) : (
          <>
            {selectedGame ? (
              <p style={selectedGameNoticeStyle}>
                {isGameLoading
                  ? `loading mons.link game ${selectedGame.inviteId}...`
                  : gameLoadError
                    ? `could not load ${selectedGame.inviteId}: ${gameLoadError}`
                    : `loaded mons.link game ${selectedGame.inviteId}`}
              </p>
            ) : null}
            <SuperMetalMonsBoard
              boardTheme={boardTheme}
              showPlayerHud
              boardPreset="default"
              showSpawnGhosts
              enableFreeTileMove
              enableHoverClickScaling={false}
              externalSandboxBoardSnapshot={loadedGameSnapshot}
            />
          </>
        )}
      </section>
    </BlankSectionPage>
  );
}
