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

const settingsTextShadow = '0 2px 8px rgba(0, 0, 0, 0.78)';

const titleStyle: CSSProperties = {
  margin: 0,
  color: '#fff',
  fontSize: '1.7rem',
  lineHeight: 1.1,
  fontWeight: 700,
  textAlign: 'center',
  textShadow: settingsTextShadow,
};

const controlGroupStyle: CSSProperties = {
  marginTop: 'calc(1.15rem + 15px)',
  display: 'grid',
  gap: '0.6rem',
  maxWidth: '430px',
};

const controlLabelStyle: CSSProperties = {
  margin: 0,
  color: '#fff',
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
  border: '1px solid rgba(255, 255, 255, 0.75)',
  borderRadius: '3px',
  backgroundColor: 'rgba(255, 255, 255, 0.17)',
  color: '#fff',
  fontSize: '0.95rem',
  lineHeight: 1,
  fontWeight: 700,
  cursor: 'pointer',
  textShadow: settingsTextShadow,
};

const disableCloudButtonActiveStyle: CSSProperties = {
  ...disableCloudButtonStyle,
  backgroundColor: 'rgba(0, 0, 0, 0.42)',
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
  color: '#fff',
  fontSize: '0.95rem',
  lineHeight: 1.1,
  fontWeight: 600,
  textShadow: settingsTextShadow,
};

export default function SettingsPage(): ReactNode {
  const [cloudEnabled, setCloudEnabled] = useState<boolean>(CLOUD_ENABLED_DEFAULT);
  const [cloudSpeedMultiplier, setCloudSpeedMultiplier] = useState<number>(CLOUD_SPEED_DEFAULT);

  useEffect(() => {
    setCloudEnabled(readCloudEnabledFromStorage());
    setCloudSpeedMultiplier(readCloudSpeedFromStorage());
  }, []);

  const cloudSpeedLabel = useMemo(
    () => (cloudEnabled ? `${cloudSpeedMultiplier.toFixed(2).replace(/\.00$/, '')}x` : '0x'),
    [cloudEnabled, cloudSpeedMultiplier],
  );

  return (
    <NewTopLayout>
      <section style={contentWrapStyle}>
        <div style={panelStyle}>
          <h2 style={titleStyle}>Settings</h2>
          <div style={controlGroupStyle}>
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
          </div>
        </div>
      </section>
    </NewTopLayout>
  );
}
