export const LESSON_FAVORITES_STORAGE_KEY = 'mons-academy-lesson-favorites-v1';
export const LESSON_FAVORITES_EVENT_NAME = 'mons-academy-lesson-favorites-change';
export const LESSON_COMPLETIONS_STORAGE_KEY = 'mons-academy-lesson-completions-v1';
export const LESSON_COMPLETIONS_EVENT_NAME = 'mons-academy-lesson-completions-change';

export const LESSON_IDS = ['white-openings', 'strong-techniques'] as const;
export type LessonId = (typeof LESSON_IDS)[number];

const LESSON_ID_SET = new Set<string>(LESSON_IDS);

export function isLessonId(value: unknown): value is LessonId {
  return typeof value === 'string' && LESSON_ID_SET.has(value);
}

export function parseLessonFavorites(raw: string | null): Set<LessonId> {
  if (raw === null) {
    return new Set<LessonId>();
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return new Set<LessonId>();
    }
    return new Set<LessonId>(parsed.filter(isLessonId));
  } catch {
    return new Set<LessonId>();
  }
}

export function parseLessonCompletions(raw: string | null): Set<LessonId> {
  if (raw === null) {
    return new Set<LessonId>();
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return new Set<LessonId>();
    }
    return new Set<LessonId>(parsed.filter(isLessonId));
  } catch {
    return new Set<LessonId>();
  }
}

export function readLessonFavoritesFromStorage(): Set<LessonId> {
  if (typeof window === 'undefined') {
    return new Set<LessonId>();
  }
  try {
    return parseLessonFavorites(window.localStorage.getItem(LESSON_FAVORITES_STORAGE_KEY));
  } catch {
    return new Set<LessonId>();
  }
}

export function readLessonCompletionsFromStorage(): Set<LessonId> {
  if (typeof window === 'undefined') {
    return new Set<LessonId>();
  }
  try {
    return parseLessonCompletions(window.localStorage.getItem(LESSON_COMPLETIONS_STORAGE_KEY));
  } catch {
    return new Set<LessonId>();
  }
}

export function writeLessonFavoritesToStorage(nextFavorites: Iterable<LessonId>): Set<LessonId> {
  const safeFavorites = new Set<LessonId>(Array.from(nextFavorites).filter(isLessonId));
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LESSON_FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(safeFavorites)));
    } catch {
      // Ignore storage write issues.
    }
    window.dispatchEvent(
      new CustomEvent(LESSON_FAVORITES_EVENT_NAME, {
        detail: Array.from(safeFavorites),
      }),
    );
  }
  return safeFavorites;
}

export function writeLessonCompletionsToStorage(nextCompletions: Iterable<LessonId>): Set<LessonId> {
  const safeCompletions = new Set<LessonId>(Array.from(nextCompletions).filter(isLessonId));
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LESSON_COMPLETIONS_STORAGE_KEY, JSON.stringify(Array.from(safeCompletions)));
    } catch {
      // Ignore storage write issues.
    }
    window.dispatchEvent(
      new CustomEvent(LESSON_COMPLETIONS_EVENT_NAME, {
        detail: Array.from(safeCompletions),
      }),
    );
  }
  return safeCompletions;
}
