import { Link, Outlet, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";

const items = [
  { to: "/account/profile", label: "Profile" },
  { to: "/account/orders", label: "Orders" },
  { to: "/account/addresses", label: "Addresses" },
  { to: "/account/wishlist", label: "Wishlist" },
];

function AccountLayout() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <Header />
      <section className="bg-secondary py-14 text-center">
        <h1 className="text-5xl">My Account</h1>
        {user && <p className="mt-2 text-xs tracking-[0.3em] uppercase text-muted-foreground">{user.email}</p>}
      </section>

      <div className="max-w-[1200px] mx-auto px-6 py-16 grid md:grid-cols-[220px_1fr] gap-10">
        <aside>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.to}>
                <Link
                  to={i.to}
                  className={`block py-2 px-3 tracking-wide hover:text-accent transition ${
                    location.pathname === i.to ? "text-accent border-l-2 border-accent pl-2" : ""
                  }`}
                >
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <main>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default AccountLayout;
