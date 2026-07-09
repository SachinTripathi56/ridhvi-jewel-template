import { useEffect, useState } from "react";

export type Story = {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  image: string;
};

const KEY = "ridhvi.story";

export const defaultStory: Story = {
  eyebrow: "About Ridhvi",
  title: "Made by hand,\nmeant to last.",
  body: "Every piece is cast, finished and polished by our small team. Solid sterling silver, ethically-sourced stones — worn and re-worn for a lifetime.",
  cta: "Discover More",
  href: "/shop",
  image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1800&q=80",
};

export function useStory() {
  const [story, setStory] = useState<Story>(defaultStory);
  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem(KEY);
        setStory(raw ? { ...defaultStory, ...JSON.parse(raw) } : defaultStory);
      } catch {
        setStory(defaultStory);
      }
    };
    read();
    window.addEventListener("story:update", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("story:update", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  const save = (next: Story) => {
    setStory(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("story:update"));
  };

  return { story, save };
}
