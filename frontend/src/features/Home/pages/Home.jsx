import { useState } from "react";

import FaceExpression from "../../Expression/FaceExpression";
import Player from "../components/Player";
import useSong from "../Hooks/useSong";

import "../styles/home.scss";


const Home = () => {
  const {
    songs,
    song,
    loading,
    detectedMood,
    error,
    handleSong,
    selectSong,
  } = useSong();

  const [detectedExpression, setDetectedExpression] = useState(
    "Click detect to read your mood"
  );
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("moodify:theme");
    return savedTheme === "light" ? "light" : "dark";
  });

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      localStorage.setItem("moodify:theme", nextTheme);
      return nextTheme;
    });
  };


  const handleDetected = ({ expression, mood }) => {
    setDetectedExpression(expression);

    if (mood) {
      return handleSong(mood);
    }

    return false;
  };


  return (
    <div className={`moodify-shell theme-${theme}`}>

      {/* Header */}
      <header className="moodify-header">
        <a className="moodify-logo" href="/">
          mood<span>ify</span>
        </a>

        <div className="header-profile">
          <span className="profile-avatar">M</span>
          <span>My listening space</span>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>
      </header>


      {/* Main Content */}
      <main className="moodify-layout">

        {/* Left Column */}
        <section className="moodify-main-column">

          {/* Hero */}
          <div className="moodify-hero">
            <span className="eyebrow">
              A soundtrack for right now
            </span>

            <h1>
              Let your
              <br />
              <em>expressions</em> play.
            </h1>

            <p>
              Show Moodify how you feel. Your face becomes the signal
              for a playlist built in the moment.
            </p>
          </div>


          {/* Face Detection */}
          <section className="detection-card">

            <div className="section-heading">

              <div>
                <span className="eyebrow">
                  Live mood scan
                </span>

                <h2>
                  Read the room
                </h2>
              </div>

              <span className="scan-indicator">
                <i />
                Camera ready
              </span>

            </div>


            <FaceExpression onDetected={handleDetected} />


            {/* Detection Result */}
            <div className="detection-result">

              <div>
                <span className="eyebrow">
                  Latest read
                </span>

                <strong>
                  {detectedExpression}
                </strong>
              </div>

              <span className="result-mood">
                {detectedMood || "Waiting"}
              </span>

            </div>

          </section>


          {/* Mood Summary */}
          <section className="mood-summary">

            <div>
              <span className="eyebrow">
                Mood detected
              </span>

              <h2>
                {detectedMood || "Your mix is waiting"}
              </h2>

              <p>
                {detectedMood
                  ? `A ${detectedMood} mix, selected from your Moodify library.`
                  : "Detect your expression to find music that meets you there."
                }
              </p>
            </div>


            <button
              type="button"
              className="primary-action"
              disabled={!detectedMood || loading}
              onClick={() => handleSong(detectedMood, true)}
            >
              {loading ? "Loading mix..." : "Play mood mix"}

              <span>
                →
              </span>
            </button>

          </section>

        </section>


        {/* Playlist */}
        <aside className="playlist-panel">

          <div className="playlist-heading">

            <div>
              <span className="eyebrow">
                Your response playlist
              </span>

              <h2>
                {detectedMood
                  ? `${detectedMood} mix`
                  : "Recommended songs"
                }
              </h2>
            </div>

            <span className="track-count">
              {songs.length} tracks
            </span>

          </div>


          {/* Error */}
          {error && (
            <p className="playlist-error">
              {error}
            </p>
          )}


          {/* Playlist Items */}
          <div className="playlist-list">

            {songs.map((playlistSong, index) => (
              <button
                type="button"
                className={`playlist-item ${
                  song === playlistSong ? "is-active" : ""
                }`}
                key={`${playlistSong.url}-${index}`}
                onClick={() => selectSong(index)}
              >

                <img
                  src={playlistSong.posterUrl}
                  alt=""
                />

                <span className="playlist-copy">

                  <strong>
                    {playlistSong.title}
                  </strong>

                  <small>
                    {playlistSong.mood}
                  </small>

                </span>

                <span className="playlist-play">
                  {song === playlistSong ? "●" : "▶"}
                </span>

              </button>
            ))}


            {/* Empty Playlist */}
            {!songs.length && !error && (
              <div className="playlist-empty">

                <span>
                  ✦
                </span>

                <p>
                  Detect your mood to get songs
                </p>

              </div>
            )}

          </div>

        </aside>

      </main>


      {/* Music Player */}
      <Player />

    </div>
  );
};


export default Home;