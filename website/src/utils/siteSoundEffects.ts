import {
  getVolumeGain,
  readSoundEffectVolumeFromStorage,
} from '@site/src/constants/siteAudio';

export type SiteSoundEffectKey =
  | 'guideClick'
  | 'pageButton'
  | 'galleryHover'
  | 'completion'
  | 'incorrectPuzzle'
  | 'viewerShuffle'
  | 'viewerUndo'
  | 'favoriteOn'
  | 'favoriteOff';

const SOUND_FILE_BY_KEY: Record<SiteSoundEffectKey, string> = {
  guideClick: '/assets/sounds/island-walk-to-mon-chip.mp3',
  pageButton: '/assets/sounds/p4.m4a',
  galleryHover: '/assets/sounds/p5.m4a',
  completion: '/assets/sounds/swag-2.wav',
  incorrectPuzzle: '/assets/sounds/oh-1.wav',
  viewerShuffle: '/assets/sounds/viewer-click.wav',
  viewerUndo: '/assets/sounds/viewer-click2.wav',
  favoriteOn: '/assets/sounds/favorite-open5.wav',
  favoriteOff: '/assets/sounds/favorite-close.wav',
};

const SOUND_VOLUME_MULTIPLIER_BY_KEY: Record<SiteSoundEffectKey, number> = {
  guideClick: 0.05,
  pageButton: 0.55,
  galleryHover: 1,
  completion: 1,
  incorrectPuzzle: 0.72,
  viewerShuffle: 0.62,
  viewerUndo: 0.62,
  favoriteOn: 0.62,
  favoriteOff: 0.22,
};

const PAGE_BUTTON_MIN_PLAYBACK_RATE = 0.84;
const PAGE_BUTTON_MAX_PLAYBACK_RATE = 1.18;

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

export function playFavoriteChangeSound(isAddingFavorite: boolean): void {
  playSiteSoundEffect(isAddingFavorite ? 'favoriteOn' : 'favoriteOff');
}

export function playSiteSoundEffect(key: SiteSoundEffectKey, volumeMultiplier = 1): void {
  const baseAudio = getBaseAudio(key);
  if (baseAudio === null) {
    return;
  }
  const audio = key === 'completion' ? baseAudio : (baseAudio.cloneNode(true) as HTMLAudioElement);
  if (key === 'completion') {
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch {
      // Some browsers reject seeking before metadata is ready.
    }
  }
  if (key === 'pageButton') {
    audio.playbackRate =
      PAGE_BUTTON_MIN_PLAYBACK_RATE +
      Math.random() * (PAGE_BUTTON_MAX_PLAYBACK_RATE - PAGE_BUTTON_MIN_PLAYBACK_RATE);
    audio.preservesPitch = false;
  }
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
