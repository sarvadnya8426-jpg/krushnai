import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { site } from "@/config/site";
import { getSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      {
        title: `Gallery | Showroom, Kitchens, Bathrooms & Tools — ${site.name}`,
      },
      {
        name: "description",
        content:
          "Photo gallery of the Krushnai Traders showroom, plywood stock, furniture hardware, modular kitchens, wardrobes, bathroom accessories, LED mirrors, door hardware and power tools.",
      },
      {
        property: "og:title",
        content: `Gallery — ${site.name}`,
      },
      {
        property: "og:description",
        content:
          "A look inside our showroom and product range.",
      },
      {
        property: "og:url",
        content: "/gallery",
      },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: GalleryPage,
});

type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  filter: string;
};

const galleryFilters = [
  "All",
  "Showroom",
  "Furniture",
  "Kitchens",
  "Bathrooms",
  "Doors",
  "Tools",
];

function GalleryPage() {
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGallery = async () => {
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from("gallery")
        .select("id, src, alt, filter")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Failed to load gallery:", error);
        setLoading(false);
        return;
      }

      setItems(data ?? []);
      setLoading(false);
    };

    loadGallery();
  }, []);

  const filteredItems =
    filter === "All"
      ? items
      : items.filter((item) => item.filter === filter);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
      <SectionHeading
        eyebrow="Gallery"
        title="Inside Our Showroom"
        subtitle="Product displays, materials and completed interior work."
      />

      <div className="no-scrollbar mt-10 flex justify-start gap-2 overflow-x-auto pb-2 sm:justify-center">
        {galleryFilters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setFilter(f);
              setLightbox(null);
            }}
            className={`shrink-0 rounded-full border px-5 py-2 text-sm transition-colors ${
              filter === f
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-card hover:border-accent"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-16 text-center text-muted-foreground">
          Loading gallery...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="mt-16 text-center text-muted-foreground">
          No gallery images available in this category.
        </div>
      ) : (
        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {filteredItems.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLightbox(i)}
              className="group block w-full overflow-hidden rounded-md break-inside-avoid shadow-soft"
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                width={900}
                height={700}
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}

      {lightbox !== null && filteredItems[lightbox] ? (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-walnut-deep/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={filteredItems[lightbox].alt}
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            aria-label="Close image"
            className="absolute top-5 right-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary-foreground/30 text-primary-foreground"
            onClick={() => setLightbox(null)}
          >
            <X className="h-5 w-5" />
          </button>

          <figure
            className="max-h-[85vh] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filteredItems[lightbox].src}
              alt={filteredItems[lightbox].alt}
              className="max-h-[78vh] w-full rounded-md object-contain"
            />

            <figcaption className="mt-3 text-center text-sm text-primary-foreground/80">
              {filteredItems[lightbox].alt}
            </figcaption>
          </figure>
        </div>
      ) : null}
    </section>
  );
}