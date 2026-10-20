import { useState, useEffect } from "react";
import { fetchSiteSettings, saveSiteSettings } from "@/lib/site-settings";
import type { SiteSettings } from "@/lib/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSiteSettings().then((s) => { setSettings(s); setLoading(false); });
  }, []);

  function set<K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) {
    setSettings((s) => ({ ...s, [k]: v }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveSiteSettings(settings);
      toast.success("Settings saved — footer will update automatically");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full border-b border-border bg-transparent py-2 text-sm focus:outline-none focus:border-foreground";
  const label = "block text-[11px] tracking-widest uppercase text-muted-foreground mb-1";

  if (loading) return <p className="mt-8 text-sm text-muted-foreground animate-pulse">Loading settings…</p>;

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl">Site Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground mb-8">Changes are reflected in the footer immediately</p>

      {/* Contact Info */}
      <section className="mb-8">
        <h2 className="text-[11px] tracking-widest uppercase text-muted-foreground border-b border-border pb-2 mb-5">Contact Information</h2>
        <div className="grid gap-5">
          <div>
            <label className={label}>Address</label>
            <input value={settings.address ?? ""} onChange={(e) => set("address", e.target.value)} className={inp} placeholder="123 Main Street, City" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Phone</label>
              <input value={settings.phone ?? ""} onChange={(e) => set("phone", e.target.value)} className={inp} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className={label}>Email</label>
              <input value={settings.email ?? ""} onChange={(e) => set("email", e.target.value)} className={inp} placeholder="hello@parviorjewels.com" />
            </div>
          </div>
          <div>
            <label className={label}>Business Hours</label>
            <input value={settings.hours ?? ""} onChange={(e) => set("hours", e.target.value)} className={inp} placeholder="Mon – Sat: 10:00 – 18:00" />
          </div>
        </div>
      </section>

      {/* Brand Text */}
      <section className="mb-8">
        <h2 className="text-[11px] tracking-widest uppercase text-muted-foreground border-b border-border pb-2 mb-5">Brand Text</h2>
        <div className="grid gap-5">
          <div>
            <label className={label}>Footer Tagline</label>
            <input value={settings.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} className={inp} placeholder="Hand-crafted jewellery, made for the modern heirloom collector." />
          </div>
          <div>
            <label className={label}>Footer Copyright Text</label>
            <input value={settings.footerText ?? ""} onChange={(e) => set("footerText", e.target.value)} className={inp} placeholder="© 2025 Parvior Jewels — All rights reserved" />
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="mb-8">
        <h2 className="text-[11px] tracking-widest uppercase text-muted-foreground border-b border-border pb-2 mb-5">Social Media Links</h2>
        <div className="grid gap-5">
          {([
            ["instagramUrl", "Instagram URL"],
            ["facebookUrl", "Facebook URL"],
            ["twitterUrl", "Twitter / X URL"],
            ["youtubeUrl", "YouTube URL"],
          ] as const).map(([key, lbl]) => (
            <div key={key}>
              <label className={label}>{lbl}</label>
              <input
                value={settings[key] ?? ""}
                onChange={(e) => set(key, e.target.value)}
                className={inp}
                placeholder="https://..."
              />
            </div>
          ))}
        </div>
      </section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-primary text-primary-foreground px-8 py-3 text-[11px] tracking-[0.3em] uppercase disabled:opacity-60 flex items-center gap-2"
      >
        {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save Settings"}
      </button>
    </div>
  );
}

export default AdminSettings;
