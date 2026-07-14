import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usersService } from "@/services/users.service";
import { formatDate } from "@/lib/format";
import { useDebounce } from "@/hooks/useDebounce";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const search = useDebounce(q, 300);

  const list = useQuery({
    queryKey: ["admin", "users", page, search],
    queryFn: () =>
      usersService.all(page, 10, search)
        .catch(() => ({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 })),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Users</h1>

      <div className="mt-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search users…" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} className="pl-9" />
      </div>

      <Card className="mt-4 border-border/60">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Registered</th>
              </tr>
            </thead>
            <tbody>
              {(list.data?.content ?? []).map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{u.username}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{u.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(u.roles ?? []).map((r) => (
                        <Badge key={r} variant={r === "ROLE_ADMIN" ? "default" : "secondary"}>
                          {r.replace("ROLE_", "")}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
              {!list.isLoading && (list.data?.content ?? []).length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">No users found.</td></tr>
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
