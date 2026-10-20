import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import { useSiteSettings } from "@/lib/site-settings";

export function Footer() {
  const s = useSiteSettings();

  return (
    <footer className="mt-24 bg-secondary text-foreground">
      {/* Brand bar */}
      <div className="border-b border-border/60">
        <div className="max-w-[1400px] mx-auto px-8 py-10 text-center">
          <p className="wordmark text-4xl tracking-[0.5em] text-foreground" style={{ textIndent: "0.5em" }}>PARVIOR</p>
          {s.tagline && (
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">{s.tagline}</p>
          )}
          {/* Social icons */}
          <div className="flex gap-5 justify-center mt-5">
            {s.instagramUrl && s.instagramUrl !== "#" && (
              <a href={s.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-accent transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {!s.instagramUrl || s.instagramUrl === "#" ? (
              <a href="#" aria-label="Instagram" className="hover:text-accent transition-colors"><Instagram className="w-4 h-4" /></a>
            ) : null}
            {s.facebookUrl && s.facebookUrl !== "#" ? (
              <a href={s.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-accent transition-colors"><Facebook className="w-4 h-4" /></a>
            ) : <a href="#" aria-label="Facebook" className="hover:text-accent transition-colors"><Facebook className="w-4 h-4" /></a>}
            {s.twitterUrl && s.twitterUrl !== "#" ? (
              <a href={s.twitterUrl} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-accent transition-colors"><Twitter className="w-4 h-4" /></a>
            ) : <a href="#" aria-label="Twitter" className="hover:text-accent transition-colors"><Twitter className="w-4 h-4" /></a>}
            {s.youtubeUrl && s.youtubeUrl !== "#" && (
              <a href={s.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-accent transition-colors"><Youtube className="w-4 h-4" /></a>
            )}
          </div>
        </div>
      </div>

      {/* Main footer columns */}
      <div className="max-w-[1400px] mx-auto px-8 py-12 grid md:grid-cols-4 gap-10">
        {/* Brand blurb */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground mb-4">Parvior Jewels</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Hand-finished jewellery, crafted for the modern heirloom collector.
          </p>
        </div>

        {/* My Account */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground mb-4">My Account</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/account/profile" className="hover:text-foreground transition-colors">My Account</Link></li>
            <li><Link to="/account/wishlist" className="hover:text-foreground transition-colors">Wishlist</Link></li>
            <li><Link to="/cart" className="hover:text-foreground transition-colors">Cart</Link></li>
            <li><Link to="/account/orders" className="hover:text-foreground transition-colors">Orders</Link></li>
          </ul>
        </div>

        {/* Information */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground mb-4">Information</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link></li>
            <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Shipping & Returns</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground mb-4">Our Contacts</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {s.address && <li>{s.address}</li>}
            {s.phone && <li><a href={`tel:${s.phone}`} className="hover:text-foreground transition-colors">{s.phone}</a></li>}
            {s.email && <li><a href={`mailto:${s.email}`} className="hover:text-foreground transition-colors">{s.email}</a></li>}
            {s.hours && <li>{s.hours}</li>}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border py-5 text-center text-xs tracking-widest text-muted-foreground">
        {s.footerText || `© ${new Date().getFullYear()} Parvior Jewels — All rights reserved`}
      </div>
    </footer>
  );
}
