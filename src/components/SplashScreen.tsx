import { useEffect, useState } from "react";

const STORAGE_KEY = "parvior.splash";
const SEEN_KEY = "parvior.splash.seen";

export interface SplashConfig {
  enabled: boolean;
  duration: number;       // seconds the splash is visible
  fadeOutDuration: number; // ms for fade-out transition
  title: string;
  subtitle?: string;
  bgColor: string;
  textColor: string;
  imageUrl?: string;      // optional background image
  showEveryVisit: boolean; // if false, only show once per session
}

export const DEFAULT_SPLASH: SplashConfig = {
  enabled: true,
  duration: 2.2,
  fadeOutDuration: 800,
  title: "PARVIOR",
  subtitle: "Jewels",
  bgColor: "#1a1a1a",
  textColor: "#f5ede6",
  imageUrl: "",
  showEveryVisit: false,
};

export function readSplashConfig(): SplashConfig {
  if (typeof window === "undefined") return DEFAULT_SPLASH;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_SPLASH, ...JSON.parse(raw) } : DEFAULT_SPLASH;
  } catch {
    return DEFAULT_SPLASH;
  }
}

export function saveSplashConfig(cfg: SplashConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  window.dispatchEvent(new Event("splash:update"));
}

export function SplashScreen() {
  const cfg = readSplashConfig();
  const [phase, setPhase] = useState<"in" | "hold" | "out" | "done">("in");

  useEffect(() => {
    if (!cfg.enabled) {
      setPhase("done");
      return;
    }

    // Skip if already seen (and showEveryVisit is false)
    if (!cfg.showEveryVisit) {
      if (sessionStorage.getItem(SEEN_KEY) === "1") {
        setPhase("done");
        return;
      }
    }

    // Phase timing:  in (600ms) → hold → out (fadeOutDuration)
    const holdMs = Math.max(800, cfg.duration * 1000 - 600 - cfg.fadeOutDuration);

    const t1 = setTimeout(() => setPhase("hold"), 600);
    const t2 = setTimeout(() => setPhase("out"), 600 + holdMs);
    const t3 = setTimeout(() => {
      setPhase("done");
      sessionStorage.setItem(SEEN_KEY, "1");
    }, 600 + holdMs + cfg.fadeOutDuration);

    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  if (phase === "done") return null;

  return (
    <div
      role="status"
      aria-label="Loading Parvior Jewels"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundColor: cfg.bgColor,
        transition: `opacity ${cfg.fadeOutDuration}ms cubic-bezier(0.4,0,0.2,1)`,
        opacity: phase === "out" ? 0 : 1,
        pointerEvents: phase === "out" ? "none" : "all",
      }}
    >
      {/* Optional background image */}
      {cfg.imageUrl && (
        <img
          src={cfg.imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.18 }}
        />
      )}

      {/* Decorative ring */}
      <div
        className="absolute rounded-full border"
        style={{
          width: 420,
          height: 420,
          borderColor: cfg.textColor + "25",
          transform: phase === "in" ? "scale(0.7)" : "scale(1)",
          transition: "transform 1.2s cubic-bezier(0.22,1,0.36,1)",
        }}
      />
      <div
        className="absolute rounded-full border"
        style={{
          width: 280,
          height: 280,
          borderColor: cfg.textColor + "18",
          transform: phase === "in" ? "scale(0.7)" : "scale(1)",
          transition: "transform 1.4s cubic-bezier(0.22,1,0.36,1)",
        }}
      />

      {/* Logo + Title */}
      <div
        className="relative z-10 text-center select-none flex flex-col items-center"
        style={{
          opacity: phase === "in" ? 0 : 1,
          transform: phase === "in" ? "translateY(20px)" : "translateY(0)",
          transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Pearl logo image */}
        <img
          src="/parvior-logo.svg"
          alt="Parvior"
          style={{
            width: 110,
            height: 110,
            objectFit: "contain",
            color: cfg.textColor,
            marginBottom: "1.5rem",
          }}
        />
        <h1
          className="wordmark tracking-[0.5em] font-light"
          style={{
            color: cfg.textColor,
            fontSize: "clamp(2.5rem, 8vw, 6rem)",
            letterSpacing: "0.5em",
            textIndent: "0.5em",
          }}
        >
          {cfg.title}
        </h1>
        {cfg.subtitle && (
          <p
            className="mt-2 tracking-[0.4em] uppercase text-sm font-light"
            style={{ color: cfg.textColor + "cc", letterSpacing: "0.4em" }}
          >
            {cfg.subtitle}
          </p>
        )}
        {/* Thin divider line */}
        <div
          className="mx-auto mt-5"
          style={{
            height: 1,
            backgroundColor: cfg.textColor + "60",
            width: phase === "hold" || phase === "out" ? 80 : 0,
            transition: "width 0.8s cubic-bezier(0.22,1,0.36,1) 0.3s",
          }}
        />
      </div>
    </div>
  );
}
