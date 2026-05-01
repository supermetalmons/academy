export const GUESTBOOK_SIGNED_STORAGE_KEY = 'mons-academy-guestbook-signed-v1';
export const GUESTBOOK_MINIMIZED_STORAGE_KEY = 'mons-academy-guestbook-minimized-v1';
export const GUESTBOOK_SIGNED_MESSAGE = 'thank you :)';

export function readGuestBookSignedFromStorage(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return window.localStorage.getItem(GUESTBOOK_SIGNED_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeGuestBookSignedToStorage(hasSigned: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    if (hasSigned) {
      window.localStorage.setItem(GUESTBOOK_SIGNED_STORAGE_KEY, '1');
    } else {
      window.localStorage.removeItem(GUESTBOOK_SIGNED_STORAGE_KEY);
    }
  } catch {
    // Ignore storage write issues.
  }
}

export function readGuestBookMinimizedFromStorage(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return window.localStorage.getItem(GUESTBOOK_MINIMIZED_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeGuestBookMinimizedToStorage(isMinimized: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    if (isMinimized) {
      window.localStorage.setItem(GUESTBOOK_MINIMIZED_STORAGE_KEY, '1');
    } else {
      window.localStorage.removeItem(GUESTBOOK_MINIMIZED_STORAGE_KEY);
    }
  } catch {
    // Ignore storage write issues.
  }
}
