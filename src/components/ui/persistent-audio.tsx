"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

type PersistentAudioContextValue = {
  playing: boolean;
  toggle: () => Promise<void>;
};

const PersistentAudioContext = createContext<PersistentAudioContextValue | null>(null);
const muteStorageKey = "armored-pangolin-audio-muted";
const positionStorageKey = "armored-pangolin-audio-position-v2";

export function PersistentAudioProvider({ children }: { children: React.ReactNode }) {
  const audio = useRef<HTMLAudioElement>(null);
  const interfaceAudio = useRef<AudioContext | null>(null);
  const lastInterfaceSound = useRef(0);
  const userMuted = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const element = audio.current;
    if (!element) return;

    userMuted.current = window.localStorage.getItem(muteStorageKey) === "true";
    element.volume = 0.26;
    element.muted = false;
    element.defaultMuted = false;

    const removeBrowserGateListeners = () => {
      window.removeEventListener("pointerdown", resumeAfterBrowserGate, true);
      window.removeEventListener("touchstart", resumeAfterBrowserGate, true);
      window.removeEventListener("keydown", resumeAfterBrowserGate, true);
      window.removeEventListener("click", resumeAfterBrowserGate, true);
    };

    const startSoundtrack = async () => {
      if (userMuted.current || !element.paused) return;
      try {
        await element.play();
        setPlaying(true);
        removeBrowserGateListeners();
      } catch {
        setPlaying(false);
      }
    };

    function resumeAfterBrowserGate(event?: Event) {
      const target = event?.target instanceof Element ? event.target : null;
      if (target?.closest("[data-audio-control]")) return;
      void startSoundtrack();
    }

    const restorePosition = () => {
      const storedPosition = Number(window.sessionStorage.getItem(positionStorageKey));
      if (Number.isFinite(storedPosition) && storedPosition > 0 && storedPosition < element.duration) {
        element.currentTime = storedPosition;
      }
      void startSoundtrack();
    };
    const savePosition = () => {
      if (Number.isFinite(element.currentTime)) {
        window.sessionStorage.setItem(positionStorageKey, String(Math.floor(element.currentTime)));
      }
    };
    const syncPlayingState = () => setPlaying(!element.paused);
    const resumeVisiblePage = () => {
      if (document.visibilityState === "visible") void startSoundtrack();
    };

    element.addEventListener("loadedmetadata", restorePosition);
    element.addEventListener("canplay", resumeAfterBrowserGate, { once: true });
    element.addEventListener("play", syncPlayingState);
    element.addEventListener("pause", syncPlayingState);
    element.addEventListener("timeupdate", savePosition);
    window.addEventListener("pageshow", resumeAfterBrowserGate);
    document.addEventListener("visibilitychange", resumeVisiblePage);
    window.addEventListener("pointerdown", resumeAfterBrowserGate, { capture: true });
    window.addEventListener("touchstart", resumeAfterBrowserGate, { capture: true, passive: true });
    window.addEventListener("keydown", resumeAfterBrowserGate, { capture: true });
    window.addEventListener("click", resumeAfterBrowserGate, { capture: true });

    element.load();
    void startSoundtrack();

    return () => {
      savePosition();
      element.removeEventListener("loadedmetadata", restorePosition);
      element.removeEventListener("canplay", resumeAfterBrowserGate);
      element.removeEventListener("play", syncPlayingState);
      element.removeEventListener("pause", syncPlayingState);
      element.removeEventListener("timeupdate", savePosition);
      window.removeEventListener("pageshow", resumeAfterBrowserGate);
      document.removeEventListener("visibilitychange", resumeVisiblePage);
      removeBrowserGateListeners();
    };
  }, []);

  useEffect(() => {
    const interactiveSelector = [
      "a[href]",
      "button:not(:disabled)",
      "[role='button']",
      ".editorial-service",
      ".editorial-button",
      ".editorial-utility",
      ".editorial-showcase-controls button",
      ".profile-quote-button",
      ".profile-service-link",
      ".service-page a",
      ".project-page a",
      ".project-page button",
      "[data-ui-sound]",
    ].join(",");

    const getAudioContext = () => {
      const context = interfaceAudio.current ?? new AudioContext();
      interfaceAudio.current = context;
      return context;
    };

    const resolveInteractiveTarget = (event: Event) =>
      event.target instanceof Element ? event.target.closest(interactiveSelector) : null;

    const playHoverSound = (context: AudioContext) => {
      const oscillator = context.createOscillator();
      const overtone = context.createOscillator();
      const gain = context.createGain();
      const overtoneGain = context.createGain();
      const start = context.currentTime;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(285, start);
      oscillator.frequency.exponentialRampToValueAtTime(390, start + 0.075);
      overtone.type = "triangle";
      overtone.frequency.setValueAtTime(570, start);
      overtone.frequency.exponentialRampToValueAtTime(740, start + 0.075);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.032, start + 0.009);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.105);
      overtoneGain.gain.setValueAtTime(0.0001, start);
      overtoneGain.gain.exponentialRampToValueAtTime(0.006, start + 0.008);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.075);

      oscillator.connect(gain);
      overtone.connect(overtoneGain);
      gain.connect(context.destination);
      overtoneGain.connect(context.destination);
      oscillator.start(start);
      overtone.start(start);
      oscillator.stop(start + 0.11);
      overtone.stop(start + 0.08);
    };

    const playClickSound = (context: AudioContext) => {
      const body = context.createOscillator();
      const detail = context.createOscillator();
      const bodyGain = context.createGain();
      const detailGain = context.createGain();
      const start = context.currentTime;

      body.type = "triangle";
      body.frequency.setValueAtTime(175, start);
      body.frequency.exponentialRampToValueAtTime(92, start + 0.085);
      detail.type = "square";
      detail.frequency.setValueAtTime(920, start);
      detail.frequency.exponentialRampToValueAtTime(520, start + 0.026);

      bodyGain.gain.setValueAtTime(0.0001, start);
      bodyGain.gain.exponentialRampToValueAtTime(0.047, start + 0.004);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.1);
      detailGain.gain.setValueAtTime(0.0001, start);
      detailGain.gain.exponentialRampToValueAtTime(0.012, start + 0.002);
      detailGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.032);

      body.connect(bodyGain);
      detail.connect(detailGain);
      bodyGain.connect(context.destination);
      detailGain.connect(context.destination);
      body.start(start);
      detail.start(start);
      body.stop(start + 0.105);
      detail.stop(start + 0.035);
    };

    const playInterfaceHover = (event: PointerEvent) => {
      if (userMuted.current || event.pointerType === "touch") return;
      const target = resolveInteractiveTarget(event);
      if (!target) return;
      const previous = event.relatedTarget instanceof Node ? event.relatedTarget : null;
      if (previous && target.contains(previous)) return;

      const now = performance.now();
      if (now - lastInterfaceSound.current < 90) return;
      lastInterfaceSound.current = now;

      const context = getAudioContext();
      if (context.state !== "running") {
        void context.resume();
        return;
      }

      playHoverSound(context);
    };

    const playInterfaceClick = (event: MouseEvent) => {
      if (userMuted.current || !resolveInteractiveTarget(event)) return;
      const context = getAudioContext();
      if (context.state === "running") {
        playClickSound(context);
        return;
      }

      void context.resume().then(() => playClickSound(context));
    };

    document.addEventListener("pointerover", playInterfaceHover);
    document.addEventListener("click", playInterfaceClick);
    return () => {
      document.removeEventListener("pointerover", playInterfaceHover);
      document.removeEventListener("click", playInterfaceClick);
    };
  }, []);

  useEffect(() => () => {
    void interfaceAudio.current?.close();
  }, []);

  const value = useMemo<PersistentAudioContextValue>(() => ({
    playing,
    toggle: async () => {
      const element = audio.current;
      if (!element) return;
      element.volume = 0.26;
      if (element.paused) {
        userMuted.current = false;
        window.localStorage.setItem(muteStorageKey, "false");
        try {
          await element.play();
          setPlaying(true);
        } catch {
          setPlaying(false);
        }
      } else {
        userMuted.current = true;
        window.localStorage.setItem(muteStorageKey, "true");
        element.pause();
        setPlaying(false);
      }
    },
  }), [playing]);

  return (
    <PersistentAudioContext.Provider value={value}>
      {children}
      <audio
        ref={audio}
        src="/audio/light-workshop-ambient-v2.wav"
        loop
        preload="auto"
        autoPlay
        playsInline
      />
    </PersistentAudioContext.Provider>
  );
}

export function PersistentAudioControl({ className = "editorial-utility" }: { className?: string }) {
  const context = useContext(PersistentAudioContext);
  if (!context) return null;

  return (
    <button
      type="button"
      onClick={() => void context.toggle()}
      className={className}
      aria-label={context.playing ? "Mute ambient soundtrack" : "Turn ambient soundtrack on"}
      aria-pressed={context.playing}
      data-ui-sound
      data-audio-control
    >
      {context.playing ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
      <span>{context.playing ? "Mute sound" : "Sound off"}</span>
    </button>
  );
}
