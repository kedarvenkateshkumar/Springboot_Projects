import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { ordersService } from "@/services/orders.service";
import { formatCurrency } from "@/lib/format";
import { Spinner } from "@/components/Spinner";
import { EmptyState } from "@/components/EmptyState";
import { getApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Nimbus" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, total, clear } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", city: "", zip: "" });

  if (!isAuthenticated()) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Sign in to checkout</h1>
        <p className="text-muted-foreground mt-2">You need an account to place an order.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild><Link to="/login">Sign in</Link></Button>
          <Button asChild variant="outline"><Link to="/register">Create account</Link></Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState title="Your cart is empty" action={<Button asChild><Link to="/products">Shop now</Link></Button>} />
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ordersService.place({
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        shippingAddress: `${form.name}, ${form.address}, ${form.city} ${form.zip}`,
      });
      clear();
      toast.success("Order placed!");
      navigate({ to: "/orders" });
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Failed to place order"));
    } finally {
      setSubmitting(false);
    }
  };

  const shipping = total() > 50 ? 0 : 5;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Checkout</h1>

      <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="border-border/60">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold">Shipping information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="zip">ZIP</Label>
                <Input id="zip" required value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 h-fit">
          <CardContent className="p-6">
            <h2 className="font-semibold">Order summary</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {items.map((i) => (
                <li key={i.product.id} className="flex justify-between gap-2">
                  <span className="truncate">{i.product.name} × {i.quantity}</span>
                  <span className="shrink-0">{formatCurrency(i.product.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 pt-4 border-t space-y-2 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCurrency(total())}</dd></div>
              <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping === 0 ? "Free" : formatCurrency(shipping)}</dd></div>
              <div className="flex justify-between font-semibold pt-2 border-t"><dt>Total</dt><dd>{formatCurrency(total() + shipping)}</dd></div>
            </dl>
            <Button type="submit" size="lg" className="w-full mt-6" disabled={submitting}>
              {submitting ? <Spinner className="h-4 w-4" /> : "Place order"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
