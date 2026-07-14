import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingCart, User as UserIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { ordersService } from "@/services/orders.service";
import { formatCurrency, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Nimbus" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuthStore();
  const cartCount = useCartStore((s) => s.count());
  const cartTotal = useCartStore((s) => s.total());

  const orders = useQuery({
    queryKey: ["orders", "me"],
    queryFn: () => ordersService.myOrders().catch(() => []),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
        Welcome back, {user?.username} 👋
      </h1>
      <p className="text-muted-foreground mt-1">Here's a quick look at your account.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={UserIcon} label="Profile" value={user?.username ?? "—"} sub={user?.email ?? "Customer account"} />
        <StatCard icon={ShoppingCart} label="Cart" value={`${cartCount} items`} sub={formatCurrency(cartTotal)} />
        <StatCard icon={Package} label="Orders" value={`${orders.data?.length ?? 0}`} sub="Lifetime orders" />
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent orders</h2>
          <Button asChild variant="ghost" size="sm"><Link to="/orders">View all</Link></Button>
        </div>
        <Card className="mt-4 border-border/60">
          <CardContent className="p-0">
            {orders.isLoading ? (
              <p className="p-6 text-sm text-muted-foreground">Loading…</p>
            ) : (orders.data ?? []).length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">You don't have any orders yet.</p>
            ) : (
              <ul className="divide-y">
                {(orders.data ?? []).slice(0, 5).map((o) => (
                  <li key={o.id} className="grid grid-cols-[1fr_auto] sm:grid-cols-4 gap-2 p-4 items-center">
                    <span className="font-medium">#{o.id}</span>
                    <span className="text-sm text-muted-foreground hidden sm:block">{formatDate(o.createdAt)}</span>
                    <Badge variant="secondary" className="justify-self-start">{o.status}</Badge>
                    <span className="font-semibold text-right">{formatCurrency(o.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: typeof Package; label: string; value: string; sub: string }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
        <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}
