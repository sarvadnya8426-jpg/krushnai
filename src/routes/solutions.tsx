import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/SectionHeading";
import { useQuote } from "@/components/site/QuoteProvider";
import { solutions } from "@/data/content";
import { site, whatsappLink } from "@/config/site";
import {
  getWebsiteSettings,
  type WebsiteSettings,
} from "@/lib/siteSettings";

export const Route = createFileRoute("/solutions")({
  head: () => ({
    meta: [
      { title: `Solutions | Kitchens, Wardrobes, Bathrooms & Doors — ${site.name}` },
      {
        name: "description",
        content:
          "Complete material solutions for modular kitchens, wardrobes, home and office furniture, bathroom upgrades, doors and professional workshops.",
      },
      { property: "og:title", content: `Project Solutions — ${site.name}` },
      {
        property: "og:description",
        content:
          "Everything needed for kitchens, wardrobes, bathrooms, doors and workshops in one place.",
      },
      { property: "og:url", content: "/solutions" },
    ],
    links: [{ rel: "canonical", href: "/solutions" }],
  }),
  component: SolutionsPage,
});

function SolutionsPage() {
  const { openQuote } = useQuote();

  const [websiteSettings, setWebsiteSettings] =
    useState<WebsiteSettings | null>(null);

  useEffect(() => {
    const loadWebsiteSettings = async () => {
      const data = await getWebsiteSettings();
      setWebsiteSettings(data);
    };

    loadWebsiteSettings();
  }, []);

  const dynamicWhatsapp = `https://wa.me/${(
    websiteSettings?.whatsapp || site.whatsapp
  ).replace(/\D/g, "")}`;

  return (
    <>
      <section className="bg-walnut-deep py-16 text-primary-foreground lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="eyebrow">Solutions</p>

          <h1 className="mt-3 font-display text-4xl sm:text-5xl">
            Materials Matched to Your Project
          </h1>

          <p className="mt-4 max-w-2xl text-primary-foreground/75">
            Tell us what you are building and we will put together the boards,
            fittings, accessories and tools it needs.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((s) => (
            <article
              key={s.title}
              className="group overflow-hidden rounded-md border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={s.image}
                  alt={s.title}
                  loading="lazy"
                  width={900}
                  height={700}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-6">
                <h2 className="text-lg">{s.title}</h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  {s.description}
                </p>

                <Button
                  variant="ghost"
                  className="mt-4 px-0"
                  onClick={() => openQuote(s.title)}
                >
                  Discuss this project →
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-walnut-gradient py-16 text-primary-foreground">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <SectionHeading
            eyebrow="Let's Plan It"
            title="Share your requirement list"
          />

          <p className="mt-4 text-primary-foreground/80">
            Send a room-wise list or a site drawing and we will suggest
            suitable materials and fittings.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={() => openQuote()}>
              Get a Quote
            </Button>

            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <a
                href={dynamicWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp Us
              </a>
            </Button>

            <Button
              size="lg"
              variant="ghost"
              asChild
              className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}