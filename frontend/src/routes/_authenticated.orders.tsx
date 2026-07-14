import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ordersService } from "@/services/orders.service";
import { formatCurrency, formatDate } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "My orders — Nimbus" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const orders = useQuery({
    queryKey: ["orders", "me"],
    queryFn: () => ordersService.myOrders().catch(() => []),
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Order history</h1>

      <div className="mt-6 space-y-4">
        {orders.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (orders.data ?? []).length === 0 ? (
          <EmptyState title="No orders yet" description="When you place an order, it'll appear here." />
        ) : (
          (orders.data ?? []).map((o) => (
            <Card key={o.id} className="border-border/60">
              <CardContent className="p-6">
                <header className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 sm:flex sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold">Order #{o.id}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</p>
                  </div>
                  <Badge>{o.status}</Badge>
                </header>
                <ul className="mt-4 space-y-1 text-sm">
                  {o.items?.map((it, i) => (
                    <li key={i} className="flex justify-between">
                      <span className="truncate">{it.productName} × {it.quantity}</span>
                      <span>{formatCurrency(it.price * it.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(o.total)}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
