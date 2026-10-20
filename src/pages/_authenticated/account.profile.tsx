import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { toast } from "sonner";

function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try { await api.updateProfile({ name }); toast.success("Profile updated"); }
    catch (err: any) { toast.error(err?.message ?? "Failed"); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-12">
      <form onSubmit={saveProfile} className="space-y-5">
        <h2 className="text-2xl">Profile</h2>
        <div>
          <label className="text-[11px] tracking-widest uppercase text-muted-foreground">Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full max-w-md border-b border-border bg-transparent py-2 text-sm focus:outline-none focus:border-accent" />
        </div>
        <div>
          <label className="text-[11px] tracking-widest uppercase text-muted-foreground">Email</label>
          <input value={user?.email ?? ""} disabled
            className="mt-2 w-full max-w-md border-b border-border/50 bg-transparent py-2 text-sm text-muted-foreground" />
        </div>
        <button type="submit" disabled={saving} className="bg-primary text-primary-foreground px-8 py-3 text-[11px] tracking-[0.3em] uppercase disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;
