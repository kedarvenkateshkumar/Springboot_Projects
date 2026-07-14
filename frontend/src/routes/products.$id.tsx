import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Minus, Plus, ShoppingCart, Zap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/ProductCard";
import { productsService } from "@/services/products.service";
import { useCartStore } from "@/store/cart.store";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/products/$id")({
  head: () => ({ meta: [{ title: "Product — Nimbus" }] }),
  component: ProductDetails,
});

function ProductDetails() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const add = useCartStore((s) => s.add);
  const [qty, setQty] = useState(1);

  const product = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsService.byId(id),
  });
  const related = useQuery({
    queryKey: ["product", id, "related"],
    queryFn: () => productsService.related(id).catch(() => []),
    enabled: !!product.data,
  });

  if (product.isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-2 gap-8">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!product.data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Button asChild className="mt-4"><Link to="/products">Back to products</Link></Button>
      </div>
    );
  }

  const p = product.data;
  const inStock = p.stock > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate({ to: "/products" })}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </button>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl bg-muted">
          <img
            src={p.imageUrl || "https://placehold.co/800x800/eef2ff/64748b?text=Product"}
            alt={p.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          {p.categoryName && <p className="text-sm text-muted-foreground">{p.categoryName}</p>}
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{p.name}</h1>
          <p className="mt-3 text-3xl font-semibold text-primary">{formatCurrency(p.price)}</p>

          <div className="mt-4">
            <Badge variant={inStock ? "default" : "destructive"}>
              {inStock ? `In stock (${p.stock})` : "Out of stock"}
            </Badge>
          </div>

          <p className="mt-6 text-muted-foreground leading-relaxed whitespace-pre-line">
            {p.description}
          </p>

          <div className="mt-8 flex items-center gap-4">
            <div className="inline-flex items-center rounded-md border">
              <Button variant="ghost" size="icon" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQty((q) => Math.min(p.stock || 99, q + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="flex-1"
              disabled={!inStock}
              onClick={() => {
                add(p, qty);
                toast.success("Added to cart", { description: p.name });
              }}
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> Add to cart
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="flex-1"
              disabled={!inStock}
              onClick={() => {
                add(p, qty);
                navigate({ to: "/checkout" });
              }}
            >
              <Zap className="mr-2 h-4 w-4" /> Buy now
            </Button>
          </div>
        </div>
      </div>

      {related.data && related.data.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold">Related products</h2>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.data.slice(0, 4).map((r) => <ProductCard key={r.id} product={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
