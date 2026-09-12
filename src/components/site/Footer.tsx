import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 lg:px-6">
        <div>
          <p className="font-display text-lg font-extrabold text-primary">NammaSpot</p>
          <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
            Give your Instagram business its own spot. Free business pages for Tamil Nadu's small
            sellers.
          </p>
          <div className="mt-4 h-0.5 w-24 rule-maroon" />
        </div>
        <nav className="text-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Customers
          </p>
          <ul className="space-y-2">
            <li>
              <Link to="/sellers" className="hover:text-primary">
                Find sellers
              </Link>
            </li>
            <li>
              <Link to="/categories" className="hover:text-primary">
                Categories
              </Link>
            </li>
          </ul>
        </nav>
        <nav className="text-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Sellers
          </p>
          <ul className="space-y-2">
            <li>
              <Link to="/register" className="hover:text-primary">
                List your business
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-primary">
                Seller login
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <p className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © 2026 NammaSpot · Namma Ooru. Namma People. Namma Spot.
      </p>
    </footer>
  );
}
