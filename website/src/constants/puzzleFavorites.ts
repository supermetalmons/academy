export const PUZZLE_FAVORITES_STORAGE_KEY = 'mons-academy-puzzle-favorites-v1';
export const PUZZLE_FAVORITES_EVENT_NAME = 'mons-academy-puzzle-favorites-change';
export const PUZZLE_COMPLETIONS_STORAGE_KEY = 'mons-academy-puzzle-completions-v1';
export const PUZZLE_COMPLETIONS_EVENT_NAME = 'mons-academy-puzzle-completions-change';

export const PUZZLE_IDS = ['restraint', 'cage-match', 'bombproof', 'split-formation'] as const;
export type PuzzleId = (typeof PUZZLE_IDS)[number];

const PUZZLE_ID_SET = new Set<string>(PUZZLE_IDS);

export function isPuzzleId(value: unknown): value is PuzzleId {
  return typeof value === 'string' && PUZZLE_ID_SET.has(value);
}

export function parsePuzzleFavorites(raw: string | null): Set<PuzzleId> {
  if (raw === null) {
    return new Set<PuzzleId>();
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return new Set<PuzzleId>();
    }
    return new Set<PuzzleId>(parsed.filter(isPuzzleId));
  } catch {
    return new Set<PuzzleId>();
  }
}

export function parsePuzzleCompletions(raw: string | null): Set<PuzzleId> {
  if (raw === null) {
    return new Set<PuzzleId>();
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return new Set<PuzzleId>();
    }
    return new Set<PuzzleId>(parsed.filter(isPuzzleId));
  } catch {
    return new Set<PuzzleId>();
  }
}

export function readPuzzleFavoritesFromStorage(): Set<PuzzleId> {
  if (typeof window === 'undefined') {
    return new Set<PuzzleId>();
  }
  try {
    return parsePuzzleFavorites(window.localStorage.getItem(PUZZLE_FAVORITES_STORAGE_KEY));
  } catch {
    return new Set<PuzzleId>();
  }
}

export function writePuzzleFavoritesToStorage(nextFavorites: Iterable<PuzzleId>): Set<PuzzleId> {
  const safeFavorites = new Set<PuzzleId>(Array.from(nextFavorites).filter(isPuzzleId));
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(PUZZLE_FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(safeFavorites)));
    } catch {
      // Ignore storage write issues.
    }
    window.dispatchEvent(
      new CustomEvent(PUZZLE_FAVORITES_EVENT_NAME, {
        detail: Array.from(safeFavorites),
      }),
    );
  }
  return safeFavorites;
}

export function readPuzzleCompletionsFromStorage(): Set<PuzzleId> {
  if (typeof window === 'undefined') {
    return new Set<PuzzleId>();
  }
  try {
    return parsePuzzleCompletions(window.localStorage.getItem(PUZZLE_COMPLETIONS_STORAGE_KEY));
  } catch {
    return new Set<PuzzleId>();
  }
}

export function writePuzzleCompletionsToStorage(nextCompletions: Iterable<PuzzleId>): Set<PuzzleId> {
  const safeCompletions = new Set<PuzzleId>(Array.from(nextCompletions).filter(isPuzzleId));
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(PUZZLE_COMPLETIONS_STORAGE_KEY, JSON.stringify(Array.from(safeCompletions)));
    } catch {
      // Ignore storage write issues.
    }
    window.dispatchEvent(
      new CustomEvent(PUZZLE_COMPLETIONS_EVENT_NAME, {
        detail: Array.from(safeCompletions),
      }),
    );
  }
  return safeCompletions;
}
