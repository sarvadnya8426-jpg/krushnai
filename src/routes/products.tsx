import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/ProductCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { site } from "@/config/site";
import { getSupabase } from "@/lib/supabase";

type Search = {
  category?: string | undefined;
};

export const Route = createFileRoute("/products")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    category:
      typeof search["category"] === "string"
        ? search["category"]
        : undefined,
  }),

  head: () => ({
    meta: [
      {
        title: `Products | Plywood, Hardware, Bathroom & Power Tools — ${site.name}`,
      },
      {
        name: "description",
        content:
          "Browse plywood, laminates, furniture hardware, kitchen and wardrobe accessories, bathroom accessories, LED mirrors, door hardware, power tools and general hardware. Request a quote or enquire on WhatsApp.",
      },
      {
        property: "og:title",
        content: `Product Catalogue — ${site.name}`,
      },
      {
        property: "og:description",
        content:
          "Search and filter our complete range of interior materials, fittings and tools.",
      },
      {
        property: "og:url",
        content: "/products",
      },
    ],
    links: [{ rel: "canonical", href: "/products" }],
  }),

  component: ProductsPage,
});

const sortOptions = ["Featured", "New Arrivals", "Popular"] as const;

type Category = {
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  items: string[];
};

type Product = {
  id: string;
  name: string;
  category: string | null;
  subcategory: string | null;
  brand: string | null;
  type: string | null;
  application: string | null;
  description: string | null;
  specs: string[] | null;
  tags: string[] | null;
  image: string | null;
};

function ProductsPage() {
  const { category: initialCategory } = Route.useSearch();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory ?? "");
  const [subcategory, setSubcategory] = useState("");
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("");
  const [application, setApplication] = useState("");
  const [sort, setSort] =
    useState<(typeof sortOptions)[number]>("Featured");
  const [showFilters, setShowFilters] = useState(false);

  // Load products from Supabase
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const { data, error } = await getSupabase()
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Failed to load products:", error);
          setLoadError(
            "Unable to load products. Please try again later.",
          );
          return;
        }

        setProducts((data ?? []) as Product[]);
      } catch (error) {
        console.error("Failed to load products:", error);
        setLoadError(
          "Unable to load products. Please try again later.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Load categories from Supabase
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);

      try {
        const { data, error } = await getSupabase()
          .from("categories")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Failed to load categories:", error);
          return;
        }

        setCategories((data ?? []) as Category[]);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Keep category filter synchronized with URL
  useEffect(() => {
    setCategory(initialCategory ?? "");
    setSubcategory("");
  }, [initialCategory]);

  // Generate subcategories from Supabase products
  const subcategoryOptions = useMemo(
    () =>
      [
        ...new Set(
          products
            .filter(
              (p) => !category || p.category === category,
            )
            .map((p) => p.subcategory)
            .filter(Boolean) as string[],
        ),
      ].sort(),
    [products, category],
  );

  // Generate brands from Supabase products
  const brandOptions = useMemo(
    () =>
      [
        ...new Set(
          products
            .map((p) => p.brand)
            .filter(Boolean) as string[],
        ),
      ].sort(),
    [products],
  );

  // Generate product types from Supabase products
  const productTypeOptions = useMemo(
    () =>
      [
        ...new Set(
          products
            .map((p) => p.type)
            .filter(Boolean) as string[],
        ),
      ].sort(),
    [products],
  );

  // Generate applications from Supabase products
  const applicationOptions = useMemo(
    () =>
      [
        ...new Set(
          products
            .map((p) => p.application)
            .filter(Boolean) as string[],
        ),
      ].sort(),
    [products],
  );

  // Filter and sort products
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = products.filter((p) => {
      if (category && p.category !== category) {
        return false;
      }

      if (subcategory && p.subcategory !== subcategory) {
        return false;
      }

      if (brand && p.brand !== brand) {
        return false;
      }

      if (type && p.type !== type) {
        return false;
      }

      if (application && p.application !== application) {
        return false;
      }

      if (!q) {
        return true;
      }

      return [
        p.name,
        p.subcategory,
        p.description,
        p.type,
        p.application,
        p.brand,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });

    const rank =
      (tag: "featured" | "new" | "popular") =>
      (p: Product) =>
        p.tags?.includes(tag) ? 0 : 1;

    const key =
      sort === "New Arrivals"
        ? "new"
        : sort === "Popular"
          ? "popular"
          : "featured";

    return [...filtered].sort(
      (a, b) => rank(key)(a) - rank(key)(b),
    );
  }, [
    products,
    query,
    category,
    subcategory,
    brand,
    type,
    application,
    sort,
  ]);

  const reset = () => {
    setQuery("");
    setCategory("");
    setSubcategory("");
    setBrand("");
    setType("");
    setApplication("");
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-walnut-deep py-16 text-primary-foreground lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="eyebrow">Product Catalogue</p>

          <h1 className="mt-3 font-display text-4xl sm:text-5xl">
            Explore Our Products
          </h1>

          <p className="mt-4 max-w-2xl text-primary-foreground/75">
            Materials, fittings, accessories and tools for every
            project. Prices are shared on request — send an enquiry
            and our team will respond with pricing and availability.
          </p>

          <div className="relative mt-8 max-w-xl">
            <Search
              className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />

            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="h-13 bg-background pl-12 text-foreground"
            />
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button
            variant="outline"
            className="lg:hidden"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Sort:
            </span>

            {sortOptions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSort(s)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  sort === s
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-card hover:border-accent"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            {loading ? "Loading..." : `${results.length} products`}
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Filters */}
          <aside
            className={`${
              showFilters ? "block" : "hidden"
            } lg:block`}
          >
            <div className="space-y-5 rounded-md border border-border bg-card p-5">
              <FilterSelect
                label="Category"
                value={category}
                onChange={(v) => {
                  setCategory(v);
                  setSubcategory("");
                }}
                options={categories.map((c) => ({
                  value: c.slug,
                  label: c.name,
                }))}
                emptyNote={
                  categoriesLoading
                    ? "Loading categories..."
                    : "No categories available."
                }
              />

              <FilterSelect
                label="Subcategory"
                value={subcategory}
                onChange={setSubcategory}
                options={subcategoryOptions.map((s) => ({
                  value: s,
                  label: s,
                }))}
              />

              <FilterSelect
                label="Brand"
                value={brand}
                onChange={setBrand}
                options={brandOptions.map((b) => ({
                  value: b,
                  label: b,
                }))}
                emptyNote="Brand list is added as stock details are confirmed."
              />

              <FilterSelect
                label="Product Type"
                value={type}
                onChange={setType}
                options={productTypeOptions.map((t) => ({
                  value: t,
                  label: t,
                }))}
              />

              <FilterSelect
                label="Application"
                value={application}
                onChange={setApplication}
                options={applicationOptions.map((a) => ({
                  value: a,
                  label: a,
                }))}
              />

              <Button
                variant="ghost"
                className="w-full"
                onClick={reset}
              >
                Clear all filters
              </Button>
            </div>
          </aside>

          {/* Product grid */}
          <div>
            {loading ? (
              <div className="rounded-md border border-border p-16 text-center">
                <p className="text-muted-foreground">
                  Loading products...
                </p>
              </div>
            ) : loadError ? (
              <div className="rounded-md border border-dashed border-border p-16 text-center">
                <h2 className="text-lg">
                  Unable to load products
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  {loadError}
                </p>
              </div>
            ) : results.length ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-border p-16 text-center">
                <h2 className="text-lg">
                  No products match your search
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Try a different keyword or clear the filters —
                  we stock much more than is listed online.
                </p>

                <Button
                  className="mt-6"
                  onClick={reset}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-secondary/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Can't find it here?"
            title="We stock far more than we list"
            subtitle="Send us the item, size or brand you need and our team will confirm availability and pricing."
          />
        </div>
      </section>
    </>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  emptyNote,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
  }>;
  emptyNote?: string;
}) {
  const id = `filter-${label
    .toLowerCase()
    .replace(/\s/g, "-")}`;

  return (
    <div>
      <label
        htmlFor={id}
        className="text-xs font-semibold tracking-[0.14em] uppercase"
      >
        {label}
      </label>

      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={options.length === 0}
        className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-60"
      >
        <option value="">
          All {label.toLowerCase()}
        </option>

        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {options.length === 0 && emptyNote ? (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {emptyNote}
        </p>
      ) : null}
    </div>
  );
}