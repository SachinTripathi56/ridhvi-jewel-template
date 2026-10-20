import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { SectionTitle } from "@/components/SectionTitle";
import { PRODUCTS } from "@/lib/products";
import { api } from "@/lib/api";
import { apiAvailable } from "@/lib/http";
import { useQuery } from "@tanstack/react-query";
import type { Product, Collection } from "@/lib/types";
import { useBanners } from "@/lib/banners";
import { useStory } from "@/lib/story";
import { useEffect, useState } from "react";
import { Truck, ShieldCheck, MessageCircle, Award, ChevronLeft, ChevronRight } from "lucide-react";

function Home() {
  const [tab, setTab] = useState<"new" | "featured" | "sale">("featured");
  const { story } = useStory();
  const { banners, intervalSec } = useBanners();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(
      () => setIdx((i) => (i + 1) % banners.length),
      Math.max(2, intervalSec) * 1000
    );
    return () => clearInterval(t);
  }, [banners.length, intervalSec]);

  const active = banners[idx] ?? banners[0];

  // Fetch all products from backend (or mock fallback)
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["home-products"],
    queryFn: () => apiAvailable() ? api.getProducts({ size: 48 }) : Promise.resolve(PRODUCTS as Product[]),
  });

  // Tabbed filter (new arrivals / featured / on sale)
  const tabbed = allProducts.filter((p) =>
    tab === "new" ? (p.badge === "NEW" || p.isNew) :
    tab === "featured" ? (p.badge === "FEATURED" || p.featured) :
    (!!p.oldPrice || !!p.mrp)
  ).slice(0, 4);

  // Bestsellers — first 4 products
  const bestsellers = allProducts.slice(0, 4);

  // Categories — only from backend
  const { data: displayCategories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.getCategories(),
    enabled: apiAvailable(),
  });

  // Collections — dynamic from backend only (no fallback dummies)
  const { data: collections = [] } = useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: () => api.getCollections(),
    retry: 1,
    staleTime: 60_000,
  });

  // Fallback unsplash images for categories without images
  const FALLBACK_CAT_IMGS = [
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80",
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80",
    "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80",
    "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&q=80",
  ];

  return (
    <div className="min-h-screen">
      <Header transparentOnTop />

      {/* Hero — full-viewport banner */}
      <section className="relative h-screen w-full overflow-hidden">
        {banners.map((b, i) => (
          <div
            key={b.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === idx ? "opacity-100" : "opacity-0"}`}
          >
            <img
              src={b.image}
              alt={b.title ?? "Parvior banner"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/25" />
          </div>
        ))}

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-[1600px] w-full mx-auto px-10 grid md:grid-cols-2 gap-10 items-center">
            <div />
            {active && (active.showText ?? true) && (
              <div className="bg-[#c9a48a]/90 backdrop-blur-sm text-white px-12 py-16 max-w-xl ml-auto">
                {active.eyebrow && (
                  <p className="text-[13px] tracking-[0.35em] uppercase mb-4">{active.eyebrow}</p>
                )}
                <h1 className="font-display text-6xl md:text-7xl leading-[1.05] whitespace-pre-line">
                  {active.title}
                </h1>
                {active.subtitle && (
                  <p className="mt-6 text-[13px] tracking-[0.32em]">{active.subtitle}</p>
                )}
                {active.cta && (
                  <Link
                    to={active.href ?? "/shop"}
                    className="mt-8 inline-block bg-black text-white px-10 py-4 text-[12px] tracking-[0.3em] uppercase hover:opacity-90"
                  >
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
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === idx ? "w-8 bg-white" : "w-3 bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Promo / Collections — only when real DB collections exist */}
      {collections.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 mt-20 grid md:grid-cols-3 gap-5">
          {collections.slice(0, 3).map((c) => (
            <Link to={c.linkUrl ?? "/shop"} key={c.id} className="group relative aspect-[4/3] overflow-hidden bg-secondary rounded-3xl">
              {c.imageUrl ? (
                <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-700" />
              ) : (
                <div className="w-full h-full bg-secondary" />
              )}
              <div className="absolute inset-0 bg-foreground/15" />
              <div className="absolute inset-0 flex flex-col justify-center px-8 text-white">
                <h3 className="text-3xl">{c.name}</h3>
                {c.offer && <p className="mt-2 text-xs tracking-[0.3em] uppercase">{c.offer}</p>}
                <span className="mt-5 inline-block w-fit border border-white/80 px-6 py-2 text-[10px] tracking-[0.3em] uppercase">Explore</span>
              </div>
            </Link>
          ))}
        </section>
      )}

      {/* Tabbed product showcase */}
      <section className="max-w-[1400px] mx-auto px-6 mt-24">
        <SectionTitle subtitle="Curated by our atelier.">Our Edit</SectionTitle>
        <div className="flex justify-center gap-10 mb-10 text-[14px] tracking-[0.3em] uppercase">
          {(["new", "featured", "sale"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`pb-2 border-b-2 ${tab === k ? "border-accent text-foreground" : "border-transparent text-muted-foreground"}`}
            >
              {k === "new" ? "New Arrived" : k === "featured" ? "Featured" : "On Sale"}
            </button>
          ))}
        </div>
        {tabbed.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {tabbed.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-8">
            {apiAvailable() ? "No products in this category yet. Add some in the admin panel." : "No products match."}
          </p>
        )}
      </section>

      {/* About brand */}
      <section className="relative w-full mt-24" style={{ height: "75vh" }}>
        <img src={story.image} alt="Parvior Atelier" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-[1400px] mx-auto w-full px-10 md:px-16 text-white">
            <p className="text-[13px] tracking-[0.35em] uppercase text-white/85">{story.eyebrow}</p>
            <h2 className="mt-4 font-display text-6xl md:text-8xl leading-[1.02] max-w-3xl whitespace-pre-line">
              {story.title}
            </h2>
            <p className="mt-8 max-w-xl text-lg text-white/90 leading-relaxed">{story.body}</p>
            <Link
              to={story.href || "/shop"}
              className="inline-block mt-10 border border-white px-12 py-4 text-[13px] tracking-[0.3em] uppercase hover:bg-white hover:text-black transition"
            >
              {story.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* Category grid — only when real DB categories exist */}
      {displayCategories.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 mt-24">
          <SectionTitle>Shop by Category</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {(displayCategories as any[]).slice(0, 8).map((cat, i) => {
              const name = typeof cat === "string" ? cat : cat.name;
              const imgUrl = cat?.imageUrl || FALLBACK_CAT_IMGS[i % 4];
              return (
                <Link to={`/shop?category=${encodeURIComponent(name)}`} key={name} className="group relative aspect-square overflow-hidden bg-secondary rounded-3xl">
                  <img src={imgUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                  <div className="absolute inset-x-0 bottom-0 bg-background/90 py-3 text-center text-[11px] tracking-[0.3em] uppercase">{name}</div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Bestsellers */}
      <section className="max-w-[1400px] mx-auto px-6 mt-24">
        <SectionTitle subtitle="Loved by the Parvior community.">Bestsellers</SectionTitle>
        {bestsellers.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bestsellers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-8">
            {apiAvailable() ? "Add products in the admin panel to see them here." : "Connect the backend to show real products."}
          </p>
        )}
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

export default Home;
