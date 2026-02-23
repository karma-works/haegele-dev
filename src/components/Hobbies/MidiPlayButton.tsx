import { memo, useState, useCallback, useEffect, useRef } from "react";
import { getMidiPlayer, type MidiPlayerState } from "../../audio/MidiPlayer";
import { useEffects } from "../../contexts/EffectsContext";
import styles from "./MidiPlayButton.module.css";

const MIDI_URL = "/data/The-Lark-(Glinka-Balakirev).mid";
const KEEP_ALIVE_INTERVAL = 1000;

export const MidiPlayButton = memo(function MidiPlayButton() {
  const [playerState, setPlayerState] = useState<MidiPlayerState>("idle");
  const [isReady, setIsReady] = useState(false);
  const effects = useEffects();
  const keepAliveRef = useRef<number | null>(null);

  useEffect(() => {
    const midiPlayer = getMidiPlayer();

    midiPlayer.setCallbacks({
      onStateChange: (state) => {
        setPlayerState(state);
        if (state === "playing") {
          effects.onPianoActivity();
          keepAliveRef.current = window.setInterval(() => {
            effects.onPianoActivity();
          }, KEEP_ALIVE_INTERVAL);
        } else {
          if (keepAliveRef.current) {
            clearInterval(keepAliveRef.current);
            keepAliveRef.current = null;
          }
        }
      },
    });

    if (midiPlayer.isLoaded()) {
      setIsReady(true);
    }

    return () => {
      midiPlayer.setCallbacks({});
      if (keepAliveRef.current) {
        clearInterval(keepAliveRef.current);
        keepAliveRef.current = null;
      }
    };
  }, [effects]);

  const handleClick = useCallback(async () => {
    const midiPlayer = getMidiPlayer();

    if (!effects.pianoEngineRef.current) {
      await effects.initPianoEngine();
    }

    if (playerState === "playing") {
      midiPlayer.stop();
    } else {
      if (!midiPlayer.isLoaded()) {
        setPlayerState("loading");
        try {
          await midiPlayer.load(MIDI_URL);
          setIsReady(true);
        } catch (error) {
          console.error("Failed to load MIDI:", error);
          setPlayerState("idle");
          return;
        }
      }
      await midiPlayer.play();
    }
  }, [playerState, effects]);

  const isLoading = playerState === "loading";
  const isPlaying = playerState === "playing";

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={`${styles.playButton} ${isPlaying ? styles.playing : ""}`}
        onClick={handleClick}
        disabled={isLoading}
        aria-label={
          isPlaying ? "Stop playback" : "Play The Lark by Glinka-Balakirev"
        }
      >
        <span className={styles.buttonContent}>
          {isLoading ? (
            <span className={styles.spinner} aria-hidden="true" />
          ) : isPlaying ? (
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className={styles.icon}
            >
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className={styles.icon}
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
          <span className={styles.label}>
            {isLoading ? "Loading..." : isPlaying ? "Stop" : "Listen..."}
          </span>
        </span>
      </button>
      <p className={styles.hint}>
        {isPlaying
          ? "Now playing: The Lark (Glinka-Balakirev)"
          : "The Lark by Glinka-Balakirev"}
      </p>
    </div>
  );
});

export default MidiPlayButton;
