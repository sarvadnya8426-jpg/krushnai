import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/config/site";
import { categories } from "@/data/categories";
import type { Product } from "@/data/products";
import { useQuote } from "./QuoteProvider";

export function ProductCard({ product }: { product: Product }) {
  const { openQuote } = useQuote();
  const [zoomOpen, setZoomOpen] = useState(false);
  const categoryName = categories.find((c) => c.slug === product.category)?.name ?? "";

  return (
    <article className="group flex flex-col overflow-hidden rounded-md border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div
  className="relative aspect-[4/3] overflow-hidden cursor-zoom-in"
  onClick={() => setZoomOpen(true)}
>
  <img
    src={product.image}
    alt={product.name}
    loading="lazy"
    width={900}
    height={700}
    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
  />
        {product.tags?.includes("new") ? (
          <span className="absolute top-3 left-3 rounded-sm bg-accent px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.14em] text-accent-foreground uppercase">
            New
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[0.68rem] tracking-[0.16em] text-muted-foreground uppercase">{categoryName}</p>
        <h3 className="mt-1.5 text-base leading-snug">{product.name}</h3>
        <p className="mt-2  text-sm text-muted-foreground">{product.description}</p>
        {product.specs?.length ? (
          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            {product.specs.slice(0, 2).map((s) => (
              <li key={s} className="flex gap-2">
                <span className="text-accent">•</span>
                {s}
              </li>
            ))}
          </ul>
        ) : null}
        {product.brand ? <p className="mt-3 text-xs font-medium">Brand: {product.brand}</p> : null}
        <p className="mt-4 text-sm font-semibold text-foreground">Request Price</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Button size="sm" className="flex-1" onClick={() => openQuote(product.name)}>
            Get Quote
          </Button>
          <Button size="sm" variant="outline" className="flex-1" asChild>
            <a href={whatsappLink(product.name)} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </Button>
        </div>
      </div>
      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
  <DialogContent className="max-w-3xl bg-transparent border-none shadow-none p-0">
    <img
      src={product.image}
      alt={product.name}
      className="w-full h-auto max-h-[85vh] object-contain rounded-md"
    />
  </DialogContent>
</Dialog>
    </article>
  );
}
