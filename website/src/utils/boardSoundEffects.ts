import {
  getVolumeGain,
  readSoundEffectVolumeFromStorage,
} from '@site/src/constants/siteAudio';

export type BoardSoundEffectKey =
  | 'bomb'
  | 'choosePickup'
  | 'click'
  | 'demonAbility'
  | 'manaPickUp'
  | 'move'
  | 'mysticAbility'
  | 'pickupBomb'
  | 'pickupPotion'
  | 'scoreMana'
  | 'scoreSuperMana'
  | 'spiritAbility'
  | 'undo'
  | 'usePotion'
  | 'victory';

const SOUND_BASE_URL = 'https://assets.mons.link/sounds/';

const SOUND_FILE_BY_KEY: Record<BoardSoundEffectKey, string> = {
  bomb: 'bomb',
  choosePickup: 'choosePickup',
  click: 'click',
  demonAbility: 'demonAbility',
  manaPickUp: 'manaPickUp',
  move: 'move',
  mysticAbility: 'mysticAbility',
  pickupBomb: 'pickupBomb',
  pickupPotion: 'pickupPotion',
  scoreMana: 'scoreMana',
  scoreSuperMana: 'scoreSuperMana',
  spiritAbility: 'spiritAbility',
  undo: 'undo',
  usePotion: 'popSharp',
  victory: 'victory',
};

const DEFAULT_VOLUME_BY_KEY: Partial<Record<BoardSoundEffectKey, number>> = {};

const audioCache = new Map<BoardSoundEffectKey, HTMLAudioElement>();

function getSoundUrl(key: BoardSoundEffectKey): string {
  return `${SOUND_BASE_URL}${SOUND_FILE_BY_KEY[key]}.mp3`;
}

function getBaseAudio(key: BoardSoundEffectKey): HTMLAudioElement | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const cached = audioCache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  const audio = new Audio(getSoundUrl(key));
  audio.preload = 'auto';
  audio.load();
  audioCache.set(key, audio);
  return audio;
}

export function preloadBoardSoundEffects(
  keys: BoardSoundEffectKey[] = Object.keys(SOUND_FILE_BY_KEY) as BoardSoundEffectKey[],
): void {
  keys.forEach((key) => {
    getBaseAudio(key);
  });
}

export function playBoardSoundEffect(
  key: BoardSoundEffectKey,
  volumeMultiplier = 1,
): void {
  const baseAudio = getBaseAudio(key);
  if (baseAudio === null) {
    return;
  }
  const audio = baseAudio.cloneNode(true) as HTMLAudioElement;
  const baseVolume = DEFAULT_VOLUME_BY_KEY[key] ?? 1;
  const soundEffectGain = getVolumeGain(readSoundEffectVolumeFromStorage());
  audio.volume = Math.max(
    0,
    Math.min(1, baseVolume * soundEffectGain * volumeMultiplier),
  );
  audio.play().catch(() => {
    // Browser autoplay rules can still reject on non-gesture paths.
  });
}
