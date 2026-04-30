import {useEffect, useState} from 'react';

export type SiteBoardTheme = 'light' | 'dark';

export const BOARD_STYLE_STORAGE_KEY = 'mons_board_style_v1';
export const BOARD_STYLE_EVENT_NAME = 'mons-board-style-change';
export const BOARD_STYLE_DEFAULT: SiteBoardTheme = 'light';

export function parseSiteBoardTheme(value: unknown): SiteBoardTheme {
  return value === 'dark' ? 'dark' : BOARD_STYLE_DEFAULT;
}

export function readSiteBoardThemeFromStorage(): SiteBoardTheme {
  if (typeof window === 'undefined') {
    return BOARD_STYLE_DEFAULT;
  }
  try {
    return parseSiteBoardTheme(window.localStorage.getItem(BOARD_STYLE_STORAGE_KEY));
  } catch {
    return BOARD_STYLE_DEFAULT;
  }
}

export function writeSiteBoardThemeToStorage(nextTheme: SiteBoardTheme): SiteBoardTheme {
  const safeTheme = parseSiteBoardTheme(nextTheme);
  if (typeof window === 'undefined') {
    return safeTheme;
  }
  try {
    window.localStorage.setItem(BOARD_STYLE_STORAGE_KEY, safeTheme);
  } catch {
    // Ignore storage write issues.
  }
  window.dispatchEvent(new CustomEvent(BOARD_STYLE_EVENT_NAME, {detail: safeTheme}));
  return safeTheme;
}

export function useSiteBoardTheme(): SiteBoardTheme {
  const [boardTheme, setBoardTheme] = useState<SiteBoardTheme>(BOARD_STYLE_DEFAULT);

  useEffect(() => {
    const updateBoardTheme = () => {
      setBoardTheme(readSiteBoardThemeFromStorage());
    };
    updateBoardTheme();
    if (typeof window === 'undefined') {
      return;
    }
    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key === BOARD_STYLE_STORAGE_KEY) {
        updateBoardTheme();
      }
    };
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener(BOARD_STYLE_EVENT_NAME, updateBoardTheme as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener(BOARD_STYLE_EVENT_NAME, updateBoardTheme as EventListener);
    };
  }, []);

  return boardTheme;
}
