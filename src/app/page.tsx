"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type Reel = {
  id: string;
  title: string;
  prompt: string;
  anchor: string;
  gradient: string;
};

const reels: Reel[] = [
  {
    id: "stretch",
    title: "60-Second Reset",
    prompt: "Stand tall, reach for the ceiling, then fold forward and breathe.",
    anchor: "Movement keeps the doom-scroll away",
    gradient: "linear-gradient(160deg, #4937ff 0%, #8a5dff 45%, #fca2ff 100%)"
  },
  {
    id: "hydrate",
    title: "Hydrate + Reflect",
    prompt: "Sip water while naming three wins from today.",
    anchor: "Micro wins beat micro scrolls",
    gradient: "linear-gradient(160deg, #0099f7 0%, #00d4ff 40%, #6ef8ff 100%)"
  },
  {
    id: "breathe",
    title: "Box Breathing",
    prompt: "Inhale 4, hold 4, exhale 4, hold 4. Repeat five rounds.",
    anchor: "Reels can wait – your nervous system can't",
    gradient: "linear-gradient(140deg, #02aab0 0%, #00cdac 100%)"
  },
  {
    id: "vision",
    title: "Vision Reset",
    prompt: "Look 20ft away, trace a square with your eyes, repeat twice.",
    anchor: "Focus forward, not just on the feed",
    gradient: "linear-gradient(150deg, #ff5858 0%, #f857a6 100%)"
  },
  {
    id: "journal",
    title: "Mini Journal",
    prompt: "Type or speak one thing you're grateful for right now.",
    anchor: "Gratitude > infinite scroll",
    gradient: "linear-gradient(150deg, #ff9966 0%, #ff5e62 100%)"
  }
];

const BREAK_SECONDS = 60;
const MIN_MINUTES = 1;
const MAX_MINUTES = 30;

const formatTime = (totalSeconds: number) => {
  const safeSeconds = Math.max(totalSeconds, 0);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export default function HomePage() {
  const [sessionMinutes, setSessionMinutes] = useState<number>(5);
  const [timeRemaining, setTimeRemaining] = useState<number>(sessionMinutes * 60);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [breakRemaining, setBreakRemaining] = useState<number>(BREAK_SECONDS);
  const [breakFinished, setBreakFinished] = useState<boolean>(false);
  const [activeReelIndex, setActiveReelIndex] = useState<number>(0);

  const totalSeconds = useMemo(() => sessionMinutes * 60, [sessionMinutes]);
  const consumptionProgress = useMemo(() => {
    if (totalSeconds === 0) {
      return 0;
    }
    if (isLocked) {
      return 1;
    }
    return Math.min(1, (totalSeconds - timeRemaining) / totalSeconds);
  }, [isLocked, timeRemaining, totalSeconds]);

  useEffect(() => {
    if (!isSessionActive || isLocked) {
      return;
    }

    const interval = window.setInterval(() => {
      setTimeRemaining((previous) => {
        if (previous <= 1) {
          window.clearInterval(interval);
          setIsSessionActive(false);
          setIsLocked(true);
          setBreakFinished(false);
          setBreakRemaining(BREAK_SECONDS);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isSessionActive, isLocked]);

  useEffect(() => {
    if (!isSessionActive || isLocked) {
      return;
    }

    const rotation = window.setInterval(() => {
      setActiveReelIndex((index) => (index + 1) % reels.length);
    }, 10000);

    return () => window.clearInterval(rotation);
  }, [isSessionActive, isLocked]);

  useEffect(() => {
    if (!isLocked || breakFinished) {
      return;
    }

    const timer = window.setInterval(() => {
      setBreakRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setBreakFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isLocked, breakFinished]);

  useEffect(() => {
    if (isSessionActive) {
      return;
    }
    setTimeRemaining(sessionMinutes * 60);
  }, [sessionMinutes, isSessionActive]);

  const startSession = () => {
    setTimeRemaining(sessionMinutes * 60);
    setActiveReelIndex(0);
    setIsLocked(false);
    setBreakFinished(false);
    setBreakRemaining(BREAK_SECONDS);
    setIsSessionActive(true);
  };

  const stopSession = () => {
    setIsSessionActive(false);
  };

  const resumeAfterBreak = () => {
    if (!breakFinished) {
      return;
    }
    startSession();
  };

  const timeLabel = isLocked
    ? breakFinished
      ? "Break complete. Ready when you are"
      : `Break: ${formatTime(breakRemaining)}`
    : isSessionActive
    ? `Time Left: ${formatTime(timeRemaining)}`
    : `Ready for ${sessionMinutes} minute mindful session`;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.sidebar}>
          <header className={styles.header}>
            <span className={styles.badge}>Reel detox</span>
            <h1>Shorts-style breaks that keep you off-the-scroll</h1>
            <p>
              Trade endless swipes for mindful micro-sessions. Set a limit, press start,
              and let the reels guide you out of the doom-scroll loop.
            </p>
          </header>

          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>Session designer</h2>
              <span className={styles.timerLabel}>{timeLabel}</span>
            </div>

            <label className={styles.sliderLabel} htmlFor="session-slider">
              Session length ({sessionMinutes} min)
            </label>
            <input
              aria-label="Choose session length"
              className={styles.slider}
              id="session-slider"
              max={MAX_MINUTES}
              min={MIN_MINUTES}
              onChange={(event) => setSessionMinutes(Number(event.target.value))}
              step={1}
              type="range"
              value={sessionMinutes}
              disabled={isSessionActive}
            />

            <div className={styles.quickSelectRow}>
              {[3, 5, 10, 15].map((minutes) => (
                <button
                  className={
                    minutes === sessionMinutes ? styles.quickSelectActive : styles.quickSelect
                  }
                  disabled={isSessionActive}
                  key={minutes}
                  onClick={() => setSessionMinutes(minutes)}
                  type="button"
                >
                  {minutes}m
                </button>
              ))}
            </div>

            <div className={styles.actions}>
              {isSessionActive ? (
                <button className={styles.secondaryButton} onClick={stopSession} type="button">
                  Pause session
                </button>
              ) : (
                <button
                  className={styles.primaryButton}
                  onClick={startSession}
                  type="button"
                  disabled={isLocked && !breakFinished}
                >
                  {isLocked && !breakFinished ? "Locked" : "Start mindful session"}
                </button>
              )}

              <button
                className={styles.secondaryButton}
                onClick={() => {
                  setIsSessionActive(false);
                  setIsLocked(false);
                  setBreakFinished(false);
                  setBreakRemaining(BREAK_SECONDS);
                  setTimeRemaining(sessionMinutes * 60);
                  setActiveReelIndex(0);
                }}
                type="button"
              >
                Reset timer
              </button>
            </div>

            {isLocked && (
              <div className={styles.breakNotice}>
                <h3>Limit reached</h3>
                <p>
                  Your {sessionMinutes}-minute scroll allowance is used up. Take a {BREAK_SECONDS}
                  -second breather away from the feed.
                </p>
                <button
                  className={styles.resumeButton}
                  disabled={!breakFinished}
                  onClick={resumeAfterBreak}
                  type="button"
                >
                  {breakFinished ? "Start another focused burst" : "Breathing…"}
                </button>
              </div>
            )}

            <div className={styles.progressShell}>
              <div className={styles.progressBar} style={{ width: `${consumptionProgress * 100}%` }} />
            </div>

            <ul className={styles.tipList}>
              <li>Silence notifications before you begin.</li>
              <li>Lock your phone once the break overlay appears.</li>
              <li>Queue a calming playlist to replace algorithmic feeds.</li>
            </ul>
          </div>
        </section>

        <section className={styles.phoneSection} aria-live="polite">
          <div className={styles.phoneFrame}>
            <div className={styles.phoneNotch} />
            <div className={styles.reelWindow}>
              <div
                className={styles.reelTrack}
                style={{ transform: `translateY(-${activeReelIndex * 100}%)` }}
              >
                {reels.map((reel) => (
                  <article
                    className={styles.reelCard}
                    key={reel.id}
                    style={{ backgroundImage: reel.gradient }}
                  >
                    <span className={styles.reelBadge}>Mindful reel</span>
                    <h3>{reel.title}</h3>
                    <p>{reel.prompt}</p>
                    <footer>{reel.anchor}</footer>
                  </article>
                ))}
              </div>

              <nav className={styles.feedControls}>
                <button
                  aria-label="Previous reel"
                  className={styles.feedButton}
                  onClick={() =>
                    setActiveReelIndex((index) => (index - 1 + reels.length) % reels.length)
                  }
                  type="button"
                  disabled={isLocked}
                >
                  ‹
                </button>
                <span>{activeReelIndex + 1} / {reels.length}</span>
                <button
                  aria-label="Next reel"
                  className={styles.feedButton}
                  onClick={() => setActiveReelIndex((index) => (index + 1) % reels.length)}
                  type="button"
                  disabled={isLocked}
                >
                  ›
                </button>
              </nav>

              {isLocked && (
                <div className={styles.lockOverlay}>
                  <div className={styles.lockCard}>
                    <h3>Break in progress</h3>
                    <p>
                      You hit the limit. Step away from the screen and let your attention recover.
                    </p>
                    <span className={styles.lockTimer}>
                      {breakFinished ? "Tap resume when ready" : formatTime(breakRemaining)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
