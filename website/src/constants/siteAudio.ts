export const MUSIC_VOLUME_STORAGE_KEY = 'mons_music_volume_v1';
export const MUSIC_VOLUME_EVENT_NAME = 'mons-music-volume-change';
export const SOUND_EFFECT_VOLUME_STORAGE_KEY = 'mons_sound_effect_volume_v1';
export const SOUND_EFFECT_VOLUME_EVENT_NAME = 'mons-sound-effect-volume-change';
export const SITE_AUDIO_VOLUME_MIN = 0;
export const SITE_AUDIO_VOLUME_MAX = 1;
export const MUSIC_VOLUME_DEFAULT = 1;
export const SOUND_EFFECT_VOLUME_DEFAULT = 1;

function clampVolume(value: number, fallback: number): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(SITE_AUDIO_VOLUME_MAX, Math.max(SITE_AUDIO_VOLUME_MIN, value));
}

export function parseMusicVolume(value: unknown): number {
  if (typeof value === 'number') {
    return clampVolume(value, MUSIC_VOLUME_DEFAULT);
  }
  if (typeof value === 'string') {
    return clampVolume(Number.parseFloat(value), MUSIC_VOLUME_DEFAULT);
  }
  return MUSIC_VOLUME_DEFAULT;
}

export function parseSoundEffectVolume(value: unknown): number {
  if (typeof value === 'number') {
    return clampVolume(value, SOUND_EFFECT_VOLUME_DEFAULT);
  }
  if (typeof value === 'string') {
    return clampVolume(Number.parseFloat(value), SOUND_EFFECT_VOLUME_DEFAULT);
  }
  return SOUND_EFFECT_VOLUME_DEFAULT;
}

export function readMusicVolumeFromStorage(): number {
  if (typeof window === 'undefined') {
    return MUSIC_VOLUME_DEFAULT;
  }
  try {
    return parseMusicVolume(window.localStorage.getItem(MUSIC_VOLUME_STORAGE_KEY));
  } catch {
    return MUSIC_VOLUME_DEFAULT;
  }
}

export function writeMusicVolumeToStorage(nextValue: number): number {
  const safeValue = clampVolume(nextValue, MUSIC_VOLUME_DEFAULT);
  if (typeof window === 'undefined') {
    return safeValue;
  }
  try {
    window.localStorage.setItem(MUSIC_VOLUME_STORAGE_KEY, safeValue.toFixed(2));
  } catch {
    // Ignore storage write issues.
  }
  window.dispatchEvent(new CustomEvent(MUSIC_VOLUME_EVENT_NAME, {detail: safeValue}));
  return safeValue;
}

export function readSoundEffectVolumeFromStorage(): number {
  if (typeof window === 'undefined') {
    return SOUND_EFFECT_VOLUME_DEFAULT;
  }
  try {
    return parseSoundEffectVolume(window.localStorage.getItem(SOUND_EFFECT_VOLUME_STORAGE_KEY));
  } catch {
    return SOUND_EFFECT_VOLUME_DEFAULT;
  }
}

export function writeSoundEffectVolumeToStorage(nextValue: number): number {
  const safeValue = clampVolume(nextValue, SOUND_EFFECT_VOLUME_DEFAULT);
  if (typeof window === 'undefined') {
    return safeValue;
  }
  try {
    window.localStorage.setItem(SOUND_EFFECT_VOLUME_STORAGE_KEY, safeValue.toFixed(2));
  } catch {
    // Ignore storage write issues.
  }
  window.dispatchEvent(new CustomEvent(SOUND_EFFECT_VOLUME_EVENT_NAME, {detail: safeValue}));
  return safeValue;
}

export function getVolumeGain(value: number): number {
  const safeValue = clampVolume(value, 1);
  return safeValue * safeValue;
}
