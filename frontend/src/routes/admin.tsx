import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Home } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    if (typeof window === "undefined") return;
    const { token, user } = useAuthStore.getState();
    if (!token) throw redirect({ to: "/login", search: { redirect: location.href } as never });
    if (!user?.roles?.includes("ROLE_ADMIN")) throw redirect({ to: "/" });
  },
  head: () => ({ meta: [{ title: "Admin — Nimbus" }] }),
  component: AdminLayout,
});

const nav: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/users", label: "Users", icon: Users },
];

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="min-h-screen bg-muted/30 grid md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden md:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <Link to="/admin" className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary text-primary-foreground font-bold">N</div>
          <span className="font-bold">Nimbus Admin</span>
        </Link>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:bg-sidebar-accent text-sidebar-foreground/80"
                }`}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-1">
          <Link to="/" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent">
            <Home className="h-4 w-4" /> Back to site
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-col">
        <header className="md:hidden flex items-center justify-between h-14 px-4 border-b bg-background">
          <Link to="/admin" className="font-bold">Nimbus Admin</Link>
          <Button asChild variant="ghost" size="sm"><Link to="/">Exit</Link></Button>
        </header>
        <nav className="md:hidden flex gap-1 p-2 overflow-x-auto border-b bg-background">
          {nav.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium ${active ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {n.label}
              </Link>
            );
          })}
        </nav>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
