import { useEffect, useState } from "react";
import type { SiteSettings } from "./types";
import { api } from "./api";
import { apiAvailable } from "./http";

const STORAGE_KEY = "parvior.site_settings";

const DEFAULT_SETTINGS: SiteSettings = {
  address: "New Delhi, India",
  phone: "+91 98765 43210",
  hours: "Mon – Sat: 10:00 – 18:00",
  tagline: "Hand-crafted jewellery, made for the modern heirloom collector.",
  footerText: `© ${new Date().getFullYear()} Parvior Jewels — All rights reserved`,
  instagramUrl: "#",
  facebookUrl: "#",
  twitterUrl: "#",
  youtubeUrl: "#",
  email: "hello@parviorjewels.com",
};

function readLocal(): SiteSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function writeLocal(s: SiteSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    window.dispatchEvent(new Event("site_settings:update"));
  } catch {}
}

/** Read site settings — from backend if available, else localStorage */
export async function fetchSiteSettings(): Promise<SiteSettings> {
  if (apiAvailable()) {
    try {
      return await api.admin.getSiteSettings();
    } catch {
      return readLocal();
    }
  }
  return readLocal();
}

/** Save site settings (admin) */
export async function saveSiteSettings(s: Partial<SiteSettings>): Promise<SiteSettings> {
  const merged = { ...readLocal(), ...s };
  if (apiAvailable()) {
    const result = await api.admin.updateSiteSettings(s);
    writeLocal(result);
    return result;
  }
  writeLocal(merged);
  return merged;
}

/** React hook — auto-refreshes when storage event fires */
export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(readLocal);

  useEffect(() => {
    // Try to load from backend on mount
    fetchSiteSettings().then(setSettings).catch(() => setSettings(readLocal()));

    const onUpdate = () => setSettings(readLocal());
    window.addEventListener("site_settings:update", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("site_settings:update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  return settings;
}
