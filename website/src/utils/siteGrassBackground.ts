import {useEffect, useState} from 'react';

export type SiteGrassBackground = 'pixel' | 'watercolor';

export const GRASS_BACKGROUND_STORAGE_KEY = 'mons_grass_background_v1';
export const GRASS_BACKGROUND_EVENT_NAME = 'mons-grass-background-change';
export const GRASS_BACKGROUND_DEFAULT: SiteGrassBackground = 'pixel';

export function parseSiteGrassBackground(value: unknown): SiteGrassBackground {
  return value === 'watercolor' ? 'watercolor' : GRASS_BACKGROUND_DEFAULT;
}

export function readSiteGrassBackgroundFromStorage(): SiteGrassBackground {
  if (typeof window === 'undefined') {
    return GRASS_BACKGROUND_DEFAULT;
  }
  try {
    return parseSiteGrassBackground(window.localStorage.getItem(GRASS_BACKGROUND_STORAGE_KEY));
  } catch {
    return GRASS_BACKGROUND_DEFAULT;
  }
}

export function writeSiteGrassBackgroundToStorage(
  nextBackground: SiteGrassBackground,
): SiteGrassBackground {
  const safeBackground = parseSiteGrassBackground(nextBackground);
  if (typeof window === 'undefined') {
    return safeBackground;
  }
  try {
    window.localStorage.setItem(GRASS_BACKGROUND_STORAGE_KEY, safeBackground);
  } catch {
    // Ignore storage write issues.
  }
  window.dispatchEvent(
    new CustomEvent(GRASS_BACKGROUND_EVENT_NAME, {detail: safeBackground}),
  );
  return safeBackground;
}

export function useSiteGrassBackground(): SiteGrassBackground {
  const [grassBackground, setGrassBackground] =
    useState<SiteGrassBackground>(GRASS_BACKGROUND_DEFAULT);

  useEffect(() => {
    const updateGrassBackground = () => {
      setGrassBackground(readSiteGrassBackgroundFromStorage());
    };
    updateGrassBackground();
    if (typeof window === 'undefined') {
      return;
    }
    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key === GRASS_BACKGROUND_STORAGE_KEY) {
        updateGrassBackground();
      }
    };
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener(
      GRASS_BACKGROUND_EVENT_NAME,
      updateGrassBackground as EventListener,
    );
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener(
        GRASS_BACKGROUND_EVENT_NAME,
        updateGrassBackground as EventListener,
      );
    };
  }, []);

  return grassBackground;
}
