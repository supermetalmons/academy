import {
  getVolumeGain,
  readSoundEffectVolumeFromStorage,
} from '@site/src/constants/siteAudio';

export type SiteSoundEffectKey = 'guideClick' | 'pageButton' | 'galleryHover';

const SOUND_FILE_BY_KEY: Record<SiteSoundEffectKey, string> = {
  guideClick: '/assets/sounds/island-walk-to-mon-chip.mp3',
  pageButton: '/assets/sounds/p4.m4a',
  galleryHover: '/assets/sounds/p5.m4a',
};

const SOUND_VOLUME_MULTIPLIER_BY_KEY: Record<SiteSoundEffectKey, number> = {
  guideClick: 0.05,
  pageButton: 1,
  galleryHover: 1,
};

const audioCache = new Map<SiteSoundEffectKey, HTMLAudioElement>();
const preloadedSoundHrefs = new Set<string>();

function getAudioMimeType(href: string): string {
  if (href.endsWith('.mp3')) {
    return 'audio/mpeg';
  }
  if (href.endsWith('.m4a')) {
    return 'audio/mp4';
  }
  return 'audio/wav';
}

function preloadSoundHref(href: string): void {
  if (typeof document === 'undefined' || preloadedSoundHrefs.has(href)) {
    return;
  }
  preloadedSoundHrefs.add(href);
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'audio';
  link.href = href;
  link.type = getAudioMimeType(href);
  document.head.append(link);
}

function getBaseAudio(key: SiteSoundEffectKey): HTMLAudioElement | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const href = SOUND_FILE_BY_KEY[key];
  preloadSoundHref(href);
  const cached = audioCache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  const audio = new Audio(href);
  audio.preload = 'auto';
  audio.load();
  audioCache.set(key, audio);
  return audio;
}

export function preloadSiteSoundEffects(keys: SiteSoundEffectKey[]): void {
  keys.forEach((key) => {
    getBaseAudio(key);
  });
}

export function playSiteSoundEffect(key: SiteSoundEffectKey, volumeMultiplier = 1): void {
  const baseAudio = getBaseAudio(key);
  if (baseAudio === null) {
    return;
  }
  const audio = baseAudio.cloneNode(true) as HTMLAudioElement;
  audio.volume = Math.max(
    0,
    Math.min(
      1,
      getVolumeGain(readSoundEffectVolumeFromStorage()) *
        SOUND_VOLUME_MULTIPLIER_BY_KEY[key] *
        volumeMultiplier,
    ),
  );
  audio.play().catch(() => {
    // Browser autoplay rules can reject non-gesture playback.
  });
}
