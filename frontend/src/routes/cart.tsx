import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { useCartStore } from "@/store/cart.store";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — Nimbus" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, increment, decrement, remove, total } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Your cart</h1>
        <EmptyState
          icon={<ShoppingBag className="h-6 w-6" />}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet."
          action={<Button asChild><Link to="/products">Browse products</Link></Button>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your cart</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-3">
          {items.map(({ product, quantity }) => (
            <Card key={product.id} className="border-border/60">
              <CardContent className="p-4 grid grid-cols-[80px_minmax(0,1fr)_auto] gap-4 items-center">
                <img
                  src={product.imageUrl || "https://placehold.co/200x200"}
                  alt={product.name}
                  className="h-20 w-20 rounded-md object-cover bg-muted"
                />
                <div className="min-w-0">
                  <Link to="/products/$id" params={{ id: String(product.id) }} className="font-medium hover:text-primary truncate block">
                    {product.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{formatCurrency(product.price)}</p>
                  <div className="mt-2 inline-flex items-center rounded-md border">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => decrement(product.id)}>
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => increment(product.id)}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(product.price * quantity)}</p>
                  <Button variant="ghost" size="icon" onClick={() => remove(product.id)} className="text-muted-foreground hover:text-destructive mt-1">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <aside>
          <Card className="border-border/60 sticky top-20">
            <CardContent className="p-6">
              <h2 className="font-semibold">Order summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatCurrency(total())}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{total() > 50 ? "Free" : formatCurrency(5)}</dd></div>
                <div className="border-t pt-2 mt-2 flex justify-between font-semibold"><dt>Total</dt><dd>{formatCurrency(total() + (total() > 50 ? 0 : 5))}</dd></div>
              </dl>
              <Button asChild className="w-full mt-6" size="lg">
                <Link to="/checkout">Checkout</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
