export const CLOUD_SPEED_STORAGE_KEY = 'mons_cloud_speed_factor_v1';
export const CLOUD_SPEED_EVENT_NAME = 'mons-cloud-speed-change';
export const CLOUD_ENABLED_STORAGE_KEY = 'mons_cloud_enabled_v1';
export const CLOUD_ENABLED_EVENT_NAME = 'mons-cloud-enabled-change';
export const CLOUD_SPEED_MIN = 1;
export const CLOUD_SPEED_MAX = 15;
export const CLOUD_SPEED_DEFAULT = 2.5;
export const CLOUD_ENABLED_DEFAULT = true;

export function clampCloudSpeed(value: number): number {
  if (Number.isNaN(value)) {
    return CLOUD_SPEED_DEFAULT;
  }
  return Math.min(CLOUD_SPEED_MAX, Math.max(CLOUD_SPEED_MIN, value));
}

export function parseCloudSpeed(value: unknown): number {
  if (typeof value === 'number') {
    return clampCloudSpeed(value);
  }
  if (typeof value === 'string') {
    return clampCloudSpeed(Number.parseFloat(value));
  }
  return CLOUD_SPEED_DEFAULT;
}

export function readCloudSpeedFromStorage(): number {
  if (typeof window === 'undefined') {
    return CLOUD_SPEED_DEFAULT;
  }
  try {
    return parseCloudSpeed(window.localStorage.getItem(CLOUD_SPEED_STORAGE_KEY));
  } catch {
    return CLOUD_SPEED_DEFAULT;
  }
}

export function writeCloudSpeedToStorage(nextValue: number): number {
  const safeValue = clampCloudSpeed(nextValue);
  if (typeof window === 'undefined') {
    return safeValue;
  }
  try {
    window.localStorage.setItem(CLOUD_SPEED_STORAGE_KEY, safeValue.toFixed(2));
  } catch {
    // Ignore storage write issues.
  }
  window.dispatchEvent(new CustomEvent(CLOUD_SPEED_EVENT_NAME, {detail: safeValue}));
  return safeValue;
}

export function parseCloudEnabled(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'false' || normalized === '0' || normalized === 'off' || normalized === 'no') {
      return false;
    }
    if (normalized === 'true' || normalized === '1' || normalized === 'on' || normalized === 'yes') {
      return true;
    }
  }
  return CLOUD_ENABLED_DEFAULT;
}

export function readCloudEnabledFromStorage(): boolean {
  if (typeof window === 'undefined') {
    return CLOUD_ENABLED_DEFAULT;
  }
  try {
    return parseCloudEnabled(window.localStorage.getItem(CLOUD_ENABLED_STORAGE_KEY));
  } catch {
    return CLOUD_ENABLED_DEFAULT;
  }
}

export function writeCloudEnabledToStorage(nextValue: boolean): boolean {
  const safeValue = Boolean(nextValue);
  if (typeof window === 'undefined') {
    return safeValue;
  }
  try {
    window.localStorage.setItem(CLOUD_ENABLED_STORAGE_KEY, safeValue ? '1' : '0');
  } catch {
    // Ignore storage write issues.
  }
  window.dispatchEvent(new CustomEvent(CLOUD_ENABLED_EVENT_NAME, {detail: safeValue}));
  return safeValue;
}
