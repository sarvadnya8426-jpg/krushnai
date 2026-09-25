import { getWebsiteSettings, type WebsiteSettings } from "@/lib/siteSettings";
import pidiliteLogo from "@/assets/brands/pidilite.png";
import godrejLOGO from "@/assets/brands/godrej.png";
import fevicolLogo from "@/assets/brands/fevicol.png";
import europaLogo from "@/assets/brands/europa.jpg";
import dongLogo from "@/assets/brands/dong.png";
import decostaLogo from "@/assets/brands/decosta.jpg";
import boschLogo from "@/assets/brands/bosch.jpg";
import astralLogo from "@/assets/brands/astral.jpg"
import haffeleLogo from "@/assets/brands/haffele.png";
import yuriLogo from "@/assets/brands/yuri.webp";
const brands = [
  { name: "Pidilite", image: pidiliteLogo },
  { name: "Godrej", image: godrejLOGO },
  { name: "Fevicol", image: fevicolLogo },
  { name: "Europa", image: europaLogo },
  { name: "Dong", image: dongLogo },
  { name: "Decosta", image: decostaLogo },
  { name: "Bosch", image: boschLogo },
  { name: "Astral", image: astralLogo },
  { name: "Haffele", image: haffeleLogo },
  { name: "Yuri", image: yuriLogo },
];
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  HandCoins,
  Headset,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CategoryCard } from "@/components/site/CategoryCard";
import { useQuote } from "@/components/site/QuoteProvider";
import { site, whatsappLink } from "@/config/site";

import { solutions, testimonials, trustFeatures, showroom, brandList } from "@/data/content";
import hero from "@/assets/hero-interior.jpg";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${site.name} | Plywood, Hardware, Bathroom Accessories & Power Tools` },
      {
        name: "description",
        content:
          "Krushnai Traders is a one-stop showroom for plywood, laminates, furniture hardware, modular kitchen and wardrobe accessories, bathroom accessories, LED mirrors, door hardware and power tools.",
      },
      { property: "og:title", content: `${site.name} | Everything You Need to Build, Furnish & Finish` },
      {
        property: "og:description",
        content: "Premium plywood, hardware, bathroom accessories, LED mirrors and power tools under one roof.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const trustIcons = [BadgeCheck, Boxes, HandCoins, Headset, Sparkles];
type Category = {
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  items: string[];
};

function Home() {
  const { openQuote } = useQuote();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [websiteSettings, setWebsiteSettings] =
    useState<WebsiteSettings | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await getSupabase()
          .from("categories")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Failed to load categories:", error);
          return;
        }

        setCategories(data ?? []);
      } catch (error) {
        console.error("Category loading error:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

    useEffect(() => {
    const loadWebsiteSettings = async () => {
      const data = await getWebsiteSettings();
      setWebsiteSettings(data);
    };

    loadWebsiteSettings();
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative isolate">
        <img
          src={hero}
          alt="Premium wooden interior with warm lighting and brass accents"
          width={1600}
          height={912}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="bg-hero-overlay absolute inset-0 -z-10" aria-hidden />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-36">
          <div className="fade-up max-w-2xl text-primary-foreground">
           <p className="eyebrow">
  {websiteSettings?.subtagline ||
    "From Plywood to Hardware. From Bathrooms to Power Tools."}
</p>
            <h1 className="mt-5 font-display text-4xl leading-[1.08] text-balance sm:text-5xl lg:text-6xl">
  {websiteSettings?.tagline ||
    "Everything You Need to Build, Furnish & Finish."}
</h1>
            <p className="mt-6 max-w-xl text-base text-primary-foreground/85 sm:text-lg">
  {websiteSettings?.description ||
    "Premium plywood, furniture hardware, bathroom accessories, door hardware, LED mirrors and power tools — all under one roof."}
</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={() => openQuote()}>
                Get a Quote
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/products">Explore Products</Link>
              </Button>
            </div>
            <p className="mt-8 text-xs tracking-[0.18em] text-primary-foreground/70 uppercase">
              Quality Materials • Reliable Service • Expert Guidance
            </p>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="border-b border-border bg-secondary">
        <div className="mx-auto grid max-w-7xl gap-px overflow-hidden px-4 py-12 sm:px-6 md:grid-cols-3 lg:grid-cols-5">
          {trustFeatures.map((f, i) => {
            const Icon = trustIcons[i] ?? BadgeCheck;
            return (
              <div key={f.title} className="px-2 py-4 md:px-5">
                <Icon className="h-6 w-6 text-accent" aria-hidden />
                <h3 className="mt-3 text-base">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ABOUT */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <img
              src={showroom}
              alt="Inside the Krushnai Traders showroom"
              loading="lazy"
              width={1200}
              height={800}
              className="rounded-md object-cover shadow-lift"
            />
            <div className="absolute -right-3 -bottom-6 hidden rounded-md bg-walnut-gradient px-6 py-5 text-primary-foreground shadow-lift sm:block">
              <p className="font-display text-2xl text-accent">One Roof</p>
              <p className="text-xs tracking-[0.16em] uppercase">Complete Solutions</p>
            </div>
          </div>
          <div>
            <SectionHeading
              align="left"
              eyebrow="About Us"
              title="Your Trusted Partner for Building, Furniture & Interior Materials"
            />
            <div className="mt-6 space-y-4 text-muted-foreground">
              <p>
                {site.name} supplies quality materials, fittings and tools to homeowners, carpenters,
                furniture manufacturers, interior designers, architects, contractors, builders, modular
                kitchen manufacturers and commercial customers.
              </p>
              <p>
                From plywood and laminates to kitchen and wardrobe accessories, bathroom fittings, LED
                mirrors, door hardware and professional power tools — everything a project needs is
                available in one convenient destination, with guidance on choosing the right product for
                the job.
              </p>
            </div>
            <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {site.stats.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-3xl text-foreground">{s.value}</dt>
                  <dd className="mt-1 text-xs tracking-[0.12em] text-muted-foreground uppercase">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="bg-secondary/60 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Everything Under One Roof"
            title="Explore Our Complete Product Range"
            subtitle="Twelve categories covering materials, fittings, finishes and tools for every interior and construction project."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {categoriesLoading ? (
    <p className="col-span-full text-center text-muted-foreground">
      Loading categories...
    </p>
  ) : categories.length > 0 ? (
    categories.map((c) => (
      <CategoryCard key={c.slug} category={c} />
    ))
  ) : (
    <p className="col-span-full text-center text-muted-foreground">
      No categories available.
    </p>
  )}
</div>
          <div className="mt-10 text-center">
            <Button size="lg" variant="outline" asChild>
              <Link to="/products">View Full Catalogue</Link>
            </Button>
          </div>
        </div>
      </section>


      {/* SOLUTIONS */}
      <section className="bg-secondary/60 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Solutions"
            title="Materials Matched to Your Project"
            subtitle="However you build, we stock the full set of materials, fittings and tools it takes."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {solutions.slice(0, 8).map((s) => (
              <article
                key={s.title}
                className="group relative h-56 overflow-hidden rounded-md shadow-soft"
              >
                <img
                  src={s.image}
                  alt={s.title}
                  loading="lazy"
                  width={900}
                  height={700}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="bg-hero-overlay absolute inset-0 flex flex-col justify-end p-5 text-primary-foreground">
                  <h3 className="text-lg">{s.title}</h3>
                  <p className="mt-1 text-xs text-primary-foreground/80">{s.description}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link to="/solutions">
                See All Solutions <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

     {/* BRANDS */}
<section className="bg-secondary/40 py-16 lg:py-20">
  <div className="mx-auto max-w-7xl px-4 sm:px-6">
    
    <SectionHeading
      eyebrow="Our Brands"
      title="Brands We Deal In"
      subtitle="We offer quality products from trusted and leading brands."
    />

    <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {brands.map((brand) => (
        <div
          key={brand.name}
          className="flex h-28 items-center justify-center rounded-lg border border-border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <img
      src={brand.image}
      alt={brand.name}
      className={`h-16 w-auto object-contain ${
  ["Decosta", "Bosch", "Dong", "Europa", "Astral"].includes(brand.name)
    ? "h-24"
    : ""
}`}
/>
        </div>
      ))}
    </div>

  </div>
</section>

      {/* TESTIMONIALS */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Customer Reviews" title="What Our Customers Say" />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <figure key={i} className="rounded-md border border-border bg-card p-7 shadow-soft">
                <span className="font-display text-5xl leading-none text-accent" aria-hidden>
                  &ldquo;
                </span>
                <blockquote className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 text-sm font-semibold">
                  {t.name}
                  <span className="block text-xs font-normal text-muted-foreground">{t.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          
        </div>
      </section>

      {/* CTA */}
      <section className="bg-walnut-gradient py-20 text-primary-foreground lg:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl text-balance sm:text-4xl">Planning Your Next Project?</h2>
          <p className="mt-4 text-primary-foreground/80">
            Tell us what you need and our team will help you find the right materials and products.
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
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                WhatsApp Us
              </a>
            </Button>
          </div>
        </div>
      </section>
      
       {/* MAP */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Visit Us"
            title="Find Us on the Map"
            subtitle="Visit our showroom and explore our complete range of products."
          />

          <div className="mt-10 overflow-hidden rounded-md border border-border shadow-soft">
            <iframe
              src= "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3127.5180685025857!2d75.41141907427911!3d20.085315819514655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdbbf0051053899%3A0x6c192573a4a1b322!2sKrushnai%20Traders!5e1!3m2!1sen!2sin!4v1789549565739!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              title="Krushnai Traders Location"
            />
          </div>
        </div>
      </section>

    </>
  );
  
}
