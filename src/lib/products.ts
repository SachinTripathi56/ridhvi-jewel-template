export type Product = {
  slug: string;
  name: string;
  price: number;
  oldPrice?: number;
  category: string;
  subcategory?: string;
  image: string;
  badge?: "NEW" | "FEATURED" | "SALE";
  brand?: string;
  description: string;
  sku: string;
  tags: string[];
};

// Using Unsplash photos of silver jewellery
export const PRODUCTS: Product[] = [
  {
    slug: "moonlight-silver-pendant",
    name: "Moonlight Silver Pendant",
    price: 240,
    category: "Necklaces",
    subcategory: "Pendants",
    image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=900&q=80",
    badge: "NEW",
    brand: "Ridhvi Atelier",
    description:
      "A delicate sterling silver pendant inspired by the soft glow of moonlight. Hand-finished in our atelier.",
    sku: "RDV-NP-001",
    tags: ["silver", "pendant", "minimal"],
  },
  {
    slug: "celeste-hoop-earrings",
    name: "Celeste Hoop Earrings",
    price: 180,
    oldPrice: 220,
    category: "Earrings",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=80",
    badge: "SALE",
    brand: "Ridhvi Atelier",
    description: "Sculptural sterling silver hoops with a brushed satin finish.",
    sku: "RDV-EA-014",
    tags: ["silver", "hoops", "earrings"],
  },
  {
    slug: "lumiere-stack-ring",
    name: "Lumière Stack Ring",
    price: 320,
    category: "Rings",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=80",
    badge: "FEATURED",
    brand: "Ridhvi Atelier",
    description: "Three-band stackable ring in solid sterling silver with pavé detailing.",
    sku: "RDV-RG-022",
    tags: ["silver", "ring", "stack"],
  },
  {
    slug: "aurora-link-bracelet",
    name: "Aurora Link Bracelet",
    price: 410,
    category: "Bracelets",
    image: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=900&q=80",
    brand: "Ridhvi Atelier",
    description: "Polished silver link bracelet with hidden box clasp.",
    sku: "RDV-BR-007",
    tags: ["silver", "bracelet"],
  },
  {
    slug: "ivory-pearl-drops",
    name: "Ivory Pearl Drops",
    price: 295,
    category: "Earrings",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=900&q=80",
    badge: "NEW",
    brand: "Ridhvi Atelier",
    description: "Freshwater pearl drops set on a silver post.",
    sku: "RDV-EA-031",
    tags: ["pearl", "silver", "earrings"],
  },
  {
    slug: "solitaire-silver-band",
    name: "Solitaire Silver Band",
    price: 520,
    category: "Rings",
    image: "https://images.unsplash.com/photo-1603561596112-db1d6e3a6f88?w=900&q=80",
    description: "A solitaire white-stone ring in a brushed silver setting.",
    sku: "RDV-RG-044",
    tags: ["ring", "solitaire", "silver"],
  },
  {
    slug: "veil-chain-necklace",
    name: "Veil Chain Necklace",
    price: 260,
    category: "Necklaces",
    image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=900&q=80",
    description: "Whisper-fine silver chain. Layers beautifully.",
    sku: "RDV-NP-018",
    tags: ["chain", "silver", "necklace"],
  },
  {
    slug: "petal-stud-set",
    name: "Petal Stud Set",
    price: 145,
    oldPrice: 170,
    category: "Earrings",
    image: "https://images.unsplash.com/photo-1591437098060-d3f9f57b3ad5?w=900&q=80",
    badge: "SALE",
    description: "Sculpted petal studs cast in sterling silver.",
    sku: "RDV-EA-009",
    tags: ["stud", "silver", "minimal"],
  },
];

export const CATEGORIES = ["Rings", "Earrings", "Necklaces", "Bracelets"] as const;

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}
