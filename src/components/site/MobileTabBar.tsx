import { Link } from "@tanstack/react-router";
import { Grid2x2, Home, LayoutDashboard, Search, UserRound } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";

export function MobileTabBar() {
  const { user } = useAuth();
  const tabs = [
    { to: "/", label: "Home", icon: Home },
    { to: "/categories", label: "Categories", icon: Grid2x2 },
    { to: "/sellers", label: "Sellers", icon: Search },
    user
      ? { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }
      : { to: "/login", label: "Login", icon: UserRound },
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="grid grid-cols-4">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex flex-col items-center gap-1 py-2 text-[10px] font-medium text-muted-foreground"
              activeProps={{ className: "text-primary" }}
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
