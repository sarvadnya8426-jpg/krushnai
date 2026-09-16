import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/SectionHeading";
import { useQuote } from "@/components/site/QuoteProvider";
import { site } from "@/config/site";
import { customerTypes, trustFeatures, showroom } from "@/data/content";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About ${site.name} | Plywood & Hardware Showroom` },
      {
        name: "description",
        content:
          "Krushnai Traders serves homeowners, carpenters, interior designers, contractors and builders with plywood, hardware, bathroom accessories, door fittings and power tools under one roof.",
      },
      { property: "og:title", content: `About ${site.name}` },
      {
        property: "og:description",
        content: "A one-stop destination for furniture materials, hardware, bathroom accessories and tools.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { openQuote } = useQuote();
  return (
    <>
      <section className="bg-walnut-deep py-16 text-primary-foreground lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="eyebrow">About Us</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight text-balance sm:text-5xl">
            Your Trusted Partner for Building, Furniture &amp; Interior Materials
          </h1>
          <p className="mt-5 max-w-2xl text-primary-foreground/75">{site.subTagline}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <img
            src={showroom}
            alt="Krushnai Traders showroom with plywood and board displays"
            loading="lazy"
            width={1200}
            height={800}
            className="rounded-md object-cover shadow-lift"
          />
          <div className="space-y-4 text-muted-foreground">
            <p>
              {site.name} is a materials and hardware showroom built around one simple idea: a project
              should not need five different shops. Plywood, laminates, furniture fittings, kitchen and
              wardrobe accessories, bathroom accessories, LED mirrors, door hardware, adhesives and power
              tools are all kept together under one roof.
            </p>
            <p>
              Our team works with the products every day and can help you compare grades, finishes and
              fittings so that the material suits the budget, the usage and the space — whether it is a
              single wardrobe or a full site requirement.
            </p>
            <p>
              Retail and bulk customers are both welcome, and requirements can be quoted quickly over phone,
              WhatsApp or a visit to the showroom.
            </p>
            <div className="pt-2">
              <h2 className="text-xl text-foreground">We serve</h2>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {customerTypes.map((c) => (
                  <li key={c} className="flex items-center gap-2.5 text-sm text-foreground">
                    <Check className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-3 pt-4">
              <Button size="lg" onClick={() => openQuote()}>
                Get a Quote
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/products">Explore Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <dl className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
            {site.stats.map((s) => (
              <div key={s.label}>
                <dt className="font-display text-4xl text-foreground">{s.value}</dt>
                <dd className="mt-2 text-xs tracking-[0.14em] text-muted-foreground uppercase">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Figures shown are indicative placeholders and can be updated by the business owner.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <SectionHeading eyebrow="Why Customers Choose Us" title="Built on Service, Not Just Stock" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {trustFeatures.map((f) => (
            <div key={f.title} className="rounded-md border border-border bg-card p-6 shadow-soft">
              <h3 className="text-base">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
