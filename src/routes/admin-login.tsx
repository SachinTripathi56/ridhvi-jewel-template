import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { signIn, useAdminAuth } from "@/lib/admin-auth";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin-login")({
  head: () => ({ meta: [{ title: "Admin Sign In — Parvior" }, { name: "robots", content: "noindex" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const isAdmin = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) navigate({ to: "/admin" });
  }, [isAdmin, navigate]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (signIn(email, password)) {
      navigate({ to: "/admin" });
    } else {
      setError("Invalid credentials.");
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <section className="max-w-md mx-auto px-6 py-24">
        <h1 className="font-display text-4xl text-center">Admin Sign In</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">Registered administrators only.</p>
        <form onSubmit={onSubmit} className="mt-10 space-y-4 bg-card border border-border p-8">
          <div>
            <label className="text-xs tracking-widest uppercase">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full bg-background border border-border px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs tracking-widest uppercase">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full bg-background border border-border px-4 py-3 text-sm" />
          </div>
          {error && <p className="text-sm text-foreground">{error}</p>}
          <button type="submit" className="w-full bg-primary text-primary-foreground py-3.5 text-[11px] tracking-[0.3em] uppercase">Sign In</button>
          <p className="text-[11px] text-muted-foreground text-center">Default: admin@parvior.com / PARVIOR123 — change from Admin → Settings.</p>
          <Link to="/" className="block text-center text-xs text-accent">← Back to store</Link>
        </form>
      </section>
      <Footer />
    </div>
  );
}
