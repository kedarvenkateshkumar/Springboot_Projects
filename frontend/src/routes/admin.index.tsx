import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, Users, ShoppingBag, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usersService } from "@/services/users.service";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const stats = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () =>
      usersService.stats().catch(() => ({ totalProducts: 0, totalUsers: 0, totalOrders: 0, revenue: 0 })),
  });

  const cards = [
    { label: "Total Products", value: stats.data?.totalProducts ?? 0, icon: Package, tint: "bg-blue-500/10 text-blue-600" },
    { label: "Total Users", value: stats.data?.totalUsers ?? 0, icon: Users, tint: "bg-indigo-500/10 text-indigo-600" },
    { label: "Total Orders", value: stats.data?.totalOrders ?? 0, icon: ShoppingBag, tint: "bg-sky-500/10 text-sky-600" },
    { label: "Revenue", value: formatCurrency(stats.data?.revenue ?? 0), icon: DollarSign, tint: "bg-emerald-500/10 text-emerald-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground mt-1 text-sm">Store overview at a glance.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <div className={`grid h-9 w-9 place-items-center rounded-lg ${c.tint}`}>
                  <c.icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
