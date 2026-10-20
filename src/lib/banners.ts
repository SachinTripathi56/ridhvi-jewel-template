import { useEffect, useState } from "react";

export type Banner = {
  id: string;
  image: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  href?: string;
  showText?: boolean;
};

const KEY = "parvior.banners";
const INTERVAL_KEY = "parvior.banners.interval";

export const defaultBanners: Banner[] = [
  {
    id: "b1",
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1800&q=80",
    eyebrow: "New in our shop",
    title: "Amadeus Jewelry\nCollection",
    subtitle: "NEW IN OUR SHOP",
    cta: "Shop Now",
    href: "/shop",
    showText: true,
  },
  {
    id: "b2",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1800&q=80",
    eyebrow: "Signature edit",
    title: "Sterling Silver\nHeirlooms",
    subtitle: "HAND-FINISHED IN OUR ATELIER",
    cta: "Explore",
    href: "/shop",
    showText: true,
  },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>(defaultBanners);
  const [intervalSec, setIntervalSec] = useState<number>(5);

  useEffect(() => {
    setBanners(read(KEY, defaultBanners));
    setIntervalSec(read(INTERVAL_KEY, 5));
    const onStorage = () => {
      setBanners(read(KEY, defaultBanners));
      setIntervalSec(read(INTERVAL_KEY, 5));
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("banners:update", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("banners:update", onStorage);
    };
  }, []);

  const save = (next: Banner[]) => {
    setBanners(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("banners:update"));
  };
  const saveInterval = (n: number) => {
    setIntervalSec(n);
    localStorage.setItem(INTERVAL_KEY, JSON.stringify(n));
    window.dispatchEvent(new Event("banners:update"));
  };

  return { banners, intervalSec, save, saveInterval };
}
