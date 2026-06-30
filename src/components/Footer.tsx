import { Logo } from "./Logo";
import { Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 bg-secondary text-foreground">
      <div className="max-w-[1400px] mx-auto px-8 py-16 grid md:grid-cols-4 gap-10">
        <div>
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Hand-finished sterling silver jewellery, made for the modern heirloom collector.
          </p>
          <div className="flex gap-3 mt-5">
            <a href="#" aria-label="Instagram" className="hover:text-accent"><Instagram className="w-4 h-4" /></a>
            <a href="#" aria-label="Facebook" className="hover:text-accent"><Facebook className="w-4 h-4" /></a>
            <a href="#" aria-label="Twitter" className="hover:text-accent"><Twitter className="w-4 h-4" /></a>
          </div>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.22em] text-accent mb-4">My Account</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>My account</li><li>Wishlist</li><li>Cart</li><li>Orders</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.22em] text-accent mb-4">Information</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>About Us</li><li>Our Blog</li><li>FAQ</li><li>Shipping & Returns</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.22em] text-accent mb-4">Our Contacts</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>283 N. Glenwood Street, Levittown, NY 11756</li>
            <li>+1 712-339-9294</li>
            <li>Mon – Fri: 10:00 – 18:00</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs tracking-widest text-muted-foreground">
        © {new Date().getFullYear()} Ridhvi Atelier — All rights reserved
      </div>
    </footer>
  );
}
