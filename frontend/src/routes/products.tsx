import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { productsService } from "@/services/products.service";
import { useDebounce } from "@/hooks/useDebounce";

interface Search {
  q?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
}

export const Route = createFileRoute("/products")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: s.q ? String(s.q) : undefined,
    categoryId: s.categoryId ? String(s.categoryId) : undefined,
    minPrice: s.minPrice ? Number(s.minPrice) : undefined,
    maxPrice: s.maxPrice ? Number(s.maxPrice) : undefined,
    sort: s.sort ? String(s.sort) : undefined,
    page: s.page ? Number(s.page) : 0,
  }),
  head: () => ({ meta: [{ title: "Products — Nimbus" }] }),
  component: Products,
});

function Products() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/products" });
  const [q, setQ] = useState(search.q ?? "");
  const debounced = useDebounce(q, 350);

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => productsService.categories().catch(() => []),
  });

  const list = useQuery({
    queryKey: ["products", { ...search, q: debounced }],
    queryFn: () =>
      productsService
        .list({
          search: debounced,
          categoryId: search.categoryId,
          minPrice: search.minPrice,
          maxPrice: search.maxPrice,
          sort: search.sort,
          page: search.page ?? 0,
          size: 12,
        })
        .catch(() => ({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 12 })),
  });

  const update = (patch: Partial<Search>) =>
    navigate({ search: (prev: Search) => ({ ...prev, ...patch, page: patch.page ?? 0 }) });

  const items = list.data?.content ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl sm:text-3xl font-bold tracking-tight">All products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {list.data ? `${list.data.totalElements} items` : "Loading…"}
          </p>
        </div>
      </header>

      <div className="mt-6 grid gap-4 md:grid-cols-[260px_minmax(0,1fr)]">
        {/* Filters */}
        <aside className="rounded-xl border bg-card p-4 h-fit space-y-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Search</label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  update({ q: e.target.value });
                }}
                placeholder="Search…"
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <Select
              value={search.categoryId ?? "all"}
              onValueChange={(v) => update({ categoryId: v === "all" ? undefined : v })}
            >
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {(categories.data ?? []).map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Price range</label>
            <div className="mt-1 flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                defaultValue={search.minPrice ?? ""}
                onBlur={(e) => update({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
              />
              <Input
                type="number"
                placeholder="Max"
                defaultValue={search.maxPrice ?? ""}
                onBlur={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <SlidersHorizontal className="h-3 w-3" /> Sort by
            </label>
            <Select value={search.sort ?? "newest"} onValueChange={(v) => update({ sort: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price,asc">Price: Low to High</SelectItem>
                <SelectItem value="price,desc">Price: High to Low</SelectItem>
                <SelectItem value="name,asc">Name: A → Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" className="w-full" onClick={() => navigate({ search: {} })}>
            Clear filters
          </Button>
        </aside>

        {/* Grid */}
        <section>
          {list.isLoading ? (
            <ProductGridSkeleton />
          ) : items.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try changing your filters or search terms."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>

              {list.data && list.data.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={(search.page ?? 0) === 0}
                    onClick={() => update({ page: (search.page ?? 0) - 1 })}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    Page {(search.page ?? 0) + 1} of {list.data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={(search.page ?? 0) + 1 >= list.data.totalPages}
                    onClick={() => update({ page: (search.page ?? 0) + 1 })}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
