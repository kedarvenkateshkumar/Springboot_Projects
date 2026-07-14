import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ordersService } from "@/services/orders.service";
import type { OrderStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const STATUSES: OrderStatus[] = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

function AdminOrders() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);

  const list = useQuery({
    queryKey: ["admin", "orders", page],
    queryFn: () =>
      ordersService.all(page, 10)
        .catch(() => ({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 })),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: OrderStatus }) =>
      ordersService.updateStatus(id, status),
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Orders</h1>

      <Card className="mt-4 border-border/60">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Date</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(list.data?.content ?? []).map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="px-4 py-3 font-medium">#{o.id}</td>
                  <td className="px-4 py-3">{o.username ?? "—"}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3">{formatCurrency(o.total)}</td>
                  <td className="px-4 py-3">
                    <Select
                      value={o.status}
                      onValueChange={(v) => updateStatus.mutate({ id: o.id, status: v as OrderStatus })}
                    >
                      <SelectTrigger className="h-8 w-[140px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
              {!list.isLoading && (list.data?.content ?? []).length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No orders.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {list.data && list.data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground px-2">Page {page + 1} of {list.data.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page + 1 >= list.data.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
