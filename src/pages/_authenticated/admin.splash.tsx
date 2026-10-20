import { useState } from "react";
import { DEFAULT_SPLASH, readSplashConfig, saveSplashConfig } from "@/components/SplashScreen";
import type { SplashConfig } from "@/components/SplashScreen";
import { toast } from "sonner";
import { Eye } from "lucide-react";

function AdminSplash() {
  const [cfg, setCfg] = useState<SplashConfig>(readSplashConfig);
  const [previewing, setPreviewing] = useState(false);

  function set<K extends keyof SplashConfig>(k: K, v: SplashConfig[K]) {
    setCfg((s) => ({ ...s, [k]: v }));
  }

  function handleSave() {
    saveSplashConfig(cfg);
    toast.success("Splash screen settings saved");
  }

  function handlePreview() {
    // Clear the seen flag so it shows again
    sessionStorage.removeItem("parvior.splash.seen");
    saveSplashConfig({ ...cfg, enabled: true, showEveryVisit: true });
    setPreviewing(true);
    window.location.reload();
  }

  function handleReset() {
    setCfg(DEFAULT_SPLASH);
    saveSplashConfig(DEFAULT_SPLASH);
    toast.success("Reset to defaults");
  }

  const inp = "w-full border-b border-border bg-transparent py-2 text-sm focus:outline-none focus:border-foreground";
  const label = "block text-[11px] tracking-widest uppercase text-muted-foreground mb-1";

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl">Splash Screen</h1>
          <p className="mt-1 text-sm text-muted-foreground">Configure the loading animation shown on site entry</p>
        </div>
        <button onClick={handlePreview} className="flex items-center gap-2 border border-border px-4 py-2 text-xs tracking-widest uppercase hover:bg-secondary">
          <Eye className="h-3.5 w-3.5" /> Preview
        </button>
      </div>

      {/* Enable toggle */}
      <div className="flex items-center justify-between border border-border p-4 mb-6">
        <div>
          <p className="text-sm font-medium">Enable splash screen</p>
          <p className="text-xs text-muted-foreground mt-0.5">Show loading animation when the site opens</p>
        </div>
        <button
          onClick={() => set("enabled", !cfg.enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${cfg.enabled ? "bg-[#8B1F2B]" : "bg-neutral-300"}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${cfg.enabled ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>

      <div className="grid gap-5">
        <div>
          <label className={label}>Title Text</label>
          <input value={cfg.title} onChange={(e) => set("title", e.target.value)} className={inp} />
        </div>
        <div>
          <label className={label}>Subtitle (optional)</label>
          <input value={cfg.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} className={inp} placeholder="Jewels" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Duration (seconds)</label>
            <input type="number" min={0.5} max={10} step={0.1} value={cfg.duration}
              onChange={(e) => set("duration", Number(e.target.value))} className={inp} />
          </div>
          <div>
            <label className={label}>Fade-out (ms)</label>
            <input type="number" min={200} max={2000} step={100} value={cfg.fadeOutDuration}
              onChange={(e) => set("fadeOutDuration", Number(e.target.value))} className={inp} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Background Color</label>
            <div className="flex items-center gap-3 mt-1">
              <input type="color" value={cfg.bgColor} onChange={(e) => set("bgColor", e.target.value)} className="h-9 w-12 cursor-pointer border border-border" />
              <input value={cfg.bgColor} onChange={(e) => set("bgColor", e.target.value)} className={inp} />
            </div>
          </div>
          <div>
            <label className={label}>Text Color</label>
            <div className="flex items-center gap-3 mt-1">
              <input type="color" value={cfg.textColor} onChange={(e) => set("textColor", e.target.value)} className="h-9 w-12 cursor-pointer border border-border" />
              <input value={cfg.textColor} onChange={(e) => set("textColor", e.target.value)} className={inp} />
            </div>
          </div>
        </div>
        <div>
          <label className={label}>Background Image URL (optional)</label>
          <input value={cfg.imageUrl ?? ""} onChange={(e) => set("imageUrl", e.target.value)} className={inp} placeholder="https://... (leave blank for solid color)" />
          {cfg.imageUrl && <img src={cfg.imageUrl} alt="" className="mt-2 h-20 w-full object-cover opacity-60 border border-border" />}
        </div>

        {/* Show every visit */}
        <div className="flex items-center justify-between border border-border p-4">
          <div>
            <p className="text-sm font-medium">Show on every visit</p>
            <p className="text-xs text-muted-foreground mt-0.5">If off, shows once per browser session</p>
          </div>
          <button
            onClick={() => set("showEveryVisit", !cfg.showEveryVisit)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${cfg.showEveryVisit ? "bg-[#8B1F2B]" : "bg-neutral-300"}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${cfg.showEveryVisit ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
      </div>

      {/* Preview */}
      {cfg.enabled && (
        <div className="mt-6 border border-border p-4 rounded" style={{ backgroundColor: cfg.bgColor }}>
          <p className="text-center font-light tracking-[0.5em]" style={{ color: cfg.textColor, fontSize: "1.5rem" }}>
            {cfg.title}
          </p>
          {cfg.subtitle && (
            <p className="text-center tracking-[0.3em] text-xs mt-1 uppercase" style={{ color: cfg.textColor + "cc" }}>
              {cfg.subtitle}
            </p>
          )}
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <button onClick={handleSave} className="bg-primary text-primary-foreground px-8 py-3 text-[11px] tracking-[0.3em] uppercase">
          Save Changes
        </button>
        <button onClick={handleReset} className="border border-border px-6 py-3 text-xs uppercase tracking-widest hover:bg-secondary">
          Reset Defaults
        </button>
      </div>
    </div>
  );
}

export default AdminSplash;
