import type {CSSProperties, ReactNode} from 'react';
import {useEffect, useMemo, useState} from 'react';
import NewTopLayout from '@site/src/components/NewTopLayout';
import {
  CLOUD_ENABLED_DEFAULT,
  CLOUD_SPEED_DEFAULT,
  CLOUD_SPEED_MAX,
  CLOUD_SPEED_MIN,
  readCloudEnabledFromStorage,
  writeCloudEnabledToStorage,
  readCloudSpeedFromStorage,
  writeCloudSpeedToStorage,
} from '@site/src/constants/cloudSpeed';
import {
  writeLessonCompletionsToStorage,
  writeLessonFavoritesToStorage,
} from '@site/src/constants/lessonFavorites';
import {
  writePuzzleCompletionsToStorage,
  writePuzzleFavoritesToStorage,
} from '@site/src/constants/puzzleFavorites';
import {
  MUSIC_VOLUME_EVENT_NAME,
  MUSIC_VOLUME_DEFAULT,
  MUSIC_VOLUME_STORAGE_KEY,
  SOUND_EFFECT_VOLUME_DEFAULT,
  readMusicVolumeFromStorage,
  readSoundEffectVolumeFromStorage,
  writeMusicVolumeToStorage,
  writeSoundEffectVolumeToStorage,
} from '@site/src/constants/siteAudio';
import {
  BOARD_STYLE_DEFAULT,
  useSiteBoardTheme,
  writeSiteBoardThemeToStorage,
} from '@site/src/utils/siteBoardTheme';

const MONS_VIEWER_FAVORITES_STORAGE_KEY = 'mons-academy-favorites-folder';
const MONS_VIEWER_STATE_STORAGE_KEY = 'mons-academy-viewer-state';
const GALLERY_IMAGE_ORDER_STORAGE_KEY = 'mons-academy-gallery-image-order-v1';
const LAST_INSTRUCTION_ROUTE_STORAGE_KEY = 'mons_last_instruction_route_v1';
const LAST_PUZZLES_ROUTE_STORAGE_KEY = 'mons_last_puzzles_route_v1';
const LAST_RESOURCES_ROUTE_STORAGE_KEY = 'mons_last_resources_route_v1';
const LAST_SETTINGS_RETURN_ROUTE_STORAGE_KEY = 'mons_last_settings_return_route_v1';
const CLOUD_INTRO_SESSION_KEY = 'mons_cloud_intro_seen_v1';
const SANDBOX_BOARD_STATE_STORAGE_KEY = 'mons-academy-sandbox-board-state-v1';

const SITE_PROGRESS_STORAGE_KEYS_TO_REMOVE = [
  MONS_VIEWER_FAVORITES_STORAGE_KEY,
  MONS_VIEWER_STATE_STORAGE_KEY,
  GALLERY_IMAGE_ORDER_STORAGE_KEY,
  SANDBOX_BOARD_STATE_STORAGE_KEY,
  LAST_INSTRUCTION_ROUTE_STORAGE_KEY,
  LAST_PUZZLES_ROUTE_STORAGE_KEY,
  LAST_RESOURCES_ROUTE_STORAGE_KEY,
  LAST_SETTINGS_RETURN_ROUTE_STORAGE_KEY,
];

const contentWrapStyle: CSSProperties = {
  minHeight: 'calc(100vh - 96px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
  boxSizing: 'border-box',
};

const panelStyle: CSSProperties = {
  width: 'min(500px, calc(100% - 2rem))',
  minHeight: 'calc(24vh - 55px)',
  marginTop: '-75px',
  backgroundColor: 'rgba(255, 255, 255, 0.46)',
  border: '1px solid rgba(0, 0, 0, 0.28)',
  borderRadius: '18px',
  padding: '1.15rem 1.2rem',
  backdropFilter: 'blur(3px)',
  WebkitBackdropFilter: 'blur(3px)',
};

const settingsTextColor = '#111111';
const settingsTextShadow = 'none';

const titleStyle: CSSProperties = {
  margin: 0,
  color: settingsTextColor,
  fontSize: '1.7rem',
  lineHeight: 1.1,
  fontWeight: 700,
  textAlign: 'center',
  textShadow: settingsTextShadow,
};

const controlGroupStyle: CSSProperties = {
  marginTop: 'calc(1.15rem + 15px)',
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'grid',
  gap: '0.6rem',
  maxWidth: '430px',
};

const controlLabelStyle: CSSProperties = {
  margin: 0,
  color: settingsTextColor,
  fontSize: '1.03rem',
  lineHeight: 1.2,
  fontWeight: 600,
  textShadow: settingsTextShadow,
};

const sliderRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.65rem',
};

const boardStyleRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.85rem',
  marginBottom: '0.34rem',
};

const boardStyleToggleWrapStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.52rem',
};

const boardStyleToggleLabelStyle: CSSProperties = {
  minWidth: '2.55rem',
  margin: 0,
  color: settingsTextColor,
  fontSize: '0.95rem',
  lineHeight: 1,
  fontWeight: 700,
  textShadow: settingsTextShadow,
};

const boardStyleToggleStyle: CSSProperties = {
  width: '3.15rem',
  height: '1.72rem',
  border: '1.5px solid rgba(0, 0, 0, 0.74)',
  borderRadius: '999px',
  padding: '0.16rem',
  backgroundColor: 'rgba(255, 255, 255, 0.36)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  cursor: 'pointer',
  boxShadow: 'inset 0 1px 5px rgba(0, 0, 0, 0.24)',
  transition: 'background-color 180ms ease',
};

const boardStyleToggleDarkStyle: CSSProperties = {
  ...boardStyleToggleStyle,
  border: '1.5px solid rgba(0, 0, 0, 0.82)',
  backgroundColor: 'rgba(18, 19, 22, 0.82)',
};

const boardStyleToggleThumbStyle: CSSProperties = {
  width: '1.34rem',
  height: '1.34rem',
  borderRadius: '999px',
  backgroundColor: '#111111',
  boxShadow: '0 2px 7px rgba(0, 0, 0, 0.34)',
  transform: 'translateX(0)',
  transition: 'transform 180ms cubic-bezier(0.2, 0.9, 0.25, 1)',
};

const boardStyleToggleThumbDarkStyle: CSSProperties = {
  ...boardStyleToggleThumbStyle,
  backgroundColor: '#ffffff',
  transform: 'translateX(1.43rem)',
};

const labelRowStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.42rem',
};

const disableCloudButtonStyle: CSSProperties = {
  minWidth: '1.45rem',
  height: '1.45rem',
  padding: 0,
  marginLeft: '10px',
  border: '1px solid rgba(0, 0, 0, 0.38)',
  borderRadius: '3px',
  backgroundColor: 'rgba(255, 255, 255, 0.5)',
  color: settingsTextColor,
  fontSize: '0.95rem',
  lineHeight: 1,
  fontWeight: 700,
  cursor: 'pointer',
  textShadow: settingsTextShadow,
};

const disableCloudButtonActiveStyle: CSSProperties = {
  ...disableCloudButtonStyle,
  backgroundColor: 'rgba(0, 0, 0, 0.22)',
  boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.32)',
  transform: 'translateY(1px)',
};

const sliderStyle: CSSProperties = {
  width: '100%',
  accentColor: '#2d5dff',
  cursor: 'pointer',
};

const speedValueStyle: CSSProperties = {
  minWidth: '3.2rem',
  textAlign: 'right',
  margin: 0,
  color: settingsTextColor,
  fontSize: '0.95rem',
  lineHeight: 1.1,
  fontWeight: 600,
  textShadow: settingsTextShadow,
};

const clearProgressButtonStyle: CSSProperties = {
  justifySelf: 'center',
  marginTop: '0.95rem',
  marginBottom: '0.48rem',
  border: '1px solid rgba(0, 0, 0, 0.38)',
  borderRadius: '4px',
  backgroundColor: 'rgba(156, 20, 20, 0.82)',
  color: '#fff',
  padding: '0.48rem 0.72rem',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.38rem',
  fontFamily: 'inherit',
  fontSize: '0.95rem',
  lineHeight: 1.1,
  fontWeight: 700,
  cursor: 'pointer',
  textShadow: settingsTextShadow,
  transition: 'background-color 150ms ease, transform 150ms ease',
};

const clearProgressButtonIconStyle: CSSProperties = {
  width: '1.08rem',
  height: '1.08rem',
  display: 'block',
  objectFit: 'contain',
  imageRendering: 'auto',
  filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.38))',
};

const confirmOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 12000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
  backgroundColor: 'rgba(0, 0, 0, 0.34)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
};

const confirmPanelStyle: CSSProperties = {
  width: 'min(360px, 100%)',
  border: '1px solid rgba(255, 255, 255, 0.82)',
  borderRadius: '12px',
  backgroundColor: 'rgba(12, 14, 12, 0.88)',
  color: '#fff',
  padding: '1.05rem 1rem',
  textAlign: 'center',
  boxShadow: '0 16px 36px rgba(0, 0, 0, 0.28)',
};

const confirmTextStyle: CSSProperties = {
  margin: 0,
  fontSize: '1.02rem',
  lineHeight: 1.35,
  fontWeight: 700,
  textShadow: settingsTextShadow,
};

const confirmButtonRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: '0.68rem',
  marginTop: '0.92rem',
};

const confirmButtonStyle: CSSProperties = {
  minWidth: '5.4rem',
  border: '1px solid rgba(255, 255, 255, 0.84)',
  borderRadius: '4px',
  backgroundColor: 'rgba(255, 255, 255, 0.14)',
  color: '#fff',
  padding: '0.42rem 0.58rem',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.32rem',
  fontFamily: 'inherit',
  fontSize: '0.95rem',
  lineHeight: 1,
  fontWeight: 700,
  cursor: 'pointer',
  textShadow: settingsTextShadow,
};

const confirmIconStyle: CSSProperties = {
  width: '1rem',
  height: '1rem',
  display: 'block',
};

function clearSiteProgressStorage(): void {
  writePuzzleFavoritesToStorage([]);
  writePuzzleCompletionsToStorage([]);
  writeLessonFavoritesToStorage([]);
  writeLessonCompletionsToStorage([]);
  writeMusicVolumeToStorage(MUSIC_VOLUME_DEFAULT);
  writeSoundEffectVolumeToStorage(SOUND_EFFECT_VOLUME_DEFAULT);
  writeSiteBoardThemeToStorage(BOARD_STYLE_DEFAULT);
  writeCloudSpeedToStorage(CLOUD_SPEED_DEFAULT);
  writeCloudEnabledToStorage(CLOUD_ENABLED_DEFAULT);

  if (typeof window === 'undefined') {
    return;
  }

  SITE_PROGRESS_STORAGE_KEYS_TO_REMOVE.forEach((key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage write issues.
    }
  });
  try {
    window.sessionStorage.removeItem(CLOUD_INTRO_SESSION_KEY);
  } catch {
    // Ignore storage write issues.
  }
}

function formatVolumeLabel(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export default function SettingsPage(): ReactNode {
  const boardTheme = useSiteBoardTheme();
  const [musicVolume, setMusicVolume] = useState<number>(MUSIC_VOLUME_DEFAULT);
  const [soundEffectVolume, setSoundEffectVolume] = useState<number>(
    SOUND_EFFECT_VOLUME_DEFAULT,
  );
  const [cloudEnabled, setCloudEnabled] = useState<boolean>(CLOUD_ENABLED_DEFAULT);
  const [cloudSpeedMultiplier, setCloudSpeedMultiplier] = useState<number>(CLOUD_SPEED_DEFAULT);
  const [isClearProgressConfirmOpen, setIsClearProgressConfirmOpen] = useState(false);

  useEffect(() => {
    const updateMusicVolume = () => {
      setMusicVolume(readMusicVolumeFromStorage());
    };
    updateMusicVolume();
    setSoundEffectVolume(readSoundEffectVolumeFromStorage());
    setCloudEnabled(readCloudEnabledFromStorage());
    setCloudSpeedMultiplier(readCloudSpeedFromStorage());
    if (typeof window === 'undefined') {
      return;
    }
    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key === MUSIC_VOLUME_STORAGE_KEY) {
        updateMusicVolume();
      }
    };
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener(MUSIC_VOLUME_EVENT_NAME, updateMusicVolume as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener(MUSIC_VOLUME_EVENT_NAME, updateMusicVolume as EventListener);
    };
  }, []);

  const cloudSpeedLabel = useMemo(
    () => (cloudEnabled ? `${cloudSpeedMultiplier.toFixed(2).replace(/\.00$/, '')}x` : '0x'),
    [cloudEnabled, cloudSpeedMultiplier],
  );

  const handleClearSiteProgress = (): void => {
    clearSiteProgressStorage();
    setMusicVolume(MUSIC_VOLUME_DEFAULT);
    setSoundEffectVolume(SOUND_EFFECT_VOLUME_DEFAULT);
    setCloudEnabled(CLOUD_ENABLED_DEFAULT);
    setCloudSpeedMultiplier(CLOUD_SPEED_DEFAULT);
    setIsClearProgressConfirmOpen(false);
  };

  return (
    <NewTopLayout>
      <section style={contentWrapStyle}>
        <div style={panelStyle}>
          <h2 style={titleStyle}>Settings</h2>
          <div style={controlGroupStyle}>
            <div style={boardStyleRowStyle}>
              <p style={controlLabelStyle}>Board Style</p>
              <div style={boardStyleToggleWrapStyle}>
                <p style={boardStyleToggleLabelStyle}>
                  {boardTheme === 'dark' ? 'Dark' : 'Light'}
                </p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={boardTheme === 'dark'}
                  aria-label="Board style"
                  onClick={() => {
                    writeSiteBoardThemeToStorage(
                      boardTheme === 'dark' ? 'light' : 'dark',
                    );
                  }}
                  style={
                    boardTheme === 'dark'
                      ? boardStyleToggleDarkStyle
                      : boardStyleToggleStyle
                  }>
                  <span
                    aria-hidden="true"
                    style={
                      boardTheme === 'dark'
                        ? boardStyleToggleThumbDarkStyle
                        : boardStyleToggleThumbStyle
                    }
                  />
                </button>
              </div>
            </div>
            <p style={controlLabelStyle}>Music Volume</p>
            <div style={sliderRowStyle}>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(musicVolume * 100)}
                onChange={(event) => {
                  const safeValue = writeMusicVolumeToStorage(
                    Number.parseInt(event.currentTarget.value, 10) / 100,
                  );
                  setMusicVolume(safeValue);
                }}
                style={sliderStyle}
                aria-label="Music volume"
              />
              <p style={speedValueStyle}>{formatVolumeLabel(musicVolume)}</p>
            </div>
            <p style={controlLabelStyle}>Sound Effect Volume</p>
            <div style={sliderRowStyle}>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(soundEffectVolume * 100)}
                onChange={(event) => {
                  const safeValue = writeSoundEffectVolumeToStorage(
                    Number.parseInt(event.currentTarget.value, 10) / 100,
                  );
                  setSoundEffectVolume(safeValue);
                }}
                style={sliderStyle}
                aria-label="Sound effect volume"
              />
              <p style={speedValueStyle}>{formatVolumeLabel(soundEffectVolume)}</p>
            </div>
            <div style={labelRowStyle}>
              <p style={controlLabelStyle}>Background Cloud Speed</p>
              <button
                type="button"
                onClick={() => {
                  const nextCloudEnabled = !cloudEnabled;
                  writeCloudEnabledToStorage(nextCloudEnabled);
                  setCloudEnabled(nextCloudEnabled);
                }}
                style={cloudEnabled ? disableCloudButtonStyle : disableCloudButtonActiveStyle}
                aria-label="Toggle cloud background">
                ×
              </button>
            </div>
            <div style={sliderRowStyle}>
              <input
                type="range"
                min={CLOUD_SPEED_MIN}
                max={CLOUD_SPEED_MAX}
                step={0.25}
                value={cloudSpeedMultiplier}
                onChange={(event) => {
                  const safeValue = writeCloudSpeedToStorage(
                    Number.parseFloat(event.currentTarget.value),
                  );
                  if (!cloudEnabled) {
                    writeCloudEnabledToStorage(true);
                    setCloudEnabled(true);
                  }
                  setCloudSpeedMultiplier(safeValue);
                }}
                style={sliderStyle}
                aria-label="Background cloud speed"
              />
              <p style={speedValueStyle}>{cloudSpeedLabel}</p>
            </div>
            <button
              type="button"
              style={clearProgressButtonStyle}
              onClick={() => setIsClearProgressConfirmOpen(true)}>
              <img
                src="/assets/mons/bomb.png"
                alt=""
                aria-hidden="true"
                style={clearProgressButtonIconStyle}
              />
              <span>Clear Site Progress</span>
            </button>
          </div>
        </div>
      </section>
      {isClearProgressConfirmOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm clear site progress"
          style={confirmOverlayStyle}
          onClick={() => setIsClearProgressConfirmOpen(false)}>
          <div style={confirmPanelStyle} onClick={(event) => event.stopPropagation()}>
            <p style={confirmTextStyle}>Are you sure? This cannot be undone.</p>
            <div style={confirmButtonRowStyle}>
              <button
                type="button"
                style={confirmButtonStyle}
                onClick={handleClearSiteProgress}>
                <svg viewBox="0 0 24 24" aria-hidden="true" style={confirmIconStyle} fill="none">
                  <path
                    d="M5.5 12.5L10 17L18.5 7"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Yes</span>
              </button>
              <button
                type="button"
                style={confirmButtonStyle}
                onClick={() => setIsClearProgressConfirmOpen(false)}>
                <svg viewBox="0 0 24 24" aria-hidden="true" style={confirmIconStyle} fill="none">
                  <path
                    d="M7 7L17 17M17 7L7 17"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>No</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </NewTopLayout>
  );
}
