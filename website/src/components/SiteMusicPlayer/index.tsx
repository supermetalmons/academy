import type {CSSProperties, ReactNode} from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  MUSIC_VOLUME_DEFAULT,
  MUSIC_VOLUME_EVENT_NAME,
  MUSIC_VOLUME_STORAGE_KEY,
  getVolumeGain,
  parseMusicVolume,
  readMusicVolumeFromStorage,
  writeMusicVolumeToStorage,
} from '@site/src/constants/siteAudio';

export type SupermonsTrack = {
  fileName: string;
  title: string;
};

export type MusicLoopMode = 'off' | 'all' | 'one';

const trackFiles = [
  '1cloud propeller.wav',
  '2bell glide.wav',
  '3bell dance.wav',
  '4organwhawha.wav',
  '5chimes photography_going home.wav',
  '6ping.wav',
  '7clock tower.wav',
  '9cloud propeller 2.wav',
  '10jelly jam.wav',
  '11bubble jam.wav',
  '12spirit track.wav',
  '13bounce.wav',
  '14gilded.wav',
  '15mana pool.wav',
  '16honkshoooo memememeee zzzZZZ.wav',
  '17arploop.wav',
  '18whale2.wav',
  '19gustofwind.wav',
  '20ewejam.wav',
  '21change.wav',
  '22melodine.wav',
  '23driver.wav',
  '24object.wav',
  '25runner.wav',
  '26band.wav',
  '27crumbs.wav',
  '28buzz.wav',
  '29drreams.wav',
  '30super.wav',
] as const;

export const supermonsTracks: SupermonsTrack[] = trackFiles.map((fileName) => {
  const title = fileName
    .replace(/\.[^.]+$/, '')
    .replace(/^\d+/, '')
    .replace(/_/g, ' ')
    .trim();
  return {fileName, title};
});

type PersistedMusicPlayerState = {
  hasActivated?: boolean;
  isMiniControlsVisible?: boolean;
  currentTrackIndex?: number;
  isShuffleEnabled?: boolean;
  isFavoritesOnlyEnabled?: boolean;
  favoriteTrackFileNames?: string[];
  loopMode?: MusicLoopMode;
  isLoopEnabled?: boolean;
};

type SiteMusicPlayerValue = {
  audioElement: HTMLAudioElement | null;
  tracks: SupermonsTrack[];
  currentTrack: SupermonsTrack;
  currentTrackIndex: number;
  isPlaying: boolean;
  isShuffleEnabled: boolean;
  isFavoritesOnlyEnabled: boolean;
  favoriteTrackFileNames: string[];
  loopMode: MusicLoopMode;
  currentTime: number;
  duration: number;
  hasActivated: boolean;
  isMiniControlsVisible: boolean;
  musicVolume: number;
  play: () => void;
  playRandomTrack: () => void;
  pause: () => void;
  togglePlay: () => void;
  hideMiniControls: () => void;
  skipTrack: (direction: 1 | -1) => void;
  selectTrack: (nextIndex: number, shouldPlay?: boolean) => void;
  setShuffleEnabled: (enabled: boolean) => void;
  setFavoritesOnlyEnabled: (enabled: boolean) => void;
  toggleFavoriteTrack: (fileName: string) => void;
  setLoopMode: (mode: MusicLoopMode) => void;
  setMusicVolume: (volume: number) => void;
  seek: (nextTime: number) => void;
};

const SiteMusicPlayerContext = createContext<SiteMusicPlayerValue | null>(null);
const MUSIC_PLAYER_STORAGE_KEY = 'mons-academy-music-player-v1';
const allTrackIndexes = supermonsTracks.map((_, index) => index);

const hiddenAudioStyle: CSSProperties = {
  display: 'none',
};

const miniControlsWrapStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.28rem',
  padding: 0,
  position: 'absolute',
  right: '0.9rem',
  bottom: '-31px',
  zIndex: 9997,
};

const miniControlButtonStyle: CSSProperties = {
  width: '30px',
  height: '25px',
  border: '1px solid #000',
  borderRadius: 0,
  backgroundColor: '#fff',
  color: '#000',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  cursor: 'pointer',
  transition: 'transform 140ms ease, filter 140ms ease',
};

const miniControlIconStyle: CSSProperties = {
  width: '15px',
  height: '15px',
  display: 'block',
};

function getTrackSrc(fileName: string): string {
  return `/assets/supermons-tracks/${encodeURIComponent(fileName)}`;
}

function readPersistedMusicPlayerState(): PersistedMusicPlayerState | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const rawValue = window.localStorage.getItem(MUSIC_PLAYER_STORAGE_KEY);
    if (rawValue === null) {
      return null;
    }
    const parsedValue = JSON.parse(rawValue) as PersistedMusicPlayerState;
    const validTrackFileNames = new Set(supermonsTracks.map((track) => track.fileName));
    const favoriteTrackFileNames = Array.isArray(parsedValue.favoriteTrackFileNames)
      ? parsedValue.favoriteTrackFileNames.filter(
          (fileName, index, allFileNames): fileName is string =>
            typeof fileName === 'string' &&
            validTrackFileNames.has(fileName) &&
            allFileNames.indexOf(fileName) === index,
        )
      : [];
    const currentTrackIndex =
      typeof parsedValue.currentTrackIndex === 'number' &&
      parsedValue.currentTrackIndex >= 0 &&
      parsedValue.currentTrackIndex < supermonsTracks.length
        ? parsedValue.currentTrackIndex
        : 0;
    return {
      hasActivated: parsedValue.hasActivated === true,
      isMiniControlsVisible:
        parsedValue.isMiniControlsVisible === true ||
        (parsedValue.isMiniControlsVisible === undefined && parsedValue.hasActivated === true),
      currentTrackIndex,
      isShuffleEnabled: parsedValue.isShuffleEnabled === true,
      isFavoritesOnlyEnabled: parsedValue.isFavoritesOnlyEnabled === true,
      favoriteTrackFileNames,
      loopMode:
        parsedValue.loopMode === 'off' ||
        parsedValue.loopMode === 'all' ||
        parsedValue.loopMode === 'one'
          ? parsedValue.loopMode
          : parsedValue.isLoopEnabled === true
            ? 'one'
            : 'off',
    };
  } catch {
    return null;
  }
}

function renderMiniIcon(kind: 'previous' | 'play' | 'pause' | 'next'): ReactNode {
  if (kind === 'play') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" style={miniControlIconStyle} fill="currentColor">
        <path d="M8 5.2v13.6L18.8 12 8 5.2Z" />
      </svg>
    );
  }
  if (kind === 'pause') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" style={miniControlIconStyle} fill="currentColor">
        <path d="M7 5h3.6v14H7V5Zm6.4 0H17v14h-3.6V5Z" />
      </svg>
    );
  }
  if (kind === 'previous') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" style={miniControlIconStyle} fill="currentColor">
        <path d="M6 5h2.2v14H6V5Zm3.7 7 8.3-6.3v12.6L9.7 12Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={miniControlIconStyle} fill="currentColor">
      <path d="M15.8 5H18v14h-2.2V5ZM6 5.7 14.3 12 6 18.3V5.7Z" />
    </svg>
  );
}

export function SiteMusicPlayerProvider({children}: {children: ReactNode}): ReactNode {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const initialMusicState = useMemo(() => readPersistedMusicPlayerState(), []);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(
    initialMusicState?.currentTrackIndex ?? 0,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(
    initialMusicState?.isShuffleEnabled ?? false,
  );
  const [isFavoritesOnlyEnabled, setIsFavoritesOnlyEnabledState] = useState(
    initialMusicState?.isFavoritesOnlyEnabled ?? false,
  );
  const [favoriteTrackFileNames, setFavoriteTrackFileNames] = useState<string[]>(
    initialMusicState?.favoriteTrackFileNames ?? [],
  );
  const [loopMode, setLoopMode] = useState<MusicLoopMode>(initialMusicState?.loopMode ?? 'off');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasActivated, setHasActivated] = useState(initialMusicState?.hasActivated ?? false);
  const [isMiniControlsVisible, setIsMiniControlsVisible] = useState(
    initialMusicState?.isMiniControlsVisible ?? initialMusicState?.hasActivated ?? false,
  );
  const [musicVolume, setMusicVolume] = useState(MUSIC_VOLUME_DEFAULT);

  const handleAudioRef = useCallback((node: HTMLAudioElement | null) => {
    audioRef.current = node;
    setAudioElement(node);
  }, []);

  const currentTrack = supermonsTracks[currentTrackIndex];
  const currentTrackSrc = useMemo(() => getTrackSrc(currentTrack.fileName), [currentTrack.fileName]);
  const favoriteTrackFileNameSet = useMemo(
    () => new Set(favoriteTrackFileNames),
    [favoriteTrackFileNames],
  );
  const favoriteTrackIndexes = useMemo(
    () =>
      supermonsTracks.flatMap((track, index) =>
        favoriteTrackFileNameSet.has(track.fileName) ? [index] : [],
      ),
    [favoriteTrackFileNameSet],
  );
  const playbackTrackIndexes =
    isFavoritesOnlyEnabled ? favoriteTrackIndexes : allTrackIndexes;

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    void audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setHasActivated(true);
        setIsMiniControlsVisible(true);
      })
      .catch(() => setIsPlaying(false));
  }, []);

  const playTrackFromStart = useCallback((nextIndex: number) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    const boundedIndex =
      Number.isFinite(nextIndex) && nextIndex >= 0 && nextIndex < supermonsTracks.length
        ? Math.floor(nextIndex)
        : 0;
    setCurrentTrackIndex(boundedIndex);
    setCurrentTime(0);
    setIsPlaying(true);
    setHasActivated(true);
    setIsMiniControlsVisible(true);
    const nextSrc = getTrackSrc(supermonsTracks[boundedIndex].fileName);
    audio.preload = 'auto';
    audio.src = nextSrc;
    audio.load();
    try {
      audio.currentTime = 0;
    } catch {
      // Some browsers reject seeking before metadata is available.
    }
    void audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setHasActivated(true);
        setIsMiniControlsVisible(true);
      })
      .catch(() => setIsPlaying(false));
  }, []);

  const playRandomTrack = useCallback(() => {
    setIsShuffleEnabled(true);
    setLoopMode('all');
    playTrackFromStart(Math.floor(Math.random() * supermonsTracks.length));
  }, [playTrackFromStart]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.pause();
    setIsPlaying(false);
  }, []);

  const getNextTrackIndex = useCallback(
    (direction: 1 | -1) => {
      const trackIndexes = isFavoritesOnlyEnabled ? favoriteTrackIndexes : allTrackIndexes;
      if (trackIndexes.length === 0) {
        return currentTrackIndex;
      }
      if (isShuffleEnabled && trackIndexes.length > 1) {
        let nextIndex = currentTrackIndex;
        while (nextIndex === currentTrackIndex) {
          nextIndex = trackIndexes[Math.floor(Math.random() * trackIndexes.length)];
        }
        return nextIndex;
      }
      const currentPlaybackIndex = trackIndexes.indexOf(currentTrackIndex);
      if (currentPlaybackIndex === -1) {
        return direction === 1 ? trackIndexes[0] : trackIndexes[trackIndexes.length - 1];
      }
      return trackIndexes[
        (currentPlaybackIndex + direction + trackIndexes.length) % trackIndexes.length
      ];
    },
    [currentTrackIndex, favoriteTrackIndexes, isFavoritesOnlyEnabled, isShuffleEnabled],
  );

  const selectTrack = useCallback(
    (nextIndex: number, shouldPlay = isPlaying) => {
      setCurrentTrackIndex(nextIndex);
      setCurrentTime(0);
      if (shouldPlay) {
        setIsPlaying(true);
        setHasActivated(true);
        setIsMiniControlsVisible(true);
      }
    },
    [isPlaying],
  );

  const hideMiniControls = useCallback(() => {
    setIsMiniControlsVisible(false);
  }, []);

  const skipTrack = useCallback(
    (direction: 1 | -1) => {
      selectTrack(getNextTrackIndex(direction), isPlaying);
    },
    [getNextTrackIndex, isPlaying, selectTrack],
  );

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
      return;
    }
    play();
  }, [isPlaying, pause, play]);

  const setFavoritesOnlyEnabled = useCallback(
    (enabled: boolean) => {
      setIsFavoritesOnlyEnabledState(enabled);
      if (
        enabled &&
        !favoriteTrackIndexes.includes(currentTrackIndex) &&
        favoriteTrackIndexes[0] !== undefined
      ) {
        selectTrack(favoriteTrackIndexes[0], isPlaying);
      }
    },
    [currentTrackIndex, favoriteTrackIndexes, isPlaying, selectTrack],
  );

  const toggleFavoriteTrack = useCallback(
    (fileName: string) => {
      setFavoriteTrackFileNames((current) => {
        const isAlreadyFavorite = current.includes(fileName);
        if (isAlreadyFavorite) {
          return current.filter((favoriteFileName) => favoriteFileName !== fileName);
        }
        if (!supermonsTracks.some((track) => track.fileName === fileName)) {
          return current;
        }
        return [...current, fileName];
      });
    },
    [],
  );

  const seek = useCallback((nextTime: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = nextTime;
    }
    setCurrentTime(nextTime);
  }, []);

  const updateMusicVolume = useCallback((nextVolume: number) => {
    const safeVolume = writeMusicVolumeToStorage(nextVolume);
    setMusicVolume(safeVolume);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      play();
    }
  }, [currentTrackSrc, isPlaying, play]);

  useEffect(() => {
    if (!isFavoritesOnlyEnabled) {
      return;
    }
    if (favoriteTrackIndexes[0] === undefined) {
      return;
    }
    if (!favoriteTrackIndexes.includes(currentTrackIndex)) {
      selectTrack(favoriteTrackIndexes[0], isPlaying);
    }
  }, [
    currentTrackIndex,
    favoriteTrackIndexes,
    isFavoritesOnlyEnabled,
    isPlaying,
    selectTrack,
  ]);

  useEffect(() => {
    const updateMusicVolume = () => {
      setMusicVolume(readMusicVolumeFromStorage());
    };
    updateMusicVolume();
    if (typeof window === 'undefined') {
      return;
    }
    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key === MUSIC_VOLUME_STORAGE_KEY) {
        setMusicVolume(parseMusicVolume(event.newValue));
      }
    };
    const handleVolumeUpdate = (event: Event) => {
      const volumeEvent = event as CustomEvent<number>;
      setMusicVolume(parseMusicVolume(volumeEvent.detail));
    };
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener(MUSIC_VOLUME_EVENT_NAME, handleVolumeUpdate as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener(MUSIC_VOLUME_EVENT_NAME, handleVolumeUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current !== null) {
      audioRef.current.volume = getVolumeGain(musicVolume);
    }
  }, [musicVolume]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(
        MUSIC_PLAYER_STORAGE_KEY,
        JSON.stringify({
          hasActivated,
          isMiniControlsVisible,
          currentTrackIndex,
          isShuffleEnabled,
          isFavoritesOnlyEnabled,
          favoriteTrackFileNames,
          loopMode,
        }),
      );
    } catch {
      // Ignore storage failures.
    }
  }, [
    currentTrackIndex,
    favoriteTrackFileNames,
    hasActivated,
    isFavoritesOnlyEnabled,
    isMiniControlsVisible,
    isShuffleEnabled,
    loopMode,
  ]);

  const value = useMemo(
    () => ({
      audioElement,
      tracks: supermonsTracks,
      currentTrack,
      currentTrackIndex,
      isPlaying,
      isShuffleEnabled,
      isFavoritesOnlyEnabled,
      favoriteTrackFileNames,
      loopMode,
      currentTime,
      duration,
      hasActivated,
      isMiniControlsVisible,
      musicVolume,
      play,
      playRandomTrack,
      pause,
      togglePlay,
      hideMiniControls,
      skipTrack,
      selectTrack,
      setShuffleEnabled: setIsShuffleEnabled,
      setFavoritesOnlyEnabled,
      toggleFavoriteTrack,
      setLoopMode,
      setMusicVolume: updateMusicVolume,
      seek,
    }),
    [
      audioElement,
      currentTrack,
      currentTrackIndex,
      currentTime,
      duration,
      favoriteTrackFileNames,
      hasActivated,
      isFavoritesOnlyEnabled,
      hideMiniControls,
      isMiniControlsVisible,
      isPlaying,
      isShuffleEnabled,
      loopMode,
      musicVolume,
      pause,
      play,
      playRandomTrack,
      seek,
      setFavoritesOnlyEnabled,
      selectTrack,
      skipTrack,
      togglePlay,
      toggleFavoriteTrack,
      updateMusicVolume,
    ],
  );

  return (
    <SiteMusicPlayerContext.Provider value={value}>
      <audio
        ref={handleAudioRef}
        src={currentTrackSrc}
        preload="metadata"
        style={hiddenAudioStyle}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onEnded={() => {
          if (loopMode === 'one') {
            const audio = audioRef.current;
            if (audio) {
              audio.currentTime = 0;
              play();
            }
            return;
          }
          const currentPlaybackIndex = playbackTrackIndexes.indexOf(currentTrackIndex);
          const isLastTrack =
            !isShuffleEnabled &&
            playbackTrackIndexes.length > 0 &&
            currentPlaybackIndex >= playbackTrackIndexes.length - 1;
          if (loopMode === 'off' && isLastTrack) {
            const audio = audioRef.current;
            if (audio) {
              audio.currentTime = 0;
            }
            setCurrentTime(0);
            setIsPlaying(false);
            return;
          }
          selectTrack(getNextTrackIndex(1), true);
        }}
      />
      {children}
    </SiteMusicPlayerContext.Provider>
  );
}

export function useSiteMusicPlayer(): SiteMusicPlayerValue {
  const context = useContext(SiteMusicPlayerContext);
  if (!context) {
    throw new Error('useSiteMusicPlayer must be used inside SiteMusicPlayerProvider.');
  }
  return context;
}

export function MiniSiteMusicControls({
  hidden = false,
  forceVisible = false,
  randomizeWhenForced = false,
}: {
  hidden?: boolean;
  forceVisible?: boolean;
  randomizeWhenForced?: boolean;
}): ReactNode {
  const {
    isMiniControlsVisible,
    isPlaying,
    playRandomTrack,
    skipTrack,
    togglePlay,
  } = useSiteMusicPlayer();

  if (hidden || (!forceVisible && !isMiniControlsVisible)) {
    return null;
  }

  const handleTogglePlay = (): void => {
    if (!isPlaying && randomizeWhenForced) {
      playRandomTrack();
      return;
    }
    togglePlay();
  };

  return (
    <div style={miniControlsWrapStyle} aria-label="Music controls">
      <button
        type="button"
        aria-label="Previous track"
        title="Previous"
        style={miniControlButtonStyle}
        onClick={() => skipTrack(-1)}>
        {renderMiniIcon('previous')}
      </button>
      <button
        type="button"
        aria-label={isPlaying ? 'Pause track' : 'Play track'}
        title={isPlaying ? 'Pause' : 'Play'}
        style={miniControlButtonStyle}
        onClick={handleTogglePlay}>
        {renderMiniIcon(isPlaying ? 'pause' : 'play')}
      </button>
      <button
        type="button"
        aria-label="Next track"
        title="Next"
        style={miniControlButtonStyle}
        onClick={() => skipTrack(1)}>
        {renderMiniIcon('next')}
      </button>
    </div>
  );
}
