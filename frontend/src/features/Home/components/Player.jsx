import useSong from "../Hooks/useSong";
import "../styles/player.scss";

const formatTime = (time) => {
  if (!Number.isFinite(time)) {
    return "0:00";
  }

  return `${Math.floor(time / 60)}:${String(
    Math.floor(time % 60)
  ).padStart(2, "0")}`;
};

const Player = () => {
  const {
    song,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    error,
    autoplayBlocked,
    togglePlay,
    nextSong,
    previousSong,
    seek,
    setVolume,
    setIsMuted,
  } = useSong();

  if (!song) {
    return (
      <footer className="music-player music-player-empty">
        <span>MOODIFY PLAYER</span>
        <p>Your mood mix will appear here.</p>
      </footer>
    );
  }

  return (
    <footer className="music-player">
      <div className="player-song">
        <img
          src={song.posterUrl}
          alt={`${song.title} cover`}
        />

        <div>
          <span className="eyebrow">Now playing</span>
          <strong>{song.title}</strong>
          <small>{song.mood}</small>
        </div>
      </div>

      <div className="player-center">
        <div className="player-controls">
          <button
            type="button"
            onClick={previousSong}
            aria-label="Previous song"
          >
            |&lt;
          </button>

          <button
            type="button"
            className="player-play"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "||" : "▶"}
          </button>

          <button
            type="button"
            onClick={nextSong}
            aria-label="Next song"
          >
            &gt;|
          </button>
        </div>

        <div className="player-progress">
          <span>{formatTime(currentTime)}</span>

          <input
            type="range"
            min="0"
            max={duration || 0}
            value={Math.min(
              currentTime,
              duration || 0
            )}
            onChange={(event) =>
              seek(Number(event.target.value))
            }
            aria-label="Song progress"
          />

          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-volume">
        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? "MUTE" : "VOL"}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(event) =>
            setVolume(Number(event.target.value))
          }
          aria-label="Volume"
        />
      </div>

      {(autoplayBlocked || error) && (
        <span className="player-notice">
          {autoplayBlocked
            ? "Press play to listen"
            : error}
        </span>
      )}
    </footer>
  );
};

export default Player;