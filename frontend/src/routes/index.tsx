import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search, Sparkles, Truck, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
import { productsService } from "@/services/products.service";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nimbus — Modern Commerce" },
      { name: "description", content: "Discover featured products, latest arrivals and shop by category." },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const featured = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => productsService.featured().catch(() => [] as never[]),
  });
  const latest = useQuery({
    queryKey: ["products", "latest"],
    queryFn: () => productsService.latest().catch(() => [] as never[]),
  });
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => productsService.categories().catch(() => [] as never[]),
  });

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> New season collection
              </span>
              <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Shop smarter, <span className="text-primary">live brighter</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-lg">
                Thoughtfully curated products at honest prices. Free shipping on orders over $50.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  navigate({ to: "/products", search: { q } as never });
                }}
                className="mt-6 flex w-full max-w-md gap-2"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search products..."
                    className="pl-9 h-11"
                  />
                </div>
                <Button type="submit" size="lg">Search</Button>
              </form>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Button asChild size="lg" variant="default">
                  <Link to="/products">Shop now <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-primary shadow-elevated overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop"
                  alt="Featured collection"
                  className="h-full w-full object-cover mix-blend-overlay opacity-90"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-3 gap-6 px-4 sm:px-6 lg:px-8 py-8">
          {[
            { icon: Truck, title: "Free shipping", desc: "On orders over $50" },
            { icon: ShieldCheck, title: "Secure checkout", desc: "256-bit SSL" },
            { icon: RefreshCw, title: "30-day returns", desc: "No questions asked" },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.data && categories.data.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold tracking-tight">Shop by category</h2>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.data.map((c) => (
              <Link
                key={c.id}
                to="/products"
                search={{ categoryId: c.id } as never}
                className="group rounded-xl border bg-card p-4 text-center hover:border-primary hover:shadow-card transition"
              >
                <p className="font-medium text-sm group-hover:text-primary">{c.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Featured products</h2>
            <p className="text-sm text-muted-foreground mt-1">Hand-picked favorites from our store</p>
          </div>
          <Button asChild variant="ghost" size="sm"><Link to="/products">View all <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
        </div>
        <div className="mt-6">
          {featured.isLoading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {(featured.data ?? []).slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promo */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl bg-gradient-primary p-8 sm:p-12 text-primary-foreground shadow-elevated">
          <div className="max-w-2xl">
            <h3 className="text-2xl sm:text-3xl font-bold">Summer sale — up to 40% off</h3>
            <p className="mt-2 opacity-90">Limited time. Refresh your essentials for less.</p>
            <Button asChild className="mt-4 bg-background text-foreground hover:bg-background/90">
              <Link to="/products">Shop the sale</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Latest */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold tracking-tight">Latest arrivals</h2>
        <div className="mt-6">
          {latest.isLoading ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {(latest.data ?? []).slice(0, 8).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
