import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/SectionHeading";
import { useQuote } from "@/components/site/QuoteProvider";
import { site } from "@/config/site";
import { getSupabase } from "@/lib/supabase";

type Brand = {
  id: string;
  name: string;
  logo: string | null;
  sort_order: number;
  is_active: boolean;
};

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      {
        title: `Brands | Plywood, Hardware & Tool Brands — ${site.name}`,
      },
      {
        name: "description",
        content:
          "Brands stocked at Krushnai Traders for plywood, laminates, furniture hardware, bathroom accessories and power tools. Ask our team about a specific brand.",
      },
      {
        property: "og:title",
        content: `Brands You Can Trust — ${site.name}`,
      },
      {
        property: "og:description",
        content:
          "Ask our team which brands are currently in stock.",
      },
      {
        property: "og:url",
        content: "/brands",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],
    links: [{ rel: "canonical", href: "/brands" }],
  }),

  component: BrandsPage,
});

function BrandsPage() {
  const { openQuote } = useQuote();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBrands() {
      setLoading(true);
      setError("");

      const supabase = getSupabase();

      const { data, error } = await supabase
        .from("brands")
        .select("id, name, logo, sort_order, is_active")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Failed to load brands:", error);
        setError("Unable to load brands right now.");
        setLoading(false);
        return;
      }

      setBrands((data ?? []) as Brand[]);
      setLoading(false);
    }

    loadBrands();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
      <SectionHeading
        eyebrow="Our Brands"
        title="Brands You Can Trust"
        subtitle=""
      />

      {loading && (
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-md border border-border bg-muted/40"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mt-12 rounded-md border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!loading && !error && brands.length === 0 && (
        <div className="mt-12 rounded-md border border-border bg-secondary/40 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No brands are currently available.
          </p>
        </div>
      )}

      {!loading && !error && brands.length > 0 && (
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="flex h-32 items-center justify-center rounded-md border border-border bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-md"
            >
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-h-20 max-w-full object-contain"
                  loading="lazy"
                />
              ) : (
                <span className="text-center text-sm font-medium text-muted-foreground">
                  {brand.name}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 rounded-md border border-border bg-secondary/60 p-8 text-center">
        <h2 className="text-xl">
          Looking for a specific brand?
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Tell us the brand and product you need and our team will
          confirm availability, sizes and pricing.
        </p>

        <Button
          className="mt-6"
          size="lg"
          onClick={() => openQuote()}
        >
          Ask About a Brand
        </Button>
      </div>
    </section>
  );
}