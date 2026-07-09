import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { SectionTitle } from "@/components/SectionTitle";
import { PRODUCTS, CATEGORIES } from "@/lib/products";
import { useBanners } from "@/lib/banners";
import { useStory } from "@/lib/story";
import { useEffect, useState } from "react";
import { Truck, ShieldCheck, MessageCircle, Award, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ridhvi — Hand-finished silver jewellery" },
      { name: "description", content: "Modern heirloom silver jewellery, hand-finished in our atelier." },
      { property: "og:title", content: "Ridhvi" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const [tab, setTab] = useState<"new" | "featured" | "sale">("new");
  const tabbed = PRODUCTS.filter((p) =>
    tab === "new" ? p.badge === "NEW" : tab === "featured" ? p.badge === "FEATURED" : !!p.oldPrice
  ).slice(0, 4);

  const { banners, intervalSec } = useBanners();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % banners.length), Math.max(2, intervalSec) * 1000);
    return () => clearInterval(t);
  }, [banners.length, intervalSec]);

  const active = banners[idx] ?? banners[0];

  return (
    <div className="min-h-screen">
      <Header transparentOnTop />

      {/* Hero — full-viewport banner, header fused on top */}
      <section className="relative h-screen w-full overflow-hidden">
        {banners.map((b, i) => (
          <div
            key={b.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === idx ? "opacity-100" : "opacity-0"}`}
          >
            <img src={b.image} alt={b.title ?? "Ridhvi banner"} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/25" />
          </div>
        ))}

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-[1600px] w-full mx-auto px-10 grid md:grid-cols-2 gap-10 items-center">
            <div />
            {active && (
              <div className="bg-[#c9a48a]/90 backdrop-blur-sm text-white px-12 py-16 max-w-xl ml-auto">
                <h1 className="font-display text-5xl md:text-6xl leading-[1.05] whitespace-pre-line">
                  {active.title}
                </h1>
                {active.subtitle && (
                  <p className="mt-6 text-[11px] tracking-[0.32em]">{active.subtitle}</p>
                )}
                {active.cta && (
                  <Link to={active.href ?? "/shop"} className="mt-8 inline-block bg-black text-white px-10 py-4 text-[11px] tracking-[0.3em] uppercase hover:opacity-90">
                    {active.cta}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {banners.length > 1 && (
          <>
            <button
              aria-label="Previous"
              onClick={() => setIdx((i) => (i - 1 + banners.length) % banners.length)}
              className="absolute right-20 bottom-10 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center"
            ><ChevronLeft className="w-4 h-4" /></button>
            <button
              aria-label="Next"
              onClick={() => setIdx((i) => (i + 1) % banners.length)}
              className="absolute right-8 bottom-10 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center"
            ><ChevronRight className="w-4 h-4" /></button>
            <div className="absolute left-8 bottom-10 z-10 flex gap-2">
              {banners.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)} aria-label={`Slide ${i+1}`} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-8 bg-white" : "w-3 bg-white/50"}`} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Promo cards */}
      <section className="max-w-[1400px] mx-auto px-6 mt-20 grid md:grid-cols-3 gap-5">
        {[
          { t: "Earrings Collection", s: "15% Off", img: "https://images.unsplash.com/photo-1535556116002-6281ff3e9f36?w=800&q=80" },
          { t: "Pendant Hoops", s: "10% Off", img: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&q=80" },
          { t: "Ring Edit", s: "Shop Bestsellers", img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80" },
        ].map((c) => (
          <Link to="/shop" key={c.t} className="group relative aspect-[4/3] overflow-hidden bg-secondary rounded-3xl">
            <img src={c.img} alt={c.t} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-700" />
            <div className="absolute inset-0 bg-foreground/15" />
            <div className="absolute inset-0 flex flex-col justify-center px-8 text-white">
              <h3 className="text-3xl">{c.t}</h3>
              <p className="mt-2 text-xs tracking-[0.3em] uppercase">{c.s}</p>
              <span className="mt-5 inline-block w-fit border border-white/80 px-6 py-2 text-[10px] tracking-[0.3em] uppercase">Explore</span>
            </div>
          </Link>
        ))}
      </section>

      {/* Tabbed product showcase */}
      <section className="max-w-[1400px] mx-auto px-6 mt-24">
        <SectionTitle subtitle="Curated by our atelier.">Our Edit</SectionTitle>
        <div className="flex justify-center gap-10 mb-10 text-[11px] tracking-[0.3em] uppercase">
          {(["new", "featured", "sale"] as const).map((k) => (
            <button key={k} onClick={() => setTab(k)} className={`pb-2 border-b ${tab === k ? "border-accent text-foreground" : "border-transparent text-muted-foreground"}`}>
              {k === "new" ? "New Arrived" : k === "featured" ? "Featured" : "On Sale"}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {tabbed.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>

      {/* About brand — image banner (3/4 screen) with fused text */}
      <section className="relative w-full mt-24" style={{ height: "75vh" }}>
        <img
          src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1800&q=80"
          alt="Ridhvi atelier"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-[1400px] mx-auto w-full px-10 md:px-16 text-white">
            <p className="text-[11px] tracking-[0.35em] uppercase text-white/80">About Ridhvi</p>
            <h2 className="mt-4 font-display text-5xl md:text-7xl leading-[1.05] max-w-2xl">
              Made by hand,<br />meant to last.
            </h2>
            <p className="mt-6 max-w-lg text-white/85 leading-relaxed">
              Every piece is cast, finished and polished by our small team. Solid sterling silver, ethically-sourced stones — worn and re-worn for a lifetime.
            </p>
            <Link to="/shop" className="inline-block mt-8 border border-white px-10 py-3.5 text-[11px] tracking-[0.3em] uppercase hover:bg-white hover:text-black transition">
              Discover More
            </Link>
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="max-w-[1400px] mx-auto px-6 mt-24">
        <SectionTitle>Shop by Category</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {CATEGORIES.map((c, i) => (
            <Link to="/shop" key={c} className="group relative aspect-square overflow-hidden bg-secondary rounded-3xl">
              <img src={`https://images.unsplash.com/photo-${["1515562141207-7a88fb7ce338","1611591437281-460bfbe1220a","1602173574767-37ac01994b2a","1535632787350-4e68ef0ac584"][i]}?w=600&q=80`} alt={c} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              <div className="absolute inset-x-0 bottom-0 bg-background/90 py-3 text-center text-[11px] tracking-[0.3em] uppercase">{c}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="max-w-[1400px] mx-auto px-6 mt-24">
        <SectionTitle subtitle="Loved by the Ridhvi community.">Bestsellers</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {PRODUCTS.slice(0, 4).map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[1400px] mx-auto px-6 mt-24 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { i: Truck, t: "Free Delivery" },
          { i: ShieldCheck, t: "Money Back Guarantee" },
          { i: MessageCircle, t: "24/7 Support" },
          { i: Award, t: "Hand-finished Quality" },
        ].map(({ i: Icon, t }) => (
          <div key={t} className="flex items-center justify-center gap-3 py-6">
            <Icon className="w-5 h-5 text-accent" />
            <span className="text-sm tracking-wide">{t}</span>
          </div>
        ))}
      </section>

      <Footer />
    </div>
  );
}
