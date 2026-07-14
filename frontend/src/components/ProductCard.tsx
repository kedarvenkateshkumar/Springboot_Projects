import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/store/cart.store";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const add = useCartStore((s) => s.add);

  return (
    <Card className="group overflow-hidden border-border/60 transition-all hover:shadow-elevated">
      <Link
        to="/products/$id"
        params={{ id: String(product.id) }}
        className="block aspect-square overflow-hidden bg-muted"
      >
        <img
          src={product.imageUrl || "https://placehold.co/600x600/eef2ff/64748b?text=Product"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </Link>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to="/products/$id"
              params={{ id: String(product.id) }}
              className="line-clamp-1 font-medium hover:text-primary"
            >
              {product.name}
            </Link>
            {product.categoryName && (
              <p className="text-xs text-muted-foreground">{product.categoryName}</p>
            )}
          </div>
          <p className="shrink-0 font-semibold text-primary">{formatCurrency(product.price)}</p>
        </div>
        <Button
          size="sm"
          className="mt-3 w-full"
          onClick={() => {
            add(product);
            toast.success("Added to cart", { description: product.name });
          }}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stock === 0 ? "Out of stock" : "Add to cart"}
        </Button>
      </CardContent>
    </Card>
  );
}
