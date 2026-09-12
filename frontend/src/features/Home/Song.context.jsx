import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { getSong } from "./service/song.api";

export const SongContext = createContext(null);

const SUPPORTED_MOODS = ["happy", "sad", "surprised"];

// Read JSON value from localStorage
const readStoredValue = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    try {
      localStorage.removeItem(key);
    } catch {
      return null;
    }

    return null;
  }
};

// Write JSON value to localStorage
const writeStoredValue = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return false;
  }
};

// Write text value to localStorage
const writeStoredText = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    return false;
  }
};

// Remove value from localStorage
const removeStoredValue = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    return false;
  }
};

export const SongContextProvider = ({ children }) => {
  const audioRef = useRef(null);
  const playlists = useRef(new Map());
  const autoplayRef = useRef(false);
  const restoreStarted = useRef(false);
  const pendingSong = useRef(null);

  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [detectedMood, setDetectedMood] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState("");
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const song = songs[currentIndex] || null;

  const playCurrent = useCallback(async () => {
    if (!audioRef.current || !song?.url) {
      return false;
    }

    try {
      await audioRef.current.play();

      setAutoplayBlocked(false);
      setError("");

      return true;
    } catch (playError) {
      setIsPlaying(false);

      setAutoplayBlocked(
        playError.name === "NotAllowedError"
      );

      setError(
        playError.name === "NotAllowedError"
          ? "Press play to start the mix."
          : "This song could not be played."
      );

      return false;
    }
  }, [song]);

  useEffect(() => {
    if (!audioRef.current || !song) {
      return;
    }

    audioRef.current.pause();
    audioRef.current.src = song.url || "";
    audioRef.current.load();

    setCurrentTime(0);
    setDuration(0);

    setError(
      song.url
        ? ""
        : "This song has no audio URL."
    );

    if (autoplayRef.current) {
      autoplayRef.current = false;
      playCurrent();
    }
  }, [song, playCurrent]);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.volume = volume;
    audioRef.current.muted = isMuted;
  }, [volume, isMuted]);

  const selectSong = useCallback(
    (index, autoplay = true) => {
      if (!songs[index]) {
        return;
      }

      autoplayRef.current = autoplay;
      setCurrentIndex(index);
    },
    [songs]
  );

  const playSong = useCallback(
    (index = currentIndex) => {
      if (index !== currentIndex) {
        selectSong(index, true);
      } else {
        playCurrent();
      }
    },
    [currentIndex, playCurrent, selectSong]
  );

  const pauseSong = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pauseSong();
    } else {
      playCurrent();
    }
  }, [isPlaying, pauseSong, playCurrent]);

  const nextSong = useCallback(() => {
    if (currentIndex < songs.length - 1) {
      selectSong(currentIndex + 1, true);
    }
  }, [currentIndex, selectSong, songs.length]);

  const previousSong = useCallback(() => {
    if (audioRef.current?.currentTime > 3) {
      audioRef.current.currentTime = 0;
    } else if (currentIndex > 0) {
      selectSong(currentIndex - 1, true);
    }
  }, [currentIndex, selectSong]);

  const seek = useCallback(
    (time) => {
      if (!audioRef.current) {
        return;
      }

      audioRef.current.currentTime = Math.max(
        0,
        Math.min(time, duration || 0)
      );

      setCurrentTime(audioRef.current.currentTime);
    },
    [duration]
  );

  const setVolume = useCallback((value) => {
    setVolumeState(value);
    setIsMuted(value === 0);
  }, []);

  const handleSong = useCallback(
    async (mood, force = false, autoplay = true) => {
      if (!SUPPORTED_MOODS.includes(mood)) {
        return false;
      }

      setDetectedMood(mood);
      setError("");

      writeStoredText(
        "moodify:lastMood",
        mood
      );

      // Use cached playlist if available
      if (!force && playlists.current.has(mood)) {
        const cachedSongs = playlists.current.get(mood);

        setSongs(cachedSongs);

        const restoredIndex = cachedSongs.findIndex(
          (cachedSong) =>
            cachedSong.url ===
              pendingSong.current?.url ||
            cachedSong.title ===
              pendingSong.current?.title
        );

        setCurrentIndex(
          restoredIndex >= 0
            ? restoredIndex
            : cachedSongs.length
              ? 0
              : -1
        );

        autoplayRef.current =
          autoplay && cachedSongs.length > 0;

        pendingSong.current = null;

        return cachedSongs.length > 0;
      }

      setLoading(true);

      try {
        const data = await getSong(mood);

        const receivedSongs = Array.isArray(
          data.songs
        )
          ? data.songs
          : [];

        playlists.current.set(
          mood,
          receivedSongs
        );

        setSongs(receivedSongs);

        const restoredIndex =
          receivedSongs.findIndex(
            (receivedSong) =>
              receivedSong.url ===
                pendingSong.current?.url ||
              receivedSong.title ===
                pendingSong.current?.title
          );

        setCurrentIndex(
          restoredIndex >= 0
            ? restoredIndex
            : receivedSongs.length
              ? 0
              : -1
        );

        autoplayRef.current =
          autoplay && receivedSongs.length > 0;

        pendingSong.current = null;

        if (!receivedSongs.length) {
          setError(
            "No songs found for this mood."
          );
        }

        return receivedSongs.length > 0;
      } catch (requestError) {
        setSongs([]);
        setCurrentIndex(-1);

        setError(
          requestError.response?.data?.message ||
            "Unable to load songs right now."
        );

        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Save currently selected song
  useEffect(() => {
    if (!song) {
      return;
    }

    writeStoredValue(
      "moodify:selectedSong",
      {
        title: song.title,
        url: song.url,
      }
    );
  }, [song]);

  // Restore mood and selected song after refresh
  useEffect(() => {
    if (restoreStarted.current) {
      return;
    }

    restoreStarted.current = true;

    const savedMood = (() => {
      try {
        return localStorage.getItem(
          "moodify:lastMood"
        );
      } catch {
        return null;
      }
    })();

    if (!SUPPORTED_MOODS.includes(savedMood)) {
      if (savedMood !== null) {
        removeStoredValue(
          "moodify:lastMood"
        );
      }

      removeStoredValue(
        "moodify:selectedSong"
      );

      return;
    }

    const savedSong = readStoredValue(
      "moodify:selectedSong"
    );

    if (
      savedSong &&
      typeof savedSong === "object"
    ) {
      pendingSong.current = savedSong;
    } else {
      removeStoredValue(
        "moodify:selectedSong"
      );
    }

    Promise.resolve().then(() =>
      handleSong(
        savedMood,
        true,
        false
      )
    );
  }, [handleSong]);

  return (
    <SongContext.Provider
      value={{
        songs,
        song,
        loading,
        detectedMood,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        error,
        autoplayBlocked,
        handleSong,
        playSong,
        pauseSong,
        togglePlay,
        nextSong,
        previousSong,
        seek,
        setVolume,
        setIsMuted,
        selectSong,
      }}
    >
      {children}

      <audio
        ref={audioRef}
        onLoadedMetadata={(event) =>
          setDuration(
            event.currentTarget.duration
          )
        }
        onTimeUpdate={(event) =>
          setCurrentTime(
            event.currentTarget.currentTime
          )
        }
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={nextSong}
        onError={() =>
          setError(
            "This audio file is unavailable."
          )
        }
      />
    </SongContext.Provider>
  );
};