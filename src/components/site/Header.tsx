import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/categories", label: "Categories" },
  { to: "/sellers", label: "Sellers" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            to="/"
            className="shrink-0 font-display text-xl font-extrabold tracking-tight text-primary"
          >
            NammaSpot
          </Link>
          <nav className="hidden items-center gap-5 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{
                  className:
                    "text-sm text-primary font-semibold underline decoration-2 underline-offset-8",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {user ? (
            <Button asChild size="sm" className="hidden rounded-full sm:inline-flex">
              <Link to="/dashboard">
                <LayoutDashboard className="size-4" /> Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild size="sm" className="hidden rounded-full sm:inline-flex">
                <Link to="/register">List Your Business</Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="hidden rounded-full sm:inline-flex"
              >
                <Link to="/login">Login</Link>
              </Button>
            </>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="md:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="font-display text-primary">NammaSpot</SheetTitle>
              <nav className="mt-6 flex flex-col gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="my-3 h-px bg-border" />
                {user ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                  >
                    Seller dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                    >
                      List Your Business
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                    >
                      Seller Login
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
