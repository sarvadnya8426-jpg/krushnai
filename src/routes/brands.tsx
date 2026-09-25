import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/SectionHeading";
import { useQuote } from "@/components/site/QuoteProvider";
import { site } from "@/config/site";

import pidiliteLogo from "@/assets/brands/pidilite.png";
import godrejLogo from "@/assets/brands/godrej.png";
import fevicolLogo from "@/assets/brands/fevicol.png";
import europaLogo from "@/assets/brands/europa.jpg";
import dongLogo from "@/assets/brands/dong.png";
import decostaLogo from "@/assets/brands/decosta.jpg";
import boschLogo from "@/assets/brands/bosch.jpg";
import astralLogo from "@/assets/brands/astral.jpg";
import hafeleLogo from "@/assets/brands/haffele.png";
import yuriLogo from "@/assets/brands/yuri.webp";

const brands = [
  { name: "Pidilite", image: pidiliteLogo },
  { name: "Godrej", image: godrejLogo },
  { name: "Fevicol", image: fevicolLogo },
  { name: "Europa", image: europaLogo },
  { name: "Dong", image: dongLogo },
  { name: "Decosta", image: decostaLogo },
  { name: "Bosch", image: boschLogo },
  { name: "Astral", image: astralLogo },
  { name: "Hafele", image: hafeleLogo },
  { name: "Yuri", image: yuriLogo },
];

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
    ],
    links: [{ rel: "canonical", href: "/brands" }],
  }),

  component: BrandsPage,
});

function BrandsPage() {
  const { openQuote } = useQuote();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
      <SectionHeading
        eyebrow="Our Brands"
        title="Brands You Can Trust"
        subtitle=""
      />

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {brands.map((brand) => (
          <div
            key={brand.name}
            className="flex h-32 items-center justify-center rounded-md border border-border bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-md"
          >
            <img
              src={brand.image}
              alt={brand.name}
              className="max-h-20 max-w-full object-contain"
            />
          </div>
        ))}
      </div>

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